const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer sozlamalari
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // uploads papkasini avtomatik yaratish
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat JPEG, PNG yoki GIF rasmlar ruxsat etiladi'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @swagger
 * /api/upload:
 *   get:
 *     summary: Yuklangan fayllar ro‘yxatini olish
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Fayllar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["/uploads/123456789-test.jpg"]
 *       500:
 *         description: Server xatosi
 */
router.get('/', (req, res) => {
  try {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Agar papka yo‘q bo‘lsa, yaratish
      console.log('uploads papkasi yaratildi');
    }
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.log('Fayllarni o‘qishda xato:', err); // Xato tafsilotlari
        return res.status(500).json({ error: 'Fayllarni o‘qishda xato', details: err.message });
      }
      const filePaths = files.map(file => `/uploads/${file}`);
      res.json({ files: filePaths });
    });
  } catch (err) {
    console.log('Server xatosi:', err);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Yangi rasm yuklash
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Rasm yuklandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filePath:
 *                   type: string
 *                   example: /uploads/123456789-test.jpg
 *       400:
 *         description: Rasm yuklanmadi
 *       500:
 *         description: Server xatosi
 */
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Rasm yuklanmadi' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
  } catch (err) {
    console.log('POST xatosi:', err);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

/**
 * @swagger
 * /api/upload/{filename}:
 *   delete:
 *     summary: Faylni o‘chirish
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: O‘chiriladigan fayl nomi
 *     responses:
 *       200:
 *         description: Fayl muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Fayl topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete('/:filename', (req, res) => {
  try {
    const filePath = path.join('uploads', req.params.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ error: 'Fayl topilmadi' });
        }
        console.log('DELETE xatosi:', err);
        return res.status(500).json({ error: 'Faylni o‘chirishda xato', details: err.message });
      }
      res.json({ message: 'Fayl o‘chirildi' });
    });
  } catch (err) {
    console.log('Server xatosi:', err);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

/**
 * @swagger
 * /api/upload/{filename}:
 *   put:
 *     summary: Mavjud faylni yangilash
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Yangilanadigan fayl nomi
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Fayl muvaffaqiyatli yangilandi
 *       400:
 *         description: Yangi rasm yuklanmadi
 *       404:
 *         description: Fayl topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put('/:filename', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Yangi rasm yuklanmadi' });
    }
    const oldFilePath = path.join('uploads', req.params.filename);
    const newFilePath = `/uploads/${req.file.filename}`;
    fs.unlink(oldFilePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return res.status(404).json({ error: 'Eski fayl topilmadi' });
        }
        console.log('PUT xatosi:', err);
        return res.status(500).json({ error: 'Eski faylni o‘chirishda xato', details: err.message });
      }
      res.json({ filePath: newFilePath });
    });
  } catch (err) {
    console.log('Server xatosi:', err);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

module.exports = router;