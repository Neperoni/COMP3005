

exerciseHistoryData = []

async function updateExerciseHistory(exerciseName, date) {
    // Get the checkbox corresponding to the exercise name and date
    const checkbox = document.querySelector(`input[type="checkbox"][data-exercise="${exerciseName}"][data-date="${date}"]`);

    // Get the difficulty select corresponding to the exercise name and date
    const difficultySelect = document.querySelector(`select[data-exercise="${exerciseName}"][data-date="${date}"]`);

    // Get the checked value of the checkbox
    const isChecked = checkbox ? checkbox.checked : false;

    // Get the value of the difficulty select
    const difficultyValue = difficultySelect ? difficultySelect.value : null;

    const data = {
        exercisename: exerciseName,
        date: date,
        progress: isChecked,
        difficulty: difficultyValue
    };

    try {
        const response = await fetch('/update_exercise_history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log('Exercise history updated successfully');
        } else {
            console.error('Error updating exercise history:', responseData.error);
        }
    } catch (error) {
        console.error('Error updating exercise history:', error);
    }
}


// Function to fetch exercise data from the server
async function fetchExerciseData() {
    try {
        const response = await fetch('/fetch_exercises');
        if (!response.ok) {
            throw new Error('Failed to fetch exercise data');
        }
        exerciseHistoryData = await response.json();
        exerciseHistoryData = exerciseHistoryData.data
        displayExercises();
    } catch (error) {
        console.error('Error fetching exercise data:', error);
    }
}


// Function to display exercises and their history
function displayExercises() {
    const exerciseTable = document.querySelector("#exerciseTable");
    const exerciseTableBody = exerciseTable.querySelector("tbody");
    const exerciseTableHeader = exerciseTable.querySelector("thead tr");

    // Clear existing table body
    exerciseTableBody.innerHTML = "";

    // Clear existing headers
    exerciseTableHeader.innerHTML = '<th>Exercise Name</th><th colspan="2"></th>';

    // Generate table headers for the last 7 days from today
    const today = new Date();
    const lastSevenDays = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);
        lastSevenDays.push(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
        const formattedDate = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
        exerciseTableHeader.innerHTML += `<th>${formattedDate}</th>`;
    }

    let rowIndex = 0; // Initialize row index counter

    exerciseHistoryData.forEach(exercise => {
        const topRow = document.createElement("tr");
        const bottomRow = document.createElement("tr");

        // Exercise name in the top row spanning one column
        topRow.innerHTML = `<td colspan="2">${exercise.exercisename}</td>`;
        bottomRow.innerHTML = `<td colspan="2">${exercise.exerciseinstructions}</td>`;
        exerciseTableBody.appendChild(topRow);

        // Add "PROGRESS" and "DIFFICULTY" entries in the "PROGRESS DIFFICULTY" column
        topRow.innerHTML += '<td>PROGRESS</td>';
        bottomRow.innerHTML += '<td>DIFFICULTY</td>';

        // Populate progress and difficulty in respective cells for each day
        for (const date of lastSevenDays) {
            const dayEntry = exercise.history.find(entry => entry.date === date);
            let progressCheckbox, difficulty;
            if (dayEntry) {
                progressCheckbox = `<input type="checkbox" class="progress-checkbox" data-exercise="${exercise.exercisename}" data-date="${date}" onclick="updateExerciseHistory('${exercise.exercisename}', '${date}')" ${dayEntry.progress ? 'checked' : ''}>`;
                difficulty = `<select class="difficulty-select" data-exercise="${exercise.exercisename}" data-date="${date}" onchange="updateExerciseHistory('${exercise.exercisename}', '${date}')">${generateDifficultyOptions(dayEntry.difficulty)}</select>`;
            } else {
                progressCheckbox = `<input type="checkbox" class="progress-checkbox" data-exercise="${exercise.exercisename}" data-date="${date}" onclick="updateExerciseHistory('${exercise.exercisename}', '${date}')">`;
                difficulty = `<select class="difficulty-select" data-exercise="${exercise.exercisename}" data-date="${date}" onchange="updateExerciseHistory('${exercise.exercisename}', '${date}')">${generateDifficultyOptions(0)}</select>`;
            }
            topRow.innerHTML += `<td>${progressCheckbox}</td>`; // Add progress checkbox to the top row
            bottomRow.innerHTML += `<td>${difficulty}</td>`; // Add difficulty dropdown to the bottom row
        }
        // Add row color class based on rowIndex
        cssclass = (rowIndex % 2 === 0) ? "row1" : "row2"
        topRow.classList.add(cssclass);
        bottomRow.classList.add(cssclass);

        // Append the rows to the table body
        exerciseTableBody.appendChild(topRow);
        exerciseTableBody.appendChild(bottomRow);
        rowIndex++;

    });
}

// Function to add a new exercise
async function addNewExercise() {
    const exerciseNameInput = document.getElementById("exerciseName").value;
    const exerciseInstructionsInput = document.getElementById("exerciseInstructions").value;

    // Check if input fields are not empty
    if (!exerciseNameInput || !exerciseInstructionsInput) {
        alert("Please enter both exercise name and instructions.");
        return;
    }

    try {
        // Send a POST request to the server to add the new exercise routine
        const response = await fetch('/add_exercise_routine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exercisename: exerciseNameInput,
                exerciseinstructions: exerciseInstructionsInput
            })
        });

        // Check if the request was successful
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        // Clear input fields
        document.getElementById("exerciseName").value = "";
        document.getElementById("exerciseInstructions").value = "";

        fetchExerciseData()

        // Display success message
        alert("Exercise added successfully!");


    } catch (error) {
        console.error('Error adding new exercise routine:', error);
        // Display error message
        alert("Failed to add exercise. Please try again later.");
    }
}


// Function to generate options for difficulty dropdown
function generateDifficultyOptions(selectedValue) {
    let options = '';
    // Include option for "unspecified" if selectedValue is 0
    if (selectedValue === 0) {
        options += `<option value="0" selected>Unspecified</option>`;
    } else {
        options += `<option value="0">Unspecified</option>`;
    }
    for (let i = 1; i <= 10; i++) {
        options += `<option value="${i}" ${selectedValue == i ? 'selected' : ''}>${i}</option>`;
    }
    return options;
}

document.addEventListener("DOMContentLoaded", function () {
    const exerciseTableBody = document.querySelector("#exerciseTable tbody");




    // Fetch exercise data from the server and display it
    fetchExerciseData();
});
