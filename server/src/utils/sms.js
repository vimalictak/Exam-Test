const Validator = require("./validation")
const otpService = require("./otp")
const axios = require("axios");


class sms {
    sendOtp({ phoneNumber }) {
        const isValid = Validator.isMobilePhone(phoneNumber);
        if (!isValid) {
            throw new Error('Invalid phone number');
        }
        const otp = otpService.generateOTP({ type: 2, key: phoneNumber });


        // sending generated otp to phone number

        // params  ot otp api

        const params = {
            "uname": process.env.PHONE_OTP_UNAME,
            "pwd": process.env.PHONE_OTP_PWD,
            "senderid": process.env.PHONE_OTP_SENDERID,
            "to": phoneNumber,
            "msg": otp + "-is your OTP for Verification/Authorisation at K-DISC - ICT",
            "route": process.env.PHONE_OTP_ROUTE,
            "peid": process.env.PHONE_OTP_PEID,
            "tempid": process.env.PHONE_OTP_TEMPID,
        }
        console.log(params)
        axios.post('https://alertin.co.in/sendsms', {}, {
            params: params,
        })
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });

    }

    verifyOtp({ phoneNumber, otp }) {
        const isValid = Validator.isMobilePhone(phoneNumber);
        if (!isValid) {
            throw new Error('Invalid phone number');
        }
        const isValidOtp = otpService.verifyOtp({ type: 2, key: phoneNumber, otp });
        if (!isValidOtp) {
            throw new Error('Invalid OTP');
        }

        return true
    }

    sendMessage(phoneNumber, message) {
        const isValid = Validator.isMobilePhone(phoneNumber);
        if (!isValid) {
            throw new Error('Invalid phone number');
        }

        // Send simple text message
        const params = {
            "uname": process.env.PHONE_OTP_UNAME,
            "pwd": process.env.PHONE_OTP_PWD,
            "senderid": process.env.PHONE_OTP_SENDERID,
            "to": phoneNumber,
            "msg": message + "-is your OTP for Verification/Authorisation at K-DISC - ICT",
            "route": process.env.PHONE_OTP_ROUTE,
            "peid": process.env.PHONE_OTP_PEID,
            "tempid": process.env.PHONE_OTP_TEMPID,
        }

        console.log('Sending SMS:', params);

        axios.post('https://alertin.co.in/sendsms', {}, {
            params: params,
        })
            .then(response => {
                console.log('SMS sent:', response.data);
            })
            .catch(error => {
                console.error('SMS Error:', error);
            });
    }

}

module.exports = new sms()