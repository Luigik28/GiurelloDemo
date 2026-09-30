'use strict';

const crypto = require('crypto');

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.APP_SECRET) {
  // Con più istanze Cloud Run il segreto deve essere condiviso (Secret Manager),
  // altrimenti un quiz iniziato su un'istanza non si corregge su un'altra.
  console.warn(JSON.stringify({ severity: 'WARNING', message: 'APP_SECRET non impostato: uso un segreto temporaneo per questa istanza.' }));
}

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 8080,
  secret: process.env.APP_SECRET || crypto.randomBytes(32).toString('hex')
};
