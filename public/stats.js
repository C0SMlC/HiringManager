document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("role") != "admin") {
    document.querySelector(".filter-container").style.display = "none";
  }

  fetchDashboardData();
  document
    .getElementById("applyFilters")
    .addEventListener("click", fetchDashboardData);
});

document.addEventListener("DOMContentLoaded", function () {
  let count = 0;
  fetch("/positions/count", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      data.map((item) => (count += item.openPositions));
      console.log("Fetched data hiiii:", count);
      // updatePositions(data);
      document.querySelector(".activePostionscount").textContent = count;
    });
});

function fetchDashboardData() {
  fetch("/candidates", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched data:", data);
      if (document.getElementById("profileOwnerFilter").options.length === 1) {
        populateProfileOwnerDropdown(data);
      }
      filterAndUpdateDashboard(data);
    })
    .catch((error) => {
      console.error("Error fetching dashboard data:", error);
      alert("Failed to load dashboard data. Please try again later.");
    });
}

function populateProfileOwnerDropdown(data) {
  const dropdown = document.getElementById("profileOwnerFilter");
  console.log("Candidates", data);
  const profileOwners = [
    ...new Set(data.map((candidate) => candidate.profileOwner)),
  ];

  profileOwners.forEach((owner) => {
    const option = document.createElement("option");
    option.value = owner;
    option.textContent = owner;
    dropdown.appendChild(option);
  });

  // Remove any existing event listeners
  dropdown.removeEventListener("change", dropdownChangeHandler);

  // Add the event listener
  dropdown.addEventListener("change", dropdownChangeHandler);
}

function dropdownChangeHandler() {
  console.log("Dropdown changed");
  fetchDashboardData();
}

function filterAndUpdateDashboard(data) {
  const selectedOwner = document.getElementById("profileOwnerFilter").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  console.log("Selected owner:", selectedOwner);
  console.log("Date range:", startDate, "to", endDate);

  localStorage.setItem("userForStats", selectedOwner);

  let filteredData = data;

  if (selectedOwner !== "all") {
    filteredData = filteredData.filter(
      (candidate) => candidate.profileOwner === selectedOwner
    );
  }

  if (startDate && endDate) {
    filteredData = filteredData.filter((candidate) => {
      const candidateDate = new Date(candidate.dateApplied);
      return (
        candidateDate >= new Date(startDate) &&
        candidateDate <= new Date(endDate)
      );
    });
  }

  console.log("Filtered data:", filteredData);

  const processedData = processData(filteredData);
  console.log("Processed data:", processedData);

  updateCharts(processedData);
  updateLists(processedData.lists);
  updateAnalytics(processedData.analytics);
}

function processData(data) {
  const activeStages = {
    "App. Recd.": 0,
    "Phone Screen": 0,
    L1: 0,
    L2_Internal: 0,
    "Yet to share": 0,
    "Shared with client": 0,
    L1_Client: 0,
    L2_Client: 0,
    "Final Discussion": 0,
  };

  const inactiveStages = {
    // "Exceeding Limit": 0,
    HOLD: 0,
    "Buffer List": 0,
    Rejected: 0,
    Declined: 0,
  };

  const lists = {
    active: 0,
    rejected: 0,
    buffer: 0,
    closed: 0,
    joined: 0,
    declined: 0,
    aboutToJoin: 0,
    exceedingLimit: 0,
  };

  data.forEach((candidate) => {
    if (activeStages.hasOwnProperty(candidate.stage)) {
      activeStages[candidate.stage]++;
      lists.active++;
    } else if (inactiveStages.hasOwnProperty(candidate.stage)) {
      inactiveStages[candidate.stage]++;

      if (candidate.stage === "Declined") {
        lists.declined++;
      }

      if (candidate.stage === "Rejected") {
        lists.rejected++;
      } else if (candidate.stage === "Buffer List") {
        lists.buffer++;
      }
    }

    if (candidate.stage === "Exceeding Limit") {
      lists.exceedingLimit++;
    }

    if (candidate.stage === "About To Join") {
      lists.aboutToJoin++;
    }

    if (candidate.status === "CLOSED") {
      lists.closed++;
    }

    if (candidate.status === "CLOSED" && candidate.stage === "Joined") {
      lists.joined++;
    }
  });

  const analytics = {
    totalApplicants: data.length,
    activeApplicants: lists.active,
    rejectedApplicants: lists.rejected,
    joinedApplicants: lists.joined,
  };

  return {
    activeStages,
    inactiveStages,
    lists,
    analytics,
  };
}

function updateLists(lists) {
  // document.getElementById('activeCount').textContent = lists.active;
  document.getElementById("exceedingLimitCount").textContent = lists.exceedingLimit;
  document.getElementById("bufferCount").textContent = lists.buffer;
  document.getElementById("closedCount").textContent = lists.closed;
  document.getElementById("declinedCount").textContent = lists.declined;
  document.getElementById("aboutToJoinCount").textContent = lists.aboutToJoin;
}

let activeStagesChart, inactiveStagesChart;

function updateCharts(data) {
  if (activeStagesChart) activeStagesChart.destroy();
  if (inactiveStagesChart) inactiveStagesChart.destroy();

  activeStagesChart = new Chart(document.getElementById("activeStagesChart"), {
    type: "pie",
    data: {
      labels: Object.keys(data.activeStages),
      datasets: [
        {
          data: Object.values(data.activeStages),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (context.parsed > 0) {
                label += `: ${context.parsed}`;
              }
              return label;
            },
          },
        },
        title: {
          display: true,
          text: "Active Profile Stats",
          font: {
            size: 16,
          },
        },
      },
    },
  });

  inactiveStagesChart = new Chart(
    document.getElementById("inactiveStagesChart"),
    {
      type: "bar",
      data: {
        labels: Object.keys(data.inactiveStages),
        datasets: [
          {
            label: "Count",
            data: Object.values(data.inactiveStages),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (context.parsed.y > 0) {
                  label += `: ${context.parsed.y}`;
                }
                return label;
              },
            },
          },
          title: {
            display: true,
            text: "Closed Profile Stats",
            font: {
              size: 16,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    }
  );
}

// function updateLists(lists) {
//     for (const [listName, items] of Object.entries(lists)) {
//         const listElement = document.getElementById(`${listName}List`);
//         listElement.innerHTML = items.map(item => `<li>${item}</li>`).join('');
//     }
// }

// function updateMasterDetails(data) {
//     const tableBody = document.querySelector('#masterDetails tbody');
//     tableBody.innerHTML = '';

//     const allStages = { ...data.activeStages, ...data.inactiveStages };
//     for (const [stage, count] of Object.entries(allStages)) {
//         const row = tableBody.insertRow();
//         row.insertCell(0).textContent = stage;
//         row.insertCell(1).textContent = count;
//     }
// }

function updateAnalytics(analytics) {
  console.log("Updating analytics:", analytics);
  document.getElementById("totalApplicants").textContent =
    analytics.totalApplicants;
  document.getElementById("activeApplicants").textContent =
    analytics.activeApplicants;
  document.getElementById("rejectedApplicants").textContent =
    analytics.rejectedApplicants;
  document.getElementById("joinedApplicants").textContent =
    analytics.joinedApplicants;
}
