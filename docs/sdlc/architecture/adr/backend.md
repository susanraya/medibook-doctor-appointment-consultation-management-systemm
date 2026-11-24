<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-11-24

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Django REST Framework
- Flask

## Decision Outcome

Chosen option: FastAPI 0.115, because Hosts all booking integrity, role-based authorization and the static mapping lookup in clean, typed endpoints, pairing with PostgreSQL row locking for the double-booking guard.

## Consequences

Async endpoints and background email dispatch need an external worker (Celery+Redis) rather than in-process threads to keep bookings non-blocking.
<!-- sdlc:auto:end adr -->