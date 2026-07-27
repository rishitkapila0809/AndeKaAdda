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
  "orderId",
  "buyerName",
  "estimatedDeliveryTime",
  "phoneNumber",
  "blockName",
  "roomNumber",
  "boiledEggs",
  "eggBhurji",
  "totalAmount",
  "status",
  "paymentStatus",
  "orderDate"
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

await db.query(
  `
  INSERT INTO customers (
    "phoneNumber",
    "name",
    "blockName",
    "roomNumber"
  )
  VALUES ($1, $2, $3, $4)

  ON CONFLICT ("phoneNumber")
  DO NOTHING
  `,
  [
    phoneNumber,
    buyerName,
    block,
    roomNumber
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

router.get('/customer/:phone', async (req, res) => {
  try {

    const phone = req.params.phone

    const result = await db.query(
      `
      SELECT *
      FROM orders
      WHERE "phoneNumber" = $1
      ORDER BY id DESC
      `,
      [phone]
    )

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



router.put('/:orderId/status', verifyAdmin, async (req, res) => {

  const client = await db.connect()

  try {

    const { orderId } = req.params
    const { status } = req.body

    const allowedStatuses = [
      'Pending',
      'Preparing',
      'Ready',
      'Delivered',
      'Cancelled'
    ]

    if (!allowedStatuses.includes(status)) {

      return res.json({
        success: false,
        message: 'Invalid order status'
      })

    }

    await client.query('BEGIN')

    const result = await client.query(
      `
      SELECT
        status,
        "boiledEggs",
        "eggBhurji"
      FROM orders
      WHERE "orderId" = $1
      FOR UPDATE
      `,
      [orderId]
    )

    if (result.rows.length === 0) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message: 'Order not found'
      })

    }

    const order = result.rows[0]

    const oldStatus = order.status

    const boiledEggs =
      Number(order.boiledEggs || 0)

    const eggBhurji =
      Number(order.eggBhurji || 0)

    const wasDelivered =
      oldStatus === 'Delivered'

    const isNowDelivered =
      status === 'Delivered'


    if (!wasDelivered && isNowDelivered) {

      const settingsResult =
        await client.query(
          `
          SELECT
            "eggsWithMe",
            "bhurjiWithMe"
          FROM settings
          WHERE id = 1
          FOR UPDATE
          `
        )

      const settings =
        settingsResult.rows[0]

      if (
        Number(settings.eggsWithMe) <
        boiledEggs
      ) {

        await client.query('ROLLBACK')

        return res.json({
          success: false,
          message:
            `You only have ${settings.eggsWithMe} boiled eggs with you.`
        })

      }

      if (
        Number(settings.bhurjiWithMe) <
        eggBhurji
      ) {

        await client.query('ROLLBACK')

        return res.json({
          success: false,
          message:
            `You only have ${settings.bhurjiWithMe} Egg Bhurji with you.`
        })

      }

      await client.query(
        `
        UPDATE settings
        SET
          "eggsWithMe" =
            "eggsWithMe" - $1,

          "bhurjiWithMe" =
            "bhurjiWithMe" - $2

        WHERE id = 1
        `,
        [
          boiledEggs,
          eggBhurji
        ]
      )

    }


    if (wasDelivered && !isNowDelivered) {

      await client.query(
        `
        UPDATE settings
        SET
          "eggsWithMe" =
            "eggsWithMe" + $1,

          "bhurjiWithMe" =
            "bhurjiWithMe" + $2

        WHERE id = 1
        `,
        [
          boiledEggs,
          eggBhurji
        ]
      )

    }


    await client.query(
      `
      UPDATE orders
      SET "status" = $1
      WHERE "orderId" = $2
      `,
      [
        status,
        orderId
      ]
    )

    await client.query('COMMIT')

    const io = req.app.get('io')

    io.emit('ordersUpdated')
    io.emit('settingsUpdated')

    res.json({
      success: true,
      message: 'Order status updated'
    })

  } catch (err) {

    await client.query('ROLLBACK')

    res.json({
      success: false,
      message: err.message
    })

  } finally {

    client.release()

  }

})

router.delete(
  '/:orderId',
  verifyAdmin,
  async (req, res) => {

    try {

      const { orderId } = req.params

      const result = await db.query(
        `
        DELETE FROM orders
        WHERE "orderId" = $1
        `,
        [orderId]
      )

      if (result.rowCount === 0) {
        return res.json({
          success: false,
          message: 'Order not found'
        })
      }

      const io = req.app.get('io')

      io.emit('ordersUpdated')

      res.json({
        success: true,
        message: 'Order deleted successfully'
      })

    } catch (err) {

      res.json({
        success: false,
        message: err.message
      })

    }

  }
)

router.put('/:orderId/payment', verifyAdmin, async (req, res) => {

  try {

    const { orderId } = req.params
    const { paymentStatus } = req.body

    await db.query(
      `
      UPDATE orders
      SET "paymentStatus" = $1
      WHERE "orderId" = $2
      `,
      [paymentStatus, orderId]
    )

    const io = req.app.get('io')

    io.emit('ordersUpdated')

    res.json({
      success: true,
      message: 'Payment updated'
    })

  } catch (err) {

    res.json({
      success: false,
      message: err.message
    })

  }

})

router.put(
  '/:orderId/eta',
  verifyAdmin,
  async (req, res) => {

    try {

      const { orderId } = req.params
      const { minutes } = req.body

      const result = await db.query(
        `
        SELECT "estimatedDeliveryTime"
        FROM orders
        WHERE "orderId" = $1
        `,
        [orderId]
      )

      if (result.rows.length === 0) {
        return res.json({
          success: false,
          message: 'Order not found'
        })
      }

      const currentETA =
        new Date(
          result.rows[0].estimatedDeliveryTime
        )

      currentETA.setMinutes(
        currentETA.getMinutes() + minutes
      )

      const updatedETA =
        currentETA.toISOString()

      await db.query(
        `
        UPDATE orders
        SET "estimatedDeliveryTime" = $1
        WHERE "orderId" = $2
        `,
        [updatedETA, orderId]
      )

      const io = req.app.get('io')

      io.emit('ordersUpdated')

      res.json({
        success: true,
        message: 'ETA updated'
      })

    } catch (err) {

      res.json({
        success: false,
        message: err.message
      })

    }

  }
)


router.put(
  '/:orderId/cancel',
  async (req, res) => {

    try {

      const { orderId } = req.params

      const result = await db.query(
        `
        SELECT "orderDate", status
        FROM orders
        WHERE "orderId" = $1
        `,
        [orderId]
      )

      if (result.rows.length === 0) {
        return res.json({
          success: false,
          message: 'Order not found'
        })
      }

      const order = result.rows[0]

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

      await db.query(
        `
        UPDATE orders
        SET status = 'Cancelled'
        WHERE "orderId" = $1
        `,
        [orderId]
      )

      const io = req.app.get('io')

      io.emit('ordersUpdated')

      res.json({
        success: true,
        message:
          'Order cancelled successfully'
      })

    } catch (err) {

      res.json({
        success: false,
        message: err.message
      })

    }

  }
)


router.get(
  '/ordering-status',
  async (req, res) => {

    try {

      const result = await db.query(
        `
        SELECT "isOrderingEnabled"
        FROM settings
        WHERE id = 1
        `
      )

res.json({
  success: true,
  isOrderingEnabled:
    result.rows[0].isOrderingEnabled
})

    } catch {

      res.json({
        success: false
      })

    }

  }
)

router.get(
  '/maintenance-status',
  async (req, res) => {

    try {

      const result = await db.query(
        `
        SELECT "isMaintenanceEnabled"
        FROM settings
        WHERE id = 1
        `
      )

      res.json({
        success: true,
        isMaintenanceEnabled:
          result.rows[0].isMaintenanceEnabled
      })

    } catch {

      res.json({
        success: false
      })

    }

  }
)

router.put(
  '/ordering-status',
  verifyAdmin,
  async (req, res) => {

    try {

      const {
        isOrderingEnabled
      } = req.body

      await db.query(
        `
        UPDATE settings
        SET "isOrderingEnabled" = $1
        WHERE id = 1
        `,
        [isOrderingEnabled]
      )

      const io = req.app.get('io')

io.emit('settingsUpdated')

      res.json({
        success: true
      })

    } catch {

      res.json({
        success: false
      })

    }

  }
)



router.put(
  '/maintenance-status',
  verifyAdmin,
  async (req, res) => {

    try {

      const {
        isMaintenanceEnabled
      } = req.body

      await db.query(
        `
        UPDATE settings
        SET "isMaintenanceEnabled" = $1
        WHERE id = 1
        `,
        [isMaintenanceEnabled]
      )

      const io = req.app.get('io')

io.emit('settingsUpdated')

      res.json({
        success: true
      })

    } catch {

      res.json({
        success: false
      })

    }

  }
)
router.get(
  '/delivery-inventory',
  verifyAdmin,
  async (req, res) => {

    try {

      const result = await db.query(
        `
        SELECT
          "eggsWithMe",
          "bhurjiWithMe"
        FROM settings
        WHERE id = 1
        `
      )

      res.json({
        success: true,
        eggsWithMe:
          result.rows[0].eggsWithMe,
        bhurjiWithMe:
          result.rows[0].bhurjiWithMe
      })

    } catch (err) {

      res.json({
        success: false,
        message: err.message
      })

    }

  }
)

router.put(
  '/delivery-inventory',
  verifyAdmin,
  async (req, res) => {

    try {

      const {
        eggsWithMe,
        bhurjiWithMe
      } = req.body

      const eggs =
        Number(eggsWithMe)

      const bhurji =
        Number(bhurjiWithMe)

      if (
        !Number.isInteger(eggs) ||
        eggs < 0 ||
        !Number.isInteger(bhurji) ||
        bhurji < 0
      ) {

        return res.json({
          success: false,
          message: 'Invalid inventory'
        })

      }

      await db.query(
        `
        UPDATE settings
        SET
          "eggsWithMe" = $1,
          "bhurjiWithMe" = $2
        WHERE id = 1
        `,
        [eggs, bhurji]
      )

      const io = req.app.get('io')

      io.emit('settingsUpdated')

      res.json({
        success: true
      })

    } catch (err) {

      res.json({
        success: false,
        message: err.message
      })

    }

  }
)


module.exports = router