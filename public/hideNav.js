const role = localStorage.getItem("role");

const masterCandidatesLink = document.getElementById("masterCandidatesLink");
const assignApplicantLink = document.getElementById("assignApplicantLink");
const userActivity = document.getElementById("userActivity");

if (role === "admin") {
  if (masterCandidatesLink)
    masterCandidatesLink.style.display = "inline !important";
  if (assignApplicantLink) assignApplicantLink.style.display = "inline";
} else {
  // if (masterCandidatesLink) masterCandidatesLink.style.display = 'none';
  if (assignApplicantLink) assignApplicantLink.style.display = "none";
  if (userActivity) userActivity.style.display = "none";
}
