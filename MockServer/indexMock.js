import express from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware for CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Mock Server Running');
});

// Mock GET /getGecoLog
app.get('/getGecoLog', (req, res) => {
  const { procnumber, bank } = req.query;
  res.send([
    { dir: `\\\\mockpath\\GECO\\${bank}\\${procnumber.slice(0, 3)}\\${procnumber.slice(3, 6)}`, fileName: 'GECO_log1.txt' },
    { dir: `\\\\mockpath\\GECO\\${bank}\\${procnumber.slice(0, 3)}\\${procnumber.slice(3, 6)}`, fileName: 'GECO_log2.txt' },
  ]);
});

// Mock GET /getBalcLog
app.get('/getBalcLog', (req, res) => {
  const { procnumber, bank } = req.query;
  res.send([
    { date: '20250624', dir: `\\\\mockpath\\BALC\\${bank}\\20250624`, fileName: `${procnumber}_logA.txt` },
    { date: '20250623', dir: `\\\\mockpath\\BALC\\${bank}\\20250623`, fileName: `${procnumber}_logB.txt` },
  ]);
});

// Mock GET /getProcPair
app.get('/getProcPair', async (req, res) => {
  const { fileName, fileloc, procnumber, bank } = req.query;

  try {
    const reqXML = await readFile(path.join(__dirname, 'req.xml'), 'utf-8');
    const resXML = await readFile(path.join(__dirname, 'res.xml'), 'utf-8');

    res.send([
      { fileName: `${fileName}_REQUEST.xml`, xml: reqXML },
      { fileName: `${fileName}_RESPONSE.xml`, xml: resXML },
    ]);
  } catch (error) {
    console.error('Error reading XML files:', error);
    res.status(500).send('Failed to load XML mock data');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
