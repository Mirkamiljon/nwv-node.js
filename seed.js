const mongoose = require('mongoose');
const Course = require('./models/Course');
const Teacher = require('./models/Teacher');

mongoose.connect('mongodb+srv://miko:miko2007@cluster0.tqdfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const seedData = async () => {
  try {
    await Course.deleteMany();
    await Teacher.deleteMany();

    const courses = await Course.insertMany([
      { title: 'Web Development', description: 'Veb-saytlar yaratishni o‘rganing', image: 'web-dev.jpg' },
      { title: 'Mobile Development', description: 'Mobil ilovalar yaratishni o‘rganing', image: 'mobile-dev.jpg' },
    ]);

    const teachers = await Teacher.insertMany([
      {
        name: 'John Doe',
        bio: 'Web development bo‘yicha 10 yillik tajriba',
        image: 'john-doe.jpg',
        courses: [courses[0]._id],
      },
      {
        name: 'Jane Smith',
        bio: 'Mobil ilovalar bo‘yicha mutaxassis',
        image: 'jane-smith.jpg',
        courses: [courses[1]._id],
      },
    ]);

    console.log('Test ma‘lumotlar qo‘shildi');
    console.log('Qo‘shilgan o‘qituvchilar:', teachers);
  } catch (err) {
    console.error('Xato:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedData();