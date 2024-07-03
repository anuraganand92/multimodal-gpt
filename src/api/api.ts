import { BlobServiceClient } from "@azure/storage-blob";
import Cookies from "js-cookie";
import { ConversationRequest } from "./models";
import config from '../../config';
import msalInstance from '../msalConfig';

console.log("Initializing Blob Service Client");

const blobServiceClient = new BlobServiceClient(`https://${config.storageAccountName}.blob.core.windows.net?${config.sasToken}`);

async function uploadFileToBlob(file: File): Promise<string> {
    console.log("Uploading file to blob");
    const containerClient = blobServiceClient.getContainerClient("doc-upload");
    const blockBlobClient = containerClient.getBlockBlobClient(file.name);
    await blockBlobClient.uploadBrowserData(file, {
        blobHTTPHeaders: { blobContentType: file.type }
    });
    console.log("File uploaded to blob:", blockBlobClient.url);
    return decodeURIComponent(blockBlobClient.url.split("?")[0]); // Remove SAS token from URL and decode spaces
}

export async function callConversationApi(options: ConversationRequest, abortSignal: AbortSignal): Promise<any> {
    console.log("Calling conversation API with options:", options);
    const accounts = msalInstance.getAllAccounts();
    const userId = accounts.length > 0 ? accounts[0].homeAccountId : "some-user-id";
    const fileUrl = Cookies.get('uploadedFileUrl') || "";

    const queryParams: Record<string, string> = {
        query: options.messages[options.messages.length - 1].content,
        user_id: userId,
    };

    if (fileUrl) {
        queryParams.file_url = decodeURIComponent(fileUrl.split("?")[0]); // Remove SAS token from URL and decode spaces
    }

    const queryString = new URLSearchParams(queryParams).toString();

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

export async function clearChat(userId: string): Promise<void> {
    const fileUrl = Cookies.get('uploadedFileUrl') || "";

    const queryParams: Record<string, string> = {
        user_id: userId,
    };

    if (fileUrl) {
        queryParams.file_url = decodeURIComponent(fileUrl.split("?")[0]); // Remove SAS token from URL and decode spaces
    }

    const queryString = new URLSearchParams(queryParams).toString();

    const response = await fetch(`${config.backendUrl}/logout?${queryString}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    console.log("Chat and file cleared");
    Cookies.remove('uploadedFileUrl'); // Reset the cookie after the API request
}