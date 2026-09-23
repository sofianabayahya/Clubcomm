require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Alleen de map public/ is openbaar; server.js, package.json, .env e.d. blijven afgeschermd
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ClubComm Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Development login endpoint (no database needed)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log(`🔐 Login attempt: ${email}`);

  // Development test accounts
  const testAccounts = [
    { email: 'ouder@test.nl', password: 'test', role: 'ouder', name: 'Test Ouder' },
    { email: 'hjo@test.nl', password: 'test', role: 'hjo', name: 'HJO Admin' },
    { email: 'trainer@test.nl', password: 'test', role: 'trainer', name: 'Test Trainer' }
  ];

  const account = testAccounts.find(acc => acc.email === email && acc.password === password);

  if (account) {
    // Simple token (in production use proper JWT)
    const token = Buffer.from(JSON.stringify({ 
      userId: Math.floor(Math.random() * 1000),
      email: account.email, 
      role: account.role,
      name: account.name 
    })).toString('base64');

    res.json({
      success: true,
      token,
      user: {
        id: Math.floor(Math.random() * 1000),
        email: account.email,
        role: account.role,
        name: account.name
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Development registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { parent } = req.body;

  console.log(`📝 Registration request: ${parent.firstName} ${parent.lastName} (${parent.email})`);

  // Simulate successful registration
  res.json({ 
    success: true, 
    message: 'Registration request submitted successfully (DEV MODE)',
    requestId: Math.floor(Math.random() * 1000)
  });
});

// Development absence reporting
app.post('/api/attendance/absence', (req, res) => {
  const { trainingDate, reason } = req.body;

  console.log(`📅 Absence reported for ${trainingDate}: ${reason}`);

  // Check if it's late (for demo purposes, randomly assign yellow card)
  const isLateReport = Math.random() > 0.7;

  res.json({ 
    success: true, 
    yellowCard: isLateReport,
    message: isLateReport ? 'Afgemeld - Gele kaart toegekend (DEV MODE)' : 'Afmelding geregistreerd (DEV MODE)'
  });
});

// Catch-all for client-side routing
// Bestanden met een extensie (.png, .js, ...) die niet in public/ staan krijgen een echte 404
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Niet gevonden');
  }
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ClubComm server running on port ${PORT}`);
  console.log(`📍 Access at: http://localhost:${PORT}`);
  console.log(`🔐 Test accounts:`);
  console.log(`   • ouder@test.nl / test`);
  console.log(`   • hjo@test.nl / test`);
  console.log(`   • trainer@test.nl / test`);
});

module.exports = app;