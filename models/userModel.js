const mongoose = require(`mongoose`);
const crypto = require(`crypto`);
const validator = require(`validator`);
const bcrypt = require(`bcryptjs`);

// name,email,photo,password,passwordconfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String, // eslint-disable-next-line no-bitwise
    required: [true, 'A user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 4,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm you password'],
    validate: {
      //this only works on SAVE and CREATE
      validator: function (el) {
        return el === this.password; //abc === abc
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//QUERY MIDDLEWARE
//regex /^find/ because use it with find or findOne or findById...
// userSchema.pre('find', function (next) {
userSchema.pre(/^find/, function (next) {
  this.start = Date.now();
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  //hash the passoword with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  //remove property
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 3000; // in the past 3s
  next();
});

userSchema.post(/^find/, function (documents, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);

    //100 < 200, password changed! Return true
    return JWTTimestamp < changedTimestamp;
  }

  return false; // NOT CHANGE, is OK!
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.warn(`createPasswordResetToken => user`, this.name);
  // console.warn(`createPasswordResetToken => user ${this.nam qe} => ${this.passwordResetExpires}`);
  return resetToken;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
