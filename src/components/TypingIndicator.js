import React from 'react';
import './TypingIndicator.css';

function TypingIndicator() {
  return (
    <div className="message assistant">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export default TypingIndicator;
