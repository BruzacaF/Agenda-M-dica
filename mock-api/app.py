import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'agendamentos.json')

def load_agendamentos():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route("/")
def home():
    return jsonify({"message": "Hello World da Mock API"}), 200

@app.route("/api/agendamentos/health")
def health():
    return jsonify({"status": "healthy"}), 200

@app.route("/api/agendamentos", methods=['GET'])
def get_agendamentos():
    try:
        # Suporte para simulação de indisponibilidade (500)
        fail = request.args.get('fail', 'false').lower() == 'true'
        if fail:
            return jsonify({"error": "Erro interno simulado na Mock API"}), 500

        # Suporte para simulação de lista vazia
        empty = request.args.get('empty', 'false').lower() == 'true'
        if empty:
            return jsonify([]), 200

        agendamentos = load_agendamentos()
        return jsonify(agendamentos), 200

    except Exception as e:
        print(f"Erro ao processar agendamentos: {e}")
        return jsonify({"error": "Falha no servidor da Mock API"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
