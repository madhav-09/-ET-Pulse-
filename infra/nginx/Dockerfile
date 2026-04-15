# syntax=docker/dockerfile:1

FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Health check via HTTP (port 80)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
