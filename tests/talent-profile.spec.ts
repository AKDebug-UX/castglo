import { test, expect } from '@playwright/test';

test.describe('Talent Profile Form', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the profile API with a consistent state
    await page.route('**/api/v1/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            fullName: 'Test Talent',
            unifiedTalentProfile: {
                primary_talent_type: 'Actor / Performer',
                distinguishing_features: []
            }
          }
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('userData', JSON.stringify({
        id: '69dd0cb5a972b9ff330ec7ad',
        email: 'talent@example.com',
        role: 'talent',
        fullName: 'Test Talent',
        isEmailVerified: true
      }));
    });

    await page.goto('/talent/profile');
    // Wait for initial load
    await expect(page.locator('svg.animate-spin')).not.toBeVisible({ timeout: 15000 });
  });

  test('Form prioritizes Talent Type and handles None exclusivity', async ({ page }) => {
    // 1. Check section ordering in Professional tab
    // Using text-based selector for the tab as it contains an icon
    await page.click('button:has-text("Professional")');
    
    const actorHeader = page.getByRole('heading', { name: 'Actor Details' });
    const overviewHeader = page.getByRole('heading', { name: 'Professional Overview' });
    
    await expect(actorHeader).toBeVisible();
    await expect(overviewHeader).toBeVisible();
    
    const actorBox = await actorHeader.boundingBox();
    const overviewBox = await overviewHeader.boundingBox();
    if (actorBox && overviewBox) {
        expect(actorBox.y).toBeLessThan(overviewBox.y);
    }

    // 2. Test "None" exclusivity in Appearance tab
    await page.click('button:has-text("Appearance")');
    const field = page.locator('[data-testid="field-distinguishing_features"]');
    const input = field.getByTestId('multi-select-input');

    // Add some features
    await input.click();
    await page.click('text=Freckles');
    await input.click();
    await page.click('text=Dimples');
    
    await expect(field.getByTestId('multi-select-tag-Freckles')).toBeVisible();
    await expect(field.getByTestId('multi-select-tag-Dimples')).toBeVisible();
    
    // Select None
    await input.click();
    await page.click('text=None');
    
    // Verify others cleared
    await expect(field.getByTestId('multi-select-tag-None')).toBeVisible();
    await expect(field.getByTestId('multi-select-tag-Freckles')).not.toBeVisible();
    
    // Verify others hidden from dropdown when None is selected
    await input.click();
    await expect(page.locator('text=Freckles')).not.toBeVisible();
    
    // Remove None via the X button
    await field.getByTestId('multi-select-tag-None').locator('div[role="button"]').click();
    
    // Verify others visible again in dropdown
    await input.click();
    await expect(page.locator('text=Freckles')).toBeVisible();
  });
});
