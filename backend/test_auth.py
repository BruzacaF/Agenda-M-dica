import pytest
from app import app
from models import init_db
from seed import run_seed

@pytest.fixture
def client():
    # Configura a aplicação para modo de testes
    app.config['TESTING'] = True
    
    # Inicializa e realiza o seed do banco de dados antes dos testes
    init_db()
    run_seed()
    
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """ Valida o endpoint de health check do backend """
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_login_sucesso(client):
    """ Valida o login com credenciais corretas (200 OK + Token JWT) """
    payload = {
        "email": "admin@agendamedica.com.br",
        "senha": "AdminPassword123"
    }
    response = client.post('/api/login', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data
    assert 'user' in data
    assert data['user']['email'] == "admin@agendamedica.com.br"

def test_login_senha_incorreta(client):
    """ Valida a rejeição de login com senha incorreta (401 Unauthorized) """
    payload = {
        "email": "admin@agendamedica.com.br",
        "senha": "SenhaIncorreta123"
    }
    response = client.post('/api/login', json=payload)
    assert response.status_code == 401
    data = response.get_json()
    assert data['error'] == "Credenciais inválidas"

def test_login_usuario_inexistente(client):
    """ Valida a rejeição de login para usuário não cadastrado (401 Unauthorized) """
    payload = {
        "email": "inexistente@agendamedica.com.br",
        "senha": "AdminPassword123"
    }
    response = client.post('/api/login', json=payload)
    assert response.status_code == 401
    data = response.get_json()
    assert data['error'] == "Credenciais inválidas"

def test_login_payload_incompleto(client):
    """ Valida a rejeição de login com payload ausente ou sem senha (400 Bad Request) """
    # Cenário sem a senha no JSON
    payload_sem_senha = {"email": "admin@agendamedica.com.br"}
    response = client.post('/api/login', json=payload_sem_senha)
    assert response.status_code == 400
    assert response.get_json()['error'] == "Email e senha são obrigatórios"

    # Cenário com JSON completamente vazio
    response_vazio = client.post('/api/login', json={})
    assert response_vazio.status_code == 400
    assert response_vazio.get_json()['error'] == "Email e senha são obrigatórios"
