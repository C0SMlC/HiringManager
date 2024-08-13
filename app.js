const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const authRoutes = require("./routes/auth");
const candidateRoutes = require("./routes/candidates");
const authenticateToken = require("./middleware/auth");
const db = require("./db");
const cors = require("cors");
const app = express();
const port = 3001;
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/candidates", candidateRoutes);

const util = require("util");

// const util = require('util');

app.get("/users", async (req, res) => {
  try {
    const sql = 'SELECT userId, username, role FROM users WHERE role = "user"';

    let params = [];

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error: " + err.message);
        return res.status(500).json({ message: "Error fetching candidates" });
      }

      res.json(results);
    });
  } catch (err) {
    // Log the full error object for debugging
    console.error(
      "Error fetching users:",
      util.inspect(err, { showHidden: false, depth: null })
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.get("/form", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

app.get("/updatePositions", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "updatePositions.html"));
});

// app.post('/submit', authenticateToken, upload.single('applicantResume'), (req, res) => {
//     const {
//         applicantName,
//         applicantPhone,
//         applicantEmail,
//         currentCompany,
//         candidateWorkLocation,
//         nativeLocation,
//         qualification,
//         experience,
//         skills,
//         noticePeriod,
//         band,
//         dateApplied,
//         positionTitle,
//         positionId,
//         status,
//         stage,
//         dateOfPhoneScreen,
//         interviewDate,
//         dateOfOffer,
//         reasonNotExtending,
//         notes
//     } = req.body;

//     const profileOwner = req.user.username;
//     const applicantResume = req.file.buffer;

//     const sql = `
//         INSERT INTO ApplicantTracking (
//             profileOwner,
//             applicantName,
//             applicantPhone,
//             applicantEmail,
//             currentCompany,
//             candidateWorkLocation,
//             nativeLocation,
//             qualification,
//             experience,
//             skills,
//             noticePeriod,
//             band,
//             applicantResume,
//             dateApplied,
//             positionTitle,
//             positionId,
//             status,
//             stage,
//             dateOfPhoneScreen,
//             interviewDate,
//             dateOfOffer,
//             reasonNotExtending,
//             notes
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(sql, [
//         profileOwner,
//         applicantName,
//         applicantPhone,
//         applicantEmail,
//         currentCompany,
//         candidateWorkLocation,
//         nativeLocation,
//         qualification,
//         experience,
//         skills,
//         noticePeriod,
//         band,
//         applicantResume,
//         dateApplied,
//         positionTitle,
//         positionId,
//         status,
//         stage || null,
//         dateOfPhoneScreen || null,
//         interviewDate || null,
//         dateOfOffer || null,
//         reasonNotExtending || null,
//         notes || null
//     ], (err, result) => {
//         if (err) {
//             console.error('Error: ' + err.message);
//             return res.status(500).json({ message: 'Error submitting form' });
//         }

//         res.status(200).json({ message: 'Form submitted successfully' });
//     });
// });


app.post('/submit', authenticateToken, upload.single('applicantResume'), (req, res) => {
    const {
        applicantName,
        applicantPhone,
        applicantEmail,
        currentCompany,
        candidateWorkLocation,
        nativeLocation,
        qualification,
        experience,
        skills,
        noticePeriod,
        band,
        dateApplied,
        positionTitle,
        positionId,
        status,
        stage,
        dateOfPhoneScreen,
        interviewDate,
        dateOfOffer,
        reasonNotExtending,
        notes
    } = req.body;

    const profileOwner = req.user.username;
    const applicantResume = req.file.buffer;

    // Check for existing records
    const checkSql = `
        SELECT COUNT(*) AS count FROM ApplicantTracking 
        WHERE applicantPhone = ? OR applicantEmail = ?
    `;

    db.query(checkSql, [applicantPhone, applicantEmail], (err, results) => {
      if (err) {
        console.error("Error: " + err.message);
        return res
          .status(500)
          .json({ message: "Error checking for duplicates" });
      }

      if (results[0].count > 0) {
        return res.status(400).json({ message: "duplicates not allowed" });
      }

      // If no duplicates found, insert new record
      const insertSql = `
            INSERT INTO ApplicantTracking (
                profileOwner,
                applicantName,
                applicantPhone,
                applicantEmail,
                currentCompany,
                candidateWorkLocation,
                nativeLocation,
                qualification,
                experience,
                skills,
                noticePeriod,
                expectedctc,
                currentctc,
                band,
                applicantResume,
                dateApplied,
                positionTitle,
                positionId,
                status,
                stage,
                dateOfPhoneScreen,
                interviewDate,
                dateOfOffer,
                reasonNotExtending,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
        `;

        db.query(insertSql, [
            profileOwner,
            applicantName,
            applicantPhone,
            applicantEmail,
            currentCompany,
            candidateWorkLocation,
            nativeLocation,
            qualification,
            experience,
            skills,
            noticePeriod,
            band,
            applicantResume,
            dateApplied,
            positionTitle,
            positionId,
            status,
            stage || null,
            dateOfPhoneScreen || null,
            interviewDate || null,
            dateOfOffer || null,
            reasonNotExtending || null,
            notes || null
        ], (err, result) => {
            if (err) {
                console.error('Error: ' + err.message);
                return res.status(500).json({ message: 'Error submitting form' });
            }

          res.status(200).json({ message: "Form submitted successfully" });
        }
      );
    });
  }
);



app.post('/updatePosition', authenticateToken, (req, res) => {
    const { positionTitle, positionId, description } = req.body;

  const checkSql = "SELECT * FROM OpenPositions WHERE positionId = ?";
  db.query(checkSql, [positionId], (err, results) => {
    if (err) {
      console.error("Error checking position: " + err.message);
      return res.status(500).json({ message: "Error checking position" });
    }

    if (results.length > 0) {
      // Position exists, update it
      const updateSql = `
                UPDATE OpenPositions 
                SET positionTitle = ?,
                    jobdescription = ?
                WHERE positionId = ?
            `;
      db.query(
        updateSql,
        [positionTitle, positionId, description],
        (err, result) => {
          if (err) {
            console.error("Error updating position: " + err.message);
            return res.status(500).json({ message: "Error updating position" });
          }

          res.status(200).json({ message: "Position updated successfully" });
        }
      );
    } else {
      // Position does not exist, insert new position
      const insertSql = `
                INSERT INTO OpenPositions (positionId, positionTitle,jobdescription) 
                VALUES (?, ?, ?)
            `;
      db.query(
        insertSql,
        [positionId, positionTitle, description],
        (err, result) => {
          if (err) {
            console.error("Error inserting position: " + err.message);
            return res
              .status(500)
              .json({ message: "Error inserting position" });
          }

          res.status(200).json({ message: "Position added successfully" });
        }
      );
    }
  });
});

app.get('/api/positions', authenticateToken, (req, res) => {
    const sql = 'SELECT positionId, positionTitle FROM OpenPositions';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching positions: ' + err.message);
            return res.status(500).json({ message: 'Error fetching positions' });
        }

    res.status(200).json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});