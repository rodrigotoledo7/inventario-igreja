import React from "react";
import { useState, useEffect } from "react";
import api, { getApiErrorMessage } from "../api";

const LocalManagementPage = () => {
    const [locais, setLocais] = useState([]);
    const [novoLocal, setNovoLocal] = useState({ nome: "" });
    const [editingLocalId, setEditingLocalId] = useState(null);
    const [editLocal, setEditLocal] = useState({ nome: "" });
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        const loadLocais = async () => {
            try {
                const resLocais = await api.get("/locais");
                setLocais(resLocais.data);
            } catch (error) {
                console.error("Erro ao carregar locais", error);
            }
        };
        loadLocais();
    }, []);

    const sortByName = (items, field) => [...items].sort((a, b) => a[field].localeCompare(b[field]));

    const handleCreateLocal = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/locais", novoLocal);
            setLocais((currentLocais) => sortByName([...currentLocais, response.data], "nome"));
            setNovoLocal({ nome: "" });
            setStatusMessage(`Local ${response.data.nome} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao cadastrar local."));
        }
    };

    const beginLocalEdit = (local) => {
        setEditingLocalId(local.id);
        setEditLocal({ nome: local.nome });
    };

    const cancelLocalEdit = () => {
        setEditingLocalId(null);
        setEditLocal({ nome: "" });
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
        if (!window.confirm(`Excluir o local ${local.nome}?`)) return;
        try {
            await api.delete(`/locais/${local.id}`);
            setLocais((currentLocais) => currentLocais.filter((item) => item.id !== local.id));
            if (editingLocalId === local.id) cancelLocalEdit();
            setStatusMessage(`Local ${local.nome} excluido com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao excluir local."));
        }
    };

    return (
        <article className="panel">
            <div className="panel-heading">
                <h2>Cadastro de locais</h2>
                <span>{locais.length} local(is)</span>
            </div>
            {statusMessage && <p className="status-banner">{statusMessage}</p>}
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
    );
};

export default LocalManagementPage;
