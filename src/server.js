const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const seed = require('./seeders');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log(`Connecting to database (${sequelize.getDialect()})...`);
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // Sync models
    await sequelize.sync({ force: false });
    console.log('✓ Sequelize models synchronized');

    // Run seeder
    await seed();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Skill Assessment Backend running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
  }
}

startServer();
