document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      if (data.token) {
        console.log(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId);

        localStorage.setItem("hasJoinedRoom", false);

        localStorage.setItem("username", username); // Store username
        window.location.href = "stats.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  });
});
