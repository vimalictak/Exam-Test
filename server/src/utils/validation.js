class Validator{
    isEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // check if the email and mobile fields are valid
    isMobilePhone(mobile) {
        const re = /^[0-9]{10}$/;
        return re.test(String(mobile));
    }
}   

module.exports = new Validator()