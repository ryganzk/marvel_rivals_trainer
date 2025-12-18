#!/bin/sh
set -e

# Start Next.js in production
HOST=0.0.0.0 PORT=3000 NODE_ENV=production npm run start &
NEXT_PID=$!

# Start nginx in the foreground (PID 1)
exec nginx -g 'daemon off;'
