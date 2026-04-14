import React from "react";
import { Link } from "react-router-dom";

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <nav className="sidebar">
                <div className="sidebar-brand">
                    <strong>IPB Porto Velho</strong>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/">Dashboard</Link></li>
                    <li><Link to="/users">Usuários</Link></li>
                    <li><Link to="/locais">Locais</Link></li>
                    <li><Link to="/inventario">Inventário</Link></li>
                </ul>
            </nav>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
