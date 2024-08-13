document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const formLink = document.getElementById('formLink');
    const detailsLink = document.getElementById('detailsLink');
    const registerLink = document.getElementById('registerLink')
    const updatePositionsLink = document.getElementById('updatePositionsLink')
    const positionsLink = document.getElementById("positionsLink")
    const mastercanditae= document.getElementById("mastercandidate")
 

    if (token) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none'
        updatePositionsLink.style.display = 'inline-block'
        positionsLink.style.display ='inline-block'

        logoutLink.style.display = 'inline-block';

        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    } else {
        formLink.style.display = 'none';
        detailsLink.style.display = 'none';
    }
});
