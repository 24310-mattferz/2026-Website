from flask import Flask, jsonify, render_template, request, redirect
import sqlite3

app = Flask(__name__)

DATABASE = "rental.db"


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/login")
def login_page():
    return render_template("login.html")



@app.route("/register", methods=["POST"])
def register():

    email = request.form["email"]
    username = request.form["username"]
    password = request.form["password"]

    conn = get_db_connection()

    conn.execute(
        "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
        (email, username, password)
    )

    conn.commit()
    conn.close()

    return "User registered successfully"


@app.route("/login_user", methods=["POST"])
def login_user():

    email = request.form["email"]
    password = request.form["password"]

    conn = get_db_connection()

    user = conn.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, password)
    ).fetchone()

    conn.close()

    if user:
        return "Login successful"
    else:
        return "Invalid email or password"



@app.route("/users")
def get_users():

    conn = get_db_connection()

    users = conn.execute("SELECT * FROM users").fetchall()

    conn.close()

    return jsonify([dict(user) for user in users])



@app.route("/cars")
def get_cars():

    conn = get_db_connection()

    cars = conn.execute("SELECT * FROM cars").fetchall()

    conn.close()

    return jsonify([dict(car) for car in cars])


if __name__ == "__main__":
    app.run(debug=True)