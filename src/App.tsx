import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ChatInterface } from './components/ChatInterface';
import { Gallery } from './components/Gallery';
import { ImageDetail } from './components/ImageDetail';
import { NotFound } from './components/NotFound';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <div className="flex">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            maxWidth: '500px',
            background: '#1f2937',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navigation />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/chat/:topicId" element={<ChatInterface />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:imageId" element={<ImageDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;