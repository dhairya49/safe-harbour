// API calls related to user operations
const API_URL = 'http://localhost:3000/api';

export const signupUser = async (formData) => {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            age: parseInt(formData.age, 10) // Ensure age is a number
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
    }
    return data;
};