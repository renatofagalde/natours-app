const fs = require('fs');

const mongoose = require(`mongoose`);
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(`<PASSWORD>`, process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // eslint-disable-next-line no-console
  .then(() => console.log('DB connection successful!'));

//READ JSON FILE
const toursFile = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const usersFile = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviewsFile = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(toursFile);
    await User.create(usersFile, { validateBeforeSave: false });
    await Review.create(reviewsFile);
    console.warn('Data successfully loaded');
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

//DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.warn('Data successfully deleted');
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

console.log(process.argv);

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
