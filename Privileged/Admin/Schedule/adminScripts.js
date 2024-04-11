
// Function to display trainer availabilities
function displayTrainerAvailabilities(availabilities) {
    const availabilityTableBody = document.getElementById("availabilityTableBody");
    availabilityTableBody.innerHTML = ""; // Clear previous content

    // Iterate over the availabilities and create table rows
    availabilities.forEach(availability => {
        const row = createAvailabilityRow(availability);
        availabilityTableBody.appendChild(row);
    });
}

function book(name, start_time, end_time) {
    const sessionDate = document.getElementById("sessionDate").value;
    const sessionName = document.getElementById("sessionName").value;
    const sessionDescription = document.getElementById("sessionDescription").value;

    const formData = {
        name: sessionName,
        description: sessionDescription,
        start_time: start_time,
        end_time: end_time,
        date: sessionDate
    };

    fetch('/create_session_member', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle success response
        console.log('Session created:', data);
        // You can do something after the session is created, like updating the UI
    })
    .catch(error => {
        // Handle error
        console.error('Error creating session:', error);
    });
}

// Function to create a table row for trainer availability
function createAvailabilityRow(availability) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${availability.name}</td>
        <td>${availability.start_time}</td>
        <td>${availability.end_time}</td>
        <td>
            <button onclick="book('${availability.name}', '${availability.start_time}', '${availability.end_time}')">Book</button>
        </td>
    `;
    return row;
}

document.getElementById("scheduleForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Get the values from the form
    const sessionDate = document.getElementById("sessionDate").value;

    // Make a request to the server
    fetch('/fetch_trainer_availabilities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: sessionDate })
    })
    .then(response => response.json())
    .then(data => {
        // Process the response data
        displayTrainerAvailabilities(data.availabilities);
    })
    .catch(error => {
        console.error('Error fetching trainer availabilities:', error);
    });
});