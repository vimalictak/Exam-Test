const express = require('express');
const router = express.Router();
const { 
    getCandidateByToken, 
    updateCandidate, 
    verifyEmail, 
    sendMobileOTP, 
    verifyMobileOTP, 
    finalizeVerification 
} = require('../controllers/candidateController');

router.get('/verify/:token', getCandidateByToken);
router.put('/update/:id', updateCandidate);
router.post('/verify-email/:id', verifyEmail);
router.post('/send-otp', sendMobileOTP);
router.post('/verify-otp', verifyMobileOTP);
router.post('/finalize/:id', finalizeVerification);

module.exports = router;
