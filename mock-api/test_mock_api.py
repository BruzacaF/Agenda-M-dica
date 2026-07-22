import os
import sqlite3
import jwt
import pytest
from app import app, SECRET_KEY, SQLITE_DB_PATH

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_agendamentos_sem_token(client):
    """ Tentar acessar a Mock API sem token deve retornar 401 Unauthorized """
    response = client.get('/api/agendamentos')
    assert response.status_code == 401
    data = response.get_json()
    assert 'Acesso não autorizado' in data['error']

def test_agendamentos_token_invalido(client):
    """ Tentar acessar a Mock API com token inválido deve retornar 401 Unauthorized """
    headers = {'Authorization': 'Bearer token-invalido-xyz'}
    response = client.get('/api/agendamentos', headers=headers)
    assert response.status_code == 401
    data = response.get_json()
    assert 'Acesso não autorizado' in data['error']

def test_agendamentos_token_valido(client):
    """ Acessar a Mock API com token JWT válido deve retornar 200 e gravar os dados no SQLite """
    token = jwt.encode({'user_id': 1, 'email': 'admin@agendamedica.com.br'}, SECRET_KEY, algorithm='HS256')
    headers = {'Authorization': f'Bearer {token}'}
    response = client.get('/api/agendamentos', headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert 'data' in data
    assert len(data['data']) > 0

    # Verificar se a tabela agendamentos foi criada e populada no SQLite
    assert os.path.exists(SQLITE_DB_PATH)
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM agendamentos')
    count = cursor.fetchone()[0]
    conn.close()
    assert count > 0
