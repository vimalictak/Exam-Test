const Candidate = require('../models/Candidate');
const sms = require('../utils/sms');
const { body, validationResult } = require("express-validator")

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


const updateValidator = [
  body("emailUpdated")
    .notEmpty().withMessage("Email  is  Required ")
    .isBoolean().withMessage("It should be boolen "),
  body("email")
    .notEmpty().withMessage("Email should not be empty")
    .isEmail().withMessage("Invalid email format"),

  body("re_email")
    .optional()
    .custom((value, { req }) => {
      if (req.body.emailUpdated === true) {
        if (value !== req.body.email) {
          throw new Error("Email mismatch");
        }
        return true;
      }

      return true

    }),
];


const updateCandidate = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Update email
    if (req.body.email && req.body.email !== candidate.email) {
      candidate.isEmailUpdated = true;
      candidate.email = req.body.email;
    }

    // Update attendance status
    if (req.body.attendanceStatus !== undefined) {
      candidate.attendanceStatus = req.body.attendanceStatus;
    }

    // Finalize verification logic
    candidate.status = 'verified';
    candidate.isTokenUsed = true;
    candidate.verificationToken = undefined; // Invalidate token

    const updated = await candidate.save();

    return res.json({
      message: "Candidate updated and verified successfully",
      data: updated,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// @desc    Send Mobile OTP
// @route   POST /api/candidate/send-otp
const sendMobileOTP = async (req, res) => {
  const { mobile } = req.body;


  const candidate = await Candidate.findById(req.body.candidateId);
  if (candidate) {
    await sms.sendOtp({ phoneNumber: mobile });
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
      const isValid = sms.verifyOtp({ phoneNumber: candidate.mobile, otp });
      if (isValid) {
        return res.status(200).json({
          success: true,
          message: "verifcation success"
        })
      }
      return res.status(400).json(
        {
          success: false,
          message: "Invalid OTP"
        }
      )
    } catch (error) {
      res.status(400).json({ message: error.message || 'Invalid OTP', success: false });
    }
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
};



//@desc getTokenIsUsed
const getTokenIsUsed = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (candidate) {
      return res.status(400).json({ message: 'Invalid Id', success: false });
    }

    return res.status(200).json({ message: "", success: true, isUsed })
  }
  catch (error) {

  }
}

module.exports = {
  updateValidator,
  getCandidateByToken,
  updateCandidate,
  sendMobileOTP,
  verifyMobileOTP,
  getTokenIsUsed,
};
