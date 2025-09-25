#!/bin/bash

echo "🌱 Setting up CleanEkiti MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env.local
    echo "✅ Please fill in your environment variables in .env.local"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Fill in your environment variables in .env.local"
echo "2. Set up your Supabase database using scripts/setup-database.sql"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "🚀 Happy coding!"