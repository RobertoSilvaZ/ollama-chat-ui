import React, { useState } from 'react';
import { Bot, User, Trash2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../db';

interface ChatMessageProps {
  message: Message;
  onDelete?: () => void;
  onResend?: () => void;
}

export function ChatMessage({ message, onDelete, onResend }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.isUser;

  return (
    <div
      className={`p-4 ${
        isUser ? 'bg-gray-800' : 'bg-gray-900'
      } relative group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isUser ? 'bg-blue-600' : 'bg-green-600'
            }`}
          >
            {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-white">
                {isUser ? 'You' : message.modelId}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(message.createdAt, { addSuffix: true })}
              </span>
            </div>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !bg-gray-800 !mt-2 !mb-2"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props} className={`${className} bg-gray-800 rounded px-1 py-0.5`}>
                        {children}
                      </code>
                    );
                  },
                  p: ({children}) => (
                    <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({children}) => (
                    <ul className="list-disc pl-4 mb-4 last:mb-0 space-y-2">{children}</ul>
                  ),
                  ol: ({children}) => (
                    <ol className="list-decimal pl-4 mb-4 last:mb-0 space-y-2">{children}</ol>
                  ),
                  li: ({children}) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-gray-600 pl-4 italic my-4">{children}</blockquote>
                  ),
                  h1: ({children}) => (
                    <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
                  ),
                  h2: ({children}) => (
                    <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
                  ),
                  h3: ({children}) => (
                    <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="absolute top-4 right-4 flex gap-2">
          {isUser && onResend && (
            <button
              onClick={onResend}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Resend message"
            >
              <RefreshCw size={20} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete message"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}