# Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Implemented backend Lightning node integration
- [ ] Added payment verification logic
- [ ] Set up proper video streaming infrastructure
- [ ] Configured environment variables
- [ ] Added error tracking (Sentry/LogRocket)
- [ ] Implemented rate limiting
- [ ] Added analytics tracking
- [ ] Configured CDN for static assets
- [ ] Set up SSL certificates
- [ ] Tested payment flow on testnet

## Development Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Access at `http://localhost:3000`

### Docker Development

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

Run:
```bash
docker-compose up
```

## Production Deployment Options

### Option 1: Vercel (Recommended for MVP)

**Pros:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Serverless functions for API

**Setup:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables in Vercel dashboard:
   - `VITE_LIGHTNING_API_URL`
   - `VITE_INVOICE_AMOUNT_SATS`
   - `VITE_VIDEO_CDN_URL`

4. Set up serverless functions for backend:

Create `/api/create-invoice.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createInvoice } from '../lib/lightning';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;
    const invoice = await createInvoice(amount);
    res.status(200).json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
}
```

### Option 2: Netlify

**Pros:**
- Similar to Vercel
- Form handling
- Identity management

**Setup:**

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

3. Deploy:
```bash
netlify deploy --prod
```

### Option 3: AWS Amplify

**Pros:**
- Full AWS integration
- Lambda functions
- DynamoDB for state

**Setup:**

1. Install Amplify CLI:
```bash
npm install -g @aws-amplify/cli
amplify configure
```

2. Initialize:
```bash
amplify init
```

3. Add hosting:
```bash
amplify add hosting
amplify publish
```

### Option 4: Custom VPS (DigitalOcean/Linode)

**For full control and backend integration**

#### Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Clone your repo
git clone https://github.com/yourusername/lightning-stream-mvp.git
cd lightning-stream-mvp

# Install dependencies
npm ci

# Build
npm run build
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/lightning-stream`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (from Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Serve static files
    location / {
        root /var/www/lightning-stream/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy (if using Express backend)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/lightning-stream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

#### PM2 for Process Management

If you add a backend server:

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start server.js --name "lightning-api"

# Auto-restart on system reboot
pm2 startup
pm2 save
```

## Backend Integration (Production)

### Express.js API Server

Create `server/index.js`:

```javascript
import express from 'express';
import cors from 'cors';
import { createInvoice, verifyPayment } from './lightning.js';

const app = express();
app.use(cors());
app.use(express.json());

// Create invoice endpoint
app.post('/api/create-invoice', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const invoice = await createInvoice(amount);
    res.json({ invoice: invoice.payment_request });
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Verify payment endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { preimage } = req.body;
    
    const isValid = await verifyPayment(preimage);
    
    if (isValid) {
      // Generate access token
      const token = generateAccessToken(/* user data */);
      res.json({ token, unlocked: true });
    } else {
      res.status(400).json({ error: 'Invalid payment' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

### Lightning Node Integration

#### Using LND (Lightning Network Daemon)

Create `server/lightning.js`:

```javascript
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import fs from 'fs';

// Load LND credentials
const macaroon = fs.readFileSync(process.env.LND_MACAROON_PATH);
const tlsCert = fs.readFileSync(process.env.LND_TLS_CERT_PATH);

// Create gRPC client
const packageDefinition = protoLoader.loadSync('lnrpc/lightning.proto');
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;

const credentials = grpc.credentials.combineChannelCredentials(
  grpc.credentials.createSsl(tlsCert),
  grpc.credentials.createFromMetadataGenerator((args, callback) => {
    const metadata = new grpc.Metadata();
    metadata.add('macaroon', macaroon.toString('hex'));
    callback(null, metadata);
  })
);

const lightning = new lnrpc.Lightning(
  process.env.LND_HOST || 'localhost:10009',
  credentials
);

export async function createInvoice(amountSats) {
  return new Promise((resolve, reject) => {
    lightning.addInvoice(
      {
        value: amountSats,
        memo: 'Lightning Stream Unlock',
        expiry: 3600, // 1 hour
      },
      (err, response) => {
        if (err) reject(err);
        else resolve(response);
      }
    );
  });
}

export async function verifyPayment(rHash) {
  return new Promise((resolve, reject) => {
    lightning.lookupInvoice({ r_hash: rHash }, (err, response) => {
      if (err) reject(err);
      else resolve(response.settled);
    });
  });
}
```

## Environment Variables

### Development (`.env.development`)
```env
VITE_API_URL=http://localhost:3001
VITE_INVOICE_AMOUNT=100
VITE_VIDEO_URL=https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_30fps.mp4
```

### Production (`.env.production`)
```env
VITE_API_URL=https://api.yourstream.com
VITE_INVOICE_AMOUNT=100
VITE_VIDEO_CDN_URL=https://cdn.yourstream.com
VITE_SENTRY_DSN=your_sentry_dsn
```

## Monitoring Setup

### Sentry Error Tracking

```bash
npm install @sentry/react
```

Update `src/main.tsx`:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Analytics

Add Google Analytics or Plausible:

```typescript
// src/lib/analytics.ts
export const trackPaymentAttempt = () => {
  if (window.gtag) {
    window.gtag('event', 'payment_attempt', {
      event_category: 'engagement',
    });
  }
};

export const trackPaymentSuccess = (amount: number) => {
  if (window.gtag) {
    window.gtag('event', 'payment_success', {
      event_category: 'conversion',
      value: amount,
    });
  }
};
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Performance Optimization

### CDN Configuration

**Cloudflare Settings:**
- Enable Auto Minify (JS, CSS, HTML)
- Enable Brotli compression
- Page Rules:
  - `*.js` → Cache Everything, Edge TTL 1 month
  - `*.css` → Cache Everything, Edge TTL 1 month
  - `/api/*` → Bypass cache

### Image Optimization

If using images:
```bash
npm install @next/image
```

Or use Cloudinary/ImageKit for automatic optimization.

## Security Hardening

### Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  media-src 'self' https://videos.pexels.com;
  connect-src 'self' https://api.yourstream.com;
">
```

### Rate Limiting

Implement in backend:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Rollback Strategy

### Vercel Rollback
```bash
vercel rollback [deployment-url]
```

### Git-based Rollback
```bash
git revert HEAD
git push origin main
```

## Health Checks

Create monitoring endpoint:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

Monitor with UptimeRobot or similar service.

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Try legacy peer deps
npm install --legacy-peer-deps
```

### CORS Issues

Ensure backend allows origin:
```javascript
app.use(cors({
  origin: 'https://yourstream.com',
  credentials: true,
}));
```

### WebLN Not Working

- Ensure HTTPS (required by WebLN spec)
- Check wallet extension is installed
- Verify permissions granted

## Post-Deployment Checklist

- [ ] Verify SSL certificate is valid
- [ ] Test payment flow end-to-end
- [ ] Check error tracking is receiving events
- [ ] Verify analytics tracking
- [ ] Test on mobile devices
- [ ] Check page load speed (< 3s)
- [ ] Verify all environment variables set
- [ ] Test video playback on multiple browsers
- [ ] Check console for errors
- [ ] Verify chat scrolling works

## Ongoing Maintenance

- Monitor error rates in Sentry
- Review payment success rates weekly
- Update dependencies monthly
- Rotate Lightning node credentials quarterly
- Review CDN costs and bandwidth usage
- Optimize video delivery based on analytics

---

**Remember:** This MVP requires significant backend work before production deployment. Do not skip payment verification!
