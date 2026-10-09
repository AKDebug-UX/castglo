import { test, expect } from '@playwright/test';

test.describe('Casting Director Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth/me API
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'dir123',
            email: 'director@example.com',
            role: 'casting_director',
            fullName: 'Director Dan',
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
            fullName: 'Director Dan',
            role: 'casting_director',
            unifiedCastingDirectorProfile: {
              company_name: 'Dan Casting Co.'
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
    await page.route(/.*\/api\/v1\/projects.*/, async (route) => {
      const method = route.request().method();
      const url = route.request().url();
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'proj123',
              id: 'proj123',
              project_title: 'New E2E Project',
              roles: [{ _id: 'role1', role_name: 'Lead Actor' }]
            }
          }),
        });
      } else {
        const projectData = {
          _id: 'proj123',
          id: 'proj123',
          title: 'New E2E Project',
          project_title: 'New E2E Project',
          projectName: 'New E2E Project',
          roles: [{ _id: 'role1', role_name: 'Lead Actor' }]
        };

        if (url.includes('proj123')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: projectData }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [projectData] }),
          });
        }
      }
    });

    // Mock applicants API
    await page.route(/.*\/api\/v1\/applications.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'app1',
              id: 'app1',
              talent: { fullName: 'Talent Tom' },
              talentId: { fullName: 'Talent Tom' },
              appliedRole: 'Lead Actor',
              role: { _id: 'role1', role_name: 'Lead Actor' },
              roleName: 'Lead Actor',
              roleId: 'role1',
              status: 'review',
              createdAt: '2026-01-01T00:00:00.000Z'
            }
          ]
        }),
      });
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
    await page.goto('/director/create');
    await expect(page.locator('h1')).toContainText('Post a New Project');

    // 2. Fill basic info using Auto-fill Mock Data
    await page.click('button:has-text("Auto-fill Mock Data")');
    await expect(page.locator('input[name="project_title"]')).toHaveValue('The Midnight Heist (Mock)');

    // 3. Step transition: Continue
    await page.click('button:has-text("Continue")');

    // 4. Verify step 2 reached
    await expect(page.getByRole('heading', { name: 'Talent Needed' })).toBeVisible();

    // 5. Navigate to applicants page to view applicants for project
    await page.goto('/director/applicants?project=proj123');
    await expect(page.locator('text=Talent Tom')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Lead Actor')).toBeVisible();
  });
});
