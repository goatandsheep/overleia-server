const Stripe = require('stripe');

const AWS = require('aws-sdk');

const stripe = Stripe(process.env.STRIPE_SEC_KEY);

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

// const createSession = () => {};

const getUsage = async (user, type) => {
  let subscriptionId;
  if (type === 'BeatCaps') {
    subscriptionId = user['custom:beatcapsSubId'];
  } else {
    subscriptionId = user['custom:storageSubId'];
  }

  const usageRecordSummaries = await stripe.subscriptionItems.listUsageRecordSummaries(
    subscriptionId,
    { limit: 1 },
  );
  return usageRecordSummaries.data[0].total_usage;
};

// beatcaps / metered stuff
const recordUsage = async (user, usage, type) => {
  let subscriptionId;
  if (type === 'BeatCaps') {
    subscriptionId = user['custom:beatcapsSubId'];
  } else {
    subscriptionId = user['custom:storageSubId'];
  }

  const timestamp = new Date().getTime();
  return stripe.subscriptionItems.createUsageRecord(
    subscriptionId,
    { quantity: usage, timestamp, action: 'increment' },
  );
};

// storage
const setUsage = async (user, usage, type) => {
  let subscriptionId;
  if (type === 'BeatCaps') {
    subscriptionId = user['custom:beatcapsSubId'];
  } else {
    subscriptionId = user['custom:storageSubId'];
  }
  const timestamp = new Date().getTime();
  return stripe.subscriptionItems.createUsageRecord(
    subscriptionId,
    { quantity: usage, timestamp, action: 'set' },
  );
};

// first time Stripe user creation and save billing details
const getBillingLink = async (user) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'setup',
    customer: user,
    success_url: `${process.env.SERVER_URL}/success.html`,
    cancel_url: `${process.env.SERVER_URL}/cancel.html`,
  });

  // one price per product, so assume price is product
  const storageSubscription = await stripe.subscriptions.create({
    customer: user,
    items: [
      { price: 'price_1K2KMOFJXQhCrs5A22jnLYJ3' },
    ],
  });
  const beatcapsSubscription = await stripe.subscriptions.create({
    customer: user,
    items: [
      { price: 'price_1K2KZVFJXQhCrs5A6yy72VCI' },
    ],
  });

  cognitoidentityserviceprovider.updateUserAttributes({
    UserAttributes: [{
      Name: 'custom:beatcapsSubId',
      Value: beatcapsSubscription.id,
    }],
  }).promise();

  cognitoidentityserviceprovider.updateUserAttributes({
    UserAttributes: [{
      Name: 'custom:storageSubId',
      Value: storageSubscription.id,
    }],
  }).promise();
  return session.url;
};

// createSession();

module.exports = {
  getUsage,
  recordUsage,
  setUsage,
  getBillingLink,
};
