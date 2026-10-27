<#
    HEALTH_CHECK.ps1
    Kiem tra suc khoe he thong HRM: SQL Server, Database, schema, du lieu, Backend API.

    Cach dung:
        .\HEALTH_CHECK.ps1
        .\HEALTH_CHECK.ps1 -Server "localhost" -Database "QUANLYNHANSU" -ApiUrl "http://localhost:5100"
        .\HEALTH_CHECK.ps1 -Json           # xuat ket qua JSON
#>

param(
    [string]$Server = "localhost",
    [string]$Database = "QUANLYNHANSU",
    [string]$ApiUrl = "http://localhost:5100",
    [switch]$Json
)

$ErrorActionPreference = "Continue"
$result = [ordered]@{}
$pass = 0; $fail = 0; $warn = 0

function Section($title) {
    if (-not $Json) { Write-Host ""; Write-Host ("=" * 60) -ForegroundColor Cyan; Write-Host "  $title" -ForegroundColor Cyan; Write-Host ("=" * 60) -ForegroundColor Cyan }
}
function Check($name, $ok, $detail, $isWarn = $false) {
    if ($isWarn) { $script:warn++ } elseif ($ok) { $script:pass++ } else { $script:fail++ }
    $icon = if ($isWarn) { "[!]" } elseif ($ok) { "[OK]" } else { "[X]" }
    $color = if ($isWarn) { "Yellow" } elseif ($ok) { "Green" } else { "Red" }
    if (-not $Json) { Write-Host "  $icon $name" -ForegroundColor $color -NoNewline; if ($detail) { Write-Host "  -> $detail" -ForegroundColor DarkGray } else { Write-Host "" } }
    return @{ name = $name; ok = $ok; warn = $isWarn; detail = "$detail" }
}

function SqlQuery($q) {
    return (sqlcmd -S $Server -C -d $Database -h -1 -W -s "`t" -Q "SET NOCOUNT ON; $q" 2>&1)
}
function SqlScalar($q) {
    $r = SqlQuery $q
    $first = ($r | Where-Object { $_ -match '\S' -and $_ -notmatch 'rows affected' } | Select-Object -First 1)
    if ($first) { return ($first -split "`t")[0].Trim() }
    return $null
}

$checks = @()

# ===== 1. SQL SERVER =====
Section "1. KET NOI SQL SERVER"
$ver = SqlScalar "SELECT SERVERPROPERTY('ProductVersion')"
if ($ver) { $checks += Check "SQL Server ket noi duoc ($Server)" $true "v$ver" }
else { $checks += Check "SQL Server ket noi duoc ($Server)" $false "Khong ket noi duoc"; if (-not $Json) { Write-Host "`n  [DUNG] Khong the ket noi SQL Server. Kiem tra service MSSQLSERVER dang chay." -ForegroundColor Red; if($Json){$result.db=$checks|ConvertTo-Json; $result|ConvertTo-Json -Depth 5}; exit 1 } }

$edition = SqlScalar "SELECT SERVERPROPERTY('Edition')"
$checks += Check "Edition" $true $edition

# service
$svc = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
if ($svc) { $checks += Check "Service MSSQLSERVER" ($svc.Status -eq "Running") $svc.Status }

# ===== 2. DATABASE =====
Section "2. DATABASE"
$dbState = SqlScalar "SELECT state_desc FROM sys.databases WHERE name='$Database'"
if ($dbState) { $checks += Check "Database '$Database' ton tai" ($dbState -eq "ONLINE") $dbState }
else { $checks += Check "Database '$Database' ton tai" $false "Khong tim thay" }

# ===== 3. SCHEMA OBJECTS =====
Section "3. DOI TUONG SCHEMA"
$tables = SqlScalar "SELECT COUNT(*) FROM sys.tables"
$views = SqlScalar "SELECT COUNT(*) FROM sys.views"
$procs = SqlScalar "SELECT COUNT(*) FROM sys.procedures"
$triggers = SqlScalar "SELECT COUNT(*) FROM sys.triggers WHERE is_ms_shipped=0"
$indexes = SqlScalar "SELECT COUNT(*) FROM sys.indexes WHERE object_id IN (SELECT object_id FROM sys.tables)"

$checks += Check "Bang (tables)" ([int]$tables -ge 11) "$tables bang (ky vong >= 11)"
$checks += Check "View" ([int]$views -ge 6) "$views view (ky vong >= 6)"
$checks += Check "Stored Procedure" ([int]$procs -ge 3) "$procs SP (ky vong >= 3)"
$checks += Check "Trigger" ([int]$triggers -ge 3) "$triggers trigger (ky vong >= 3)"
$checks += Check "Index" ([int]$indexes -ge 15) "$indexes index"

# liet ke bang
$tableList = SqlQuery "SELECT name FROM sys.tables ORDER BY name" | Where-Object { $_ -match '\S' }
if (-not $Json) { Write-Host "  Bang: $($tableList -join ', ')" -ForegroundColor DarkGray }

# ===== 4. DU LIEU =====
Section "4. DU LIEU"
$queries = @{
    "NhanVien" = "SELECT COUNT(*) FROM dbo.NhanVien"
    "TaiKhoan" = "SELECT COUNT(*) FROM dbo.TaiKhoan"
    "PhongBan" = "SELECT COUNT(*) FROM dbo.PhongBan"
    "ChucVu" = "SELECT COUNT(*) FROM dbo.ChucVu"
    "HopDong" = "SELECT COUNT(*) FROM dbo.HopDong"
    "ChamCong" = "SELECT COUNT(*) FROM dbo.ChamCong"
    "BangLuong" = "SELECT COUNT(*) FROM dbo.BangLuong"
    "CongViec" = "SELECT COUNT(*) FROM dbo.CongViec"
    "NghiPhep" = "SELECT COUNT(*) FROM dbo.NghiPhep"
    "CauHinhChamCong" = "SELECT COUNT(*) FROM dbo.CauHinhChamCong"
}
$dataCounts = [ordered]@{}
foreach ($k in $queries.Keys) {
    $c = SqlScalar $queries[$k]
    $dataCounts[$k] = [int]$c
    $expectMin = if ($k -in @("NhanVien","TaiKhoan")) { 1 } else { 0 }
    $checks += Check "  $k" ([int]$c -ge $expectMin) "$c dong"
}

# tai khoan theo vai tro
$roles = SqlQuery "SELECT VaiTro, COUNT(*) AS n FROM dbo.TaiKhoan GROUP BY VaiTro ORDER BY VaiTro"
if (-not $Json) { Write-Host "  Tai khoan theo vai tro:" -ForegroundColor DarkGray; $roles | Where-Object { $_ -match '\S' } | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray } }

# ===== 5. RANG BUOC / TOAN VEN =====
Section "5. RANG BUOC & TOAN VEN"
$fkCount = SqlScalar "SELECT COUNT(*) FROM sys.foreign_keys"
$ckCount = SqlScalar "SELECT COUNT(*) FROM sys.check_constraints"
$checks += Check "Foreign Key" ([int]$fkCount -ge 10) "$fkCount FK"
$checks += Check "Check Constraint" ([int]$ckCount -ge 10) "$ckCount CHECK"

# FK thieu index
$missingFk = SqlQuery "SELECT OBJECT_NAME(fk.parent_object_id) FROM sys.foreign_keys fk WHERE NOT EXISTS (SELECT 1 FROM sys.index_columns ic JOIN sys.indexes i ON i.object_id=ic.object_id AND i.index_id=ic.index_id WHERE ic.object_id=fk.parent_object_id AND ic.column_id=(SELECT TOP 1 parent_column_id FROM sys.foreign_key_columns WHERE constraint_object_id=fk.object_id))" | Where-Object { $_ -match '\S' }
$missingCount = ($missingFk | Measure-Object).Count
$checks += Check "FK co index day du" ($missingCount -eq 0) $(if ($missingCount -eq 0) { "tat ca FK co index" } else { "$missingCount FK thieu index: $($missingFk -join ', ')" })

# ===== 6. CAU HINH CHAM CONG =====
Section "6. CAU HINH CHAM CONG"
$cfg = SqlQuery "SELECT GioBatDau, GioKetThuc, PhutChoPhepSom, PhutChoPhepTre FROM dbo.CauHinhChamCong"
if ($cfg -match '\d') { $checks += Check "Cau hinh khung gio ton tai" $true ($cfg -join ' ') }
else { $checks += Check "Cau hinh khung gio ton tai" $false "Chua cau hinh" $true }

# ===== 7. BACKEND API =====
Section "7. BACKEND API"
try {
    $health = Invoke-RestMethod "$ApiUrl/api/healthcheck/database" -TimeoutSec 5 -ErrorAction Stop
    $checks += Check "Backend API song ($ApiUrl)" $true "status OK"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) { $checks += Check "Backend API song ($ApiUrl)" $true "401 (can auth - OK)" }
    else { $checks += Check "Backend API song ($ApiUrl)" $false "Khong ket noi (backend chua chay?)" $true }
}

# thu login
try {
    $login = Invoke-RestMethod "$ApiUrl/api/auth/login" -Method Post -Body '{"tenDangNhap":"admin","matKhau":"Admin@123"}' -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    $checks += Check "Dang nhap admin" ($login.success) "role=$($login.data.userProfile.vaiTro)"
} catch {
    $checks += Check "Dang nhap admin" $false "That bai (kiem tra seed data)" $true
}

# ===== KET QUA =====
Section "KET QUA"
if (-not $Json) {
    Write-Host "  PASS: $pass   WARN: $warn   FAIL: $fail" -ForegroundColor $(if ($fail -gt 0) { "Red" } elseif ($warn -gt 0) { "Yellow" } else { "Green" })
    Write-Host ""
    if ($fail -eq 0) { Write-Host "  => HE THONG KHOE MANH" -ForegroundColor Green }
    elseif ($fail -le 2) { Write-Host "  => CO VAN DE NHO, kiem tra muc [X]/[!]" -ForegroundColor Yellow }
    else { Write-Host "  => CO LOI NGHIEM TRONG" -ForegroundColor Red }
}

$result = [ordered]@{
    timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    server = $Server; database = $Database; apiUrl = $ApiUrl
    summary = [ordered]@{ pass = $pass; warn = $warn; fail = $fail }
    schema = [ordered]@{ tables = [int]$tables; views = [int]$views; procs = [int]$procs; triggers = [int]$triggers; indexes = [int]$indexes; foreignKeys = [int]$fkCount }
    data = $dataCounts
    checks = $checks
}
if ($Json) { $result | ConvertTo-Json -Depth 6 }
else { $result | ConvertTo-Json -Depth 6 | Out-File -LiteralPath (Join-Path $PSScriptRoot "health-report.json") -Encoding UTF8; Write-Host "  (Da luu bao cao: tools\health-report.json)" -ForegroundColor DarkGray }

exit $(if ($fail -gt 0) { 1 } else { 0 })