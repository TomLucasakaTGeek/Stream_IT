/**
 * [SYSTEM DESIGN]: Live Chat Component with Sliding Window
 * * Implements a Twitch-style chat sidebar with:
 * - Fixed height container (flex: 1) that never expands the page
 * - Sliding window: MAX_COMMENTS (20) visible at once
 * - Oldest comments automatically removed when new ones arrive
 * - Smooth scroll-to-bottom on new messages
 * - Clean, minimal design that doesn't compete with video
 */

import React, { useEffect, useRef } from 'react';
import { Comment } from '../types';

interface ChatSidebarProps {
  comments: Comment[];
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  comments
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  /**
   * [SYSTEM DESIGN]: Timestamp Formatting
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  /**
   * [SYSTEM DESIGN]: Smart Auto-Scroll
   */
  useEffect(() => {
    if (chatContainerRef.current && shouldAutoScrollRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  /**
   * [SYSTEM DESIGN]: Scroll Detection
   */
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    shouldAutoScrollRef.current = isAtBottom;
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
      {/* Chat Header */}
      <div className="bg-zinc-800 p-4 border-b border-zinc-700">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Live Chat
        </h3>
        <p className="text-zinc-400 text-sm mt-1">
          💬 {comments.length} messages
        </p>
      </div>

      {/* Scrollable Message Container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {comments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-20">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-zinc-600 mt-1">Be the first to chat!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-2.5 rounded-lg transition-all duration-200 animate-fade-in ${
                comment.isZap
                  ? 'bg-orange-500/10 border-l-4 border-orange-500'
                  : 'bg-zinc-800/50 hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold text-xs ${
                  comment.isZap ? 'text-orange-500' : 'text-zinc-300'
                }`}>
                  {comment.author}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatTime(comment.timestamp)}
                </span>
              </div>

              <p className={`text-sm leading-relaxed ${
                comment.isZap ? 'text-white font-medium' : 'text-zinc-100'
              }`}>
                {comment.text}
              </p>

              {comment.isZap && (
                <div className="mt-1.5 flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="text-orange-500 text-sm animate-pulse">
                      ⚡
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Input Area (View-only for MVP) */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Say something..."
            className="flex-1 px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700
                     focus:outline-none focus:border-orange-500/50 transition-colors
                     placeholder-zinc-500 text-sm cursor-not-allowed"
            disabled
          />
          <button
            disabled
            className="px-4 py-2 bg-zinc-700 text-zinc-500 rounded-lg text-sm font-medium
                     cursor-not-allowed"
          >
            Chat
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2 text-center">
          Chat is view-only in demo mode
        </p>
      </div>
    </div>
  );
};