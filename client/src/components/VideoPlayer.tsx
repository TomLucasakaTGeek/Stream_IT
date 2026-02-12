/**
 * [SYSTEM DESIGN]: Content-First Video Player
 * 
 * Modern streaming UX: Video is the hero, always visible and playing.
 * No paywalls, no blur overlays - content is free to watch.
 * Monetization happens through optional tips (like YouTube Super Chat).
 * 
 * Key Design Principles:
 * - Auto-play on mount (muted for browser policy compliance)
 * - Clean, minimal UI that doesn't compete with content
 * - Optional viewer count and stream metadata
 */

import React from 'react';

interface VideoPlayerProps {
  onTipClick: () => void;
  isProcessingTip: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  onTipClick,
  isProcessingTip
}) => {
  /**
   * [SYSTEM DESIGN]: Video Source Selection
   * Using Pexels free stock video for demonstration.
   * In production, replace with HLS/DASH streaming endpoint.
   */
  const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

  return (
    <div className="w-full h-full bg-zinc-950 rounded-lg overflow-hidden flex flex-col">
      {/**
       * [SYSTEM DESIGN]: Main Video Container
       * No overlays, no paywalls - just pure content.
       */}
      <div className="relative flex-1 bg-zinc-900">
        <video
          className="w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Live Indicator Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1.5 rounded-md shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="font-bold text-sm">LIVE</span>
        </div>

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-md backdrop-blur-sm">
          <span className="text-sm font-medium">
            👁️ {Math.floor(Math.random() * 500) + 250} watching
          </span>
        </div>
      </div>

      {/**
       * [SYSTEM DESIGN]: Stream Metadata Bar
       * Title, creator info, and action buttons below video
       */}
      <div className="bg-zinc-900 p-4 space-y-3">
        {/* Stream Title */}
        <div>
          <h2 className="text-white font-bold text-lg">
            Lightning Demo Stream
          </h2>
          <p className="text-zinc-400 text-sm">
            Live coding session •  Integration Tutorial
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          {/**
           * [SYSTEM DESIGN]: Tip/Zap Button
           * Styled like YouTube "Thanks" or Twitch "Subscribe"
           * Non-intrusive, secondary action - content is free
           */}
          <button
            onClick={onTipClick}
            disabled={isProcessingTip}
            className="px-6 py-2.5 bg-lightning-yellow text-black font-bold rounded-lg 
                     hover:bg-lightning-orange transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2 shadow-md"
          >
            {isProcessingTip ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7L11 13L9 7L5 9L7 11L1 15L5 17L7 13L9 15L11 9L15 11L13 7Z" />
                </svg>
                Zap Creator ⚡
              </>
            )}
          </button>

          {/* Share Button */}
          <button className="px-4 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          {/* More Options */}
          <button className="px-4 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Stream Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs">
            #Bitcoin
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs">
            #Lightning
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs">
            #WebLN
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs">
            #LiveCoding
          </span>
        </div>
      </div>
    </div>
  );
};
