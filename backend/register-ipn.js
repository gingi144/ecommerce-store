// register-ipn.js
const axios = require('axios');
require('dotenv').config();

async function registerIPN() {
  console.log('🔑 Getting PesaPal token...');
  
  try {
    // 1. Get authentication token
    const auth = Buffer.from(
      `${process.env.PESAPAL_CONSUMER_KEY}:${process.env.PESAPAL_CONSUMER_SECRET}`
    ).toString('base64');

    const tokenResponse = await axios.post(
      'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken',
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const token = tokenResponse.data.token;
    console.log('✅ Token obtained successfully');

    // 2. Register the IPN URL
    const ipnUrl = process.env.PESAPAL_IPN_URL;
    console.log(`📡 Registering IPN URL: ${ipnUrl}`);

    const registerResponse = await axios.post(
      'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN',
      {
        url: ipnUrl,
        ipn_notification_type: 'POST'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ IPN Registration Successful!');
    console.log('📝 IPN ID:', registerResponse.data.ipn_id);
    console.log('\n💡 IMPORTANT: Add this to your .env file:');
    console.log(`PESAPAL_IPN_ID=${registerResponse.data.ipn_id}`);
    
    // 3. Also register the callback URL
    console.log('\n📡 Registering Callback URL...');
    const callbackUrl = process.env.PESAPAL_CALLBACK_URL;
    console.log(`Callback URL: ${callbackUrl}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

registerIPN();