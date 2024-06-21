import React, { useState } from "react";
import { Stack, TextField } from "@fluentui/react";
import { SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import MicrophoneIcon from "../../assets/mic-outline.svg";
import styles from "./QuestionInput.module.css";

interface Props {
  onSend: (question: string, documentContent?: string, documentName?: string) => void;
  disabled: boolean;
  placeholder?: string;
  clearOnSend?: boolean;
  setRecognizedText: (text: string) => void;
}

export const QuestionInput = ({
  onSend,
  disabled,
  placeholder,
  clearOnSend,
  setRecognizedText,
}: Props) => {
  const [question, setQuestion] = useState<string>("");
  const [documentContent, setDocumentContent] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");

  const sendQuestion = () => {
    if (disabled || (!question.trim() && !documentContent)) {
      return;
    }

    onSend(question, documentContent, documentName);

    if (clearOnSend) {
      setQuestion("");
      setDocumentContent("");
      setDocumentName("");
      setRecognizedText(""); // Clear recognizedText
    }
  };

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      sendQuestion();
    }
  };

  const onQuestionChange = (
    _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setQuestion(newValue || "");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDocumentContent(content);
        setDocumentName(file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Stack horizontal className={styles.questionInputContainer}>
      {/* Text Input Field */}
      <TextField
        className={styles.questionInputTextArea}
        placeholder={placeholder}
        multiline
        resizable={false}
        borderless
        value={question}
        onChange={(e, newValue) => {
          if (newValue !== undefined) {
            onQuestionChange(e, newValue);
            setRecognizedText(newValue);
          }
        }}
        onKeyDown={onEnterPress}
      />
      {documentName && (
        <div className={styles.uploadedFile}>
          <span>{documentName}</span>
        </div>
      )}
      <div className={styles.uploadAndSendContainer}>
        {/* Document Upload Input */}
        <div className={styles.questionInputMicrophone}>
          <label htmlFor="file-upload">
            <img
              src={MicrophoneIcon}
              className={styles.microphoneIcon}
              alt="Upload"
            />
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            className={styles.uploadInput}
            aria-label="Upload document button"
            style={{ display: "none" }} // Hide the actual file input
          />
        </div>

        {/* Send Button */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Ask question button"
          onClick={sendQuestion}
          onKeyDown={(e) =>
            e.key === "Enter" || e.key === " " ? sendQuestion() : null
          }
          className={styles.questionInputSendButtonContainer}
        >
          {disabled ? (
            <SendRegular className={styles.questionInputSendButtonDisabled} />
          ) : (
            <img
              src={Send}
              className={styles.questionInputSendButton}
              alt="Send"
            />
          )}
        </div>
      </div>
    </Stack>
  );
};

export default QuestionInput;