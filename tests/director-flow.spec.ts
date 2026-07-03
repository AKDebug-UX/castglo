import { test, expect } from '@playwright/test';

test.describe('Casting Director Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile API
    await page.route('**/api/v1/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            fullName: 'Director Dan',
            role: 'casting_director',
            unifiedCastingDirectorProfile: {
              company_name: 'Dan Casting Co.'
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

    // Mock initial projects list
    await page.route('**/api/v1/projects*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      } else {
        await route.continue();
      }
    });

    // Set auth state
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-director-token');
      window.localStorage.setItem('userData', JSON.stringify({
        id: 'dir123',
        email: 'director@example.com',
        role: 'casting_director',
        fullName: 'Director Dan',
        isEmailVerified: true
      }));
    });
  });

  test('Director can create a casting call and view applicants', async ({ page }) => {
    // 1. Navigate to Create Casting Page
    await page.goto('/director/projects/new');
    await expect(page.locator('text=Post a New Project')).toBeVisible();

    // 2. Fill basic info (Step 1)
    await page.fill('input[name="project_title"]', 'New E2E Project');
    await page.click('button:has-text("Save & Continue")');

    // Wait for step transition
    await page.waitForTimeout(500);

    // 3. Fill role info (Step 2)
    // Add a role
    await page.click('button:has-text("Add Role")');
    await page.fill('input[name="role_name"]', 'Lead Actor');
    
    // Save Role modal
    const saveRoleBtn = page.locator('button:has-text("Save Role")');
    if (await saveRoleBtn.isVisible()) {
      await saveRoleBtn.click();
    }
    
    // Mock the POST request for creating a project
    await page.route('**/api/v1/projects', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'proj123',
              project_title: 'New E2E Project'
            }
          }),
        });
      }
    });

    // Navigate to applicants page to simulate reviewing after creation.
    // Mock the project API
    await page.route('**/api/v1/projects/proj123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'proj123',
            project_title: 'New E2E Project',
            roles: [
              { _id: 'role1', role_name: 'Lead Actor' }
            ]
          }
        }),
      });
    });

    // Mock the applicants API
    await page.route('**/api/v1/projects/proj123/applicants*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'app1',
              talentId: { fullName: 'Talent Tom' },
              roleId: { role_name: 'Lead Actor' },
              status: 'pending'
            }
          ]
        }),
      });
    });

    await page.goto('/director/applicants?project=proj123');
    await expect(page.locator('text=Talent Tom')).toBeVisible();
    await expect(page.locator('text=Lead Actor')).toBeVisible();
  });
});
