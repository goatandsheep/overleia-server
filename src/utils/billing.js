const Stripe = require('stripe');

const AWS = require('aws-sdk');

const stripe = Stripe(process.env.STRIPE_SEC_KEY);

const cognitoIdentityInstance = new AWS.CognitoIdentityServiceProvider();

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
  try {
    console.log('user', user);
    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      // customer: user,
      payment_method_types: ['card',
        // 'acss_debit',
        // 'bacs_debit',
        // 'bancontact',
        // 'sepa_debit',
      ],
      customer_email: user.attributes.email,
      success_url: `${process.env.SERVER_URL}/storage?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SERVER_URL}/storage`,
    });
    return session.url;
  } catch (err) {
    console.error('getBillingLink', err);
    throw err;
  }
};

// TODO: verify page which makes sure the session ID response goes to the correct place
const verifyBilling = async (sessionId) => {
  try {
    if (!sessionId) {
      throw new Error('No sessionId');
    }

    const session = await stripe.checkout.sessions.listLineItems(sessionId);
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('stripey', session);

    // one price per product, so assume price is product
    const storageSubscription = await stripe.subscriptions.create({
      customer: session.customer,
      items: [
        { price: 'price_1K2KMOFJXQhCrs5A22jnLYJ3' },
      ],
    });
    const beatcapsSubscription = await stripe.subscriptions.create({
      customer: session.customer,
      items: [
        { price: 'price_1K2KZVFJXQhCrs5A6yy72VCI' },
      ],
    });

    cognitoIdentityInstance.updateUserAttributes({
      UserAttributes: [{
        Name: 'custom:stripeId',
        Value: session.customer,
      }],
    }).promise();
    cognitoIdentityInstance.updateUserAttributes({
      UserAttributes: [{
        Name: 'custom:beatcapsSubId',
        Value: beatcapsSubscription.id,
      }],
    }).promise();

    cognitoIdentityInstance.updateUserAttributes({
      UserAttributes: [{
        Name: 'custom:storageSubId',
        Value: storageSubscription.id,
      }],
    }).promise();
  } catch (err) {
    console.error('verifyBilling', err);
    throw err;
  }
};

// createSession();

module.exports = {
  getUsage,
  recordUsage,
  setUsage,
  getBillingLink,
  verifyBilling,
};
