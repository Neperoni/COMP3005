async function searchMembers() {
    const firstName = document.getElementById('firstInput').value;
    const lastName = document.getElementById('lastInput').value;
  
    try {
      const response = await fetch('/searchMembers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName })
      });
  
      if (response.ok) {
        const searchData = await response.json();
        displaySearchResults(searchData);
      } else {
        console.error('Failed to search for members:', response.statusText);
      }
    } catch (error) {
      console.error('Error searching for members:', error);
    }
  }
  
// Assuming 'searchResults' is an array of objects with each object representing a row in the database

function displaySearchResults(searchResults) {
    const table = document.getElementById('membersTable');
    console.log(searchResults)
    // Clear existing table rows
    table.innerHTML = '';

    // Loop through each search result and create table rows
    searchResults.forEach(result => {

        const row = document.createElement('tr');

        // Create table cells for each property
        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = result.firstname;
        row.appendChild(firstNameCell);

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = result.lastname;
        row.appendChild(lastNameCell);

        const emailCell = document.createElement('td');
        emailCell.textContent = result.email;
        row.appendChild(emailCell);

        const bpmCell = document.createElement('td');
        bpmCell.textContent = result.restingbpm;
        row.appendChild(bpmCell);

        // Append the row to the table
        table.appendChild(row);
    });
}

  