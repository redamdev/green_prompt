import '../styles/Sidebar.css';

function ChatSidebar({ chats, activeChat, onSelectChat, onDeleteChat, onHome }) {

  const formatCost = (cost) => {
    return cost ? `$${cost.toFixed(4)}` : '$0.00';
  };

  const formatCO2 = (co2) => {
    return co2 ? `${co2.toFixed(4)} kg` : '0 kg';
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h2>Chats</h2>
        {onHome && (
            <button className="home-button" onClick={onHome}>
            Home
            </button>
        )}
        </div>
      
      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="no-chats">No chats yet</div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${chat.id === activeChat ? 'active' : ''}`}
            >
              <div 
                className="chat-item-content"
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="chat-item-title">{chat.title}</div>
                {(chat.costSavings > 0 || chat.carbonSavings > 0) && (
                  <div className="chat-savings">
                    {chat.costSavings > 0 && (
                      <span className="cost-savings">Saved: {formatCost(chat.costSavings)}</span>
                    )}
                    {chat.carbonSavings > 0 && (
                      <span className="carbon-savings">CO2: {formatCO2(chat.carbonSavings)}</span>
                    )}
                  </div>
                )}
              </div>
              <button 
                className="chat-delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                aria-label="Delete chat"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;