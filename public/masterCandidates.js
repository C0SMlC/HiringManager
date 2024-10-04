document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const searchInput = document.getElementById("searchInput");
  const stageFilter = document.getElementById("stageFilter");
  let allCandidates = []; // Store all candidates
  let filteredCandidates = []; // Store filtered candidates

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

      fetch("/candidates?isgetAll=true", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const candidateList = document.getElementById("candidateList");
          const statusFilter = document.getElementById("statusFilter");
          const ownerFilter = document.getElementById("ownerFilter");
          allCandidates = data;
          filteredCandidates = data; // Initially, all candidates are filtered

          // Populate "Profile Owner" dropdown
          const profileOwners = [
            ...new Set(data.map((candidate) => candidate.profileOwner)),
          ];
          profileOwners.forEach((owner) => {
            const option = document.createElement("option");
            option.value = owner;
            option.textContent = owner;
            ownerFilter.appendChild(option);
          });

          // Populate "Stage" dropdown
          const stages = [...new Set(data.map((candidate) => candidate.stage))];
          stages.forEach((stage) => {
            const option = document.createElement("option");
            option.value = stage;
            option.textContent = stage;
            stageFilter.appendChild(option);
          });

          function renderCandidates(candidates) {
            candidateList.innerHTML = "";

            candidates.forEach((candidate) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td class="sticky-col first-col">${candidate.profileOwner}</td>
                <td class="sticky-col second-col">${candidate.applicantName}</td>
                <td>${candidate.applicantPhone}</td>
                <td>${candidate.applicantEmail}</td>
                <td>${candidate.currentCompany}</td>
                <td>${candidate.candidateWorkLocation}</td>
                <td>${candidate.nativeLocation}</td>
                <td>${candidate.qualification}</td>
                <td>${candidate.experience}</td>
                <td>${candidate.skills}</td>
                <td>${candidate.noticePeriod}</td>
                <td>${candidate.currentctc}</td>
                <td>${candidate.expectedctc}</td>
                <td>${candidate.band}</td>
                <td>${candidate.dateApplied}</td>
                <td>${candidate.positionTitle}</td>
                <td>${candidate.positionId}</td>
                <td>${candidate.status}</td>
                <td>${candidate.stage}</td>
                <td>${candidate.interviewer}</td>
                <td>${candidate.interviewDate || ""}</td>
                <td>${candidate.dateOfOffer || ""}</td>
                <td>${candidate.reasonNotExtending || ""}</td>
                <td>${candidate.notes || ""}</td>
            `;
              candidateList.appendChild(row);
            });
          }

          // Initial rendering
          renderCandidates(data);

          // Apply filters
          function applyFilters() {
            const selectedStatus = statusFilter.value;
            const selectedOwner = ownerFilter.value;
            const selectedStage = stageFilter.value;

            filteredCandidates = allCandidates.filter(
              (candidate) =>
                (selectedStatus === "all" || candidate.status === selectedStatus) &&
                (selectedOwner === "all" || candidate.profileOwner === selectedOwner) &&
                (selectedStage === "all" || candidate.stage === selectedStage)
            );

            renderCandidates(filteredCandidates);
          }

          statusFilter.addEventListener("change", applyFilters);
          ownerFilter.addEventListener("change", applyFilters);
          stageFilter.addEventListener("change", applyFilters);

          searchInput.addEventListener("input", () => {
            const searchTerm = searchInput.value.toLowerCase();
            filteredCandidates = allCandidates.filter(
              (candidate) =>
                candidate.applicantName.toLowerCase().includes(searchTerm) ||
                candidate.applicantEmail.toLowerCase().includes(searchTerm) ||
                candidate.applicantPhone.toLowerCase().includes(searchTerm)
            );
            renderCandidates(filteredCandidates);
          });
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

  // Export filtered data to Excel
  document.getElementById("exportButton").addEventListener("click", function () {
    exportToExcel(filteredCandidates);
  });
});

// Function to export filtered candidates to Excel
function exportToExcel(filteredData) {
  const headers = [
    "Profile Owner", "Applicant Name", "Phone", "Email", "Current Company", "Work Location",
    "Native Location", "Qualification", "Experience", "Skills", "Notice Period",
    "Current CTC", "Expected CTC", "Band", "Date Applied", "Position Title", "Position ID",
    "Status", "Stage", "Interviewer", "Interview Date", "Date of Offer", "Reason Not Extending", "Notes"
  ];

  const rows = filteredData.map(candidate => [
    candidate.profileOwner, candidate.applicantName, candidate.applicantPhone,
    candidate.applicantEmail, candidate.currentCompany, candidate.candidateWorkLocation,
    candidate.nativeLocation, candidate.qualification, candidate.experience, candidate.skills,
    candidate.noticePeriod, candidate.currentctc, candidate.expectedctc, candidate.band,
    candidate.dateApplied, candidate.positionTitle, candidate.positionId, candidate.status,
    candidate.stage, candidate.interviewer, candidate.interviewDate || "",
    candidate.dateOfOffer || "", candidate.reasonNotExtending || "", candidate.notes || ""
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, "Master_Candidates_Data");
  XLSX.writeFile(wb, "Master_Candidates_Data.xlsx");
}
