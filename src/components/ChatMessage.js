import React from 'react';
import './ChatMessage.css';

function ChatMessage({ message }) {
  return (
    <div className={`message ${message.role}`}>
      <div className="message-bubble">
        <p>{message.content}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
