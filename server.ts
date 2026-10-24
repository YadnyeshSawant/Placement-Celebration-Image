import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to extract Google Drive ID from various URL formats
function getDriveId(url: string): string | null {
  if (!url) return null;
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam) return matchIdParam[1];

  const matchFileD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD) return matchFileD[1];

  const matchUc = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (matchUc) return matchUc[1];

  return null;
}

// API Router for serverless & local development compatibility
const apiRouter = express.Router();

// Image Proxy route to bypass Google Drive CORS restrictions for canvas/PDF generation
apiRouter.get(['/proxy-image', '/api/proxy-image'], async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    const fileId = req.query.id as string || (rawUrl ? getDriveId(rawUrl) : null);

    if (!fileId && !rawUrl) {
      return res.status(400).send('Missing file id or url');
    }

    const targetUrl = fileId
      ? `https://lh3.googleusercontent.com/d/${fileId}=w1200`
      : rawUrl;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      const fallbackUrl = fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : rawUrl;
      const fbResponse = await fetch(fallbackUrl);
      if (!fbResponse.ok) {
        return res.status(fbResponse.status).send('Failed to fetch image');
      }
      const contentType = fbResponse.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await fbResponse.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(Buffer.from(arrayBuffer));
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Proxy image error:', err);
    res.status(500).send('Image proxy error: ' + err.message);
  }
});

// Endpoint to fetch CSV dataset
apiRouter.get(['/default-dataset', '/api/default-dataset'], async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const envSheetUrl = process.env.GOOGLE_SHEET_URL;

    if (envSheetUrl && envSheetUrl.trim().length > 0) {
      let csvUrl = envSheetUrl.trim();
      if (csvUrl.includes('docs.google.com/spreadsheets')) {
        const match = csvUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          const spreadsheetId = match[1];
          csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
        }
      }

      const liveSyncUrl = `${csvUrl}${csvUrl.includes('?') ? '&' : '?'}nocache=${Date.now()}`;

      try {
        const response = await fetch(liveSyncUrl, { cache: 'no-store' });
        if (response.ok) {
          const csvText = await response.text();
          if (csvText && csvText.trim().length > 0) {
            return res.type('text/csv').send(csvText);
          }
        }
      } catch (fetchErr) {
        console.warn('Failed to live sync GOOGLE_SHEET_URL on startup, falling back to workspace dataset:', fetchErr);
      }
    }

    // Fallback to local workspace response dataset file
    const filePath = path.join(process.cwd(), 'public', 'assets', 'aistudio', 'Placement_Celebration_Student_Image_Collection__Responses__7cf17197');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return res.type('text/csv').send(data);
    }
    return res.status(404).json({ error: 'Default response dataset file not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to return application config
apiRouter.get(['/config', '/api/config'], (_req, res) => {
  res.json({
    formUrl: process.env.GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/e/1FAIpQLSc_ExampleForm/viewform',
    sheetUrl: process.env.GOOGLE_SHEET_URL || '',
  });
});

// Endpoint to authenticate login using JWT
apiRouter.post(['/login', '/api/login'], (req, res) => {
  try {
    const { appId, password } = req.body || {};

    const expectedAppId = process.env.ADMIN_USER || 'admin@mitwpu.edu.in';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const jwtSecret = process.env.JWT_SECRET || 'ConfidentialPortalJWTSecretKey2026!WPU';

    if (appId === expectedAppId && password === expectedPassword) {
      const token = jwt.sign(
        {
          appId: expectedAppId,
          role: 'ADMIN',
          issuedAt: Date.now(),
        },
        jwtSecret,
        { expiresIn: '5m' }
      );

      return res.json({
        success: true,
        token,
        user: {
          appId: expectedAppId,
          role: 'ADMIN',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid App ID or Password. Credentials do not match environment variables.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint to verify JWT Token validity
apiRouter.get(['/verify-token', '/api/verify-token'], (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'ConfidentialPortalJWTSecretKey2026!WPU';

    const decoded = jwt.verify(token, jwtSecret);
    return res.json({ valid: true, decoded });
  } catch (err: any) {
    return res.status(401).json({ valid: false, error: 'Token expired or invalid signature' });
  }
});

// Endpoint to fetch Google Sheet live CSV data
apiRouter.post(['/fetch-google-sheet', '/api/fetch-google-sheet'], async (req, res) => {
  try {
    const { sheetUrl } = req.body || {};
    if (!sheetUrl) {
      return res.status(400).json({ error: 'sheetUrl is required' });
    }

    let csvUrl = sheetUrl;
    if (sheetUrl.includes('docs.google.com/spreadsheets')) {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const spreadsheetId = match[1];
        csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      }
    }

    const response = await fetch(`${csvUrl}${csvUrl.includes('?') ? '&' : '?'}nocache=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      return res.status(400).json({
        error: `Failed to fetch Google Sheet CSV (Status: ${response.status}). Make sure sheet sharing is set to "Anyone with the link can view".`
      });
    }

    const csvText = await response.text();
    return res.type('text/csv').send(csvText);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sync Google Sheet: ' + err.message });
  }
});

// Server-side Gemini AI Chat Assistant Proxy Endpoint
apiRouter.post(['/ai-chat', '/api/ai-chat'], async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
    }

    const { prompt, systemInstruction } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return res.json({ text: response.text });
  } catch (err: any) {
    console.error('Gemini AI Chat Proxy Error:', err);
    return res.status(500).json({ error: err.message || 'AI Assistant processing failed.' });
  }
});

// Mount router under both /api and root /
app.use('/api', apiRouter);
app.use('/', apiRouter);

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
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

export default app;
