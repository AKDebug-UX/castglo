import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const srcPages = path.join(root, "src", "pages");
const appPath = path.join(root, "src", "App.tsx");
const apiPath = path.join(root, "src", "lib", "api.ts");
const outDir = path.join(root, "test-results");
fs.mkdirSync(outDir, { recursive: true });
const outPdf = path.join(outDir, "castglo-pages-endpoints-swagger-coverage.pdf");

const SWAGGER_URL = "https://castglo-qupm.onrender.com/api-docs.json";

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

function normalizePath(p) {
  return String(p)
    .replace(/\/:\w+/g, "/{param}")
    .replace(/\$\{[^}]+\}/g, "{param}")
    .replace(/\{[^}]+\}/g, "{param}")
    .replace(/\/{param}{param}/g, "/{param}");
}

function normalizeMethod(m) {
  return String(m).toUpperCase();
}

async function fetchSwaggerSet() {
  const res = await fetch(SWAGGER_URL);
  if (!res.ok) throw new Error(`Failed to fetch swagger: ${res.status}`);
  const spec = await res.json();

  const set = new Set();
  const paths = spec?.paths || {};
  for (const [p, methods] of Object.entries(paths)) {
    for (const method of Object.keys(methods || {})) {
      const normalized = `${normalizeMethod(method)} ${normalizePath(p)}`;
      set.add(normalized);
    }
  }

  return { set, info: spec?.info, servers: spec?.servers || [] };
}

function parseApiEndpointsBlock(apiCode) {
  const lines = apiCode.split(/\r?\n/);
  const endpointMap = new Map(); // key: "API_ENDPOINTS.A.B" -> "/path"
  const stack = [];
  let inApiEndpoints = false;

  const startIdx = lines.findIndex((l) => l.includes("export const API_ENDPOINTS"));
  if (startIdx === -1) return endpointMap;

  inApiEndpoints = true;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (inApiEndpoints && line.includes("};")) break;

    const openObj = line.match(/^\s*(\w+)\s*:\s*\{\s*$/);
    if (openObj) {
      stack.push(openObj[1]);
      continue;
    }

    if (/^\s*},?\s*$/.test(line)) {
      stack.pop();
      continue;
    }

    const literal = line.match(/^\s*(\w+)\s*:\s*'([^']+)'\s*,?\s*$/);
    if (literal) {
      const [, key, value] = literal;
      const full = ["API_ENDPOINTS", ...stack, key].join(".");
      endpointMap.set(full, value);
      continue;
    }

    const templLiteral = line.match(/^\s*(\w+)\s*:\s*`([^`]+)`\s*,?\s*$/);
    if (templLiteral) {
      const [, key, value] = templLiteral;
      const full = ["API_ENDPOINTS", ...stack, key].join(".");
      endpointMap.set(full, value);
      continue;
    }

    const func = line.match(/^\s*(\w+)\s*:\s*\(([^)]*)\)\s*=>\s*`([^`]+)`\s*,?\s*$/);
    if (func) {
      const [, key, paramsRaw, value] = func;
      const params = paramsRaw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => p.split(":")[0].trim());

      let normalized = value;
      for (const p of params) {
        if (!p) continue;
        normalized = normalized.replaceAll(`\${${p}}`, "{param}");
      }
      normalized = normalized.replace(/\$\{[^}]+\}/g, "{param}");
      const full = ["API_ENDPOINTS", ...stack, key].join(".");
      endpointMap.set(full, normalized);
    }
  }

  return endpointMap;
}

function parseApiWrappers(apiCode, endpointMap) {
  const wrapperToMethods = new Map(); // wrapper.method -> { httpMethod, path }

  const wrapperStartRe = /export const (\w+)\s*=\s*\{\s*$/gm;
  let m;
  while ((m = wrapperStartRe.exec(apiCode))) {
    const wrapper = m[1];
    const startIdx = m.index;
    const slice = apiCode.slice(startIdx);
    const endIdx = slice.indexOf("\n};");
    if (endIdx === -1) continue;
    const block = slice.slice(0, endIdx);

    const propRe = /^\s*(\w+)\s*:\s*\([^)]*\)\s*=>\s*api\.(get|post|put|patch|delete)\(([\s\S]*?)\)\s*,?\s*$/gm;
    let p;
    while ((p = propRe.exec(block))) {
      const methodName = p[1];
      const httpMethod = p[2].toUpperCase();
      const args = p[3].trim();
      const firstArg = args.split(",")[0].trim();

      let resolvedPath = "";

      const endpointRef = firstArg.match(/API_ENDPOINTS\.(\w+)\.(\w+)(\([^)]*\))?/);
      if (endpointRef) {
        const parent = endpointRef[1];
        const name = endpointRef[2];
        const ref = `API_ENDPOINTS.${parent}.${name}`;
        resolvedPath = endpointMap.get(ref) || "";
      }

      if (!resolvedPath) {
        const strLit = firstArg.match(/^'([^']+)'$/);
        if (strLit) resolvedPath = strLit[1];
      }

      if (!resolvedPath) {
        const backtick = firstArg.match(/^`([^`]+)`$/);
        if (backtick) {
          resolvedPath = backtick[1].replace(/\$\{[^}]+\}/g, "{param}");
        }
      }

      if (resolvedPath) {
        wrapperToMethods.set(`${wrapper}.${methodName}`, {
          wrapper,
          methodName,
          httpMethod,
          path: normalizePath(resolvedPath),
        });
      }
    }

    const propReNoArgs = /^\s*(\w+)\s*:\s*\(\)\s*=>\s*api\.(get|post|put|patch|delete)\(([\s\S]*?)\)\s*,?\s*$/gm;
    while ((p = propReNoArgs.exec(block))) {
      const methodName = p[1];
      const httpMethod = p[2].toUpperCase();
      const args = p[3].trim();
      const firstArg = args.split(",")[0].trim();

      let resolvedPath = "";
      const endpointRef = firstArg.match(/API_ENDPOINTS\.(\w+)\.(\w+)(\([^)]*\))?/);
      if (endpointRef) {
        const parent = endpointRef[1];
        const name = endpointRef[2];
        const ref = `API_ENDPOINTS.${parent}.${name}`;
        resolvedPath = endpointMap.get(ref) || "";
      }

      if (!resolvedPath) {
        const strLit = firstArg.match(/^'([^']+)'$/);
        if (strLit) resolvedPath = strLit[1];
      }

      if (!resolvedPath) {
        const backtick = firstArg.match(/^`([^`]+)`$/);
        if (backtick) resolvedPath = backtick[1].replace(/\$\{[^}]+\}/g, "{param}");
      }

      if (resolvedPath) {
        wrapperToMethods.set(`${wrapper}.${methodName}`, {
          wrapper,
          methodName,
          httpMethod,
          path: normalizePath(resolvedPath),
        });
      }
    }
  }

  return wrapperToMethods;
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

function collectWrapperCalls(code, wrappers) {
  const calls = new Set();
  for (const w of wrappers) {
    const re = new RegExp(`\\b${w}\\.([a-zA-Z0-9_]+)\\s*\\(`, "g");
    let m;
    while ((m = re.exec(code))) {
      calls.add(`${w}.${m[1]}`);
    }
  }
  return Array.from(calls);
}

const apiCode = fs.readFileSync(apiPath, "utf8");
const endpointMap = parseApiEndpointsBlock(apiCode);
const wrapperMethodMap = parseApiWrappers(apiCode, endpointMap);
const swagger = await fetchSwaggerSet();

const pageFiles = walk(srcPages).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
const pageRows = [];

for (const file of pageFiles) {
  const code = fs.readFileSync(file, "utf8");
  const apiImports = extractApiImports(code).filter((n) => n.endsWith("API"));
  if (apiImports.length === 0) continue;

  const base = path.basename(file);
  const componentName = base.replace(/\.(t|j)sx?$/, "");
  const routes = guessRoutesForComponent(componentName);

  const calls = collectWrapperCalls(code, apiImports);
  const endpoints = calls
    .map((c) => {
      const meta = wrapperMethodMap.get(c);
      if (!meta) return null;
      const key = `${meta.httpMethod} ${meta.path}`;
      const inSwagger = swagger.set.has(key);
      return { ...meta, key, inSwagger };
    })
    .filter(Boolean);

  if (endpoints.length === 0) continue;

  pageRows.push({
    file: path.relative(root, file).replace(/\\/g, "/"),
    component: componentName,
    routes,
    apiImports,
    endpoints,
  });
}

pageRows.sort((a, b) => a.file.localeCompare(b.file));

const missingByPage = pageRows
  .map((p) => ({
    file: p.file,
    missing: p.endpoints.filter((e) => !e.inSwagger),
  }))
  .filter((p) => p.missing.length > 0);

const summaryHtml =
  missingByPage.length === 0
    ? `<div class="ok">All detected frontend API calls exist in Swagger.</div>`
    : missingByPage
        .map((p) => {
          const items = p.missing
            .map((e) => `<div class="miss-item"><span class="pill">${escapeHtml(e.key)}</span> <span class="muted">${escapeHtml(e.wrapper)}.${escapeHtml(e.methodName)}</span></div>`)
            .join("");
          return `<div class="miss-block"><div><strong>${escapeHtml(p.file)}</strong></div>${items}</div>`;
        })
        .join("");

const rowsHtml = pageRows
  .map((r) => {
    const routesHtml = (r.routes.length ? r.routes : ["(route not found in App.tsx)"])
      .map((x) => `<span class="pill">${escapeHtml(x)}</span>`)
      .join("");

    const endpointHtml = r.endpoints
      .map((e) => {
        const status = e.inSwagger ? `<span class="ok">In Swagger</span>` : `<span class="risk">Missing in Swagger</span>`;
        return `<div class="ep"><span class="pill">${escapeHtml(e.key)}</span> <span class="muted">${escapeHtml(e.wrapper)}.${escapeHtml(e.methodName)}</span> ${status}</div>`;
      })
      .join("");

    return `
      <tr>
        <td>
          <div><strong>${escapeHtml(r.file)}</strong></div>
          <div class="muted small">Component: ${escapeHtml(r.component)}</div>
        </td>
        <td>${routesHtml}</td>
        <td>${endpointHtml}</td>
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
    .ep { margin: 3px 0; line-height: 1.35; }
    .risk { color: #b45309; font-weight: 700; }
    .ok { color: #0f766e; font-weight: 700; }
    .miss-block { margin: 8px 0; padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; }
    .miss-item { margin: 3px 0; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
</head>
<body>
  <h1>Castglo – Pages → API Endpoints → Swagger Availability</h1>
  <div class="meta">
    <div>Generated: ${escapeHtml(new Date().toISOString())}</div>
    <div class="small">Swagger source: <code>${escapeHtml(SWAGGER_URL)}</code></div>
    <div class="small">Compares frontend API usage (src/lib/api.ts + src/pages) against Swagger paths/methods.</div>
  </div>

  <h2>Missing in Swagger (priority list)</h2>
  ${summaryHtml}

  <h2>Per Page Detail</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 26%">Page File</th>
        <th style="width: 20%">Route(s)</th>
        <th style="width: 54%">Endpoints Called (Detected)</th>
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

