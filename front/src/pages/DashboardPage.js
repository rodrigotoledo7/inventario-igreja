import React from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api";

const DashboardPage = () => {
    const navigate = useNavigate();
    const [usuarioAtual, setUsuarioAtual] = React.useState(null);
    const [stats, setStats] = React.useState({ users: 0, locais: 0, bens: 0 });

    React.useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [resPerfil, resUsers, resLocais, resBens] = await Promise.all([
                    api.get("/me"),
                    api.get("/users").catch(() => ({ data: [] })),
                    api.get("/locais"),
                    api.get("/bens"),
                ]);
                
                setUsuarioAtual(resPerfil.data);
                setStats({
                    users: resUsers.data.length,
                    locais: resLocais.data.length,
                    bens: resBens.data.length
                });
            } catch (error) {
                if (error?.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
        };
        loadDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <>
            <header className="hero">
                <div>
                    <p className="eyebrow">Primeira IPB de Porto Velho</p>
                    <h1>Controle de inventário</h1>
                    <p className="hero-copy">
                        Gerencie usuários de acesso, locais físicos e bens patrimoniais em uma única interface centralizada.
                    </p>
                </div>
                <div className="hero-actions">
                    <div className="current-user">
                        <span>Usuário logado</span>
                        <strong>{usuarioAtual?.username}</strong>
                    </div>
                    <button className="secondary-button" onClick={handleLogout}>Sair</button>
                </div>
            </header>

            <div className="dashboard-grid">
                <article className="panel">
                    <div className="card-copy">
                        <p className="eyebrow">Patrimônio</p>
                        <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.bens}</h2>
                        <p>Itens cadastrados no inventário total.</p>
                    </div>
                </article>
                <article className="panel">
                    <div className="card-copy">
                        <p className="eyebrow">Estrutura</p>
                        <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.locais}</h2>
                        <p>Locais e departamentos registrados.</p>
                    </div>
                </article>
                <article className="panel">
                    <div className="card-copy">
                        <p className="eyebrow">Segurança</p>
                        <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{stats.users}</h2>
                        <p>Usuários com acesso ao sistema.</p>
                    </div>
                </article>
            </div>
        </>
    );
};

export default DashboardPage;
