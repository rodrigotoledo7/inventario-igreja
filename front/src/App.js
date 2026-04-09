import React, { useEffect, useState } from "react";
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

const emptyUser = {
    username: "",
    password: "",
};

const emptyLocal = {
    nome: "",
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const [usuarioAtual, setUsuarioAtual] = useState(null);
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [novoUsuario, setNovoUsuario] = useState(emptyUser);
    const [novoLocal, setNovoLocal] = useState(emptyLocal);
    const [locais, setLocais] = useState([]);
    const [bens, setBens] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [novoBem, setNovoBem] = useState(emptyBem);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingLocalId, setEditingLocalId] = useState(null);
    const [editingBemId, setEditingBemId] = useState(null);
    const [editUsuario, setEditUsuario] = useState(emptyUser);
    const [editLocal, setEditLocal] = useState(emptyLocal);
    const [editBem, setEditBem] = useState(emptyBem);
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
            setLocais([]);
            setBens([]);
        }
    }, [isAuthenticated]);

    const sortByName = (items, field) => [...items].sort((a, b) => a[field].localeCompare(b[field]));

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
            setUsuarios((currentUsers) => sortByName([...currentUsers, response.data], "username"));
            setNovoUsuario(emptyUser);
            setStatusMessage(`Usuario ${response.data.username} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao cadastrar usuario."));
        }
    };

    const handleCreateLocal = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/locais", novoLocal);
            setLocais((currentLocais) => sortByName([...currentLocais, response.data], "nome"));
            setNovoLocal(emptyLocal);
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
            setBens((currentBens) => sortByName([...currentBens, response.data], "nome"));
            setNovoBem(emptyBem);
            setStatusMessage(`Bem ${response.data.nome} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao adicionar bem."));
        }
    };

    const beginUserEdit = (usuario) => {
        setEditingUserId(usuario.id);
        setEditUsuario({ username: usuario.username, password: "" });
    };

    const beginLocalEdit = (local) => {
        setEditingLocalId(local.id);
        setEditLocal({ nome: local.nome });
    };

    const beginBemEdit = (bem) => {
        setEditingBemId(bem.id);
        setEditBem({
            nome: bem.nome,
            descricao: bem.descricao || "",
            tipo: bem.tipo,
            valor_estimado: bem.valor_estimado ?? "",
            identificador: bem.identificador || "",
            local_id: String(bem.local_id),
        });
    };

    const cancelUserEdit = () => {
        setEditingUserId(null);
        setEditUsuario(emptyUser);
    };

    const cancelLocalEdit = () => {
        setEditingLocalId(null);
        setEditLocal(emptyLocal);
    };

    const cancelBemEdit = () => {
        setEditingBemId(null);
        setEditBem(emptyBem);
    };

    const handleUpdateUser = async (e, userId) => {
        e.preventDefault();
        try {
            const payload = {
                username: editUsuario.username,
                password: editUsuario.password || null,
            };
            const response = await api.put(`/users/${userId}`, payload);
            setUsuarios((currentUsers) =>
                sortByName(currentUsers.map((item) => (item.id === userId ? response.data : item)), "username")
            );
            const updatedOwnUsername = usuarioAtual?.id === userId && usuarioAtual?.username !== response.data.username;
            if (usuarioAtual?.id === userId) {
                setUsuarioAtual(response.data);
            }
            cancelUserEdit();
            if (updatedOwnUsername) {
                localStorage.removeItem("token");
                setStatusMessage("Seu usuario foi alterado. Faca login novamente.");
                setIsAuthenticated(false);
                return;
            }
            setStatusMessage(`Usuario ${response.data.username} atualizado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao atualizar usuario."));
        }
    };

    const handleDeleteUser = async (usuario) => {
        if (!window.confirm(`Excluir o usuario ${usuario.username}?`)) {
            return;
        }

        try {
            await api.delete(`/users/${usuario.id}`);
            setUsuarios((currentUsers) => currentUsers.filter((item) => item.id !== usuario.id));
            if (editingUserId === usuario.id) {
                cancelUserEdit();
            }
            setStatusMessage(`Usuario ${usuario.username} excluido com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao excluir usuario."));
        }
    };

    const handleUpdateLocal = async (e, localId) => {
        e.preventDefault();
        try {
            const response = await api.put(`/locais/${localId}`, editLocal);
            setLocais((currentLocais) =>
                sortByName(currentLocais.map((item) => (item.id === localId ? response.data : item)), "nome")
            );
            cancelLocalEdit();
            setStatusMessage(`Local ${response.data.nome} atualizado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao atualizar local."));
        }
    };

    const handleDeleteLocal = async (local) => {
        if (!window.confirm(`Excluir o local ${local.nome}?`)) {
            return;
        }

        try {
            await api.delete(`/locais/${local.id}`);
            setLocais((currentLocais) => currentLocais.filter((item) => item.id !== local.id));
            if (editingLocalId === local.id) {
                cancelLocalEdit();
            }
            setStatusMessage(`Local ${local.nome} excluido com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao excluir local."));
        }
    };

    const handleUpdateBem = async (e, bemId) => {
        e.preventDefault();
        try {
            const payload = {
                ...editBem,
                local_id: Number(editBem.local_id),
                valor_estimado: editBem.valor_estimado === "" ? null : Number(editBem.valor_estimado),
            };
            const response = await api.put(`/bens/${bemId}`, payload);
            setBens((currentBens) =>
                sortByName(currentBens.map((item) => (item.id === bemId ? response.data : item)), "nome")
            );
            cancelBemEdit();
            setStatusMessage(`Bem ${response.data.nome} atualizado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao atualizar bem."));
        }
    };

    const handleDeleteBem = async (bem) => {
        if (!window.confirm(`Excluir o bem ${bem.nome}?`)) {
            return;
        }

        try {
            await api.delete(`/bens/${bem.id}`);
            setBens((currentBens) => currentBens.filter((item) => item.id !== bem.id));
            if (editingBemId === bem.id) {
                cancelBemEdit();
            }
            setStatusMessage(`Bem ${bem.nome} excluido com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao excluir bem."));
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
                            <input type="text" placeholder="admin" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} required />
                        </label>
                        <label>
                            Senha
                            <input type="password" placeholder="Sua senha" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
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
                            <input type="text" placeholder="novo.usuario" value={novoUsuario.username} onChange={(e) => setNovoUsuario({ ...novoUsuario, username: e.target.value })} required />
                        </label>
                        <label>
                            Senha
                            <input type="password" placeholder="Minimo de 6 caracteres" value={novoUsuario.password} onChange={(e) => setNovoUsuario({ ...novoUsuario, password: e.target.value })} required />
                        </label>
                        <button type="submit">Cadastrar usuario</button>
                    </form>
                    <div className="list-stack">
                        {usuarios.map((usuario) => (
                            <div key={usuario.id} className="list-card list-card-column">
                                {editingUserId === usuario.id ? (
                                    <form className="panel-form compact-form" onSubmit={(e) => handleUpdateUser(e, usuario.id)}>
                                        <label>
                                            Usuario
                                            <input type="text" value={editUsuario.username} onChange={(e) => setEditUsuario({ ...editUsuario, username: e.target.value })} required />
                                        </label>
                                        <label>
                                            Nova senha
                                            <input type="password" placeholder="Opcional" value={editUsuario.password} onChange={(e) => setEditUsuario({ ...editUsuario, password: e.target.value })} />
                                        </label>
                                        <div className="actions-row">
                                            <button type="submit">Salvar</button>
                                            <button type="button" className="ghost-button" onClick={cancelUserEdit}>Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="card-copy">
                                            <strong>{usuario.username}</strong>
                                            <span>ID {usuario.id}</span>
                                        </div>
                                        <div className="actions-row">
                                            <button type="button" className="secondary-button" onClick={() => beginUserEdit(usuario)}>Editar</button>
                                            <button type="button" className="danger-button" onClick={() => handleDeleteUser(usuario)} disabled={usuarioAtual?.id === usuario.id}>
                                                Excluir
                                            </button>
                                        </div>
                                    </>
                                )}
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
                            <input type="text" placeholder="Templo Sede" value={novoLocal.nome} onChange={(e) => setNovoLocal({ nome: e.target.value })} required />
                        </label>
                        <button type="submit">Cadastrar local</button>
                    </form>
                    <div className="list-stack">
                        {locais.map((local) => (
                            <div key={local.id} className="list-card list-card-column">
                                {editingLocalId === local.id ? (
                                    <form className="panel-form compact-form" onSubmit={(e) => handleUpdateLocal(e, local.id)}>
                                        <label>
                                            Nome do local
                                            <input type="text" value={editLocal.nome} onChange={(e) => setEditLocal({ nome: e.target.value })} required />
                                        </label>
                                        <div className="actions-row">
                                            <button type="submit">Salvar</button>
                                            <button type="button" className="ghost-button" onClick={cancelLocalEdit}>Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="card-copy">
                                            <strong>{local.nome}</strong>
                                            <span>ID {local.id}</span>
                                        </div>
                                        <div className="actions-row">
                                            <button type="button" className="secondary-button" onClick={() => beginLocalEdit(local)}>Editar</button>
                                            <button type="button" className="danger-button" onClick={() => handleDeleteLocal(local)}>Excluir</button>
                                        </div>
                                    </>
                                )}
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
                            <input type="text" placeholder="Mesa do conselho" value={novoBem.nome} onChange={(e) => setNovoBem({ ...novoBem, nome: e.target.value })} required />
                        </label>
                        <label>
                            Identificador
                            <input type="text" placeholder="PLAQ-001" value={novoBem.identificador} onChange={(e) => setNovoBem({ ...novoBem, identificador: e.target.value })} />
                        </label>
                        <label>
                            Descricao
                            <textarea placeholder="Detalhes do bem" value={novoBem.descricao} onChange={(e) => setNovoBem({ ...novoBem, descricao: e.target.value })} />
                        </label>
                        <div className="row">
                            <label>
                                Tipo
                                <select value={novoBem.tipo} onChange={(e) => setNovoBem({ ...novoBem, tipo: e.target.value })}>
                                    <option value="movel">Movel</option>
                                    <option value="imovel">Imovel</option>
                                </select>
                            </label>
                            <label>
                                Valor estimado
                                <input type="number" min="0" step="0.01" placeholder="0,00" value={novoBem.valor_estimado} onChange={(e) => setNovoBem({ ...novoBem, valor_estimado: e.target.value })} />
                            </label>
                        </div>
                        <label>
                            Local
                            <select value={novoBem.local_id} onChange={(e) => setNovoBem({ ...novoBem, local_id: e.target.value })} required>
                                <option value="">Selecione o local</option>
                                {locais.map((local) => <option key={local.id} value={local.id}>{local.nome}</option>)}
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

                            if (editingBemId === bem.id) {
                                return (
                                    <div key={bem.id} className="inventory-card">
                                        <form className="panel-form compact-form" onSubmit={(e) => handleUpdateBem(e, bem.id)}>
                                            <label>
                                                Nome
                                                <input type="text" value={editBem.nome} onChange={(e) => setEditBem({ ...editBem, nome: e.target.value })} required />
                                            </label>
                                            <label>
                                                Identificador
                                                <input type="text" value={editBem.identificador} onChange={(e) => setEditBem({ ...editBem, identificador: e.target.value })} />
                                            </label>
                                            <label>
                                                Descricao
                                                <textarea value={editBem.descricao} onChange={(e) => setEditBem({ ...editBem, descricao: e.target.value })} />
                                            </label>
                                            <div className="row">
                                                <label>
                                                    Tipo
                                                    <select value={editBem.tipo} onChange={(e) => setEditBem({ ...editBem, tipo: e.target.value })}>
                                                        <option value="movel">Movel</option>
                                                        <option value="imovel">Imovel</option>
                                                    </select>
                                                </label>
                                                <label>
                                                    Valor estimado
                                                    <input type="number" min="0" step="0.01" value={editBem.valor_estimado} onChange={(e) => setEditBem({ ...editBem, valor_estimado: e.target.value })} />
                                                </label>
                                            </div>
                                            <label>
                                                Local
                                                <select value={editBem.local_id} onChange={(e) => setEditBem({ ...editBem, local_id: e.target.value })} required>
                                                    <option value="">Selecione o local</option>
                                                    {locais.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                                                </select>
                                            </label>
                                            <div className="actions-row">
                                                <button type="submit">Salvar</button>
                                                <button type="button" className="ghost-button" onClick={cancelBemEdit}>Cancelar</button>
                                            </div>
                                        </form>
                                    </div>
                                );
                            }

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
                                    <div className="actions-row">
                                        <button type="button" className="secondary-button" onClick={() => beginBemEdit(bem)}>Editar</button>
                                        <button type="button" className="danger-button" onClick={() => handleDeleteBem(bem)}>Excluir</button>
                                    </div>
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
