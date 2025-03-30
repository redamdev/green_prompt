const API_BASE_URL = 'http://localhost:5000';

export async function fetchChatHistory(chatId) {
  const response = await fetch(`${API_BASE_URL}/chat-history/${chatId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }
  return response.json();
}

export async function sendMessage(chatId, message) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      context_id: chatId, 
      prompt: message 
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}

export async function deleteChat(chatId) {
  const response = await fetch(`${API_BASE_URL}/delete-chat/${chatId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete chat');
  }
  
  return response.json();
}