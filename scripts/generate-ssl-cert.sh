#!/bin/bash
# Generate self-signed SSL certificate for local testing

CERT_DIR="./infra/nginx/ssl"
mkdir -p "$CERT_DIR"

echo "Generating self-signed certificate..."
openssl req \
  -x509 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.pem" \
  -out "$CERT_DIR/cert.pem" \
  -days 365 \
  -nodes \
  -subj "/C=IN/ST=State/L=City/O=ET-Pulse/CN=localhost"

echo "✓ Certificate generated at $CERT_DIR"
echo "  - cert.pem (certificate)"
echo "  - key.pem (private key)"
echo ""
echo "For production:"
echo "  Use certbot with Let's Encrypt"
echo "  certbot certonly --standalone -d yourdomain.com"
