import { Outlet, Link } from "react-router-dom";
import styles from "./Layout.module.css";
import Logo from "../../assets/brand-logo.svg";
import { Dialog, Stack, TextField } from "@fluentui/react";
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { CopyRegular } from "@fluentui/react-icons";

const Layout = ({ user }: { user: any }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false);
    const [copyClicked, setCopyClicked] = useState<boolean>(false);
    const [copyText, setCopyText] = useState<string>("Copy URL");
    const { instance } = useMsal();

    const handleDropdownClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        instance.logoutRedirect();
    };

    const handleShareClick = () => {
        setIsSharePanelOpen(true);
    };

    const handleSharePanelDismiss = () => {
        setIsSharePanelOpen(false);
        setCopyClicked(false);
        setCopyText("Copy URL");
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopyClicked(true);
    };

    useEffect(() => {
        if (copyClicked) {
            setCopyText("Copied URL");
        }
    }, [copyClicked]);

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Stack horizontal verticalAlign="center" className={styles.headerStack}>
                        <img
                            src={Logo}
                            className={styles.headerIcon}
                            aria-hidden="true"
                        />
                        <Link to="/" className={styles.headerTitleContainer}>
                            <h3 className={styles.headerTitle}>Hanashi AI</h3>
                        </Link>  
                    </Stack>
                    <div className={styles.userContainer} onClick={handleDropdownClick} tabIndex={0} role="button" aria-label="User menu">
                            <span className={styles.userName}>{user?.name}</span>
                            {isDropdownOpen && (
                                <div className={styles.dropdown}>
                                    <button className={styles.dropdownItem} onClick={handleShareClick}>Share</button>
                                    <button className={styles.dropdownItem} onClick={handleLogout}>Sign Out</button>
                                </div>
                            )}
                    </div>
                </div>
            </header>
            <Outlet />
            <Dialog 
                onDismiss={handleSharePanelDismiss}
                hidden={!isSharePanelOpen}
                styles={{
                    main: [{
                        selectors: {
                          ['@media (min-width: 480px)']: {
                            maxWidth: '600px',
                            background: "#FFFFFF",
                            boxShadow: "0px 14px 28.8px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.2)",
                            borderRadius: "8px",
                            maxHeight: '200px',
                            minHeight: '100px',
                          }
                        }
                      }]
                }}
                dialogContentProps={{
                    title: "Share the web app",
                    showCloseButton: true
                }}
            >
                <Stack horizontal verticalAlign="center" style={{gap: "8px"}}>
                    <TextField className={styles.urlTextBox} defaultValue={window.location.href} readOnly/>
                    <div 
                        className={styles.copyButtonContainer} 
                        role="button" 
                        tabIndex={0} 
                        aria-label="Copy" 
                        onClick={handleCopyClick}
                        onKeyDown={e => e.key === "Enter" || e.key === " " ? handleCopyClick() : null}
                    >
                        <CopyRegular className={styles.copyButton} />
                        <span className={styles.copyButtonText}>{copyText}</span>
                    </div>
                </Stack>
            </Dialog>
        </div>
    );
};

export default Layout;
