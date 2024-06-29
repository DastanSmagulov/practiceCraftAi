"use client";
import { useState, ChangeEvent, KeyboardEvent } from "react";

type Message = {
  text: string;
  sender: "user" | "mentor";
};

const MentorChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");

      // Simulate AI response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "This is a response from the Mentor AI.", sender: "mentor" },
        ]);
      }, 1000);
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

  return (
    <div className="h-[70vh] flex items-center justify-center text-white">
      <div className="w-full bg-gray-800 rounded-lg shadow-lg">
        <div className="flex flex-col h-96 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.sender === "user" ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 p-4 bg-gray-700 rounded-l-lg focus:outline-none"
            placeholder="Ask mentor anything"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="p-4 bg-white text-gray-900 rounded-r-lg"
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
