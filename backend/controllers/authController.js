const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ChatSession = require('../models/ChatSession');
const { signToken } = require('../utils/jwt');

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing fields', message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'User exists', message: 'A user with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });
    const token = signToken({ userId: user._id });

    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields', message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Email or password is incorrect.' });
    }

    const token = signToken({ userId: user._id });
    return res.status(200).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
}

async function getSessions(req, res, next) {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('name updatedAt');

    return res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login, getProfile, getSessions };
