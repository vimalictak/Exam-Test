const { nanoid } = require('nanoid');

const generateToken = () => {
  return nanoid(10); // Generate a secure 10-character token
};

module.exports = generateToken;
