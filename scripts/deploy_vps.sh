#!/bin/bash
# ==============================================================================
# One-Click Deployment Script for Hostinger FastPanel VPS (88.222.212.157)
# Domain: aamadappetti.com
# ==============================================================================
set -e

VPS_HOST="root@88.222.212.157"
REMOTE_ROOT="/var/www/fastuser/data/www/srv2002205.hstgr.cloud"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🕉️  [1/4] Syncing Backend code to VPS..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  "$PROJECT_DIR/backend/" "$VPS_HOST:$REMOTE_ROOT/backend/"

echo "📦 [2/4] Building Backend & Restarting PM2 process..."
ssh "$VPS_HOST" "bash -c '
  set -e
  cd $REMOTE_ROOT/backend
  npm install
  npx prisma generate
  npx prisma db push
  npm run build
  pm2 restart jewellery-backend
'"

echo "🎨 [3/4] Syncing Frontend code to VPS..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'backend' \
  --exclude 'flutter_app' \
  --exclude 'public/apk' \
  --exclude '.vercel' \
  --exclude '.env*.local' \
  --exclude '.env.production' \
  --exclude '.DS_Store' \
  "$PROJECT_DIR/" "$VPS_HOST:$REMOTE_ROOT/frontend/"

echo "🚀 [4/4] Building Frontend & Restarting PM2 process..."
ssh "$VPS_HOST" "bash -c '
  set -e
  cd $REMOTE_ROOT/frontend
  npm install
  npm run build
  pm2 restart jewellery-frontend
  chown -R fastuser:fastuser $REMOTE_ROOT
'"

echo "✨ Deployment Complete! Checking live services:"
sleep 2
echo "--- HTTPS Domain Check ---"
curl -sI https://aamadappetti.com/ | head -n 5
echo "--- Backend API Check ---"
curl -s https://aamadappetti.com/api/products | grep -o '\"name\":\"[^\"]*\"' | head -n 3
echo "✅ Everything is live at: https://aamadappetti.com"
