param(
    [ValidateSet('dev', 'preview', 'build', 'check', 'security:check')]
    [string]$Task = 'dev'
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$npmCommand = Get-Command npm.cmd -ErrorAction Stop
$npmCli = Join-Path (Split-Path -Parent $npmCommand.Source) 'node_modules\npm\bin\npm-cli.js'
if (!(Test-Path -LiteralPath $npmCli)) {
    throw 'Could not locate the npm CLI. Select Node 24, then run npm run dev manually.'
}
$runtimeFile = Join-Path $projectDirectory '.local\node24.txt'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodeExecutable = if (Test-Path -LiteralPath $runtimeFile) {
    (Get-Content -LiteralPath $runtimeFile -Raw).Trim()
} elseif ($nodeCommand) {
    $nodeCommand.Source
} else {
    $null
}
$previousPath = $env:Path

Push-Location -LiteralPath $projectDirectory
try {
    # Prefer the runtime selected during setup, then the system's Node 24.
    # Keep the remembered path local to this checkout and verify it before use.
    if ($nodeExecutable -and (Test-Path -LiteralPath $nodeExecutable) -and
        ((& $nodeExecutable --version) -match '^v24\.')) {
        $env:Path = (Split-Path -Parent $nodeExecutable) + ';' + $env:Path
        & $nodeExecutable $npmCli run $Task
    } else {
        # Portable fallback for fresh checkouts; the first run needs registry access.
        & $npmCommand.Source exec --yes --prefer-offline --package=node@24 -- node $npmCli run $Task
    }
    $taskExitCode = $LASTEXITCODE
} finally {
    $env:Path = $previousPath
    Pop-Location
}
exit $taskExitCode
