from flask import Flask
from flask_cors import CORS
from flask import request
from flask import jsonify
from flask import send_from_directory
from dotenv import load_dotenv
import time
import sqlite3
import os
import psycopg2
import psycopg2.extras
import cloudinary
import cloudinary.uploader
import traceback

load_dotenv()

cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

app = Flask(__name__)
CORS(app)

# ====== Functions ======

# ------ Init Database ------ 
def initDB():
    conn = psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode="require",
        connect_timeout = 10
        )
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
                   first_name TEXT,
                   last_name TEXT,
                   email TEXT UNIQUE,
                   password TEXT,
                   image_url TEXT,
                   description TEXT
            )
        """) 
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS forum_posts (
                   id SERIAL PRIMARY KEY,
                   title TEXT,
                   content TEXT,
                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                   user_id INTEGER REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()

def fetch_all_posts(cursor):
    cursor.execute("""
                   SELECT forum_posts.id AS post_id, 
                   forum_posts.title,
                   forum_posts.content,
                   forum_posts.created_at,
                   forum_posts.user_id,
                   users.first_name, 
                   users.image_url AS user_image_url
                   FROM forum_posts
                   JOIN users ON forum_posts.user_id = users.id
                   ORDER BY forum_posts.created_at DESC
                   """)
    rows = cursor.fetchall()
    print(f"fetchAllposts : {[p for p in rows]}")
    return [{
        "id": p["post_id"],
        "title": p["title"],
        "description" : p["content"],
        "date": p["created_at"],
        "user": p["user_id"],
        "image_url" : p["user_image_url"],
        "first_name": p["first_name"]
    } for p in rows]


# ====== Routes ======

# ------ Default route ------
@app.route("/")

def home():
    return("backend is running")


# ------ Signup route ------ 
@app.route("/signup", methods=["POST"])

def signup():
    conn = None
    try:
        data = request.get_json()
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        email = data.get("email")
        password = data.get("password")

        conn = psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode="require", 
        connect_timeout = 10
        )
        cursor = conn.cursor()
        # Check if user exists
        cursor.execute(
            "SELECT 1 FROM users WHERE email = %s", (email,)
        )
        existingUser = cursor.fetchone()
        if not existingUser:
            cursor.execute(
                "INSERT INTO users (first_name, last_name, email, password) VALUES (%s, %s, %s, %s)", (firstname, lastname, email, password)
            )
            user_id = cursor.lastrowid
            conn.commit()
            return jsonify({
                "status": "success",
                "message": "user created",
                "user_id": user_id
            }), 201
        else:
            return jsonify({
                "status": "error",
                "message": "user exists"
            }), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": "server error"
        }), 500
    finally:
        if conn:
            conn.close()

# ------ Login route ------ 
@app.route("/login", methods=["POST"])

def login():
    # Get data from loggin inputs
    req = request.get_json()
    email = req.get("email")
    password = req.get("password")
    # Connect to DB
    conn = psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode="require",
        connect_timeout = 10
        )
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Get user
    cursor.execute(
        "SELECT * FROM users WHERE email = %s AND password = %s", (email, password)
    )
    user = cursor.fetchone()
    conn.close()
    # Format response
    if user:
        return jsonify({
            "status": "success",
            "message": "logged in",
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "description": user["description"],
            "user_id": user["id"],
            "img_url": user["image_url"]
        }), 200
    else:
        return jsonify({
            "status": "error", 
            "message": "user doesn't exist",
        }), 401
    
# ------ Upload route ------ 
@app.route("/upload", methods=["POST"])

def upload():
    # Get new image
    new_image = request.files.get("image")
    # Get user id
    user_id = request.form.get("user_id")
    # Other infos
    new_description = request.form.get("new_description")
    new_name = request.form.get("new_name")
    new_surname = request.form.get("new_surname")
    new_email = request.form.get("new_email")
    # Connect to DB
    conn = psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode="require",
        connect_timeout = 10
        )
    # Format DB response 
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    img_url = None
    # Check for new data
    if new_image:
        # Upload image
        result = cloudinary.uploader.upload(new_image)
        img_url = result["secure_url"]
        cursor.execute("UPDATE users SET image_url = %s WHERE id = %s", (img_url, user_id))
    if new_description:
        cursor.execute("UPDATE users SET description = %s WHERE id = %s", (new_description, user_id))
    if new_name:
        cursor.execute("UPDATE users SET first_name = %s WHERE id = %s", (new_name, user_id))
    if new_surname:
        cursor.execute("UPDATE users SET last_name = %s WHERE id = %s", (new_surname, user_id))
    if new_email:
        cursor.execute("UPDATE users SET email = %s WHERE id = %s", (new_email, user_id))
        email = new_email
    conn.commit()
    # Get user data after modification
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    updatedUser = cursor.fetchone()
    conn.close()
    # Format response
    return jsonify({
        "status": "success",
        "message": "infos uploaded",
        "user_id": updatedUser["id"],
        "first_name": updatedUser["first_name"],
        "last_name": updatedUser["last_name"],
        "email": updatedUser["email"],
        "description": updatedUser["description"],
        "img_url": img_url
    }), 200

# ------ Path to images ------
@app.route("/uploads/<filename>")

def uploaded_file(filename):
    return send_from_directory("uploads", filename)


# ------ Forum section ------

# Load forum

@app.route("/get-forum", methods=["GET"])

def getMessages():
    conn = None
    try:
        conn = psycopg2.connect(
            os.getenv("DATABASE_URL"),
            sslmode="require",
            connect_timeout = 10
            )
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # page = request.args.get("page", 1, type=int)
        # limit = 4
        # offset = (page - 1) * limit
        posts = fetch_all_posts(cursor)
        print("posts :", posts)
        cursor.execute("SELECT COUNT(*) as total_posts FROM forum_posts")
        result = cursor.fetchone()
        total_posts = result["total_posts"]
        total_pages = total_posts/4
        return jsonify({
            "status": "success",
            "message": "post list loaded",
            "total_pages": total_pages,
            "total_posts": total_posts, 
            "posts": posts
        })
    except Exception:
        print(traceback.format_exc())
        return jsonify({"status": "error"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/post", methods=["POST"])

def post():
    conn = psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode="require",
        connect_timeout = 10
        )
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    req = request.get_json()
    title = req.get("title")
    description = req.get("description")
    user_id = req.get("user_id")

    cursor.execute("""
                   INSERT INTO forum_posts (title, content, user_id)
                   VALUES (%s, %s, %s)
    """, (title, description, user_id))

    conn.commit()
    conn.close()

    return jsonify ({
        "status": "success",
        "message": "post created",
    })


# ======  MAIN ======
if __name__ == "__main__":
    initDB()
    app.run(debug=True, port=8000)