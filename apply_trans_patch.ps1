$ErrorActionPreference='Stop'
$f='C:\Users\mac\IDEProjects\LJYs_assistant\index.html'
$j='C:\Users\mac\IDEProjects\LJYs_assistant\trans_patch.json'
$t=[IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$json=[IO.File]::ReadAllText($j, [Text.Encoding]::UTF8) | ConvertFrom-Json
foreach($e in $json.edits){
  $cnt=([regex]::Matches($t,[regex]::Escape($e.old))).Count
  if($cnt -ne 1){
    Write-Output ("FAIL " + $e.name + " anchor count=" + $cnt)
    exit 1
  }
  $t=$t.Replace($e.old,$e.new)
  Write-Output ("OK " + $e.name)
}
$utf8NoBom=New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($f,$t,$utf8NoBom)
Write-Output 'PATCH APPLIED'
exit 0