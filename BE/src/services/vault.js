'use strict';

const env = require('../config/env');
const { createCipherService } = require('../utils/crypto');

module.exports = createCipherService(env.dataEncryptionKey);
