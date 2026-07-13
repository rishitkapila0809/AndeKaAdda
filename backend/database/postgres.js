const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err)
})

console.log('Neon PostgreSQL pool initialized')

module.exports = pool