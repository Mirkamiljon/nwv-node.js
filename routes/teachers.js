const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Barcha o‘qituvchilar ro‘yxatini olish
 *     tags: [Teachers]
 *     responses:
 *       200:
 *         description: O‘qituvchilar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *                   bio:
 *                     type: string
 *       500:
 *         description: Server xatosi
 */
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().select('name image bio'); // Faqat kerakli field’larni qaytarish
    res.json(teachers);
  } catch (err) {
    console.error('GET /teachers xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Muayyan o‘qituvchini olish
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O‘qituvchi ID’si
 *     responses:
 *       200:
 *         description: O‘qituvchi ma’lumotlari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 image:
 *                   type: string
 *                 bio:
 *                   type: string
 *       404:
 *         description: O‘qituvchi topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('name image bio');
    if (!teacher) {
      return res.status(404).json({ error: 'O‘qituvchi topilmadi' });
    }
    res.json(teacher);
  } catch (err) {
    console.error('GET /teachers/:id xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Yangi o‘qituvchi qo‘shish (faqat adminlar uchun)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - bio
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 example: Web development bo‘yicha mutaxassis
 *               image:
 *                 type: string
 *                 example: /uploads/john-doe.jpg
 *     responses:
 *       201:
 *         description: O‘qituvchi qo‘shildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: O‘qituvchi qo‘shildi!
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     image:
 *                       type: string
 *                     bio:
 *                       type: string
 *       400:
 *         description: Ism yoki bio kiritilmadi
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, image, bio } = req.body;
    if (!name || !bio) {
      return res.status(400).json({ error: 'Ism va bio kiritish shart' });
    }
    const newTeacher = new Teacher({
      name,
      image: image || 'default-image.jpg', // Agar rasm kiritilmasa, standart qiymat
      bio,
    });
    await newTeacher.save();
    res.status(201).json({ message: 'O‘qituvchi qo‘shildi!', teacher: newTeacher });
  } catch (err) {
    console.error('POST /teachers xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: O‘qituvchi ma’lumotlarini yangilash (faqat adminlar uchun)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O‘qituvchi ID’si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe Updated
 *               bio:
 *                 type: string
 *                 example: Yangilangan bio
 *               image:
 *                 type: string
 *                 example: /uploads/john-doe-updated.jpg
 *     responses:
 *       200:
 *         description: O‘qituvchi yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: O‘qituvchi yangilandi!
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     image:
 *                       type: string
 *                     bio:
 *                       type: string
 *       404:
 *         description: O‘qituvchi topilmadi
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, image, bio } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'O‘qituvchi topilmadi' });
    }
    teacher.name = name || teacher.name;
    teacher.image = image || teacher.image;
    teacher.bio = bio || teacher.bio;
    await teacher.save();
    res.json({ message: 'O‘qituvchi yangilandi!', teacher });
  } catch (err) {
    console.error('PUT /teachers/:id xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: O‘qituvchini o‘chirish (faqat adminlar uchun)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O‘qituvchi ID’si
 *     responses:
 *       200:
 *         description: O‘qituvchi o‘chirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: O‘qituvchi o‘chirildi!
 *       404:
 *         description: O‘qituvchi topilmadi
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'O‘qituvchi topilmadi' });
    }
    await Teacher.deleteOne({ _id: req.params.id });
    res.json({ message: 'O‘qituvchi o‘chirildi!' });
  } catch (err) {
    console.error('DELETE /teachers/:id xatosi:', err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;