require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./src/config/config');
const Donation = require('./src/models/Donation');
const User = require('./src/models/User');

async function update() {
  try {
    await mongoose.connect(config.mongoUri || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const targetCommId = new mongoose.Types.ObjectId('6a5b5f4713aa70f2009535bf');

    console.log('Updating member 9999999999 to belong to Namdev Samaj...');
    await User.updateOne(
      { phone: '9999999999' },
      { $set: { communityId: targetCommId, community: 'Namdev Samaj' } }
    );

    console.log('Updating donation 6a69d212f15d5fa301ead88c to belong to Namdev Samaj...');
    await Donation.updateOne(
      { _id: new mongoose.Types.ObjectId('6a69d212f15d5fa301ead88c') },
      { $set: { communityId: targetCommId } }
    );

    console.log('Database updated successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

update();
