const express = require('express');
const router = express.Router();

// Bu yerda oddiy ma’lumotlar bazasi o‘rniga vaqtincha massiv ishlatamiz
let courses = [
  { id: 1, title: 'Matematika', teacherId: 1 },
  { id: 2, title: 'Fizika', teacherId: 2 },
];

// O‘qituvchilar ma’lumotlari (masalan)
const teachers = [
  { id: 1, name: 'Ali', bio: 'Matematika mutaxassisi' },
  { id: 2, name: 'Vali', bio: 'Fizika professori' },
];

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Barcha kurslarni olish
 *     description: Kurslar ro‘yxatini va o‘qituvchi ma’lumotlari bilan qaytaradi
 *     responses:
 *       200:
 *         description: Kurslar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   teacher:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       bio:
 *                         type: string
 */
router.get('/', (req, res) => {
  // Har bir kursga o‘qituvchi ma’lumotlarini qo‘shish
  const coursesWithTeachers = courses.map(course => {
    const teacher = teachers.find(t => t.id === course.teacherId);
    return {
      ...course,
      teacher: teacher ? { name: teacher.name, bio: teacher.bio } : null,
    };
  });
  res.json(coursesWithTeachers);
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Yangi kurs qo‘shish
 *     description: Yangi kurs yaratadi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               teacherId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Kurs muvaffaqiyatli qo‘shildi
 */
router.post('/', (req, res) => {
  const { title, teacherId } = req.body;
  const newCourse = {
    id: courses.length + 1,
    title,
    teacherId,
  };
  courses.push(newCourse);
  res.status(201).json(newCourse);
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Kursni yangilash
 *     description: Mavjud kursni yangilaydi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               teacherId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Kurs yangilandi
 *       404:
 *         description: Kurs topilmadi
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, teacherId } = req.body;
  const course = courses.find(c => c.id === parseInt(id));
  if (!course) return res.status(404).json({ message: 'Kurs topilmadi' });

  course.title = title || course.title;
  course.teacherId = teacherId || course.teacherId;
  res.json(course);
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Kursni o‘chirish
 *     description: Mavjud kursni o‘chiradi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kurs o‘chirildi
 *       404:
 *         description: Kurs topilmadi
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const courseIndex = courses.findIndex(c => c.id === parseInt(id));
  if (courseIndex === -1) return res.status(404).json({ message: 'Kurs topilmadi' });

  courses.splice(courseIndex, 1);
  res.json({ message: 'Kurs o‘chirildi' });
});

module.exports = router;