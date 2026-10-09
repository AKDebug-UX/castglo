# Castglo Comprehensive Engineering, Security, QA & DevOps Audit Report

**Date:** October 9, 2026  
**Auditor:** Principal Software Engineer, Security Auditor & DevSecOps Architect  
**Repository:** Castglo (`https://github.com/AKDebug-UX/castglo.git`)  
**Active Branch:** `main`  
**Commit Reviewed:** `85fc990`  

---

## A. Executive Summary

Castglo is a production-grade casting and talent marketplace single-page application (SPA) built on **React 18**, **Vite 5**, **TypeScript 5**, **Tailwind CSS 3**, and **Radix UI/shadcn-ui**. The client interfaces with an external REST API backend (`https://castglo-qupm.onrender.com/api/v1`) providing authentication, project lifecycle management, talent submission workflows, livestreaming (Agora RTC), subscriptions (Stripe), and identity verification (Didit Protocol).

### Key Audit Findings
1. **Malware & Backdoor Screening**: 0 malware, droppers, or backdoors found. The repository was scanned against all signatures of the recent **SI-001 supply chain malware campaign** (whitespace-padded configs, disguised `.woff2` executables, auto-running `.vscode` tasks). All checks were completely negative.
2. **Secrets & Credentials**: No private keys (`sk_live`, RSA keys) or live backend credentials were leaked in the frontend code. Identified plaintext test credentials committed in `docs/API_Integration_Status_Report.md` and safely redacted them.
3. **Session & Auth State Hardening**: Fixed a session desynchronization defect in `src/lib/api.ts` where a 401 HTTP response cleared `token` but retained `userData` in `localStorage`, leading to visual state desynchronization.
4. **Superfluous Artifacts Cleaned**: Removed stray AI prompt log (`txt.docs`), empty placeholder (`create new project.json`), and empty file (`missing_endpoints.txt`). Added Playwright `test-results/` to `.gitignore`.
5. **Code & Build Verification**: TypeScript compilation passed with zero errors (`tsc --noEmit`). Unit test suite (Vitest) passed 100% (3 test files, 41 passing tests). Production build completed successfully in 2m 23s.

---

## B. Findings Register

### Finding SEC-001: Plaintext Test Passwords Committed in Project Documentation
- **Finding ID**: SEC-001
- **Severity**: Medium
- **Confidence**: High
- **Affected File**: `docs/API_Integration_Status_Report.md` (Lines 20–25)
- **Description**: The documentation file contained a table listing client review test accounts with plaintext passwords for Admin, Talent, Industry Professional, and Casting Director roles.
- **Impact**: Exposure of test account passwords in repository history increases risk of unauthorized access if staging environments share authentication stores.
- **Root Cause**: Developer included test credentials directly into a checked-in Markdown report for stakeholder review.
- **Remediation**: Sanitized and redacted plaintext credentials, replacing them with `[CONFIGURED_IN_STAGING_VAULT]`.
- **Verification**: Verified file content updated and clean.
- **Residual Risk**: Credentials committed in past Git commits (`cd6e57e`, etc.) must be rotated in the live staging/production database.

### Finding AUTH-001: Stale User Data Retention on 401 Unauthorized Response
- **Finding ID**: AUTH-001
- **Severity**: Low
- **Confidence**: High
- **Affected File**: `src/lib/api.ts` (Lines 282–288)
- **Description**: The Axios response interceptor for 401 responses removed `token` from `localStorage` but left `userData` intact. Because `AuthContext` initializes user state from `localStorage.getItem('userData')`, the application displayed a logged-in shell upon reload until a subsequent request failed.
- **Impact**: Inconsistent UI authorization state upon token expiration.
- **Root Cause**: Incomplete teardown of stored session items in the Axios response interceptor.
- **Remediation**: Added `localStorage.removeItem('userData')` to the 401 handler in `src/lib/api.ts`.
- **Verification**: Verified `typecheck` and test suite pass; validated logic flow.
- **Residual Risk**: None in frontend.

### Finding SEC-002: Missing Referrer Policy Hardening in Application Shell
- **Finding ID**: SEC-002
- **Severity**: Low
- **Confidence**: High
- **Affected File**: `index.html` (Lines 5–6)
- **Description**: `index.html` loads external resources (Google Fonts and Google Identity Services) but lacked an explicit `referrer` policy meta tag.
- **Impact**: Potential leakage of URL path or query parameters in Referer headers when requesting third-party assets.
- **Root Cause**: Default Vite template omissions.
- **Remediation**: Added `<meta name="referrer" content="strict-origin-when-cross-origin" />` to `<head>`.
- **Verification**: Verified `index.html` syntax and successful build.
- **Residual Risk**: None.

### Finding JUNK-001: Superfluous Repository Clutter and Untracked Cache
- **Finding ID**: JUNK-001
- **Severity**: Informational
- **Confidence**: High
- **Affected Files**: `txt.docs`, `src/pages/director/create new project.json`, `missing_endpoints.txt`, `test-results/.last-run.json`
- **Description**: Stray notes file, empty JSON with spaces in filename, 0-byte text file, and transient Playwright test execution artifacts were tracked in Git.
- **Impact**: Repository noise, confusion for automated scripts, and inadvertent cache tracking.
- **Remediation**: Deleted stray/empty files and added `test-results/` to `.gitignore`.
- **Verification**: `git status` clean and verified.
- **Residual Risk**: None.

---

## C. Git and Supply-Chain Review

- **Branches Examined**: `main` (synchronized with `origin/main`).
- **Recent Commit Inspected**: `85fc990` ("PRODUCTION READINESS AUDIT & VERIFICATION REPORT") and `212be4b` ("chore: add VS Code workspace settings").
- **Package Manifest Inspection**:
  - `package.json` contains 76 packages (54 dependencies, 22 devDependencies).
  - All package names verified against standard npm registries (Radix UI, Lucide, Tailwind, Agora RTC, Stripe SDK, Didit Protocol).
  - No suspicious postinstall or preinstall scripts found in `package.json`.
- **Supply-Chain Malware Screening**:
  - No SI-001 dropper files (`config.bat`, `temp_auto_push.bat`).
  - No base64/hex payload loaders in build configs (`vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`).
  - No binary font files containing disguised JavaScript.
  - `.vscode/` contains only `settings.json` (no rogue `tasks.json` with `folderOpen` hooks).

---

## D. Change Log

| File | Modification Summary |
| :--- | :--- |
| `src/lib/api.ts` | Cleared `userData` in addition to `token` on HTTP 401 response |
| `docs/API_Integration_Status_Report.md` | Redacted committed plaintext passwords for test accounts |
| `index.html` | Added `strict-origin-when-cross-origin` referrer policy meta tag |
| `.gitignore` | Added `test-results/` to prevent committing Playwright runner cache |
| `txt.docs` | Removed stray 2.8 KB AI session notes file |
| `src/pages/director/create new project.json` | Removed unreferenced empty `{}` placeholder file |
| `missing_endpoints.txt` | Removed empty 0-byte text file |
| `test-results/.last-run.json` | Removed transient test run cache file |

---

## E. Test Report

| Test Suite / Tool | Command Executed | Result | Details |
| :--- | :--- | :--- | :--- |
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** | 0 type errors across all source files |
| **Unit Test Suite (Vitest)** | `npx vitest run` | **PASS** | 3 test files, 41 passing tests (0 failures) |
| **ESLint Static Analysis** | `npm run lint` (`eslint .`) | **PASS** | 0 errors, 50 non-blocking warnings (Fast Refresh & React Hook dependencies) |
| **Production Vite Build** | `npm run build` (`vite build`) | **PASS** | Successfully built 3,547 modules in 2m 23s; generated optimized production bundle in `dist/` |

---

## F. Residual Risk Register

1. **Staging / Test Credential Rotation**: The test credentials previously documented in `docs/API_Integration_Status_Report.md` should be changed on the backend/auth database if those accounts are active in staging.
2. **Backend Enforced Authorization**: As this is a pure frontend SPA, all authorization checks performed in `ProtectedRoute.tsx` and UI role guards are UX conveniences. The backend at `castglo-qupm.onrender.com` must independently validate all JWT claims, object-level permissions (IDOR protection), and rate limits.
3. **CORS & CSP Configuration**: The backend and hosting server (Vercel) should enforce strict `Content-Security-Policy` and CORS origin whitelisting (`castglo.vercel.app`).

---

## G. Production Readiness Assessment

| Dimension | Status | Assessment |
| :--- | :--- | :--- |
| **Security** | **READY (Frontend)** | Zero malware, zero exposed private secrets, hardened 401 session clearing, sanitized docs |
| **Functional Correctness** | **READY** | All core routing, role gates, forms, and pages compile and link properly |
| **Test Coverage** | **ACCEPTABLE** | Unit tests cover core utilities, validations, and project helpers; Playwright E2E specs available |
| **Build & Reliability** | **READY** | TypeScript and Vite production builds complete cleanly with zero errors |
| **Deployment Readiness** | **READY** | `vercel.json` configured with SPA rewrites (`/index.html`); production bundle tested |
