
// Fetch bookings for today's date
function fetchBookingsForToday() {
    // Get today's date in the format "YYYY-MM-DD"
    const today = new Date().toISOString().split('T')[0];
    
    // Make a request to fetch bookings for today's date
    fetch('/fetch_bookings_by_date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: today })
    })
    .then(response => response.json())
    .then(data => {
        displayTodayBookings(data.bookings);
    })
    .catch(error => {
        console.error('Error fetching bookings:', error);
        alert('Failed to fetch bookings. Please try again later.');
    });
}

// Display bookings for today in the table
function displayTodayBookings(bookings) {
    const todayBookingsTableBody = document.getElementById("todayBookingsTableBody");
    todayBookingsTableBody.innerHTML = ""; // Clear previous content

    if (bookings.length === 0) {
        const noBookingsRow = document.createElement("tr");
        noBookingsRow.innerHTML = "<td colspan='10'>No bookings for today</td>";
        todayBookingsTableBody.appendChild(noBookingsRow);
    } else {
        bookings.forEach(booking => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${booking.bookingID}</td>
                <td>${booking.start_time}</td>
                <td>${booking.end_time}</td>
                <td>${booking.room}</td>
                <td>${booking.traineremail}</td>
                <td>${booking.seats}</td>
                <td>${booking.public ? 'Yes' : 'No'}</td>
                <td>${booking.name}</td>
                <td>${booking.description}</td>
            `;
            todayBookingsTableBody.appendChild(row);
        });
    }
}

// Fetch bookings for today's date when the page loads
window.addEventListener("DOMContentLoaded", () => {
    fetchBookingsForToday();
});


// Function to fetch bookings for a specific room number
function getBookingsByRoom() {
    const roomNumber = document.getElementById("roomNumber").value;

    // Validate room number
    if (!roomNumber || isNaN(roomNumber)) {
        alert('Please enter a valid room number.');
        return;
    }

    // Make a request to fetch bookings for the specified room number
    fetch('/fetch_bookings_by_room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomnumber: roomNumber })
    })
    .then(response => response.json())
    .then(data => {
        displayRoomBookings(data.bookings);
    })
    .catch(error => {
        console.error('Error fetching room bookings:', error);
        alert('Failed to fetch room bookings. Please try again later.');
    });
}

// Function to display room bookings in the table
function displayRoomBookings(bookings) {
    const bookingTable = document.getElementById("bookingTable");
    bookingTable.innerHTML = ""; // Clear previous content

    if (bookings.length === 0) {
        bookingTable.innerHTML = "<p>No bookings for this room.</p>";
    } else {
        const table = document.createElement("table");
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Booking ID</th>
            <th>Day</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Trainer Email</th>
            <th>Seats</th>
            <th>Public</th>
            <th>Name</th>
            <th>Description</th>
        `;
        table.appendChild(headerRow);

        bookings.forEach(booking => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${booking.bookingid}</td>
                <td>${booking.day}</td>
                <td>${booking.start_time}</td>
                <td>${booking.end_time}</td>
                <td>${booking.traineremail}</td>
                <td>${booking.seats}</td>
                <td>${booking.public ? 'Yes' : 'No'}</td>
                <td>${booking.name}</td>
                <td>${booking.description}</td>
            `;
            table.appendChild(row);
        });

        bookingTable.appendChild(table);
    }
}
// Function to fetch bookings for a specific date
function searchBookingsByDate() {
    const searchDate = document.getElementById("searchDate").value;

    // Validate date
    if (!searchDate) {
        alert('Please enter a valid date.');
        return;
    }

    // Make a request to fetch bookings for the specified date
    fetch('/fetch_bookings_by_date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: searchDate })
    })
    .then(response => response.json())
    .then(data => {
        displayRoomBookings(data.bookings);
    })
    .catch(error => {
        console.error('Error fetching bookings by date:', error);
        alert('Failed to fetch bookings by date. Please try again later.');
    });
}
document.getElementById("addMemberForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission
    addMemberToBooking(event)
})
// Function to add a member to an existing booking
function addMemberToBooking(event) {
    event.preventDefault(); // Prevent form submission

    const bookingID = document.getElementById("bookingID").value;
    const memberEmail = document.getElementById("memberEmail").value;

    // Validate input
    if (!bookingID || isNaN(bookingID)) {
        alert('Please enter a valid Booking ID.');
        return;
    }

    if (!memberEmail || !validateEmail(memberEmail)) {
        alert('Please enter a valid Member Email.');
        return;
    }

    // Make a request to add the member to the existing booking
    fetch('/add_member_to_booking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingid: bookingID, memberemail: memberEmail })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Member successfully added to the booking.');
        } else {
            alert('Failed to add member to the booking. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error adding member to booking:', error);
        alert('Failed to add member to the booking. Please try again later.');
    });
}

// Function to validate email format
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function fetchParticipants() {
    const bookingID = document.getElementById("fetchParticipantBookingID").value;

    fetch('/fetch_participants_by_bookingID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingID: bookingID })
    })
    .then(response => response.json())
    .then(data => {
        displayParticipants(data.participants);
    })
    .catch(error => {
        console.error('Error fetching participants:', error);
    });
}

function displayParticipants(participants) {
    const participantsContainer = document.getElementById("participantParticipantsContainer");
    participantsContainer.innerHTML = ""; // Clear previous content

    if (participants.length === 0) {
        participantsContainer.textContent = "No participants found for this booking.";
        return;
    }

    const table = document.createElement("table");
    const tableHead = table.createTHead();
    const headRow = tableHead.insertRow();
    const headers = ["Email", "First Name", "Last Name"];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headRow.appendChild(th);
    });

    const tableBody = table.createTBody();
    participants.forEach(participant => {
        const row = tableBody.insertRow();
        Object.values(participant).forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value;
        });
    });

    participantsContainer.appendChild(table);
}

function deleteParticipant() {
    const memberEmail = document.getElementById("deleteParticipantMemberEmail").value;
    const bookingID = document.getElementById("deleteParticipantBookingID").value;

    fetch('/delete_participant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberEmail: memberEmail, bookingID: bookingID })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No participant found');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message); // Show success message
        document.getElementById("deleteParticipantMemberEmail").value = ""; // Clear input field
        document.getElementById("deleteParticipantBookingID").value = ""; // Clear input field
    })
    .catch(error => {
        console.error('Error deleting participant:', error);
        alert(error.message); // Show error message
    });
}

