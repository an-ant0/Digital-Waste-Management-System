const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    middleName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },

    homeNumber: {
      type: String,
      required: [true, 'Home number is required'],
    },
    wardNumber: {
      type: String,
      required: [true, 'Ward number is required'],
    },
    localityName: {
      type: String,
      required: [true, 'Locality name is required'],
    },

    profilePic: {
      type: String,
      default: '',
    },
    idType: {
      type: String,
      required: [true, 'ID type is required'],
    },
    idNumber: {
      type: String,
      required: [true, 'ID number is required'],
      unique: true,
    },
    idPhoto: {
      type: String,
      required: [true, 'ID photo is required'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
