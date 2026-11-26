import { expect, test, type Page } from "@playwright/test";

import { adminCredentials, smokeTestCredentials } from "./support/admin";

// US-002-3: end-to-end acceptance of the auth slice (registration, sign-in/out,
// session expiry via redirect, role landing, validation and generic failure
// messaging). Every account other than the two seeded ones is created through
// the app's own register form or sign-in screen -- never seeded directly.

function newPatient() {
  const id = crypto.randomUUID();
  return {
    full_name: "QA Patient " + id.slice(0, 8),
    email: `qa-patient-${id}@example.com`,
    phone: "+1 555 0101",
    password: `Pw-${id.slice(0, 12)}!`,
  };
}

async function registerViaUI(page: Page, patient: ReturnType<typeof newPatient>) {
  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Register as a patient" }).click();
  await page.locator("#reg-full-name").fill(patient.full_name);
  await page.locator("#reg-email").fill(patient.email);
  await page.locator("#reg-phone").fill(patient.phone);
  await page.locator("#reg-password").fill(patient.password);
  await page.locator("#reg-confirm").fill(patient.password);
  await page.getByRole("button", { name: "Register" }).click();
}

async function signInViaUI(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("[AC-001][AC-006] a new patient registers, signs out, and a protected route then redirects to sign-in", async ({
  page,
}) => {
  const patient = newPatient();

  await registerViaUI(page, patient);
  await expect(page).toHaveURL(/\/find-a-doctor$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  // Reopening a protected route after signing out must bounce back to sign-in.
  await page.goto("/my-account");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("[AC-002] registering an already-used email shows the duplicate-email message", async ({
  page,
}) => {
  const patient = newPatient();
  await registerViaUI(page, patient);
  await expect(page).toHaveURL(/\/find-a-doctor$/);
  await page.getByRole("button", { name: "Sign out" }).click();

  await registerViaUI(page, patient);
  await expect(page.getByText("that email is already in use")).toBeVisible();
});

test("[AC-003] submitting a blank registration form shows which field needs correcting", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Register as a patient" }).click();
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByText("we need a name to put on your appointments")).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("[AC-003] submitting an invalid email shows a field-specific message", async ({ page }) => {
  const patient = newPatient();
  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Register as a patient" }).click();
  await page.locator("#reg-full-name").fill(patient.full_name);
  await page.locator("#reg-email").fill("not-an-email");
  await page.locator("#reg-phone").fill(patient.phone);
  await page.locator("#reg-password").fill(patient.password);
  await page.locator("#reg-confirm").fill(patient.password);
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByText("that does not look like an email address")).toBeVisible();
});

test("[AC-005][NFR-003] a wrong password and an unknown email show the identical generic message", async ({
  page,
}) => {
  const patient = newPatient();
  await registerViaUI(page, patient);
  await expect(page).toHaveURL(/\/find-a-doctor$/);
  await page.getByRole("button", { name: "Sign out" }).click();

  await signInViaUI(page, patient.email, "totally-wrong-pw");
  const wrongPasswordAlert = page.getByRole("alert");
  await expect(wrongPasswordAlert).toHaveText("Email or password is incorrect.");
  await expect(page.getByRole("alert")).toHaveCount(1);

  await signInViaUI(page, `nobody-${crypto.randomUUID()}@example.com`, "whatever-pw-1");
  const unknownEmailAlert = page.getByRole("alert");
  await expect(unknownEmailAlert).toHaveText("Email or password is incorrect.");
  await expect(page.getByRole("alert")).toHaveCount(1);
});

test("[AC-004] the bootstrap admin lands on the admin dashboard", async ({ page }) => {
  const { email, password } = adminCredentials();

  await signInViaUI(page, email, password);

  await expect(page).toHaveURL(/\/admin-console$/);
});

test("[AC-004] the smoke-test patient lands on the patient dashboard", async ({ page }) => {
  const { email, password } = smokeTestCredentials();

  await signInViaUI(page, email, password);

  await expect(page).toHaveURL(/\/find-a-doctor$/);
});
