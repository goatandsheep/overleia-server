const Stripe = require('stripe');

const AWS = require('aws-sdk');

const stripe = Stripe(process.env.STRIPE_SEC_KEY);

const cognitoIdentityInstance = new AWS.CognitoIdentityServiceProvider();

// const createSession = () => {};

/**
 * Stripe customer ID
 */
const getCustomer = async (user) => {
  // if cognito has customer ID, return that
  let customerId = user['custom:stripeId'];

  // if cognito doesn't have customer ID create customer ID
  if (!customerId) {
    // create customer through Stripe API
    const customer = await stripe.customers.create({
      email: user.attributes.email,
      description: user.username,
    });

    customerId = customer.id;
    cognitoIdentityInstance.updateUserAttributes({
      UserAttributes: [{
        Name: 'custom:stripeId',
        Value: customerId,
      }],
      AccessToken: user.AccessToken,
    }).promise();
  }
  return customerId;
};

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
    const customerId = await getCustomer(user);
    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      payment_method_types: ['card',
        // 'acss_debit',
        // 'bacs_debit',
        // 'bancontact',
        // 'sepa_debit',
      ],
      // payment_intent_data: {
      //   setup_future_usage: 'off_session',
      // },
      customer: customerId,
      // customer_email: user.attributes.email,
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
const verifyBilling = async (user, sessionId) => {
  try {
    if (!sessionId) {
      throw new Error('No sessionId');
    }

    // const session = await stripe.checkout.sessions.listLineItems(sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // one price per product, so assume price is product
    // const customerId = getCustomer(user);
    const storageSubscription = await stripe.subscriptions.create({
      customer: session.customer,
      items: [
        { price: process.env.STORAGE_PRICE_ID },
      ],
    });
    const beatcapsSubscription = await stripe.subscriptions.create({
      customer: session.customer,
      items: [
        { price: process.env.BEATCAPS_PRICE_ID },
      ],
    });

    // cognitoIdentityInstance.updateUserAttributes({
    //   UserAttributes: [{
    //     Name: 'custom:stripeId',
    //     Value: session.customer,
    //   }],
    // AccessToken: user.AccessToken,
    // }).promise();
    cognitoIdentityInstance.updateUserAttributes({
      UserAttributes: [{
        Name: 'custom:beatcapsSubId',
        Value: beatcapsSubscription.id,
      }],
      AccessToken: user.AccessToken,
    }).promise();

    cognitoIdentityInstance.updateUserAttributes({
      UserAttributes: [{
        Name: 'custom:storageSubId',
        Value: storageSubscription.id,
      }],
      AccessToken: user.AccessToken,
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
