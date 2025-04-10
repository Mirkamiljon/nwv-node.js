const express = require('express')
const router = express.Router()
const StudentReview = require('../models/StudentReview')

/**
 * @swagger
 * /api/student-reviews:
 *   get:
 *     summary: Talabalar sharhlarini olish
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Talabalar sharhlari ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentReview'
 *       500:
 *         description: Server xatosi
 */
router.get('/student-reviews', async (req, res) => {
  try {
    const reviews = await StudentReview.find()
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router;