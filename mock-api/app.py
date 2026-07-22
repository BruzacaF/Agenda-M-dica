import json
import os
import math
import random
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

        agendamentos.append({
            "id": i,
            "paciente": nome_paciente,
            "cpf": cpf_raw,
            "medico": medico,
            "especialidade": especialidade,
            "data": data_str,
            "horario": hora_str,
            "convenio": random.choice(CONVENIOS),
            "status": random.choices(STATUS_LIST, weights=[60, 25, 15])[0]
        })

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(agendamentos, f, ensure_ascii=False, indent=2)

    return agendamentos

def load_agendamentos():
    if not os.path.exists(DATA_FILE):
        return generate_1000_agendamentos()
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if len(data) < TOTAL_MOCK_RECORDS:
                return generate_1000_agendamentos()
            return data
    except Exception:
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
        fail = request.args.get('fail', 'false').lower() == 'true'
        if fail:
            return jsonify({"error": "Erro interno simulado na Mock API"}), 500

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
