const express = require('express');
const authenticateToken = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Fetch all candidates for the profile owner or all candidates if the user is an admin
router.get('/', authenticateToken, (req, res) => {
    const profileOwner = req.user.username;
    const userRole = req.user.role;

    let sql = 'SELECT * FROM ApplicantTracking';
    let params = [];

    if (userRole !== 'admin') {
        sql += ' WHERE profileOwner = ?';
        params.push(profileOwner);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error: ' + err.message);
            return res.status(500).json({ message: 'Error fetching candidates' });
        }

        res.json(results);
    });
});

// Update a candidate's details
router.put('/:applicantId', authenticateToken, (req, res) => {
    const applicantId = req.params.applicantId;
    const { status, stage, interviewDate, dateOfOffer, reasonNotExtending, notes } = req.body;

    db.query(
        `UPDATE ApplicantTracking 
         SET status = ?, stage = ?, interviewDate = ?, dateOfOffer = ?, reasonNotExtending = ?, notes = ?
         WHERE applicantId = ? AND profileOwner = ?`,
        [status, stage, interviewDate || null, dateOfOffer || null, reasonNotExtending || null, notes || null, applicantId, req.user.username],
        (err, result) => {
            if (err) {
                console.error('Error: ' + err.message);
                return res.status(500).json({ message: 'Error updating candidate' });
            }

            res.json({ message: 'Candidate updated successfully' });
        }
    );
});


// Fetch all positions with job descriptions
router.get('/positions', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM OpenPositions';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching positions: ' + err.message);
            return res.status(500).json({ message: 'Error fetching positions' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
