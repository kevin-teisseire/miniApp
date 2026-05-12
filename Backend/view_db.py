import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(forum_posts)")
columns = cursor.fetchall()

print(columns)

conn.close()