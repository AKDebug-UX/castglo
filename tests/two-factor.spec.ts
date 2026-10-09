import { test, expect, Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL || "";

async function signInAs(
  page: Page,
  email: string,
  password: string
) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
}

// ── Login 2FA Flow ────────────────────────────────────────────────────────────
test.describe("Login 2FA flow", () => {
  test("redirects to /auth/2fa when backend returns requiresTwoFactor", async ({ page }) => {
    // Mock the login endpoint to return requiresTwoFactor
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Two-factor authentication required",
          data: { requiresTwoFactor: true, tempToken: "mock-temp-token-123" },
        }),
      });
    });

    await signInAs(page, "user-with-2fa@test.com", "password123");
    await expect(page).toHaveURL(/\/auth\/2fa/);
  });

  test("shows /auth/2fa page with code input and verify button", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/2fa`, {
      state: { tempToken: "mock-temp-token" } as any,
    });
    await expect(page.locator('[id="2fa-code-input"]')).toBeVisible();
    await expect(page.locator('[id="2fa-verify-btn"]')).toBeVisible();
  });

  test("/verify-two-factor redirects to /auth/2fa", async ({ page }) => {
    await page.goto(`${BASE_URL}/verify-two-factor`);
    await expect(page).toHaveURL(/\/auth\/2fa/);
  });

  test("verify button disabled when code is empty", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/2fa`);
    const btn = page.locator('[id="2fa-verify-btn"]');
    await expect(btn).toBeDisabled();
  });

  test("shows error when invalid TOTP code submitted", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { requiresTwoFactor: true, tempToken: "mock-temp-token-123" },
        }),
      });
    });

    await page.route("**/api/v1/auth/2fa/verify", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          message: "Invalid verification code",
        }),
      });
    });

    await signInAs(page, "user-with-2fa@test.com", "password123");
    await page.locator('[id="2fa-code-input"]').fill("000000");
    await page.locator('[id="2fa-verify-btn"]').click();
    await expect(page.getByText(/invalid verification code/i)).toBeVisible();
  });

  test("redirects to sign-in on expired temp token (401)", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { requiresTwoFactor: true, tempToken: "mock-temp-token-123" },
        }),
      });
    });

    await page.route("**/api/v1/auth/2fa/verify", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Token expired" }),
      });
    });

    await signInAs(page, "user-with-2fa@test.com", "password123");
    await page.locator('[id="2fa-code-input"]').fill("123456");
    await page.locator('[id="2fa-verify-btn"]').click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("backup code (alphanumeric) is accepted", async ({ page }) => {
    await page.route("**/api/v1/auth/2fa/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            token: "jwt-token",
            user: {
              _id: "u1",
              email: "test@test.com",
              role: "talent",
              fullName: "Test User",
              emailVerified: true,
              twoFactorEnabled: true,
            },
          },
        }),
      });
    });

    await page.goto(`${BASE_URL}/auth/2fa`);
    const input = page.locator('[id="2fa-code-input"]');
    await input.fill("ABCD-1234-EFGH");
    const btn = page.locator('[id="2fa-verify-btn"]');
    await expect(btn).not.toBeDisabled();
  });

  test("Google login with requiresTwoFactor redirects to /auth/2fa", async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).google = {
        accounts: {
          id: {
            initialize: (config: any) => {
              (window as any)._googleCallback = config.callback;
            },
            renderButton: () => {},
          },
        },
      };
    });

    await page.route("**/api/v1/auth/google", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { requiresTwoFactor: true, tempToken: "mock-google-temp-token" },
        }),
      });
    });

    await page.goto(`${BASE_URL}/sign-in`);
    await expect(page.locator('[id="email"]')).toBeVisible();

    await page.evaluate(async () => {
      if ((window as any)._googleCallback) {
        await (window as any)._googleCallback({ credential: "mock-id-token" });
      }
    });

    await expect(page).toHaveURL(/\/auth\/2fa/);
  });
});

// ── 2FA Settings Panel ────────────────────────────────────────────────────────
test.describe("2FA Settings Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth/me — user has twoFactorEnabled: false
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            _id: "u1",
            id: "u1",
            email: "talent@test.com",
            role: "talent",
            fullName: "Test Talent",
            isEmailVerified: true,
            twoFactorEnabled: false,
          },
        }),
      });
    });

    await page.route("**/api/v1/profiles/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            fullName: "Test Talent",
            role: "talent",
          },
        }),
      });
    });

    // Set auth state via addInitScript
    await page.addInitScript(() => {
      window.localStorage.setItem("token", "mock-jwt-token");
      window.localStorage.setItem("userData", JSON.stringify({
        _id: "u1",
        id: "u1",
        email: "talent@test.com",
        role: "talent",
        fullName: "Test Talent",
        isEmailVerified: true,
        twoFactorEnabled: false,
      }));
    });

    await page.goto("/talent/account-settings?tab=security");
  });

  test("shows 'Set up 2FA' button when 2FA is disabled", async ({ page }) => {
    await expect(page.getByRole("button", { name: /set up 2fa/i })).toBeVisible();
  });

  test("opens setup modal on 'Set up 2FA' click", async ({ page }) => {
    await page.route("**/api/v1/2fa/enrol", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==",
            secret: "JBSWY3DPEHPK3PXP",
          },
        }),
      });
    });

    await page.getByRole("button", { name: /set up 2fa/i }).click();
    await expect(page.getByText(/Set up two-factor authentication/i)).toBeVisible();
  });

  test("shows error if confirm code is wrong", async ({ page }) => {
    await page.route("**/api/v1/2fa/enrol", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { qrCode: "data:image/png;base64,abc", secret: "SECRET123" },
        }),
      });
    });
    await page.route("**/api/v1/2fa/confirm", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Invalid TOTP code" }),
      });
    });

    await page.getByRole("button", { name: /set up 2fa/i }).click();
    await page.getByRole("button", { name: /next/i }).click();
    await page.locator('[id="2fa-setup-code-input"]').fill("000000");
    await page.locator('[id="2fa-setup-confirm-btn"]').click();
    await expect(page.getByText(/invalid totp code/i)).toBeVisible();
  });

  test("shows backup codes after successful confirm", async ({ page }) => {
    await page.route("**/api/v1/2fa/enrol", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { qrCode: "data:image/png;base64,abc", secret: "SECRET123" },
        }),
      });
    });
    await page.route("**/api/v1/2fa/confirm", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { backupCodes: ["ABC1-2345", "DEF6-7890", "GHI1-1234", "JKL5-6789", "MNO0-1234", "PQR5-6789", "STU0-1234", "VWX5-6789"] },
        }),
      });
    });
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { _id: "u1", email: "talent@test.com", role: "talent", fullName: "T", emailVerified: true, twoFactorEnabled: true },
        }),
      });
    });

    await page.getByRole("button", { name: /set up 2fa/i }).click();
    await page.getByRole("button", { name: /next/i }).click();
    await page.locator('[id="2fa-setup-code-input"]').fill("123456");
    await page.locator('[id="2fa-setup-confirm-btn"]').click();
    await expect(page.getByText("ABC1-2345")).toBeVisible();
  });

  test("disable 2FA dialog requires password", async ({ page }) => {
    // Override auth/me with 2FA enabled
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { _id: "u1", id: "u1", email: "talent@test.com", role: "talent", fullName: "Test Talent", isEmailVerified: true, twoFactorEnabled: true },
        }),
      });
    });

    await page.evaluate(() => {
      const u = JSON.parse(localStorage.getItem("userData") || "{}");
      u.twoFactorEnabled = true;
      localStorage.setItem("userData", JSON.stringify(u));
    });

    await page.goto("/talent/account-settings?tab=security");
    await page.getByRole("button", { name: /disable 2fa/i }).click();
    const confirmBtn = page.locator("#disable-2fa-confirm-btn");
    await expect(confirmBtn).toBeDisabled();
    await page.locator("#disable-2fa-password-input").fill("mypassword");
    await expect(confirmBtn).not.toBeDisabled();
  });

  test("regenerate backup codes shows confirmation dialog", async ({ page }) => {
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { _id: "u1", id: "u1", email: "talent@test.com", role: "talent", fullName: "Test Talent", isEmailVerified: true, twoFactorEnabled: true },
        }),
      });
    });

    await page.evaluate(() => {
      const u = JSON.parse(localStorage.getItem("userData") || "{}");
      u.twoFactorEnabled = true;
      localStorage.setItem("userData", JSON.stringify(u));
    });

    await page.goto("/talent/account-settings?tab=security");
    await page.getByRole("button", { name: /backup codes/i }).click();
    const confirmBtn = page.locator("#regen-backup-codes-confirm-btn");
    await expect(confirmBtn).toBeVisible();
  });
});
