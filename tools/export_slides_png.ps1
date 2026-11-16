# Export toan bo slide ra PNG de kiem tra truc quan.
# Chay: powershell -File tools/export_slides_png.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root "BaoCao_BTL_CSDL_HRM_Portal.pptx"
$out  = Join-Path $root "docs\slide-preview"
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
New-Item -ItemType Directory -Path $out | Out-Null
$pp = New-Object -ComObject PowerPoint.Application
try {
  $pres = $pp.Presentations.Open($src, $true, $false, $false)
  $i = 0
  foreach ($sl in $pres.Slides) {
    $i++
    $sl.Export((Join-Path $out ("slide{0:d2}.png" -f $i)), "PNG", 1600, 900)
  }
  $pres.Close()
  Write-Output ("exported $i slides -> $out")
} finally { $pp.Quit() }
