import { test, expect } from '@playwright/test';

test.describe('Talent Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile API
    await page.route('**/api/v1/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            fullName: 'Test Talent',
            role: 'talent',
            unifiedTalentProfile: {
              primary_talent_type: 'Actor / Performer'
            }
          }
        }),
      });
    });

    // Mock initial dashboard stats
    await page.route('**/api/v1/user/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    // Set auth state
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-talent-token');
      window.localStorage.setItem('userData', JSON.stringify({
        id: 'talent123',
        email: 'talent@example.com',
        role: 'talent',
        fullName: 'Test Talent',
        isEmailVerified: true
      }));
    });
  });

  test('Talent can browse and apply for a casting call', async ({ page }) => {
    // 1. Mock Casting Calls Search API
    await page.route('**/api/v1/projects*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'proj_mock_1',
              project_title: 'Global Commercial',
              casting_company_name: 'Big Casting',
              project_type: 'Commercial',
              roles: [
                { _id: 'role_mock_1', role_name: 'Main Lead', role_status: 'Open' }
              ]
            }
          ]
        }),
      });
    });

    // 2. Navigate to Browse Cast page
    await page.goto('/browse-cast');
    await expect(page.locator('text=Global Commercial')).toBeVisible();

    // 3. Mock specific casting detail API
    await page.route('**/api/v1/projects/proj_mock_1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'proj_mock_1',
            project_title: 'Global Commercial',
            full_project_description: 'A global commercial seeking great talent.',
            roles: [
              { _id: 'role_mock_1', role_name: 'Main Lead', role_status: 'Open' }
            ]
          }
        }),
      });
    });

    // 4. Click on the casting call to view details
    await page.click('text=Global Commercial');
    await expect(page).toHaveURL(/\/cast\/proj_mock_1/);
    await expect(page.locator('text=Main Lead')).toBeVisible();

    // 5. Click Apply
    await page.click('button:has-text("Apply Now")');
    await expect(page).toHaveURL(/\/browse-cast\/proj_mock_1\/submit/);
    
    // 6. Fill the application form
    await expect(page.locator('text=Talent Application Form')).toBeVisible();
    await page.fill('textarea[name="cover_message"]', 'I am very interested in this role.');
    await page.fill('input[name="skills"]', 'Acting');
    await page.keyboard.press('Enter');

    // 7. Mock Submit API
    await page.route('**/api/v1/applications', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { _id: 'app_mock_1' }
          }),
        });
      }
    });

    // 8. Submit the form
    await page.click('button:has-text("Submit Application")');

    // 9. Verify success redirect or toast
    // The exact behavior depends on the app, usually it shows a success page or redirects to dashboard/submissions.
    // We can just check that the application API was called.
    const applicationRequest = await page.waitForRequest('**/api/v1/applications');
    expect(applicationRequest.method()).toBe('POST');
  });
});
