document.addEventListener("DOMContentLoaded", () => {
  const socket = io({
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  function joinUserRoom(userId) {
    console.log("Attempting to join room for user:", userId);
    socket.emit("join", userId.toString());
  }

  socket.on("connect", () => {
    console.log("Socket connected. Socket ID:", socket.id);
    const userId = localStorage.getItem("userId");
    if (userId) {
      joinUserRoom(userId);
    } else {
      console.error("No userId found in localStorage");
    }
  });

  socket.on("userAssigned", (data) => {
    console.log("userAssigned event received:", data);
    showNotification(data.message || "New task assigned!");
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  // Listen for all incoming events (for debugging)
  socket.onAny((eventName, ...args) => {
    console.log(`Received event "${eventName}":`, args);
  });

  // Expose socket to global scope for testing
  window.testSocket = socket;
});

function showNotification(message) {
  console.log("showNotification called with message:", message);
  const popup = document.createElement("div");
  popup.textContent = message;
  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.right = "20px";
  popup.style.padding = "10px";
  popup.style.backgroundColor = "red";
  popup.style.color = "white";
  popup.style.border = "2px solid black";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = "9999";
  popup.style.minWidth = "200px";
  popup.style.minHeight = "50px";
  popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  document.body.appendChild(popup);
  console.log("Popup appended to body");
  setTimeout(() => {
    document.body.removeChild(popup);
    console.log("Popup removed after timeout");
  }, 5000);
}

// Test functions
function testNotification() {
  showNotification("Test notification " + new Date().toISOString());
}

function testSocketEvent() {
  if (window.testSocket && window.testSocket.connected) {
    window.testSocket.emit("testEvent", {
      message: "Test socket event " + new Date().toISOString(),
    });
    console.log("Test event emitted");
  } else {
    console.error("Socket not connected or not accessible");
  }
}

// Expose test functions globally
window.testNotification = testNotification;
window.testSocketEvent = testSocketEvent;
