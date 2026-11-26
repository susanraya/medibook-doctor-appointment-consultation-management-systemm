import { expect, test, type Page } from "@playwright/test";

import { adminCredentials } from "./support/admin";

// NFR-011: the staff-provisioning critical path must also work at a 375px
// mobile viewport, not just desktop.

test.use({ viewport: { width: 375, height: 812 } });

async function signInViaUI(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

function newDoctor() {
  const id = crypto.randomUUID();
  return {
    full_name: "QA Mobile Doctor " + id.slice(0, 8),
    email: `qa-mobile-doctor-${id}@example.com`,
    phone: "+1 555 0191",
  };
}

test("[NFR-011][AC-008] admin provisions a doctor and sees the placeholder password at 375px", async ({
  page,
}) => {
  const { email, password } = adminCredentials();
  const doctor = newDoctor();

  await signInViaUI(page, email, password);
  await expect(page).toHaveURL(/\/admin-console$/);

  await page.locator("#acct-name").fill(doctor.full_name);
  await page.locator("#acct-email").fill(doctor.email);
  await page.locator("#acct-phone").fill(doctor.phone);
  await page.locator("#acct-role").selectOption("doctor");
  await page.getByRole("button", { name: "Create account" }).click();

  const row = page.locator("tr", { hasText: doctor.email });
  await expect(row).toContainText("<set-at-first-login>");
});
