# StreamBit - Bitcoin Powered Live Streaming App ⚡📺

StreamBit is a decentralized-first, Value-for-Value (V4V) live streaming platform. It enables creators to receive real-time Bitcoin tips (Zaps) directly from their audience via the Lightning Network, utilizing the WebLN standard for a non-custodial, seamless experience.

## 🚀 Proof of Work (MVP Features)
* **WebLN Integration:** Deep integration with Alby and other WebLN providers for instant, non-custodial Bitcoin tipping.
* **Live Stream Core:** Low-latency video playback synchronized with a real-time interaction layer.
* **V4V Interaction Layer:** A "Sliding Window" chat architecture that handles high-concurrency message streams alongside payment events.
* **Zero-Interruption UX:** Optimized tipping flow that allows users to support creators without navigating away from the content.

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Tailwind CSS
* **Bitcoin Layer:** WebLN (Lightning Network)
* **State Management:** React Hooks for real-time UI updates
* **Environment:** Vite-based builds for high-performance development

## 🏗️ Technical Implementation Note
The current build focuses on the **functional core** of Bitcoin payments and stream synchronization. It demonstrates the "last mile" of Lightning Network integration—handling asynchronous payment requests while maintaining a consistent application state.

---

## 🗺️ Roadmap & Future Development
I am actively developing BitStream to transition from a recordable MVP to a production-ready platform.

### 🎨 UI/UX Refinement
* **CSS Architecture Overhaul:** Refactoring current layout "quick-fixes" into a robust, responsive design system.
* **Mobile Optimization:** Ensuring the streaming and tipping interface is fluid across all device types.

### 🏠 Platform Expansion
* **Discovery Home Page:** A curated landing page to showcase active streamers and top-trending "Zapped" content.
* **Creator Dashboard:** A comprehensive analytics suite for streamers to track their Bitcoin earnings, audience engagement, and stream health.
* **On-Chain/L2 History:** A dedicated "Transaction Ledger" for users to view their tipping history and impact.

### 🔒 Security & Performance
* **Performance Profiling:** Optimizing the React rendering cycle for high-traffic chat environments.
* **Enhanced Wallet Logic:** Adding support for more Bitcoin-native authentication methods (LNURL-auth).

---

## ⚡ Quick Start
1.  **Clone the repo:** `git clone https://github.com/TomLucasakaTGeek/Stream_IT.git`
2.  **Install dependencies:** `npm install`
3.  **Run Development Server:** `npm run dev`
4.  **Note:** Ensure you have a WebLN-enabled wallet (like [Alby](https://getalby.com/)) installed in your browser to test the tipping features.

---
**Author:** Tanmay Khanna  
*Built for the Bitcoin Ecosystem*
