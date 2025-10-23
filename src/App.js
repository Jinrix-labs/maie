import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import Blob from './components/Blob';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there 💙 I'm here to listen and support you. Whether you're having a tough day or just need someone to talk to, I'm here. How are you feeling today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  // Keep input focused after re-renders
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  });

  // Auto blink every 3 seconds (only when not hovered)
  useEffect(() => {
    if (isHovered) return; // Don't auto-blink when hovered

    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => {
        setBlinking(false);
      }, 200); // blink length
    }, 3000); // blink every 3 sec
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setBlinking(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setBlinking(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          system: `You are a compassionate AI companion designed to provide emotional support to people dealing with depression, anxiety, stress, and other mental health challenges. Your approach should be:

- Empathetic and non-judgmental
- Validating of their feelings
- Supportive without being dismissive
- Encouraging without toxic positivity
- Thoughtful about suggesting professional help when appropriate
- Using a warm, conversational tone
- Asking thoughtful follow-up questions to understand better
- Offering coping strategies when appropriate

Remember: You are NOT a replacement for professional mental health care. If someone expresses suicidal thoughts or severe crisis, gently encourage them to reach out to crisis resources like 988 (Suicide & Crisis Lifeline).

Keep responses concise but meaningful. Use simple language and avoid clinical jargon unless explaining something specific.`
        })
      });

      const data = await response.json();

      // Handle different response structures
      let assistantMessage;
      if (data.content && data.content[0] && data.content[0].text) {
        assistantMessage = data.content[0].text;
      } else if (data.error) {
        assistantMessage = `Error: ${data.error}. ${data.details || ''}`;
      } else {
        console.error('Unexpected API response structure:', data);
        assistantMessage = "I'm having trouble processing your request. Please try again.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div
          className="blob-stack"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="blob-glow"></div>
          <img
            src="/blob.png.png"
            alt="blob"
            className={`blob ${blinking ? "fade-out" : ""}`}
          />
          <img
            src="/blob-blink.png"
            alt="blob blink"
            className={`blob blink ${blinking ? "fade-in" : ""}`}
          />
        </div>
        <h1>💙 Your Companion</h1>
        <p className="tagline">A safe space to talk</p>
      </header>

      <main className="chat-section">
        <div className="messages">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={sendMessage}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
              placeholder="Type your message... (Press Enter to send)"
              disabled={isLoading}
              className="message-input"
              maxLength={1000}
            />
            {charCount > 0 && (
              <div className="char-counter">
                {charCount}/1000
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>

        <footer className="app-footer">
          <p className="disclaimer">
            ⚠️ This is a supportive companion, not a replacement for professional mental health care.
            If you're in crisis, please call 988 (Suicide & Crisis Lifeline).
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
