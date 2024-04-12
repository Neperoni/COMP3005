// Function to display trainer bookings
function displayTrainerBookings(bookings) {
    const bookingsTableBody = document.getElementById("bookingsTableBody");
    bookingsTableBody.innerHTML = ""; // Clear previous content

    // Check if there are no bookings
    if (bookings.length === 0) {
        const noBookingsRow = document.createElement("tr");
        const noBookingsCell = document.createElement("td");
        noBookingsCell.colSpan = 3; // Span across all columns
        noBookingsCell.textContent = "No bookings for selected trainer";
        noBookingsRow.appendChild(noBookingsCell);
        bookingsTableBody.appendChild(noBookingsRow);
    } else {
        // Iterate over the bookings and create table rows
        bookings.forEach(booking => {
            const row = createBookingRow(booking);
            bookingsTableBody.appendChild(row);
        });
    }
}
// Function to create a table row for trainer availability
function createBookingRow(availability) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${availability.start_time}</td>
        <td>${availability.end_time}</td>
    `;
    return row;
}
// Function to create a table row for trainer availability
function createAvailabilityRow(availability) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${availability.name}</td>
        <td>${availability.email}</td>
        <td>${availability.start_time}</td>
        <td>${availability.end_time}</td>
        <td>
            <button onclick="searchBookings('${availability.email}')">View Bookings</button>
        </td>
    `;
    return row;
}

function searchBookings(email) {
    const sessionDate = document.getElementById("sessionDate").value;

    // Update header to show selected trainer
    const trainerHeader = document.getElementById("trainerHeader");
    trainerHeader.textContent = `Bookings for ${email}`;

    // Make a request to the server to fetch bookings for the selected trainer on the given date
    fetch('/fetch_bookings_by_trainer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: sessionDate, traineremail: email })
    })
    .then(response => response.json())
    .then(data => {
        // Process the response data
        displayTrainerBookings(data.bookings);
    })
    .catch(error => {
        console.error('Error fetching trainer bookings:', error);
    });
}


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
// Function to fetch trainer availabilities based on the selected date
function fetchTrainerAvailabilities() {
    // Get the selected date from the input field
    const sessionDate = document.getElementById("sessionDate").value;

    // Make a request to the server to fetch trainer availabilities
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

    //fetch room bookings
    fetch('/fetch_bookings_by_date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: sessionDate })
    })
    .then(response => response.json())
    .then(data => {
        // Process the response data
        updateRoomTable(data.bookings);
    })
    .catch(error => {
        console.error('Error fetching trainer availabilities:', error);
    });

}

function addMemberToBooking(bookingID, memberEmail) {
    fetch('/add_member_to_booking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingID, memberEmail })
    })
    .then(response => response.json())
    .then(data => {
        // Handle success response
        console.log('Member added to booking:', data);
        // You can do something after the member is added, like updating the UI
    })
    .catch(error => {
        // Handle error
        console.error('Error adding member to booking:', error);
    });
}
function updateRoomTable(bookings) {
    const roomTableBody = document.querySelector("#roomTable tbody");
    roomTableBody.innerHTML = ""; // Clear previous content

    if (bookings.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = "<td colspan='3'>No room bookings on given date</td>";
        roomTableBody.appendChild(emptyRow);
    } else {
        bookings.forEach(booking => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${booking.room}</td>
                <td>${booking.start_time}</td>
                <td>${booking.end_time}</td>
            `;
            roomTableBody.appendChild(row);
        });
    }
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

document.getElementById("createBookingForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Get form data
    const formData = {
        date: document.getElementById("day").value,
        start_time: document.getElementById("start_time").value,
        end_time: document.getElementById("end_time").value,
        room: document.getElementById("room").value,
        traineremail: document.getElementById("traineremail").value,
        seats: document.getElementById("seats").value,
        public: document.getElementById("public").value === "true",
        name: document.getElementById("name").value,
        description: document.getElementById("description").value
    };

    // Make a request to the server to create a new booking
    fetch('/create_booking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            // Notify user that the booking was created successfully
            alert("New session added");
            // Clear form inputs
            document.getElementById("createBookingForm").reset();
        } else {
            // Notify user that there was an error creating the booking
            alert("Failed to add session");
        }
    })
    .catch(error => {
        console.error('Error creating booking:', error);
        // Notify user that there was an error creating the booking
        alert("Failed to add session");
    });
});

function deleteBooking() {
    const bookingID = document.getElementById("bookingID").value;

    fetch('/delete_booking_by_id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingID: bookingID })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Show success message
        document.getElementById("bookingID").value = ""; // Clear input field
    })
    .catch(error => {
        console.error('Error deleting session:', error);
        alert('Failed to delete session. Please try again.'); // Show error message
    });
}