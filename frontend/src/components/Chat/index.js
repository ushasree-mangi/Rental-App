
import { useState } from 'react';
import './index.css'

const Chat=(props)=>{

    const {currentChatDetails}=props
    const {chatId, propertyTitle,username}=currentChatDetails
    const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { sender: "You", text: input }]);
      setInput("");
    }
  };

    return (
        <>
       
        <div className="chat-page">
            <div className="chat-header">Chat Room <p>{username}</p><p>{propertyTitle}</p></div>
                <div className="chat-body">
                    {messages.map((message, index) => (
                    <div key={index} className="chat-message">
                        <span className="sender">{message.sender}:</span>
                        <span className="message-text">{message.text}</span>
                    </div>
                    ))}
                </div>
                <div className="chat-footer">
                    <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="chat-input"
                    />
                    <button onClick={handleSendMessage} className="send-button">
                    Send
                    </button>
                </div>
        </div>
  
        </>
    )

}

export default Chat