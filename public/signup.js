document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate passwords match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Validate emergency contact details don't match user details
    const phone = document.getElementById('phone').value;
    const emergencyPhone = document.getElementById('emergencyPhone').value;
    const firstName = document.getElementById('firstName').value;
    const emergencyName = document.getElementById('emergencyName').value;

    if (phone === emergencyPhone) {
        alert('Emergency contact phone number cannot be the same as your phone number!');
        return;
    }

    if (firstName === emergencyName) {
        alert('Emergency contact name cannot be the same as your name!');
        return;
    }

    // Collect form data
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: password,
        firstName: firstName,
        lastName: document.getElementById('lastName').value,
        age: parseInt(document.getElementById('age').value, 10), // Convert age to number
        gender: document.getElementById('gender').value,
        phone: phone,
        medicalConditions: document.getElementById('medicalConditions').value,
        medications: document.getElementById('medications').value,
        allergies: document.getElementById('allergies').value,
        emergencyContact: {
            name: emergencyName,
            phone: emergencyPhone,
            relationship: document.getElementById('relationship').value
        }
    };

    // Log the data to browser console
    console.log('Form Data:', formData);

    try {
        // Send data to backend
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Signup successful!');
            document.getElementById('signupForm').reset();
        } else {
            alert(`Signup failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during signup. Please try again.');
    }
});