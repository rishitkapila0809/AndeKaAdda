const express = require('express')
const db = require('../database/postgres')
const verifyAdmin = require('../middleware/auth')
const router = express.Router()


router.post('/create', async (req, res) => {
  try {
    const {
      buyerName,
      phoneNumber,
      block,
      roomNumber,
      boiledEggs,
      eggBhurji,
      totalAmount
    } = req.body

    const orderId = 'ORD' + Date.now()
    const status = 'Pending'
    const paymentStatus = 'Pending'
    const orderDate = new Date().toISOString()

    const estimatedDeliveryTime =
      new Date(
        Date.now() + 30 * 60 * 1000
      ).toISOString()

    await db.query(
      `
      INSERT INTO orders (
        orderId,
        buyerName,
        estimatedDeliveryTime,
        phoneNumber,
        blockName,
        roomNumber,
        boiledEggs,
        eggBhurji,
        totalAmount,
        status,
        paymentStatus,
        orderDate
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      `,
      [
        orderId,
        buyerName,
        estimatedDeliveryTime,
        phoneNumber,
        block,
        roomNumber,
        boiledEggs,
        eggBhurji,
        totalAmount,
        status,
        paymentStatus,
        orderDate
      ]
    )

    const io = req.app.get('io')

    io.emit('ordersUpdated')

    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId
    })

  } catch (err) {

    res.json({
      success: false,
      message: err.message
    })

  }
})


router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {

    const result = await db.query(`
      SELECT *
      FROM orders
      ORDER BY id DESC
    `)

    res.json({
      success: true,
      orders: result.rows
    })

  } catch (err) {

    res.json({
      success: false,
      message: err.message
    })

  }
})

router.get('/customer/:phone', (req, res) => {
  const phone = req.params.phone

  const query = `
    SELECT * FROM orders
    WHERE phoneNumber = ?
    ORDER BY id DESC
  `

  db.all(query, [phone], (err, rows) => {
    if (err) {
      return res.json({
        success: false,
        message: err.message
      })
    }

    res.json({
      success: true,
      orders: rows
    })
  })
})



router.put('/:orderId/status', verifyAdmin, (req, res) => {
  const { orderId } = req.params
  const { status } = req.body

  const query = `
    UPDATE orders
    SET status = ?
    WHERE orderId = ?
  `

  db.run(query, [status, orderId], function(err) {
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
      message: 'Order status updated'
    })
  })
})

router.delete('/:orderId', verifyAdmin, (req, res) => {
  const { orderId } = req.params

  const query = `
    DELETE FROM orders
    WHERE orderId = ?
  `

  db.run(query, [orderId], function(err) {
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
      message: 'Order deleted successfully'
    })
  })
})

router.put(
  '/:orderId/payment',
  verifyAdmin,
  (req, res) => {
    const { orderId } = req.params
    const { paymentStatus } = req.body

    const query = `
      UPDATE orders
      SET paymentStatus = ?
      WHERE orderId = ?
    `

    db.run(
      query,
      [paymentStatus, orderId],
      function (err) {
        if (err) {
          return res.json({
            success: false,
            message: err.message,
          })
        }

        const io = req.app.get('io')

        io.emit('ordersUpdated')

        res.json({
          success: true,
          message: 'Payment updated',
        })
      }
    )
  }
)
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

    db.get(
      getQuery,
      [orderId],
      (err, order) => {
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
      }
    )
  }
)


router.put(
  '/:orderId/cancel',
  (req, res) => {
    const { orderId } = req.params

    const getQuery = `
      SELECT orderDate, status
      FROM orders
      WHERE orderId = ?
    `

    db.get(
      getQuery,
      [orderId],
      (err, order) => {
        if (err || !order) {
          return res.json({
            success: false,
            message: 'Order not found'
          })
        }

        if (order.status !== 'Pending') {
          return res.json({
            success: false,
            message:
              'Order can no longer be cancelled'
          })
        }

        const orderTime =
          new Date(order.orderDate)

        const now = new Date()

        const difference =
          (now - orderTime) / 1000 / 60

        if (difference > 2) {
          return res.json({
            success: false,
            message:
              'Time limit for cancellation exceeded'
          })
        }

        const updateQuery = `
          UPDATE orders
          SET status = 'Cancelled'
          WHERE orderId = ?
        `

        db.run(
          updateQuery,
          [orderId],
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
              message:
                'Order cancelled successfully'
            })
          }
        )
      }
    )
  }
)


router.get(
  '/ordering-status',
  (req, res) => {

    db.get(
      `
      SELECT isOrderingEnabled
      FROM settings
      WHERE id = 1
      `,
      [],
      (err, row) => {

        if (err) {
          return res.json({
            success: false
          })
        }

        res.json({
          success: true,
          isOrderingEnabled:
            row.isOrderingEnabled
        })
      }
    )
  }
)

router.put(
  '/ordering-status',
  verifyAdmin,
  (req, res) => {

    const {
      isOrderingEnabled
    } = req.body

    db.run(
      `
      UPDATE settings
      SET isOrderingEnabled = ?
      WHERE id = 1
      `,
      [isOrderingEnabled],
      function(err) {

        if (err) {
          return res.json({
            success: false
          })
        }

        res.json({
          success: true
        })
      }
    )
  }
)


module.exports = router