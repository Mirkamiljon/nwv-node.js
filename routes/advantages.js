const express = require('express');
const router = express.Router();
const Advantage = require('../models/Advantage');

// Admin autentifikatsiyasi middleware (masalan, JWT token bilan)
const isAdmin = (req, res, next) => {
  // Bu yerda haqiqiy autentifikatsiya logikasi bo‘lishi kerak
  const isAuthenticated = true; // Masalan, token tekshiruvi
  if (!isAuthenticated) return res.status(403).json({ message: 'Admin ruxsati talab qilinadi' });
  next();
};

/**
 * @swagger
 * /api/advantages:
 *   get:
 *     summary: Barcha afzalliklarni olish
 *     tags: [Advantages]
 *     responses:
 *       200:
 *         description: Afzalliklar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/', async (req, res) => {
  try {
    const advantages = await Advantage.find();
    res.json(advantages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/advantages:
 *   post:
 *     summary: Yangi afzallik qo‘shish (Admin)
 *     tags: [Advantages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Afzallik qo‘shildi
 *       400:
 *         description: Noto‘g‘ri ma’lumotlar
 */
router.post('/', isAdmin, async (req, res) => {
  const advantage = new Advantage({
    title: req.body.title,
    description: req.body.description,
  });
  try {
    const newAdvantage = await advantage.save();
    res.status(201).json(newAdvantage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/advantages/{id}:
 *   put:
 *     summary: Afzallikni yangilash (Admin)
 *     tags: [Advantages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Afzallik yangilandi
 *       404:
 *         description: Afzallik topilmadi
 */
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const advantage = await Advantage.findById(req.params.id);
    if (!advantage) return res.status(404).json({ message: 'Afzallik topilmadi' });
    advantage.title = req.body.title || advantage.title;
    advantage.description = req.body.description || advantage.description;
    const updatedAdvantage = await advantage.save();
    res.json(updatedAdvantage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/advantages/{id}:
 *   delete:
 *     summary: Afzallikni o‘chirish (Admin)
 *     tags: [Advantages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Afzallik o‘chirildi
 *       404:
 *         description: Afzallik topilmadi
 */
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const advantage = await Advantage.findById(req.params.id);
    if (!advantage) return res.status(404).json({ message: 'Afzallik topilmadi' });
    await advantage.remove();
    res.json({ message: 'Afzallik o‘chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;