# run-docker.ps1
# Script to build Docker image and run container for Next.js frontend

$ImageName = "uniwise-frontend"
$ContainerName = "uniwise-frontend"
$HostPort = 3000
$ContainerPort = 3000
$NetWorkName = "uniwise"

# 1. Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Cyan
& docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker is not running. Please start Docker Desktop and try again."
    Exit 1
}

# 2. Stop and remove existing container if it exists
Write-Host "Checking for existing container '$ContainerName'..." -ForegroundColor Cyan
$existingContainer = & docker ps -a --filter "name=^/${ContainerName}$" --format "{{.ID}}"
if ($existingContainer) {
    Write-Host "Stopping and removing existing container '$ContainerName'..." -ForegroundColor Yellow
    & docker stop $ContainerName > $null 2>&1
    & docker rm $ContainerName > $null 2>&1
}

# 3. Build the Docker image
Write-Host "Building Docker image '$ImageName'..." -ForegroundColor Cyan
& docker build -t $ImageName .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build Docker image."
    Exit 1
}

# 4. Run the Docker container
Write-Host "Starting Docker container '$ContainerName' on port $HostPort..." -ForegroundColor Cyan
& docker run -d --name $ContainerName -p "${HostPort}:${ContainerPort}" --network $NetWorkName $ImageName 
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start Docker container."
    Exit 1
}

# 5. Verify the container is running and print access URL
Write-Host "`nSuccessfully started container!" -ForegroundColor Green
Write-Host "Application is available at: " -NoNewline
Write-Host "http://localhost:$HostPort" -ForegroundColor Green
Write-Host "`nTo view logs, run: " -NoNewline
Write-Host "docker logs -f $ContainerName" -ForegroundColor Yellow
