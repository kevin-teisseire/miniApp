from flask import Flask
from flask_cors import CORS
from flask import request
from flask import jsonify
from flask import send_from_directory
from dotenv import load_dotenv
import psycop
import time
import sqlite3
import os
import psycopg2

load_dotenv()

app = Flask(__name__)
CORS(app)

# ====== Functions ======

# ------ Init Database ------ 
def initDB():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY AUTOINCREMENT,
                   first_name TEXT,
                   last_name TEXT,
                   email TEXT,
                   password TEXT,
                   profile_image TEXT,
                   description TEXT
            )
        """) 
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS forum_posts (
                   id SERIAL PRIMARY KEY AUTOINCREMENT,
                   user_id INTEGER,
                   title TEXT,
                   content TEXT,
                   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                   FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()

def fetch_all_posts(cursor, limit, offset):
    cursor.execute("""SELECT forum_posts.*, users.first_name, users.profil_image
                   FROM forum_posts
                   JOIN users
                   ON forum_posts.user_id = users.id
                   ORDER BY forum_posts.created_at DESC
                   LIMIT ? OFFSET ?
                   """, (limit, offset))
    rows = cursor.fetchall()
    return [{
        "id": p["id"],
        "title": p["title"],
        "description" : p["content"],
        "date": p["created_at"],
        "user": p["user_id"],
        "image_url" : f"http://localhost:8000/uploads/{p["profil_image"]}",
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

        conn = psycopg2.connect("database.db")
        cursor = conn.cursor()
        # Check if user exists
        cursor.execute(
            "SELECT 1 FROM users WHERE email = ?", (email,)
        )
        existingUser = cursor.fetchone()
        if not existingUser:
            cursor.execute(
                "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)", (firstname, lastname, email, password)
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
    conn = psycopg2.connect("database.db")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Get user
    cursor.execute(
        "SELECT * FROM users WHERE email = ? AND password = ?", (email, password)
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
            "img_url": f"http://localhost:8000/uploads/{user["profil_image"]}"
        }), 200
    else:
        return jsonify({
            "status": "error", 
            "message": "user doesn't exist",
        }), 401
    
# ------ Upload route ------ 
@app.route("/upload", methods=["POST"])

def upload():
    # Create upload folder in project directory
    base_folder = os.path.dirname(__file__)
    upload_folder = os.path.join(base_folder, "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    # Image path and save
    new_image = request.files.get("image")
    # Get current email to idetify user in DB
    email = request.form.get("email")
    # Other infos
    new_description = request.form.get("new_description")
    new_name = request.form.get("new_name")
    new_surname = request.form.get("new_surname")
    new_email = request.form.get("new_email")
    # Connect to DB
    conn = psycopg2.connect("database.db")
    # Format DB response 
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Get user ID
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    user_id = user["id"]
    # Check for new data
    if new_image:
        # Secure file name
        ext = os.path.splitext(new_image.filename)[1]
        filename = f"user_{user_id}_{int(time.time())}{ext}"
        # Create path
        filepath = os.path.join(upload_folder, filename)
        # Save image
        new_image.save(filepath)
        img_url = filename
        cursor.execute("UPDATE users SET profil_image = ? WHERE email = ?", (img_url, email))
    if new_description:
        cursor.execute("UPDATE users SET description = ? WHERE email = ?", (new_description, email))
    if new_name:
        cursor.execute("UPDATE users SET first_name = ? WHERE email = ?", (new_name, email))
    if new_surname:
        cursor.execute("UPDATE users SET last_name = ? WHERE email = ?", (new_surname, email))
    if new_email:
        cursor.execute("UPDATE users SET email = ? WHERE email = ?", (new_email, email))
        email = new_email
    conn.commit()
    # Get user data after modification
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    updatedUser = cursor.fetchone()
    conn.close()
    # Format response
    return jsonify({
        "status": "success",
        "message": "infos uploaded",
        "first_name": updatedUser["first_name"],
        "last_name": updatedUser["last_name"],
        "email": updatedUser["email"],
        "description": updatedUser["description"],
        "image_url": f"http://localhost:8000/uploads/{updatedUser["profil_image"]}"
    }), 200

# ------ Path to images ------
@app.route("/uploads/<filename>")

def uploaded_file(filename):
    return send_from_directory("uploads", filename)


# ------ Forum section ------

# Load forum

@app.route("/get-forum", methods=["GET"])

def getMessages():
    conn = psycopg2.connect("database.db")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    page = request.args.get("page", 1, type=int)
    limit = 4
    offset = (page - 1) * limit
    posts = fetch_all_posts(cursor, limit, offset)
    cursor.execute("SELECT COUNT(*) as total_posts FROM forum_posts")
    result = cursor.fetchone()
    total_posts = result["total_posts"]
    total_pages = total_posts/4
    conn.close()
    return jsonify({
        "status": "success",
        "message": "post list loaded",
        "page": page,
        "total_pages": total_pages,
        "total_posts": total_posts, 
        "posts": posts
    })

@app.route("/post", methods=["POST"])

def post():
    conn = psycopg2.connect("database.db")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    req = request.get_json()
    title = req.get("title")
    description = req.get("description")
    user_id = req.get("userId")
    cursor.execute("INSERT INTO forum_posts (title, content, user_id) VALUES (?, ?, ?)", (title, description, user_id))
    conn.commit()
    new_post_id = cursor.lastrowid
    conn.close()
    if new_post_id:
        return jsonify ({
            "status": "success",
            "message": "post created",
        })
    return jsonify({
        "status": "error",
        "message": "post not created",
    })

# ======  MAIN ======
if __name__ == "__main__":
    initDB()
    app.run(debug=True, port=8000)