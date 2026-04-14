import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import LocalManagementPage from "./pages/LocalManagementPage";
import InventoryPage from "./pages/InventoryPage";
import Layout from "./layouts/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout>
                            <DashboardPage />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/users" element={
                    <ProtectedRoute>
                        <Layout>
                            <UserManagementPage />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/locais" element={
                    <ProtectedRoute>
                        <Layout>
                            <LocalManagementPage />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/inventario" element={
                    <ProtectedRoute>
                        <Layout>
                            <InventoryPage />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </Router>
    );
};

export default App;
