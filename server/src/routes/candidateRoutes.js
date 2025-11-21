const express = require('express');
const router = express.Router();
const { 
    getCandidateByToken, 
    updateCandidate, 
    sendMobileOTP, 
    verifyMobileOTP, 
    finalizeVerification, 
    getTokenIsUsed
} = require('../controllers/candidateController');

router.get('/verify/:token', getCandidateByToken);
router.put('/update/:id', updateCandidate);
router.post('/send-otp', sendMobileOTP);
router.post('/verify-otp', verifyMobileOTP);
router.post('/finalize/:id', finalizeVerification);
router.post("/get-token-is-useed" , getTokenIsUsed);

module.exports = router;
