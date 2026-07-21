from flask import Flask, jsonify
from flask_cors import CORS
from models import init_db
from seed import run_seed
from auth import auth_bp

app = Flask(__name__)
CORS(app)

# Registra o Blueprint de Autenticação
app.register_blueprint(auth_bp)

# Inicializa o banco de dados e executa o seed no startup
try:
    init_db()
    run_seed()
except Exception as e:
    print(f"Aviso durante a inicialização do app: {e}")

@app.route("/")
def home():
    return jsonify({"message": "Hello World do Backend Principal"}), 200

@app.route("/api/health")
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
