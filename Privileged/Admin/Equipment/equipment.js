document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const roomNumber = document.getElementById("roomNumber").value;

    // Make a POST request to fetch equipment by room
    fetch('/fetch_equipment_by_room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomNumber })
    })
    .then(response => response.json())
    .then(data => {
        displayEquipment(data.equipment);
    })
    .catch(error => {
        console.error('Error fetching equipment:', error);
    });
});

function displayEquipment(equipment) {
    const equipmentList = document.getElementById("equipmentList");
    equipmentList.innerHTML = "";

    if (equipment.length === 0) {
        equipmentList.innerHTML = "<p>No equipment found for this room.</p>";
        return;
    }

    const table = document.createElement("table");
    const headerRow = table.insertRow();
    headerRow.innerHTML = "<th>Equipment ID</th><th>Name</th><th>Last Service</th><th>Room</th><th>Service Period</th><th>Company Name</th><th>Company Email</th><th>Company Phone</th><th>Service Cost</th>";

    equipment.forEach(item => {
        const row = table.insertRow();
        row.innerHTML = `<td>${item.equipmentid}</td><td>${item.equipname}</td><td>${item.lastservice}</td><td>${item.room}</td><td>${item.serviceperiod}</td><td>${item.companyname}</td><td>${item.companyemail}</td><td>${item.companyphone}</td><td>${item.servicecost}</td>`;
    });

    equipmentList.appendChild(table);
}
// Function to fetch equipment needing service within the next 60 days
function fetchMaintenanceSchedule() {
    fetch('/fetch_equipment_for_service')
        .then(response => response.json())
        .then(data => {
            const equipments = data.equipments;
            displayMaintenanceSchedule(equipments);
        })
        .catch(error => {
            console.error('Error fetching maintenance schedule:', error);
        });
}

// Function to display maintenance schedule
function displayMaintenanceSchedule(equipments) {
    const maintenanceList = document.getElementById("maintenanceList");

    // Clear previous content
    maintenanceList.innerHTML = "";

    // Check if there are any equipments needing service
    if (equipments.length === 0) {
        maintenanceList.innerHTML = "<p>No equipment needs service within the next 60 days.</p>";
    } else {
        // Create a table to display equipment data
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Equipment Name</th>
                    <th>Last Service</th>
                    <th>Service Period</th>
                    <th>Room</th>
                    <th>Company Name</th>
                    <th>Company Email</th>
                    <th>Company Phone</th>
                    <th>Service Cost</th>
                </tr>
            </thead>
            <tbody id="maintenanceTableBody">
                <!-- Equipment rows will be dynamically inserted here -->
            </tbody>
        `;

        const tbody = table.querySelector("#maintenanceTableBody");

        // Loop through equipments and create a row for each
        equipments.forEach(equipment => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${equipment.equipname}</td>
            <td>${equipment.lastservice}</td>
            <td>${equipment.serviceperiod}</td>
            <td>${equipment.room}</td>
            <td>${equipment.companyname}</td>
            <td>${equipment.companyemail}</td>
            <td>${equipment.companyphone}</td>
            <td>${equipment.servicecost}</td> 
            `;
            tbody.appendChild(row);
        });

        // Append the table to the maintenance list container
        maintenanceList.appendChild(table);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Call the fetchMaintenanceSchedule function when the DOM content is loaded
    fetchMaintenanceSchedule();
});
