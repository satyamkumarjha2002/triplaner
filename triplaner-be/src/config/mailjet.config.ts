// Mailjet configuration
export const mailjetConfig = {
  apiKey: process.env.MAILJET_API_KEY || 'b7477ccd51c2227d5b8cce7871c78f8e',
  apiSecret:
    process.env.MAILJET_API_SECRET || '9ec9407812451038f59483855a46603f',
  fromEmail: process.env.FROM_EMAIL || 'systemmangment9@gmail.com',
  fromName: process.env.FROM_NAME || 'dev.ssaang.com',
  version: process.env.MAILJET_VERSION || 'v3.1',
};
