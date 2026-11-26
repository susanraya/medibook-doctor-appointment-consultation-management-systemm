import { expect, test, type Page } from "@playwright/test";

import { adminCredentials, smokeTestCredentials } from "./support/admin";

// US-003-3: admin staff provisioning acceptance (AC-008, AC-009, AC-010). The
// bootstrap admin and the seeded patient are the only accounts read from
// settings; every doctor/admin account here is created through the app's own
// provisioning form.

async function signInViaUI(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

function newDoctor() {
  const id = crypto.randomUUID();
  return {
    full_name: "QA Doctor " + id.slice(0, 8),
    email: `qa-doctor-${id}@example.com`,
    phone: "+1 555 0190",
  };
}

async function provisionDoctor(page: Page, doctor: ReturnType<typeof newDoctor>) {
  await page.locator("#acct-name").fill(doctor.full_name);
  await page.locator("#acct-email").fill(doctor.email);
  await page.locator("#acct-phone").fill(doctor.phone);
  await page.locator("#acct-role").selectOption("doctor");
  await page.getByRole("button", { name: "Create account" }).click();
}

test("[AC-008][AC-010] admin provisions a doctor, sees the placeholder password, and the doctor sets it and signs in", async ({
  page,
}) => {
  const { email, password } = adminCredentials();
  const doctor = newDoctor();

  await signInViaUI(page, email, password);
  await expect(page).toHaveURL(/\/admin-console$/);

  await provisionDoctor(page, doctor);

  const row = page.locator("tr", { hasText: doctor.email });
  await expect(row).toContainText("<set-at-first-login>");

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  const newPassword = `Qa-${crypto.randomUUID().slice(0, 12)}!`;
  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Set your password" }).click();
  await page.locator("#fl-email").fill(doctor.email);
  await page.locator("#fl-password").fill(newPassword);
  await page.getByRole("button", { name: "Set password and sign in" }).click();

  await expect(page).toHaveURL(/\/doctor-workspace$/);
});

test("[AC-009] a patient navigating to the admin provisioning route is denied and never sees staff data", async ({
  page,
}) => {
  const { email, password } = smokeTestCredentials();

  await signInViaUI(page, email, password);
  await expect(page).toHaveURL(/\/find-a-doctor$/);

  await page.goto("/admin-console");

  await expect(page).not.toHaveURL(/\/admin-console$/);
  await expect(page.getByText("Doctor & admin accounts")).toHaveCount(0);
  await expect(page.getByText("<set-at-first-login>")).toHaveCount(0);
});

test("[AC-008] provisioning a duplicate email shows the inline 'already in use' error and creates no second account", async ({
  page,
}) => {
  const { email, password } = adminCredentials();
  const doctor = newDoctor();

  await signInViaUI(page, email, password);
  await expect(page).toHaveURL(/\/admin-console$/);

  await provisionDoctor(page, doctor);
  await expect(page.locator("tr", { hasText: doctor.email })).toHaveCount(1);

  await provisionDoctor(page, doctor);

  await expect(page.getByText("that email is already in use")).toBeVisible();
  await expect(page.locator("tr", { hasText: doctor.email })).toHaveCount(1);
});
