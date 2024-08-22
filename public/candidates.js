// Global variables
let candidates = [];
let isAdmin = false;
let users = [];
let positionMap = {};

// Utility functions
function formatDate(dateString) {
  if (!dateString) return "";
  let date = new Date(dateString);
  if (isNaN(date.getTime())) {
    date = new Date(dateString + "T00:00:00Z");
  }
  if (isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function adjustDateForTimezone(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function compareDates(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1 - d2;
}

// Fetch positions
function fetchPositions() {
  return fetch("/api/positions", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((positions) => {
      positions.forEach((position) => {
        if (!positionMap[position.positionTitle]) {
          positionMap[position.positionTitle] = [];
        }
        positionMap[position.positionTitle].push(position.positionId);
      });
    })
    .catch((error) => console.error("Error fetching positions:", error));
}

// Toggle interviewer input
function toggleInterviewer(applicantId) {
  const stageSelect = document.getElementById(`stage-${applicantId}`);
  const interviewerInput = document.getElementById(
    `interviewer-${applicantId}`
  );
  const enabledStages = [
    "L1",
    "L2_Internal",
    "L1_Client",
    "L2_Client",
    "Final Discussion",
  ];

  if (!stageSelect || !interviewerInput) {
    console.warn(`Elements not found for applicant ${applicantId}`);
    return;
  }

  if (enabledStages.includes(stageSelect.value)) {
    interviewerInput.disabled = false;
  } else {
    interviewerInput.disabled = true;
  }

  if (stageSelect.value === "Joined") {
    interviewerInput.disabled = true;
    interviewerInput.value = "N/A";
  }
}

// View resume
function viewResume(applicantId) {
  const candidate = candidates.find((c) => c.applicantId === applicantId);
  if (!candidate || !candidate.applicantResume) {
    alert("Resume not available");
    return;
  }

  const blob = new Blob([new Uint8Array(candidate.applicantResume.data)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// Download resume
function downloadResume(applicantId) {
  const candidate = candidates.find((c) => c.applicantId === applicantId);
  if (!candidate || !candidate.applicantResume) {
    alert("Resume not available");
    return;
  }

  const blob = new Blob([new Uint8Array(candidate.applicantResume.data)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `Delta_${candidate.applicantName}_Resume.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

// Update candidate
function updateCandidate(applicantId) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const updatedCandidate = {
    interviewer:
      document.getElementById(`interviewer-${applicantId}`).value === "None"
        ? ""
        : document.getElementById(`interviewer-${applicantId}`).value,
    status: document.getElementById(`status-${applicantId}`).value,
    stage: document.getElementById(`stage-${applicantId}`).value,
    interviewDate: adjustDateForTimezone(
      document.getElementById(`interviewDate-${applicantId}`).value
    ),
    dateOfOffer: adjustDateForTimezone(
      document.getElementById(`dateOfOffer-${applicantId}`).value
    ),
    reasonNotExtending: document.getElementById(
      `reasonNotExtending-${applicantId}`
    ).value,
    notes: document.getElementById(`notes-${applicantId}`).value,
    profileOwner: document.getElementById(`profileOwner-${applicantId}`).value,
    applicantName: document.getElementById(`applicantName-${applicantId}`)
      .value,
    applicantPhone: document.getElementById(`applicantPhone-${applicantId}`)
      .value,
    applicantEmail: document.getElementById(`applicantEmail-${applicantId}`)
      .value,
    currentCompany: document.getElementById(`currentCompany-${applicantId}`)
      .value,
    candidateWorkLocation: document.getElementById(
      `candidateWorkLocation-${applicantId}`
    ).value,
    nativeLocation: document.getElementById(`nativeLocation-${applicantId}`)
      .value,
    qualification: document.getElementById(`qualification-${applicantId}`)
      .value,
    experience: document.getElementById(`experience-${applicantId}`).value,
    skills: document.getElementById(`skills-${applicantId}`).value,
    noticePeriod: document.getElementById(`noticePeriod-${applicantId}`).value,
    currentctc: document.getElementById(`currentctc-${applicantId}`).value,
    expectedctc: document.getElementById(`expectedctc-${applicantId}`).value,
    band: document.getElementById(`band-${applicantId}`).value,
    dateApplied: document.getElementById(`dateApplied-${applicantId}`).value,
    positionTitle: document.getElementById(`positionTitle-${applicantId}`)
      .value,
    positionId: document.getElementById(`positionId-${applicantId}`).value,
  };

  if (
    updatedCandidate.stage === "Rejected" ||
    updatedCandidate.stage === "Joined"
  )
    updatedCandidate.status = "CLOSED";

  fetch(`/candidates/${applicantId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedCandidate),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      window.location.reload();
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to update candidate");
    });
}

// Export candidate
function exportCandidate(applicantId) {
  const candidate = candidates.find((c) => c.applicantId === applicantId);
  if (!candidate) {
    alert("Candidate not found");
    return;
  }

  const excludeFields = ["applicantResume", "applicantId"];
  const exportData = Object.keys(candidate)
    .filter((key) => !excludeFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = candidate[key];
      return obj;
    }, {});

  const worksheet = XLSX.utils.json_to_sheet([exportData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidate");

  XLSX.writeFile(workbook, `candidate_${candidate.applicantName}.xlsx`);
}

// Update position IDs
function updatePositionIds(applicantId) {
  const titleSelect = document.getElementById(`positionTitle-${applicantId}`);
  const idSelect = document.getElementById(`positionId-${applicantId}`);
  const selectedTitle = titleSelect.value;

  idSelect.innerHTML = "";
  if (positionMap[selectedTitle]) {
    positionMap[selectedTitle].forEach((id) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = id;
      idSelect.appendChild(option);
    });
  }
}

// Main functionality
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.style.display = "inline-block";
  }

  Promise.all([
    fetch("/auth/verify", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => response.json()),
    fetchPositions(),
  ])
    .then(([userData]) => {
      localStorage.setItem("username", userData.username);
      localStorage.setItem("role", userData.role);

      const usernameElem = document.getElementById("username");
      const roleElem = document.getElementById("role");

      if (usernameElem && roleElem) {
        usernameElem.innerText = userData.username;
        roleElem.innerText = userData.role === "admin" ? "Admin" : "User";
      }

      isAdmin = userData.role === "admin";
      const filterContainer = document.querySelector(".filter-container");

      if (!isAdmin && filterContainer) {
        filterContainer.style.display = "none";
      }

      if (isAdmin) {
        return fetch("/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            users = data;
            users.push({
              username: "admin",
            });
          });
      }
    })
    .then(() => {
      return fetch("/candidates", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    })
    .then((response) => response.json())
    .then((data) => {
      candidates = data;
      if (isAdmin) {
        initializeFilters();
      } else {
        renderCandidates(candidates.filter((c) => c.status !== "CLOSED"));
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to fetch user data or candidates");
    });

  function renderCandidates(filteredCandidates) {
    const candidateList = document.getElementById("candidateList");
    candidateList.innerHTML = "";

    filteredCandidates.forEach((candidate) => {
      const row = document.createElement("tr");

      let profileOwnerCell = `<td><input type="text" id="profileOwner-${
        candidate.applicantId
      }" value="${candidate.profileOwner}" ${!isAdmin ? "disabled" : ""}></td>`;

      if (isAdmin) {
        profileOwnerCell = `
                    <td>
                        <select id="profileOwner-${candidate.applicantId}">
                            ${users
                              .map(
                                (user) => `
                                <option value="${user.username}" ${
                                  user.username === candidate.profileOwner
                                    ? "selected"
                                    : ""
                                }>
                                    ${user.username}
                                </option>
                            `
                              )
                              .join("")}
                        </select>
                    </td>
                `;
      }

      row.innerHTML = `
                ${profileOwnerCell}
                <td><input class="sticky-col" type="text" id="applicantName-${
                  candidate.applicantId
                }" value="${candidate.applicantName}"></td>
                <td><input type="tel" id="applicantPhone-${
                  candidate.applicantId
                }" value="${candidate.applicantPhone}"></td>
                <td><input type="email" id="applicantEmail-${
                  candidate.applicantId
                }" value="${candidate.applicantEmail}"></td>
                <td><input type="text" id="currentCompany-${
                  candidate.applicantId
                }" value="${candidate.currentCompany}"></td>
                <td><input type="text" id="candidateWorkLocation-${
                  candidate.applicantId
                }" value="${candidate.candidateWorkLocation}"></td>
                <td><input type="text" id="nativeLocation-${
                  candidate.applicantId
                }" value="${candidate.nativeLocation}"></td>
                <td><input type="text" id="qualification-${
                  candidate.applicantId
                }" value="${candidate.qualification}"></td>
                <td><input type="text" id="experience-${
                  candidate.applicantId
                }" value="${candidate.experience}"></td>
                <td><input type="text" id="skills-${
                  candidate.applicantId
                }" value="${candidate.skills}"></td>
                <td><input type="text" id="noticePeriod-${
                  candidate.applicantId
                }" value="${candidate.noticePeriod}"></td>
                <td><input type="text" id="currentctc-${
                  candidate.applicantId
                }" value="${candidate.currentctc}"></td>
                <td><input type="text" id="expectedctc-${
                  candidate.applicantId
                }" value="${candidate.expectedctc}"></td>
                <td>
                    <select id="band-${candidate.applicantId}" name="band">
                        <option value="L0" ${
                          candidate.band === "L0" ? "selected" : ""
                        }>L0</option>
                        <option value="L1" ${
                          candidate.band === "L1" ? "selected" : ""
                        }>L1</option>
                        <option value="L2" ${
                          candidate.band === "L2" ? "selected" : ""
                        }>L2</option>
                        <option value="L3" ${
                          candidate.band === "L3" ? "selected" : ""
                        }>L3</option>
                        <option value="L4" ${
                          candidate.band === "L4" ? "selected" : ""
                        }>L4</option>
                        <option value="CostPlus" ${
                          candidate.band === "CostPlus" ? "selected" : ""
                        }>CostPlus</option>
                        <option value="Non-Billable" ${
                          candidate.band === "Non-Billable" ? "selected" : ""
                        }>Non-Billable</option>
                        <option value="Bench" ${
                          candidate.band === "Bench" ? "selected" : ""
                        }>Bench</option>
                    </select>
                </td>
                <td><input type="date" id="dateApplied-${
                  candidate.applicantId
                }" value="${formatDate(candidate.dateApplied)}"></td>
                <td>
                  <select id="positionTitle-${
                    candidate.applicantId
                  }" onchange="updatePositionIds(${candidate.applicantId})">
                    ${Object.keys(positionMap)
                      .map(
                        (title) =>
                          `<option value="${title}" ${
                            title === candidate.positionTitle ? "selected" : ""
                          }>${title}</option>`
                      )
                      .join("")}
                  </select>
                </td>
                <td>
                  <select id="positionId-${candidate.applicantId}">
                    ${
                      positionMap[candidate.positionTitle]
                        ? positionMap[candidate.positionTitle]
                            .map(
                              (id) =>
                                `<option value="${id}" ${
                                  id === candidate.positionId ? "selected" : ""
                                }>${id}</option>`
                            )
                            .join("")
                        : `<option value="${candidate.positionId}">${candidate.positionId}</option>`
                    }
                  </select>
                </td>
                <td>
                    <select id="status-${candidate.applicantId}" name="status">
                        <option value="OPEN" ${
                          candidate.status === "OPEN" ? "selected" : ""
                        }>OPEN</option>
                        <option value="CLOSED" ${
                          candidate.status === "CLOSED" ? "selected" : ""
                        }>CLOSED</option>
                    </select>
                </td>
                  <td>
                      <select id="stage-${
                        candidate.applicantId
                      }" name="stage" onchange="toggleInterviewer(${
        candidate.applicantId
      })">
                          <option value="App. Recd." ${
                            candidate.stage === "App. Recd." ? "selected" : ""
                          }>App. Recd.</option>
                          <option value="Not Answering" ${
                            candidate.stage === "Not Answering"
                              ? "selected"
                              : ""
                          }>Not Answering</option>
                          <option value="Phone Screen" ${
                            candidate.stage === "Phone Screen" ? "selected" : ""
                          }>Phone Screen</option>
                          <option value="L1" ${
                            candidate.stage === "L1" ? "selected" : ""
                          }>L1</option>
                          <option value="L2_Internal" ${
                            candidate.stage === "L2_Internal" ? "selected" : ""
                          }>L2_Internal</option>
                          <option value="Yet to share" ${
                            candidate.stage === "Yet to share" ? "selected" : ""
                          }>Yet to share</option>
                          <option value="Shared with client" ${
                            candidate.stage === "Shared with client"
                              ? "selected"
                              : ""
                          }>Shared with client</option>
                          <option value="L1_Client" ${
                            candidate.stage === "L1_Client" ? "selected" : ""
                          }>L1_Client</option>
                          <option value="L2_Client" ${
                            candidate.stage === "L2_Client" ? "selected" : ""
                          }>L2_Client</option>
                          <option value="Final Discussion" ${
                            candidate.stage === "Final Discussion"
                              ? "selected"
                              : ""
                          }>Final Discussion</option>
                          <option value="Joined" ${
                            candidate.stage === "Joined" ? "selected" : ""
                          }>Joined</option>
                          <option value="HOLD" ${
                            candidate.stage === "HOLD" ? "selected" : ""
                          }>Hold</option>
                          <option value="Buffer List" ${
                            candidate.stage === "Buffer List" ? "selected" : ""
                          }>Buffer List</option>
                          <option value="Rejected" ${
                            candidate.stage === "Rejected" ? "selected" : ""
                          }>Rejected</option>
                          <option value="Declined" ${
                            candidate.stage === "Declined" ? "selected" : ""
                          }>Declined</option>
                      </select>
                  </td>
                  <td><input type="text" id="interviewer-${
                    candidate.applicantId
                  }" value="${candidate?.interviewer || "None"}" disabled></td>
                  
                <td><input type="date" id="interviewDate-${
                  candidate.applicantId
                }" value="${formatDate(candidate.interviewDate)}"></td>
                <td><input type="date" id="dateOfOffer-${
                  candidate.applicantId
                }" value="${formatDate(candidate.dateOfOffer)}"></td>
                <td>
                    <select id="reasonNotExtending-${
                      candidate.applicantId
                    }" name="reasonNotExtending">
                        <option value="">Select Value</option>
                        <option value="Salary Negotiation" ${
                          candidate.reasonNotExtending === "Salary Negotiation"
                            ? "selected"
                            : ""
                        }>Salary Negotiation</option>
                        <option value="Relocation Issues" ${
                          candidate.reasonNotExtending === "Relocation Issues"
                            ? "selected"
                            : ""
                        }>Relocation Issues</option>
                    </select>
                </td>
                <td><input type="text" id="notes-${
                  candidate.applicantId
                }" value="${candidate.notes || ""}"></td>
                <td><button class="action-button" onclick="updateCandidate(${
                  candidate.applicantId
                })">Update</button></td>
                <td><button class="action-button" onclick="viewResume(${
                  candidate.applicantId
                })">View</button></td>
                <td><button class="action-button" onclick="downloadResume(${
                  candidate.applicantId
                })">Download</button></td>
                <td><button class="action-button" onclick="exportCandidate(${
                  candidate.applicantId
                })">Export</button></td>`;

      candidateList.appendChild(row);

      const stageSelect = document.getElementById(
        `stage-${candidate.applicantId}`
      );
      if (stageSelect) {
        stageSelect.addEventListener("change", () =>
          toggleInterviewer(candidate.applicantId)
        );
        toggleInterviewer(candidate.applicantId);
      }
    });
  }

  function applyFilters() {
    const statusFilter = document.getElementById("statusFilter");
    const profileOwnerFilter = document.getElementById("profileOwnerFilter");
    const dateAppliedSort = document.getElementById("dateAppliedSort");

    const selectedStatus = statusFilter.value;
    const selectedProfileOwner = profileOwnerFilter.value;
    const sortOrder = dateAppliedSort.value;

    let filteredCandidates = candidates.filter(
      (candidate) =>
        (selectedStatus === "all" || candidate.status === selectedStatus) &&
        (selectedProfileOwner === "all" ||
          candidate.profileOwner === selectedProfileOwner)
    );

    if (sortOrder !== "none") {
      filteredCandidates.sort((a, b) => {
        const comparison = compareDates(a.dateApplied, b.dateApplied);
        return sortOrder === "ascending" ? comparison : -comparison;
      });
    }

    renderCandidates(filteredCandidates);
  }

  function initializeFilters() {
    const statusFilter = document.getElementById("statusFilter");
    const profileOwnerFilter = document.getElementById("profileOwnerFilter");
    const dateAppliedSort = document.getElementById("dateAppliedSort");

    // Populate profile owner filter
    const uniqueProfileOwners = [
      ...new Set(candidates.map((c) => c.profileOwner)),
    ];
    profileOwnerFilter.innerHTML =
      '<option value="all">All</option>' +
      uniqueProfileOwners
        .map((owner) => `<option value="${owner}">${owner}</option>`)
        .join("");

    // Add event listeners
    statusFilter.addEventListener("change", applyFilters);
    profileOwnerFilter.addEventListener("change", applyFilters);
    dateAppliedSort.addEventListener("change", applyFilters);

    // Initial filter application
    applyFilters();
  }
});
