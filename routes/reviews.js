const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Barcha sharhlarni olish
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Sharhlar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Server xatosi
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('course', 'title');
    res.json(reviews);
  } catch (err) {
    console.error('GET /reviews xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

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
 *             properties:
 *               course:
 *                 type: string
 *                 description: Kurs ID (ObjectId)
 *               comment:
 *                 type: string
 *                 description: Sharh matni
 *               rating:
 *                 type: number
 *                 description: Reyting (1-5)
 *             required:
 *               - course
 *               - comment
 *               - rating
 *     responses:
 *       200:
 *         description: Sharh qo‘shildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Noto‘g‘ri ma’lumotlar
 *       500:
 *         description: Server xatosi
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { course, comment, rating } = req.body;
    if (!course || !comment || !rating) {
      return res.status(400).json({ error: 'Kurs, sharh va reyting kiritish shart' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Reyting 1 dan 5 gacha bo‘lishi kerak' });
    }
    const newReview = new Review({
      course,
      user: req.user.email,
      comment,
      rating,
    });
    await newReview.save();
    res.json({ message: 'Sharh qo‘shildi!', review: newReview });
  } catch (err) {
    console.error('POST /reviews xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Sharhni yangilash
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Sharh yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       403:
 *         description: Ruxsat yo‘q
 *       404:
 *         description: Sharh topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Sharh topilmadi' });
    }
    if (review.user !== req.user.email) {
      return res.status(403).json({ error: 'Faqat muallif o‘zgartirishi mumkin' });
    }
    review.comment = comment || review.comment;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Reyting 1 dan 5 gacha bo‘lishi kerak' });
      }
      review.rating = rating;
    }
    await review.save();
    res.json({ message: 'Sharh yangilandi!', review });
  } catch (err) {
    console.error('PUT /reviews xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Sharhni o‘chirish
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
 *       403:
 *         description: Ruxsat yo‘q
 *       404:
 *         description: Sharh topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Sharh topilmadi' });
    }
    if (review.user !== req.user.email) {
      return res.status(403).json({ error: 'Faqat muallif o‘chira oladi' });
    }
    await Review.deleteOne({ _id: req.params.id });
    res.json({ message: 'Sharh o‘chirildi!' });
  } catch (err) {
    console.error('DELETE /reviews xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;