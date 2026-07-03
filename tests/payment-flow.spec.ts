import { test, expect } from '@playwright/test';

test.describe('Payment and Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile API
    await page.route('**/api/v1/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            fullName: 'Test User',
            role: 'talent'
          }
        }),
      });
    });

    // Mock subscription plans API
    await page.route('**/api/v1/subscriptions/plans', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            data: {
              plans: [
                {
                  planKey: 'talent_pro',
                  name: 'Pro Talent',
                  category: 'talent',
                  pricing: { monthly: 9.99, yearly: 99.99 },
                  features: { 'Unlimited Applications': true }
                }
              ]
            }
          }
        }),
      });
    });

    // Set auth state
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('userData', JSON.stringify({
        id: 'user123',
        email: 'user@example.com',
        role: 'talent',
        fullName: 'Test User',
        isEmailVerified: true
      }));
    });
  });

  test('User can select a plan and proceed to checkout', async ({ page }) => {
    // 1. Navigate to Pricing Page
    await page.goto('/pricing');
    await expect(page.locator('text=Pro Talent')).toBeVisible();

    // 2. Mock create-checkout-session API
    await page.route('**/api/v1/subscriptions/create-checkout-session', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = JSON.parse(route.request().postData() || '{}');
        expect(postData.planName).toBe('talent_pro');
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              url: 'https://mock-stripe-checkout.com/session_123'
            }
          }),
        });
      }
    });

    // Catch navigation to the mock stripe URL so Playwright doesn't actually try to load it and fail
    await page.route('https://mock-stripe-checkout.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Mock Checkout Page</h1></body></html>'
      });
    });

    // 3. Click Subscribe on the Pro plan
    // In our mocked data, the plan is "Pro Talent"
    await page.click('button:has-text("Subscribe")');

    // 4. Verify we arrived at the mock checkout page
    await expect(page.locator('text=Mock Checkout Page')).toBeVisible();
    await expect(page).toHaveURL(/mock-stripe-checkout\.com/);
  });
});
