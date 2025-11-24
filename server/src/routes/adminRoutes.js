const express = require('express');
const router = express.Router();
const {
    authAdmin,
    getCandidates,
    uploadCandidates,
    resendLink,
    resendSms
} = require('../controllers/adminController');
const {
    sendCampaign,
    getCampaignHistory,
    getCampaignDetails
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/login', authAdmin);
router.get('/candidates', protect, getCandidates);
router.post('/upload', protect, upload.single('file'), uploadCandidates);
router.post('/resend/:id', protect, resendLink);
router.post('/resend/sms/:id', protect, resendSms);

// Campaign routes
router.post('/campaign/send', protect, sendCampaign);
router.get('/campaign/history', protect, getCampaignHistory);
router.get('/campaign/:id', protect, getCampaignDetails);

module.exports = router;
