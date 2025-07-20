#!/bin/bash
set -e

echo "🎯 Taleb - نشر الموقع على Firebase"
echo "================================="

# التحقق من Firebase Token
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "❌ خطأ: FIREBASE_TOKEN غير موجود في Secrets"
    echo ""
    echo "للحصول على Firebase Token:"
    echo "1. على جهازك: npm install -g firebase-tools"
    echo "2. شغل: firebase login:ci"
    echo "3. انسخ الـ Token وضعه في Replit Secrets كـ FIREBASE_TOKEN"
    echo ""
    echo "أو أرسلي الـ Token وأنا هضبطهولك"
    exit 1
fi

echo "🔐 Firebase Token موجود ✓"
echo "📁 Project ID: taleb-student-hub"

# بناء المشروع
echo "🔄 بناء المشروع..."
if npm run build; then
    echo "✅ البناء نجح"
else
    echo "❌ فشل البناء"
    exit 1
fi

# التحقق من dist directory
if [ ! -d "dist/public" ]; then
    echo "❌ خطأ: مجلد dist/public غير موجود"
    echo "🔧 تحقق من إعدادات البناء"
    exit 1
fi

echo "📦 الملفات جاهزة للنشر"
echo "📊 حجم الملفات:"
du -sh dist/public

# النشر
echo "🚀 نشر الموقع على Firebase..."
if firebase deploy --token "$FIREBASE_TOKEN" --non-interactive --project taleb-student-hub; then
    echo ""
    echo "🎉 نجح النشر!"
    echo "🌐 الموقع متاح الآن على:"
    echo "   https://taleb-student-hub.web.app"
    echo "   https://taleb-student-hub.firebaseapp.com"
    echo ""
    echo "📋 الخطوات التالية:"
    echo "1. أضف الدومين الجديد في Firebase Console > Authentication > Authorized domains"
    echo "2. جرب تسجيل الدخول على الموقع الجديد"
    echo "3. شارك الرابط مع الأصدقاء!"
    echo ""
    echo "📊 راجع إحصائيات الموقع: https://console.firebase.google.com/project/taleb-student-hub"
else
    echo "❌ فشل النشر"
    echo "🔧 تحقق من:"
    echo "   - صحة الـ Token"
    echo "   - إعدادات Firebase"
    echo "   - اتصال الإنترنت"
    exit 1
fi