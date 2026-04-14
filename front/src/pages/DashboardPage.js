import React from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api";

const DashboardPage = () => {
    const navigate = useNavigate();
    const [usuarioAtual, setUsuarioAtual] = React.useState(null);

    React.useEffect(() => {
        const loadProfile = async () => {
            try {
                const resPerfil = await api.get("/me");
                setUsuarioAtual(resPerfil.data);
            } catch (error) {
                if (error?.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
        };
        loadProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
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
    );
};

export default DashboardPage;
