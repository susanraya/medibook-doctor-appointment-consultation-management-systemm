# Deployment Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start how-it-deploys -->
Pushes to `main` run `.github/workflows/deploy.yml`, which builds the API image (if there is a backend) and deploys the SPA to AWS Amplify. Commits touching only `docs/sdlc/**` don't deploy. Deployments can also be started from the platform's Deployment tab.
<!-- sdlc:auto:end how-it-deploys -->

<!-- sdlc:auto:start environments -->
| Name | Service | Runtime | Scaling | Environment |
|---|---|---|---|---|
| Web SPA Hosting | AWS S3 + CloudFront (static SPA origin) | React 19 static build | CDN-served static assets | dev |
| API Service | AWS App Runner (or ECS Fargate) | FastAPI 0.115 on Python / Uvicorn, HTTPS | 1 small instance for pilot, horizontal if needed | dev |
| Worker Service | AWS ECS Fargate (background worker) | Celery worker + beat on Python | 1 worker for pilot | dev |
| Database | AWS RDS for PostgreSQL 16 | PostgreSQL 16, encryption at rest (KMS), automated backups | single instance, pilot-sized | dev |
| Queue/Scheduler | AWS ElastiCache for Redis (or redis:7-alpine container) | Redis 7 | single node | dev |
| Email Provider | SendGrid | SaaS transactional email API | managed by provider | dev |
| Secrets | AWS Secrets Manager | stores SENDGRID_API_KEY, REDIS_URL, DATABASE_URL | managed | dev |
<!-- sdlc:auto:end environments -->

<!-- sdlc:auto:start live -->
**Frontend URL:** https://p881d1f68dbb1.dshared.amplifyapp.local

**Backend URL:** https://881d1f68dbb1.local.awsapprunner.local

**Database:** PostgreSQL · aisdlc_881d1f68dbb1

**Version:** 484160003c3e

**Commit:** `4841600`

**Finished:** 2026-11-16
<!-- sdlc:auto:end live -->

<!-- sdlc:auto:start topology -->
```mermaid
graph LR
  n_Web_SPA_Hosting["Web SPA Hosting<br/>AWS S3 + CloudFront (static SPA origin)"]
  n_API_Service["API Service<br/>AWS App Runner (or ECS Fargate)"]
  n_Worker_Service["Worker Service<br/>AWS ECS Fargate (background worker)"]
  n_Database["Database<br/>AWS RDS for PostgreSQL 16"]
  n_Queue_Scheduler["Queue/Scheduler<br/>AWS ElastiCache for Redis (or redis:7-alpine container)"]
  n_Email_Provider["Email Provider<br/>SendGrid"]
  n_Secrets["Secrets<br/>AWS Secrets Manager"]
  n_Web_SPA_Hosting -->|"HTTPS"| n_API_Service
  n_API_Service -->|"TLS (PostgreSQL)"| n_Database
  n_API_Service -->|"TLS (Redis)"| n_Queue_Scheduler
  n_Worker_Service -->|"TLS (Redis)"| n_Queue_Scheduler
  n_Worker_Service -->|"TLS (PostgreSQL)"| n_Database
  n_Worker_Service -->|"HTTPS"| n_Email_Provider
  n_API_Service -->|"HTTPS"| n_Secrets
  n_Worker_Service -->|"HTTPS"| n_Secrets
```
<!-- sdlc:auto:end topology -->
