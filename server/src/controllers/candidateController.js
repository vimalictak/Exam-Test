const Candidate = require('../models/Candidate');
const sms  = require('../utils/sms');
const otpService = require('../utils/otp');

// @desc    Get candidate by token
// @route   GET /api/candidate/verify/:token
const getCandidateByToken = async (req, res) => {
  const candidate = await Candidate.findOne({ verificationToken: req.params.token });

  if (!candidate) {
    return res.status(404).json({ message: 'Invalid token' });
  }



  if (candidate.isTokenUsed) {
    return res.status(400).json({ message: 'Link already used', used: true });
  }

  res.json(candidate);
};

// @desc    Update candidate details
// @route   PUT /api/candidate/update/:id
const updateCandidate = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (candidate) {
    candidate.email = req.body.email || candidate.email;
    candidate.mobile = req.body.mobile || candidate.mobile;
    
    // Reset verification status if changed
    if (req.body.mobile && req.body.mobile !== candidate.mobile) candidate.mobileVerified = false;

    const updatedCandidate = await candidate.save();
    res.json(updatedCandidate);
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
};



// @desc    Send Mobile OTP
// @route   POST /api/candidate/send-otp
const sendMobileOTP = async (req, res) => {
  const { mobile } = req.body;
  
  
  const candidate = await Candidate.findById(req.body.candidateId);
  if (candidate) {
      await sms.sendOtp({phoneNumber : mobile});
      res.json({ message: 'OTP sent' });
  } else {
      res.status(404).json({ message: 'Candidate not found' });
  }
};

// @desc    Verify Mobile OTP
// @route   POST /api/candidate/verify-otp
const verifyMobileOTP = async (req, res) => {
  const { candidateId, otp } = req.body;
  const candidate = await Candidate.findById(candidateId);
  
  if (candidate) {
    try {
      const  isValid =  sms.verifyOtp({ phoneNumber : candidate.mobile, otp });
      if (isValid) { 
        return res.status(200).json({
          success :  true  ,
          message : "verifcation success"
        })
      }
      return  res.status(400).json(
        {
          success :  false  ,
          message :  "Invalid OTP"
        }
      )
    } catch (error) {
      res.status(400).json({ message: error.message || 'Invalid OTP'  ,  success  : false });
    }
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
};

// @desc    Finalize Verification
// @route   POST /api/candidate/finalize/:id
const finalizeVerification = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  
  if (candidate) {
    if (!candidate.mobileVerified) {
       return res.status(400).json({ message: 'Please verify mobile first' });
    }
    
    candidate.status = 'verified';
    candidate.isTokenUsed = true;
    candidate.verificationToken = undefined; // Invalidate token
    await candidate.save();
    res.json({ message: 'Verification complete' });
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
};

//@desc getTokenIsUsed
const getTokenIsUsed =async  (req , res) => { 
  try { 
    const candidate = await Candidate.findById(req.params.id);
    if (candidate) {
      return  res.status(400).json({ message: 'Invalid Id',  success : false });
    }

    return res.status(200).json({message : "" , success : true ,  isUsed } )
  }
  catch(error) { 

  }
}

module.exports = { 
    getCandidateByToken, 
    updateCandidate, 
    sendMobileOTP, 
    verifyMobileOTP, 
    finalizeVerification ,
    getTokenIsUsed , 
};
