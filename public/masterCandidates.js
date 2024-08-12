

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/login.html';
    }
 
    fetch('/auth/verify', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(userData => {
        localStorage.setItem('username', userData.username);
        localStorage.setItem('role', userData.role);
 
        const usernameElem = document.getElementById('username');
        const roleElem = document.getElementById('role');
        
        if (usernameElem && roleElem) {
            usernameElem.innerText = userData.username;
            roleElem.innerText = userData.role === 'admin' ? 'Admin' : 'User';
        }
 
        return fetch('/candidates', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => response.json())
        .then(data => {
            const candidateList = document.getElementById('candidateList');
            const statusFilter = document.getElementById('statusFilter');
 
            function renderCandidates(candidates) {
                candidateList.innerHTML = '';
 
                candidates.forEach(candidate => {
                    const row = document.createElement('tr');
 
                    row.innerHTML = `
                        <td>${candidate.profileOwner}</td>
                        <td>${candidate.applicantName}</td>
                        <td>${candidate.applicantPhone}</td>
                        <td>${candidate.applicantEmail}</td>
                        <td>${candidate.currentCompany}</td>
                        <td>${candidate.candidateWorkLocation}</td>
                        <td>${candidate.nativeLocation}</td>
                        <td>${candidate.qualification}</td>
                        <td>${candidate.experience}</td>
                        <td>${candidate.skills}</td>
                        <td>${candidate.noticePeriod}</td>
                        <td>${candidate.band}</td>
                        <td>${candidate.dateApplied}</td>
                        <td>${candidate.positionTitle}</td>
                        <td>${candidate.positionId}</td>
                        <td>${candidate.status}</td>
                        <td>${candidate.stage}</td>
                        <td>${candidate.interviewDate || ''}</td>
                        <td>${candidate.dateOfOffer || ''}</td>
                        <td>${candidate.reasonNotExtending || ''}</td>
                        <td>${candidate.notes || ''}</td>
                    `;
 
                    candidateList.appendChild(row);
                });
            }
 
            // Initial rendering
            renderCandidates(data);
 
            // Apply filter
            statusFilter.addEventListener('change', () => {
                const selectedStatus = statusFilter.value;
                const filteredCandidates = data.filter(candidate =>
                    selectedStatus === 'all' || candidate.status === selectedStatus
                );
                renderCandidates(filteredCandidates);
            });
        })
        .catch(err => {
            console.error(err);
            alert('Failed to fetch candidates');
        });
    })
    .catch(err => {
        console.error(err);
        alert('Failed to verify user');
    });
});
