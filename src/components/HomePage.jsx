import React from 'react';
import '../styles/HomePage.css';

function HomePage({ onStartChat, totalSavings }) {
  return (
    <div className="home-page">
      <div className="home-logo">
        <h1>Green Prompt</h1>
        <p>Smarter Prompts, Greener Planet</p>
      </div>
      <button className="start-chat-button" onClick={onStartChat}>
        Start a New Chat
      </button>
      <div className="home-footer">
        <p>Carbon emissions saved</p>
        <h2>{totalSavings?.co2 ? (totalSavings.co2 / 1000).toFixed(4) : '0.00'} kg CO<sub>2</sub></h2>
        {totalSavings?.cost > 0 && (
          <p className="cost-savings-home">Cost saved: ${totalSavings.cost.toFixed(4)}</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;