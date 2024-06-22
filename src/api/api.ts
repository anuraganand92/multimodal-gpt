import { ConversationRequest } from "./models";
import config from '../../config';

export async function callConversationApi(options: ConversationRequest, abortSignal: AbortSignal): Promise<any> {
    const url = new URL(`${config.backendUrl}/ask`);
    url.searchParams.append("query", options.messages[options.messages.length - 1].content); // Ensure the latest message content is used

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        signal: abortSignal
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
}