# photos_download.ps1 - Dali 19 scenic photos auto-download from Wikimedia Commons (free license)
# Run: powershell -ExecutionPolicy Bypass -File .\photos_download.ps1
$ErrorActionPreference = 'Continue'
$dir = Join-Path $PSScriptRoot 'assets\scenic'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$spots = @(
  @{key='erhai';       q='Erhai Lake'},
  @{key='cangshan';    q='Cangshan mountain Dali'},
  @{key='hudiequan';   q='Butterfly Spring Dali'},
  @{key='haishe';      q='Haishe Erhai'},
  @{key='panxi';       q='Panxi Erhai'},
  @{key='longkan';     q='Longkan pier Dali'},
  @{key='xiaoputuo';   q='Xiaoputuo Erhai'},
  @{key='luoquan';     q='Luoquan peninsula Dali'},
  @{key='santasi';     q='Three Pagodas Chongsheng'},
  @{key='daligucheng'; q='Dali old town gate'},
  @{key='shuanglang';  q='Shuanglang'},
  @{key='xizhou';      q='Xizhou Dali'},
  @{key='shaxi';       q='Shaxi Sideng'},
  @{key='nanzhao';     q='Nanzhao island Erhai'},
  @{key='jizhao';      q='Jizhao temple Dali'},
  @{key='daoying';     q='Three Pagodas reflection'},
  @{key='lixiangbang'; q='Dali Erhai east bank town'},
  @{key='weishan';     q='Weishan ancient city'},
  @{key='tianlong';    q='Tianlongbabu film city Dali'}
)

$ua = 'DaliMap/1.0 (local travel demo)'
$ok = @(); $fail = @()
foreach($s in $spots){
  $key = $s.key
  $out = Join-Path $dir ($key + '.jpg')
  if(Test-Path $out){ Write-Host "SKIP $key (exists)"; $ok += $key; continue }

  $api = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
         [Uri]::EscapeDataString($s.q) +
         '&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url%7Csize%7Cmime&iiurlwidth=1000&format=json'
  try{
    $r = Invoke-RestMethod -Uri $api -TimeoutSec 20 -UserAgent $ua
    $pages = @()
    if($r.query -and $r.query.pages){ $pages = @($r.query.pages.PSObject.Values) }
    $pages = @($pages | Sort-Object { $_.index })
    $url = $null
    foreach($p in $pages){
      $ii = $p.imageinfo[0]
      if($ii -and $ii.mime -eq 'image/jpeg' -and $ii.thumburl -and $p.title -notmatch '(?i)map|logo|diagram|flag|coat|emblem'){
        $url = $ii.thumburl; break
      }
    }
    if($url){
      Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 30 -UserAgent $ua
      $kb = [math]::Round((Get-Item $out).Length/1KB)
      Write-Host "OK   $key  ($kb KB)" -ForegroundColor Green
      $ok += $key
    } else {
      Write-Host "MISS $key  (no jpg on Commons)" -ForegroundColor Yellow
      $fail += $key
    }
  } catch {
    Write-Host "FAIL $key  $($_.Exception.Message)" -ForegroundColor Red
    $fail += $key
  }
}
Write-Host ''
Write-Host ("Done: {0} downloaded, {1} missing" -f $ok.Count, $fail.Count)
if($fail.Count -gt 0){ Write-Host ("Missing keys: " + ($fail -join ',')) -ForegroundColor Yellow }