const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { adminMiddleware } = require('../middleware/auth');
const logger = require('../logger');

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Barcha o‘qituvchilar ro‘yxatini olish (admin uchun)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Token topilmadi yoki noto‘g‘ri
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find().select('name image bio');
    logger.info(`O‘qituvchilar ro‘yxati olindi, admin: ${req.user.email}`);
    res.json(teachers);
  } catch (err) {
    logger.error(`GET /api/teachers xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /api/teachers:
 *   post:
 *     summary: Yangi o‘qituvchi qo‘shish (admin uchun, surat kiritish bilan)
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
 *       401:
 *         description: Token topilmadi yoki noto‘g‘ri
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, image, bio } = req.body;
    if (!name || !bio) {
      logger.warn(`O‘qituvchi qo‘shish urinishi: Ism yoki bio kiritilmadi, admin: ${req.user.email}`);
      return res.status(400).json({ error: 'Ism va bio kiritish shart' });
    }
    const newTeacher = new Teacher({
      name,
      image: image || 'default-image.jpg',
      bio,
    });
    await newTeacher.save();
    logger.info(`Yangi o‘qituvchi qo‘shildi: ${name}, admin: ${req.user.email}`);
    res.status(201).json({ message: 'O‘qituvchi qo‘shildi!', teacher: newTeacher });
  } catch (err) {
    logger.error(`POST /api/teachers xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /api/teachers/{id}:
 *   put:
 *     summary: O‘qituvchi ma’lumotlarini yangilash (admin uchun, surat yangilash bilan)
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
 *       401:
 *         description: Token topilmadi yoki noto‘g‘ri
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { name, image, bio } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      logger.warn(`O‘qituvchi yangilash urinishi: ID ${req.params.id} topilmadi, admin: ${req.user.email}`);
      return res.status(404).json({ error: 'O‘qituvchi topilmadi' });
    }
    teacher.name = name || teacher.name;
    teacher.image = image || teacher.image;
    teacher.bio = bio || teacher.bio;
    await teacher.save();
    logger.info(`O‘qituvchi yangilandi: ${teacher.name}, admin: ${req.user.email}`);
    res.json({ message: 'O‘qituvchi yangilandi!', teacher });
  } catch (err) {
    logger.error(`PUT /api/teachers/${req.params.id} xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * @swagger
 * /api/teachers/{id}:
 *   delete:
 *     summary: O‘qituvchini o‘chirish (admin uchun)
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
 *       401:
 *         description: Token topilmadi yoki noto‘g‘ri
 *       403:
 *         description: Faqat adminlar uchun
 *       500:
 *         description: Server xatosi
 */
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      logger.warn(`O‘qituvchi o‘chirish urinishi: ID ${req.params.id} topilmadi, admin: ${req.user.email}`);
      return res.status(404).json({ error: 'O‘qituvchi topilmadi' });
    }
    await Teacher.deleteOne({ _id: req.params.id });
    logger.info(`O‘qituvchi o‘chirildi: ${teacher.name}, admin: ${req.user.email}`);
    res.json({ message: 'O‘qituvchi o‘chirildi!' });
  } catch (err) {
    logger.error(`DELETE /api/teachers/${req.params.id} xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;