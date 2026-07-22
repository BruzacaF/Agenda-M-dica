import json
import os
import math
import random
import sqlite3
import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from faker import Faker
    fake = Faker('pt_BR')
    Faker.seed(42)
    random.seed(42)
    HAS_FAKER = True
except ImportError:
    HAS_FAKER = False

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'agendamentos.json')
TOTAL_MOCK_RECORDS = 1000
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-agenda-medica')
SQLITE_DB_PATH = os.environ.get('SQLITE_DB_PATH', os.path.join(os.path.dirname(__file__), '..', 'backend', 'database.db'))

def verify_jwt_token(req):
    auth_header = req.headers.get('Authorization')
    if not auth_header:
        return False, "Token de autenticação não fornecido no cabeçalho Authorization"
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return False, "Formato do cabeçalho Authorization inválido. Use 'Bearer <token>'"
    
    token = parts[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return True, payload
    except jwt.ExpiredSignatureError:
        return False, "Token de autenticação expirado"
    except jwt.InvalidTokenError:
        return False, "Token de autenticação inválido"

def save_to_sqlite(agendamentos):
    try:
        target_path = os.path.abspath(SQLITE_DB_PATH)
        db_dir = os.path.dirname(target_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            
        conn = sqlite3.connect(target_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agendamentos (
                id INTEGER PRIMARY KEY,
                paciente TEXT,
                cpf TEXT,
                medico TEXT,
                especialidade TEXT,
                data TEXT,
                horario TEXT,
                convenio TEXT,
                status TEXT
            );
        ''')
        for item in agendamentos:
            cursor.execute('''
                INSERT INTO agendamentos (id, paciente, cpf, medico, especialidade, data, horario, convenio, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    paciente=excluded.paciente,
                    cpf=excluded.cpf,
                    medico=excluded.medico,
                    especialidade=excluded.especialidade,
                    data=excluded.data,
                    horario=excluded.horario,
                    convenio=excluded.convenio,
                    status=excluded.status
            ''', (
                item.get('id'),
                item.get('paciente'),
                item.get('cpf'),
                item.get('medico'),
                item.get('especialidade'),
                item.get('data'),
                item.get('horario'),
                item.get('convenio'),
                item.get('status')
            ))
        conn.commit()
        conn.close()
        print(f"[SQLite Mock API] {len(agendamentos)} agendamentos salvos no SQLite ('{target_path}').")
    except Exception as e:
        print(f"[SQLite Mock API Error] Falha ao salvar no SQLite: {e}")

MEDICOS_ESPECIALIDADES = [
    ("Dr. Carlos Eduardo", "Cardiologia"),
    ("Dra. Mariana Costa", "Dermatologia"),
    ("Dr. Roberto Alves", "Ortopedia"),
    ("Dra. Fernanda Lima", "Pediatria"),
    ("Dra. Juliana Paes", "Ginecologia"),
    ("Dr. André Santos", "Neurologia"),
    ("Dra. Beatriz Rocha", "Oftalmologia"),
    ("Dr. Gustavo Oliveira", "Endocrinologia"),
    ("Dra. Camila Martins", "Psiquiatria"),
    ("Dr. Marcelo Ribeiro", "Gastroenterologia")
]

CONVENIOS = ["Unimed", "Bradesco Saúde", "Amil", "SulAmérica", "Particular", "NotreDame Intermédica"]
STATUS_LIST = ["Confirmado", "Pendente", "Cancelado"]

def generate_1000_agendamentos():
    agendamentos = []
    
    for i in range(1, TOTAL_MOCK_RECORDS + 1):
        medico, especialidade = random.choice(MEDICOS_ESPECIALIDADES)
        
        if HAS_FAKER:
            nome_paciente = fake.name()
            cpf_raw = fake.cpf()
            data_str = fake.date_between(start_date='-30d', end_date='+60d').strftime('%Y-%m-%d')
            hora_str = f"{random.randint(8, 17):02d}:{random.choice(['00', '15', '30', '45'])}"
        else:
            primeiros_nomes = ["Ana", "Bruno", "Carla", "Diego", "Elena", "Fernando", "Gabriela", "Heitor", "Isabela", "João"]
            sobrenomes = ["Silva", "Santos", "Oliveira", "Ferreira", "Souza", "Rodrigues", "Mendes", "Castro", "Martins", "Alves"]
            nome_paciente = f"{random.choice(primeiros_nomes)} {random.choice(sobrenomes)}"
            cpf_raw = f"{random.randint(100,999)}.{random.randint(100,999)}.{random.randint(100,999)}-{random.randint(10,99):02d}"
            data_str = f"2026-07-{random.randint(1, 30):02d}"
            hora_str = f"{random.randint(8, 17):02d}:{random.choice(['00', '15', '30', '45'])}"

        # Distribuição realista e variada de dados ausentes para testes de resiliência
        rec_paciente = nome_paciente if i % 80 != 0 else None
        rec_cpf = cpf_raw if i % 18 != 0 else None
        rec_medico = medico if i % 32 != 0 else None
        rec_especialidade = especialidade if i % 32 != 0 else None
        rec_convenio = random.choice(CONVENIOS) if i % 24 != 0 else None
        rec_status = random.choices(STATUS_LIST, weights=[60, 25, 15])[0] if i % 36 != 0 else None
        rec_data = data_str if i % 70 != 0 else None
        rec_horario = hora_str if i % 70 != 0 else None

        agendamentos.append({
            "id": i,
            "paciente": rec_paciente,
            "cpf": rec_cpf,
            "medico": rec_medico,
            "especialidade": rec_especialidade,
            "data": rec_data,
            "horario": rec_horario,
            "convenio": rec_convenio,
            "status": rec_status
        })

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(agendamentos, f, ensure_ascii=False, indent=2)

    save_to_sqlite(agendamentos)
    return agendamentos

def load_agendamentos():
    return generate_1000_agendamentos()

load_agendamentos()

@app.route("/")
def home():
    return jsonify({"message": "Mock API de Agendamentos Médicos (Multi-Filter & Individual Search)"}), 200

@app.route("/api/agendamentos/health")
def health():
    return jsonify({"status": "healthy", "total_records": TOTAL_MOCK_RECORDS}), 200

@app.route("/api/agendamentos", methods=['GET'])
def get_agendamentos():
    try:
        is_valid, token_res = verify_jwt_token(request)
        if not is_valid:
            return jsonify({"error": f"Acesso não autorizado. {token_res}"}), 401

        fail = request.args.get('fail', 'false').lower() == 'true'
        if fail:
            return jsonify({"error": "Identificamos uma instabilidade temporária no serviço de agendamentos. Por favor, tente novamente em instantes."}), 500


        empty = request.args.get('empty', 'false').lower() == 'true'
        if empty:
            return jsonify({
                "data": [],
                "total": 0,
                "page": 1,
                "limit": 10,
                "total_pages": 1
            }), 200

        try:
            page = max(1, int(request.args.get('page', 1)))
        except ValueError:
            page = 1

        try:
            limit = max(1, min(100, int(request.args.get('limit', 10))))
        except ValueError:
            limit = 10

        # Parâmetros de Filtros Individuais / Agrupados (Strict matching)
        paciente_query = request.args.get('paciente', '').strip().lower()
        cpf_query = request.args.get('cpf', '').strip().replace('.', '').replace('-', '')
        medico_query = request.args.get('medico', '').strip().lower()
        
        # Suporte legado para busca única genérica
        general_search = request.args.get('search', '').strip().lower()

        all_records = load_agendamentos()
        filtered = []

        for item in all_records:
            match = True
            
            # Filtro estrito por Paciente (procura EXCLUSIVAMENTE no campo paciente)
            if paciente_query:
                if paciente_query not in item.get('paciente', '').lower():
                    match = False

            # Filtro estrito por CPF (procura EXCLUSIVAMENTE no campo cpf)
            if cpf_query and match:
                item_cpf_clean = item.get('cpf', '').replace('.', '').replace('-', '')
                if cpf_query not in item_cpf_clean:
                    match = False

            # Filtro estrito por Médico (procura EXCLUSIVAMENTE no campo medico)
            if medico_query and match:
                if medico_query not in item.get('medico', '').lower():
                    match = False

            # Busca genérica fallback se nenhum filtro específico foi passado
            if general_search and not (paciente_query or cpf_query or medico_query) and match:
                clean_gen_search = general_search.replace('.', '').replace('-', '')
                pac_match = general_search in item.get('paciente', '').lower()
                med_match = general_search in item.get('medico', '').lower()
                cpf_match = clean_gen_search in item.get('cpf', '').replace('.', '').replace('-', '')
                if not (pac_match or med_match or cpf_match):
                    match = False

            if match:
                filtered.append(item)

        incomplete_only = request.args.get('incomplete', 'false').lower() == 'true'
        if incomplete_only:
            filtered = [
                item for item in filtered
                if not item.get('paciente') or not item.get('cpf') or not item.get('medico')
                or not item.get('especialidade') or not item.get('convenio') or not item.get('status')
                or not item.get('data') or not item.get('horario')
            ]

        total_items = len(filtered)
        total_pages = math.ceil(total_items / limit) if total_items > 0 else 1

        if page > total_pages and total_pages > 0:
            page = total_pages

        start = (page - 1) * limit
        end = start + limit
        paginated_data = filtered[start:end]

        return jsonify({
            "data": paginated_data,
            "total": total_items,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }), 200

    except Exception as e:
        print(f"Erro ao processar agendamentos: {e}")
        return jsonify({"error": "Falha no servidor da Mock API"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
