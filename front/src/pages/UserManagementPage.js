import React from "react";
import { useState, useEffect } from "react";
import api, { getApiErrorMessage } from "../api";

const UserManagementPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [canManageUsers, setCanManageUsers] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({ username: "", password: "" });
    const [editingUserId, setEditingUserId] = useState(null);
    const [editUsuario, setEditUsuario] = useState({ username: "", password: "" });
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const resUsuarios = await api.get("/users");
                setUsuarios(resUsuarios.data);
                setCanManageUsers(true);
            } catch (error) {
                if (error?.response?.status === 403) {
                    setCanManageUsers(false);
                } else {
                    console.error("Erro ao carregar usuários", error);
                }
            }
        };
        loadUsers();
    }, []);

    const sortByName = (items, field) => [...items].sort((a, b) => a[field].localeCompare(b[field]));

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/users", novoUsuario);
            setUsuarios((currentUsers) => sortByName([...currentUsers, response.data], "username"));
            setNovoUsuario({ username: "", password: "" });
            setStatusMessage(`Usuario ${response.data.username} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao cadastrar usuario."));
        }
    };

    const beginUserEdit = (usuario) => {
        setEditingUserId(usuario.id);
        setEditUsuario({ username: usuario.username, password: "" });
    };

    const cancelUserEdit = () => {
        setEditingUserId(null);
        setEditUsuario({ username: "", password: "" });
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
            cancelUserEdit();
            setStatusMessage(`Usuario ${response.data.username} atualizado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao atualizar usuario."));
        }
    };

    const handleDeleteUser = async (usuario) => {
        if (!window.confirm(`Excluir o usuario ${usuario.username}?`)) return;
        try {
            await api.delete(`/users/${usuario.id}`);
            setUsuarios((currentUsers) => currentUsers.filter((item) => item.id !== usuario.id));
            if (editingUserId === usuario.id) cancelUserEdit();
            setStatusMessage(`Usuario ${usuario.username} excluido com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao excluir usuario."));
        }
    };

    if (!canManageUsers) {
        return <p className="status-banner muted-banner">Seu usuario nao possui permissao para gerenciar outros usuarios.</p>;
    }

    return (
        <article className="panel">
            <div className="panel-heading">
                <h2>Cadastro de usuarios</h2>
                <span>{usuarios.length} usuario(s)</span>
            </div>
            {statusMessage && <p className="status-banner">{statusMessage}</p>}
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
                                    <button type="button" className="danger-button" onClick={() => handleDeleteUser(usuario)}>Excluir</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </article>
    );
};

export default UserManagementPage;
