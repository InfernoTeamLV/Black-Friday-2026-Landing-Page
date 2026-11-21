param(
    [ValidateSet('dev', 'preview')]
    [string]$Task = 'dev'
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$stateFile = Join-Path $projectDirectory ".local\$Task-server.json"
if (!(Test-Path -LiteralPath $stateFile)) {
    Write-Output "No background $Task server is recorded. Use Ctrl+C for a foreground server."
    exit 0
}

$state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
$serverProcessId = [int]$state.processId
if ($serverProcessId -le 0) { throw 'Invalid server process record.' }
$serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $serverProcessId"
if ($serverProcess) {
    $viteEntry = Join-Path $projectDirectory 'node_modules\vite\bin\vite.js'
    $nodeExecutable = (Get-Content -LiteralPath (Join-Path $projectDirectory '.local\node24.txt') -Raw).Trim()
    if ($serverProcess.ExecutablePath -ne $nodeExecutable -or
        !$serverProcess.CommandLine -or
        $serverProcess.CommandLine.IndexOf($viteEntry, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw 'The recorded process no longer belongs to this project. It was not stopped.'
    }
    Stop-Process -Id $serverProcessId -ErrorAction Stop
}
Remove-Item -LiteralPath $stateFile
Write-Output "Stopped the background $Task server."
