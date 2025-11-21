const nanoid = (...args) => import('nanoid').then(mod => mod.nanoid(...args));
const Candidate = require("../models/Candidate"); // update path

const generateUniqueToken = async () => {
  let token;
  let exists = true;

  while (exists) {
    token = nanoid(21); // very low collision chance
    exists = await Candidate.exists({ verificationToken: token });
  }

  return token;
};

module.exports = generateUniqueToken;
