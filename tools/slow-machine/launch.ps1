param([string]$Mask = '0x30000', [int]$Port = 9333, [string]$Gpu = 'real', [string]$Size = '1366,768')
# Starts a headless Chrome of its own (own profile folder) kept to the processor cores in $Mask, which its child
# processes inherit. 0x30000 is two of the efficiency cores of this machine.
$dir = Join-Path $PSScriptRoot ("profile-" + $Port)
[System.Diagnostics.Process]::GetCurrentProcess().ProcessorAffinity = [IntPtr][Convert]::ToInt64($Mask, 16)
$flags = @('--headless=new', "--remote-debugging-port=$Port", "--user-data-dir=`"$dir`"", "--window-size=$Size", '--no-first-run', '--mute-audio',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--autoplay-policy=no-user-gesture-required')
if ($Gpu -eq 'soft') { $flags += '--use-angle=swiftshader'; $flags += '--enable-unsafe-swiftshader' }
$flags += 'about:blank'
$p = Start-Process -FilePath 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' -ArgumentList $flags -PassThru
"started $($p.Id) mask $Mask port $Port gpu $Gpu"
