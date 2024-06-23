import { Configuration, PublicClientApplication } from "@azure/msal-browser";

const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_ID_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_ID_TENANT_ID}`,
        redirectUri: window.location.origin, // frontend URL
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you're having issues on IE11 or Edge
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
