'use strict';

exports.port = process.env.PORT || 3000;
exports.mongodb = {
  uri: '<%= dbString %>' || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL 
};
exports.companyName = 'Acme, Inc.';
exports.projectName = '<%= projectName %>' || 'Drywall';
exports.systemEmail = 'your@email.addy';
exports.cryptoKey = 'k3yb0ardc4t';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};
exports.requireAccountVerification = false;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName +' Website',
    address: process.env.SMTP_FROM_ADDRESS || '<%= smtpUser %>' || 'your@email.addy'
  },
  credentials: {
    user: '<%= smtpUser %>' || process.env.SMTP_USERNAME || 'your@email.addy',
    password: '<%= smtpPass %>' || process.env.SMTP_PASSWORD || 'bl4rg!',  
    host: '<%= smtpServer %>' || process.env.SMTP_HOST || 'smtp.gmail.com',
    ssl: true
  }
};
exports.oauth = {
  twitter: {
    key: process.env.TWITTER_OAUTH_KEY || '',
    secret: process.env.TWITTER_OAUTH_SECRET || ''
  },
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '',
    secret: process.env.FACEBOOK_OAUTH_SECRET || ''
  },
  github: {
    key: process.env.GITHUB_OAUTH_KEY || '',
    secret: process.env.GITHUB_OAUTH_SECRET || ''
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '',
    secret: process.env.GOOGLE_OAUTH_SECRET || ''
  }
};
