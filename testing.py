from flask import Flask, render_template, request, redirect, jsonify, session
import sqlite3

app = Flask(
    __name__,
    template_folder="HTML_CODE",
    static_folder="CSS_AND_JS",
    static_url_path="/static"
)

app.secret_key = "revora_secret_key"



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
        session["user_id"] = user["id"]
        return redirect("/home")
    else:
        return "Login failed. Check your email and password."
    

@app.route("/get_user")
def get_user():
    return jsonify({"user_id": session.get("user_id")})



@app.route("/cars")
def get_cars():
    conn = get_db_connection()
    cars = conn.execute("SELECT * FROM cars").fetchall()
    conn.close()
    return jsonify([dict(car) for car in cars])

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/booking")
def booking():
    return render_template("booking.html")

@app.route("/create_booking", methods=["POST"])
def create_booking():
    data = request.get_json()
    if not session.get("user_id"):
     return jsonify({"message": "Not logged in"}), 401

    user_id = data["user_id"]
    car_id = data["car_id"]
    start_date = data["start_date"]
    end_date = data["end_date"]
    total_price = data["total_price"]

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, car_id, start_date, end_date, total_price, "confirmed"))

    conn.commit()
    conn.close()

    return jsonify({"message": "Booking saved successfully"})

if __name__ == "__main__":
    app.run(debug=True)