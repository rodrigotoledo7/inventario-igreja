from flask import request, jsonify
from . import app, db
from .models import Local, Bem

@app.route('/locais', methods=['GET'])
def get_locais():
    locais = Local.query.all()
    return jsonify([{"id": l.id, "nome": l.nome} for l in locais])

@app.route('/bens', methods=['GET', 'POST'])
def manage_bens():
    if request.method == 'POST':
        data = request.json
        novo_bem = Bem(nome=data['nome'], descricao=data.get('descricao'), local_id=data['local_id'])
        db.session.add(novo_bem)
        db.session.commit()
        return jsonify({"message": "Bem criado com sucesso"}), 201
    else:
        bens = Bem.query.all()
        return jsonify([{"id": b.id, "nome": b.nome, "descricao": b.descricao, "local_id": b.local_id} for b in bens])
