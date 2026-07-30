

const express = require('express')
const db = require('../database/postgres')

const router = express.Router()

router.post('/create', async (req, res) => {
  try {

    const {
      phoneNumber,
      eggQuantity,
      timeSlot
    } = req.body

    if (
      !phoneNumber ||
      !Number.isInteger(Number(eggQuantity)) ||
      Number(eggQuantity) < 2 ||
      !timeSlot
    ) {
      return res.json({
        success: false,
        message: 'Please enter valid schedule details'
      })
    }

    const customerResult =
      await db.query(
        `
        SELECT id
        FROM customers
        WHERE "phoneNumber" = $1
        `,
        [phoneNumber]
      )

    if (customerResult.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Customer not found'
      })
    }

    const customerId =
      customerResult.rows[0].id

    const existingSchedule =
      await db.query(
        `
        SELECT *
        FROM schedules
        WHERE "customerId" = $1
        `,
        [customerId]
      )

    if (existingSchedule.rows.length > 0) {
      return res.json({
        success: false,
        message: 'You already have a schedule'
      })
    }

    const result =
      await db.query(
        `
        INSERT INTO schedules (
          "customerId",
          "eggQuantity",
          "timeSlot",
          "scheduleType",
          "totalDeliveries",
          "usedDeliveries",
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          'free_trial',
          7,
          0,
          'Active'
        )
        RETURNING *
        `,
        [
          customerId,
          Number(eggQuantity),
          timeSlot
        ]
      )

    res.json({
      success: true,
      schedule: result.rows[0]
    })

  } catch (err) {

    console.log(err)

    res.json({
      success: false,
      message: err.message
    })

  }
})

router.get('/admin/all', async (req, res) => {
  try {

    const result = await db.query(
      `
      SELECT
        s.*,

        c."name",
        c."phoneNumber",
        c."blockName",
        c."roomNumber"

      FROM schedules s

      JOIN customers c
        ON c.id = s."customerId"

      ORDER BY
        CASE
          WHEN s.status = 'Active'
          THEN 0
          ELSE 1
        END,

        s."timeSlot" ASC,
        c."name" ASC
      `
    )

    const schedules = []

    for (const schedule of result.rows) {

      const historyResult =
        await db.query(
          `
          SELECT *
          FROM schedule_days

          WHERE "scheduleId" = $1

          ORDER BY
            "scheduleDate" DESC
          `,
          [schedule.id]
        )

      schedules.push({
        ...schedule,
        history: historyResult.rows
      })
    }

    res.json({
      success: true,
      schedules
    })

  } catch (err) {

    console.log(err)

    res.json({
      success: false,
      message: err.message
    })

  }
})


router.post('/admin/:scheduleId/delivered', async (req, res) => {

  const client = await db.connect()

  try {

    await client.query('BEGIN')

    const {
      scheduleId
    } = req.params


    const scheduleResult =
      await client.query(
        `
        SELECT *
        FROM schedules

        WHERE id = $1
          AND status = 'Active'

        FOR UPDATE
        `,
        [scheduleId]
      )


    if (
      scheduleResult.rows.length === 0
    ) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message:
          'Active schedule not found'
      })

    }


    const schedule =
      scheduleResult.rows[0]


    if (
      schedule.usedDeliveries >=
      schedule.totalDeliveries
    ) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message:
          'This schedule has already been completed'
      })

    }


    const now = new Date()

    const indiaTime =
      new Date(
        now.toLocaleString(
          'en-US',
          {
            timeZone:
              'Asia/Kolkata'
          }
        )
      )


    const year =
      indiaTime.getFullYear()

    const month =
      String(
        indiaTime.getMonth() + 1
      ).padStart(2, '0')

    const day =
      String(
        indiaTime.getDate()
      ).padStart(2, '0')

    const today =
      `${year}-${month}-${day}`


    const existingResult =
      await client.query(
        `
        SELECT *
        FROM schedule_days

        WHERE "scheduleId" = $1
          AND "scheduleDate" = $2

        FOR UPDATE
        `,
        [
          schedule.id,
          today
        ]
      )


    if (
      existingResult.rows.length > 0
    ) {

      const existing =
        existingResult.rows[0]


      if (
        existing.status ===
        'Delivered'
      ) {

        await client.query(
          'ROLLBACK'
        )

        return res.json({
          success: false,
          message:
            'Today’s delivery is already marked as delivered'
        })

      }


      if (
        existing.status ===
        'Skipped'
      ) {

        await client.query(
          'ROLLBACK'
        )

        return res.json({
          success: false,
          message:
            'Today’s delivery was skipped and cannot be marked as delivered'
        })

      }


      await client.query(
        `
        UPDATE schedule_days

        SET
          status = 'Delivered',

          "deliveredAt" =
            CURRENT_TIMESTAMP,

          "updatedAt" =
            CURRENT_TIMESTAMP

        WHERE id = $1
        `,
        [existing.id]
      )

    } else {

      await client.query(
        `
        INSERT INTO schedule_days (
          "scheduleId",
          "scheduleDate",
          "eggQuantity",
          "timeSlot",
          status,
          "deliveredAt"
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          'Delivered',
          CURRENT_TIMESTAMP
        )
        `,
        [
          schedule.id,
          today,
          schedule.eggQuantity,
          schedule.timeSlot
        ]
      )

    }


    const updatedSchedule =
      await client.query(
        `
        UPDATE schedules

        SET
          "usedDeliveries" =
            "usedDeliveries" + 1,

          "updatedAt" =
            CURRENT_TIMESTAMP

        WHERE id = $1

        RETURNING *
        `,
        [schedule.id]
      )


    await client.query('COMMIT')


    res.json({
      success: true,

      message:
        'Delivery marked as delivered',

      schedule:
        updatedSchedule.rows[0]
    })


  } catch (err) {

    await client.query(
      'ROLLBACK'
    )

    console.log(err)

    res.json({
      success: false,
      message: err.message
    })


  } finally {

    client.release()

  }

})


router.get('/:phone', async (req, res) => {
  try {

    const { phone } = req.params

    const result =
      await db.query(
        `
        SELECT
          s.*,
          c."name",
          c."phoneNumber",
          c."blockName",
          c."roomNumber"

        FROM schedules s

        JOIN customers c
          ON c.id = s."customerId"

        WHERE c."phoneNumber" = $1
        `,
        [phone]
      )

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        schedule: null
      })
    }

    const schedule =
      result.rows[0]

    const historyResult =
      await db.query(
        `
        SELECT *
        FROM schedule_days
        WHERE "scheduleId" = $1
        ORDER BY "scheduleDate" DESC
        `,
        [schedule.id]
      )

    res.json({
      success: true,
      schedule,
      history: historyResult.rows
    })

  } catch (err) {

    console.log(err)

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
      eggQuantity,
      timeSlot
    } = req.body

    const now = new Date()

    const indiaTime = new Date(
      now.toLocaleString(
        'en-US',
        {
          timeZone: 'Asia/Kolkata'
        }
      )
    )

    const hours = indiaTime.getHours()
    const minutes = indiaTime.getMinutes()

    const locked =
      hours > 17 ||
      (
        hours === 17 &&
        minutes >= 30
      )

    if (locked) {
      return res.json({
        success: false,
        message:
          'Schedule changes are closed after 5:30 PM'
      })
    }

    if (
      !Number.isInteger(
        Number(eggQuantity)
      ) ||
      Number(eggQuantity) < 2 ||
      !timeSlot
    ) {
      return res.json({
        success: false,
        message:
          'Please enter valid schedule details'
      })
    }

    const customerResult =
      await db.query(
        `
        SELECT id
        FROM customers
        WHERE "phoneNumber" = $1
        `,
        [phone]
      )

    if (
      customerResult.rows.length === 0
    ) {
      return res.json({
        success: false,
        message: 'Customer not found'
      })
    }

    const customerId =
      customerResult.rows[0].id

    const result =
      await db.query(
        `
        UPDATE schedules

        SET
          "eggQuantity" = $1,
          "timeSlot" = $2,
          "updatedAt" = CURRENT_TIMESTAMP

        WHERE "customerId" = $3
          AND status = 'Active'

        RETURNING *
        `,
        [
          Number(eggQuantity),
          timeSlot,
          customerId
        ]
      )

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message:
          'Active schedule not found'
      })
    }

    res.json({
      success: true,
      schedule: result.rows[0],
      message:
        'Schedule updated successfully'
    })

  } catch (err) {

    console.log(err)

    res.json({
      success: false,
      message: err.message
    })

  }
})


router.post('/:phone/skip', async (req, res) => {
  const client = await db.connect()

  try {

    await client.query('BEGIN')

    const { phone } = req.params

    const now = new Date()

    const indiaTime = new Date(
      now.toLocaleString(
        'en-US',
        {
          timeZone: 'Asia/Kolkata'
        }
      )
    )

    const hours = indiaTime.getHours()
    const minutes = indiaTime.getMinutes()

    const locked =
      hours > 17 ||
      (
        hours === 17 &&
        minutes >= 30
      )

    if (locked) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message:
          'Schedule changes are closed after 5:30 PM'
      })
    }


    const customerResult =
      await client.query(
        `
        SELECT id
        FROM customers
        WHERE "phoneNumber" = $1
        `,
        [phone]
      )

    if (
      customerResult.rows.length === 0
    ) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message: 'Customer not found'
      })
    }


    const customerId =
      customerResult.rows[0].id


    const scheduleResult =
      await client.query(
        `
        SELECT *
        FROM schedules
        WHERE "customerId" = $1
          AND status = 'Active'
        FOR UPDATE
        `,
        [customerId]
      )


    if (
      scheduleResult.rows.length === 0
    ) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message:
          'Active schedule not found'
      })
    }


    const schedule =
      scheduleResult.rows[0]


    if (
      schedule.usedDeliveries >=
      schedule.totalDeliveries
    ) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message:
          'Your schedule has already been completed'
      })
    }


    const year =
      indiaTime.getFullYear()

    const month =
      String(
        indiaTime.getMonth() + 1
      ).padStart(2, '0')

    const day =
      String(
        indiaTime.getDate()
      ).padStart(2, '0')

    const today =
      `${year}-${month}-${day}`


    const existingDay =
      await client.query(
        `
        SELECT id
        FROM schedule_days
        WHERE "scheduleId" = $1
          AND "scheduleDate" = $2
        `,
        [
          schedule.id,
          today
        ]
      )


    if (
      existingDay.rows.length > 0
    ) {

      await client.query('ROLLBACK')

      return res.json({
        success: false,
        message:
          'Today has already been processed'
      })
    }


    await client.query(
      `
      INSERT INTO schedule_days (
        "scheduleId",
        "scheduleDate",
        "eggQuantity",
        "timeSlot",
        status
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        'Skipped'
      )
      `,
      [
        schedule.id,
        today,
        schedule.eggQuantity,
        schedule.timeSlot
      ]
    )


    const updatedSchedule =
      await client.query(
        `
        UPDATE schedules

        SET
          "usedDeliveries" =
            "usedDeliveries" + 1,

          "updatedAt" =
            CURRENT_TIMESTAMP

        WHERE id = $1

        RETURNING *
        `,
        [schedule.id]
      )


    await client.query('COMMIT')


    res.json({
      success: true,

      message:
        'Today’s delivery has been skipped',

      schedule:
        updatedSchedule.rows[0]
    })


  } catch (err) {

    await client.query('ROLLBACK')

    console.log(err)

    res.json({
      success: false,
      message: err.message
    })

  } finally {

    client.release()

  }
})

module.exports = router