const Stripe = require('stripe');

const AWS = require('aws-sdk');

const stripe = Stripe(process.env.STRIPE_SEC_KEY);

const cognitoIdentityInstance = new AWS.CognitoIdentityServiceProvider();

const customerAttrName = process.env.STRIPE_DEV_MODE !== 'true' ? 'custom:stripeId' : 'custom:stripeIdTest';
const storageAttrName = process.env.STRIPE_DEV_MODE !== 'true' ? 'custom:storageSubId' : 'custom:storageSubIdTest';
const beatcapsAttrName = process.env.STRIPE_DEV_MODE !== 'true' ? 'custom:beatcapsSubId' : 'custom:beatcapsSubIdTest';
const storageUsageAttr = process.env.STRIPE_DEV_MODE !== 'true' ? 'custom:storageUsage' : 'custom:storageUsageTest';
const beatcapsUsageAttr = process.env.STRIPE_DEV_MODE !== 'true' ? 'custom:beatcapsUsage' : 'custom:beatcapsUsageTest';
// const createSession = () => {};

/**
 * Stripe customer ID
 */
const getCustomer = async (user) => {
  // if cognito has customer ID, return that
  let customerId = user[customerAttrName];

  // if cognito doesn't have customer ID create customer ID
  if (!customerId) {
    console.log('no customer id');
    // create customer through Stripe API
    const customer = await stripe.customers.create({
      email: user.attributes.email,
      description: user.username,
    });

    customerId = customer.id;
    cognitoIdentityInstance.adminUpdateUserAttributes({
      UserAttributes: [{
        Name: customerAttrName,
        Value: customerId,
      }],
      Username: user.username,
      UserPoolId: process.env.COGNITO_POOL_ID,
    }).promise();
  }
  return customerId;
};

/**
 * Gets service usage
 */
const getUsage = async (user) => {
  // TODO: if Beatcaps is enabled
  let verified = true;
  // const beatcapsSubscriptionId = user[beatcapsAttrName];
  const storageSubscriptionId = user[storageAttrName];
  if (!storageSubscriptionId) {
    // throw new Error('No keys');
    verified = false;
  }

  // let beatcapsUsage;
  // if (beatcapsSubscriptionId) {
  //   beatcapsUsage = await stripe.subscriptionItems.listUsageRecordSummaries(
  //     beatcapsSubscriptionId,
  //     { limit: 1 },
  //   );
  // }
  // beatcapsUsage.data[0].total_usage

  // const usageRecordSummaries = await stripe.subscriptionItems.listUsageRecordSummaries(
  //   storageSubscriptionId,
  //   { limit: 1 },
  // );
  // usageRecordSummaries.data[0].total_usage

  return {
    beatcapsUsage: user[beatcapsUsageAttr],
    storageUsage: user[storageUsageAttr],
    verified,
  };
};

// beatcaps / metered stuff
const recordUsage = async (user, usage) => {
  const subscriptionId = user[beatcapsAttrName];

  let currentUsage = user[beatcapsUsageAttr];
  currentUsage += usage;

  await cognitoIdentityInstance.adminUpdateUserAttributes({
    UserAttributes: [{
      Name: beatcapsUsageAttr,
      Value: currentUsage,
    }],
    Username: user.username,
    UserPoolId: process.env.COGNITO_POOL_ID,
  }).promise();

  if (!subscriptionId) {
    return currentUsage;
  }

  const timestamp = new Date().getTime();
  return stripe.subscriptionItems.createUsageRecord(
    subscriptionId,
    { quantity: usage, timestamp, action: 'increment' },
  );
};

// storage
const setUsage = async (user, usage) => {
  const subscriptionId = user[storageAttrName];

  await cognitoIdentityInstance.adminUpdateUserAttributes({
    UserAttributes: [{
      Name: storageUsageAttr,
      Value: usage,
    }],
    Username: user.username,
    UserPoolId: process.env.COGNITO_POOL_ID,
  }).promise();

  if (!subscriptionId) {
    return usage;
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

    // cognitoIdentityInstance.adminUpdateUserAttributes({
    //   UserAttributes: [{
    //     Name: customerAttrName,
    //     Value: session.customer,
    //   }],
    // Username: user.username,
    // UserPoolId: process.env.COGNITO_POOL_ID,
    // }).promise();
    // TODO: combine next two fetches if beatcaps is active
    cognitoIdentityInstance.adminUpdateUserAttributes({
      UserAttributes: [{
        Name: beatcapsAttrName,
        Value: beatcapsSubscription.id,
      }],
      Username: user.username,
      UserPoolId: process.env.COGNITO_POOL_ID,
    }).promise();

    cognitoIdentityInstance.adminUpdateUserAttributes({
      UserAttributes: [{
        Name: storageAttrName,
        Value: storageSubscription.id,
      }],
      Username: user.username,
      UserPoolId: process.env.COGNITO_POOL_ID,
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
