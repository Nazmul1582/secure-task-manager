# Deployment Notes

## Frontend

Recommended targets:

- Vercel
- Netlify

Build settings:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Environment variables:

```env
VITE_API_URL=https://your-api-domain.com/api
```

## Backend

Recommended targets:

- Render
- Railway
- Koyeb

Start command:

```bash
npm --workspace server run start
```

Environment variables:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_URL=https://your-frontend-domain.com
ACCESS_TOKEN_SECRET=replace_with_a_long_random_access_secret
REFRESH_TOKEN_SECRET=replace_with_a_long_random_refresh_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

## MongoDB Atlas

- Use a dedicated database user with a strong password.
- Restrict network access to the hosting provider when possible.
- Keep `MONGO_URI` only in backend environment variables.

## Production Checks

Before deployment:

```bash
npm run lint
npm run format:check
npm run test:server
npm run test:client
npm run build
```
