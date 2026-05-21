const verifyAdmin = require('../middleware/auth')
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const router = express.Router()

const ADMIN_USERNAME =
  process.env.ADMIN_USERNAME || 'admin'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kapila123'

const hashedPassword = bcrypt.hashSync(
  ADMIN_PASSWORD,
  10
)

router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username !== ADMIN_USERNAME) {
    return res.json({
      success: false,
      message: 'Invalid username'
    })
  }

  const isPasswordCorrect = bcrypt.compareSync(
    password,
    hashedPassword
  )

  if (!isPasswordCorrect) {
    return res.json({
      success: false,
      message: 'Invalid password'
    })
  }

  const token = jwt.sign(
    {
      username: ADMIN_USERNAME
    },
    process.env.JWT_SECRET || 'kapila_secret_key',
    {
      expiresIn: '7d'
    }
  )

  res.json({
    success: true,
    token
  })
})

router.put(
  '/:orderId/eta',
  verifyAdmin,
  (req, res) => {
    const { orderId } = req.params
    const { minutes } = req.body

    const getQuery = `
      SELECT estimatedDeliveryTime
      FROM orders
      WHERE orderId = ?
    `

    db.get(getQuery, [orderId], (err, order) => {
      if (err || !order) {
        return res.json({
          success: false,
          message: 'Order not found'
        })
      }

      const currentETA =
        new Date(order.estimatedDeliveryTime)

      currentETA.setMinutes(
        currentETA.getMinutes() + minutes
      )

      const updatedETA =
        currentETA.toISOString()

      const updateQuery = `
        UPDATE orders
        SET estimatedDeliveryTime = ?
        WHERE orderId = ?
      `

      db.run(
        updateQuery,
        [updatedETA, orderId],
        function(err) {
          if (err) {
            return res.json({
              success: false,
              message: err.message
            })
          }

          const io = req.app.get('io')

          io.emit('ordersUpdated')

          res.json({
            success: true,
            message: 'ETA updated'
          })
        }
      )
    })
  }
)

module.exports = router