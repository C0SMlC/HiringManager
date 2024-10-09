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
          option.dataset.email = user.email;
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

        // Get the email of the assigned user
        const assignedToOption =
          assignToSelect.options[assignToSelect.selectedIndex];
        const assignedToEmail = assignedToOption.value;

        const socket = io();

        fetch("/assign-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            username: assignedToEmail,
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            console.log(result.message);
            form.reset();
            // Emit an event to notify the assigned user
          });

        // Send email to the assigned user
        return sendEmailToAssignedUser(
          assignedToEmail,
          "New Applicant Assigned",
          `A new applicant has been assigned to you:\nName: ${nameInput.value}\nEmail: ${emailInput.value}\nPhone: ${phoneInput.value}`
        );
      })
      .catch((error) => {
        // console.error('Error:', error);
        console.error("Error:", error.message);
        // alert(
        //   `An error occurredgf while assigning the applicant: ${error.message}`
        // );
      });
  });
});

async function sendEmailToAssignedUser(to, subject, text) {
  try {
    const response = await fetch("/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ to, subject, text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
}
