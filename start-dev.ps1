# BookMyTable Development Startup Script
# Run this script to start both backend and frontend servers

Write-Host "🚀 Starting BookMyTable Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "   1. Open TWO separate PowerShell terminals" -ForegroundColor White
Write-Host "   2. In Terminal 1, run: cd server; npm run dev" -ForegroundColor White
Write-Host "   3. In Terminal 2, run: cd client; npm run dev" -ForegroundColor White
Write-Host "   4. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Do you want to start the backend server now? (y/n)"

if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host ""
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
    Write-Host "   (You'll need to manually start the frontend in another terminal)" -ForegroundColor Yellow
    Write-Host ""
    Set-Location -Path "server"
    npm run dev
} else {
    Write-Host ""
    Write-Host "📝 Manual Startup:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Backend (Terminal 1):" -ForegroundColor Yellow
    Write-Host "   cd server" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Frontend (Terminal 2):" -ForegroundColor Yellow
    Write-Host "   cd client" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Then open: http://localhost:5173" -ForegroundColor Green
    Write-Host ""
}
