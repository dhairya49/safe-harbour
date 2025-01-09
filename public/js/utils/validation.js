// Form validation utilities
export const validatePasswords = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        throw new Error('Passwords do not match!');
    }
};

export const validateEmergencyContact = (userPhone, emergencyPhone, userName, emergencyName) => {
    if (userPhone === emergencyPhone) {
        throw new Error('Emergency contact phone number cannot be the same as your phone number!');
    }
    if (userName === emergencyName) {
        throw new Error('Emergency contact name cannot be the same as your name!');
    }
};