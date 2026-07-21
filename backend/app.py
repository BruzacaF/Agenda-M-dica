from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({"message": "Hello World do Backend Principal"}), 200

@app.route("/api/health")
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
