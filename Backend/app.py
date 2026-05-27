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
import bcrypt

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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_messages (
            id SERIAL PRIMARY KEY,
            message TEXT,
            created_at TIMESTAMP DEFAULT current_timestamp,
            post_id INTEGER REFERENCES forum_posts,
            user_id INTEGER references users
            )
    """)
    conn.commit()
    conn.close()

def fetch_all_posts(cursor, user_id):
    "Get existing post list, post creators, check if user liked or answered"
    cursor.execute("""
        SELECT forum_posts.id AS post_id, 
        forum_posts.title,
        forum_posts.content,
        forum_posts.created_at,
        forum_posts.user_id,
        users.first_name, 
        users.last_name,
        users.image_url AS user_image_url,
        users.description,
        users.email,
                   
        COUNT(DISTINCT post_likes.id) AS likes,
        COUNT(DISTINCT user_messages.id) AS answers,
                   
        EXISTS(
            SELECT 1 FROM post_likes
            WHERE post_likes.post_id = forum_posts.id AND post_likes.user_id = %s           
        ) AS liked_by_user,
        EXISTS(
            SELECT 1 FROM user_messages
            WHERE user_messages.post_id = forum_posts.id AND user_messages.user_id = %s
        ) AS answered_by_user
                   
        FROM forum_posts
        JOIN users ON forum_posts.user_id = users.id
        LEFT JOIN post_likes ON forum_posts.id = post_likes.post_id
        LEFT JOIN user_messages ON forum_posts.id = user_messages.post_id
                   
        GROUP BY forum_posts.id, users.id
        ORDER BY forum_posts.created_at DESC;
    """, (user_id, user_id))

    rows = cursor.fetchall()

    return [{
        "post_details": {
            "id": p["post_id"],
            "title": p["title"],
            "description" : p["content"],
            "date": p["created_at"],
            "likes": p["likes"],
            "answers": p["answers"],
            "liked_by_user": p["liked_by_user"],
            "answered_by_user": p["answered_by_user"]
        },
        "user_details": {
            "user": p["user_id"],
            "first_name": p["first_name"],
            "last_name": p["last_name"],
            "description": p["description"],
            "email": p["email"],
            "image_url" : p["user_image_url"]
        }       
    } for p in rows]

def getDB():
    "establish connexion to database"
    return psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode="require",
        connect_timeout = 10
    )

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
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        image_url = "https://res.cloudinary.com/dndeflndh/image/upload/v1779044690/Capture_d_e%CC%81cran_2026-05-17_a%CC%80_21.04.43_rmc8mm.png"
        password = data.get("password").encode("utf-8")
        # Encrypt password
        hashed_pw = bcrypt.hashpw(password, bcrypt.gensalt())

        # Establish connexion with DB
        conn = getDB()
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute(
            "SELECT 1 FROM users WHERE email = %s", (email,)
        )
        existingUser = cursor.fetchone()
        # Create user if not exists
        if not existingUser:
            cursor.execute(
                "INSERT INTO users (first_name, last_name, email, password, image_url) VALUES (%s, %s, %s, %s, %s)", (first_name, last_name, email, hashed_pw.decode("utf-8"), image_url)
            )
            user_id = cursor.lastrowid
            conn.commit()
            return jsonify({
                "status": "success",
                "message": "user created",
                "user_id": user_id
            }), 201
        # return error if user exists
        else:
            return jsonify({
                "status": "error",
                "message": "user exists"
            }), 400
    # Return and log error if something went wrong
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
    conn = getDB()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Get user
    cursor.execute(
        "SELECT * FROM users WHERE email = %s", (email,)
    )
    user = cursor.fetchone()
    conn.close()
    # Format response
    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({
            "status": "success",
            "message": "logged in",
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "description": user["description"],
            "user_id": user["id"],
            "image_url": user["image_url"]
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
    conn = getDB()
    # Format DB response 
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Check for new data
    image_url = None
    if new_image:
        # Upload image
        result = cloudinary.uploader.upload(new_image)
        image_url = result["secure_url"]
        cursor.execute("UPDATE users SET image_url = %s WHERE id = %s", (image_url, user_id))
    if new_description:
        cursor.execute("UPDATE users SET description = %s WHERE id = %s", (new_description, user_id))
    if new_name:
        cursor.execute("UPDATE users SET first_name = %s WHERE id = %s", (new_name, user_id))
    if new_surname:
        cursor.execute("UPDATE users SET last_name = %s WHERE id = %s", (new_surname, user_id))
    if new_email:
        cursor.execute("UPDATE users SET email = %s WHERE id = %s", (new_email, user_id))
    conn.commit()
    # Get user data after modification
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    updatedUser = cursor.fetchone()
    if not new_image and updatedUser["image_url"]:
        image_url = updatedUser["image_url"]
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
        "image_url": image_url
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
        conn = getDB()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        user_id = request.args.get("user_id")
        posts = fetch_all_posts(cursor, user_id)
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
        return jsonify({"status": "error"}), 500
    finally:
        if conn:
            conn.close()

@app.route("/post", methods=["POST"])

def post():
    "save a new post"
    conn = getDB()
    cursor = conn.cursor()
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

# ------ Answer section ------
@app.route("/send-answer", methods=["POST"])

def sendAnswer():
    "save an answer to a post"
    conn = getDB()
    cursor = conn.cursor()
    req = request.get_json()
    post_id = req.get("post_id")
    message = req.get("message")
    user_id = req.get("user_id")
    cursor.execute("""
        INSERT INTO user_messages (message, post_id, user_id)
        VALUES (%s, %s, %s)
    """, (message, post_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({
        "status": "success",
        "message": "message sent"
    })


@app.route("/get-answers", methods=["GET"])

def getAnswers():
    "load answers to a post"
    conn = getDB()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    post_id = request.args.get("post_id")
    user_id = request.args.get("user_id")
    cursor.execute("""
                   SELECT user_messages.id AS message_id,
                   user_messages.message AS message,
                   user_messages.created_at AS created_at,
                   user_messages.post_id AS post_id,
                   user_messages.user_id AS user_id,
                   users.first_name AS first_name,
                   users.image_url AS image_url
                   FROM user_messages
                   JOIN users ON user_messages.user_id = users.id
                   WHERE user_messages.post_id = %s
                   ORDER BY user_messages.created_at ASC
                   """, (post_id,))
    answers = cursor.fetchall()
    # Calculate number of answers
    answerCount = len(answers)
    # Did user answer ?
    cursor.execute("SELECT * FROM user_messages WHERE post_id = %s AND user_id = %s", (post_id, user_id))
    answered_by_user = cursor.fetchone() is not None
    # Get number of likes on this post
    cursor.execute("SELECT COUNT(*) as likes from post_likes WHERE post_id = %s", (post_id,))
    count = cursor.fetchone()
    post_likes = count["likes"]
    # Check if user liked this post
    cursor.execute("SELECT * FROM post_likes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
    liked_by_user = cursor.fetchone() is not None
    conn.close()
    if answers:
        return jsonify ({
            "status": "success",
            "message": "loaded",
            "count": answerCount,
            "post_likes": post_likes,
            "liked_by_user": liked_by_user,
            "answered_by_user": answered_by_user,
            "answers": [{
                "message_id": a["message_id"],
                "message":  a["message"],
                "created_at": a["created_at"],
                "post_id": a["post_id"],
                "user_id": a["user_id"],
                "creator": a["first_name"],
                "image_url": a["image_url"],
            } for a in answers]
        })
         
    else:
        return jsonify({
            "status": "error",
            "message": "empty"
        })
    
# ------ Like system ------
@app.route("/increase-likes", methods=["POST"])

def increase_likes():
    "increase like count for a post"
    conn = getDB()
    cursor = conn.cursor()
    req = request.get_json()
    post_id = req["post_id"]
    user_id = req["user_id"]
    cursor.execute("INSERT INTO post_likes (user_id, post_id) VALUES (%s, %s)",(user_id, post_id))
    conn.commit()
    conn.close()
    return jsonify({
        "status": "success",
        "message": "likes increased"
    })

@app.route("/decrease-likes", methods=["POST"])

def decrease_likes():
    "decrease like count for a post"
    conn = getDB()
    cursor = conn.cursor()
    req = request.get_json()
    post_id = req["post_id"]
    user_id = req["user_id"]
    cursor.execute("DELETE FROM post_likes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({
        "status": "success",
        "message": "like deleted"
    })

# ------ Search section ------

@app.route("/search-posts", methods=["GET"])

def search_posts():
    "Search for existing post matching user query"
    conn = getDB()
    # Define cursor
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Get query from request
    query = request.args.get("user_query")
    # Query DB with parameters
    cursor.execute("""
        SELECT * FROM forum_posts 
        WHERE title ILIKE %s
        OR content ILIKE %s
        ORDER BY created_at DESC
    """, (f"%{query}%", f"%{query}%"))
    # Save results
    matching_posts = cursor.fetchall()
    conn.close()
    # Return response
    return jsonify({
        "status": "success",
        "message": "results loaded",
        "results": matching_posts
    })




# ======  MAIN ======
if __name__ == "__main__":
    initDB()
    app.run(debug=True, port=8000)