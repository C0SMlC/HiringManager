let candidates = [];
let isAdmin;

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

            function formatDate(dateString) {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toISOString().split("T")[0];
            }

            candidates.forEach((candidate) => {
              if (!isAdmin && candidate.status === "CLOSED") return;

              const row = document.createElement("tr");

              let profileOwnerCell = `<td><input type="text" id="profileOwner-${candidate.applicantId}" value="${candidate.profileOwner}" ${!isAdmin ? 'disabled' : ''}></td>`;

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
                <td><input type="text" id="applicantName-${candidate.applicantId}" value="${candidate.applicantName}"></td>
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
                <td><input type="text" id="band-${candidate.applicantId}" value="${candidate.band}"></td>
                <td><input type="date" id="dateApplied-${candidate.applicantId}" value="${formatDate(candidate.dateApplied)}"></td>
                <td><input type="text" id="positionTitle-${candidate.applicantId}" value="${candidate.positionTitle}"></td>
                <td><input type="text" id="positionId-${candidate.applicantId}" value="${candidate.positionId}"></td>
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
                    <select id="stage-${candidate.applicantId}" name="stage">
                        <option value="App. Recd." ${
                          candidate.stage === "App. Recd." ? "selected" : ""
                        }>App. Recd.</option>
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
                          candidate.stage === "Shared with client" ? "selected" : ""
                        }>Shared with client</option>
                        <option value="L1_Client" ${
                          candidate.stage === "L1_Client" ? "selected" : ""
                        }>L1_Client</option>
                        <option value="L2_Client" ${
                          candidate.stage === "L2_Client" ? "selected" : ""
                        }>L2_Client</option>
                        <option value="Final Discussion" ${
                          candidate.stage === "Final Discussion" ? "selected" : ""
                        }>Final Discussion</option>
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
            `;

              candidateList.appendChild(row);
            });
          }

          // Initial rendering
          renderCandidates(data, users);

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

  const updatedCandidate = {
    status: document.getElementById(`status-${applicantId}`).value,
    stage: document.getElementById(`stage-${applicantId}`).value,
    interviewDate: document.getElementById(`interviewDate-${applicantId}`).value || null,
    dateOfOffer: document.getElementById(`dateOfOffer-${applicantId}`).value || null,
    reasonNotExtending: document.getElementById(`reasonNotExtending-${applicantId}`).value,
    notes: document.getElementById(`notes-${applicantId}`).value,
    profileOwner: isAdmin ? document.getElementById(`profileOwner-${applicantId}`).value : null,
    applicantName: document.getElementById(`applicantName-${applicantId}`).value,
    applicantPhone: document.getElementById(`applicantPhone-${applicantId}`).value,
    applicantEmail: document.getElementById(`applicantEmail-${applicantId}`).value,
    currentCompany: document.getElementById(`currentCompany-${applicantId}`).value,
    candidateWorkLocation: document.getElementById(`candidateWorkLocation-${applicantId}`).value,
    nativeLocation: document.getElementById(`nativeLocation-${applicantId}`).value,
    qualification: document.getElementById(`qualification-${applicantId}`).value,
    experience: document.getElementById(`experience-${applicantId}`).value,
    skills: document.getElementById(`skills-${applicantId}`).value,
    noticePeriod: document.getElementById(`noticePeriod-${applicantId}`).value,
    currentctc: document.getElementById(`currentctc-${applicantId}`).value,
    expectedctc: document.getElementById(`expectedctc-${applicantId}`).value,
    band: document.getElementById(`band-${applicantId}`).value,
    dateApplied: document.getElementById(`dateApplied-${applicantId}`).value,
    positionTitle: document.getElementById(`positionTitle-${applicantId}`).value,
    positionId: document.getElementById(`positionId-${applicantId}`).value,
  };

  if (updatedCandidate.stage === "Rejected") updatedCandidate.status = "CLOSED";

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