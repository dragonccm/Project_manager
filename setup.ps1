# Project Manager Setup Script for Windows
# This script helps you set up the environment variables and start the development server

Write-Host "🚀 Project Manager Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    
    if (Test-Path ".env.example") {
        Write-Host ""
        Write-Host "💡 Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Please edit .env file and add your database URL:" -ForegroundColor Yellow
        Write-Host "   NEON_DATABASE_URL=postgresql://username:password@host.neon.tech/dbname" -ForegroundColor White
        Write-Host ""
        Write-Host "🔗 Get your Neon database URL from: https://neon.tech/" -ForegroundColor Blue
        
        # Ask if user wants to open .env file
        $openFile = Read-Host "Would you like to open the .env file now? (y/n)"
        if ($openFile -eq "y" -or $openFile -eq "Y") {
            if (Get-Command notepad -ErrorAction SilentlyContinue) {
                notepad .env
            } elseif (Get-Command code -ErrorAction SilentlyContinue) {
                code .env
            } else {
                Start-Process .env
            }
        }
    } else {
        Write-Host "❌ .env.example file not found either!" -ForegroundColor Red
        Write-Host "Please create a .env file manually." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    
    # Check if pnpm is available
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        Write-Host "Using pnpm..." -ForegroundColor Blue
        pnpm install
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "Using npm..." -ForegroundColor Blue
        npm install
    } else {
        Write-Host "❌ Neither npm nor pnpm found! Please install Node.js first." -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Blue
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Checking environment variables..." -ForegroundColor Yellow

# Run environment check
if (Get-Command node -ErrorAction SilentlyContinue) {
    node scripts/check-env.js
} else {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Blue
    exit 1
}

Write-Host ""
Write-Host "🎯 Setup Summary:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "✅ Environment file: .env" -ForegroundColor Green
Write-Host "✅ Dependencies: Installed" -ForegroundColor Green
Write-Host "✅ Environment check: Complete" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Ready to start! Available commands:" -ForegroundColor Green
Write-Host "  pnpm dev          - Start development server" -ForegroundColor White
Write-Host "  pnpm check-env    - Check environment variables" -ForegroundColor White
Write-Host "  pnpm setup        - Run env check + start dev server" -ForegroundColor White

Write-Host ""
$startNow = Read-Host "Would you like to start the development server now? (y/n)"
if ($startNow -eq "y" -or $startNow -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    Write-Host "Visit: http://localhost:3000" -ForegroundColor Blue
    Write-Host ""
    
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm dev
    } else {
        npm run dev
    }
}

Write-Host ""
Write-Host "📖 For detailed documentation, see: ENV_SETUP.md" -ForegroundColor Cyan
Write-Host "🆘 Need help? Check the troubleshooting section in ENV_SETUP.md" -ForegroundColor Yellow
