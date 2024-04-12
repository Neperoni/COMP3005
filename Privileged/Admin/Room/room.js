// Function to retrieve bookings based on room number
function getBookings() {
    const roomNumber = document.getElementById("roomNumber").value;

    // Make a POST request to the server
    fetch('/fetch_bookings_by_room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomNumber: roomNumber })
    })
    .then(response => response.json())
    .then(data => {
        // Call function to generate table
        displayBookings(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to display bookings in a table
function displayBookings(data) {
    const bookings = data.bookings;
    const tableDiv = document.getElementById("bookingTable");
    
    // Clear previous content
    tableDiv.innerHTML = "";

    // Create table element
    const table = document.createElement("table");

    // Create table header
    const headerRow = table.insertRow();
    for (const key in bookings[0]) {
        const headerCell = document.createElement("th");
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }

    // Create table body
    bookings.forEach(booking => {
        const row = table.insertRow();
        for (const key in booking) {
            const cell = row.insertCell();
            cell.textContent = booking[key];
        }
    });

    // Append table to div
    tableDiv.appendChild(table);
}
