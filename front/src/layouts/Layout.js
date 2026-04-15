import React from "react";
import { NavLink } from "react-router-dom";

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <nav className="sidebar">
                <div className="sidebar-brand">
                    <strong>IPB Porto Velho</strong>
                </div>
                <ul className="sidebar-menu">
                    <li><NavLink to="/" end>Dashboard</NavLink></li>
                    <li><NavLink to="/users">Usuários</NavLink></li>
                    <li><NavLink to="/locais">Locais</NavLink></li>
                    <li><NavLink to="/inventario">Inventário</NavLink></li>
                </ul>
            </nav>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
