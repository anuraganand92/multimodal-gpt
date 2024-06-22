import { useRef, useState, useEffect } from "react";
import { Stack } from "@fluentui/react";
import { BroomRegular, DismissRegular, SquareRegular } from "@fluentui/react-icons";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

import styles from "./Chat.module.css";
import Logo from "../../assets/brand-logo.svg";

import {
  ChatMessage,
  ConversationRequest,
  callConversationApi,
  Citation,
  ChatResponse,
  ToolMessageContent,
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const Chat = () => {
  const lastQuestionRef = useRef<string>("");
  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [isCitationPanelOpen, setIsCitationPanelOpen] = useState<boolean>(false);
  const [answers, setAnswers] = useState<ChatMessage[]>([]);
  const abortFuncs = useRef<AbortController[]>([]);
  const [conversationId, setConversationId] = useState<string>(uuidv4());
  const [recognizedText, setRecognizedText] = useState<string>("");

  const makeApiRequest = async (question: string, documentContent?: string, documentName?: string) => {
    console.log("Sending question to API:", question); // Log the question
    lastQuestionRef.current = question;
    setRecognizedText(""); // Clear recognizedText before setting new question

    setIsLoading(true);
    setShowLoadingMessage(true);
    const abortController = new AbortController();
    abortFuncs.current.unshift(abortController);

    const userMessage: ChatMessage = {
      role: "user",
      content: question,
    };

    const request: ConversationRequest = {
      id: conversationId,
      messages: [...answers, userMessage],
    };

    const userId = "some-user-id"; // Replace with actual user ID
    const fileUrl = Cookies.get('uploadedFileUrl') || "";

    try {
      const result = await callConversationApi(request, abortController.signal);
      console.log("API call result:", result); // Log the result for debugging

      setShowLoadingMessage(false);
      if (result.error) {
        setAnswers(prevAnswers => [...prevAnswers, userMessage, { role: "error", content: result.error }]);
      } else {
        setAnswers(prevAnswers => [...prevAnswers, userMessage, { role: "assistant", content: result.response }]);
      }
    } catch (e) {
      if (!abortController.signal.aborted) {
        console.error("Error during API request:", e);
        alert("An error occurred. Please try again. If the problem persists, please contact the site administrator.");
      }
      setAnswers(prevAnswers => [...prevAnswers, userMessage]);
    } finally {
      setIsLoading(false);
      setShowLoadingMessage(false);
      abortFuncs.current = abortFuncs.current.filter((a) => a !== abortController);
    }
  };

  const clearChat = () => {
    lastQuestionRef.current = "";
    setActiveCitation(null);
    setAnswers([]);
    setConversationId(uuidv4());
  };

  const stopGenerating = () => {
    abortFuncs.current.forEach((a) => a.abort());
    setShowLoadingMessage(false);
    setIsLoading(false);
  };

  useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [showLoadingMessage, answers]);

  const onShowCitation = (citation: Citation) => {
    setActiveCitation(citation);
    setIsCitationPanelOpen(true);
  };

  const parseCitationFromMessage = (message: ChatMessage) => {
    if (message.role === "tool") {
      try {
        const toolMessage = JSON.parse(message.content) as ToolMessageContent;
        return toolMessage.citations;
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <div className={styles.container}>
      <Stack horizontal className={styles.chatRoot}>
        <div className={`${styles.chatContainer} ${styles.MobileChatContainer}`}>
          {!lastQuestionRef.current ? (
            <Stack className={styles.chatEmptyState}>
              <img src={Logo} className={styles.chatIcon} aria-hidden="true" />
              <h1 className={styles.chatEmptyStateTitle}>Start chatting</h1>
            </Stack>
          ) : (
            <div className={styles.chatMessageStream} style={{ marginBottom: isLoading ? "40px" : "0px" }}>
              {answers.map((answer, index) => (
                <div key={index}>
                  {answer.role === "user" ? (
                    <div className={styles.chatMessageUser}>
                      <div className={styles.chatMessageUserMessage}>
                        {answer.content.includes("Uploaded document:") ? (
                          <>
                            <div className={styles.uploadedFile}>
                              <span>{answer.content.split("\n\n")[0].replace("Uploaded document: ", "")}</span>
                              <span>Document</span>
                            </div>
                            <div>{answer.content.split("\n\n")[1]}</div>
                          </>
                        ) : (
                          answer.content
                        )}
                      </div>
                    </div>
                  ) : answer.role === "assistant" || answer.role === "error" ? (
                    <div className={styles.chatMessageGpt}>
                      <Answer
                        answer={{
                          answer: answer.role === "assistant" ? answer.content : "Sorry, an error occurred. Try refreshing the conversation or waiting a few minutes. If the issue persists, contact your system administrator. Error: " + answer.content,
                          citations: answer.role === "assistant" ? parseCitationFromMessage(answers[index - 1]) : [],
                        }}
                        onCitationClicked={(c) => onShowCitation(c)}
                        index={index}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
              {showLoadingMessage && (
                <div>
                  <div className={styles.chatMessageUser}>
                    <div className={styles.chatMessageUserMessage}>{lastQuestionRef.current}</div>
                  </div>
                  <div className={styles.chatMessageGpt}>
                    <Answer
                      answer={{
                        answer: "Generating answer...",
                        citations: [],
                      }}
                      onCitationClicked={() => null}
                      index={0}
                    />
                  </div>
                </div>
              )}
              <div ref={chatMessageStreamEnd} />
            </div>
          )}
          <Stack horizontal className={styles.chatInput}>
            {isLoading && (
              <Stack
                horizontal
                className={styles.stopGeneratingContainer}
                role="button"
                aria-label="Stop generating"
                tabIndex={0}
                onClick={stopGenerating}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? stopGenerating() : null)}
              >
                <SquareRegular className={styles.stopGeneratingIcon} aria-hidden="true" />
                <span className={styles.stopGeneratingText} aria-hidden="true">Stop generating</span>
              </Stack>
            )}
            <BroomRegular
              className={`${styles.clearChatBroom} ${styles.mobileclearChatBroom}`}
              style={{
                background: isLoading || answers.length === 0 ? "#BDBDBD" : "radial-gradient(109.81% 107.82% at 100.1% 90.19%, #bd0f7d 33.63%, #c32d96 70.31%, #dd8db9 100%)",
                cursor: isLoading || answers.length === 0 ? "" : "pointer",
              }}
              onClick={clearChat}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? clearChat() : null)}
              aria-label="Clear session"
              role="button"
              tabIndex={0}
            />
            <QuestionInput
              clearOnSend={true}
              placeholder="Type a new question..."
              disabled={isLoading}
              onSend={(question, documentContent, documentName) => makeApiRequest(question, documentContent, documentName)}
              setRecognizedText={setRecognizedText}
            />
          </Stack>
        </div>
        {answers.length > 0 && isCitationPanelOpen && activeCitation && (
          <Stack.Item className={`${styles.citationPanel} ${styles.mobileStyles}`}>
            <Stack horizontal className={styles.citationPanelHeaderContainer} horizontalAlign="space-between" verticalAlign="center">
              <span className={styles.citationPanelHeader}>Citations</span>
              <DismissRegular className={styles.citationPanelDismiss} onClick={() => setIsCitationPanelOpen(false)} />
            </Stack>
            <h5 className={`${styles.citationPanelTitle} ${styles.mobileCitationPanelTitle}`}>{activeCitation.title}</h5>
            <ReactMarkdown className={`${styles.citationPanelContent} ${styles.mobileCitationPanelContent}`} children={activeCitation.content} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} />
          </Stack.Item>
        )}
      </Stack>
    </div>
  );
};

export default Chat;