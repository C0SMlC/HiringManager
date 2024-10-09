document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const applicantForm = document.getElementById('applicantForm');
    const profileOwnerField = document.getElementById('profileOwner');
    const dateAppliedField = document.getElementById('dateApplied');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            console.log(username,password,role)
            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, role })
                });

                const data = await response.json();
                alert(data.message);
            } catch (error) {
                alert('An error occurred: ' + error.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }

                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/form.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('An error occurred: ' + error.message);
            }
        });
    }

    if (applicantForm) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
        }

        // Set dateApplied to today's date
        const today = new Date().toISOString().split('T')[0];
        dateAppliedField.value = today;

        fetch('/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            profileOwnerField.value = data.username;
        })
        .catch(err => {
            console.error(err);
            alert('Failed to fetch profile owner');
        });

        applicantForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(applicantForm);

            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();
                alert(data.message);

                // Clear the form after successful submission
                applicantForm.reset();
                // Set dateApplied to today's date after reset
                dateAppliedField.value = today;
            } catch (error) {
                alert('An error occurred: ' + error.message);
            }
        });
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}
