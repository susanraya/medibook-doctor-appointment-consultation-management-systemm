<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-11-24

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- MySQL
- SQL Server

## Decision Outcome

Chosen option: PostgreSQL 16, because Transactions and row-level locking (SELECT FOR UPDATE on the slot row) directly implement 'book a slot exactly once'; holds the relational doctor/specialization/mapping/appointment data and supports encryption at rest for health-data safeguards.

## Consequences

Requires disciplined transaction scoping around the slot lock; single RDS instance is adequate for the pilot scale (NFR-012).
<!-- sdlc:auto:end adr -->