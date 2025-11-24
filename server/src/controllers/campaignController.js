const Campaign = require('../models/Campaign');
const Candidate = require('../models/Candidate');
const generateToken = require('../utils/token');
const whatsapp = require('../utils/whatsapp');
const sms = require('../utils/sms');

// @desc    Send campaign to all candidates or specific candidate
// @route   POST /api/admin/campaign/send
const sendCampaign = async (req, res) => {
    try {
        const { messageType = 'both', candidateId, campaignName } = req.body;

        // Validate messageType
        if (!['sms', 'whatsapp', 'both'].includes(messageType)) {
            return res.status(400).json({ message: 'Invalid message type. Must be sms, whatsapp, or both' });
        }

        // Determine target type and get candidates
        let candidates = [];
        let targetType = 'all';

        if (candidateId) {
            const candidate = await Candidate.findById(candidateId);
            if (!candidate) {
                return res.status(404).json({ message: 'Candidate not found' });
            }
            candidates = [candidate];
            targetType = 'single';
        } else {
            candidates = await Candidate.find({});
            if (candidates.length === 0) {
                return res.status(404).json({ message: 'No candidates found' });
            }
        }

        // Create campaign record
        const campaign = await Campaign.create({
            campaignName: campaignName || `Campaign ${new Date().toLocaleString()}`,
            messageType,
            targetType,
            targetCandidateId: candidateId || null,
            totalRecipients: candidates.length,
            status: 'in-progress',
            createdBy: req.user._id
        });

        let successCount = 0;
        let failureCount = 0;
        const failedRecipients = [];

        // Send messages to each candidate
        for (const candidate of candidates) {
            // Regenerate token if it's already used (same logic as resendLink)
            if (candidate.isTokenUsed) {
                candidate.verificationToken = await generateToken();
                candidate.isTokenUsed = false;
                await candidate.save();
            }

            const verificationLink = `${process.env.CLIENT_URL}/verify/${candidate.verificationToken}`;
            const smsMessage = `Verify here: ${verificationLink}`;

            let smsSuccess = true;
            let whatsappSuccess = true;

            // Send WhatsApp message if required
            if (messageType === 'whatsapp' || messageType === 'both') {
                try {
                    await whatsapp.sendMessage(candidate.mobile, verificationLink);
                } catch (error) {
                    whatsappSuccess = false;
                    failedRecipients.push({
                        candidateId: candidate._id,
                        candidateName: candidate.fullName,
                        candidateMobile: candidate.mobile,
                        error: error.message || 'Failed to send WhatsApp message',
                        channel: 'whatsapp'
                    });
                    console.error(`WhatsApp failed for ${candidate.mobile}:`, error.message);
                }
            }

            // Send SMS if required
            if (messageType === 'sms' || messageType === 'both') {
                try {
                    await sms.sendMessage(candidate.mobile, smsMessage);
                } catch (error) {
                    smsSuccess = false;
                    failedRecipients.push({
                        candidateId: candidate._id,
                        candidateName: candidate.fullName,
                        candidateMobile: candidate.mobile,
                        error: error.message || 'Failed to send SMS',
                        channel: 'sms'
                    });
                    console.error(`SMS failed for ${candidate.mobile}:`, error.message);
                }
            }

            // Count as success if at least one channel succeeded
            if (messageType === 'both') {
                if (smsSuccess || whatsappSuccess) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } else if (messageType === 'sms') {
                if (smsSuccess) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } else if (messageType === 'whatsapp') {
                if (whatsappSuccess) {
                    successCount++;
                } else {
                    failureCount++;
                }
            }
        }

        // Update campaign with results
        campaign.successCount = successCount;
        campaign.failureCount = failureCount;
        campaign.failedRecipients = failedRecipients;
        campaign.status = failureCount === candidates.length ? 'failed' : 'completed';
        await campaign.save();

        res.status(200).json({
            message: 'Campaign completed',
            campaign: {
                _id: campaign._id,
                campaignName: campaign.campaignName,
                messageType: campaign.messageType,
                targetType: campaign.targetType,
                totalRecipients: campaign.totalRecipients,
                successCount: campaign.successCount,
                failureCount: campaign.failureCount,
                status: campaign.status,
                createdAt: campaign.createdAt
            }
        });

    } catch (error) {
        console.error('Campaign error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get campaign history with pagination
// @route   GET /api/admin/campaign/history
const getCampaignHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Campaign.countDocuments();
        const campaigns = await Campaign.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username')
            .populate('targetCandidateId', 'fullName email mobile')
            .select('-failedRecipients'); // Exclude detailed failed recipients from list view

        res.json({
            campaigns,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get campaign history error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get specific campaign details
// @route   GET /api/admin/campaign/:id
const getCampaignDetails = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('targetCandidateId', 'fullName email mobile')
            .populate('failedRecipients.candidateId', 'fullName email mobile');

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (error) {
        console.error('Get campaign details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    sendCampaign,
    getCampaignHistory,
    getCampaignDetails
};
