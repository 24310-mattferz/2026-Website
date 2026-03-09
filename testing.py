from flask import Flask, render_template, request, redirect, jsonify
import sqlite3

app = Flask(
    __name__,
    template_folder="HTML_CODE",
    static_folder="CSS_AND_JS"
)

DATABASE = "rental.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def root():
    return redirect("/login")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register", methods=["POST"])
def register():
    email = request.form["email"]
    username = request.form["username"]
    password = request.form["password"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    """)
    try:
        cursor.execute(
            "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
            (email, username, password)
        )
        conn.commit()
        conn.close()
        return redirect("/login")
    except sqlite3.IntegrityError:
        conn.close()
        return "Email already registered. Try logging in!"

@app.route("/login_user", methods=["POST"])
def login_user():
    email = request.form["email"]
    password = request.form["password"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return f"Login successful! Welcome, {user['username']}!"
    else:
        return "Login failed. Check your email and password."

@app.route("/cars")
def get_cars():
    conn = get_db_connection()
    cars = conn.execute("SELECT * FROM cars").fetchall()
    conn.close()
    return jsonify([dict(car) for car in cars])

if __name__ == "__main__":
    app.run(debug=True)