import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChatInterface } from './components/ChatInterface';
import { Gallery } from './components/Gallery';
import { NotFound } from './components/NotFound';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <div className="flex">
      <Navigation />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/chat/:topicId" element={<ChatInterface />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;