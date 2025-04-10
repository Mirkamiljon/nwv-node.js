const mongoose = require('mongoose');
const Advantage = require('./models/Advantage');
const StudentReview = require('./models/StudentReview');

mongoose.connect('mongodb+srv://miko:miko2007@cluster0.tqdfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const seedData = async () => {
  try {
    await Advantage.deleteMany();
    await StudentReview.deleteMany();

    await Advantage.insertMany([
      { title: 'Tezlik va samaradorlik', description: 'Node.js yordamida platformamiz yuqori tezlikda ishlaydi.' },
      { title: 'Real vaqtda yangilanish', description: 'Ma’lumotlar real vaqt rejimida yangilanadi.' },
      { title: 'Kengaytirilishi oson', description: 'Yangi funksiyalarni osongina qo‘shish imkoniyati.' },
    ]);

    await StudentReview.insertMany([
      { name: 'Ali', course: 'Web Development', text: 'Sayt juda tez ishlaydi, sharhlarim darhol ko‘rinadi!' },
      { name: 'Madina', course: 'Mobile Development', text: 'Yangi funksiyalar muammosiz ishlaydi.' },
      { name: 'Jasur', course: 'Web Development', text: 'Ko‘p odam foydalansa ham kechikish yo‘q.' },
    ]);

    console.log('Test ma‘lumotlar qo‘shildi');
  } catch (err) {
    console.error('Xato:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedData();