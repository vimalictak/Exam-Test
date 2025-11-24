const Admin = require('../models/Admin');
const Candidate = require('../models/Candidate');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/token');
const fs = require('fs');
const csv = require('csv-parser');
const whatsapp = require('../utils/whatsapp');
const sms = require('../utils/sms');



const generateJwt = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
const authAdmin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      username: admin.username,
      token: generateJwt(admin._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
};

// @desc    Get all candidates
// @route   GET /api/admin/candidates
const getCandidates = async (req, res) => {
  const candidates = await Candidate.find({});
  res.json(candidates);
};

// @desc    Upload candidates (CSV or single)
// @route   POST /api/admin/upload
const uploadCandidates = async (req, res) => {
  // Handle CSV file upload logic here if file is present
  if (req.file) {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Process CSV data
        const createdCandidates = [];
        for (const row of results) {
          // Basic mapping - adjust based on CSV structure
          const candidateData = {
            fullName: row.fullName || row['Full Name'],
            email: row.email || row['Email'],
            mobile: row.mobile || row['Mobile'],
            sector: row.sector || row['Sector'] || null,
          };

          if (candidateData.email) {
            const token = await generateToken();
            const newCandidate = await Candidate.create({
              ...candidateData,
              verificationToken: token,
            });
            createdCandidates.push(newCandidate);

            // Send Link

          }
        }
        fs.unlinkSync(req.file.path); // Clean up
        res.status(201).json({ message: 'CSV Processed', count: createdCandidates.length });
      });
  } else {
    // Manual Create
    const { fullName, email, mobile, sector } = req.body;
    const token = await generateToken();

    const candidate = await Candidate.create({
      fullName,
      email,
      mobile,
      sector: sector || null,
      verificationToken: token,
    });

    if (candidate) {

      res.status(201).json(candidate);
    } else {
      res.status(400).json({ message: 'Invalid candidate data' });
    }
  }
};

// @desc    Resend verification link
// @route   POST /api/admin/resend/:id
const resendLink = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (candidate) {
    // Regenerate if expired or just resend?
    // Let's just resend the existing valid one, or generate new if expired.
    if (candidate.isTokenUsed) {
      candidate.verificationToken = await generateToken();
      candidate.isTokenUsed = false;
      await candidate.save();
    }

    whatsapp.sendMessage(candidate.mobile ,`${process.env.CLIENT_URL}/verify/${candidate.verificationToken}` )
    
    await sms.sendMessage(candidate.mobile, `Verify here: ${process.env.CLIENT_URL}/verify/${candidate.verificationToken}`);
    res.json({ message: 'Link resent' });
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
};



// @desc    Resend verification link
// @route   POST /api/admin/resend/sms/:id
const resendSms = async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (candidate) {
    // Regenerate if expired or just resend?
    // Let's just resend the existing valid one, or generate new if expired.
    if (candidate.isTokenUsed) {
      candidate.verificationToken = await generateToken();
      candidate.isTokenUsed = false;
      await candidate.save();
    }

    await sms.sendMessage(candidate.mobile, `Verify here: ${process.env.CLIENT_URL}/verify/${candidate.verificationToken}`);
    res.json({ message: 'Link resent' });
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
};

module.exports = { authAdmin, getCandidates, uploadCandidates, resendLink , resendSms };
