import { BlobServiceClient } from "@azure/storage-blob";
import Cookies from "js-cookie";
import { ConversationRequest } from "./models";
import config from '../../config';
import msalInstance from '../msalConfig';

console.log("Initializing Blob Service Client with SAS token");

const sasToken = config.sasToken;
const blobServiceClient = new BlobServiceClient(`https://${config.storageAccountName}.blob.core.windows.net?${sasToken}`);

async function uploadFileToBlob(file: File): Promise<string> {
    console.log("Uploading file to blob");
    const containerClient = blobServiceClient.getContainerClient(config.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.name);
    await blockBlobClient.uploadBrowserData(file);
    console.log("File uploaded to blob:", blockBlobClient.url);
    return blockBlobClient.url;
}

export async function callConversationApi(options: ConversationRequest, abortSignal: AbortSignal): Promise<any> {
    console.log("Calling conversation API with options:", options);
    const accounts = msalInstance.getAllAccounts();
    const userId = accounts.length > 0 ? accounts[0].homeAccountId : "some-user-id";
    const fileUrl = Cookies.get('uploadedFileUrl') || "";

    const queryString = new URLSearchParams({
        query: options.messages[options.messages.length - 1].content,
        conversation_id: options.id || '', 
        user_id: userId,
        file_url: fileUrl
    }).toString();

    const response = await fetch(`${config.backendUrl}/ask?${queryString}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        signal: abortSignal
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    console.log("Received response from conversation API");
    return response.json();
}

export async function handleFileUpload(file: File): Promise<void> {
    const fileUrl = await uploadFileToBlob(file);
    console.log("Setting uploaded file URL in cookies:", fileUrl);
    Cookies.set('uploadedFileUrl', fileUrl, { expires: 7 });
}