# Production Deployment Guide

## Overview
This guide covers deploying the AI Prompt Manager to production with enterprise-grade security, monitoring, and performance optimizations.

## Architecture Overview

```
                    Load Balancer
                          |
                    +-----------+
                    |    CDN    |
                    +-----------+
                          |
                    +-----------+
                    |  Firewall  |
                    +-----------+
                          |
                    +-----------+
                    | Web Server |
                    +-----------+
                          |
                    +-----------+
                    | App Server |
                    +-----------+
                          |
                    +-----------+
                    | Database   |
                    +-----------+
                          |
                    +-----------+
                    |   Redis    |
                    +-----------+
```

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **MongoDB**: 5.0 or higher
- **Redis**: 6.0 or higher (for rate limiting and caching)
- **Nginx**: 1.20 or higher (for reverse proxy)
- **SSL Certificate**: For HTTPS
- **Domain**: For production deployment

### Environment Variables
```bash
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/prompt-manager
REDIS_URL=redis://localhost:6379

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/prompt-manager/app.log

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### 2. Database Configuration

```bash
# Configure MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongo
> use prompt-manager
> db.createUser({
    user: "promptuser",
    pwd: "your-secure-password",
    roles: ["readWrite"]
  })
> exit

# Configure Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-repo/prompt-manager.git
cd prompt-manager

# Install dependencies
npm install --production

# Create ecosystem file for PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'prompt-manager',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/prompt-manager/error.log',
    out_file: '/var/log/prompt-manager/out.log',
    log_file: '/var/log/prompt-manager/combined.log',
    time: true
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/prompt-manager
sudo chown $USER:$USER /var/log/prompt-manager

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/prompt-manager
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Frontend
    location / {
        root /var/www/prompt-manager/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Auth endpoints with stricter rate limiting
    location /api/auth/ {
        proxy_pass http://localhost:3000;
        limit_req zone=auth burst=10 nodelay;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/prompt-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Deployment

### 1. Build for Production

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/prompt-manager/
```

### 2. Environment Configuration

```bash
# Create .env.production file
cat > .env.production << EOF
VITE_API_URL=https://yourdomain.com/api
VITE_NODE_ENV=production
EOF
```

## Security Configuration

### 1. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3. Database Security

```bash
# Configure MongoDB authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

## Monitoring and Logging

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g clinic
npm install -g pm2-logrotate

# Set up log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Set up log rotation
sudo nano /etc/logrotate.d/prompt-manager
# Add:
# /var/log/prompt-manager/*.log {
#     daily
#     missingok
#     rotate 52
#     compress
#     delaycompress
#     notifempty
#     create 644 www-data www-data
#     postrotate
#         pm2 reloadLogs
#     endscript
# }
```

### 3. Health Checks

```bash
# Create health check script
cat > /usr/local/bin/health-check.sh << EOF
#!/bin/bash
# Check if application is running
if ! pm2 list | grep -q "prompt-manager.*online"; then
    echo "Application is down, restarting..."
    pm2 restart prompt-manager
    # Send notification (add your notification method)
fi

# Check database connection
if ! mongo --eval "db.adminCommand('ismaster')" > /dev/null 2>&1; then
    echo "MongoDB is down"
    # Send notification
fi

# Check Redis connection
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Redis is down"
    # Send notification
fi
EOF

chmod +x /usr/local/bin/health-check.sh

# Add to crontab
echo "*/5 * * * * /usr/local/bin/health-check.sh" | sudo crontab -
```

## Performance Optimization

### 1. Database Optimization

```javascript
// Create indexes in MongoDB
db.prompts.createIndex({ "title": "text", "description": "text" });
db.prompts.createIndex({ "category": 1 });
db.prompts.createIndex({ "tags": 1 });
db.prompts.createIndex({ "usageCount": -1 });
db.prompts.createIndex({ "createdAt": -1 });
db.users.createIndex({ "email": 1 }, { unique: true });
```

### 2. Caching Strategy

```javascript
// Redis caching configuration
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});
```

### 3. CDN Configuration

```nginx
# Add CDN configuration to Nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-CDN "HIT";
}
```

## Backup Strategy

### 1. Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p \$BACKUP_DIR

# Create backup
mongodump --uri="mongodb://promptuser:password@localhost:27017/prompt-manager" --out="\$BACKUP_DIR/backup_\$DATE"

# Compress backup
tar -czf "\$BACKUP_DIR/backup_\$DATE.tar.gz" "\$BACKUP_DIR/backup_\$DATE"
rm -rf "\$BACKUP_DIR/backup_\$DATE"

# Keep only last 7 days
find \$BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-db.sh" | sudo crontab -
```

### 2. Application Backup

```bash
# Create application backup script
cat > /usr/local/bin/backup-app.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/application"
mkdir -p \$BACKUP_DIR

# Backup application code
tar -czf "\$BACKUP_DIR/app_\$DATE.tar.gz" /path/to/prompt-manager

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 "\$BACKUP_DIR/pm2_dump_\$DATE"

# Keep only last 30 days
find \$BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-app.sh

# Add to crontab
echo "0 3 * * 0 /usr/local/bin/backup-app.sh" | sudo crontab -
```

## Deployment Checklist

### Pre-deployment
- [ ] All environment variables set
- [ ] Database indexes created
- [ ] SSL certificates obtained
- [ ] Firewall configured
- [ ] Monitoring tools installed
- [ ] Backup scripts created
- [ ] Health checks configured
- [ ] Load testing completed

### Post-deployment
- [ ] Application running correctly
- [ ] Database connections working
- [ ] Redis connections working
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Logging functional
- [ ] Monitoring alerts configured
- [ ] Backup process working

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify database connections
   - Check log files: `pm2 logs prompt-manager`

2. **Database connection errors**
   - Verify MongoDB is running: `sudo systemctl status mongod`
   - Check connection string
   - Verify authentication

3. **Redis connection errors**
   - Verify Redis is running: `sudo systemctl status redis-server`
   - Check connection URL
   - Verify firewall settings

4. **Nginx configuration errors**
   - Test configuration: `sudo nginx -t`
   - Check error logs: `sudo tail -f /var/log/nginx/error.log`

5. **SSL certificate issues**
   - Verify certificate path
   - Check certificate expiration
   - Test with: `sudo certbot certificates`

### Performance Issues

1. **High CPU usage**
   - Check PM2 processes: `pm2 monit`
   - Analyze with: `clinic doctor -- node server.js`

2. **High memory usage**
   - Check memory leaks: `clinic bubbleprof -- node server.js`
   - Monitor with: `pm2 monit`

3. **Slow database queries**
   - Enable query logging
   - Check indexes: `db.prompts.getIndexes()`
   - Analyze with: `db.prompts.explain("executionStats")`

## Scaling Considerations

### Horizontal Scaling
- Use PM2 cluster mode
- Add more application servers
- Configure load balancer
- Use MongoDB replica set

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching
- Use CDN for static assets

### Database Scaling
- Implement sharding
- Use read replicas
- Optimize indexes
- Consider alternative databases

## Security Checklist

### Application Security
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] SQL injection protection
- [ ] Rate limiting configured
- [ ] Authentication secure
- [ ] Authorization proper
- [ ] Logging enabled

### Infrastructure Security
- [ ] Firewall configured
- [ ] SSL/TLS enabled
- [ ] Security headers set
- [ ] Regular updates applied
- [ ] Backup encryption
- [ ] Access control implemented
- [ ] Monitoring enabled
- [ ] Incident response plan

This deployment guide provides a comprehensive approach to deploying the AI Prompt Manager in a production environment with enterprise-grade security, monitoring, and performance optimizations.
