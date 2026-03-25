# CI/CD Implementation Plan - Shopizer Shop (React)

**Date**: March 25, 2026  
**Project**: Shopizer Shop Frontend  
**Technology**: React 16, JavaScript, Node.js, Nginx

---

## Current State

### Technology Stack
- **Framework**: React 16.6.0
- **Language**: JavaScript (ES6+)
- **Package Manager**: npm
- **Build Tool**: React Scripts 4.0.1 (Create React App)
- **Testing**: Jest, React Testing Library
- **Container**: Docker (Nginx Alpine)

### Existing Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- No linting configured (needs setup)

---

## CI/CD Pipeline Structure

### Stage 1: Build and Test (5-7 minutes)
```yaml
- Install dependencies (npm ci)
- Run linting (ESLint)
- Run unit tests with coverage
- Build production bundle
- Upload artifacts
```

### Stage 2: Code Quality (3-5 minutes)
```yaml
- Run ESLint with detailed reports
- SonarCloud analysis (optional)
- Check bundle size
- Lighthouse CI (performance)
```

### Stage 3: Security Scan (3-5 minutes)
```yaml
- npm audit for vulnerabilities
- Snyk security scan
- Secret detection (TruffleHog)
- License compliance check
```

### Stage 4: Docker Build (3-5 minutes)
```yaml
- Build Docker image
- Tag with version/SHA
- Push to Docker Hub
- Trivy container scan
```

### Stage 5: Deploy Staging (2-3 minutes)
```yaml
- Deploy to staging environment
- Run smoke tests
- Verify deployment
```

### Stage 6: Deploy Production (2-3 minutes)
```yaml
- Manual approval required
- Deploy to production
- Health checks
- Slack notification
```

---

## Implementation Steps

### Phase 1: Setup CI Configuration (Week 1)

#### 1.1 Create GitHub Actions Workflow

**File**: `.github/workflows/ci-cd.yml`

```yaml
name: Shopizer Shop CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '14'
  DOCKER_IMAGE: shopizerecomm/shopizer-shop

jobs:
  build-and-test:
    name: Build and Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
        continue-on-error: true
      
      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
        env:
          CI: true
      
      - name: Build production
        run: npm run build
        env:
          CI: false
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-shop
        continue-on-error: true
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: shop-build
          path: build/
          retention-days: 7

  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    needs: build-and-test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint with report
        run: npm run lint -- --format=json --output-file=eslint-report.json
        continue-on-error: true
      
      - name: Analyze bundle size
        run: |
          npm run build
          npx source-map-explorer 'build/static/js/*.js' --json > bundle-analysis.json
        continue-on-error: true
      
      - name: SonarCloud Scan
        if: github.event_name == 'push'
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        continue-on-error: true
      
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
        continue-on-error: true

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: build-and-test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true
      
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
        continue-on-error: true

  docker-build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [build-and-test, security-scan]
    if: github.event_name == 'push'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: shop-build
          path: build/
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Docker Hub
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_PASSWORD }}
        continue-on-error: true
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_IMAGE }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
        continue-on-error: true
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.DOCKER_IMAGE }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
        continue-on-error: true

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: docker-build
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment:
      name: staging
      url: https://shop-staging.shopizer.com
    
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging environment"
        # Add actual deployment commands here

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: docker-build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://shop.shopizer.com
    
    steps:
      - name: Deploy to production
        run: echo "Deploy to production environment"
        # Add actual deployment commands here
```

#### 1.2 Add ESLint Configuration

**File**: `.eslintrc.json`

```json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "react/prop-types": "warn"
  }
}
```

#### 1.3 Update package.json Scripts

Add these scripts:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:ci": "react-scripts test --coverage --watchAll=false",
    "lint": "eslint src --ext .js,.jsx",
    "lint:fix": "eslint src --ext .js,.jsx --fix",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

#### 1.4 Create SonarCloud Configuration

**File**: `sonar-project.properties`

```properties
sonar.projectKey=shopizer-shop
sonar.organization=shopizer
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.js,**/*.spec.js
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/node_modules/**,**/*.test.js,**/*.spec.js,**/build/**
```

---

### Phase 2: Testing Setup (Week 2)

#### 2.1 Add Jest Configuration

**File**: `package.json` (add jest config)

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/serviceWorker.js",
      "!src/**/*.test.{js,jsx}"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 50,
        "functions": 50,
        "lines": 50,
        "statements": 50
      }
    }
  }
}
```

#### 2.2 Add Testing Dependencies

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

### Phase 3: Build Optimization (Week 3)

#### 3.1 Add Build Optimizations

**File**: `.env.production`

```env
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
IMAGE_INLINE_SIZE_LIMIT=10000
```

#### 3.2 Add Bundle Analysis

```bash
npm install --save-dev source-map-explorer webpack-bundle-analyzer
```

---

### Phase 4: Docker Optimization (Week 4)

#### 4.1 Optimize Dockerfile

**File**: `Dockerfile`

```dockerfile
# Build stage
FROM node:14-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY conf/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Copy environment script
COPY env.sh /usr/share/nginx/html/
COPY .env /usr/share/nginx/html/
COPY env-config.js /usr/share/nginx/html/

# Add bash
RUN apk add --no-cache bash

# Make script executable
RUN chmod +x /usr/share/nginx/html/env.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g 'daemon off;'"]
```

#### 4.2 Add .dockerignore

**File**: `.dockerignore`

```
node_modules
npm-debug.log
build
coverage
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
*.md
.vscode
.idea
```

#### 4.3 Optimize Nginx Configuration

**File**: `conf/conf.d/default.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## Required Dependencies

```bash
# Development dependencies
npm install --save-dev \
  eslint \
  eslint-config-react-app \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  source-map-explorer
```

---

## Required Secrets

Configure in GitHub: Settings → Secrets and variables → Actions

```
DOCKERHUB_USERNAME=<docker-hub-username>
DOCKERHUB_PASSWORD=<docker-hub-token>
SONAR_TOKEN=<sonarcloud-token>
SNYK_TOKEN=<snyk-token>
SLACK_WEBHOOK_URL=<slack-webhook>
```

---

## Success Metrics

- Build time: < 7 minutes
- Test coverage: > 50%
- Bundle size: < 2MB (gzipped)
- Lighthouse score: > 90
- Zero high/critical vulnerabilities
- Deployment frequency: Multiple per day

---

## Quick Start

```bash
# Install dependencies
npm install --save-dev eslint @testing-library/react source-map-explorer

# Test locally
npm ci
npm run lint
npm run test:ci
npm run build

# Analyze bundle
npm run analyze

# Build Docker image
docker build -t shopizer-shop:local .
docker run -p 8080:80 shopizer-shop:local

# Push to trigger CI
git checkout -b feature/ci-cd-shop
git add .
git commit -m "feat: implement CI/CD for shop"
git push origin feature/ci-cd-shop
```

---

## Performance Optimization

### Code Splitting
```javascript
// Use React.lazy for route-based code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Product = React.lazy(() => import('./pages/Product'));
```

### Bundle Size Optimization
- Enable tree shaking
- Use production builds
- Compress images
- Lazy load components
- Use CDN for large libraries

---

## Monitoring

### Add Performance Monitoring

```javascript
// src/reportWebVitals.js
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};
```

---

## Next Steps

1. Create `.github/workflows/ci-cd.yml`
2. Add `.eslintrc.json`
3. Update `package.json` scripts
4. Create `sonar-project.properties`
5. Optimize `Dockerfile`
6. Add `.dockerignore`
7. Install dev dependencies
8. Configure GitHub secrets
9. Test pipeline with PR

---

**Estimated Implementation Time**: 2-3 weeks
