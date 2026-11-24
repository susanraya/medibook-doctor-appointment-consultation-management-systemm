<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-11-24

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- GCP
- Azure

## Decision Outcome

Chosen option: AWS, because One account provides managed PostgreSQL (RDS with KMS encryption and backups), app/worker hosting, Redis (ElastiCache), and Secrets Manager for the SendGrid key, with audit-friendly access controls, and scales beyond the pilot without re-platforming.

## Consequences

AWS-specific managed services create some vendor coupling; acceptable for the clinic pilot and future rollout.
<!-- sdlc:auto:end adr -->