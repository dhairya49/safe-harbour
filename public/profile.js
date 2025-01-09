document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/profile')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('username').textContent = data.username;
            document.getElementById('email').textContent = data.email;
            document.getElementById('fullName').textContent = `${data.firstName} ${data.lastName}`;
            document.getElementById('age').textContent = data.age;
            document.getElementById('gender').textContent = data.gender;
            document.getElementById('phone').textContent = data.phone;
            document.getElementById('medicalConditions').textContent = data.medicalConditions || 'None';
            document.getElementById('medications').textContent = data.medications || 'None';
            document.getElementById('allergies').textContent = data.allergies || 'None';
            document.getElementById('emergencyName').textContent = data.emergencyContact.name;
            document.getElementById('emergencyPhone').textContent = data.emergencyContact.phone;
            document.getElementById('emergencyRelationship').textContent = data.emergencyContact.relationship;
        })
        .catch(error => console.error(error));
});
