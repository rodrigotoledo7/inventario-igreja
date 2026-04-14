import React from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem("token");

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    return isAuthenticated ? children : null;
};

export default ProtectedRoute;
