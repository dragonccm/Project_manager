# Neumorphism Conversion Script
# This script converts Brutalism design to Neumorphism across the entire project

Write-Host "🎨 Starting Neumorphism Conversion..." -ForegroundColor Cyan

# Define replacements for brutalism to neumorphism
$replacements = @(
    @{
        Pattern = 'border:\s*\d+px\s+solid\s+#000'
        Replacement = 'border: none'
    },
    @{
        Pattern = 'box-shadow:\s*\d+px\s+\d+px\s+0\s+#000'
        Replacement = 'box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)'
    },
    @{
        Pattern = 'background:\s*#ffeb3b'
        Replacement = 'background: linear-gradient(135deg, #667eea 0%, #5568d3 100%)'
    },
    @{
        Pattern = 'background:\s*#fff(?![0-9a-f])'
        Replacement = 'background: #e0e5ec'
    },
    @{
        Pattern = 'color:\s*#000(?![0-9a-f])'
        Replacement = 'color: #4a5568'
    },
    @{
        Pattern = 'border-radius:\s*0(?:px)?'
        Replacement = 'border-radius: 12px'
    },
    @{
        Pattern = 'font-weight:\s*900'
        Replacement = 'font-weight: 600'
    },
    @{
        Pattern = 'text-transform:\s*uppercase'
        Replacement = ''
    }
)

# Get all .tsx files
$files = Get-ChildItem -Path "." -Filter "*.tsx" -Recurse -Exclude "node_modules","dist",".next"

$totalFiles = $files.Count
$processedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "Converting files to Neumorphism" -Status "Processing $($file.Name)" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    $content = Get-Content -Path $file.FullName -Raw
    $modified = $false
    
    foreach ($replacement in $replacements) {
        if ($content -match $replacement.Pattern) {
            $content = $content -replace $replacement.Pattern, $replacement.Replacement
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Conversion complete! Processed $totalFiles files." -ForegroundColor Green
