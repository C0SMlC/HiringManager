const express = require("express");
const authenticateToken = require("../middleware/auth");
const db = require("../db");

const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/submit-not-answering",
  upload.single("applicantResume"),
  async (req, res) => {
    try {
      const {
        profileOwner,
        applicantName,
        applicantPhone,
        applicantEmail,
        positionTitle,
        positionId,
      } = req.body;

      const applicantResume = req.file.buffer;

      const sqlQuery = `INSERT INTO ApplicantTracking (
        profileOwner, applicantName, applicantPhone, applicantEmail,
        currentCompany, candidateWorkLocation, nativeLocation, qualification,
        experience, skills, noticePeriod, currentctc, expectedctc, band,
        applicantResume, dateApplied, positionTitle, positionId,
        status, stage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, 'OPEN', 'Not Answering')`;

      const variables = [
        profileOwner,
        applicantName,
        applicantPhone,
        applicantEmail,
        "NA",
        "NA",
        "NA",
        "NA",
        "NA",
        "NA",
        "NA",
        0,
        0,
        "NA",
        applicantResume,
        positionTitle,
        positionId,
      ];

      db.query(sqlQuery, variables);

      res.json({
        message: "Form submitted successfully for Not Answering candidate",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      res
        .status(500)
        .json({ message: "An error occurred while submitting the form" });
    }
  }
);

router.post(
  "/submit-application",
  authenticateToken,
  upload.single("resume"),
  (req, res) => {
    const { name, email, phone, assignTo, position, positionId } = req.body;
    const resume = req.file ? req.file.buffer : null;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not Authorized" });
    }

    // Check for existing records
    const checkSql = `
        SELECT COUNT(*) AS count FROM ApplicantTracking 
        WHERE applicantPhone = ? OR applicantEmail = ?
    `;

    db.query(checkSql, [phone, email], (err, results) => {
      if (err) {
        console.error("Error: " + err.message);
        return res
          .status(500)
          .json({ message: "Error checking for duplicates" });
      }

      if (results[0].count > 0) {
        return res
          .status(400)
          .json({ message: "User with this Email Or Phone already exists!" });
      }

      // If no duplicates found, insert new record
      const sql = `
        INSERT INTO ApplicantTracking 
        (applicantName, applicantEmail, applicantPhone, profileOwner, currentCompany, candidateWorkLocation, nativeLocation, 
        qualification, experience, skills, noticePeriod, currentctc, expectedctc, band, applicantResume, dateApplied, positionTitle, 
        positionId, status, stage, dateOfPhoneScreen, interviewDate, dateOfOffer, reasonNotExtending, notes) 
        VALUES (?, ?, ?, ?, '', '', '', '', '', '', '', 0, 0, '', ?, NOW(), ?, ?, 'OPEN', 'App. Recd.', NULL, NULL, NULL, NULL, '')
      `;

      db.query(
        sql,
        [name, email, phone, assignTo, resume, position, positionId],
        (insertErr, result) => {
          if (insertErr) {
            console.error("Error inserting applicant:", insertErr);
            return res
              .status(500)
              .json({ message: "Error submitting application" });
          }
          res
            .status(200)
            .json({ message: "Application submitted successfully" });
        }
      );
    });
  }
);

// Fetch all candidates for the profile owner or all candidates if the user is an admin
router.get("/", authenticateToken, (req, res) => {
  const profileOwner = req.user.username;
  const { isgetAll, profileOwnerFilter } = req.query;

  const userRole = req.user.role;

  let sql =
    "SELECT applicantId, profileOwner, applicantName, applicantPhone, applicantEmail, currentCompany, candidateWorkLocation, nativeLocation, qualification, experience, skills, noticePeriod, currentctc, expectedctc, band, dateApplied, positionTitle, positionId, status, stage, interviewer, dateOfPhoneScreen, interviewDate, dateOfOffer, reasonNotExtending, notes FROM ApplicantTracking";
  let params = [];

  if (userRole !== "admin" && isgetAll !== "true") {
    sql += " WHERE profileOwner = ?";
    params.push(profileOwner);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error: " + err.message);
      return res.status(500).json({ message: "Error fetching candidates" });
    }

    res.json(results);
  });
});

// New endpoint for fetching resume
router.get("/:id/resume", authenticateToken, (req, res) => {
  const applicantId = req.params.id;
  const userRole = req.user.role;

  let sql =
    "SELECT applicantResume FROM ApplicantTracking WHERE applicantId = ?";
  let params = [applicantId];

  if (userRole !== "admin") {
    sql += " AND profileOwner = ?";
    params.push(req.user.username);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error: " + err.message);
      return res.status(500).json({ message: "Error fetching resume" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ applicantResume: results[0].applicantResume });
  });
});

router.get("/stats/filter", authenticateToken, (req, res) => {
  const { profileOwnerFilter } = req.query;

  let sql =
    "SELECT  applicantId, profileOwner, applicantName, applicantPhone, applicantEmail, currentCompany, candidateWorkLocation, nativeLocation, qualification, experience, skills, noticePeriod, currentctc, expectedctc, band, dateApplied, positionTitle, positionId, status, stage, interviewer, dateOfPhoneScreen, interviewDate, dateOfOffer, reasonNotExtending, notes FROM ApplicantTracking";
  let params = [];

  if (profileOwnerFilter && profileOwnerFilter != "all") {
    sql += " WHERE profileOwner = ?";
    params.push(profileOwnerFilter);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error: " + err.message);
      return res.status(500).json({ message: "Error fetching candidates" });
    }

    res.json(results);
  });
});


router.put("/:applicantId", authenticateToken, (req, res) => {
  const applicantId = req.params.applicantId;
  const {
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
    currentctc,
    expectedctc,
    band,
    dateApplied,
    positionTitle,
    positionId,
    status,
    stage,
    interviewer,
    interviewDate,
    dateOfOffer,
    reasonNotExtending,
    notes,
  } = req.body;
console.log(req.body)
  // Validate required fields
  if (!profileOwner || !applicantName) {
    return res.status(400).json({ message: "Profile Owner and Applicant Name are required." });
  }

  // Define the update query and parameters
  const updateQuery = `
    UPDATE ApplicantTracking 
    SET 
      profileOwner = ?, 
      applicantName = ?, 
      applicantPhone = ?, 
      applicantEmail = ?, 
      currentCompany = ?, 
      candidateWorkLocation = ?, 
      nativeLocation = ?, 
      qualification = ?, 
      experience = ?, 
      skills = ?, 
      noticePeriod = ?, 
      currentctc = ?, 
      expectedctc = ?, 
      band = ?, 
      dateApplied = ?, 
      positionTitle = ?, 
      positionId = ?, 
      status = ?, 
      stage = ?, 
      interviewer = ?, 
      interviewDate = ?, 
      dateOfOffer = ?, 
      reasonNotExtending = ?, 
      notes = ?
    WHERE applicantId = ?
  `;

  // Query parameters in the correct order
  const queryParams = [
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
    currentctc,
    expectedctc,
    band,
    dateApplied,
    positionTitle,
    positionId,
    status,
    stage,
    interviewer,
    interviewDate,
    dateOfOffer,
    reasonNotExtending,
    notes,
    applicantId,
  ];

  // Execute the SQL query
  db.query(updateQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Database Error: ", err);
      return res.status(500).json({ message: "Error updating candidate" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Candidate not found or no permission." });
    }
    res.json({ message: "Candidate updated successfully." });
  });
});


// router.put("/:applicantId", authenticateToken, (req, res) => {
//   const applicantId = req.params.applicantId;
//   const {
//     profileOwner,
//     applicantName,
//     applicantPhone,
//     applicantEmail,
//     currentCompany,
//     candidateWorkLocation,
//     nativeLocation,
//     qualification,
//     experience,
//     skills,
//     noticePeriod,
//     currentctc,
//     expectedctc,
//     band,
//     dateApplied,
//     positionTitle,
//     positionId,
//     status,
//     stage,
//     interviewer,
//     interviewDate,
//     dateOfOffer,
//     reasonNotExtending,
//     notes,
//   } = req.body;

//   let updateQuery = `...`; // Your SQL query

//   // Check for proper assignment and values
//   if (!profileOwner || !applicantName) {
//     return res.status(400).json({ message: "Profile Owner and Applicant Name are required." });
//   }

//   // Make sure to handle the case where there are no affected rows
//   db.query(updateQuery, queryParams, (err, result) => {
//     if (err) {
//       console.error("Database Error: ", err);
//       return res.status(500).json({ message: "Error updating candidate" });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Candidate not found or no permission." });
//     }
//     res.json({ message: ".-" });
//   });
// });



// Fetch all positions with job descriptions
router.get("/positions", authenticateToken, (req, res) => {
  const sql = "SELECT * FROM OpenPositions";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching positions: " + err.message);
      return res.status(500).json({ message: "Error fetching positions" });
    }
    res.status(200).json(results);
  });
});

router.post("/duplicate", authenticateToken, (req, res) => {
  const { applicantEmail, applicantPhone } = req.body;

  // Check for existing records
  const checkSql = `
        SELECT COUNT(*) AS count FROM ApplicantTracking 
        WHERE applicantPhone = ? OR applicantEmail = ?
    `;

  db.query(checkSql, [applicantPhone, applicantEmail], (err, results) => {
    if (err) {
      console.error("Error: " + err.message);
      return res.status(500).json({ message: "Error checking for duplicates" });
    }

    if (results[0].count > 0) {
      return res
        .status(400)
        .json({ message: "User with this Email Or Phone already exists!" });
    }

    res.status(200).json({ message: "No duplicate found" });
  });
});

module.exports = router;
