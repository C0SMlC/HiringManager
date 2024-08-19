      const role = localStorage.getItem('role');
      
      const masterCandidatesLink = document.getElementById('masterCandidatesLink');
      const assignApplicantLink = document.getElementById('assignApplicantLink');

      if (role === 'admin') {
        if (masterCandidatesLink) masterCandidatesLink.style.display = 'inline';
        if (assignApplicantLink) assignApplicantLink.style.display = 'inline';
      } else{
        // if (masterCandidatesLink) masterCandidatesLink.style.display = 'none';
        if (assignApplicantLink) assignApplicantLink.style.display = 'none';
      }