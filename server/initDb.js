const { query } = require('./db');

const init = async () => {
  console.log('🚀 Initiating Sacred Grid Database Schema...');

  try {
    // 1. Create History Table
    await query(`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        temple VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        aura VARCHAR(50) NOT NULL
      );
    `);
    console.log('✅ History Table Verified');

    // 2. Create Tickets Table
    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(100) PRIMARY KEY,
        temple VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(50) NOT NULL
      );
    `);
    console.log('✅ Tickets Table Verified');

    // 3. Create Vision Logs Table (V7.0)
    await query(`
      CREATE TABLE IF NOT EXISTS vision_logs (
        id SERIAL PRIMARY KEY,
        sector VARCHAR(100) NOT NULL,
        pilgrim_count INTEGER NOT NULL,
        log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Vision Logs Table Verified');

    // 3. Optional Seeding
    const { rows } = await query('SELECT count(*) FROM history');
    if (parseInt(rows[0].count) === 0) {
      console.log('🌱 Seeding sample data...');
      await query(`
        INSERT INTO history (temple, date, status, aura) VALUES 
        ('Tirupati Sector', '2026-03-15', 'Completed', 'gold'),
        ('Vijayawada Sector', '2026-04-02', 'Completed', 'emerald');
      `);
      await query(`
        INSERT INTO tickets (id, temple, type, date, time) VALUES 
        ('TKT-9982X', 'Srisailam AI Hub', 'Athiseeghra Break', '2026-04-18', '10:00 AM');
      `);
      console.log('✅ Sample Data Seeded');
    }

    console.log('🏛️ Darshanam AI Database is MISSION READY');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Initialization Failed:', err);
    process.exit(1);
  }
};

init();
