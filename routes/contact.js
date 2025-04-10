const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Barcha kurslarni olish
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Muayyan kurs haqida ma'lumot
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Kurs topilmadi' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Yangi kurs qo‘shish (admin uchun)
router.post('/courses', async (req, res) => {
  try {
    const { title, description, image } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Barcha maydonlarni to‘ldiring' });
    }
    const newCourse = new Course({ title, description, image });
    await newCourse.save();
    res.json({ message: 'Kurs qo‘shildi!', course: newCourse });
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

module.exports = router;