# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
74 tests · Passed 60 · Failed 0 · Skipped 0 · Not run 14

Acceptance criteria covered: 13/67 · passing: 4/67
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start tests -->
## Sprint 1

### US-002: Sign in and sign out

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-007 | test_ac007_get_current_session_rejects_idle_token | Unit | Passed | `backend/tests/unit/test_deps.py` |
| AC-011 | test_ac011_require_role_allows_matching_role_and_rejects_others | Unit | Passed | `backend/tests/unit/test_deps.py` |
| AC-012 | test_ac012_get_current_session_rejects_missing_token | Unit | Passed | `backend/tests/unit/test_deps.py` |
| AC-013 | test_ac013_get_current_session_rejects_deactivated_user | Unit | Passed | `backend/tests/unit/test_deps.py` |
| — | test_get_current_session_refreshes_last_activity | Unit | Passed | `backend/tests/unit/test_deps.py` |
| — | test_get_current_session_rejects_unknown_token | Unit | Passed | `backend/tests/unit/test_deps.py` |
| AC-001 | test_ac001_hash_password_never_stores_the_plain_value | Unit | Passed | `backend/tests/unit/test_security.py` |
| — | test_generate_session_token_is_unique_and_opaque | Unit | Passed | `backend/tests/unit/test_security.py` |
| AC-006 | test_ac006_revoke_session_marks_it_revoked_and_is_idempotent | Unit | Passed | `backend/tests/unit/test_sessions.py` |
| AC-013 | test_ac013_revoke_all_sessions_ends_every_live_token_for_the_user | Unit | Passed | `backend/tests/unit/test_sessions.py` |
| — | test_create_session_issues_a_live_token | Unit | Passed | `backend/tests/unit/test_sessions.py` |
| AC-006 | App > [AC-006] sign-out clears the token and returns to sign-in | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-011, AC-012 | App > [AC-011][AC-012] redirects a patient opening a doctor route and shows the role notice | Unit | Passed | `frontend/src/App.test.tsx` |
| — | App > renders a screen inside the app shell and shows its menu | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-001 | SignIn > [AC-001] submitting the register tab with valid data registers and stores the token | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-002 | SignIn > [AC-002] a 409 on register shows the duplicate-email message on the email field and keeps form data | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-003 | SignIn > [AC-003] a 422 on register maps each field, message onto the matching input | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-003 | SignIn > [AC-003] client-side validation blocks an empty register submission | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-005 | SignIn > [AC-005] a 401 on sign-in shows exactly one generic message and no field hint | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| — | SignIn > a 400 on the first-login flow shows 'password is already set - sign in instead' | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| — | SignIn > the first-login flow stores the token and routes to the role dashboard on 200 | Unit | Passed | `frontend/src/screens/SignIn.test.tsx` |
| AC-011 | test_ac011_patient_token_is_rejected_on_admin_only_endpoint | Integration | Passed | `backend/tests/acceptance/test_role_enforcement.py` |
| AC-011 | test_ac011_patient_token_is_rejected_on_doctor_only_endpoint | Integration | Passed | `backend/tests/acceptance/test_role_enforcement.py` |
| AC-012 | test_ac012_doctor_token_is_rejected_on_admin_only_endpoint | Integration | Passed | `backend/tests/acceptance/test_role_enforcement.py` |
| AC-001 | test_ac001_register_creates_patient_and_signs_in | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-002 | test_ac002_register_duplicate_email_is_rejected | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-003 | test_ac003_register_rejects_invalid_or_missing_fields | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-004 | test_ac004_login_returns_token_and_role | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-005 | test_ac005_login_failure_message_is_generic_and_identical | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-006 | test_ac006_logout_revokes_token | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-007 | test_ac007_idle_session_expires_and_activity_refreshes | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-011 | test_ac011_me_reports_role_from_the_server | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-012 | test_ac012_me_without_token_is_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-013 | test_ac013_deactivated_user_is_denied_and_all_tokens_revoked | Integration | Passed | `backend/tests/integration/test_auth.py` |
| — | test_every_approved_path_is_in_the_openapi_document | Integration | Passed | `backend/tests/integration/test_stub_routes.py` |
| — | test_stub_endpoints_resolve | Integration | Passed | `backend/tests/integration/test_stub_routes.py` |
| NFR-011, AC-001, AC-006 | [NFR-011][AC-001][AC-006] registration, sign-out and protected-route redirect work at 375px | E2E | Not run yet | `frontend/e2e/auth.mobile.spec.ts` |
| NFR-011, AC-004 | [NFR-011][AC-004] the bootstrap admin lands on the admin dashboard at 375px | E2E | Not run yet | `frontend/e2e/auth.mobile.spec.ts` |
| AC-001, AC-006 | [AC-001][AC-006] a new patient registers, signs out, and a protected route then redirects to sign-in | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-002 | [AC-002] registering an already-used email shows the duplicate-email message | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-003 | [AC-003] submitting a blank registration form shows which field needs correcting | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-003 | [AC-003] submitting an invalid email shows a field-specific message | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-004 | [AC-004] the bootstrap admin lands on the admin dashboard | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-004 | [AC-004] the smoke-test patient lands on the patient dashboard | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-005, NFR-003 | [AC-005][NFR-003] a wrong password and an unknown email show the identical generic message | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |

### US-003: Administrator provisions doctor and admin accounts

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | AdminConsole staff accounts > 409 on provisioning shows an inline 'email already in use' error | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| — | AdminConsole staff accounts > 422 maps {field, message} onto the matching input | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| AC-008 | AdminConsole staff accounts > [AC-008] lists doctor and admin accounts from GET /admin/users | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| AC-008 | AdminConsole staff accounts > [AC-008] provisioning posts the form and the new account appears with its role | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| AC-009 | AdminConsole staff accounts > [AC-009] a 403 renders 'not available for your role' rather than data | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| AC-010 | AdminConsole staff accounts > [AC-010] shows '<set-at-first-login>' for accounts not yet activated and no password field in the form | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| — | AdminConsole staff accounts > a deactivate/reactivate control calls PUT /admin/users/{id}/status and updates the row | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| — | AdminConsole staff accounts > shows a loading state while fetching and an empty state with none provisioned | Unit | Passed | `frontend/src/screens/AdminConsole.test.tsx` |
| AC-008 | test_ac008_admin_creates_admin_with_chosen_role | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| AC-008 | test_ac008_admin_creates_doctor_then_can_sign_in_after_first_login | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| AC-009 | test_ac009_list_and_status_endpoints_reject_non_admins | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| AC-009 | test_ac009_provision_endpoint_rejects_patient_and_doctor_and_unauthenticated | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| AC-010 | test_ac010_provisioned_account_stores_no_real_credential | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| — | test_duplicate_staff_email_is_409 | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| — | test_first_login_password_rejects_reuse_on_already_set_account | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| — | test_list_users_filters_by_role | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| — | test_provision_missing_or_invalid_fields_is_422_with_field_messages | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| — | test_status_toggle_deactivates_and_revokes_tokens_then_reactivates | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| — | test_status_toggle_unknown_user_is_404 | Integration | Passed | `backend/tests/integration/test_admin_staff_provisioning.py` |
| NFR-011, AC-008 | [NFR-011][AC-008] admin provisions a doctor and sees the placeholder password at 375px | E2E | Not run yet | `frontend/e2e/admin-staff-provisioning.mobile.spec.ts` |
| AC-008 | [AC-008] provisioning a duplicate email shows the inline 'already in use' error and creates no second account | E2E | Not run yet | `frontend/e2e/admin-staff-provisioning.spec.ts` |
| AC-008, AC-010 | [AC-008][AC-010] admin provisions a doctor, sees the placeholder password, and the doctor sets it and signs in | E2E | Not run yet | `frontend/e2e/admin-staff-provisioning.spec.ts` |
| AC-009 | [AC-009] a patient navigating to the admin provisioning route is denied and never sees staff data | E2E | Not run yet | `frontend/e2e/admin-staff-provisioning.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_seed_bootstrap_admin_creates_an_admin_once | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seed_bootstrap_users_does_nothing_without_env_vars | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_seed_smoke_test_patient_creates_a_patient_once | Unit | Passed | `backend/tests/unit/test_seed.py` |
| — | test_health_reports_ok | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | test_the_openapi_document_builds | Integration | Passed | `backend/tests/integration/test_health.py` |
| — | the app loads | E2E | Not run yet | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
