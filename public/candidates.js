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

// Function to fetch resume
function fetchResume(applicantId) {
  const token = localStorage.getItem("token");
  return fetch(`/candidates/${applicantId}/resume`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Resume not available");
      }
      return response.json();
    })
    .then((data) => data.applicantResume);
}

// View resume
function viewResume(applicantId) {
  fetchResume(applicantId)
    .then((resumeData) => {
      const blob = new Blob([new Uint8Array(resumeData.data)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    })
    .catch((error) => {
      console.error("Error fetching resume:", error);
      alert("Resume not available");
    });
}

// Download resume
function downloadResume(applicantId, applicantName) {
  fetchResume(applicantId)
    .then((resumeData) => {
      const blob = new Blob([new Uint8Array(resumeData.data)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `DELTAIOT_${applicantName}_RESUME.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error downloading resume:", error);
      alert("Resume not available for download");
    });
}



function updateCandidate(applicantId) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const modal = document.getElementById("updateCandidateModal");
  const closeButton = document.querySelector(".close-button");

  // Get the applicant's name and populate the modal fields
  const applicantName = document.getElementById(`applicantName-${applicantId}`).value;
  document.getElementById("applicantNameDisplay").innerText = `Applicant Name: ${applicantName}`;
  document.getElementById("profileOwner").value=document.getElementById(`profileOwner-${applicantId}`).value;
  document.getElementById("applicantName").value = applicantName;
  document.getElementById("applicantPhone").value = document.getElementById(`applicantPhone-${applicantId}`).value;
  document.getElementById("applicantEmail").value = document.getElementById(`applicantEmail-${applicantId}`).value;
  document.getElementById("currentCompany").value = document.getElementById(`currentCompany-${applicantId}`).value;
  document.getElementById("candidateWorkLocation").value = document.getElementById(`candidateWorkLocation-${applicantId}`).value;
  document.getElementById("nativeLocation").value = document.getElementById(`nativeLocation-${applicantId}`).value;
  document.getElementById("qualification").value = document.getElementById(`qualification-${applicantId}`).value;
  document.getElementById("experience").value = document.getElementById(`experience-${applicantId}`).value;
  document.getElementById("skills").value = document.getElementById(`skills-${applicantId}`).value;
  document.getElementById("noticePeriod").value = document.getElementById(`noticePeriod-${applicantId}`).value;
  document.getElementById("currentctc").value = document.getElementById(`currentctc-${applicantId}`).value;
  document.getElementById("expectedctc").value = document.getElementById(`expectedctc-${applicantId}`).value;
  document.getElementById("band").value = document.getElementById(`band-${applicantId}`).value;
  document.getElementById("dateApplied").value = document.getElementById(`dateApplied-${applicantId}`).value;
  document.getElementById("positionTitle").value = document.getElementById(`positionTitle-${applicantId}`).value;
  document.getElementById("positionId").value = document.getElementById(`positionId-${applicantId}`).value;
  document.getElementById("interviewer").value = document.getElementById(`interviewer-${applicantId}`).value;
  document.getElementById("status").value = document.getElementById(`status-${applicantId}`).value;
  document.getElementById("stage").value = document.getElementById(`stage-${applicantId}`).value;
  document.getElementById("interviewDate").value = document.getElementById(`interviewDate-${applicantId}`).value;
  document.getElementById("dateOfOffer").value = document.getElementById(`dateOfOffer-${applicantId}`).value;
  document.getElementById("reasonNotExtending").value = document.getElementById(`reasonNotExtending-${applicantId}`).value;
  document.getElementById("notes").value = document.getElementById(`notes-${applicantId}`).value;
  modal.style.display = "block";

  closeButton.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  document.getElementById("saveButton").onclick = function() {
    const updatedCandidate = {
      profileOwner: document.getElementById("profileOwner").value || '',
      applicantName: document.getElementById("applicantName").value,
      interviewer: document.getElementById("interviewer").value,
      status: document.getElementById("status").value,
      stage: document.getElementById("stage").value,
      interviewDate: document.getElementById("interviewDate").value || null,
      dateOfOffer: document.getElementById("dateOfOffer").value || null,
      reasonNotExtending: document.getElementById("reasonNotExtending").value || null,
      notes: document.getElementById("notes").value || null,
      applicantPhone: document.getElementById("applicantPhone").value,
      applicantEmail: document.getElementById("applicantEmail").value,
      currentCompany: document.getElementById("currentCompany").value,
      candidateWorkLocation: document.getElementById("candidateWorkLocation").value,
      nativeLocation: document.getElementById("nativeLocation").value,
      qualification: document.getElementById("qualification").value,
      experience: document.getElementById("experience").value,
      skills: document.getElementById("skills").value,
      noticePeriod: document.getElementById("noticePeriod").value,
      currentctc: document.getElementById("currentctc").value,
      expectedctc: document.getElementById("expectedctc").value,
      band: document.getElementById("band").value,
      dateApplied: document.getElementById("dateApplied").value,
      positionTitle: document.getElementById("positionTitle").value,
      positionId: document.getElementById("positionId").value,
    };
  
    // Basic validation
    if (!updatedCandidate.profileOwner || !updatedCandidate.applicantName) {
      alert("Profile Owner and Applicant Name are required.");
      return;
    }
  
    fetch(`/candidates/${applicantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedCandidate),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(errData.message || 'Failed to update candidate');
        });
      }
      return response.json();
    })
    .then(data => {
      alert(data.message);
      modal.style.display = "none"; // Close the modal on success
    })
    .catch(err => {
      console.error(err);
      alert("Failed to update candidate: " + err.message);
    });
  };
  
  };
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
        document.querySelector(".filter-profile").style.display = "none";
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
      // if (isAdmin) {
      initializeFilters();
      // } else {
      //   renderCandidates(candidates.filter((c) => c.status !== "CLOSED"));
      // }
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to fetch user data or candidates");
    });

 

    function renderCandidates(filteredCandidates) {
      const candidateList = document.getElementById("candidateList");
      candidateList.innerHTML = ""; // Clear existing rows
  
      filteredCandidates.forEach((candidate) => {
          if (candidate.status === "CLOSED") return;
  
          const row = document.createElement("tr");
  
          // Profile Owner Cell (Sticky)
          let profileOwnerCell = `<td class="sticky-col first-col"><input type="text" id="profileOwner-${candidate.applicantId}" value="${candidate.profileOwner}" ${!isAdmin ? "disabled" : ""}></td>`;
  
          if (isAdmin) {
              profileOwnerCell = 
                  `<td class="sticky-col first-col">
                      <select id="profileOwner-${candidate.applicantId}">
                          ${users
                              .map(
                                  (user) => 
                                  `<option value="${user.username}" ${user.username === candidate.profileOwner ? "selected" : ""}>${user.username}</option>`
                              )
                              .join("")}
                      </select>
                  </td>`;
          }
  
          // Create table row with sticky columns
          row.innerHTML = 
              `${profileOwnerCell}
              <td class="sticky-col second-col"><i class="far fa-edit action-icon" style="color: blue;" onclick="updateCandidate(${candidate.applicantId})"></i></td>
              <td class="sticky-col sticky-col-3"><input type="text" id="applicantName-${candidate.applicantId}" value="${candidate.applicantName}"></td>
              <td><input type="tel" id="applicantPhone-${candidate.applicantId}" value="${candidate.applicantPhone}"></td>
              <td><input type="email" id="applicantEmail-${candidate.applicantId}" value="${candidate.applicantEmail}"></td>
              <td><input type="text" id="currentCompany-${candidate.applicantId}" value="${candidate.currentCompany}"></td>
              <td><input type="text" id="candidateWorkLocation-${candidate.applicantId}" value="${candidate.candidateWorkLocation}"></td>
              <td><input type="text" id="nativeLocation-${candidate.applicantId}" value="${candidate.nativeLocation}"></td>
              <td><input type="text" id="qualification-${candidate.applicantId}" value="${candidate.qualification}"></td>
              <td><input type="text" id="experience-${candidate.applicantId}" value="${candidate.experience}"></td>
              <td><input type="text" id="skills-${candidate.applicantId}" value="${candidate.skills}"></td>
              <td><input type="text" id="noticePeriod-${candidate.applicantId}" value="${candidate.noticePeriod}"></td>
              <td><input type="text" id="currentctc-${candidate.applicantId}" value="${candidate.currentctc}"></td>
              <td><input type="text" id="expectedctc-${candidate.applicantId}" value="${candidate.expectedctc}"></td>
              <td>
                  <select id="band-${candidate.applicantId}" name="band">
                      <option value="L0" ${candidate.band === "L0" ? "selected" : ""}>L0</option>
                      <option value="L1" ${candidate.band === "L1" ? "selected" : ""}>L1</option>
                      <option value="L2" ${candidate.band === "L2" ? "selected" : ""}>L2</option>
                      <option value="L3" ${candidate.band === "L3" ? "selected" : ""}>L3</option>
                      <option value="L4" ${candidate.band === "L4" ? "selected" : ""}>L4</option>
                      <option value="CostPlus" ${candidate.band === "CostPlus" ? "selected" : ""}>CostPlus</option>
                      <option value="Non-Billable" ${candidate.band === "Non-Billable" ? "selected" : ""}>Non-Billable</option>
                      <option value="Bench" ${candidate.band === "Bench" ? "selected" : ""}>Bench</option>
                  </select>
              </td>
              <td><input type="date" id="dateApplied-${candidate.applicantId}" value="${formatDate(candidate.dateApplied)}"></td>
              <td>
                  <select id="positionTitle-${candidate.applicantId}" onchange="updatePositionIds(${candidate.applicantId})">
                      ${Object.keys(positionMap)
                          .map(
                              (title) =>
                              `<option value="${title}" ${title === candidate.positionTitle ? "selected" : ""}>${title}</option>`
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
                                      `<option value="${id}" ${id === candidate.positionId ? "selected" : ""}>${id}</option>`
                                  )
                                  .join("")
                              : `<option value="${candidate.positionId}">${candidate.positionId}</option>`
                      }
                  </select>
              </td>
              <td>
                  <select id="status-${candidate.applicantId}" name="status">
                      <option value="OPEN" ${candidate.status === "OPEN" ? "selected" : ""}>OPEN</option>
                      <option value="CLOSED" ${candidate.status === "CLOSED" ? "selected" : ""}>CLOSED</option>
                  </select>
              </td>
              <td>
                  <select id="stage-${candidate.applicantId}" name="stage" onchange="toggleInterviewer(${candidate.applicantId})">
                      <option value="App. Recd." ${candidate.stage === "App. Recd." ? "selected" : ""}>App. Recd.</option>
                      <option value="Not Answering" ${candidate.stage === "Not Answering" ? "selected" : ""}>Not Answering</option>
                      <option value="Phone Screen" ${candidate.stage === "Phone Screen" ? "selected" : ""}>Phone Screen</option>
                      <option value="L1" ${candidate.stage === "L1" ? "selected" : ""}>L1</option>
                      <option value="L2_Internal" ${candidate.stage === "L2_Internal" ? "selected" : ""}>L2_Internal</option>
                      <option value="Yet to share" ${candidate.stage === "Yet to share" ? "selected" : ""}>Yet to share</option>
                      <option value="Shared with client" ${candidate.stage === "Shared with client" ? "selected" : ""}>Shared with client</option>
                      <option value="L1_Client" ${candidate.stage === "L1_Client" ? "selected" : ""}>L1_Client</option>
                      <option value="L2_Client" ${candidate.stage === "L2_Client" ? "selected" : ""}>L2_Client</option>
                      <option value="Final Discussion" ${candidate.stage === "Final Discussion" ? "selected" : ""}>Final Discussion</option>
                      <option value="About To Join" ${candidate.stage === "About To Join" ? "selected" : ""}>About To Join</option>
                      <option value="Joined" ${candidate.stage === "Joined" ? "selected" : ""}>Joined</option>
                      <option value="HOLD" ${candidate.stage === "HOLD" ? "selected" : ""}>Hold</option>
                      <option value="Buffer List" ${candidate.stage === "Buffer List" ? "selected" : ""}>Buffer List</option>
                      <option value="Exceeding Limit" ${candidate.stage === "Exceeding Limit" ? "selected" : ""}>Exceeding Limit</option>
                      <option value="Rejected" ${candidate.stage === "Rejected" ? "selected" : ""}>Rejected</option>
                      <option value="Declined" ${candidate.stage === "Declined" ? "selected" : ""}>Declined</option>
                  </select>
              </td>
              <td><input type="text" id="interviewer-${candidate.applicantId}" value="${candidate?.interviewer || "None"}" disabled></td>
              <td><input type="date" id="interviewDate-${candidate.applicantId}" value="${formatDate(candidate.interviewDate)}"></td>
              <td><input type="date" id="dateOfOffer-${candidate.applicantId}" value="${formatDate(candidate.dateOfOffer)}"></td>
              <td>
                  <select id="reasonNotExtending-${candidate.applicantId}" name="reasonNotExtending">
                      <option value="">Select Value</option>
                      <option value="Salary Negotiation" ${candidate.reasonNotExtending === "Salary Negotiation" ? "selected" : ""}>Salary Negotiation</option>
                      <option value="Relocation Issues" ${candidate.reasonNotExtending === "Relocation Issues" ? "selected" : ""}>Relocation Issues</option>
                  </select>
              </td>
              <td><input type="text" id="notes-${candidate.applicantId}" value="${candidate.notes || ""}"></td>
              <td><button class="action-button" onclick="viewResume(${candidate.applicantId})">View</button></td>
              <td><button class="action-button" onclick="downloadResume(${candidate.applicantId}, '${candidate.applicantName}')">Download</button></td>
              <td><button class="action-button" onclick="exportCandidate(${candidate.applicantId})">Export</button></td>`;
  
          candidateList.appendChild(row);
     
  
      // const stageSelect = document.getElementById(`stage-${candidate.applicantId}`);
      // if (stageSelect) {
      //   stageSelect.addEventListener("change", () =>
      //     toggleInterviewer(candidate.applicantId)
      //   );
      //   toggleInterviewer(candidate.applicantId);
      // }
    });
}



  function applyFilters() {
    const statusFilter = document.getElementById("statusFilter");
    const profileOwnerFilter = document.getElementById("profileOwnerFilter");
    const positionTitleFilter = document.getElementById("positionTitleFilter");
    const stageFilter = document.getElementById("stageFilter");

    const selectedStatus = statusFilter.value;
    const selectedProfileOwner = profileOwnerFilter.value;
    const selectedPositionTitle = positionTitleFilter.value;
    const selectedStage = stageFilter.value;

    let filteredCandidates = candidates.filter(
      (candidate) =>
        (selectedStatus === "all" || candidate.status === selectedStatus) &&
        (selectedProfileOwner === "all" ||
          candidate.profileOwner === selectedProfileOwner) &&
        (selectedPositionTitle === "all" ||
          candidate.positionTitle === selectedPositionTitle) &&
        (selectedStage === "all" || candidate.stage === selectedStage)
    );

    filteredCandidates.sort((a, b) => {
      const stageOrder = [
        "App. Recd.",
        "Not Answering",
        "Joined",
        "About To Join",
        "Phone Screen",
        "L1",
        "L2_Internal",
        "Yet to share",
        "Shared with client",
        "L1_Client",
        "L2_Client",
        "Exceeding Limit",
        "Final Discussion",
        "HOLD",
        "Buffer List",
        "Rejected",
        "Declined",
      ];
      return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
    });

    renderCandidates(filteredCandidates);
  }

  function initializeFilters() {
    const statusFilter = document.getElementById("statusFilter");
    const profileOwnerFilter = document.getElementById("profileOwnerFilter");
    const positionTitleFilter = document.getElementById("positionTitleFilter");
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

    // Populate position title filter
    const uniquePositionTitles = [
      ...new Set(candidates.map((c) => c.positionTitle)),
    ];
    positionTitleFilter.innerHTML =
      '<option value="all">All</option>' +
      uniquePositionTitles
        .map((title) => `<option value="${title}">${title}</option>`)
        .join("");

    // Populate stage filter
    const uniqueStages = [...new Set(candidates.map((c) => c.stage))];
    stageFilter.innerHTML =
      '<option value="all">All</option>' +
      uniqueStages
        .map((stage) => `<option value="${stage}">${stage}</option>`)
        .join("");

    // Add event listeners
    statusFilter.addEventListener("change", applyFilters);
    profileOwnerFilter.addEventListener("change", applyFilters);
    positionTitleFilter.addEventListener("change", applyFilters);
    stageFilter.addEventListener("change", applyFilters);

    // Initial filter application
    applyFilters();
  }
});
