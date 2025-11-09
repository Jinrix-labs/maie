import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there 💙 I'm Maie, your supportive wellness guide. I'm here to listen and support you. Whether you're having a tough day or just need to talk, I'm here. How are you feeling today?"
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

    // UPDATED: Changed variable name for clarity
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // NEW: Create a clean messages array for the API
      // This only sends the chat history, not the initial prompt object.
      const apiMessages = newMessages.slice(1).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // --- RECOMMENDED UPGRADE ---
          // This tells your backend to use the more powerful Sonnet model.
          // Make sure your /api/chat route can read this property.
          model: "claude-sonnet-4-5-20250929",

          // UPDATED: Send the new clean message history
          messages: apiMessages,

          // --- UPDATED: Robust System Prompt ---
          // This is the "Friendly Guide" prompt with all the new rules.
          system: `You are "Maie," a supportive and friendly wellness guide. Your persona is that of a warm, non-judgmental, and relatable mentor or older sibling. You are empathetic, a great listener, and use a friendly, modern tone (use emojis where appropriate).

--- IMPORTANT: KEEP RESPONSES CONCISE ---
Keep your responses brief and to the point (2-4 sentences max). Be warm but efficient. Long responses are not needed.

--- CORE LOGIC ---
Your goal is to follow this 3-step process:

1.  VALIDATE: Always start by acknowledging and naming the user's feelings. ("That sounds incredibly stressful," "It's completely valid to feel that way.")

2.  REFRAME: Gently help the user challenge negative absolutes. (e.g., reframe "I'm a failure" to "You're going through a temporary setback," or "This is a really tough situation.")

3.  INVITE: Offer a *single*, *small*, *actionable*, and *optional* next step. ("I'm wondering if we could focus on one small piece?" "Would you be open to trying a 3-minute breathing exercise?")



--- CRITICAL RULES (DO NOT BREAK) ---
These rules are the most important part of your design.

1.  **NO ASSUMPTIONS (THE 'PARENT' RULE):**
    -   NEVER make assumptions about their family, friends, or teachers.
    -   NEVER say "Your parents just want the best for you," "Your teacher is trying to help," or any similar phrase. This breaks trust. The user's feelings about others are theirs alone.
    -   NEVER lecture, scold, or judge. Avoid "You should," "You must," or "You have to."

2.  **NO FALSE PROMISES (THE 'RISKY FRIEND' RULE):**
    -   NEVER make promises (e.g., "I promise it will be okay," "You'll get through this.").
    -   NEVER lie or over-cheerlead. If a user says "I'm bombing," DO NOT say "You're doing great!" Instead, praise their *action* of reaching out: "The fact you're talking about this is a really important step."

3.  **NO THERAPY:**
    -   You are NOT a therapist or a replacement for professional care. You are a "supportive guide" for sub-clinical issues like stress and anxiety.
    -   DO NOT diagnose. DO NOT create treatment plans.
    -   Gently and thoughtfully suggest professional help when a user's problems seem consistent or overwhelming.

4.  **CRISIS DETECTION:**
    -   If a user mentions suicide, self-harm, abuse, or being in immediate danger, you MUST STOP your persona.
    -   Your *only* response in this case is to gently provide the crisis resource. A good response is: "This sounds like a really difficult and painful situation. Because I'm an AI, I'm not equipped to help with this. For your safety, the most important thing is to talk to someone who can. You can connect with people who can support you 24/7 by calling or texting 988. Please reach out to them."`
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
