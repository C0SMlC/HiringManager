const express = require("express");
const authenticateToken = require("../middleware/auth");
const db = require("../db");

const router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/submit-application', authenticateToken, upload.single('resume'), (req, res) => {
  const { name, email, phone, assignTo } = req.body;
  const resume = req.file ? req.file.buffer : null;

  if (req.user.role !== 'admin') {
    res.status(400).json({ message: 'Not Authorised' });
  }

  const sql = `
    INSERT INTO ApplicantTracking 
    (applicantName, applicantEmail, applicantPhone, profileOwner, currentCompany, candidateWorkLocation, nativeLocation, 
    qualification, experience, skills, noticePeriod, currentctc, expectedctc, band, applicantResume, dateApplied, positionTitle, 
    positionId, status, stage, dateOfPhoneScreen, interviewDate, dateOfOffer, reasonNotExtending, notes) 
    VALUES (?, ?, ?, ?, '', '', '', '', '', '', '', 0, 0, '', ?, NOW(), '', '', 'OPEN', 'App. Recd.', NULL, NULL, NULL, NULL, '')
  `;

  db.query(sql, [
    name, email, phone, assignTo, resume
  ], (err, result) => {
    if (err) {
      console.error('Error inserting applicant:', err);
      return res.status(500).json({ message: 'Error submitting application' });
    }
    res.status(200).json({ message: 'Application submitted successfully' });
  });
});


// Fetch all candidates for the profile owner or all candidates if the user is an admin
router.get("/", authenticateToken, (req, res) => {
  const profileOwner = req.user.username;

  console.log(profileOwner);

  const userRole = req.user.role;

  let sql = "SELECT * FROM ApplicantTracking";
  let params = [];

  if (userRole !== "admin") {
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

// Update a candidate's details
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
    interviewDate,
    dateOfOffer,
    reasonNotExtending,
    notes,
  } = req.body;

  let updateQuery = `
    UPDATE ApplicantTracking
    SET profileOwner = ?, 
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
        interviewDate = ?, 
        dateOfOffer = ?, 
        reasonNotExtending = ?, 
        notes = ?
    WHERE applicantId = ?
  `;

  let queryParams = [
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
    interviewDate || null,
    dateOfOffer || null,
    reasonNotExtending || null,
    notes || null,
    applicantId,
  ];

  // If the user is not an admin, add a condition to only update their own candidates
  if (req.user.role !== 'admin') {
    updateQuery += ' AND profileOwner = ?';
    queryParams.push(req.user.username);
  }

  db.query(updateQuery, queryParams, (err, result) => {
    if (err) {
      console.error("Error: " + err.message);
      return res.status(500).json({ message: "Error updating candidate" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Candidate not found or you don't have permission to update this candidate" });
    }
    res.json({ message: "Candidate updated successfully" });
  });
});

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

module.exports = router;
