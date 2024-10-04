// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const db = require("../db");
// const config = require("../config");

// router.post("/register", async (req, res) => {
//   const { username, password, role } = req.body;

//   if (!username || !password || !role) {
//     return res
//       .status(400)
//       .json({ message: "Please provide all required fields" });
//   }

//   if (!["user", "admin"].includes(role)) {
//     return res.status(400).json({ message: "Invalid role" });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
//     db.query(sql, [username, hashedPassword, role], (err, result) => {
//       if (err) {
//         console.error("Error registering user: " + err.message);
//         return res.status(500).json({ message: "Error registering user" });
//       }

//       res.status(201).json({ message: "User registered successfully" });
//     });
//   } catch (err) {
//     console.error("Error hashing password: " + err.message);
//     res.status(500).json({ message: "Error registering user" });
//   }
// });

// router.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   const sql = "SELECT * FROM users WHERE username = ?";
//   db.query(sql, [username], async (err, results) => {
//     if (err) {
//       console.error("Error fetching user: " + err.message);
//       return res.status(500).json({ message: "Error fetching user" });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }
//     const user = results[0];
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }
//     const token = jwt.sign(
//       { username: user.username, role: user.role },
//       config.secret,
//       { expiresIn: "12h" }
//     );

//     // Update the loggedInTime in the database
//     const updateLoginTime =
//       "UPDATE users SET loggedInTime = ? WHERE userId = ?";
//     db.query(updateLoginTime, [new Date(), user.userId], (err, result) => {
//       if (err) {
//         console.error("Error updating login time: " + err.message);
//         return res.status(500).json({ message: "Error updating login time" });
//       }
//       res.status(200).json({ userId: user.userId, token, role: user.role });
//     });
//   });
// });

// router.post("/logout", (req, res) => {
//   const token = req.headers.authorization.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, config.secret);
//     const sql = "SELECT * FROM users WHERE username = ?";
//     db.query(sql, [decoded.username], (err, results) => {
//       if (err) {
//         console.error("Error fetching user: " + err.message);
//         return res.status(500).json({ message: "Error fetching user" });
//       }
//       if (results.length === 0) {
//         return res.status(401).json({ message: "Invalid token" });
//       }
//       const user = results[0];

//       // Update the loggedOutTime in the database
//       const updateLogoutTime =
//         "UPDATE users SET loggedOutTime = ? WHERE userId = ?";
//       db.query(updateLogoutTime, [new Date(), user.userId], (err, result) => {
//         if (err) {
//           console.error("Error updating logout time: " + err.message);
//           return res
//             .status(500)
//             .json({ message: "Error updating logout time" });
//         }
//         res.status(200).json({ message: "Logged out successfully" });
//       });
//     });
//   } catch (err) {
//     console.error("Error verifying token: " + err.message);
//     return res.status(401).json({ message: "Invalid token" });
//   }
// });

// router.get("/verify", (req, res) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, config.secret, (err, user) => {
//     if (err) return res.sendStatus(403);
//     res.json(user);
//   });
// });

// module.exports = router;





const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const config = require("../config");

const refreshTokens = {}; // In-memory store for refresh tokens (use a database in production)

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(sql, [username, hashedPassword, role], (err, result) => {
      if (err) {
        console.error("Error registering user: " + err.message);
        return res.status(500).json({ message: "Error registering user" });
      }

      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (err) {
    console.error("Error hashing password: " + err.message);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Error fetching user: " + err.message);
      return res.status(500).json({ message: "Error fetching user" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      config.secret,
      { expiresIn: "365d" } // Access token expires in 365 dayss
    )

    const refreshToken = jwt.sign(
      { username: user.username },
      config.secret,
      { expiresIn: "365d" } // Refresh token expires in 365 days
    );

    refreshTokens[username] = refreshToken; // Store the refresh token

    // Update the loggedInTime in the database
    const updateLoginTime = "UPDATE users SET loggedInTime = ? WHERE userId = ?";
    db.query(updateLoginTime, [new Date(), user.userId], (err, result) => {
      if (err) {
        console.error("Error updating login time: " + err.message);
        return res.status(500).json({ message: "Error updating login time" });
      }
      res.status(200).json({ userId: user.userId, token, refreshToken, role: user.role });
    });
  });
});

// Refresh token endpoint
router.post("/token", (req, res) => {
  const { token } = req.body;
  if (!token || !Object.values(refreshTokens).includes(token)) return res.sendStatus(403); // Forbidden

  jwt.verify(token, config.secret, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden

    const newToken = jwt.sign(
      { username: user.username, role: user.role },
      config.secret,
      { expiresIn: "365d" } // New access token expires in 365 dsys
    );
    res.json({ token: newToken });
  });
});

// Logout a user
router.post("/logout", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.secret);
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [decoded.username], (err, results) => {
      if (err) {
        console.error("Error fetching user: " + err.message);
        return res.status(500).json({ message: "Error fetching user" });
      }
      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid token" });
      }
      const user = results[0];

      // Update the loggedOutTime in the database
      const updateLogoutTime = "UPDATE users SET loggedOutTime = ? WHERE userId = ?";
      db.query(updateLogoutTime, [new Date(), user.userId], (err, result) => {
        if (err) {
          console.error("Error updating logout time: " + err.message);
          return res.status(500).json({ message: "Error updating logout time" });
        }
        delete refreshTokens[decoded.username]; // Remove refresh token
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  } catch (err) {
    console.error("Error verifying token: " + err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Verify token
router.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, config.secret, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json(user);
  });
});

module.exports = router;
