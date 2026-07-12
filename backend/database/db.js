const sqlite3 = require('sqlite3').verbose()

console.log('Current working directory:', process.cwd())
console.log('Database path:', require('path').resolve('./database/orders.db'))

const db = new sqlite3.Database(
  './database/orders.db',
  (err) => {
    if (err) {
      console.log(
        'Database connection error:',
        err.message
      )
    } else {
      console.log(
        'Connected to SQLite database'
      )
    }
  }
)

db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT,
    buyerName TEXT,
    phoneNumber TEXT,
    blockName TEXT,
    roomNumber TEXT,
    boiledEggs INTEGER,
    eggBhurji INTEGER,
    totalAmount INTEGER,
    status TEXT,
    paymentStatus TEXT DEFAULT 'Pending',
    orderDate TEXT
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    isOrderingEnabled INTEGER
  )
`)

db.get(
  `SELECT * FROM settings WHERE id = 1`,
  (err, row) => {

    if (!row) {

      db.run(
        `
        INSERT INTO settings
        (id, isOrderingEnabled)
        VALUES (1, 1)
        `
      )
    }
  }
)

db.run(`
  ALTER TABLE orders
  ADD COLUMN estimatedDeliveryTime TEXT
`, (err) => {
  if (
    err &&
    !err.message.includes('duplicate column name')
  ) {
    console.log(err.message)
  }
})

module.exports = db