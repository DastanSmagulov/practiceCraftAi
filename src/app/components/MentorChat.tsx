import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import axios from "axios";

type Message = {
  text: string;
  sender: "user" | "mentor";
};

const MentorChat: React.FC<{ project: any; id: string }> = ({
  project,
  id,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentMentorMessage, setCurrentMentorMessage] = useState<string>("");
  const [messageQueue, setMessageQueue] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const projectId = id;

  // Load messages from local storage on component mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(`userMessages_${projectId}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [projectId]);

  // Save messages to local storage whenever messages state changes
  useEffect(() => {
    localStorage.setItem(`userMessages_${projectId}`, JSON.stringify(messages));
  }, [messages, projectId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (messageQueue.length > 0) {
      interval = setInterval(() => {
        setCurrentMentorMessage((prev) => prev + messageQueue[0]);
        setMessageQueue((prev) => prev.slice(1));
      }, 20); // Reduced delay for faster typing effect
    } else if (currentMentorMessage.length > 0 && isLoading) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: currentMentorMessage, sender: "mentor" },
      ]);
      setCurrentMentorMessage("");
      setIsLoading(false);
    }

    return () => clearInterval(interval);
  }, [messageQueue, currentMentorMessage, isLoading]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentMentorMessage]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = input;
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userMessage, sender: "user" },
      ]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await axios.post("/api/chat", {
          message: userMessage,
          project: project,
        });
        const mentorMessage = response.data.response;
        setMessageQueue(mentorMessage);
      } catch (error) {
        console.error("Error fetching mentor response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, I couldn't fetch a response from the mentor.",
            sender: "mentor",
          },
        ]);
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const parseTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-w-[40vw] py-8 mb-10 max-[350px]:mb-28 max-[350px]:mt-28 flex items-center max-sm:mb-16 justify-center text-white">
      <div className="w-full max-w-3xl bg-gray-900 rounded-lg shadow-lg p-4">
        <div
          ref={chatContainerRef}
          className="flex flex-col h-96 overflow-y-auto mb-4 space-y-4"
          style={{ maxHeight: "calc(100% - 5rem)" }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-[75%] ${
                  message.sender === "user" ? "bg-blue-500" : "bg-gray-800"
                } shadow-sm whitespace-pre-wrap break-words`}
              >
                <span className="text-lg">
                  {message.sender === "mentor"
                    ? parseTextWithLinks(message.text)
                    : message.text}
                </span>
              </div>
            </div>
          ))}
          {currentMentorMessage && (
            <div className="mb-2 text-left">
              <div className="inline-block p-3 rounded-lg bg-gray-800 shadow-sm whitespace-pre-wrap break-words max-w-[75%]">
                <span className="text-lg">
                  {parseTextWithLinks(currentMentorMessage)}
                </span>
              </div>
            </div>
          )}
          {isLoading && !currentMentorMessage && (
            <div className="flex items-center text-gray-400">
              Mentor is thinking...
            </div>
          )}
        </div>
        <div className="flex items-center max-md:flex-col max-md:gap-5">
          <input
            type="text"
            className="flex-1 p-4 bg-gray-700 md:rounded-l-lg max-md:w-full max-md:text-center focus:outline-none border-none placeholder-gray-400"
            placeholder="Ask mentor anything"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="p-4 bg-orange-500 text-white max-md:w-full md:rounded-r-lg hover:bg-orange-600 transition duration-300"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorChat;
