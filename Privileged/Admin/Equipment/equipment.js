// Function to handle form submission for searching equipment
function searchEquipment(event) {
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
}

// Function to display equipment data
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
        const formattedDate = new Date(item.lastservice).toISOString().split('T')[0];
        row.innerHTML = `<td>${item.equipmentid}</td><td>${item.equipname}</td><td>${formattedDate}</td><td>${item.room}</td><td>${item.serviceperiod}</td><td>${item.companyname}</td><td>${item.companyemail}</td><td>${item.companyphone}</td><td>${item.servicecost}</td>`;
    });

    equipmentList.appendChild(table);
}

// Function to handle form submission for updating maintenance
function updateMaintenance(event) {
    event.preventDefault();

    const equipmentId = document.getElementById('equipmentid').value;
    const serviceDate = document.getElementById('servicedate').value;

    // Make a POST request to update maintenance
    fetch('/update_maintenance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ equipmentId, serviceDate })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Maintenance updated successfully!');
            fetchMaintenanceSchedule()
        } else {
            alert('Failed to update maintenance. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error updating maintenance:', error);
        alert('An error occurred while updating maintenance. Please try again later.');
    });
}

// Add event listener to the search form
document.getElementById('searchForm').addEventListener('submit', searchEquipment);

// Add event listener to the update form
document.getElementById('updateForm').addEventListener('submit', updateMaintenance);

// Function to fetch maintenance schedule
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
                    <th>Equipment ID</th>
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
            const formattedDate = new Date(equipment.lastservice).toISOString().split('T')[0];

            row.innerHTML = `
            <td>${equipment.equipname}</td>
            <td>${equipment.equipmentid}</td>
            <td>${formattedDate}</td>
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

document.getElementById('removeForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const removeEquipmentId = document.getElementById('removeEquipmentId').value;
  
    // Make a POST request to remove equipment
    fetch('/remove_equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ removeEquipmentId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Equipment removed successfully!');
        fetchMaintenanceSchedule();
      } else {
        alert('Failed to remove equipment. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error removing equipment:', error);
      alert('An error occurred while removing equipment. Please try again later.');
    });
  });
  
  document.addEventListener("DOMContentLoaded", function () {
    // Add event listener to the form for adding equipment
    document.getElementById('addForm').addEventListener('submit', addEquipment);
});

// Function to handle form submission for adding equipment
function addEquipment(event) {
    event.preventDefault();
  
    const equipName = document.getElementById('equipName').value;
    const lastService = document.getElementById('lastService').value;
    const room = document.getElementById('room').value;
    const servicePeriod = document.getElementById('servicePeriod').value;
    const companyName = document.getElementById('companyName').value;
    const companyEmail = document.getElementById('companyEmail').value;
    const companyPhone = document.getElementById('companyPhone').value;
    const serviceCost = document.getElementById('serviceCost').value;
  
    // Make a POST request to add equipment
    fetch('/add_equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ equipName, lastService, room, servicePeriod, companyName, companyEmail, companyPhone, serviceCost })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Equipment added successfully!');
        // Clear the form after successful addition
        document.getElementById('addForm').reset();
      } else {
        alert('Failed to add equipment. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error adding equipment:', error);
      alert('An error occurred while adding equipment. Please try again later.');
    });
}

// Add event listener to the Refresh button
document.getElementById("refreshButton").addEventListener("click", function() {
    fetchAllEquipment();
});

function fetchAllEquipment() {
    fetch('/get_all_equipment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // You can pass any necessary data in the body if needed
        body: JSON.stringify({}) // Empty body for this request
    })
    .then(response => response.json())
    .then(data => {
        displayEquipmentList(data.equipment);
    })
    .catch(error => {
        console.error('Error fetching equipment:', error);
    });
}


function displayEquipmentList(equipment) {
    const equipmentList = document.getElementById("allEquipmentList");
    equipmentList.innerHTML = "";

    if (equipment.length === 0) {
        equipmentList.innerHTML = "<p>No equipment found.</p>";
        return;
    }

    const table = document.createElement("table");
    const headerRow = table.insertRow();
    headerRow.innerHTML = "<th>Equipment ID</th><th>Name</th><th>Last Service</th><th>Room</th><th>Service Period</th><th>Company Name</th><th>Company Email</th><th>Company Phone</th><th>Service Cost</th>";

    equipment.forEach(item => {
        const row = table.insertRow();
        const formattedDate = new Date(item.lastservice).toISOString().split('T')[0];
        row.innerHTML = `<td>${item.equipmentid}</td><td>${item.equipname}</td><td>${formattedDate}</td><td>${item.room}</td><td>${item.serviceperiod}</td><td>${item.companyname}</td><td>${item.companyemail}</td><td>${item.companyphone}</td><td>${item.servicecost}</td>`;
    });

    equipmentList.appendChild(table);
}


document.addEventListener("DOMContentLoaded", function () {
    // Call the fetchMaintenanceSchedule function when the DOM content is loaded
    fetchMaintenanceSchedule();
});

