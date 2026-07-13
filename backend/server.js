require('dotenv').config()
require('./database/postgres')
const express = require('express')
const orderRoutes = require('./routes/orders')
const cors = require('cors')
const adminRoutes = require('./routes/admin')




const http = require('http')

const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT || 5000

const { Server } = require('socket.io')

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})


app.set('io', io)

app.use(cors())
app.use(express.json())
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running'
  })
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = io