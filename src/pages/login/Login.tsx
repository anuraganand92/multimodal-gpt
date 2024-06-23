import React, { useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import styles from './Login.module.css';
import Logo from "../../assets/brand-logo.svg";

const Login = () => {
    const { instance } = useMsal();

    useEffect(() => {
        // Redirect to Entra ID login if user is not logged in
        if (!instance.getAllAccounts().length) {
            instance.loginRedirect();
        }
    }, [instance]);

    const handleLogin = () => {
        instance.loginRedirect();
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <img src={Logo} className={styles.logo} alt="Hanashi AI Logo" />
                <h1 className={styles.title}>Hanashi AI</h1>
                <form className={styles.form}>
                    <button className={styles.button} onClick={handleLogin} type="button">Login using your Microsoft Account</button>
                </form>
            </div>
        </div>
    );
};

export default Login;