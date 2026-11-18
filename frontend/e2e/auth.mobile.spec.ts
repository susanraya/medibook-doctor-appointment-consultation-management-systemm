import { expect, test } from "@playwright/test";

import { adminCredentials } from "./support/admin";

// NFR-011: the auth critical path must work in a standard mobile browser viewport,
// not just desktop. Same flows as auth.spec.ts, run at a 375px-wide viewport.

test.use({ viewport: { width: 375, height: 812 } });

function newPatient() {
  const id = crypto.randomUUID();
  return {
    full_name: "QA Mobile " + id.slice(0, 8),
    email: `qa-mobile-${id}@example.com`,
    phone: "+1 555 0102",
    password: `Pw-${id.slice(0, 12)}!`,
  };
}

test("[NFR-011][AC-001][AC-006] registration, sign-out and protected-route redirect work at 375px", async ({
  page,
}) => {
  const patient = newPatient();

  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Register as a patient" }).click();
  await page.locator("#reg-full-name").fill(patient.full_name);
  await page.locator("#reg-email").fill(patient.email);
  await page.locator("#reg-phone").fill(patient.phone);
  await page.locator("#reg-password").fill(patient.password);
  await page.locator("#reg-confirm").fill(patient.password);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/find-a-doctor$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.goto("/my-account");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("[NFR-011][AC-004] the bootstrap admin lands on the admin dashboard at 375px", async ({
  page,
}) => {
  const { email, password } = adminCredentials();

  await page.goto("/sign-in");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin-console$/);
});
