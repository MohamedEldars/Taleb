#!/bin/bash
set -e

echo "🎯 Taleb Deployment Script"
echo "=========================="

# التحقق من Firebase Token/Service Account
if [ -n "$FIREBASE_TOKEN" ]; then
    AUTH_OPTION="--token $FIREBASE_TOKEN"
    echo "🔐 Using Firebase CI Token"
elif [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
    # إنشاء ملف service account مؤقت
    echo "$FIREBASE_SERVICE_ACCOUNT" > /tmp/serviceAccount.json
    export GOOGLE_APPLICATION_CREDENTIALS="/tmp/serviceAccount.json"
    AUTH_OPTION=""
    echo "🔐 Using Service Account"
else
    echo "❌ Error: No Firebase authentication found"
    echo "ℹ️  Add FIREBASE_TOKEN or FIREBASE_SERVICE_ACCOUNT to Replit Secrets"
    echo ""
    echo "To get Firebase Token:"
    echo "1. On your local machine: npm install -g firebase-tools"
    echo "2. Run: firebase login:ci"
    echo "3. Copy the token to Replit Secrets as FIREBASE_TOKEN"
    echo ""
    echo "Or use Service Account:"
    echo "1. Go to Firebase Console > Project Settings > Service accounts"
    echo "2. Generate new private key"
    echo "3. Copy entire JSON content to Replit Secrets as FIREBASE_SERVICE_ACCOUNT"
    exit 1
fi

# بناء المشروع
echo "🔄 Building project..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# التحقق من dist directory
if [ ! -d "dist/public" ]; then
    echo "❌ Error: dist/public directory not found after build"
    echo "ℹ️  Make sure 'npm run build' creates dist/public directory"
    exit 1
fi

# النشر
echo "🚀 Deploying to Firebase..."
if firebase deploy $AUTH_OPTION --non-interactive; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "🌐 Your site is live!"
    echo "📊 Check Firebase Console for details"
    
    # تنظيف الملف المؤقت
    rm -f /tmp/serviceAccount.json
else
    echo "❌ Deployment failed"
    rm -f /tmp/serviceAccount.json
    exit 1
fi