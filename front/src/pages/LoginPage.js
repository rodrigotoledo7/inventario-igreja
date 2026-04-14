import React from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api";
import "../App.css";

const LoginPage = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = React.useState({ username: "", password: "" });
    const [statusMessage, setStatusMessage] = React.useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("username", loginData.username);
            formData.append("password", loginData.password);

            const response = await api.post("/login", formData);
            localStorage.setItem("token", response.data.access_token);
            setStatusMessage("");
            navigate("/");
        } catch (error) {
            alert(getApiErrorMessage(error, "Falha no login. Verifique as credenciais."));
        }
    };

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
};

export default LoginPage;
