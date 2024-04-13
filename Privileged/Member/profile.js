


let exercise = []
let userInfo = {}

// Function to fetch user information when the page loads
async function fetchUserInfo() {
    try {
        const response = await fetch('/user_info');
        if (response.ok) {
            let {exercisegoals, ...info} = await response.json();
            exercise = exercisegoals
            userInfo = info
            DisplayInfo();
            DisplayFitness()

        } else {
            console.error('Failed to fetch user information:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching user information:', error);
    }
}

// Function to populate user information into input fields
function DisplayInfo() {
    document.getElementById('firstNameInput').value = userInfo.firstname;
    document.getElementById('lastNameInput').value = userInfo.lastname;
    document.getElementById('cardInput').value = userInfo.card;
    document.getElementById('restingBPMInput').value = userInfo.restingbpm;
    document.getElementById('bloodPressureInput').value = userInfo.bloodpressure;
}

function DisplayFitness() {
    // Populate fitness goals table
    const exercisegoalsTable = document.getElementById('exercisegoalsTable');
    const tbody = exercisegoalsTable.getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Clear existing rows
    
    exercise.forEach(goal => {
        const row = tbody.insertRow();
        const exerciseCell = row.insertCell(0);
        const goalCell = row.insertCell(1);
        const deleteCell = row.insertCell(2); // Add cell for delete button
        
        exerciseCell.textContent = goal.exercise;
        goalCell.textContent = goal.goal;
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteFitnessGoal(goal)); // Call deleteFitnessGoal function on button click
        
        // Append delete button to deleteCell
        deleteCell.appendChild(deleteButton);
    });
}

// Function to update user information when the save button is pressed
async function updateUserInfo() {
    userInfo.firstname = document.getElementById('firstNameInput').value;
    userInfo.lastname = document.getElementById('lastNameInput').value;
    userInfo.card = document.getElementById('cardInput').value;
    userInfo.restingbpm = document.getElementById('restingBPMInput').value;
    userInfo.bloodpressure = document.getElementById('bloodPressureInput').value;

    try {
        const response = await fetch('/update_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        });

        if (response.ok) {
            console.log('User information updated successfully.');
            // Optionally, update the UI or show a success message
        } else {
            console.error('Failed to update user information:', response.statusText);
            // Optionally, show an error message to the user
        }
    } catch (error) {
        console.error('Error updating user information:', error);
        // Optionally, show an error message to the user
    }
}

// Function to add a fitness goal
async function addFitnessGoal() {
    const exercise = document.getElementById('newExerciseInput').value;
    const goal = document.getElementById('newGoalInput').value;

    const fitnessGoal = {
        exercise,
        goal
    };

    try {
        const response = await fetch('/add_fitness_goal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fitnessGoal)
        });

        if (response.ok) {
            console.log('Fitness goal added successfully.');
            //DISPLAY FITNESS GOALS
            fetchUserInfo()
            DisplayFitness()

        } else {
            console.error('Failed to add fitness goal:', response.statusText);
            // Optionally, show an error message to the user
        }
    } catch (error) {
        console.error('Error adding fitness goal:', error);
        // Optionally, show an error message to the user
    }
}


// Function to delete a fitness goal
async function deleteFitnessGoal(goal) {
    try {
        const response = await fetch('/delete_fitness_goal', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goal)
        });

        if (response.ok) {
            console.log('Fitness goal deleted successfully.');
            // Remove the deleted goal from the array and update the UI
            exercise = exercise.filter(filterGoal => filterGoal.exercise !== goal.exercise && filterGoal.goal !== goal.goal);
            DisplayFitness();
        } else {
            console.error('Failed to delete fitness goal:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting fitness goal:', error);
    }
}

// Event listeners
const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', updateUserInfo);

const addGoalButton = document.getElementById('addGoalButton');
addGoalButton.addEventListener('click', addFitnessGoal);

// Fetch user information when the page loads
fetchUserInfo();
