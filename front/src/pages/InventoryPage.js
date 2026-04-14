import React from "react";
import { useState, useEffect } from "react";
import api, { getApiErrorMessage } from "../api";

const InventoryPage = () => {
    const [bens, setBens] = useState([]);
    const [locais, setLocais] = useState([]);
    const [novoBem, setNovoBem] = useState({
        nome: "",
        descricao: "",
        tipo: "movel",
        valor_estimado: "",
        identificador: "",
        local_id: "",
    });
    const [editingBemId, setEditingBemId] = useState(null);
    const [editBem, setEditBem] = useState({
        nome: "",
        descricao: "",
        tipo: "movel",
        valor_estimado: "",
        identificador: "",
        local_id: "",
    });
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resBens, resLocais] = await Promise.all([
                    api.get("/bens"),
                    api.get("/locais"),
                ]);
                setBens(resBens.data);
                setLocais(resLocais.data);
            } catch (error) {
                console.error("Erro ao carregar inventário", error);
            }
        };
        loadData();
    }, []);

    const sortByName = (items, field) => [...items].sort((a, b) => a[field].localeCompare(b[field]));

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
            setNovoBem({
                nome: "",
                descricao: "",
                tipo: "movel",
                valor_estimado: "",
                identificador: "",
                local_id: "",
            });
            setStatusMessage(`Bem ${response.data.nome} cadastrado com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao adicionar bem."));
        }
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

    const cancelBemEdit = () => {
        setEditingBemId(null);
        setEditBem({
            nome: "",
            descricao: "",
            tipo: "movel",
            valor_estimado: "",
            identificador: "",
            local_id: "",
        });
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
        if (!window.confirm(`Excluir o bem ${bem.nome}?`)) return;
        try {
            await api.delete(`/bens/${bem.id}`);
            setBens((currentBens) => currentBens.filter((item) => item.id !== bem.id));
            if (editingBemId === bem.id) cancelBemEdit();
            setStatusMessage(`Bem ${bem.nome} excluido com sucesso.`);
        } catch (error) {
            alert(getApiErrorMessage(error, "Erro ao excluir bem."));
        }
    };

    return (
        <div className="inventory-layout">
            <article className="panel">
                <div className="panel-heading">
                    <h2>Cadastro de bens</h2>
                    <span>{bens.length} item(ns)</span>
                </div>
                {statusMessage && <p className="status-banner">{statusMessage}</p>}
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
        </div>
    );
};

export default InventoryPage;
