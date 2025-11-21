const sendEmail = async (options) => {
  console.log('=================================================');
  console.log('📧 [MOCK EMAIL SERVICE]');
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message: ${options.message}`);
  console.log('=================================================');
  return true;
};

module.exports = sendEmail;
