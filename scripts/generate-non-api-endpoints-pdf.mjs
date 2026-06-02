import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const srcPages = path.join(root, "src", "pages");
const appPath = path.join(root, "src", "App.tsx");
const apiPath = path.join(root, "src", "lib", "api.ts");
const socketPath = path.join(root, "src", "lib", "socket.ts");
const utilsPath = path.join(root, "src", "lib", "utils.ts");
const outDir = path.join(root, "test-results");
fs.mkdirSync(outDir, { recursive: true });
const outPdf = path.join(outDir, "castglo-non-api-endpoints.pdf");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

const apiText = fs.readFileSync(apiPath, "utf8");
const apiBaseUrlMatch = apiText.match(/export const API_BASE_URL\s*=\s*([^;\n]+)/);
const apiBaseUrlExpr = apiBaseUrlMatch?.[1] || "";

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

function extractUrls(code) {
  const urls = new Set();
  const re = /\b(https?:\/\/|wss?:\/\/)[^\s"'`<>]+/gi;
  let m;
  while ((m = re.exec(code))) {
    urls.add(m[0]);
  }
  return Array.from(urls);
}

function hasImport(code, fromPath) {
  const re = new RegExp(`from\\s+["']${fromPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "g");
  return re.test(code);
}

const utilsCode = fs.readFileSync(utilsPath, "utf8");
const dicebearMatch = utilsCode.match(/https?:\/\/api\.dicebear\.com\/[^\s"'`]+/i);
const dicebearUrl = dicebearMatch?.[0] || "https://api.dicebear.com/7.x/initials/svg";

const socketCode = fs.readFileSync(socketPath, "utf8");
const socketDefaultMatch = socketCode.match(/VITE_SOCKET_URL\s*\|\|\s*['"]([^'"]+)['"]/);
const socketDefaultUrl = socketDefaultMatch?.[1] || "https://castglo-qupm.onrender.com";

const pageFiles = walk(srcPages).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
const rows = [];

for (const file of pageFiles) {
  const code = fs.readFileSync(file, "utf8");
  const base = path.basename(file);
  const componentName = base.replace(/\.(t|j)sx?$/, "");
  const routes = guessRoutesForComponent(componentName);

  const directUrls = extractUrls(code);

  const external = [];
  for (const u of directUrls) {
    if (u.startsWith("https://castglo-qupm.onrender.com/api/v1")) continue;
    external.push({ kind: "Direct URL", url: u });
  }

  if (/\bgetAvatarUrl\b/.test(code) || hasImport(code, "@/lib/utils")) {
    if (/\bgetAvatarUrl\b/.test(code)) external.push({ kind: "Avatar service", url: dicebearUrl });
  }

  if (hasImport(code, "@/lib/socket") || /\bsocketService\b/.test(code)) {
    external.push({ kind: "Socket.IO server", url: socketDefaultUrl });
  }

  if (hasImport(code, "@/lib/stripe") || /loadStripe\(/.test(code) || /@stripe\/stripe-js/.test(code)) {
    external.push({ kind: "Stripe JS", url: "https://js.stripe.com/*" });
  }

  if (/agora/i.test(code) || /agora-rtc-sdk/i.test(code)) {
    external.push({ kind: "Agora SDK", url: "(Agora SDK endpoints via vendor library)" });
  }

  if (external.length === 0) continue;

  rows.push({
    file: path.relative(root, file).replace(/\\/g, "/"),
    component: componentName,
    routes,
    external,
  });
}

rows.sort((a, b) => a.file.localeCompare(b.file));

const rowsHtml = rows
  .map((r) => {
    const routesHtml = (r.routes.length ? r.routes : ["(route not found in App.tsx)"])
      .map((x) => `<span class="pill">${escapeHtml(x)}</span>`)
      .join("");

    const extHtml = r.external
      .map((e) => `<div class="ext"><span class="kind">${escapeHtml(e.kind)}:</span> ${escapeHtml(e.url)}</div>`)
      .join("");

    return `
      <tr>
        <td>
          <div><strong>${escapeHtml(r.file)}</strong></div>
          <div class="muted small">Component: ${escapeHtml(r.component)}</div>
        </td>
        <td>${routesHtml}</td>
        <td>${extHtml}</td>
      </tr>
    `;
  })
  .join("");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
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
    .small { font-size: 9px; }
    .ext { margin: 2px 0; line-height: 1.35; }
    .kind { font-weight: 700; color: #0f766e; }
    .note { font-size: 10px; color: #475569; margin-top: 8px; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
</head>
<body>
  <h1>Castglo – Pages Using Endpoints Outside <code>https://castglo-qupm.onrender.com/api/v1</code></h1>
  <div class="meta">
    <div>Generated: ${escapeHtml(new Date().toISOString())}</div>
    <div class="small">API_BASE_URL expression: ${escapeHtml(apiBaseUrlExpr)}</div>
    <div class="note">
      This report includes pages that reference URLs (http/https/ws/wss) that do NOT start with <code>https://castglo-qupm.onrender.com/api/v1</code>, plus common indirect external dependencies (DiceBear avatar service, Socket.IO server, Stripe JS, Agora SDK) when detected by usage/imports.
    </div>
  </div>

  <h2>Pages</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 30%">Page File</th>
        <th style="width: 25%">Route(s)</th>
        <th style="width: 45%">Non-API Endpoints / External Services</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: outPdf, format: "A4", printBackground: true });
await browser.close();

console.log(outPdf);

