import datetime
import jwt
import os
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from models import get_db_connection

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-agenda-medica')

@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json(silent=True) or {}
        fail_query = request.args.get('fail', 'false').lower() == 'true'
        fail_body = bool(data.get('fail'))

        if fail_query or fail_body:
            return jsonify({"error": "O serviço de autenticação encontrou uma instabilidade temporária. Por favor, tente novamente em alguns instantes."}), 500

        if not data:
            return jsonify({"error": "Por favor, informe o e-mail e a senha para autenticação."}), 400

        email = data.get('email')
        senha = data.get('senha')

        if not email or not senha:
            return jsonify({"error": "Por favor, preencha tanto o e-mail quanto a senha."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, senha FROM usuarios WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()

        if user is None or not check_password_hash(user['senha'], senha):
            return jsonify({"error": "E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente."}), 401

        payload = {
            'user_id': user['id'],
            'email': user['email'],
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        return jsonify({
            "message": "Login realizado com sucesso",
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email']
            }
        }), 200

    except Exception as e:
        # Logging do erro real no servidor para debug
        print(f"Erro interno no login: {e}")
        # Retorno controlado sem expor stack traces ou detalhes técnicos
        return jsonify({"error": "Erro interno no servidor"}), 500
