document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/login.html';
    }

    const profileOwnerFilter = document.getElementById('profileOwnerFilter');
    const candidateList = document.getElementById('candidateList');

    let allCandidates = [];

    fetch('/candidates', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        allCandidates = data;
        
        // Populate profile owner filter
        const profileOwners = [...new Set(data.map(candidate => candidate.profileOwner))];
        profileOwners.forEach(owner => {
            const option = document.createElement('option');
            option.value = owner;
            option.textContent = owner;
            profileOwnerFilter.appendChild(option);
        });

        renderCandidates(allCandidates);

        profileOwnerFilter.addEventListener('change', () => {
            const selectedOwner = profileOwnerFilter.value;
            const filteredCandidates = selectedOwner === 'all' 
                ? allCandidates 
                : allCandidates.filter(candidate => candidate.profileOwner === selectedOwner);
            renderCandidates(filteredCandidates);
        });
    })
    .catch(err => {
        console.error(err);
        alert('Failed to fetch candidates');
    });

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
});