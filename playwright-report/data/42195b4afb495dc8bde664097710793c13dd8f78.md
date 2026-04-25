# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: talent-profile.spec.ts >> Talent Profile Form >> Form prioritizes Talent Type and handles None exclusivity
- Location: tests\talent-profile.spec.ts:39:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Professional")')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e4]:
    - generic [ref=e5]:
      - link "Castglo" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "Castglo" [ref=e7]
      - heading "Sign in" [level=1] [ref=e8]
      - paragraph [ref=e9]: Enter your credentials to access your account
    - generic [ref=e10]:
      - button "Continue with Google" [ref=e12] [cursor=pointer]:
        - img
        - generic [ref=e13]: Continue with Google
      - generic [ref=e16]: Or use your email
    - generic [ref=e19]:
      - generic [ref=e20]:
        - text: Email
        - textbox "name@example.com" [ref=e21]
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: Password
          - link "Forgot password?" [ref=e25] [cursor=pointer]:
            - /url: /forgot-password
        - generic [ref=e26]:
          - textbox "••••••••" [ref=e27]
          - button [ref=e28] [cursor=pointer]:
            - img [ref=e29]
      - generic [ref=e32]:
        - checkbox "Remember me" [ref=e33] [cursor=pointer]
        - checkbox
        - generic [ref=e34]: Remember me
      - button "Sign In" [ref=e35] [cursor=pointer]
    - paragraph [ref=e36]:
      - text: Don't have an account?
      - link "Sign up now" [ref=e37] [cursor=pointer]:
        - /url: /join
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Talent Profile Form', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Mock the profile API with a consistent state
  6  |     await page.route('**/api/v1/user/profile', async (route) => {
  7  |       await route.fulfill({
  8  |         status: 200,
  9  |         contentType: 'application/json',
  10 |         body: JSON.stringify({
  11 |           success: true,
  12 |           data: {
  13 |             fullName: 'Test Talent',
  14 |             unifiedTalentProfile: {
  15 |                 primary_talent_type: 'Actor / Performer',
  16 |                 distinguishing_features: []
  17 |             }
  18 |           }
  19 |         }),
  20 |       });
  21 |     });
  22 | 
  23 |     await page.addInitScript(() => {
  24 |       window.localStorage.setItem('token', 'mock-token');
  25 |       window.localStorage.setItem('userData', JSON.stringify({
  26 |         id: '69dd0cb5a972b9ff330ec7ad',
  27 |         email: 'talent@example.com',
  28 |         role: 'talent',
  29 |         fullName: 'Test Talent',
  30 |         isEmailVerified: true
  31 |       }));
  32 |     });
  33 | 
  34 |     await page.goto('/talent/profile');
  35 |     // Wait for initial load
  36 |     await expect(page.locator('svg.animate-spin')).not.toBeVisible({ timeout: 15000 });
  37 |   });
  38 | 
  39 |   test('Form prioritizes Talent Type and handles None exclusivity', async ({ page }) => {
  40 |     // 1. Check section ordering in Professional tab
  41 |     // Using text-based selector for the tab as it contains an icon
> 42 |     await page.click('button:has-text("Professional")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  43 |     
  44 |     const actorHeader = page.getByRole('heading', { name: 'Actor Details' });
  45 |     const overviewHeader = page.getByRole('heading', { name: 'Professional Overview' });
  46 |     
  47 |     await expect(actorHeader).toBeVisible();
  48 |     await expect(overviewHeader).toBeVisible();
  49 |     
  50 |     const actorBox = await actorHeader.boundingBox();
  51 |     const overviewBox = await overviewHeader.boundingBox();
  52 |     if (actorBox && overviewBox) {
  53 |         expect(actorBox.y).toBeLessThan(overviewBox.y);
  54 |     }
  55 | 
  56 |     // 2. Test "None" exclusivity in Appearance tab
  57 |     await page.click('button:has-text("Appearance")');
  58 |     const field = page.locator('[data-testid="field-distinguishing_features"]');
  59 |     const input = field.getByTestId('multi-select-input');
  60 | 
  61 |     // Add some features
  62 |     await input.click();
  63 |     await page.click('text=Freckles');
  64 |     await input.click();
  65 |     await page.click('text=Dimples');
  66 |     
  67 |     await expect(field.getByTestId('multi-select-tag-Freckles')).toBeVisible();
  68 |     await expect(field.getByTestId('multi-select-tag-Dimples')).toBeVisible();
  69 |     
  70 |     // Select None
  71 |     await input.click();
  72 |     await page.click('text=None');
  73 |     
  74 |     // Verify others cleared
  75 |     await expect(field.getByTestId('multi-select-tag-None')).toBeVisible();
  76 |     await expect(field.getByTestId('multi-select-tag-Freckles')).not.toBeVisible();
  77 |     
  78 |     // Verify others hidden from dropdown when None is selected
  79 |     await input.click();
  80 |     await expect(page.locator('text=Freckles')).not.toBeVisible();
  81 |     
  82 |     // Remove None via the X button
  83 |     await field.getByTestId('multi-select-tag-None').locator('div[role="button"]').click();
  84 |     
  85 |     // Verify others visible again in dropdown
  86 |     await input.click();
  87 |     await expect(page.locator('text=Freckles')).toBeVisible();
  88 |   });
  89 | });
  90 | 
```