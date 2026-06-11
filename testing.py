# PYTHON FILE - MATTHEW FERNANDEZ - APRIl 2026
# Imported Flask modules and SQLite
from flask import Flask, render_template, request, redirect, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

# Create Flask app and define template/static folders
app = Flask(
    __name__,
    template_folder="HTML_CODE",
    static_folder="CSS_AND_JS",
    static_url_path="/static"
)
# Secret key used for session login system
app.secret_key = "revora_secret_key"


# Database file name
DATABASE = "rental.db"
# Function to connect to database
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
     # Allows columns to be accessed by name
    conn.row_factory = sqlite3.Row
    return conn

# Redirect root URL to login page
@app.route("/")
def root():
    return redirect("/login")
# Show login page
@app.route("/login")
def login_page():
    return render_template("login.html")

# Register new users
@app.route("/register", methods=["POST"])
def register():
    # Get form data from registration form
    email = request.form["email"]
    username = request.form["username"]
    password = request.form["password"]
    hashed_pw = generate_password_hash(password)
 # Connect to database
    conn = get_db_connection()
    cursor = conn.cursor()
     # Create users table if it does not exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    """)
    try:
         # Insert new user into database
        cursor.execute(
            "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
            (email, username, hashed_pw)
        )
        conn.commit()
        conn.close()
         # Return to login page after successful registration
        return redirect("/login")
    except sqlite3.IntegrityError:
        conn.close()

        # Error if email already exists
        return "Email already registered. Try logging in!"
# Login existing users
@app.route("/login_user", methods=["POST"])
def login_user():

     # Get login form data
    email = request.form["email"]
    password = request.form["password"]

   # Check if user exists in database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()

    # If user exists, save their ID into session
    if user and check_password_hash(user["password"], password):
        session["user_id"] = user["id"]
          # Redirect to homepage
        return redirect("/home")
    else:
        return "Login failed. Check your email and password."
# Logout user
@app.route("/logout")
def logout():
    # Remove user session
    session.pop("user_id", None)
      # Return to login page
    return redirect("/login")
    
# Send logged-in user info to frontend
@app.route("/get_user")
def get_user():
    return jsonify({"user_id": session.get("user_id")})


# Get all cars from database
@app.route("/cars")
def get_cars():
    conn = get_db_connection()

    cars = conn.execute("""
        SELECT id, brand, model, price_per_day
        FROM cars
     """).fetchall()

    conn.close()

    return jsonify([
        {
            "id": car["id"],
            "make": car["brand"],
            "model": car["model"],
            "daily_rate": car["price_per_day"]
        }
        for car in cars
    ])

# Homepage route
@app.route("/home")
def home():
    return render_template("home.html")
# Booking page route
@app.route("/booking")
def booking():
     # Prevent users who are not logged in
    if not session.get("user_id"):
        return redirect("/login")   # block access
    return render_template("booking.html")
# Create a booking
@app.route("/create_booking", methods=["POST"])
def create_booking():
    data = request.get_json()

    # Prevent booking if not logged in
    if not session.get("user_id"):
     return jsonify({"message": "Not logged in"}), 401
 # Extract booking details
    user_id = data["user_id"]
    car_id = data["car_id"]
    start_date = data["start_date"]
    end_date = data["end_date"]
    total_price = data["total_price"]

    conn = get_db_connection()
    cursor = conn.cursor()
    # Insert booking into bookings table
    cursor.execute("""
        INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, car_id, start_date, end_date, total_price, "confirmed"))

    conn.commit()
    conn.close()

    return jsonify({"message": "Booking saved successfully"})

@app.route("/all_bookings")
def all_bookings():
    conn = get_db_connection()

    data = conn.execute("""
        SELECT users.full_name, cars.make, cars.model,
               bookings.start_date, bookings.end_date, bookings.total_price
        FROM bookings
        JOIN users ON bookings.user_id = users.id
        JOIN cars ON bookings.car_id = cars.id
    """).fetchall()

    conn.close()
    return jsonify([dict(row) for row in data])

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

# Run Flask server
if __name__ == "__main__":
    app.run(debug=True, port=5050, use_reloader=False)