import React, { useEffect, useState } from "react";
import { InputGroup, FormControl, Button, Container } from "react-bootstrap";
import "./styles/ChatInterface.css"; // Import the CSS file
import axios from "axios";
import store from "store2";
import robot from "./images/chatbot.png";
import user from "./images/user.png";

const ChatInterface: React.FC = () => {
  // All the messages in the chat. The even indexes are the user messages and the odd indexes are the AI messages. This could be better, but it's a simple example.
  const [messages, setMessages] = useState<string[]>([]);
  // The JSX elements to display in the chat
  // The current message the user is typing
  const [inputMessage, setInputMessage] = useState<string>("");

  // The chat server address
  const chatServer = "http://127.0.0.1:4567";

  /**
   * Update the input message when the user types
   * @param e the event of the input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  useEffect(() => {
    // Load the messages from the store
    const m = store.get("messages");
    if (m) {
      setMessages(m);
    }
  }, []);
  /**
   *
   * @param newMessage the new message to send to the server
   * @returns the response from the server
   */
  async function getResponse(newMessage: string): Promise<any> {
    return await axios({
      method: "POST",
      url: chatServer + "/chat", // the chat endpoint
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        message: newMessage, // the message to send
      },
    })
      .then((response) => {
        return response; // return the response
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * Reset the chat and clear the message history
   */
  const reset = () => {
    axios({
      method: "POST",
      url: chatServer + "/reset", // the reset endpoint
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log(response); // log the response
      })
      .catch((error) => {
        console.log(error);
      });
    setMessages([]); // clear the messages
    store.clear(); // clear the store
  };

  /**
   * Send the message to the server and get a response
   */
  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;
    const m = [...messages]; // copy the messages
    m.push(inputMessage); // add the message to the queue
    m.push("..."); // add the AI typing message
    setMessages(m); // update the messages
    getResponse(inputMessage).then((response) => {
      const p = m.slice(0, m.length - 1); // remove the AI typing message.
      const answer = JSON.stringify(response.data);
      const answer2 = JSON.parse(answer).data;
      p.push(answer2); // add the AI response
      setMessages(p); // update the messages
      store.set("messages", p); // save the messages to the store
    });
    setInputMessage(""); // clear the input message
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <Container className="wrapper">
        <h3>Chat with Sarcastic AI</h3>
        <section className="chat-interface">
          {messages.map((message, index) => (
            <figure
              key={index}
              className={`chat-item ${index % 2 === 0 ? "" : "alt"}`}
            >
              <img
                className={
                  index % 2 === 0 ? "chat-item_image" : "chat-item_image alt"
                }
                src={index % 2 === 0 ? user : robot}
                alt=""
              />
              <figcaption
                className={`chat-item_body ${index % 2 === 1 ? "alt" : ""}`}
              >
                {message}
              </figcaption>
            </figure>
          ))}
        </section>
        <section className="new-message">
          <InputGroup>
            <FormControl
              type="text"
              className="message-body"
              placeholder="Enter your message"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              id="message-input"
            />
            <Button
              variant="primary"
              className="message-button"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </InputGroup>
        </section>
      </Container>
      <div
        style={{
          paddingTop: "40px",
          display: "flex",
          width: "100%",
          height: "100px",
          alignItems: "middle",
        }}
      >
        <InputGroup className="mb-3" style={{ marginLeft: "40%" }}>
          <Button variant="warning" onClick={reset}>
            Reset
          </Button>
        </InputGroup>
      </div>
    </>
  );
};

export default ChatInterface;
