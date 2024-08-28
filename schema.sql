
USE ApplicantTracking;
CREATE TABLE IF NOT EXISTS ApplicantTracking (
    applicantId INT AUTO_INCREMENT PRIMARY KEY,
    profileOwner VARCHAR(255) NOT NULL,
    applicantName VARCHAR(255) NOT NULL,
    applicantPhone VARCHAR(20) NOT NULL,
    applicantEmail VARCHAR(255) NOT NULL,
    currentCompany VARCHAR(255) NOT NULL,
    candidateWorkLocation VARCHAR(255) NOT NULL,
    nativeLocation VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience VARCHAR(255) NOT NULL,
    skills VARCHAR(255) NOT NULL,
    noticePeriod VARCHAR(50) NOT NULL,
    currentctc float not null,
    expectedctc float not null,
    band VARCHAR(50) NOT NULL,
    applicantResume LONGBLOB NOT NULL,
    dateApplied DATE NOT NULL,
    positionTitle VARCHAR(255) NOT NULL,
    positionId VARCHAR(50) NOT NULL,
    status ENUM('OPEN', 'CLOSED') NOT NULL,
    stage ENUM('App. Recd.', 'Not Answering', 'Joined', 'About To Join', 'Phone Screen', 'L1', 'L2_Internal','Yet to share','Shared with client', 'L1_Client','L2_Client','Final Discussion', 'HOLD', 'Buffer List', 'Rejected','Declined'),
    interviewer VARCHAR(255),
    dateOfPhoneScreen DATE,
    interviewDate DATE,
    dateOfOffer DATE,
    reasonNotExtending ENUM('Salary Negotiation', 'Relocation Issues'),
    notes TEXT
);


CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL,
    loggedInTime TIMESTAMP NULL,
    loggedOutTime TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS OpenPositions (
    positionId VARCHAR(255) PRIMARY KEY,
    positionTitle VARCHAR(255) NOT NULL,
    manager VARCHAR(255) NOT NULL,
    openPositions:INT NOT NULL,
    experienceRequired:VARCHAR(255),
    jobdescription  TEXT NOT NULL,
    status ENUM('active', 'closed', 'hold') NOT NULL
);

CREATE TABLE IF NOT EXISTS AssignedApplicants (
    assignmentId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    applicantId INT NOT NULL,
    assignedBy INT NOT NULL,
    -- assignedOn DATE NOT NULL DEFAULT CURRENT_DATE,
    applicantName VARCHAR(255) NOT NULL,
    applicantEmail VARCHAR(255) NOT NULL,
    applicantPhone VARCHAR(20) NOT NULL,
    applicantResume LONGBLOB NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(userId),
    FOREIGN KEY (applicantId) REFERENCES ApplicantTracking(applicantId),
    FOREIGN KEY (assignedBy) REFERENCES users(userId)
);
