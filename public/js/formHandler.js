import { validatePasswords, validateEmergencyContact } from './utils/validation.js';
import { signupUser } from './api/userApi.js';

const collectFormData = (form) => {
    return {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        age: form.age.value,
        gender: form.gender.value,
        phone: form.phone.value,
        medicalConditions: form.medicalConditions.value,
        medications: form.medications.value,
        allergies: form.allergies.value,
        emergencyContact: {
            name: form.emergencyName.value,
            phone: form.emergencyPhone.value,
            relationship: form.relationship.value
        }
    };
};

export const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;

    try {
        // Validate form
        validatePasswords(
            form.password.value,
            form.confirmPassword.value
        );
        validateEmergencyContact(
            form.phone.value,
            form.emergencyPhone.value,
            form.firstName.value,
            form.emergencyName.value
        );

        // Collect and submit data
        const formData = collectFormData(form);
        console.log('Form Data:', formData);
        
        await signupUser(formData);
        alert('Signup successful!');
        form.reset();

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred during signup. Please try again.');
    }
};