import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [locais, setLocais] = useState([]);
    const [bens, setBens] = useState([]);
    const [novoBem, setNovoBem] = useState({ nome: '', descricao: '', local_id: '' });

    useEffect(() => {
        axios.get('http://localhost:5000/locais')
            .then(response => setLocais(response.data))
            .catch(error => console.error(error));

        axios.get('http://localhost:5000/bens')
            .then(response => setBens(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleAddBem = () => {
        axios.post('http://localhost:5000/bens', novoBem)
            .then(() => {
                setBens([...bens, novoBem]);
                setNovoBem({ nome: '', descricao: '', local_id: '' });
            })
            .catch(error => console.error(error));
    };

    return (
        <div>
            <h1>Inventário da Igreja</h1>
            <h2>Bens Móveis</h2>
            <ul>
                {bens.map(bem => (
                    <li key={bem.id}>{bem.nome} - {bem.descricao}</li>
                ))}
            </ul>
            <h3>Adicionar Novo Bem</h3>
            <input 
                type="text" 
                placeholder="Nome" 
                value={novoBem.nome}
                onChange={e => setNovoBem({ ...novoBem, nome: e.target.value })}
            />
            <textarea
                placeholder="Descrição"
                value={novoBem.descricao}
                onChange={e => setNovoBem({ ...novoBem, descricao: e.target.value })}
            />
            <select 
                value={novoBem.local_id}
                onChange={e => setNovoBem({ ...novoBem, local_id: e.target.value })}
            >
                <option value="">Selecione um Local</option>
                {locais.map(local => (
                    <option key={local.id} value={local.id}>{local.nome}</option>
                ))}
            </select>
            <button onClick={handleAddBem}>Adicionar Bem</button>
        </div>
    );
};

export default App;
