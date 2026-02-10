/**
 * [SYSTEM DESIGN]: Comment Engine Component
 * 
 * The ChatSidebar creates the "illusion of life" by displaying the rolling
 * comment stream. It implements a standard chat UI pattern with:
 * - Fixed-height container to prevent page scrolling
 * - Auto-overflow scrolling within the sidebar
 * - Timestamp display for temporal context
 * - Visual differentiation for system messages (zaps)
 * - Fade-in animations for message injection
 * - Limited to most recent 20 comments
 * 
 * The component receives comments from the useRollingComments hook and
 * renders them in a bounded scroll container.
 */

import React from 'react';
import { Comment } from '../types';

interface ChatSidebarProps {
  comments: Comment[];
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  comments
}) => {
  /**
   * [SYSTEM DESIGN]: Timestamp Formatting
   * Converts Unix timestamp to human-readable time string.
   * Shows only hours:minutes for cleaner UI.
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
      {/**
       * [SYSTEM DESIGN]: Chat Header
       * Provides context and viewer count (simulated for MVP)
       */}
      <div className="bg-zinc-800 p-4 border-b border-zinc-700">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Live Chat
        </h3>
        <p className="text-zinc-400 text-sm mt-1">
          🟢 {Math.floor(Math.random() * 500) + 100} viewers
        </p>
      </div>

      {/**
       * [SYSTEM DESIGN]: Scrollable Message Container
       * - overflow-y-auto enables vertical scrolling
       * - flex-1 makes this container take all available height
       * - space-y-3 creates consistent vertical spacing between messages
       * - max-h-full prevents container from expanding beyond parent
       */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-full">
        {comments.length === 0 ? (
          /**
           * [SYSTEM DESIGN]: Empty State
           * Shows during initial load before first comment injection
           */
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p>Waiting for messages...</p>
          </div>
        ) : (
          comments.map((comment) => (
            /**
             * [SYSTEM DESIGN]: Individual Comment Rendering
             * Each comment is a card with author, timestamp, and message.
             * Zap comments get special styling with animation.
             * Added fade-in animation for smooth appearance.
             */
            <div
              key={comment.id}
              className={`p-3 rounded-lg transition-all duration-300 animate-fade-in ${
                comment.isZap
                  ? 'bg-lightning-yellow/20 border-2 border-lightning-yellow animate-zap'
                  : 'bg-zinc-800 hover:bg-zinc-750'
              }`}
            >
              {/* Author Header with Timestamp */}
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold text-sm ${
                  comment.isZap ? 'text-lightning-yellow' : 'text-zinc-300'
                }`}>
                  {comment.author}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatTime(comment.timestamp)}
                </span>
              </div>

              {/* Message Content */}
              <p className={`text-sm ${
                comment.isZap ? 'text-white font-bold' : 'text-zinc-100'
              }`}>
                {comment.text}
              </p>

              {/**
               * [SYSTEM DESIGN]: Zap Visual Enhancement
               * Lightning bolts appear on payment confirmation messages
               * to create immediate positive feedback
               */}
              {comment.isZap && (
                <div className="mt-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lightning-yellow animate-pulse">
                      ⚡
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/**
       * [SYSTEM DESIGN]: Chat Input (Visual Only)
       * Non-functional for MVP, but maintains UI authenticity.
       * In production, this would connect to a real-time messaging backend.
       */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Send a message... (demo mode)"
            disabled
            className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-700
                     cursor-not-allowed"
          />
          <button
            disabled
            className="px-4 py-2 bg-zinc-700 text-zinc-500 rounded-lg cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
