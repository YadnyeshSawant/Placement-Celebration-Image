var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = process.env.PORT || 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
function getDriveId(url) {
  if (!url) return null;
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam) return matchIdParam[1];
  const matchFileD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD) return matchFileD[1];
  const matchUc = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (matchUc) return matchUc[1];
  return null;
}
var apiRouter = import_express.default.Router();
apiRouter.get(["/proxy-image", "/api/proxy-image"], async (req, res) => {
  try {
    const rawUrl = req.query.url;
    const fileId = req.query.id || (rawUrl ? getDriveId(rawUrl) : null);
    if (!fileId && !rawUrl) {
      return res.status(400).send("Missing file id or url");
    }
    const targetUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w1200` : rawUrl;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (!response.ok) {
      const fallbackUrl = fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : rawUrl;
      const fbResponse = await fetch(fallbackUrl);
      if (!fbResponse.ok) {
        return res.status(fbResponse.status).send("Failed to fetch image");
      }
      const contentType2 = fbResponse.headers.get("content-type") || "image/jpeg";
      const arrayBuffer2 = await fbResponse.arrayBuffer();
      res.setHeader("Content-Type", contentType2);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(Buffer.from(arrayBuffer2));
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Proxy image error:", err);
    res.status(500).send("Image proxy error: " + err.message);
  }
});
apiRouter.get(["/default-dataset", "/api/default-dataset"], async (_req, res) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const envSheetUrl = process.env.GOOGLE_SHEET_URL;
    if (envSheetUrl && envSheetUrl.trim().length > 0) {
      let csvUrl = envSheetUrl.trim();
      if (csvUrl.includes("docs.google.com/spreadsheets")) {
        const match = csvUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          const spreadsheetId = match[1];
          csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
        }
      }
      const liveSyncUrl = `${csvUrl}${csvUrl.includes("?") ? "&" : "?"}nocache=${Date.now()}`;
      try {
        const response = await fetch(liveSyncUrl, { cache: "no-store" });
        if (response.ok) {
          const csvText = await response.text();
          if (csvText && csvText.trim().length > 0) {
            return res.type("text/csv").send(csvText);
          }
        }
      } catch (fetchErr) {
        console.warn("Failed to live sync GOOGLE_SHEET_URL on startup, falling back to workspace dataset:", fetchErr);
      }
    }
    const filePath = import_path.default.join(process.cwd(), "public", "assets", "aistudio", "Placement_Celebration_Student_Image_Collection__Responses__7cf17197");
    if (import_fs.default.existsSync(filePath)) {
      const data = import_fs.default.readFileSync(filePath, "utf-8");
      return res.type("text/csv").send(data);
    }
    return res.status(404).json({ error: "Default response dataset file not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
apiRouter.get(["/config", "/api/config"], (_req, res) => {
  res.json({
    formUrl: process.env.GOOGLE_FORM_URL || "https://docs.google.com/forms/d/e/1FAIpQLSc_ExampleForm/viewform",
    sheetUrl: process.env.GOOGLE_SHEET_URL || ""
  });
});
apiRouter.post(["/login", "/api/login"], (req, res) => {
  try {
    const { appId, password } = req.body || {};
    const expectedAppId = process.env.ADMIN_USER || "admin@mitwpu.edu.in";
    const expectedPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";
    const jwtSecret = process.env.JWT_SECRET || "ConfidentialPortalJWTSecretKey2026!WPU";
    if (appId === expectedAppId && password === expectedPassword) {
      const token = import_jsonwebtoken.default.sign(
        {
          appId: expectedAppId,
          role: "ADMIN",
          issuedAt: Date.now()
        },
        jwtSecret,
        { expiresIn: "5m" }
      );
      return res.json({
        success: true,
        token,
        user: {
          appId: expectedAppId,
          role: "ADMIN"
        }
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid App ID or Password. Credentials do not match environment variables."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
apiRouter.get(["/verify-token", "/api/verify-token"], (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "ConfidentialPortalJWTSecretKey2026!WPU";
    const decoded = import_jsonwebtoken.default.verify(token, jwtSecret);
    return res.json({ valid: true, decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, error: "Token expired or invalid signature" });
  }
});
apiRouter.post(["/fetch-google-sheet", "/api/fetch-google-sheet"], async (req, res) => {
  try {
    const { sheetUrl } = req.body || {};
    if (!sheetUrl) {
      return res.status(400).json({ error: "sheetUrl is required" });
    }
    let csvUrl = sheetUrl;
    if (sheetUrl.includes("docs.google.com/spreadsheets")) {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const spreadsheetId = match[1];
        csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      }
    }
    const response = await fetch(`${csvUrl}${csvUrl.includes("?") ? "&" : "?"}nocache=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      return res.status(400).json({
        error: `Failed to fetch Google Sheet CSV (Status: ${response.status}). Make sure sheet sharing is set to "Anyone with the link can view".`
      });
    }
    const csvText = await response.text();
    return res.type("text/csv").send(csvText);
  } catch (err) {
    res.status(500).json({ error: "Failed to sync Google Sheet: " + err.message });
  }
});
apiRouter.post(["/ai-chat", "/api/ai-chat"], async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
    }
    const { prompt, systemInstruction } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : void 0
    });
    return res.json({ text: response.text });
  } catch (err) {
    console.error("Gemini AI Chat Proxy Error:", err);
    return res.status(500).json({ error: err.message || "AI Assistant processing failed." });
  }
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    app.use(import_express.default.static(import_path.default.join(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(process.cwd(), "dist", "index.html"));
    });
  }
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  }
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
