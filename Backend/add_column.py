import sqlite3
conn = sqlite3.connect("database.db")
cursor = conn.cursor()
cursor.execute("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
conn.commit()
conn.close()