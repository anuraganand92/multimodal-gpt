import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { MsalProvider, useIsAuthenticated, useMsal, useAccount } from "@azure/msal-react";
import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import msalInstance from "./msalConfig";

import "./index.css";

import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import Chat from "./pages/chat/Chat";
import Login from "./pages/login/Login";

initializeIcons();

const App = () => {
    const isAuthenticated = useIsAuthenticated();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    useEffect(() => {
        instance.handleRedirectPromise().catch((error) => {
            console.error(error);
        });
    }, [instance]);

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout user={account} />}>
                    <Route index element={<Chat />} />
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <MsalProvider instance={msalInstance}>
            <App />
        </MsalProvider>
    </React.StrictMode>
);