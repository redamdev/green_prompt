import { useEffect, useRef } from 'react';
import '../styles/Messages.css';

function ChatMessages({ messages, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    if (num < 0.001) return '<0.001';
    return num.toFixed(4);
  };

  return (
    <div className="chat-messages">
      {messages.length === 0 && (
        <div className="empty-chat">
          <div className="empty-chat-icon">i</div>
          <h3>Start a new conversation</h3>
          <p>Ask anything, get answers instantly</p>
        </div>
      )}
      
      {messages.map((message, index) => (
        <div key={index}>
          <div 
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="message-content">{message.content}</div>
          </div>
          
          {message.role === 'assistant' && (message.costSavings > 0 || message.carbonSavings > 0) && (
            <div className="savings-breakdown">
              <div className="savings-icon">💰</div>
              <div className="savings-details">
                {message.costSavings > 0 && (
                  <div className="cost-saved">
                    <span>Cost saved: </span>
                    <span className="savings-value">${formatNumber(message.costSavings)}</span>
                  </div>
                )}
                {message.carbonSavings > 0 && (
                  <div className="carbon-saved">
                    <span>CO₂ reduced: </span>
                    <span className="savings-value">{formatNumber(message.carbonSavings)} kg</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {loading && (
        <div className="message assistant-message">
          <div className="message-avatar">AI</div>
          <div className="message-content typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessages;