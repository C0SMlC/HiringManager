document.addEventListener("DOMContentLoaded", () => {
  const listContainers = document.querySelectorAll(".analytic-item");

  listContainers.forEach((container) => {
    container.addEventListener("click", () => {
      const stage = container.getAttribute("data-stage");
      const url = `list-view.html?stage=${encodeURIComponent(stage)}`;
      window.open(url, "_blank");
    });
  });

  const masterDetailsContainer = document.getElementById(
    "masterDetailsContainer"
  );

  masterDetailsContainer.addEventListener("click", () => {
    window.open("masterDetails.html", "_blank");
  });
});
