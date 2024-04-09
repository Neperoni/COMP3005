




let availabilities = []

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

//TRAINER SCHEDULE
//TRAINER SCHEDULE
async function addTimeSlot() {
  const startTime = document.getElementById('startTimeInput').value;
  const endTime = document.getElementById('endTimeInput').value;
  const day = document.getElementById('dayInput').value;

  // Validate the time slot
  if (validateTimeSlot(startTime, endTime)) {
    try {
      const response = await fetch('/add_availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startTime, endTime, day })
      });

      if (response.ok) {
        availabilities.push({ "day": day, "start_time": startTime, "end_time": endTime });
        
        
        
        displayAvailabilities();
      } else {
        console.error('Failed to add availability:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding availability:', error);
    }
  } else {
    alert('Please follow the correct formatting, start time must come before end time');
  }
}
// Function to delete an availability slot
async function deleteTimeSlot(index) {
  const availability = availabilities[index];
  try {
    const response = await fetch('/delete_availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(availability)
    });

    if (response.ok) {
      availabilities.splice(index, 1);
      displayAvailabilities(availabilities); // Update display after deleting
    } else {
      console.error('Failed to delete availability:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting availability:', error);
  }
}

// Function to refresh trainer availabilities
async function refreshAvailabilities() {
  try {
    const response = await fetch('/trainer_availabilities');
     availabilities = await response.json(); // Change variable name to avoid conflict
    
    // Call function to display updated availabilities on the UI
    displayAvailabilities();
  } catch (error) {
    console.error('Error fetching trainer availabilities:', error);
    // Handle error (e.g., display an error message to the user)
  }
}
// Event listener for refresh button
const refreshButton = document.getElementById('refreshButton');
refreshButton.addEventListener('click', refreshAvailabilities);

async function fetchTrainerAvailabilities() {
  try {
    const response = await fetch('/trainer_availabilities');
    const availabilities = await response.json();

    // Call function to display availabilities on the UI
    displayTrainerAvailabilities(availabilities);
  } catch (error) {
    console.error('Error fetching trainer availabilities:', error);
    // Handle error (e.g., display an error message to the user)
  }
}

// Function to display trainer availabilities on the UI
function displayAvailabilities() {
  const tableBody = document.getElementById('availabilityBody');
  
  // Clear existing table rows
  tableBody.innerHTML = '';

  // Array of day names
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Sort the availabilities by date, start time, and end time
  availabilities.sort((a, b) => {
    // Sort by date
    if (a.day < b.day) return -1;
    if (a.day > b.day) return 1;
    
    // Sort by start time within the same date
    if (a.start_time < b.start_time) return -1;
    if (a.start_time > b.start_time) return 1;
    
    // Sort by end time within the same date and start time
    if (a.end_time < b.end_time) return -1;
    if (a.end_time > b.end_time) return 1;
    
    return 0;
  });


  // Loop through each availability and create table rows
  availabilities.forEach((availability, index) => {
    const row = document.createElement('tr');

    // Truncate time information
    const startTime = availability.start_time.split(':').slice(0, 2).join(':');
    const endTime = availability.end_time.split(':').slice(0, 2).join(':');

    
    // Create table cells for each property
    const dayCell = document.createElement('td');
    dayCell.textContent = daysOfWeek[availability.day];
    row.appendChild(dayCell);

    const startTimeCell = document.createElement('td');
    startTimeCell.textContent = startTime;
    row.appendChild(startTimeCell);

    const endTimeCell = document.createElement('td');
    endTimeCell.textContent = endTime;
    row.appendChild(endTimeCell);

    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTimeSlot(index)); // Pass the index parameter
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    // Append the row to the table body
    tableBody.appendChild(row);
  });
}

// Function to validate the time slot
function validateTimeSlot(startTime, endTime) {
  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Validate start and end times
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return false; // Invalid format
  }

  // Check if hour and minute values are within range
  if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
      endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
    return false; // Out of range
  }

  // Time slots are valid if start time is before end time
  if (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
    return true;
  } else {
    return false;
  }
}
