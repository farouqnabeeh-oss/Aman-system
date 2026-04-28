# Read .env file and push to Vercel
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^#=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        if ($key -and $value) {
            Write-Host "Adding $key to Vercel..."
            echo $value | npx vercel env add $key production
        }
    }
}
