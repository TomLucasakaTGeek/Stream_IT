# ⚡ Lightning Stream MVP

A production-ready proof-of-concept live-streaming platform with Bitcoin Lightning Network payment integration. Built with React, TypeScript, Tailwind CSS, and WebLN.

## 🎯 Project Overview

This MVP demonstrates a content monetization model where viewers unlock premium HD video streams through instant Lightning micropayments. The application creates a high-fidelity "illusion" of a live streaming environment with:

- **Media Engine**: HD video player with blur-based paywall
- **Comment Engine**: Simulated real-time chat with rolling comments
- **Payment Layer**: WebLN integration for instant Bitcoin payments

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
├─────────────────────┬───────────────────────────────────┤
│   VideoPlayer       │        ChatSidebar                 │
│   (Media Engine)    │     (Comment Engine)               │
│                     │                                     │
│  - Blur Overlay     │  - Rolling Comments                │
│  - Unlock CTA       │  - Auto-scroll                     │
│  - Payment Trigger  │  - Zap Animations                  │
└──────────┬──────────┴──────────┬────────────────────────┘
           │                     │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │  LightningManager   │
           │  (Payment Layer)    │
           │                     │
           │  - WebLN Provider   │
           │  - Invoice Gen      │
           │  - Payment Execute  │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │   window.webln      │
           │  (Browser Wallet)   │
           │                     │
           │  - Alby Extension   │
           │  - Zeus Wallet      │
           │  - Other WebLN      │
           └─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A WebLN-compatible Lightning wallet:
  - [Alby Browser Extension](https://getalby.com/) (Recommended)
  - [Zeus Mobile Wallet](https://zeusln.app/)
  - Any WebLN-enabled wallet

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## 💡 Usage Flow

1. **Initial State**: Video is blurred with "Pay to Unlock" overlay
2. **User Action**: Click the "Pay with Lightning ⚡" button
3. **WebLN Prompt**: Browser wallet extension asks for permission
4. **Invoice Generation**: App generates 100 sat payment request
5. **Payment Approval**: User confirms payment in wallet
6. **Content Unlock**: Video blur is removed, zap animation plays in chat
7. **Session Persistence**: Unlock state saved to localStorage

## 📁 Project Structure

```
lightning-stream-mvp/
├── src/
│   ├── components/
│   │   ├── VideoPlayer.tsx      # Media engine with paywall
│   │   └── ChatSidebar.tsx      # Comment engine with rolling messages
│   ├── hooks/
│   │   └── useRollingComments.ts # Circular buffer comment injection
│   ├── services/
│   │   └── LightningManager.ts   # WebLN payment orchestration
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Main application orchestrator
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles + Tailwind
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔧 Technical Implementation

### Rolling Comment System

The chat sidebar uses a **circular buffer pattern** to simulate high-traffic engagement:

```typescript
// From useRollingComments.ts
const templateIndex = currentIndex % COMMENT_TEMPLATES.length;
```

- Comments inject every 2-4 seconds (randomized)
- When reaching end of array, wraps to start
- Creates infinite loop of authentic-looking chat

### Payment Flow

```typescript
// From App.tsx - Payment handler sequence
async handlePayment() {
  1. lightningManager.initialize()     // Connect WebLN provider
  2. lightningManager.generateInvoice() // Create payment request
  3. lightningManager.sendPayment()     // Execute transaction
  4. setIsPaid(true)                    // Unlock content
  5. addZapComment()                    // Visual confirmation
}
```

### State Management

The application uses React's built-in state management:

- `isPaid`: Controls video blur overlay
- `isLoading`: Prevents double-submission during payment
- `error`: User-friendly error messaging

## 🎨 UI/UX Design Decisions

### Dark Mode (Zinc-950)
- Reduces eye strain for long viewing sessions
- Makes Lightning yellow accent pop
- Industry standard for streaming platforms

### 75/25 Layout Split
- Video gets majority screen real estate (75%)
- Chat sidebar maintains presence (25%)
- Responsive grid stacks on mobile

### Blur Intensity
- `backdrop-blur-3xl` (48px radius) chosen for optimal obscuration
- Content remains visible enough to maintain interest
- Clear visual difference between locked/unlocked states

## 🔐 Security Considerations

### Current MVP Implementation
- Uses test invoice for demo purposes
- No backend validation (proof-of-concept only)
- LocalStorage persistence is client-side only

### Production Requirements
⚠️ **Do not deploy this as-is to production**

For a production deployment, you must:

1. **Backend Invoice Generation**
   ```typescript
   // Replace in LightningManager.ts
   const response = await fetch('/api/create-invoice', {
     method: 'POST',
     body: JSON.stringify({ amount: sats })
   });
   const { invoice } = await response.json();
   ```

2. **Payment Verification**
   - Verify preimage against invoice hash
   - Check payment amount matches expected value
   - Store payment proof in database

3. **Access Control**
   - Implement JWT or session tokens
   - Verify unlock status server-side
   - Use signed cookies to prevent tampering

4. **DRM for Video**
   - Encrypt video streams
   - Use HLS/DASH with token-based access
   - Implement time-limited access tokens

## 📊 Performance Optimizations

### Current Optimizations
- React.memo for components (if needed)
- Efficient re-renders with proper key props
- Auto-cleanup of intervals on unmount

### Future Enhancements
- Virtual scrolling for long comment lists
- Lazy loading of video segments
- WebSocket connection for real comments
- Service Worker for offline access

## 🧪 Testing

### Manual Testing Checklist

- [ ] WebLN not installed: Should show helpful error message
- [ ] Payment cancelled: Should allow retry
- [ ] Payment successful: Video unlocks, zap comment appears
- [ ] Page refresh: Unlock state persists via localStorage
- [ ] Mobile responsive: Layout stacks correctly
- [ ] Comment scroll: Auto-scrolls to newest messages
- [ ] Rolling comments: Cycles through full array

### Automated Testing (Future)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 🛠️ Troubleshooting

### "WebLN not available" Error
**Solution**: Install Alby browser extension or Zeus wallet

### Payment Fails Silently
**Issue**: Test invoice may not be accepted by all wallets  
**Solution**: Replace with real invoice from your Lightning node

### Video Won't Play
**Issue**: Browser autoplay policies  
**Solution**: Video is muted by default to allow autoplay

### Comments Not Scrolling
**Issue**: CSS overflow not working  
**Solution**: Check parent container has defined height

## 🚧 Known Limitations (MVP)

1. **Test Invoice Only**: Hardcoded invoice won't work on mainnet
2. **No Real Backend**: Invoice generation is simulated
3. **No Payment Verification**: Trust client-side unlock state
4. **Static Video**: Single MP4 file, not live streaming
5. **Simulated Chat**: Comments from pre-defined array
6. **No User Accounts**: No profile or history tracking

## 🗺️ Roadmap to Production

### Phase 1: Backend Integration
- [ ] Node.js + Express API
- [ ] LND or Core Lightning integration
- [ ] Invoice generation endpoint
- [ ] Payment verification webhook

### Phase 2: Real Streaming
- [ ] HLS/DASH video streaming
- [ ] CDN integration
- [ ] Multi-bitrate adaptive streaming
- [ ] Live encoder integration (OBS/FFmpeg)

### Phase 3: Chat System
- [ ] WebSocket real-time messaging
- [ ] User authentication
- [ ] Message moderation
- [ ] Emote/reaction support

### Phase 4: Advanced Features
- [ ] Streamer dashboard
- [ ] Analytics and earnings reports
- [ ] Subscription tiers
- [ ] VOD library
- [ ] Clip creation

## 📚 Resources

### WebLN Documentation
- [WebLN Guide](https://webln.guide/)
- [WebLN Dev Docs](https://webln.dev/)
- [Alby Documentation](https://guides.getalby.com/)

### Lightning Network
- [Lightning Network Explained](https://lightning.network/)
- [BOLT Specifications](https://github.com/lightning/bolts)
- [Lightning Labs Resources](https://docs.lightning.engineering/)

### React + TypeScript
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## 🤝 Contributing

This is a proof-of-concept MVP. For production use, please:

1. Implement proper backend validation
2. Add comprehensive error handling
3. Include unit and integration tests
4. Conduct security audit
5. Follow Lightning Network best practices

## 📄 License

MIT License - Feel free to use this as a starting point for your own project.

## 🙏 Acknowledgments

- Built with guidance from WebLN community
- Video streaming concepts from HLS.js and Video.js
- UI inspiration from Twitch and YouTube Live

---

**Built with ⚡ and ₿**
