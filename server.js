
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use 3002 as default local port to avoid conflict with 3000/3001/8080
// Cloud Run will automatically set PORT=8080, which takes precedence.
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// --- LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- API ROUTES ---

// 1. Config Handshake (The Bridge)
// This allows the frontend to get the API Key from the server environment
app.get('/api/config', (req, res) => {
  const apiKey = process.env.API_KEY || process.env.GOOGLE_API_KEY;
  
  // Return 200 even if missing, so frontend handles the "No Key" state gracefully
  // Cache-Control: no-store ensures we don't cache a "missing key" state on mobile
  res.set('Cache-Control', 'no-store');
  res.json({ 
    apiKey: apiKey || null,
    status: apiKey ? 'configured' : 'missing'
  });
});

// 2. Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '5.9.3',
    apiKeyConfigured: !!process.env.API_KEY 
  });
});

// 3. Root Diagnostic
app.get('/status', (req, res) => {
  const hasKey = !!(process.env.API_KEY || process.env.GOOGLE_API_KEY);
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
        <h1>Scripture Voice Server v5.9.3</h1>
        <p>Status: <strong>Online</strong></p>
        <p>Port: ${PORT}</p>
        <p>API Key Configured: <strong style="color: ${hasKey ? 'green' : 'red'}">${hasKey ? 'YES' : 'NO'}</strong></p>
        <p style="font-size: 0.8rem; color: #666;">If NO, set the API_KEY environment variable in Cloud Run.</p>
      </body>
    </html>
  `);
});

// --- SERVE STATIC FRONTEND ---
// Serve the built React files from 'dist' folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle client-side routing (serve index.html for all non-API routes)
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Log 404s for API routes to help debugging
    console.warn(`[404] API Endpoint Not Found: ${req.originalUrl}`);
    // Ensure API 404s are JSON, not HTML
    return res.status(404).json({ error: "API Endpoint Not Found", path: req.originalUrl });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Server Error: Could not load application.");
    }
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`   SCRIPTURE VOICE SERVER v5.9.3`);
  console.log(`   Listening on port ${PORT}`);
  console.log(`   http://0.0.0.0:${PORT}`);
  const hasKey = !!(process.env.API_KEY || process.env.GOOGLE_API_KEY);
  console.log(`   API Key Loaded: ${hasKey ? 'YES' : 'NO (Check Cloud Run Env Vars)'}`);
  console.log(`=================================`);
});
