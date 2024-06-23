const config = {
  backendUrl: import.meta.env.VITE_AZURE_BACKEND_URL,
  storageAccountName: import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME,
  containerName: import.meta.env.VITE_AZURE_CONTAINER_NAME,
  sasToken: import.meta.env.VITE_AZURE_SAS_TOKEN,
};

export default config;