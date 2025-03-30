function NewChatButton({ onNewChat }) {
    return (
      <button className="new-chat-button" onClick={onNewChat}>
        <span className="plus-icon"></span>
        New Chat
      </button>
    );
  }
  
  export default NewChatButton;