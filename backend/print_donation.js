require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./src/config/config');
const Donation = require('./src/models/Donation');

async function check() {
  try {
    await mongoose.connect(config.mongoUri || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const donation = await Donation.findById('6a69d212f15d5fa301ead88c').lean();
    console.log('Donation directly from DB:', JSON.stringify(donation, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
