const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    campaignName: {
        type: String,
        default: function () {
            return `Campaign ${new Date().toLocaleString()}`;
        }
    },
    messageType: {
        type: String,
        enum: ['sms', 'whatsapp', 'both'],
        required: true,
        default: 'both'
    },
    targetType: {
        type: String,
        enum: ['all', 'single'],
        required: true
    },
    targetCandidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        default: null
    },
    totalRecipients: {
        type: Number,
        default: 0
    },
    successCount: {
        type: Number,
        default: 0
    },
    failureCount: {
        type: Number,
        default: 0
    },
    failedRecipients: [{
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        candidateName: String,
        candidateMobile: String,
        error: String,
        channel: String // 'sms' or 'whatsapp'
    }],
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
