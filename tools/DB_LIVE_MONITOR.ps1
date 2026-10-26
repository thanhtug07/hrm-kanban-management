<#
    DB_LIVE_MONITOR.ps1
    Theo doi CSDL QUANLYNHANSU theo thoi gian thuc (auto-refresh).

    Cach dung:
        .\DB_LIVE_MONITOR.ps1                 # refresh 3 giay/lan, xem toan bo bang
        .\DB_LIVE_MONITOR.ps1 -Interval 2     # refresh 2 giay/lan
        .\DB_LIVE_MONITOR.ps1 -Tables "TaiKhoan","NhanVien"
        .\DB_LIVE_MONITOR.ps1 -Once           # chay 1 lan roi thoat

    Nhan Ctrl+C de dung.
#>

param(
    [int]$Interval = 3,
    [string]$Server = "(localdb)\MSSQLLocalDB",
    [string]$Database = "QUANLYNHANSU",
    [string[]]$Tables,
    [switch]$Once
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
& chcp 65001 | Out-Null

$DefaultTables = @(
    "TaiKhoan", "NhanVien", "PhongBan", "ChucVu",
    "ChamCong", "NghiPhep", "BangLuong", "ChiPhiPhatSinh",
    "CongViec", "BinhLuan", "HopDong"
)
if (-not $Tables -or $Tables.Count -eq 0) { $Tables = $DefaultTables }

function Render-Overview([string[]]$tables) {
    $parts = foreach ($t in $tables) { "SELECT '$t' AS B, COUNT(*) AS N FROM dbo.[$t]" }
    $q = "SET NOCOUNT ON; " + ($parts -join " UNION ALL ") + " ORDER BY B;"
    $rows = & sqlcmd -S $Server -d $Database -h -1 -W -s "|" -Q $q 2>&1
    $rows = @($rows | Where-Object { $_ -match '\S' -and $_ -notmatch 'rows affected' })
    foreach ($r in $rows) {
        $c = $r -split '\|' | ForEach-Object { $_.Trim() }
        Write-Host ("   {0,-18} {1,6}" -f $c[0], $c[1]) -ForegroundColor Gray
    }
}

function Render-Table([string]$table) {
    $q = "SET NOCOUNT ON; SELECT * FROM dbo.[$table];"
    $rows = & sqlcmd -S $Server -d $Database -h -1 -W -s "|" -Q $q 2>&1
    $rows = @($rows | Where-Object { $_ -match '\S' -and $_ -notmatch 'rows affected' })
    $count = $rows.Count

    Write-Host ""
    Write-Host ("  ===== {0}  ({1} dong) =====" -f $table, $count) -ForegroundColor Cyan
    if ($count -eq 0) {
        Write-Host "    (bang trong)" -ForegroundColor DarkGray
        return
    }
    foreach ($r in $rows) {
        $cols = $r -split '\|' | ForEach-Object { $_.Trim() }
        $line = ($cols | Select-Object -First 9) -join " | "
        Write-Host ("    " + $line) -ForegroundColor Gray
    }
    if ($count -gt 25) {
        Write-Host ("    ... (con {0} dong nua)" -f ($count - 25)) -ForegroundColor DarkGray
    }
}

function Show-Snapshot {
    Clear-Host
    $now = Get-Date -Format "HH:mm:ss"
    Write-Host "===================================================================" -ForegroundColor Green
    Write-Host ("  DB LIVE MONITOR - {0}   |   cap nhat luc {1}" -f $Database, $now) -ForegroundColor Green
    Write-Host ("  Server: {0}   |   refresh: {1}s   |   Ctrl+C de dung" -f $Server, $Interval) -ForegroundColor DarkGreen
    Write-Host "===================================================================" -ForegroundColor Green

    Write-Host ""
    Write-Host "  [ TONG QUAN SO DONG MOI BANG ]" -ForegroundColor Yellow
    Render-Overview $Tables

    foreach ($t in $Tables) { Render-Table $t }
}

# Kiem tra ket noi
$test = & sqlcmd -S $Server -d $Database -h -1 -Q "SELECT 1" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ("[LOI] Khong ket noi duoc '{0}' / '{1}'." -f $Server, $Database) -ForegroundColor Red
    exit 1
}

if ($Once) { Show-Snapshot; exit 0 }

Write-Host ("Dang ket noi '{0}' tren '{1}'..." -f $Database, $Server) -ForegroundColor Yellow
while ($true) {
    Show-Snapshot
    Start-Sleep -Seconds $Interval
}
