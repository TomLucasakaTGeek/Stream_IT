/**
 * [SYSTEM DESIGN]: Media Engine Component
 * 
 * The VideoPlayer is the central visual element. It implements a paywall pattern:
 * - When isPaid = false: Heavy blur overlay with "Pay to Unlock" CTA
 * - When isPaid = true: Full HD video with no restrictions
 * 
 * The blur effect uses Tailwind's backdrop-blur-3xl (48px blur radius) which
 * creates enough distortion to obscure content while maintaining visual interest.
 * 
 * For MVP purposes, we're using a direct MP4 link. In production, this would
 * connect to a video streaming service (HLS/DASH) with DRM protection.
 */

import React from 'react';

interface VideoPlayerProps {
  isPaid: boolean;
  onPayClick: () => void;
  isLoading: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  isPaid, 
  onPayClick, 
  isLoading 
}) => {
  /**
   * [SYSTEM DESIGN]: Video Source Selection
   * Using Pexels free stock video for demonstration.
   * Replace this URL with your actual streaming endpoint.
   */
  const videoUrl = "https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_30fps.mp4";

  return (
    <div className="relative w-full h-full bg-zinc-900 rounded-lg overflow-hidden">
      {/**
       * [SYSTEM DESIGN]: HTML5 Video Element
       * - autoPlay & muted ensure immediate playback (browser policy compliance)
       * - loop creates infinite playback for demo purposes
       * - playsInline prevents fullscreen on mobile
       */}
      <video
        className="w-full h-full object-cover"
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
      />

      {/**
       * [SYSTEM DESIGN]: Conditional Paywall Overlay
       * This overlay is the core of the "unlock" mechanic.
       * It's rendered conditionally based on payment state.
       */}
      {!isPaid && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-3xl bg-black/40">
          <div className="text-center space-y-6 p-8">
            {/* Lock Icon Visual Indicator */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-lightning-yellow/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-lightning-yellow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Paywall Messaging */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Premium Stream Locked
              </h2>
              <p className="text-zinc-300 text-lg">
                Unlock HD stream with a Lightning payment
              </p>
            </div>

            {/**
             * [SYSTEM DESIGN]: Primary CTA Button
             * This triggers the WebLN payment flow.
             * Disabled state during loading prevents double-submission.
             */}
            <button
              onClick={onPayClick}
              disabled={isLoading}
              className="px-8 py-4 bg-lightning-yellow text-black font-bold rounded-lg 
                       hover:bg-lightning-orange transition-all transform hover:scale-105 
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       flex items-center gap-2 mx-auto shadow-lg shadow-lightning-yellow/50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7L11 13L9 7L5 9L7 11L1 15L5 17L7 13L9 15L11 9L15 11L13 7Z" />
                  </svg>
                  Pay with Lightning ⚡
                </>
              )}
            </button>

            {/* Pricing Information */}
            <p className="text-sm text-zinc-400">
              100 sats (~$0.10 USD) • Instant unlock
            </p>
          </div>
        </div>
      )}

      {/**
       * [SYSTEM DESIGN]: Post-Payment Success Indicator
       * Shows subtle visual confirmation after unlock
       */}
      {isPaid && (
        <div className="absolute top-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg 
                        flex items-center gap-2 shadow-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold">Stream Unlocked</span>
        </div>
      )}
    </div>
  );
};
