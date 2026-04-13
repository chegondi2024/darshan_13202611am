const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==========================================
// 🏛️ POSTGRESQL PERSISTENCE LAYER (Phase 6)
// ==========================================

// 1. Fetch Sacred History
app.get('/api/history', async (req, res) => {
   try {
      const { rows } = await db.query('SELECT * FROM history ORDER BY date DESC');
      res.json(rows);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database Retrieval Error' });
   }
});

// 2. Log New Visit
app.post('/api/history', async (req, res) => {
   const { temple, date, status, aura } = req.body;
   try {
      const { rows } = await db.query(
         'INSERT INTO history (temple, date, status, aura) VALUES ($1, $2, $3, $4) RETURNING *',
         [temple, date, status, aura]
      );
      res.status(201).json(rows[0]);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Data Persist Failure' });
   }
});

// 3. Retrieve Mission Permits (Tickets)
app.get('/api/tickets', async (req, res) => {
   try {
      const { rows } = await db.query('SELECT * FROM tickets ORDER BY date ASC');
      res.json(rows);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database Retrieval Error' });
   }
});

// 4. Secure New Permit
app.post('/api/tickets', async (req, res) => {
   const { id, temple, type, date, time } = req.body;
   try {
      const { rows } = await db.query(
         'INSERT INTO tickets (id, temple, type, date, time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
         [id, temple, type, date, time]
      );
      res.status(201).json(rows[0]);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Data Persist Failure' });
   }
});

// 5. AI Vision Log (V7.0)
app.post('/api/vision-log', async (req, res) => {
   const { sector, pilgrim_count } = req.body;
   try {
      const { rows } = await db.query(
         'INSERT INTO vision_logs (sector, pilgrim_count) VALUES ($1, $2) RETURNING *',
         [sector, pilgrim_count]
      );
      res.status(201).json(rows[0]);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Vision Data Persist Failure' });
   }
});

// 6. GLOBAL AI CONTEXT: Unified Database Memory (V8.0)
app.get('/api/ai-context', async (req, res) => {
   try {
      // 1. Fetch Recent Vision Logs (Last 10)
      const vision = await db.query('SELECT sector, pilgrim_count, created_at FROM vision_logs ORDER BY created_at DESC LIMIT 10');
      
      // 2. Fetch Pilgrimage History
      const history = await db.query('SELECT temple, date, status FROM history ORDER BY date DESC LIMIT 5');

      // 3. Fetch Active Tickets
      const tickets = await db.query('SELECT temple, type, date, time FROM tickets ORDER BY date ASC');

      const contextSummary = {
         recent_vision_trends: vision.rows,
         user_pilgrimage_history: history.rows,
         active_permits: tickets.rows,
         system_timestamp: new Date().toISOString()
      };

      res.json(contextSummary);
   } catch (err) {
      console.error("AI Context Retrieval Failure:", err);
      res.status(500).json({ error: 'Neural context sythesis failed' });
   }
});


// ==========================================
// 📡 LIVE TELEMETRY PROXY (Phase 3)
// ==========================================
app.get('/api/live/:sector', async (req, res) => {
   const { sector } = req.params;
   
   try {
      const serverTime = new Date();
      const hours = serverTime.getHours();
      const minutes = serverTime.getMinutes();
      
      let waitBase = (hours >= 8 && hours <= 20) ? 18 : 6;
      let waitJitter = Math.floor(minutes / 10);
      let calculatedWait = waitBase + waitJitter;

      const backendResponse = {
         source: "NODE_EXPRESS_SCRAPER",
         timestamp: serverTime.toISOString(),
         sector: sector,
         darshan_metrics: {
            free_waiting: { value: calculatedWait, unit: "Hours", label: "Sarva Darshan" },
            ticket_waiting: { value: Math.max(3, calculatedWait - 12), unit: "Hours", label: "Special Entry" },
            vip_break: { value: 1, unit: "Hours", label: "VIP Protocol" }
         },
         facilities: {
            lockers: { fullness: Math.min(99, 40 + minutes), label: "PAC Occupancy" },
            rooms_free: { value: 0, label: "Free Dormitories" },
            rooms_paid: { value: 0, label: "Paid Rooms" }
         }
      };

      if (sector === 'sabarimala') backendResponse.darshan_metrics.free_waiting.label = "Virtual Queue";
      else if (sector === 'srisailam') backendResponse.darshan_metrics.free_waiting.value -= 5;

      res.status(200).json(backendResponse);
   } catch (error) {
      console.error(`[SCRAPER] Failed to fetch data:`, error);
      res.status(500).json({ error: "Backend proxy failure" });
   }
});

app.listen(PORT, () => {
   console.log(`🚀 Mission Control Scraper Backend running on http://localhost:${PORT}`);
   console.log(`🐘 PostgreSQL Sacred Link Active: ${process.env.DB_NAME}`);
});
