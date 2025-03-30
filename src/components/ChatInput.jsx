import { useState } from 'react';
import '../styles/Chat.css';

function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !message.trim()}>
        <span className="send-icon">→</span>
      </button>
    </form>
  );
}

export default ChatInput;