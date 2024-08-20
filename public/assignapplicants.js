document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("applicantForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const assignToSelect = document.getElementById("assignTo");
  const resumeInput = document.getElementById("resume");

  // Fetch users and populate the "Assign To" dropdown
  fetch("/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((users) => {
      users.forEach((user) => {
        if (user.role === "user") {
          const option = document.createElement("option");
          option.value = user.username; 
          option.textContent = user.username;
          assignToSelect.appendChild(option);
        }
      });
    })
    .catch((error) => console.error("Error fetching users:", error));

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Validate name (only alphabets and spaces)
    const nameRegex = /^(?!.*\d)[a-zA-Z\s]+$/;

    if (!nameRegex.test(nameInput.value)) {
      alert("Name must contain only alphabets and spaces.");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Validate phone (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneInput.value)) {
      alert("Phone number must be 10 digits.");
      return;
    }

    // Validate resume file type
    const allowedExtensions = ["pdf"];
    const fileExtension = resumeInput.value.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      alert("Please upload a PDF file for the resume.");
      return;
    }

    // If all validations pass, submit the form
    const formData = new FormData(form);
    fetch("/candidates/submit-application", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        alert(result.message);
        form.reset();
      })
      .catch((error) => {
        // console.error('Error:', error);
        alert("An error occurred while submitting the form.");
      });
  });
});
