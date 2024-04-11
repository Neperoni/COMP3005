// Function to fetch user's schedule
function fetchUserSchedule() {
    fetch('/fetch_user_bookings')
        .then(response => response.json())
        .then(data => {
            const userBookings = data.bookings;
            const availableSessions = data.available;
            displayBookings(userBookings, availableSessions);
        })
        .catch(error => {
            console.error('Error fetching user schedule:', error);
        });
}

// Function to display bookings
function displayBookings(userBookings, availableSessions) {
    const publicFitnessClassTableBody = document.getElementById("publicFitnessClassTableBody");
    const myScheduleTableBody = document.getElementById("myScheduleTableBody");

    publicFitnessClassTableBody.innerHTML = ""; // Clear previous content
    myScheduleTableBody.innerHTML = ""; // Clear previous content

    // Display available public sessions
    availableSessions.forEach(session => {
        const row = createPublicRow(session);
        publicFitnessClassTableBody.appendChild(row);
    });

    // Display user's booked sessions
    userBookings.forEach(booking => {
        let row = createScheduleRow(booking);
        if(booking.public){
            row.innerHTML = `<td>Public</td>${row.innerHTML}<td><button onclick="leaveSession(${booking.bookingid})">Leave</button></td>`;
        }
        else{
            row.innerHTML = '<td>Private</td>' + row.innerHTML
        }
            myScheduleTableBody.appendChild(row);
    });
}
// Function to create a table row for a public booking
function createPublicRow(booking) {
    const row = document.createElement("tr");
    // Parse the booking day to format it as YYYY-MM-DD
    const formattedDay = new Date(booking.day).toISOString().split('T')[0];
    row.innerHTML = `
        <td>${formattedDay}</td>
        <td>${booking.start_time}</td>
        <td>${booking.end_time}</td>
        <td>${booking.name}</td>
        <td>${booking.description}</td>
        <td>${booking.seats_filled}/${booking.seats}</td>
        <td>${booking.room}</td>
        <td>${booking.trainername}</td>
        <td>
            <button onclick="joinSession(${booking.bookingid})">Join</button>
        </td>
    `;
    return row;
}

// Function to create a table row for a private booking
function createScheduleRow(booking) {
    const row = document.createElement("tr");
    // Parse the booking day to format it as YYYY-MM-DD
    const formattedDay = new Date(booking.day).toISOString().split('T')[0];
    row.innerHTML = `
    <td>${formattedDay}</td>
    <td>${booking.start_time}</td>
    <td>${booking.end_time}</td>
    <td>${booking.name}</td>
    <td>${booking.description}</td>
    <td>${booking.room}</td>
    <td>${booking.trainername}</td>

`;
    return row;
}

// Function to join a public fitness class session
function joinSession(bookingID) {
    fetch('/join_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingID: bookingID })
    })
    .then(response => {
        if (response.ok) {
            fetchUserSchedule();
        } else {
            throw new Error('Failed to join session');
        }
    })
    .catch(error => {
        console.error('Error joining session:', error);
    });
}

// Function to leave a public fitness class session
function leaveSession(bookingID) {
    fetch('/leave_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingID: bookingID })
    })
    .then(response => {
        if (response.ok) {
            fetchUserSchedule();
        } else {
            throw new Error('Failed to leave session');
        }
    })
    .catch(error => {
        console.error('Error leaving session:', error);
    });
}

// Call function to fetch user's schedule when the page loads
document.addEventListener("DOMContentLoaded", function() {
    fetchUserSchedule();
});
