$port = 5500
$root = (Get-Item -Path $PSScriptRoot).FullName

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
try {
    $listener.Start()
    Write-Host "Server started on port $port. Root: $root"
} catch {
    $msg = $_.Exception.Message
    Write-Host "Failed to start listener on port ${port}: $msg"
    exit 1
}

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8)

        $requestLine = $reader.ReadLine()
        if (-not $requestLine) {
            $client.Close()
            continue
        }

        # Read remaining request headers
        while ($true) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($line)) { break }
        }

        $parts = $requestLine.Split(" ")
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $rawUrl = $parts[1]
        $path = $rawUrl.Split("?")[0]
        $path = [System.Uri]::UnescapeDataString($path)
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }

        $relPath = $path.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relPath))

        if (-not $fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($fullPath)) {
            $body = [System.Text.Encoding]::UTF8.GetBytes("<html><body><h1>404 Not Found</h1></body></html>")
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/html; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($body, 0, $body.Length)
            $stream.Flush()
            $client.Close()
            continue
        }

        $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
        $contentType = "application/octet-stream"
        if ($mimeTypes.ContainsKey($ext)) {
            $contentType = $mimeTypes[$ext]
        }

        $fileBytes = [System.IO.File]::ReadAllBytes($fullPath)
        $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($fileBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($fileBytes, 0, $fileBytes.Length)
        $stream.Flush()
        $client.Close()
    } catch {
        # ignore connection errors
    }
}
