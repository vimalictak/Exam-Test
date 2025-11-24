const nanoid = (...args) => import('nanoid').then(mod => mod.nanoid(...args));
const Candidate = require("../models/Candidate"); // update path

const generateUniqueToken = async () => {
  let token;
  let exists = true;


    token = nanoid(25); // very low collision chance
   

  return token;
};

module.exports = generateUniqueToken;
