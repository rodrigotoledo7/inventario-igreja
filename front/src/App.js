import React, { useState, useEffect } from "react";
import api, { getApiErrorMessage } from "./api";
import "./App.css";

const emptyBem = {
    nome: "",
    descricao: "",
    tipo: "movel",
    valor_estimado: "",
    identificador: "",
    local_id: "",
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const [usuarioAtual, setUsuarioAtual] = useState(null);
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [novoUsuario, setNovoUsuario] = useState({ username: "", password: "" });
    const [novoLocal, setNovoLocal] = useState({ nome: "" });
    const [locais, setLocais] = useState([]);
    const [bens, setBens] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [novoBem, setNovoBem] = useState(emptyBem);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resPerfil, resLocais, resBens, resUsuarios] = await Promise.all([
                    api.get("/me"),
                    api.get("/locais"),
                    api.get("/bens"),
                    api.get("/users"),
                ]);
                setUsuarioAtual(resPerfil.data);
                setLocais(resLocais.data);
                setBens(resBens.data);
                setUsuarios(resUsuarios.data);
            } catch (error) {
                console.error("Erro ao carregar dados", error);
                if (error?.response?.status === 401) {
                    handleLogout();
                }
            }
        };

        if (isAuthenticated) {
            loadData();
        } else {
            setUsuarioAtual(null);
            setUsuarios([]);
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setStatusMessage("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("username", loginData.username);
            formData.append("password", loginData.password);
            
            const response = await api.post("/login", formData);
            localStorage.setItem("token", response.data.access_token);
            setStatusMessage("");
            setIsAuthenticated(true);
        } catch (error) {
            alert(getApiErrorMessage(error, "Falha no login. Verifique as credenciais."));
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/users", novoUsuario);
            setUsuarios((currentUsers) => [...currentUsers, response.data].sort((a, b) => a.username.localeCompare(b.username)));
            setNovoUsuario({ username: "", password: "" });
            setStatusMessage(`Usuario ${response.data.username} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao cadastrar usuario."));
        }
    };

    const handleCreateLocal = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/locais", novoLocal);
            setLocais((currentLocais) => [...currentLocais, response.data].sort((a, b) => a.nome.localeCompare(b.nome)));
            setNovoLocal({ nome: "" });
            setStatusMessage(`Local ${response.data.nome} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao cadastrar local."));
        }
    };

    const handleAddBem = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...novoBem,
                local_id: Number(novoBem.local_id),
                valor_estimado: novoBem.valor_estimado === "" ? null : Number(novoBem.valor_estimado),
            };
            const response = await api.post("/bens", payload);
            setBens((currentBens) => [...currentBens, response.data].sort((a, b) => a.nome.localeCompare(b.nome)));
            setNovoBem(emptyBem);
            setStatusMessage(`Bem ${response.data.nome} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao adicionar bem."));
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="auth-shell">
                <section className="auth-panel">
                    <div>
                        <p className="eyebrow">Primeira IPB de Porto Velho</p>
                        <h1>Inventario patrimonial</h1>
                        <p className="auth-copy">
                            Acesse com o usuario administrador inicial configurado no backend para registrar usuarios, locais e bens.
                        </p>
                    </div>

                    <form className="panel-form" onSubmit={handleLogin}>
                        <label>
                            Usuario
                            <input type="text" placeholder="admin" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} required />
                        </label>
                        <label>
                            Senha
                            <input type="password" placeholder="Sua senha" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required />
                        </label>
                        <button type="submit">Entrar</button>
                    </form>
                </section>
            </main>
        );
    }

    return (
        <main className="app-shell">
            <header className="hero">
                <div>
                    <p className="eyebrow">Primeira IPB de Porto Velho</p>
                    <h1>Controle de inventario</h1>
                    <p className="hero-copy">
                        Gerencie usuarios de acesso, locais fisicos e bens patrimoniais em uma unica interface.
                    </p>
                </div>
                <div className="hero-actions">
                    <div className="current-user">
                        <span>Usuario logado</span>
                        <strong>{usuarioAtual?.username}</strong>
                    </div>
                    <button className="secondary-button" onClick={handleLogout}>Sair</button>
                </div>
            </header>

            {statusMessage && <p className="status-banner">{statusMessage}</p>}

            <section className="dashboard-grid">
                <article className="panel">
                    <div className="panel-heading">
                        <h2>Cadastro de usuarios</h2>
                        <span>{usuarios.length} usuario(s)</span>
                    </div>
                    <form className="panel-form" onSubmit={handleCreateUser}>
                        <label>
                            Usuario
                            <input type="text" placeholder="novo.usuario" value={novoUsuario.username} onChange={e => setNovoUsuario({ ...novoUsuario, username: e.target.value })} required />
                        </label>
                        <label>
                            Senha
                            <input type="password" placeholder="Minimo de 6 caracteres" value={novoUsuario.password} onChange={e => setNovoUsuario({ ...novoUsuario, password: e.target.value })} required />
                        </label>
                        <button type="submit">Cadastrar usuario</button>
                    </form>
                    <div className="list-stack">
                        {usuarios.map((usuario) => (
                            <div key={usuario.id} className="list-card">
                                <strong>{usuario.username}</strong>
                                <span>ID {usuario.id}</span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="panel">
                    <div className="panel-heading">
                        <h2>Cadastro de locais</h2>
                        <span>{locais.length} local(is)</span>
                    </div>
                    <form className="panel-form" onSubmit={handleCreateLocal}>
                        <label>
                            Nome do local
                            <input type="text" placeholder="Templo Sede" value={novoLocal.nome} onChange={e => setNovoLocal({ nome: e.target.value })} required />
                        </label>
                        <button type="submit">Cadastrar local</button>
                    </form>
                    <div className="list-stack">
                        {locais.map((local) => (
                            <div key={local.id} className="list-card">
                                <strong>{local.nome}</strong>
                                <span>ID {local.id}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="inventory-layout">
                <article className="panel">
                    <div className="panel-heading">
                        <h2>Cadastro de bens</h2>
                        <span>{bens.length} item(ns)</span>
                    </div>
                    <form className="panel-form" onSubmit={handleAddBem}>
                        <label>
                            Nome
                            <input type="text" placeholder="Mesa do conselho" value={novoBem.nome} onChange={e => setNovoBem({ ...novoBem, nome: e.target.value })} required />
                        </label>
                        <label>
                            Identificador
                            <input type="text" placeholder="PLAQ-001" value={novoBem.identificador} onChange={e => setNovoBem({ ...novoBem, identificador: e.target.value })} />
                        </label>
                        <label>
                            Descricao
                            <textarea placeholder="Detalhes do bem" value={novoBem.descricao} onChange={e => setNovoBem({ ...novoBem, descricao: e.target.value })} />
                        </label>
                        <div className="row">
                            <label>
                                Tipo
                                <select value={novoBem.tipo} onChange={e => setNovoBem({ ...novoBem, tipo: e.target.value })}>
                                    <option value="movel">Movel</option>
                                    <option value="imovel">Imovel</option>
                                </select>
                            </label>
                            <label>
                                Valor estimado
                                <input type="number" min="0" step="0.01" placeholder="0,00" value={novoBem.valor_estimado} onChange={e => setNovoBem({ ...novoBem, valor_estimado: e.target.value })} />
                            </label>
                        </div>
                        <label>
                            Local
                            <select value={novoBem.local_id} onChange={e => setNovoBem({ ...novoBem, local_id: e.target.value })} required>
                                <option value="">Selecione o local</option>
                                {locais.map(local => <option key={local.id} value={local.id}>{local.nome}</option>)}
                            </select>
                        </label>
                        <button type="submit">Cadastrar bem</button>
                    </form>
                </article>

                <article className="panel">
                    <div className="panel-heading">
                        <h2>Bens cadastrados</h2>
                        <span>Consulta rapida</span>
                    </div>
                    <div className="inventory-grid">
                        {bens.map((bem) => {
                            const local = locais.find((item) => item.id === bem.local_id);
                            return (
                                <div key={bem.id} className="inventory-card">
                                    <div className="card-top">
                                        <strong>{bem.nome}</strong>
                                        <span className={`badge ${bem.tipo}`}>{bem.tipo}</span>
                                    </div>
                                    <p>{bem.descricao || "Sem descricao informada."}</p>
                                    <dl>
                                        <div>
                                            <dt>Local</dt>
                                            <dd>{local?.nome || `ID ${bem.local_id}`}</dd>
                                        </div>
                                        <div>
                                            <dt>Identificador</dt>
                                            <dd>{bem.identificador || "Nao informado"}</dd>
                                        </div>
                                        <div>
                                            <dt>Valor</dt>
                                            <dd>{bem.valor_estimado ? `R$ ${Number(bem.valor_estimado).toFixed(2)}` : "Nao informado"}</dd>
                                        </div>
                                    </dl>
                                </div>
                            );
                        })}
                    </div>
                </article>
            </section>
        </main>
    );
};

export default App;
