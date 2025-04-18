const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { adminMiddleware } = require('../middleware/auth');
const logger = require('../logger');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Yangi sharh qo‘shish
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course
 *               - comment
 *               - rating
 *             properties:
 *               course:
 *                 type: string
 *                 description: Kurs ID
 *               comment:
 *                 type: string
 *                 description: Sharh matni
 *               rating:
 *                 type: number
 *                 description: Reyting (1-5)
 *     responses:
 *       201:
 *         description: Sharh muvaffaqiyatli qo‘shildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Maydonlar to‘liq emas yoki noto‘g‘ri
 *       401:
 *         description: Token topilmadi yoki noto‘g‘ri
 *       500:
 *         description: Server xatosi
 */
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { course, comment, rating } = req.body;
    if (!course || !comment || !rating) {
      logger.warn(`Sharh qo‘shish urinishi: Maydonlar to‘liq emas, admin: ${req.user.email}`);
      return res.status(400).json({ error: 'Kurs ID, sharh va reytingni kiriting' });
    }

    if (rating < 1 || rating > 5) {
      logger.warn(`Sharh qo‘shish urinishi: Noto‘g‘ri reyting (${rating}), admin: ${req.user.email}`);
      return res.status(400).json({ error: 'Reyting 1 dan 5 gacha bo‘lishi kerak' });
    }

    const newReview = new Review({
      course,
      user: req.user.userId,
      comment,
      rating,
    });

    await newReview.save();
    logger.info(`Yangi sharh qo‘shildi: Kurs ID ${course}, admin: ${req.user.email}`);
    res.status(201).json({ message: 'Sharh muvaffaqiyatli qo‘shildi', review: newReview });
  } catch (err) {
    logger.error(`POST /api/reviews xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Barcha sharhlarni olish (admin uchun)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sharhlar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token topilmadi yoki noto‘g‘ri
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find().populate('course', 'title').populate('user', 'email name');
    logger.info(`Sharhlar ro‘yxati olindi, admin: ${req.user.email}`);
    res.json(reviews);
  } catch (err) {
    logger.error(`GET /api/reviews xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Sharhni o‘chirish (faqat admin uchun)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sharh ID
 *     responses:
 *       200:
 *         description: Sharh o‘chirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sharh o‘chirildi!
 *       404:
 *         description: Sharh topilmadi
 *       401:
 *         description: Token topilmadi yoki noto‘g‘ri
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      logger.warn(`Sharh o‘chirish urinishi: ID ${req.params.id} topilmadi, admin: ${req.user.email}`);
      return res.status(404).json({ error: 'Sharh topilmadi' });
    }
    await Review.deleteOne({ _id: req.params.id });
    logger.info(`Sharh o‘chirildi: ID ${req.params.id}, admin: ${req.user.email}`);
    res.json({ message: 'Sharh o‘chirildi!' });
  } catch (err) {
    logger.error(`DELETE /api/reviews/${req.params.id} xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;