# AWS Deployment Guide - Full Stack Application

## Architecture Overview
- **Frontend**: React App → S3 + CloudFront
- **Backend**: Node.js → Elastic Beanstalk (or ECS Fargate)
- **Database**: PostgreSQL → AWS RDS
- **DNS**: Route 53

---

## Phase 1: Set Up AWS RDS PostgreSQL

### Steps:
1. Go to **AWS RDS Console** → Create Database
2. Select **PostgreSQL** engine
3. Configuration:
   - **Master username**: postgres
   - **Master password**: Create a strong password
   - **Database name**: sportomic_db
   - **DB instance class**: db.t3.micro (free tier eligible)
   - **Storage**: 20 GB
   - **Public accessibility**: No (unless you need direct access)
   - **VPC Security Group**: Create new or use default

4. **Note the endpoint** (e.g., `mydb.xxxxx.us-east-1.rds.amazonaws.com`)

### Update Backend Connection:
Once RDS is created, update your `db.js`:
```javascript
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432
});

module.exports = pool;
```

---

## Phase 2: Deploy Backend to Elastic Beanstalk

### Prerequisites:
```bash
# Install EB CLI
pip install awsebcli

# Configure AWS credentials
aws configure
```

### Steps:

1. **Initialize Elastic Beanstalk**:
```bash
cd backend
eb init -p node.js-18 my-app --region us-east-1
```

2. **Create environment**:
```bash
eb create production-env
```

3. **Set environment variables**:
```bash
eb setenv \
  DB_USER=postgres \
  DB_HOST=your-rds-endpoint.rds.amazonaws.com \
  DB_NAME=sportomic_db \
  DB_PASSWORD=your-secure-password \
  DB_PORT=5432 \
  NODE_ENV=production \
  CORS_ORIGIN=https://your-frontend-domain.com
```

4. **Deploy**:
```bash
eb deploy
```

5. **Get the URL**:
```bash
eb open  # Opens your backend URL in browser
```

### Update Security Group (Allow Backend → RDS):
1. Go to RDS Dashboard → Security Groups
2. Add inbound rule:
   - Type: PostgreSQL
   - Source: Elastic Beanstalk security group

---

## Phase 3: Update Frontend for Backend API

### 1. Update API calls in React:
Create `frontend/src/config.js`:
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### 2. Build React App:
```bash
cd frontend
REACT_APP_API_URL=https://your-backend-domain.com npm run build
```

---

## Phase 4: Deploy Frontend to S3 + CloudFront

### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://my-frontend-bucket --region us-east-1
```

### Step 2: Upload Build Files
```bash
cd frontend
npm run build
aws s3 sync build/ s3://my-frontend-bucket --delete
```

### Step 3: Create CloudFront Distribution
1. Go to **CloudFront Console** → Create Distribution
2. **Origin domain**: Select your S3 bucket
3. **S3 access**: Create OAI (Origin Access Identity)
4. **Viewer protocol**: HTTPS only
5. **Root object**: index.html
6. **Error pages**: Set 403 and 404 to index.html (for React Router)
7. Create distribution

### Step 4: Update S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity XXXXX"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-frontend-bucket/*"
    }
  ]
}
```

---

## Phase 5: Set Up Custom Domain with Route 53

### Steps:
1. **Register domain** in Route 53 or use existing domain
2. **Create hosted zone** for your domain
3. **Create records**:
   - `frontend.yourdomain.com` → CloudFront distribution
   - `api.yourdomain.com` → Elastic Beanstalk endpoint
   - `www.yourdomain.com` → Frontend (optional)

---

## Complete Deployment Checklist

- [ ] RDS PostgreSQL created with correct credentials
- [ ] Backend DB configuration updated with environment variables
- [ ] Backend deployed to Elastic Beanstalk
- [ ] Security groups configured (EB → RDS access)
- [ ] Frontend build created with correct API endpoint
- [ ] Frontend uploaded to S3
- [ ] CloudFront distribution created
- [ ] Custom domain configured in Route 53
- [ ] SSL/TLS certificates auto-provisioned
- [ ] CORS configured in backend for frontend domain

---

## Testing the Deployment

1. **Test Backend**:
```bash
curl -X POST https://api.yourdomain.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

2. **Test Frontend**: Visit `https://frontend.yourdomain.com`

3. **Check Logs**:
```bash
# Backend logs
eb logs

# RDS Logs (AWS Console)
# CloudFront logs (S3)
```

---

## Cost Optimization Tips

- Use **Free Tier** where possible (t3.micro for RDS/EB)
- Enable **Elastic Beanstalk autoscaling**
- Use **CloudFront caching** for static assets
- Monitor costs with **AWS Budgets**

---

## Common Issues & Solutions

### Issue: Backend can't connect to RDS
- Check RDS security group allows EB security group
- Verify environment variables are set correctly
- Test connection: `psql -h your-endpoint -U postgres`

### Issue: Frontend shows 403 errors
- Update S3 bucket policy
- Verify CloudFront has OAI configured
- Check CloudFront error page settings

### Issue: CORS errors
- Update CORS_ORIGIN in backend environment
- Ensure frontend URL matches exactly

---

## Next Steps (Optional)
- Set up CI/CD with CodePipeline
- Add SSL certificates with ACM
- Configure RDS automated backups
- Set up CloudWatch monitoring
- Enable VPC security best practices
