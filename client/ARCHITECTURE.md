# System Architecture Documentation

## Overview

This document provides an in-depth explanation of the Lightning Stream MVP's architecture, design patterns, and technical decisions.

## Core Design Principles

### 1. Separation of Concerns

The application is divided into three distinct layers:

```
┌─────────────────────────────────────┐
│      Presentation Layer              │
│  (VideoPlayer, ChatSidebar)          │
│  - UI rendering                      │
│  - User interaction handling         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Business Logic Layer            │
│  (App.tsx, useRollingComments)       │
│  - State management                  │
│  - Event orchestration               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Service Layer                   │
│  (LightningManager)                  │
│  - External API integration          │
│  - WebLN protocol handling           │
└──────────────────────────────────────┘
```

**Benefits:**
- Easy to test individual layers
- Changes in one layer don't cascade
- Clear responsibility boundaries

### 2. Type Safety First

All data structures use TypeScript interfaces:

```typescript
interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  isZap?: boolean;
}
```

**Benefits:**
- Compile-time error detection
- IntelliSense autocomplete
- Self-documenting code
- Refactoring confidence

### 3. Reactive State Management

State flows unidirectionally:

```
User Action → State Update → UI Re-render
```

**Example:**
```typescript
handlePayment() → setIsPaid(true) → VideoPlayer removes blur
```

## Component Architecture

### VideoPlayer Component

**Responsibility:** Display video content with conditional paywall overlay

**State Dependencies:**
- `isPaid`: Controls blur overlay visibility
- `isLoading`: Disables button during payment
- `onPayClick`: Callback to parent payment handler

**Key Technical Decisions:**

1. **Blur Implementation**
   ```tsx
   className="backdrop-blur-3xl bg-black/40"
   ```
   - `backdrop-blur-3xl`: 48px blur radius (Tailwind)
   - `bg-black/40`: Semi-transparent overlay for readability
   - Applied to absolute-positioned div over video

2. **Video Autoplay Strategy**
   ```tsx
   <video autoPlay muted loop playsInline />
   ```
   - `muted`: Required for autoplay in modern browsers
   - `loop`: Creates infinite playback for demo
   - `playsInline`: Prevents fullscreen on iOS

3. **Conditional Rendering Pattern**
   ```tsx
   {!isPaid && <PaywallOverlay />}
   {isPaid && <UnlockedBadge />}
   ```
   - Clean separation of locked/unlocked states
   - No complex state machines needed

### ChatSidebar Component

**Responsibility:** Render scrollable comment stream with auto-scroll behavior

**State Dependencies:**
- `comments`: Array of Comment objects
- `chatEndRef`: Ref for scroll anchor element

**Key Technical Decisions:**

1. **Scroll Behavior**
   ```typescript
   chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   ```
   - Invisible div at bottom acts as scroll target
   - Called in useEffect when comments array changes
   - Smooth animation for better UX

2. **Message Differentiation**
   ```tsx
   className={comment.isZap 
     ? 'bg-lightning-yellow/20 border-2 border-lightning-yellow' 
     : 'bg-zinc-800'
   }
   ```
   - Zap messages get special styling
   - Visual hierarchy through color/animation

3. **Timestamp Formatting**
   ```typescript
   const formatTime = (timestamp: number) => 
     new Date(timestamp).toLocaleTimeString('en-US', {
       hour: '2-digit',
       minute: '2-digit'
     });
   ```
   - Unix timestamp → Human-readable time
   - Locale-aware formatting

## Custom Hooks

### useRollingComments Hook

**Purpose:** Implement circular buffer pattern for comment injection

**Algorithm:**

```typescript
// Pseudocode
INITIALIZE:
  comments = []
  currentIndex = 0

EVERY 2-4 seconds (random interval):
  1. Calculate: templateIndex = currentIndex % TEMPLATES.length
  2. Create: newComment with TEMPLATES[templateIndex]
  3. Append: newComment to comments array
  4. Increment: currentIndex++
  5. Scroll: to bottom of chat

WHEN currentIndex >= TEMPLATES.length:
  - Modulo operation wraps index to 0
  - Cycle repeats infinitely
```

**Key Technical Decisions:**

1. **Circular Buffer via Modulo**
   ```typescript
   const templateIndex = currentIndex % COMMENT_TEMPLATES.length;
   ```
   - Simple, efficient wrapping
   - No need to reset index manually
   - Works for any array length

2. **Randomized Intervals**
   ```typescript
   const getRandomInterval = () => 2000 + Math.random() * 2000;
   ```
   - Range: 2-4 seconds
   - Creates organic, unpredictable timing
   - Prevents mechanical appearance

3. **Recursive Scheduling**
   ```typescript
   const scheduleNext = () => {
     timeoutId = setTimeout(() => {
       injectComment();
       scheduleNext(); // Recursive call
     }, getRandomInterval());
   };
   ```
   - Each injection schedules the next one
   - New random interval each time
   - Cleanup via clearTimeout on unmount

## Service Architecture

### LightningManager Service

**Purpose:** Abstract WebLN protocol complexity into clean API

**Design Pattern:** Singleton with promise-based methods

**Public API:**

```typescript
class LightningManager {
  initialize(): Promise<void>
  generateInvoice(amount: number): Promise<string>
  sendPayment(invoice: string): Promise<SendPaymentResponse>
  isWebLNAvailable(): boolean
  isProviderEnabled(): boolean
}
```

**State Machine:**

```
[Uninitialized] 
    ↓ (initialize())
[Enabled] 
    ↓ (generateInvoice())
[Invoice Created]
    ↓ (sendPayment())
[Payment Complete]
```

**Key Technical Decisions:**

1. **Error Handling Strategy**
   ```typescript
   try {
     await window.webln.enable();
   } catch (error) {
     throw new Error('Failed to enable WebLN provider');
   }
   ```
   - Catch low-level errors
   - Re-throw with user-friendly messages
   - Allows UI layer to show helpful guidance

2. **Provider Detection**
   ```typescript
   if (!window.webln) {
     throw new Error('WebLN not available...');
   }
   ```
   - Fail fast if WebLN missing
   - Clear error message with solution
   - Prevents silent failures

3. **Simulated Invoice Generation**
   ```typescript
   async generateInvoice(amount: number): Promise<string> {
     await new Promise(resolve => setTimeout(resolve, 1000));
     return HARDCODED_TEST_INVOICE;
   }
   ```
   - 1 second delay simulates API call
   - Shows "Requesting Invoice" state in UI
   - Easy to replace with real backend call

## Payment Flow Sequence Diagram

```
User          App.tsx      LightningManager    WebLN Provider
  |              |                |                    |
  |--Click Pay-->|                |                    |
  |              |--initialize()-->|                   |
  |              |                |--enable()--------->|
  |              |                |                    |
  |              |                |<--User Approves----|
  |              |<--Success------|                    |
  |              |                |                    |
  |              |-generateInvoice(100)--------------->|
  |              |                |                    |
  |              |<--Return Invoice--------------------|
  |              |                |                    |
  |              |-sendPayment(invoice)--------------->|
  |              |                |                    |
  |              |                |    [User Wallet]   |
  |              |                |    Shows confirm   |
  |              |                |                    |
  |              |<--{preimage}--------------------------|
  |              |                |                    |
  |--setIsPaid-->|                |                    |
  |--Remove blur-|                |                    |
  |--Show zap--->|                |                    |
```

## State Management Strategy

### Global State (App.tsx)

```typescript
const [isPaid, setIsPaid] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Why not Redux/Zustand?**
- Only 3 pieces of state
- No cross-component sharing needed
- Simple parent → child prop passing
- Avoids over-engineering

**State Update Patterns:**

1. **Loading State**
   ```typescript
   setIsLoading(true);
   try {
     await payment();
     setIsPaid(true);
   } finally {
     setIsLoading(false); // Always reset
   }
   ```

2. **Error State**
   ```typescript
   catch (err) {
     setError(extractUserMessage(err));
   }
   ```

3. **Success State**
   ```typescript
   setIsPaid(true);
   addZapComment(); // Side effect
   localStorage.setItem('unlocked', 'true'); // Persistence
   ```

## Performance Considerations

### Current Optimizations

1. **Efficient Re-renders**
   - Comments use unique ID keys
   - No inline function definitions in render
   - Conditional rendering instead of CSS display

2. **Memory Management**
   - Cleanup intervals on unmount
   - No unbounded comment array growth (could add limit)

3. **Bundle Size**
   - Tailwind CSS purging removes unused styles
   - Tree-shaking via Vite
   - No heavy dependencies (just React + WebLN)

### Future Optimizations

1. **Virtual Scrolling**
   ```typescript
   // For 1000+ comments
   import { FixedSizeList } from 'react-window';
   ```

2. **Code Splitting**
   ```typescript
   const VideoPlayer = lazy(() => import('./VideoPlayer'));
   ```

3. **Memoization**
   ```typescript
   const MemoizedComment = React.memo(Comment);
   ```

## Security Architecture

### Current MVP Security Model

⚠️ **NOT PRODUCTION READY**

The MVP uses client-side trust:
- No backend validation
- LocalStorage can be edited
- Test invoice is hardcoded

### Production Security Model

**Required Changes:**

1. **Backend Validation**
   ```
   Client → Backend API → Lightning Node
                ↓
           Verify Payment
                ↓
           Issue JWT Token
                ↓
           Client stores token
   ```

2. **Access Control**
   ```typescript
   // Every video request must include token
   fetch('/stream/video.m3u8', {
     headers: {
       'Authorization': `Bearer ${jwtToken}`
     }
   })
   ```

3. **Payment Verification**
   ```typescript
   // Backend
   const isValid = verifyPreimage(preimage, paymentHash);
   if (!isValid) throw new Error('Invalid payment proof');
   ```

## Testing Strategy

### Unit Tests (Recommended)

```typescript
describe('LightningManager', () => {
  it('throws error when WebLN not available', async () => {
    delete window.webln;
    await expect(manager.initialize()).rejects.toThrow();
  });
});

describe('useRollingComments', () => {
  it('wraps index when reaching array end', () => {
    // Test modulo logic
  });
});
```

### Integration Tests

```typescript
describe('Payment Flow', () => {
  it('unlocks video after successful payment', async () => {
    // Mock WebLN
    // Trigger payment
    // Assert isPaid === true
  });
});
```

### E2E Tests

```typescript
test('complete user journey', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="pay-button"]');
  // ... WebLN mock interactions
  await expect(page.locator('video')).not.toHaveClass(/blur/);
});
```

## Deployment Considerations

### Environment Variables

```env
VITE_LIGHTNING_NODE_URL=https://api.yournode.com
VITE_INVOICE_AMOUNT_SATS=100
VITE_VIDEO_CDN_URL=https://cdn.example.com
```

### Build Optimization

```bash
# Production build
npm run build

# Analyze bundle size
npm run build -- --analyze
```

### CDN Strategy

```
Static Assets → CDN (Cloudflare/CloudFront)
Video Stream  → Video CDN (Mux/Cloudflare Stream)
API Requests  → Origin Server (with rate limiting)
```

## Monitoring & Observability

### Recommended Metrics

1. **Payment Success Rate**
   ```typescript
   analytics.track('payment_success', {
     amount: sats,
     duration: endTime - startTime
   });
   ```

2. **Error Tracking**
   ```typescript
   Sentry.captureException(error, {
     tags: { payment_step: 'invoice_generation' }
   });
   ```

3. **User Behavior**
   - Time to payment click
   - Payment abandonment rate
   - Unlock → view time

## Conclusion

This architecture prioritizes:
- **Simplicity**: No over-engineering
- **Type Safety**: Compile-time guarantees
- **Maintainability**: Clear separation of concerns
- **User Experience**: Smooth, instant interactions

The design is intentionally minimal for MVP purposes but provides clear extension points for production features.
