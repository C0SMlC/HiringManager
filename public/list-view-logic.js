document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stage = urlParams.get("stage");
    const listTitle = document.getElementById("listTitle");
    const searchBar = document.getElementById("searchBar");
    const sortSelect = document.getElementById("sortSelect");
    const candidateList = document.getElementById("candidateList");
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.innerText = 'Loading...';
    document.body.appendChild(loadingIndicator);
    loadingIndicator.style.display = 'none';

    listTitle.textContent = `${stage.charAt(0).toUpperCase() + stage.slice(1)} Candidates`;
    let candidates = [];
    const profileOwner = localStorage.getItem("userForStats");

    async function fetchCandidates() {
        loadingIndicator.style.display = "block";
        try {
            const response = await fetch(`/candidates/stats/filter?profileOwnerFilter=${profileOwner}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched candidates:", data);

            // Filter candidates based on the stage
            candidates = data.filter(candidate => {
                if (stage === "active") return candidate.status === "OPEN";
                if (stage === "closed" || stage === "Rejected") return candidate.status === "CLOSED";
                return candidate.stage.toLowerCase() === stage.toLowerCase();
            });

            renderCandidates(candidates);
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Failed to fetch candidates: " + err.message);
        } finally {
            loadingIndicator.style.display = "none";
        }
    }

    function renderCandidates(candidatesToRender) {
        candidateList.innerHTML = "";
        const showDateOfOffer = stage === "joined" || stage === "About To Join";

        candidatesToRender.forEach((candidate) => {
            console.log("Candidate object:", candidate);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${candidate.applicantName || ""}</td>
                <td>${candidate.applicantPhone || ""}</td>
                <td>${candidate.applicantEmail || ""}</td>
                <td>${candidate.currentCompany || ""}</td>
                <td>${candidate.candidateWorkLocation || ""}</td>
                <td>${candidate.nativeLocation || ""}</td>
                <td>${candidate.qualification || ""}</td>
                <td>${candidate.experience || ""}</td>
                <td>${Array.isArray(candidate.skills) ? candidate.skills.join(", ") : candidate.skills || ""}</td>
                <td>${candidate.noticePeriod || ""}</td>
                <td>${candidate.currentctc || ""}</td>
                <td>${candidate.expectedctc || ""}</td>
                <td>${candidate.band || ""}</td>
                <td>${candidate.dateApplied ? new Date(candidate.dateApplied).toLocaleDateString() : ""}</td>
                <td>${candidate.positionTitle || ""}</td>
                <td>${candidate.positionId || ""}</td>
                <td>${candidate.status || ""}</td>
                <td>${candidate.stage || ""}</td>
                <td>${candidate.interviewer || ""}</td>
                <td>${candidate.dateOfPhoneScreen ? new Date(candidate.dateOfPhoneScreen).toLocaleDateString() : ""}</td>
                <td>${candidate.interviewDate || ""}</td>
                <td>${showDateOfOffer ? (candidate.dateOfOffer || "") : ""}</td>
                <td>${candidate.reasonNotExtending || ""}</td>
                <td>${candidate.notes || ""}</td>
            `;
            candidateList.appendChild(row);
        });
    }

    searchBar.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log("Searching for:", searchTerm);
        const filteredCandidates = candidates.filter(candidate =>
            candidate.applicantName.toLowerCase().includes(searchTerm)
        );
        renderCandidates(filteredCandidates);
    });

    sortSelect.addEventListener("change", (e) => {
        const sortBy = e.target.value;
        console.log("Sorting by:", sortBy);
        const sortedCandidates = [...candidates].sort((a, b) => {
            if (sortBy === "dateApplied") {
                return new Date(b.dateApplied) - new Date(a.dateApplied);
            } else if (sortBy === "applicantName") {
                return a.applicantName.localeCompare(b.applicantName);
            }
            return 0;
        });
        renderCandidates(sortedCandidates);
    });

    fetchCandidates();
});
