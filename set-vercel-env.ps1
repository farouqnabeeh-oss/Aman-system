# Set Vercel environment variables from .env file
# For project: portal (sahab-dijital on Vercel)

$envFile = "apps\portal\.env"
$lines = Get-Content $envFile

foreach ($line in $lines) {
    # Skip comments and empty lines
    if ($line -match '^\s*#' -or $line.Trim() -eq '') { continue }

    # Parse KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")

        if ($key -and $value) {
            Write-Host "Setting $key ..." -ForegroundColor Cyan
            # Remove existing then add fresh for production, preview, and development
            $env:VERCEL_ENV_VALUE = $value
            echo $value | npx vercel env rm $key production --yes 2>$null
            echo $value | npx vercel env add $key production
        }
    }
}

Write-Host "`n✅ All environment variables have been pushed to Vercel!" -ForegroundColor Green
