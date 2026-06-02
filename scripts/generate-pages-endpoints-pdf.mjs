import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const srcPages = path.join(root, "src", "pages");
const appPath = path.join(root, "src", "App.tsx");
const apiPath = path.join(root, "src", "lib", "api.ts");
const outDir = path.join(root, "test-results");
fs.mkdirSync(outDir, { recursive: true });
const outPdf = path.join(outDir, "castglo-pages-endpoints.pdf");

const apiWrapperToEndpoints = {
  adminAPI: ["/admin/*"],
  applicationAPI: ["/applications/*"],
  authAPI: ["/auth/*"],
  bookingAPI: ["/bookings/*", "/admin/bookings/*"],
  castingCallAPI: ["/casting-calls/*"],
  leadAPI: ["/leads"],
  livestreamAPI: ["/livestream/*"],
  messagingAPI: ["/messaging/*"],
  notificationAPI: ["/notifications/*"],
  profileAPI: ["/profiles/*", "/profile/*", "/casting/profile/*", "/portfolio", "/upload/*"],
  serviceAPI: ["/services/*"],
  subscriptionAPI: ["/subscriptions/*"],
  uploadAPI: ["/upload/*"],
  userAPI: ["/user/*", "/users/*"],
  verificationAPI: ["/blockchain/verify", "/admin/verifications/*"],
};

function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) files.push(...walk(p));
    else files.push(p);
  }
  return files;
}

function extractApiImports(code) {
  const imports = [];
  const re = /import\s*\{([^}]+)\}\s*from\s*["']@\/lib\/api["'];/g;
  let m;
  while ((m = re.exec(code))) {
    const names = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.split(/\s+as\s+/)[0].trim());
    imports.push(...names);
  }
  return Array.from(new Set(imports));
}

function isLikelyMock(code) {
  if (/\bINITIAL_[A-Z0-9_]+\b/.test(code)) return true;
  if (/\bmock\b/i.test(code)) return true;
  if (/unsplash\.com\//.test(code)) return true;
  if (/Unknown\s+(Talent|User|Professional|Director)/.test(code)) return true;
  return false;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const appCode = fs.readFileSync(appPath, "utf8");
function guessRoutesForComponent(componentName) {
  const routes = [];

  const idxRe = new RegExp(`index\\s+element=\\{<${componentName}\\s*\\/?>\\}`, "g");
  if (idxRe.test(appCode)) routes.push("(index route under parent)");

  const re = new RegExp(
    `<Route[^>]*?path=\\"([^\\"]+)\\"[^>]*?element=\\{<${componentName}\\s*\\/?>\\}[^>]*?\\/?>`,
    "g"
  );
  let m;
  while ((m = re.exec(appCode))) routes.push(m[1]);

  return Array.from(new Set(routes));
}

const pageFiles = walk(srcPages).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
const pageRows = [];
for (const file of pageFiles) {
  const code = fs.readFileSync(file, "utf8");
  const apiImports = extractApiImports(code);
  if (apiImports.length === 0) continue;

  const base = path.basename(file);
  const componentName = base.replace(/\.(t|j)sx?$/, "");
  const routes = guessRoutesForComponent(componentName);
  const endpoints = Array.from(new Set(apiImports.flatMap((n) => apiWrapperToEndpoints[n] || [])));

  pageRows.push({
    file: path.relative(root, file).replace(/\\/g, "/"),
    component: componentName,
    routes,
    apiImports,
    endpoints,
    mockRisk: isLikelyMock(code),
  });
}

pageRows.sort((a, b) => a.file.localeCompare(b.file));

const apiText = fs.readFileSync(apiPath, "utf8");
const apiBaseUrlLine = (apiText.match(/export const API_BASE_URL[^\n]+/) || [])[0] || "";

const style = `
  <style>
    @page { size: A4; margin: 18mm 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; }
    h1 { font-size: 18px; margin: 0 0 6px 0; }
    .meta { font-size: 11px; color: #334155; margin-bottom: 14px; }
    h2 { font-size: 14px; margin: 18px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px; vertical-align: top; }
    th { background: #f8fafc; text-align: left; }
    .pill { display: inline-block; padding: 2px 6px; border-radius: 999px; border: 1px solid #e2e8f0; background: #fff; margin: 2px 4px 2px 0; }
    .muted { color: #64748b; }
    .risk { color: #b45309; font-weight: 700; }
    .ok { color: #0f766e; font-weight: 700; }
    .small { font-size: 9px; }
    .section-note { font-size: 10px; color: #475569; margin: 6px 0 0; }
  </style>
`;

const rowsHtml = pageRows
  .map((r) => {
    const routesHtml = (r.routes.length ? r.routes : ["(route not found in App.tsx)"])
      .map((x) => `<span class="pill">${escapeHtml(x)}</span>`)
      .join("");

    const apisHtml = r.apiImports.map((x) => `<span class="pill">${escapeHtml(x)}</span>`).join("");
    const epsHtml = r.endpoints.length
      ? r.endpoints.map((x) => `<span class="pill">${escapeHtml(x)}</span>`).join("")
      : `<span class="muted">(unknown)</span>`;

    const risk = r.mockRisk
      ? `<span class="risk">Possible mock/placeholder present</span>`
      : `<span class="ok">No obvious mock markers</span>`;

    return `
      <tr>
        <td>
          <div><strong>${escapeHtml(r.file)}</strong></div>
          <div class="muted small">Component: ${escapeHtml(r.component)}</div>
        </td>
        <td>${routesHtml}</td>
        <td>${apisHtml}</td>
        <td>${epsHtml}</td>
        <td>${risk}</td>
      </tr>
    `;
  })
  .join("");

const apiGroupsHtml = Object.entries(apiWrapperToEndpoints)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(
    ([k, v]) =>
      `<div><span class="pill"><strong>${escapeHtml(k)}</strong></span> <span class="muted">${v
        .map(escapeHtml)
        .join(", ")}</span></div>`
  )
  .join("");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  ${style}
</head>
<body>
  <h1>Castglo – Pages That Require API Endpoints (Frontend)</h1>
  <div class="meta">
    <div>Generated: ${escapeHtml(new Date().toISOString())}</div>
    <div class="small">${escapeHtml(apiBaseUrlLine)}</div>
    <div class="section-note">
      Generated by code scanning. “Endpoints” are grouped by API wrapper (see src/lib/api.ts). Some routes are nested; if a route is shown as “(index route under parent)” it is an index route in App.tsx.
    </div>
  </div>

  <h2>Page → Route → API Wrapper → Endpoint Group</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 22%">Page File</th>
        <th style="width: 22%">Route(s)</th>
        <th style="width: 22%">API Wrapper(s)</th>
        <th style="width: 22%">Endpoint Group(s)</th>
        <th style="width: 12%">Mock Risk</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <h2>API Wrapper → Endpoint Groups</h2>
  <div class="small">${apiGroupsHtml}</div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: outPdf, format: "A4", printBackground: true });
await browser.close();

console.log(outPdf);

