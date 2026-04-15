#!/bin/bash
# Nginx Setup Verification Guide

echo "ET Pulse Nginx Verification"
echo "=============================="
echo ""

# Step 1: Generate SSL certificate
echo "Step 1: Generate self-signed SSL certificate"
if [ ! -f "./infra/nginx/ssl/cert.pem" ]; then
    bash scripts/generate-ssl-cert.sh
else
    echo "✓ SSL certificate already exists"
fi

echo ""
echo "Step 2: Start Docker Compose"
echo "Command: docker-compose up --build"
echo ""

echo "Step 3: Test Nginx Setup"
echo "Wait 15 seconds for containers to start, then run:"
echo ""

echo "Check HTTPS accessibility:"
echo "  curl -k https://localhost:443/health"
echo ""

echo "Check HTTP → HTTPS redirect:"
echo "  curl -i http://localhost/ 2>&1 | head -5"
echo ""

echo "Check proxy headers:"
echo "  curl -k https://localhost/ -v 2>&1 | grep -i 'x-forwarded'"
echo ""

echo "Check body size limit:"
echo "  curl -k https://localhost/api/briefing -X POST -d '{\"test\":\"data\"}' | head"
echo ""

echo "Verify Web Gateway is behind Nginx:"
echo "  curl -k https://localhost/ 2>&1 | grep -i 'onboarding\\|et.pulse\\|<!DOCTYPE' | head -1"
echo ""

echo "Step 4: View logs"
echo "  docker-compose logs nginx"
echo "  docker-compose logs web-gateway"
echo ""

echo "Step 5: Production SSL Setup (certbot + Let's Encrypt)"
echo "  On EC2: sudo certbot certonly --standalone -d yourdomain.com"
echo "  Copy certs to: /etc/nginx/ssl/"
echo "  Update docker-compose to mount real certificates"
