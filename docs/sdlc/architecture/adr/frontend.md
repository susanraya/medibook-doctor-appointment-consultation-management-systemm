<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-11-16

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Angular

## Decision Outcome

Chosen option: React 19, because Builds the single responsive SPA that serves patients on phones, doctors managing their day, and the admin dashboard, including live slot calendars and record entry. Runs in any mobile browser, meeting the no-native-app decision.

## Consequences

A SPA needs client-side routing and a sensible state/data layer; served from its own origin it uses the Bearer token rather than cookies.
<!-- sdlc:auto:end adr -->