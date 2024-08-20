// document.addEventListener('DOMContentLoaded', () => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//         window.location.href = '/login.html';
//     }

//     fetch('/auth/verify', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     })
//     .then(response => response.json())
//     .then(userData => {
//         localStorage.setItem('username', userData.username);
//         localStorage.setItem('role', userData.role);

//         const usernameElem = document.getElementById('username');
//         const roleElem = document.getElementById('role');

//         if (usernameElem && roleElem) {
//             usernameElem.innerText = userData.username;
//             roleElem.innerText = userData.role === 'admin' ? 'Admin' : 'User';
//         }

//         return fetch('/candidates', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         }).then(response => response.json())
//         .then(data => {
//             const candidateList = document.getElementById('candidateList');
//             const statusFilter = document.getElementById('statusFilter');

//             function renderCandidates(candidates) {
//                 candidateList.innerHTML = '';

//                 candidates.forEach(candidate => {
//                     const row = document.createElement('tr');

//                     row.innerHTML = `
//                         <td>${candidate.profileOwner}</td>
//                         <td>${candidate.applicantName}</td>
//                         <td>${candidate.applicantPhone}</td>
//                         <td>${candidate.applicantEmail}</td>
//                         <td>${candidate.currentCompany}</td>
//                         <td>${candidate.candidateWorkLocation}</td>
//                         <td>${candidate.nativeLocation}</td>
//                         <td>${candidate.qualification}</td>
//                         <td>${candidate.experience}</td>
//                         <td>${candidate.skills}</td>
//                         <td>${candidate.noticePeriod}</td>
//                         <td>${candidate.band}</td>
//                         <td>${candidate.dateApplied}</td>
//                         <td>${candidate.positionTitle}</td>
//                         <td>${candidate.positionId}</td>
//                         <td>${candidate.status}</td>
//                         <td>${candidate.stage}</td>
//                         <td>${candidate.interviewDate || ''}</td>
//                         <td>${candidate.dateOfOffer || ''}</td>
//                         <td>${candidate.reasonNotExtending || ''}</td>
//                         <td>${candidate.notes || ''}</td>
//                     `;

//                     candidateList.appendChild(row);
//                 });
//             }

//             // Initial rendering
//             renderCandidates(data);

//             // Apply filter
//             statusFilter.addEventListener('change', () => {
//                 const selectedStatus = statusFilter.value;
//                 const filteredCandidates = data.filter(candidate =>
//                     selectedStatus === 'all' || candidate.status === selectedStatus
//                 );
//                 renderCandidates(filteredCandidates);
//             });
//         })
//         .catch(err => {
//             console.error(err);
//             alert('Failed to fetch candidates');
//         });
//     })
//     .catch(err => {
//         console.error(err);
//         alert('Failed to verify user');
//     });
// });

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const searchInput = document.getElementById("searchInput");
  let allCandidates = []; // Store all candidates

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

          function renderCandidates(candidates) {
            candidateList.innerHTML = "";

            candidates.forEach((candidate) => {
              const row = document.createElement("tr");
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

            const filteredCandidates = allCandidates.filter(
              (candidate) =>
                (selectedStatus === "all" ||
                  candidate.status === selectedStatus) &&
                (selectedOwner === "all" ||
                  candidate.profileOwner === selectedOwner)
            );

            renderCandidates(filteredCandidates);
          }

          statusFilter.addEventListener("change", applyFilters);
          ownerFilter.addEventListener("change", applyFilters);
          searchInput.addEventListener("input", () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredCandidates = allCandidates.filter(
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
});
