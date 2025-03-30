import { useState } from 'react';

function useChatManagement() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showHomePage, setShowHomePage] = useState(true);

  const handleNewChat = () => {
    const newChatId = 'chat_' + Date.now();
    setChats(prevChats => [...prevChats, { id: newChatId, title: 'New Chat' }]);
    setActiveChat(newChatId);
    return newChatId;
  };

  const handleDeleteChat = async (chatId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this chat?')) {
        return;
      }
      
      const response = await fetch(`http://localhost:5000/delete-chat/${chatId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {

        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        if (activeChat === chatId) {
          const remainingChats = chats.filter(chat => chat.id !== chatId);
          if (remainingChats.length > 0) {
            setActiveChat(remainingChats[0].id);
          } else {
            setShowHomePage(true);
          }
        }
      } else {
        alert('Failed to delete chat. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Error deleting chat. Please try again.');
    }
  };

  // Update chat title
  const updateChatTitle = (context, chatId) => {
    if (context?.length > 0 && context[0].role === 'user') {
      const firstMessage = context[0].content;
      const title = firstMessage.length > 20 
        ? firstMessage.substring(0, 20) + '...' 
        : firstMessage;
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId ? { ...chat, title } : chat
        )
      );
    }
  };

  return {
    chats,
    setChats,
    activeChat,
    setActiveChat,
    showHomePage,
    setShowHomePage,
    handleNewChat,
    handleDeleteChat,
    updateChatTitle
  };
}

export default useChatManagement;