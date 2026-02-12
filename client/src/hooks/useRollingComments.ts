/**
 * [SYSTEM DESIGN]: Rolling Comment Engine Hook
 * 
 * This hook implements the "illusion of life" for the chat sidebar.
 * It maintains visual momentum by continuously cycling through a buffer
 * of pre-defined comments, creating the appearance of active viewer engagement.
 * 
 * Technical Implementation:
 * - Uses setInterval to inject comments every 2-4 seconds (randomized for realism)
 * - Implements circular buffer pattern: when reaching end of array, wraps to start
 * - Each comment gets a unique ID and timestamp for React key optimization
 * - Auto-scrolls to bottom to keep newest comments visible
 * 
 * This simulates a high-traffic live environment without requiring a real backend.
 */

import { useState, useEffect } from 'react';
import { Comment } from '../types';

/**
 * [SYSTEM DESIGN]: Pre-defined Comment Buffer
 * 
 * This array represents the "conversation simulation". In production, you would
 * replace this with real-time WebSocket messages from actual viewers.
 * 
 * The mix of technical Bitcoin terms, emojis, and casual language creates
 * authentic chat atmosphere.
 */
const COMMENT_TEMPLATES = [
  "Bullish on BTC! 🚀",
  "LFG ⚡",
  "Smooth stream quality 👌",
  "Stack sats, not regrets",
  "GM ☀️",
  "This is the way",
  "21 million club ₿",
  "HODL strong 💎🙌",
  "Lightning is the future",
  "Zap it! ⚡⚡⚡",
  "When Lambo? 🏎️",
  "Sound money only",
  "Fiat is a scam",
  "Not your keys, not your coins 🔑",
  "Second layer scaling FTW",
  "Thanks for the alpha 🧠",
  "Sat stacking intensifies",
  "Orange coin good 🍊",
  "Layer 2 go brrr",
  "Proof of work >>> Proof of stake"
];

const AUTHORS = [
  "SatoshisFan21",
  "LightningNode42",
  "BitcoinMaxi",
  "StackingSats",
  "HodlGang",
  "BTCWhale",
  "ZapMaster",
  "CryptoNinja",
  "MoonBoi",
  "DiamondHands"
];

export function useRollingComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * [SYSTEM DESIGN]: Maximum Comments Limit
   * Prevents unbounded array growth by keeping only the last 20 comments.
   * Older comments are automatically removed to maintain performance.
   */
  const MAX_COMMENTS = 20;

  /**
   * [SYSTEM DESIGN]: Rolling Comment Injection Loop
   * 
   * This effect implements the core "illusion" logic:
   * 1. Every 2-4 seconds (randomized), inject a new comment
   * 2. Pull from COMMENT_TEMPLATES using circular index
   * 3. When index reaches array length, wrap back to 0
   * 4. Maintain only last MAX_COMMENTS to prevent unbounded growth
   * 
   * The randomized interval prevents mechanical, predictable timing
   * that would break the illusion of real human interaction.
   */
  useEffect(() => {
    const injectComment = () => {
      /**
       * [SYSTEM DESIGN]: Circular Buffer Index Management
       * Modulo operator ensures we never go out of bounds.
       * This creates infinite looping behavior.
       */
      const templateIndex = currentIndex % COMMENT_TEMPLATES.length;
      const authorIndex = Math.floor(Math.random() * AUTHORS.length);

      const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random()}`,
        author: AUTHORS[authorIndex],
        text: COMMENT_TEMPLATES[templateIndex],
        timestamp: Date.now(),
        isZap: false
      };

      /**
       * [SYSTEM DESIGN]: Bounded Array Management
       * Keep only the most recent MAX_COMMENTS.
       * Slice off older comments to prevent memory bloat and scrolling issues.
       */
      setComments(prev => {
        const updated = [...prev, newComment];
        return updated.slice(-MAX_COMMENTS);
      });
      setCurrentIndex(prev => prev + 1);

      console.log(`[RollingComments] Injected comment ${templateIndex + 1}/${COMMENT_TEMPLATES.length}`);
    };

    /**
     * [SYSTEM DESIGN]: Randomized Timing for Realism
     * Interval varies between 2000-4000ms to simulate natural chat rhythm.
     * Users perceive this as authentic conversation flow.
     */
    const getRandomInterval = () => 2000 + Math.random() * 2000;

    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        injectComment();
        scheduleNext(); // Recursive scheduling with new random interval
      }, getRandomInterval());
    };

    scheduleNext();

    // Cleanup on unmount
    return () => clearTimeout(timeoutId);
  }, [currentIndex]);

  /**
   * [SYSTEM DESIGN]: Zap Comment Injection
   * Called externally when tip succeeds to show visual confirmation
   * in the chat stream. This creates immediate feedback loop for the user.
   * Also respects MAX_COMMENTS limit.
   */
  const addZapComment = (customMessage?: string) => {
    const zapComment: Comment = {
      id: `zap-${Date.now()}`,
      author: 'System',
      text: customMessage || '⚡ New tip received! ⚡',
      timestamp: Date.now(),
      isZap: true
    };

    setComments(prev => {
      const updated = [...prev, zapComment];
      return updated.slice(-MAX_COMMENTS);
    });
  };

  return {
    comments,
    addZapComment
  };
}
