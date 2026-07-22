import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db_connection(db_path=None):
    target_path = db_path if db_path else DB_PATH
    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path=None):
    try:
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL
            );
        ''')
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
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {e}")
        raise e

def sync_agendamentos_db(agendamentos, db_path=None):
    try:
        init_db(db_path)
        conn = get_db_connection(db_path)
        cursor = conn.cursor()
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
        print(f"{len(agendamentos)} agendamentos sincronizados com o SQLite com sucesso!")
    except Exception as e:
        print(f"Erro ao sincronizar agendamentos no banco SQLite: {e}")

