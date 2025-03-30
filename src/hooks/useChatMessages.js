import { useState, useEffect, useRef } from 'react';

function useChatMessages(activeChat, updateChatTitle, setChats) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchedChatRef = useRef(null);


  useEffect(() => {

    if (!activeChat) return;
    
    if (isFetchingRef.current && lastFetchedChatRef.current === activeChat) return;
    
    const controller = new AbortController();
    
    const fetchChatHistory = async () => {
      
      isFetchingRef.current = true;
      lastFetchedChatRef.current = activeChat;
      
      try {
        const response = await fetch(
          `http://localhost:5000/chat-history/${activeChat}`,
          { signal: controller.signal }
        );
        
        
        if (controller.signal.aborted) return;
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data.context || []);
          
          
          if (data.context && data.context.length > 0) {
            
            updateChatTitle(data.context, activeChat);
          }
        }
      } catch (error) {
        
        if (error.name !== 'AbortError') {
          console.error('Error fetching chat history:', error);
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchChatHistory();
    
    return () => {
      controller.abort();
    };
  }, [activeChat]); 

 
    const handleSendMessage = async (message, activeChat, handleNewChat) => {
    if (!message.trim()) return;
    
    
    if (!activeChat) {
      handleNewChat();
      return;
    }

    setLoading(true);
    
    setMessages(prev => [...prev, { role: 'user', content: message }]);

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
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        
        if (messages.length === 0) {
          const title = message.length > 20 ? message.substring(0, 20) + '...' : message;
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === activeChat ? { 
                ...chat, 
                title,
                costSavings: data.calc?.[0] || 0,
                carbonSavings: data.calc?.[1] || 0
              } : chat
            )
          );
        }
      } else {
        console.error('Error sending message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    loading,
    handleSendMessage
  };
}

export default useChatMessages;