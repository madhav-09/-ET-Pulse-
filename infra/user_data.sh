#!/bin/bash
set -e

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt-get install -y git

# Clone repository (optional - for automated deployment)
# cd /home/ubuntu
# git clone https://github.com/madhav-09/-ET-Pulse-.git et-pulse
# cd et-pulse

echo "Docker and Docker Compose installed successfully"
