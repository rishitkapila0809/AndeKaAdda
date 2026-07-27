const express = require('express')
const db = require('../database/postgres')

const router = express.Router()
router.post('/signup', async (req, res) => {
  try {

    const {
      name,
      phoneNumber,
      blockName,
      roomNumber
    } = req.body

    const phoneRegex = /^[0-9]{10}$/

    if (
      !name ||
      !phoneRegex.test(phoneNumber) ||
      !blockName ||
      !roomNumber
    ) {
      return res.json({
        success: false,
        message: 'Please enter valid details'
      })
    }

    const existingCustomer =
      await db.query(
        `
        SELECT id
        FROM customers
        WHERE "phoneNumber" = $1
        `,
        [phoneNumber]
      )

    if (existingCustomer.rows.length > 0) {
      return res.json({
        success: false,
        message:
          'An account already exists with this phone number'
      })
    }

    const result = await db.query(
      `
      INSERT INTO customers (
        "phoneNumber",
        "name",
        "blockName",
        "roomNumber"
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        phoneNumber,
        name,
        blockName,
        roomNumber
      ]
    )

    res.json({
      success: true,
      customer: result.rows[0]
    })

  } catch (err) {

    res.json({
      success: false,
      message: err.message
    })

  }
})

router.get('/:phone', async (req, res) => {
  try {
    const { phone } = req.params

    const result = await db.query(
      `
      SELECT *
      FROM customers
      WHERE "phoneNumber" = $1
      `,
      [phone]
    )

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Customer not found'
      })
    }

    res.json({
      success: true,
      customer: result.rows[0]
    })

  } catch (err) {
    res.json({
      success: false,
      message: err.message
    })
  }
})

router.put('/:phone', async (req, res) => {
  try {
    const { phone } = req.params

    const {
      name,
      blockName,
      roomNumber
    } = req.body

    const result = await db.query(
      `
      UPDATE customers
      SET
        "name" = $1,
        "blockName" = $2,
        "roomNumber" = $3
      WHERE "phoneNumber" = $4
      RETURNING *
      `,
      [
        name,
        blockName,
        roomNumber,
        phone
      ]
    )

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Customer not found'
      })
    }

    res.json({
      success: true,
      customer: result.rows[0]
    })

  } catch (err) {
    res.json({
      success: false,
      message: err.message
    })
  }
})

module.exports = router