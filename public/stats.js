document.addEventListener('DOMContentLoaded', function() {
    fetchDashboardData();
});

function fetchDashboardData() {
    fetch('/candidates', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const processedData = processData(data);
        updateCharts(processedData);
        updateLists(processedData.lists);
        updateMasterDetails(processedData);
        updateAnalytics(processedData.analytics);
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
        // Optionally, display an error message to the user
        alert('Failed to load dashboard data. Please try again later.');
    });
}

function processData(data) {
    const activeStages = {
        'App. Recd.': 0,
        'Phone Screen': 0,
        'L1': 0,
        'L2_Internal': 0,
        'Yet to share': 0,
        'Shared with client': 0,
        'L1_Client': 0,
        'L2_Client': 0,
        'Final Discussion': 0
    };

    const inactiveStages = {
        'HOLD': 0,
        'Buffer List': 0,
        'Rejected': 0,
        'Declined': 0
    };

    const lists = {
        active: [],
        rejected: [],
        buffer: [],
        closed: [],
        joined: []
    };

    data.forEach(candidate => {
        if (activeStages.hasOwnProperty(candidate.stage)) {
            activeStages[candidate.stage]++;
            lists.active.push(candidate.applicantName);
        } else if (inactiveStages.hasOwnProperty(candidate.stage)) {
            inactiveStages[candidate.stage]++;
            if (candidate.stage === 'Rejected') {
                lists.rejected.push(candidate.applicantName);
            } else if (candidate.stage === 'Buffer List') {
                lists.buffer.push(candidate.applicantName);
            }
        }

        if (candidate.status === 'CLOSED') {
            lists.closed.push(candidate.applicantName);
        }

        if (candidate.status === 'CLOSED' && candidate.stage === 'Final Discussion') {
            lists.joined.push(candidate.applicantName);
        }
    });

    const analytics = {
        totalApplicants: data.length,
        activeApplicants: lists.active.length,
        rejectedApplicants: lists.rejected.length,
        joinedApplicants: lists.joined.length
    };

    return {
        activeStages,
        inactiveStages,
        lists,
        analytics
    };
}

function updateCharts(data) {
    new Chart(document.getElementById('activeStagesChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(data.activeStages),
            datasets: [{
                data: Object.values(data.activeStages),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (context.parsed > 0) {
                                label += `: ${context.parsed}`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    new Chart(document.getElementById('inactiveStagesChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(data.inactiveStages),
            datasets: [{
                label: 'Count',
                data: Object.values(data.inactiveStages),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (context.parsed.y > 0) {
                                label += `: ${context.parsed.y}`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateLists(lists) {
    for (const [listName, items] of Object.entries(lists)) {
        const listElement = document.getElementById(`${listName}List`);
        listElement.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }
}

function updateMasterDetails(data) {
    const tableBody = document.querySelector('#masterDetails tbody');
    tableBody.innerHTML = '';

    const allStages = { ...data.activeStages, ...data.inactiveStages };
    for (const [stage, count] of Object.entries(allStages)) {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = stage;
        row.insertCell(1).textContent = count;
    }
}

function updateAnalytics(analytics) {
    document.getElementById('totalApplicants').textContent = analytics.totalApplicants;
    document.getElementById('activeApplicants').textContent = analytics.activeApplicants;
    document.getElementById('rejectedApplicants').textContent = analytics.rejectedApplicants;
    document.getElementById('joinedApplicants').textContent = analytics.joinedApplicants;
}
