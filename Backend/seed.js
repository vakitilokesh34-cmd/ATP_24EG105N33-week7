import { connect, disconnect } from 'mongoose';
import { ArticleModel } from './models/articleModel.js';
import { userModel } from './models/userModel.js';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const seed = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log('Connected to DB for seeding');

    // Clear existing data
    await ArticleModel.deleteMany({});
    await userModel.deleteMany({});

    // Create an author
    const hashedPassword = await hash('password123', 12);
    const author = new userModel({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'AUTHOR',
      profileImageUrl: 'https://via.placeholder.com/150',
      isUserActive: true
    });
    await author.save();
    console.log('Author created');

    // Create some articles
    const articles = [
      {
        title: 'Introduction to React',
        content: 'React is a JavaScript library for building user interfaces...',
        category: 'programming',
        author: author._id,
        isArticleActive: true
      },
      {
        title: 'Understanding Node.js',
        content: 'Node.js is a runtime environment that allows you to run JavaScript on the server...',
        category: 'backend',
        author: author._id,
        isArticleActive: true
      },
      {
        title: 'Mastering MongoDB',
        content: 'MongoDB is a NoSQL database that stores data in flexible, JSON-like documents...',
        category: 'database',
        author: author._id,
        isArticleActive: true
      }
    ];

    await ArticleModel.insertMany(articles);
    console.log('Articles seeded');

    await disconnect();
    console.log('Disconnected from DB');
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seed();
