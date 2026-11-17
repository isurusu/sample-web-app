const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { CATALOG, calculateSubtotalCents, calculateTaxCents, formatUsd } = require("./lib/pricing");

function resolvePort() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) {
      return Number(args[i + 1]);
    }
    if (args[i].startsWith("--port=")) {
      return Number(args[i].split("=")[1]);
    }
  }
  return Number(process.env.PORT) || 3000;
}

const PORT = resolvePort();
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) reject(new Error("Payload too large"));
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function serveStaticFile(res, relativeFile) {
  const fullPath = path.join(PUBLIC_DIR, relativeFile);
  if (!fullPath.startsWith(PUBLIC_DIR) || !fs.existsSync(fullPath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }
  const ext = path.extname(fullPath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(fullPath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/api/health") {
    return sendJson(res, 200, { status: "ok", service: "cloudcart-sample-web-app" });
  }

  if (req.method === "GET" && pathname === "/api/catalog") {
    return sendJson(res, 200, { items: CATALOG });
  }

  if (req.method === "POST" && pathname === "/api/login") {
    try {
      const body = await readJsonBody(req);
      const email = String(body.email || "").trim();
      const password = String(body.password || "");
      if (!email.includes("@") || password.length < 4) {
        return sendJson(res, 400, { ok: false, error: "Valid email and password (4+ chars) required." });
      }
      return sendJson(res, 200, {
        ok: true,
        user: { email, name: email.split("@")[0], role: "customer" }
      });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: err.message });
    }
  }

  if (req.method === "POST" && pathname === "/api/checkout") {
    try {
      const body = await readJsonBody(req);
      const items = Array.isArray(body.items) && body.items.length > 0
        ? body.items
        : [{ id: "sec-key", qty: 1 }, { id: "gvisor-hoodie", qty: 1 }];
      const subtotalCents = calculateSubtotalCents(items);
      const taxCents = calculateTaxCents(subtotalCents);
      const totalCents = subtotalCents + taxCents;
      return sendJson(res, 200, {
        ok: true,
        orderId: "CC-2026-8841",
        totalFormatted: formatUsd(totalCents)
      });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message });
    }
  }

  if (req.method === "GET") {
    if (pathname === "/") return serveStaticFile(res, "index.html");
    if (pathname === "/login") return serveStaticFile(res, "login.html");
    if (pathname === "/checkout") return serveStaticFile(res, "checkout.html");
    const cleanRel = pathname.replace(/^\/+/, "");
    return serveStaticFile(res, cleanRel);
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method Not Allowed");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[CloudCart] Storefront listening on http://localhost:${PORT}`);
});
