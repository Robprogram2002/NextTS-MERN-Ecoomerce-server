import firebaseAdmin from 'firebase-admin';

const serviceAccount = require('./config/auth0testproject-d2e65-firebase-adminsdk-4er0q-1faace47ff.json');

// serviceAccount;
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  // databaseURL: 'https://ecommerce-225c8.firebaseio.com',
});

export default firebaseAdmin;
