# Deployment Guide: Reverse Proxy Configuration

## Overview
The application now uses a reverse proxy strategy where Next.js (frontend) proxies all API and media requests to the backend. This eliminates CORS issues and mixed content problems.

## Architecture
```
Browser → Next.js (HTTPS) → Backend (HTTP, internal)
         ↓ (rewrites)
         /api/v1/*  → http://backend:8000/api/v1/*
         /uploads/* → http://backend:8000/uploads/*
```

## Dokploy Configuration

### Frontend Service
**Environment Variables:**
```
API_PROXY_URL=http://elementrentals-elementbackend-[hash]:8000
NEXT_PUBLIC_DEFAULT_LANG=es
NODE_ENV=production
```

**Important Notes:**
- Replace `[hash]` with the actual service hash from `docker service ls`
- Do NOT set `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_BASE` (deprecated)
- The frontend must be able to reach the backend via Docker network

### Backend Service
**Environment Variables:**
```
DATABASE_URL=postgresql://...
ENV=production
# ... other backend vars
```

**Important Notes:**
- No special configuration needed
- CORS is still configured but less critical now
- Backend runs on internal HTTP (port 8000)

### Cloudflare Tunnel
**Configuration:**
- Point tunnel ONLY to the frontend service
- Example: `http://elementrentals-elementfrontend-[hash]:3000`
- Backend should NOT be exposed publicly

## Verification Steps

1. **Check Docker Network:**
   ```bash
   docker service ls
   # Note the exact service names
   ```

2. **Update Frontend ENV:**
   - Set `API_PROXY_URL` to match backend service name
   - Rebuild frontend

3. **Test Locally First:**
   ```bash
   # Frontend
   cd frontend
   API_PROXY_URL=http://localhost:8000 npm run dev
   
   # Backend
   cd backend
   uvicorn app.main:app --reload
   ```

4. **Verify in Browser:**
   - Open DevTools → Network
   - API calls should show as `/api/v1/...` (relative)
   - No CORS errors
   - No mixed content warnings

## Troubleshooting

### "ERR_NAME_NOT_RESOLVED"
- Frontend can't reach backend
- Check `API_PROXY_URL` matches exact service name
- Verify both services are on same Docker network

### "Mixed Content" Errors
- Check that frontend is NOT setting `NEXT_PUBLIC_API_URL`
- Verify `client.ts` is using relative URLs in browser

### Images Not Loading
- Check `/uploads/*` rewrite in `next.config.mjs`
- Verify `media.ts` is using empty base URL in browser

## Rollback Plan
If issues occur, you can temporarily revert to direct backend access:
1. Expose backend via Cloudflare Tunnel
2. Set `NEXT_PUBLIC_API_URL=https://[backend-tunnel-url]/api/v1`
3. Rebuild frontend
