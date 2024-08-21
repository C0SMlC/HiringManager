let candidates = [];
let isAdmin;

function formatDate(dateString) {
  console.log("Input dateString", dateString);
  if (!dateString) return "";

  // Try parsing the date directly
  let date = new Date(dateString);

  // If the date is invalid, try parsing it as UTC
  if (isNaN(date.getTime())) {
    date = new Date(dateString + "T00:00:00Z");
  }

  // If it's still invalid, return an empty string
  if (isNaN(date.getTime())) {
    // console.error("Invalid date:", dateString);
    return "";
  }

  // Format the date as YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  // console.log("Formatted date", formattedDate);

  return formattedDate;
}

function adjustDateForTimezone(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

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

  // Check if elements exist before accessing their properties
  if (!stageSelect || !interviewerInput) {
    console.warn(`Elements not found for applicant ${applicantId}`);
    return;
  }

  if (enabledStages.includes(stageSelect.value)) {
    interviewerInput.disabled = false;
  } else {
    interviewerInput.disabled = true;
  }

  // Handle "Joined" stage
  if (stageSelect.value === "Joined") {
    interviewerInput.disabled = true;
    interviewerInput.value = "N/A";
  }
}

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
  a.download = `resume_${candidate.applicantName}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
  }

  fetch("/auth/verify", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((userData) => {
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
      let users;

      if (isAdmin) {
        fetchUsers = fetch("/users", {
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

      return fetch("/candidates", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const candidateList = document.getElementById("candidateList");
          const statusFilter = document.getElementById("statusFilter");

          candidates = data;

          function renderCandidates(candidates, users = []) {
            candidateList.innerHTML = "";

            candidates.forEach((candidate) => {
              // Skip rendering closed candidates if not admin
              if (!isAdmin && candidate.status === "CLOSED") return;

              const row = document.createElement("tr");

              let profileOwnerCell = `<td><input type="text" id="profileOwner-${
                candidate.applicantId
              }" value="${candidate.profileOwner}" ${
                !isAdmin ? "disabled" : ""
              }></td>`;

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
                <td><input type="text" id="applicantName-${
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
                <td><input type="text" id="positionTitle-${
                  candidate.applicantId
                }" value="${candidate.positionTitle}"></td>
                <td><input type="text" id="positionId-${
                  candidate.applicantId
                }" value="${candidate.positionId}"></td>
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

              // Add event listener after appending the row
              const stageSelect = document.getElementById(
                `stage-${candidate.applicantId}`
              );
              if (stageSelect) {
                stageSelect.addEventListener("change", () =>
                  toggleInterviewer(candidate.applicantId)
                );
                // Initial call to set the correct state
                toggleInterviewer(candidate.applicantId);
              }
            });
          }

          // console.log(data);
          // Initial rendering
          renderCandidates(data, users);

          // candidates.forEach((candidate) => {
          //   toggleInterviewer(candidate.applicantId);
          // });

          // Apply filter if admin
          if (isAdmin && statusFilter) {
            statusFilter.addEventListener("change", () => {
              const selectedStatus = statusFilter.value;
              const filteredCandidates = data.filter(
                (candidate) =>
                  selectedStatus === "all" ||
                  candidate.status === selectedStatus
              );
              renderCandidates(filteredCandidates, users);
            });
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to fetch candidates");
        });
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to verify user");
    });
});

const logoutLink = document.getElementById("logoutLink");
logoutLink.style.display = "inline-block";

function updateCandidate(applicantId) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
  }

  // console.log("document.getElementById(`profileOwner-1`).value", document.getElementById(`profileOwner-1`).value)

  const updatedCandidate = {
    // profileOwner:document.getElementById(`profileOwner-1`).value,
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
