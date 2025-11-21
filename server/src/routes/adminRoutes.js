const express = require('express');
const router = express.Router();
const { 
    authAdmin, 
    getCandidates, 
    uploadCandidates, 
    resendLink 
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/login', authAdmin);
router.get('/candidates', protect, getCandidates);
router.post('/upload', protect, upload.single('file'), uploadCandidates);
router.post('/resend/:id', protect, resendLink);

module.exports = router;
