import { useState, useEffect } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import NewChatButton from './components/NewChatButton';
import HomePage from './components/HomePage';
import useChatManagement from './hooks/useChatManagement';
import './styles/Chat.css';

function App() {
  const {
    chats,
    setChats,
    activeChat,
    setActiveChat,
    showHomePage,
    setShowHomePage,
    handleNewChat,
    handleDeleteChat
  } = useChatManagement();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSavings, setTotalSavings] = useState({ cost: 0, co2: 0 });

  useEffect(() => {
    const costTotal = chats.reduce((sum, chat) => sum + (chat.costSavings || 0), 0);
    const co2Total = chats.reduce((sum, chat) => sum + (chat.carbonSavings || 0), 0);
    setTotalSavings({ cost: costTotal, co2: co2Total });
  }, [chats]);

  useEffect(() => {
    if (!activeChat) return;

    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/chat-history/${activeChat}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.context || []);
          
          if (data.context && data.context.length > 0 && data.context[0].role === 'user') {
            const firstMessage = data.context[0].content;
            const title = firstMessage.length > 20 ? firstMessage.substring(0, 20) + '...' : firstMessage;
            
            const contextDoc = await fetch(`http://localhost:5000/chat-history/${activeChat}`);
            const contextData = await contextDoc.json();
            
            setChats(prevChats => 
              prevChats.map(chat => 
                chat.id === activeChat ? { 
                  ...chat, 
                  title,
                  costSavings: contextData.cost || 0,
                  carbonSavings: contextData.co2 || 0
                } : chat
              )
            );
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [activeChat, setChats]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    if (!activeChat) {
      handleNewChat();
      return;
    }

    setLoading(true);
    const userMessage = { role: 'user', content: message };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          context_id: activeChat, 
          prompt: message 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = { 
          role: 'assistant', 
          content: data.response,
          costSavings: data.cost || 0,
          carbonSavings: data.co2 || 0
        };
        
        setMessages(prev => [...prev, assistantMessage]);

        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === activeChat ? { 
              ...chat, 
              title: messages.length === 0 ? 
                (message.length > 20 ? message.substring(0, 20) + '...' : message) : 
                chat.title,
              costSavings: data.cost || 0,
              carbonSavings: data.co2 || 0
            } : chat
          )
        );
      } else {
        console.error('Error sending message:', await response.json());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showHomePage) {
    return (
      <HomePage 
        onStartChat={() => {
          handleNewChat();
          setShowHomePage(false);
        }}
        totalSavings={totalSavings}
      />
    );
  }

  return (
    <div className="chat-container">
      <ChatSidebar 
        chats={chats} 
        activeChat={activeChat} 
        onSelectChat={setActiveChat}
        onDeleteChat={handleDeleteChat}
        onHome={() => setShowHomePage(true)}
      />
      <div className="chat-main">
        <div className="chat-header">
          <NewChatButton onNewChat={handleNewChat} />
          <h2>{chats.find(c => c.id === activeChat)?.title || 'New Chat'}</h2>
        </div>
        <ChatMessages messages={messages} loading={loading} />
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}

export default App;