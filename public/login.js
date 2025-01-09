document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Check the role from the server response
            if (data.role === 'admin') {
                alert('Welcome, Admin!');
                window.location.href = 'admin/adminPanel.html';
            } else if (data.role === 'user') {
                alert('Login successful!');
                window.location.href = `/profile.html?id=${data.userId}`;
            } else {
                alert('Unknown role. Please contact support.');
            }
        } else {
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login. Please try again.');
    }
});


async function fetchUsers() {
    try {
      const response = await fetch(`${serverUrl}/admin/users`, {
        credentials: 'include',
      });
      const users = await response.json();
  
      const tableBody = document.querySelector('#userTable tbody');
      tableBody.innerHTML = '';
  
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input value="${user.username}" data-id="${user._id}" data-field="username"></td>
          <td><input value="${user.email}" data-id="${user._id}" data-field="email"></td>
          <td><input value="${user.password}" data-id="${user._id}" data-field="password"></td>
          <td><button onclick="updateUser('${user._id}')">Update</button></td>
        `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }
  
  // Logout function
  async function logout() {
    try {
      const response = await fetch(`${serverUrl}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
  
      if (response.ok) {
        alert('Logged out successfully');
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('userPanel').style.display = 'none';
        document.getElementById('login').style.display = 'block';
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  }
  
  // Update user
  async function updateUser(userId) {
    const inputs = document.querySelectorAll(`input[data-id="${userId}"]`);
    const updatedData = {};
  
    inputs.forEach(input => {
      updatedData[input.dataset.field] = input.value;
    });
  
    try {
      const response = await fetch(`${serverUrl}/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        alert('User updated successfully');
      } else {
        alert('Error updating user');
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  }
