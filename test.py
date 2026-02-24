import sqlite3

# Connects to the file (creates it if it's missing)
db = sqlite3.connect('cars.db')
cursor = db.cursor()

# FIX: Create the table if it doesn't exist yet
cursor.execute("""
    CREATE TABLE IF NOT EXISTS car (
        id INTEGER PRIMARY KEY,
        make TEXT,
        model TEXT
    )
""")