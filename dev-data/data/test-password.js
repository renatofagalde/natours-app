const fs = require('fs');

const mongoose = require(`mongoose`);
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const bcrypt = require(`bcryptjs`);

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

const testUserPassword = async () => {
  const userTest = await User.findById('5c8a1d5b0190b214360dc057').select('+password');

  console.log(userTest);
  const result = await bcrypt.compare('test1234', userTest.password);
  console.log(result);
  process.exit(1);
};

testUserPassword();
