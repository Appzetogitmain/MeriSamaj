const mongoose = require('mongoose');
const config = require('./backend/src/config/config');
const Community = require('./backend/src/models/Community');
const Donation = require('./backend/src/models/Donation');
const User = require('./backend/src/models/User');

async function check() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const communities = await Community.find({}).lean();
    console.log('--- COMMUNITIES ---');
    console.log(communities.map(c => ({ id: c._id, name: c.name, accountDetails: c.accountDetails })));

    const users = await User.find({ role: 'head' }).lean();
    console.log('--- HEAD USERS ---');
    console.log(users.map(u => ({ id: u._id, name: u.name, email: u.email, communityId: u.communityId, community: u.community })));

    const donations = await Donation.find({}).lean();
    console.log('--- DONATIONS ---');
    console.log(donations.map(d => ({ id: d._id, title: d.title, communityId: d.communityId })));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
