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

              let profileOwnerCell = `<td>${candidate.profileOwner}</td>`;

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
                <td>${formatDate(candidate.dateApplied)}</td>
                <td>${candidate.positionTitle}</td>
                <td>${candidate.positionId}</td>
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
                        <option value="Interview 1" ${
                          candidate.stage === "Interview 1" ? "selected" : ""
                        }>Interview 1</option>
                        <option value="Interview 2" ${
                          candidate.stage === "Interview 2" ? "selected" : ""
                        }>Interview 2</option>
                        <option value="Offer Made" ${
                          candidate.stage === "Offer Made" ? "selected" : ""
                        }>Offer Made</option>
                        <option value="Hired" ${
                          candidate.stage === "Hired" ? "selected" : ""
                        }>Hired</option>
                        <option value="Rejected" ${
                          candidate.stage === "Rejected" ? "selected" : ""
                        }>Rejected</option>
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
              renderCandidates(filteredCandidates);
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

  let status = document.getElementById(`status-${applicantId}`).value;
  const stage = document.getElementById(`stage-${applicantId}`).value;
  const interviewDate =
    document.getElementById(`interviewDate-${applicantId}`).value || null;
  const dateOfOffer =
    document.getElementById(`dateOfOffer-${applicantId}`).value || null;
  const reasonNotExtending = document.getElementById(
    `reasonNotExtending-${applicantId}`
  ).value;
  const notes = document.getElementById(`notes-${applicantId}`).value;

  if (stage === "Rejected") status = "CLOSED";

  const profileOwner = isAdmin
    ? document.getElementById(`profileOwner-${applicantId}`).value
    : null;

  fetch(`/candidates/${applicantId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
      stage,
      interviewDate,
      dateOfOffer,
      reasonNotExtending,
      notes,
      profileOwner,
    }),
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
