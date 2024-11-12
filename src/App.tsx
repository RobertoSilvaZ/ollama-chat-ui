import { Routes, Route, Navigate } from "react-router-dom";
import { ChatInterface } from "./components/ChatInterface";
import { NotFound } from "./components/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<ChatInterface />} />
      <Route path="/chat/:topicId" element={<ChatInterface />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
