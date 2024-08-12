



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

        const isAdmin = userData.role === 'admin';
        const filterContainer = document.querySelector('.filter-container');

        if (!isAdmin && filterContainer) {
            filterContainer.style.display = 'none';
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
                    // Hide candidates with status 'CLOSED' for regular users
                    if (!isAdmin && candidate.status === 'CLOSED') return;

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
                        <td>
                            <select id="status-${candidate.applicantId}" name="status">
                                <option value="OPEN" ${candidate.status === 'OPEN' ? 'selected' : ''}>OPEN</option>
                                <option value="CLOSED" ${candidate.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                            </select>
                        </td>
                        <td>
                            <select id="stage-${candidate.applicantId}" name="stage">
                                <option value="App. Recd." ${candidate.stage === 'App. Recd.' ? 'selected' : ''}>App. Recd.</option>
                                <option value="Phone Screen" ${candidate.stage === 'Phone Screen' ? 'selected' : ''}>Phone Screen</option>
                                <option value="Interview 1" ${candidate.stage === 'Interview 1' ? 'selected' : ''}>Interview 1</option>
                                <option value="Interview 2" ${candidate.stage === 'Interview 2' ? 'selected' : ''}>Interview 2</option>
                                <option value="Offer Made" ${candidate.stage === 'Offer Made' ? 'selected' : ''}>Offer Made</option>
                                <option value="Hired" ${candidate.stage === 'Hired' ? 'selected' : ''}>Hired</option>
                                <option value="Rejected" ${candidate.stage === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                        </td>
                        <td><input type="date" id="interviewDate-${candidate.applicantId}" value="${candidate.interviewDate || ''}"></td>
                        <td><input type="date" id="dateOfOffer-${candidate.applicantId}" value="${candidate.dateOfOffer || ''}"></td>
                        <td>
                            <select id="reasonNotExtending-${candidate.applicantId}" name="reasonNotExtending">
                                <option value="">Select Value</option>
                                <option value="Salary Negotiation" ${candidate.reasonNotExtending === 'Salary Negotiation' ? 'selected' : ''}>Salary Negotiation</option>
                                <option value="Relocation Issues" ${candidate.reasonNotExtending === 'Relocation Issues' ? 'selected' : ''}>Relocation Issues</option>
                            </select>
                        </td>
                        <td><input type="text" id="notes-${candidate.applicantId}" value="${candidate.notes || ''}"></td>
                        <td><button onclick="updateCandidate(${candidate.applicantId})">Update</button></td>
                    `;

                    candidateList.appendChild(row);
                });
            }

            // Initial rendering
            renderCandidates(data);

            // Apply filter if admin
            if (isAdmin && statusFilter) {
                statusFilter.addEventListener('change', () => {
                    const selectedStatus = statusFilter.value;
                    const filteredCandidates = data.filter(candidate =>
                        selectedStatus === 'all' || candidate.status === selectedStatus
                    );
                    renderCandidates(filteredCandidates);
                });
            }
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

const logoutLink = document.getElementById('logoutLink');
logoutLink.style.display = 'inline-block';

function updateCandidate(applicantId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
    }

    const status = document.getElementById(`status-${applicantId}`).value;
    const stage = document.getElementById(`stage-${applicantId}`).value;
    const interviewDate = document.getElementById(`interviewDate-${applicantId}`).value || null;
    const dateOfOffer = document.getElementById(`dateOfOffer-${applicantId}`).value || null;
    const reasonNotExtending = document.getElementById(`reasonNotExtending-${applicantId}`).value;
    const notes = document.getElementById(`notes-${applicantId}`).value;

    fetch(`/candidates/${applicantId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            status,
            stage,
            interviewDate,
            dateOfOffer,
            reasonNotExtending,
            notes
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        window.location.reload();
    })
    .catch(err => {
        console.error(err);
        alert('Failed to update candidate');
    });
}
