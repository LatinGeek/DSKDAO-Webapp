# 🔧 Environment Variables Setup Guide

## 📍 Current Status

**Environment variables are NOT currently stored in this repository.** You need to create them locally or set them up in your deployment platform.

## 📁 Where Environment Variables Are Stored

### Development (Local)
```
.env.local          # ← CREATE THIS FILE (not in repo)
.env.example        # ← Template provided (in repo)
```

### Production Deployment
- **Vercel**: Environment Variables section in dashboard
- **Firebase Hosting**: Firebase Functions config
- **Docker**: Environment variables in container config
- **Other platforms**: Platform-specific environment variable settings

## 🛠️ Required Environment Variables

### 🔥 Firebase Configuration (6 variables)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 🎮 Discord Integration (4 variables)
```env
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
```

### 🔐 Authentication (2 variables)
```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## 🚀 Quick Setup

### Step 1: Copy Template
```bash
cp .env.example .env.local
```

### Step 2: Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new one)
3. Go to **Project Settings** → **General** tab
4. Scroll to **Your apps** section
5. Click **Config** and copy the values:

```javascript
// Copy these values to your .env.local
const firebaseConfig = {
  apiKey: "...",           // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "...",       // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN  
  projectId: "...",        // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "...",    // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...", // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "..."             // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### Step 3: Set Up Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name it (e.g., "DSKDAO Items Shop")
4. Go to **OAuth2** → **General**:
   - Copy **Client ID** → `DISCORD_CLIENT_ID`
   - Copy **Client Secret** → `DISCORD_CLIENT_SECRET`
   - Add redirect URI: `http://localhost:3000/api/auth/callback/discord`

5. Go to **Bot** section:
   - Click **Add Bot**
   - Copy **Token** → `DISCORD_BOT_TOKEN`

6. Get your Discord server ID:
   - Enable Developer Mode in Discord
   - Right-click your server → Copy Server ID → `DISCORD_GUILD_ID`

### Step 4: Generate NextAuth Secret
```bash
# Generate secure random secret
openssl rand -base64 32
```
Copy the output to `NEXTAUTH_SECRET`

### Step 5: Set Application URL
```env
NEXTAUTH_URL=http://localhost:3000  # Development
# NEXTAUTH_URL=https://yourdomain.com  # Production
```

## 📋 Complete .env.local Template

```env
# =============================================================================
# FIREBASE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# =============================================================================
# DISCORD INTEGRATION
# =============================================================================
DISCORD_CLIENT_ID=987654321098765432
DISCORD_CLIENT_SECRET=abc123def456...
DISCORD_BOT_TOKEN=MTAyMzQ1Njc4OTAx...
DISCORD_GUILD_ID=123456789012345678

# =============================================================================
# AUTHENTICATION
# =============================================================================
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# OPTIONAL
# =============================================================================
NODE_ENV=development
```

## 🚀 Deployment Environment Variables

### Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable from your `.env.local`

### Firebase Functions
```bash
# Set Firebase config
firebase functions:config:set \
  firebase.api_key="..." \
  discord.client_id="..." \
  nextauth.secret="..."
```

### Docker
```dockerfile
# In your Dockerfile or docker-compose.yml
ENV NEXT_PUBLIC_FIREBASE_API_KEY=your-key
ENV DISCORD_CLIENT_ID=your-id
# ... etc
```

## 🔍 Validation

### Check if variables are loaded correctly:
```typescript
// Add this to a component to debug
console.log('Firebase Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('NextAuth URL:', process.env.NEXTAUTH_URL);
```

### Test Firebase connection:
```typescript
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// This should work if Firebase is configured correctly
const testConnection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('Firebase connected successfully');
  } catch (error) {
    console.error('Firebase connection failed:', error);
  }
};
```

## ⚠️ Security Notes

### Public vs Private Variables
- **NEXT_PUBLIC_** prefix = Exposed to browser (public)
- **No prefix** = Server-side only (private)

### What to keep secret:
- ❌ `DISCORD_CLIENT_SECRET` 
- ❌ `DISCORD_BOT_TOKEN`
- ❌ `NEXTAUTH_SECRET`

### What's safe to expose:
- ✅ `NEXT_PUBLIC_FIREBASE_*` (Firebase config is meant to be public)
- ✅ `DISCORD_CLIENT_ID` (public by design)

## 🐛 Troubleshooting

### Firebase not connecting
- Check if all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Verify project ID matches your Firebase project
- Ensure Firestore is enabled in Firebase console

### Discord OAuth not working
- Verify redirect URI is correctly set in Discord app
- Check `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`
- Ensure NextAuth is configured correctly

### NextAuth errors
- Generate a new `NEXTAUTH_SECRET` if having issues
- Verify `NEXTAUTH_URL` matches your actual URL
- Check browser console for detailed error messages

## 📞 Support

If you're having trouble setting up environment variables:

1. **Check the template**: Ensure you're using the correct variable names
2. **Verify all required variables**: All variables marked "Required" must be set
3. **Test incrementally**: Start with Firebase, then add Discord, then NextAuth
4. **Check browser/server logs**: Environment variable issues usually show clear error messages

---

**💡 Pro Tip**: Keep your `.env.local` file backed up securely but never commit it to version control!