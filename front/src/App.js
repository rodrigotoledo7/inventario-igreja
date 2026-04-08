import React, { useState, useEffect } from "react";
import api from "./api";
import "./App.css";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [locais, setLocais] = useState([]);
    const [bens, setBens] = useState([]);
    const [novoBem, setNovoBem] = useState({ 
        nome: "", 
        descricao: "", 
        tipo: "movel", 
        valor_estimado: 0, 
        identificador: "",
        local_id: "" 
    });

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            const [resLocais, resBens] = await Promise.all([
                api.get("/locais"),
                api.get("/bens")
            ]);
            setLocais(resLocais.data);
            setBens(resBens.data);
        } catch (error) {
            console.error("Erro ao carregar dados", error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("username", loginData.username);
            formData.append("password", loginData.password);
            
            const response = await api.post("/login", formData);
            localStorage.setItem("token", response.data.access_token);
            setIsAuthenticated(true);
        } catch (error) {
            alert("Falha no login. Verifique as credenciais.");
        }
    };

    const handleAddBem = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/bens", novoBem);
            setBens([...bens, response.data]);
            setNovoBem({ nome: "", descricao: "", tipo: "movel", valor_estimado: 0, identificador: "", local_id: "" });
        } catch (error) {
            alert("Erro ao adicionar bem.");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <form onSubmit={handleLogin}>
                    <h1>Inventário IPB Porto Velho</h1>
                    <input type="text" placeholder="Usuário" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} required />
                    <input type="password" placeholder="Senha" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required />
                    <button type="submit">Entrar</button>
                </form>
            </div>
        );
    }

    return (
        <div className="main-container">
            <header>
                <h1>Inventário da Igreja</h1>
                <button onClick={() => { localStorage.removeItem("token"); setIsAuthenticated(false); }}>Sair</button>
            </header>
            
            <section className="form-section">
                <h3>Adicionar Novo Bem</h3>
                <form onSubmit={handleAddBem}>
                    <input type="text" placeholder="Nome" value={novoBem.nome} onChange={e => setNovoBem({ ...novoBem, nome: e.target.value })} required />
                    <input type="text" placeholder="ID / Plaqueta" value={novoBem.identificador} onChange={e => setNovoBem({ ...novoBem, identificador: e.target.value })} />
                    <textarea placeholder="Descrição" value={novoBem.descricao} onChange={e => setNovoBem({ ...novoBem, descricao: e.target.value })} />
                    
                    <div className="row">
                        <select value={novoBem.tipo} onChange={e => setNovoBem({ ...novoBem, tipo: e.target.value })}>
                            <option value="movel">Móvel</option>
                            <option value="imovel">Imóvel</option>
                        </select>
                        <input type="number" placeholder="Valor Estimado" value={novoBem.valor_estimado} onChange={e => setNovoBem({ ...novoBem, valor_estimado: parseFloat(e.target.value) })} />
                    </div>

                    <select value={novoBem.local_id} onChange={e => setNovoBem({ ...novoBem, local_id: e.target.value })} required>
                        <option value="">Selecione o Local</option>
                        {locais.map(local => <option key={local.id} value={local.id}>{local.nome}</option>)}
                    </select>
                    
                    <button type="submit">Salvar</button>
                </form>
            </section>

            <section className="list-section">
                <h2>Bens Cadastrados</h2>
                <div className="grid">
                    {bens.map(bem => (
                        <div key={bem.id} className="card">
                            <h4>{bem.nome} <span className={`badge ${bem.tipo}`}>{bem.tipo}</span></h4>
                            <p>{bem.descricao}</p>
                            <small>ID: {bem.identificador} | Valor: R$ {bem.valor_estimado}</small>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default App;