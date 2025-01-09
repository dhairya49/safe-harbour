
document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const loginData = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
  };

  try {
      const response = await fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
      });

      if (response.ok) {
          window.location.href = '/profilepage.html'; // Redirect after login
      } else {
          alert('Login failed');
      }
  } catch (error) {
      console.error('Error logging in:', error);
      alert('There was an error logging in');
  }
});



