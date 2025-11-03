# PowerShell script to setup Slaughterbeck family
# Run this script to create the admin user and family configuration

Write-Host "🏠 Setting up Slaughterbeck Family..." -ForegroundColor Green
Write-Host ""

$apiUrl = "https://kinjar-api.fly.dev"
$familyData = @{
    familyName = "Slaughterbeck"
    subdomain = "slaughterbeck"
    description = "The Slaughterbeck family space - sharing our journey together"
    missionStatement = "Connecting our family through shared memories and moments"
    adminName = "Family Admin"
    adminEmail = "admin@slaughterbeck.family"
    password = "admin123"
    isPublic = $true
    themeColor = "#2563EB"
} | ConvertTo-Json

try {
    Write-Host "📝 Creating family and admin user..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$apiUrl/families/create" -Method Post -Body $familyData -ContentType "application/json"
    
    Write-Host "✅ Slaughterbeck family created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Setup Details:" -ForegroundColor Cyan
    Write-Host "   Family Name: $($response.family.name)"
    Write-Host "   Subdomain: $($response.family.subdomain).kinjar.com"
    Write-Host "   Admin Email: admin@slaughterbeck.family"
    Write-Host "   Admin Password: admin123"
    Write-Host "   Family ID: $($response.family.id)"
    
    Write-Host ""
    Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
    Write-Host "   Production: https://$($response.family.subdomain).kinjar.com"
    Write-Host "   Development: http://localhost:3000/families/$($response.family.subdomain)"
    
    Write-Host ""
    Write-Host "⚠️  Important Security Notes:" -ForegroundColor Red
    Write-Host "   1. Change the admin password immediately after first login"
    Write-Host "   2. Set up proper environment variables for production"
    Write-Host "   3. Configure your DNS to point slaughterbeck.kinjar.com to your Vercel deployment"
    
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Deploy to Vercel with proper environment variables"
    Write-Host "   2. Configure subdomain DNS"
    Write-Host "   3. Test posting, commenting, and media uploads"
    Write-Host "   4. Invite family members"
    
} catch {
    Write-Host "❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host ""
        Write-Host "💡 The family might already exist. Try logging in with:" -ForegroundColor Yellow
        Write-Host "   Email: admin@slaughterbeck.family"
        Write-Host "   Password: admin123"
    }
}