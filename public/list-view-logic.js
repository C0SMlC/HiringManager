document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stage = urlParams.get('stage');
    const listTitle = document.getElementById('listTitle');
    const searchBar = document.getElementById('searchBar');
    const sortSelect = document.getElementById('sortSelect');
    const candidateList = document.getElementById('candidateList');

    listTitle.textContent = `${stage.charAt(0).toUpperCase() + stage.slice(1)} Candidates`;

    let candidates = [];

    // Fetch candidates data
    fetch('/candidates', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        candidates = data.filter(candidate => {
            if (stage === 'active') return candidate.status === 'OPEN';
            if (stage === 'closed' || stage === "Rejected") return candidate.status === 'CLOSED';
            return candidate.stage.toLowerCase() === stage.toLowerCase();
        });
        renderCandidates(candidates);
    })
    .catch(err => {
        console.error(err);
        alert('Failed to fetch candidates');
    });

    function renderCandidates(candidatesToRender) {
        candidateList.innerHTML = '';
        candidatesToRender.forEach(candidate => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${candidate.applicantName}</td>
                <td>${candidate.applicantEmail}</td>
                <td>${candidate.applicantPhone}</td>
                <td>${candidate.dateApplied}</td>
                <td>${candidate.positionTitle}</td>
                <td>${candidate.stage}</td>
            `;
            candidateList.appendChild(row);
        });
    }

    searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredCandidates = candidates.filter(candidate => 
            candidate.applicantName.toLowerCase().includes(searchTerm) ||
            candidate.applicantEmail.toLowerCase().includes(searchTerm) ||
            candidate.applicantPhone.includes(searchTerm)
        );
        renderCandidates(filteredCandidates);
    });

    sortSelect.addEventListener('change', () => {
        const sortBy = sortSelect.value;
        candidates.sort((a, b) => {
            if (sortBy === 'dateApplied') {
                return new Date(b.dateApplied) - new Date(a.dateApplied);
            } else {
                return a.applicantName.localeCompare(b.applicantName);
            }
        });
        renderCandidates(candidates);
    });
});