$files = Get-ChildItem -Path src, scripts, public, . -File -Recurse | Where-Object { $_.Extension -match "\.(tsx|ts|md|json|yaml)$" }

foreach ($file in $files) {
    $content = Get-Content -Raw $file.FullName
    $newContent = $content -replace "Nexus ML\.AI", "nexusml"
    $newContent = $newContent -replace "Nexus ML", "nexusml"
    $newContent = $newContent -replace "NEXUS ML\.AI", "NEXUSML"
    $newContent = $newContent -replace "NEXUS ML", "NEXUSML"
    $newContent = $newContent -replace "nexus-ml", "nexusml"
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated $($file.FullName)"
    }
}
