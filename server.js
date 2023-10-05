const mongoose = require(`mongoose`);
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.error(
    `\n\n\t🔥🔥🔥🔥🔥 UNCAUGHT EXCEPTION\t🔥🔥🔥🔥🔥 \n Shutting down...`,
    err.name,
    err.message,
    '\n\n',
    err
  );

  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require(`./app`);

const DB = process.env.DATABASE.replace(`<PASSWORD>`, process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  // eslint-disable-next-line no-console
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.error(
    `\n\n\t🔥🔥🔥🔥🔥 UNHANDLE REJECTION\t🔥🔥🔥🔥🔥 \n Shutting down...`,
    err.name,
    err.message,
    '\n\n'
  );
  server.close(() => {
    process.exit(1);
  });
});
