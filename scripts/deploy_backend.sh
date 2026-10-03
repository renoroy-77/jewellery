#!/bin/bash
# ==============================================================================
# Dedicated CLI Deployment Script for NestJS Backend on VPS (88.222.212.157)
# ==============================================================================
set -e

VPS_HOST="root@88.222.212.157"
REMOTE_ROOT="/var/www/fastuser/data/www/srv2002205.hstgr.cloud"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔱 [1/3] Syncing Backend code to FastPanel VPS ($VPS_HOST)..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  "$PROJECT_DIR/backend/" "$VPS_HOST:$REMOTE_ROOT/backend/"

echo "📦 [2/3] Building Backend & Migrating Prisma Database on VPS..."
ssh "$VPS_HOST" "bash -c '
  set -e
  cd $REMOTE_ROOT/backend
  npm install
  npx prisma generate
  npx prisma db push
  npm run build
  pm2 restart jewellery-backend
  chown -R fastuser:fastuser $REMOTE_ROOT/backend
'"

echo "✨ [3/3] Verifying Backend Service Status..."
sleep 2
echo "--- PM2 Status ---"
ssh "$VPS_HOST" "pm2 show jewellery-backend | grep -E 'status|uptime|restarts'"

echo "--- Live API Endpoint Test ---"
curl -sI https://aamadappetti.com/api/products | head -n 5

echo "--- Live Product Query Test ---"
curl -s https://aamadappetti.com/api/products | grep -o '\"name\":\"[^\"]*\"' | head -n 3

echo ""
echo "✅ Backend on 88.222.212.157 is online and serving live requests at https://aamadappetti.com/api"
