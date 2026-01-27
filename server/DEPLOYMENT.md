# Castglo Backend - Deployment Guide

## Quick Start (Development)

### Local Setup

1. **Install Node.js** (v16 or higher)

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

Server will be available at `http://localhost:5000`

### Docker Compose (Recommended for Development)

1. **Create .env file** with your credentials:
   ```bash
   cp .env.example .env
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f api
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

## Production Deployment

### Option 1: Google Cloud Run

#### Prerequisites
- Google Cloud Project
- gcloud CLI installed
- Docker

#### Steps

1. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Build and push Docker image**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/castglo-backend
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy castglo-backend \
     --image gcr.io/YOUR_PROJECT_ID/castglo-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="MONGO_URI=your_mongo_uri,JWT_SECRET=your_secret,..." \
     --memory 512Mi \
     --cpu 1 \
     --timeout 900
   ```

4. **Set environment variables**
   ```bash
   gcloud run services update castglo-backend \
     --region us-central1 \
     --update-env-vars MONGO_URI=mongodb+srv://...,JWT_SECRET=...
   ```

### Option 2: Heroku Deployment

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   heroku create castglo-backend
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGO_URI="mongodb+srv://..."
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set NODE_ENV="production"
   # ... set other variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **View logs**
   ```bash
   heroku logs --tail
   ```

### Option 3: AWS EC2 Deployment

#### Prerequisites
- AWS account
- EC2 instance with Ubuntu/Amazon Linux
- SSH key pair

#### Steps

1. **Connect to instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

2. **Install dependencies**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   curl https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. **Clone repository**
   ```bash
   git clone <your-repo>
   cd castglo/server
   ```

4. **Create .env file** with production values

5. **Run with PM2** (process manager)
   ```bash
   sudo npm install -g pm2
   pm2 start sever.js --name "castglo-api"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx** as reverse proxy
   ```bash
   sudo yum install nginx
   ```

   Create `/etc/nginx/sites-available/castglo`:
   ```nginx
   upstream castglo_api {
     server localhost:5000;
   }

   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://castglo_api;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   Enable and start:
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo yum install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 4: Docker Swarm/Kubernetes

#### Prerequisites
- Docker Swarm or Kubernetes cluster
- kubectl (for Kubernetes)

#### Docker Swarm

1. **Build and push image**
   ```bash
   docker build -t your-registry/castglo-backend:latest .
   docker push your-registry/castglo-backend:latest
   ```

2. **Create docker-compose.prod.yml**
   ```yaml
   version: '3.8'
   services:
     api:
       image: your-registry/castglo-backend:latest
       ports:
         - "5000:5000"
       environment:
         - MONGO_URI=mongodb+srv://...
         - JWT_SECRET=...
       replicas: 3
       placement:
         constraints: [node.role == worker]
   ```

3. **Deploy**
   ```bash
   docker stack deploy -c docker-compose.prod.yml castglo
   ```

#### Kubernetes

1. **Create deployment manifests** (deployment.yaml)
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: castglo-api
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: castglo-api
     template:
       metadata:
         labels:
           app: castglo-api
       spec:
         containers:
         - name: api
           image: your-registry/castglo-backend:latest
           ports:
           - containerPort: 5000
           env:
           - name: MONGO_URI
             valueFrom:
               secretKeyRef:
                 name: castglo-secrets
                 key: mongo-uri
           - name: JWT_SECRET
             valueFrom:
               secretKeyRef:
                 name: castglo-secrets
                 key: jwt-secret
           resources:
             requests:
               cpu: 250m
               memory: 512Mi
             limits:
               cpu: 500m
               memory: 1Gi
           livenessProbe:
             httpGet:
               path: /health
               port: 5000
             initialDelaySeconds: 30
             periodSeconds: 10
   ```

2. **Create service**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: castglo-api-service
   spec:
     selector:
       app: castglo-api
     ports:
     - protocol: TCP
       port: 80
       targetPort: 5000
     type: LoadBalancer
   ```

3. **Deploy**
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   ```

## Environment Variables

### Required for All Environments

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/castglo

JWT_SECRET=generate-a-strong-random-string-here
JWT_EXPIRE=7d

CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

FRONTEND_URL=https://your-frontend-domain.com
MOBILE_APP_URL=https://mobile-app-url.com

ADMIN_EMAIL=admin@castglo.com
```

## Monitoring & Logging

### Setup Monitoring

1. **PM2 Plus** (for PM2 managed instances)
   ```bash
   pm2 plus
   ```

2. **CloudWatch** (AWS)
   - Logs automatically sent from EC2
   - Set up dashboards and alerts

3. **Google Cloud Logging** (Cloud Run)
   - Logs automatically available
   - Set up log sinks

### Setup Alerting

1. Create alerts for:
   - High error rate (>1% of requests)
   - High response time (>5 seconds average)
   - Low uptime (<99.5%)
   - Database connection failures
   - Out of memory
   - Disk space low

## Database

### MongoDB Atlas (Recommended)

1. **Create cluster** at https://www.mongodb.com/cloud/atlas

2. **Create database user** with username/password

3. **Whitelist IPs** for your server

4. **Get connection string** and set as MONGO_URI

### Backup Strategy

```bash
# Automatic daily backups via MongoDB Atlas
# Or manual backup:
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/castglo" --out ./backup
```

## Security Checklist

- [ ] JWT_SECRET is strong (>32 characters random)
- [ ] NODE_ENV set to production
- [ ] Database user has limited permissions
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS properly configured for frontend domains
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] No console.log in production code
- [ ] No secrets in environment configs
- [ ] IP whitelist for database (if not serverless)
- [ ] Cloudinary API secret secured
- [ ] Stripe API key is live key (not test)
- [ ] Email credentials secured
- [ ] Regular security updates for dependencies
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured

## Scaling

### Horizontal Scaling
- Use load balancer (AWS ELB, Google Cloud LB, or Nginx)
- Deploy multiple API instances
- Use sticky sessions for JWT

### Database Scaling
- MongoDB Atlas auto-scaling
- Implement caching (Redis) for frequently accessed data
- Archive old data to separate collections

### Performance Optimization
- Add CDN for static assets
- Implement database indexing
- Cache frequently accessed data
- Compress API responses
- Lazy load related data

## Rollback Procedure

### Heroku
```bash
heroku releases
heroku rollback v5
```

### Cloud Run
```bash
gcloud run deploy castglo-backend --image gcr.io/PROJECT/castglo-backend:previous-version
```

### EC2 with Git
```bash
git log
git checkout <previous-commit>
pm2 restart castglo-api
```

## Troubleshooting

### Server won't start
```bash
# Check logs
npm run dev

# Verify MongoDB connection
mongosh "mongodb+srv://..."

# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install
```

### High memory usage
```bash
# Check Node.js memory
node --max-old-space-size=4096 sever.js

# Enable garbage collection logging
node --trace-gc sever.js
```

### Database connection issues
- Verify MONGO_URI
- Check IP whitelist in MongoDB Atlas
- Ensure database credentials are correct
- Check network connectivity

### Email not sending
- Verify EMAIL_SERVICE and credentials
- Check Gmail app passwords (if using Gmail)
- Verify SMTP settings
- Check email service logs

## Support

For issues or questions, refer to:
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
