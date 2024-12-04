import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados usando variáveis de ambiente
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'mysql+pymysql://user:password@localhost/igreja_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Definição dos modelos
class Local(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)

class Bem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(255))
    local_id = db.Column(db.Integer, db.ForeignKey('local.id'), nullable=False)

# Criação do banco de dados dentro do contexto da aplicação
@app.before_first_request
def create_tables():
    db.create_all()

# Rota para listar os locais
@app.route('/locais', methods=['GET'])
def get_locais():
    try:
        locais = Local.query.all()
        return jsonify([{"id": l.id, "nome": l.nome} for l in locais])
    except Exception as e:
        return jsonify({"message": "Erro ao recuperar locais", "error": str(e)}), 500

# Rota para gerenciar bens (GET para listar e POST para criar)
@app.route('/bens', methods=['GET', 'POST'])
def manage_bens():
    if request.method == 'POST':
        try:
            data = request.json
            novo_bem = Bem(
                nome=data['nome'],
                descricao=data.get('descricao'),
                local_id=data['local_id']
            )
            db.session.add(novo_bem)
            db.session.commit()
            return jsonify({"message": "Bem criado com sucesso"}), 201
        except Exception as e:
            return jsonify({"message": "Erro ao criar bem", "error": str(e)}), 400
    else:
        try:
            bens = Bem.query.all()
            return jsonify([{"id": b.id, "nome": b.nome, "descricao": b.descricao, "local_id": b.local_id} for b in bens])
        except Exception as e:
            return jsonify({"message": "Erro ao recuperar bens", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
