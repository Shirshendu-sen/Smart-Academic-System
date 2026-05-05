#!/bin/bash

# Smart Academic Platform - Setup Script
# This script sets up the entire project with all three services

set -e  # Exit on error

echo "🚀 Smart Academic Platform - Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_status "Node.js $NODE_VERSION found"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm $NPM_VERSION found"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_status "Python $PYTHON_VERSION found"
else
    print_warning "Python 3 not found. AI service will not work"
fi

# Check Git
if command -v git &> /dev/null; then
    print_status "Git found"
else
    print_warning "Git not found. Some features may not work"
fi

echo ""
echo "📦 Installing Backend Dependencies..."
echo "-------------------------------------"

cd backend
if [ -f "package.json" ]; then
    npm install
    print_status "Backend dependencies installed"
else
    print_error "Backend package.json not found"
    exit 1
fi
cd ..

echo ""
echo "📦 Installing Frontend Dependencies..."
echo "--------------------------------------"

cd frontend
if [ -f "package.json" ]; then
    npm install
    print_status "Frontend dependencies installed"
else
    print_error "Frontend package.json not found"
    exit 1
fi
cd ..

echo ""
echo "🐍 Setting up AI Service..."
echo "---------------------------"

cd ai-service
if [ -f "requirements.txt" ]; then
    if command -v pip3 &> /dev/null; then
        pip3 install -r requirements.txt
        print_status "AI service dependencies installed"
    else
        print_warning "pip3 not found. Skipping AI service dependencies"
    fi
else
    print_warning "AI service requirements.txt not found"
fi
cd ..

echo ""
echo "🗄️ Setting up Database..."
echo "-------------------------"

cd backend
if [ -f "prisma/schema.prisma" ]; then
    echo "Generating Prisma client..."
    npx prisma generate
    print_status "Prisma client generated"
    
    echo ""
    print_warning "⚠️  IMPORTANT: Database setup required"
    echo "Please follow these steps:"
    echo "1. Create a PostgreSQL database (use Neon.tech for free cloud database)"
    echo "2. Copy the connection string"
    echo "3. Create backend/.env file with DATABASE_URL"
    echo "4. Run: npx prisma db push"
    echo ""
    echo "Example .env file:"
    echo "DATABASE_URL=\"postgresql://user:password@host:port/dbname\""
    echo "JWT_SECRET=\"your-super-secret-jwt-key-here\""
    echo "PORT=5000"
else
    print_error "Prisma schema not found"
fi
cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. 📝 Configure environment variables:"
echo "   - backend/.env (Database & JWT secret)"
echo "   - frontend/.env.local (API URL)"
echo "   - ai-service/.env (Gemini API key)"
echo ""
echo "2. 🗄️  Initialize database:"
echo "   cd backend && npx prisma db push"
echo ""
echo "3. 🚀 Start services:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - AI Service: cd ai-service && python app.py"
echo ""
echo "4. 🧪 Test the system:"
echo "   - Open http://localhost:3000 for frontend"
echo "   - API runs on http://localhost:5000"
echo "   - AI service runs on http://localhost:5001"
echo ""
echo "For detailed instructions, see README.md"
echo ""
echo "Happy coding! 🎓"