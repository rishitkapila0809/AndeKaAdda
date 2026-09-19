const express = require('express')
const db = require('../database/postgres')
const verifyAdmin = require('../middleware/auth')

const router = express.Router()

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const date = req.query.date

    if (!date) {
      return res.json({
        success: false,
        message: 'Date is required'
      })
    }

    const result = await db.query(
      `
      SELECT DISTINCT ON ("product_id")
        "product_id",
        "cost_price",
        "effective_from"
      FROM product_cost_history
      WHERE "effective_from" <= $1
      ORDER BY
        "product_id",
        "effective_from" DESC,
        "id" DESC
      `,
      [date]
    )

    const costs = {}

    result.rows.forEach(row => {
      costs[row.product_id] = {
        costPrice: Number(row.cost_price),
        effectiveFrom: row.effective_from
      }
    })

    res.json({
      success: true,
      costs
    })

  } catch (err) {
    res.json({
      success: false,
      message: err.message
    })
  }
})


router.put('/', verifyAdmin, async (req, res) => {
  try {

    const {
      productId,
      costPrice,
      effectiveFrom
    } = req.body

    if (
      typeof productId !== 'string' ||
      !productId.trim()
    ) {
      return res.json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    const price = Number(costPrice)

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.json({
        success: false,
        message: 'Invalid cost price'
      })
    }

    if (!effectiveFrom) {
      return res.json({
        success: false,
        message: 'Effective date is required'
      })
    }

    await db.query(
      `
      INSERT INTO product_cost_history (
        "product_id",
        "cost_price",
        "effective_from"
      )
      VALUES ($1, $2, $3)
      ON CONFLICT ("product_id", "effective_from")
      DO UPDATE SET
        "cost_price" = EXCLUDED."cost_price"
      `,
      [
        productId.trim(),
        price,
        effectiveFrom
      ]
    )

    const io = req.app.get('io')

    if (io) {
      io.emit('costsUpdated')
    }

    res.json({
      success: true,
      message: 'Cost price saved successfully'
    })

  } catch (err) {

    res.json({
      success: false,
      message: err.message
    })

  }
})


module.exports = router