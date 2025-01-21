const passwordStrengthValidator = (value, helpers) => {
    const errorMessage = checkPasswordStrength(value);
    if (errorMessage) {
        if (helpers) {
            return helpers.message(errorMessage);
        }
        throw new Error(errorMessage);
    }
    return value;
};


function checkPasswordStrength(value) {
    if (value.length < 6) {
        return "Password must be at least 6 characters long.";
    }
    if (!/[A-Z]/.test(value)) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(value)) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return "Password must contain at least one special character.";
    }
    return null;
}

module.exports = passwordStrengthValidator;