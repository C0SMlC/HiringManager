/*document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (username) {
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            usernameDisplay.innerText = `Logged in as: ${username}`;
        }

        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.innerText = username;
        }

        const role = localStorage.getItem('role');
        const roleField = document.getElementById('role');
        if (roleField) {
            roleField.innerText = role ? role : 'User';
        }
    }
}); */

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (username) {
        const usernameDisplay = document.getElementById('usernameDisplay');

        const profileOwnerField = document.getElementById('profileOwner');
        if (profileOwnerField) {
            profileOwnerField.value = username;
        }
    }
});



// const role = localStorage.getItem('role');