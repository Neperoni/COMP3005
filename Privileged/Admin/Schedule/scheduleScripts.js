// scheduleScripts.js
// Define list of trainers
const trainersList = [];

// Function to get availabilities
document.getElementById('viewAvailabilities').addEventListener('click', async function() {
  const date = document.getElementById('date').value;
  const availabilities = await fetchAvailabilities(date);
  console.log('Availabilities:', availabilities);
  createTrainerColumns(availabilities);
});

// Function to fetch availabilities
async function fetchAvailabilities(date) {
    const response = await fetch('/fetch_trainer_availabilities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: date })
    });
    const data = await response.json();
    return data.availabilities;
  }

// Function to create and append trainer columns
function createTrainerColumns(availabilities) {
  const trainersContainer = document.querySelector('.trainers');
  availabilities.forEach(availability => {
    const trainerName = availability.name;
    const startTime = availability.start_time;
    const endTime = availability.end_time;
    
    // Check if trainer already exists in list
    let trainerIndex = trainersList.indexOf(trainerName);
    
    // If trainer doesn't exist, add to list and create column
    if (trainerIndex === -1) {
      trainersList.push(trainerName);
      const trainerColumn = document.createElement('div');
      trainerColumn.classList.add('trainer-column');
      trainerColumn.innerHTML = `<h3>${trainerName}</h3>`;
      trainersContainer.appendChild(trainerColumn);
      trainerIndex = trainersList.length - 1;
    }
    
    // Add availability to trainer column
    const trainerColumn = trainersContainer.querySelector(`.trainer-column:nth-child(${trainerIndex + 1})`);
    const availabilityDiv = document.createElement('div');
    availabilityDiv.classList.add('availability');
    availabilityDiv.textContent = `${startTime} - ${endTime}`;
    trainerColumn.appendChild(availabilityDiv);
  });
}

