// The admin every E2E run has: the platform sets these two settings for the run, and the
// backend creates this user from them at startup. Sign in as this user, then create any
// other user or data through the API. A missing setting fails the test: never skip one.
export function adminCredentials(): { email: string; password: string } {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are not set: the platform sets them for every E2E run.",
    );
  }
  return { email, password };
}

// The one seeded, ordinary (non-admin) user every E2E run has: the platform sets these
// two settings for the run, and the backend creates this patient from them at startup.
// Never invent another seeded account; create any other user through the API instead.
export function smokeTestCredentials(): { email: string; password: string } {
  const email = process.env.SMOKE_TEST_EMAIL;
  const password = process.env.SMOKE_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD are not set: the platform sets them for every E2E run.",
    );
  }
  return { email, password };
}
