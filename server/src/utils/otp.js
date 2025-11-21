class OtpService{
    constructor() { 
        this.userOtp = {};
    }

    generateOTP({length = 6 , type , key }) {
        this.cleanupExpiredOTPs();
        // type 1  => email 
        // type 2  => mobile
        // type 3  => whatsapp
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        const otpExpires = Date.now() + 10 * 60 * 1000;


        this.userOtp[key] = { otp, otpExpires  , type  , isVerified: false };

        return otp;

    }

    verifyOtp({key , otp }) {
        // Clean up expired OTPs
        this.cleanupExpiredOTPs();

        const user = this.userOtp[key];

        if (!user) {
            throw new Error('Invalid Otp');
        }

        if (user.otp !== otp) {
            throw new Error('Invalid OTP.');
        }

        if (user.otpExpires < Date.now()) {
            throw new Error('OTP has expired.');
        }

        user.isVerified = true;
        delete this.userOtp[key];
        return true;
    }

    cleanupExpiredOTPs() {
        const now = Date.now();
        for (const email in this.userOtp) {
            if (this.userOtp[email].otpExpires < now) {
                delete this.userOtp[email];
            }
        }
    }
}


module.exports = new OtpService()