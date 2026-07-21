from werkzeug.security import generate_password_hash
from models import get_db_connection

def run_seed():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se já existe algum usuário cadastrado
        cursor.execute('SELECT COUNT(*) FROM usuarios')
        count = cursor.fetchone()[0]
        
        if count == 0:
            email_padrao = "admin@agendamedica.com.br"
            senha_padrao = "AdminPassword123"
            senha_hash = generate_password_hash(senha_padrao)
            
            cursor.execute(
                'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
                (email_padrao, senha_hash)
            )
            conn.commit()
            print(f"Usuário de teste ({email_padrao}) criado com sucesso!")
        else:
            print("Banco de dados já contém usuários cadastrados. Seed omitido.")
            
        conn.close()
    except Exception as e:
        print(f"Erro durante a execução do seed: {e}")
        raise e

if __name__ == "__main__":
    from models import init_db
    init_db()
    run_seed()
