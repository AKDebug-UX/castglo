import { test, expect } from '@playwright/test';

test.describe('Talent Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth/me API
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'talent123',
            email: 'talent@example.com',
            role: 'talent',
            fullName: 'Test Talent',
            isEmailVerified: true
          }
        }),
      });
    });

    // Mock profiles/me API
    await page.route('**/api/v1/profiles/me', async (route) => {
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
    // Mock applications/me API
    await page.route('**/api/v1/applications/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    const mockProject = {
      _id: 'proj_mock_1',
      id: 'proj_mock_1',
      title: 'Global Commercial',
      project_title: 'Global Commercial',
      company: 'Big Casting',
      casting_company_name: 'Big Casting',
      type: 'Commercial',
      project_type: 'Commercial',
      description: 'A global commercial seeking great talent.',
      full_project_description: 'A global commercial seeking great talent.',
      status: 'published',
      roles: [
        { _id: 'role_mock_1', id: 'role_mock_1', role_name: 'Main Lead', role_status: 'Open' }
      ]
    };

    // 1. Mock Casting Calls & Projects APIs
    await page.route(/.*\/api\/v1\/casting-calls.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [mockProject]
        }),
      });
    });

    await page.route(/.*\/api\/v1\/projects.*/, async (route) => {
      if (route.request().url().includes('proj_mock_1')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockProject
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [mockProject]
          }),
        });
      }
    });

    // 2. Navigate to Browse Cast page
    await page.goto('/browse-cast');
    await expect(page.getByRole('heading', { name: 'Global Commercial' })).toBeVisible();

    // 3. Click on the casting call to view details
    await page.getByRole('link', { name: 'View Details' }).click();
    await expect(page).toHaveURL(/\/cast\/proj_mock_1/);
    await expect(page.locator('text=Main Lead')).toBeVisible();

    // 4. Click Apply Now link
    await page.getByRole('link', { name: 'Apply Now' }).click();
    await expect(page).toHaveURL(/.*\/submit/);
    
    // 5. Fill the application form using form controls
    await expect(page.locator('h1')).toContainText('Talent Application Form');
    await page.click('button:has-text("Auto-fill Mock Data")');
    await page.click('label[for="use-profile-headshot"]');

    // 6. Mock Apply & Submit APIs
    await page.route(/.*\/api\/v1\/projects\/.*\/apply.*/, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { _id: 'app_mock_1' }
        }),
      });
    });

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
      } else {
        await route.fallback();
      }
    });

    // 7. Submit the form and verify successful navigation to applications list
    await page.click('button:has-text("Submit Application")');
    await expect(page).toHaveURL(/\/talent\/applications/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('My Applications');
  });
});
