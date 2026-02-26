from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

DATABASE = "rental.db"

@app.route("/cars")
def get_cars():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cars = conn.execute("SELECT * FROM cars").fetchall()
    conn.close()
    return jsonify([dict(car) for car in cars])

if __name__ == "__main__":
    app.run(debug=True)