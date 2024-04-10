const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const bodyParser = require('body-parser');
const { Client, Pool } = require('pg');
const { access } = require('fs');
const { start } = require('repl');

const app = express();

const secretKey = crypto.randomBytes(32).toString('hex');

const AccountTypes = {
  MEMBER: 0,
  TRAINER: 1,
  ADMIN: 2
};

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

const port = 3003;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: '3005Final',
  password: 'alex3689',
  port: 5432,
});

client.connect().then(() => {
  console.log('Connected to PostgreSQL database');
})
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
  });


// Serve static files from the "Public" directory
app.use(express.static('Public'));

app.use('/Privileged/member', requireLogin(AccountTypes.MEMBER), express.static(path.join(__dirname, 'privileged/member')));

app.use('/Privileged/trainer', requireLogin(AccountTypes.TRAINER), express.static(path.join(__dirname, 'privileged/trainer')));

app.use('/Privileged/admin', requireLogin(AccountTypes.ADMIN), express.static(path.join(__dirname, 'privileged/admin')));

app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`login request: ${email} ${password}`);

  if (!(email && password)) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Execute SQL query to check email and password
    const result = await client.query('SELECT accountType FROM Users WHERE email = $1 AND password = $2', [email, password]);

    // Check if the user exists
    if (result.rows.length === 0) {
      console.log("Login rejected")
      return res.status(400).json({ error: 'Incorrect email or password' });
    }

    // Extract accountType from the result
    const accountType = Number(result.rows[0].accounttype);

    // Set user session data
    req.session.user = {
      email: email,
      accountType: accountType
    };

    console.log("redirect to profile")

    res.status(200).json({ accountType: accountType, message: 'Login successful. Redirecting to profile page.' });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to add a new user
app.post('/register', async (req, res) => {
  const { email, password, card, firstName, lastName } = req.body;
  try {

    console.log(`register request: ${email} ${password} ${card}`);
    //data validation
    if (!(email && password && card && firstName && lastName)) {
      return res.status(400).json({ error: 'At least one value invalid' });
    }
    if (isNaN(Number(card)) || card.length !== 16) {
      return res.status(400).json({ error: 'Card number must be a 16 digit numeric string' });
    }

    const result = await client.query('SELECT 1 FROM Members WHERE email = $1', [email]);
    // If the email already exists in the database, return an error
    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    //card is valid, password non empty, email unique

    //register user


    const emailArray = Array.from(email); // Convert string to array of characters
    const passwordArray = Array.from(password); // Convert string to array of characters
    const cardArray = Array.from(card); // Convert string to array of characters

    //apparently its better to handle transactions at the app level instead of in sQL

    try {
      // Start a transaction
      await client.query('BEGIN');

      await client.query('INSERT INTO Users (email, password, accountType) VALUES ($1, $2, $3)', [email, password, AccountTypes.MEMBER]);
      await client.query('INSERT INTO Members (email, card, firstName, lastName) VALUES ($1, $2, $3, $4)', [email, card, firstName, lastName]);

      // Commit the transaction if both insertions succeed
      await client.query('COMMIT');

      console.log('User registered successfully');
    } catch (error) {
      // If an error occurs during either insertion, rollback the transaction
      await client.query('ROLLBACK');
      console.error('Error registering user:', error);
    }

  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

function requireLogin(accountType) {
  return function (req, res, next) {
    if (req.session && req.session.user) {
      // User is logged in

      const { accountType: userAccountType } = req.session.user;

      if (userAccountType === accountType) {
        // User account type matches the required account type, proceed
        next();
      } else {
        // User account type does not match the required account type, send unauthorized response
        res.status(401).send('Unauthorized');
      }
    } else {
      // User is not logged in, redirect to login page
      res.status(401).send('Unauthorized');
    }
  };
}



//---------------------------------------------------------------MEMBER FUNCTIONS--------------------

app.get('/user_info', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
    const email = req.session.user['email'];

    console.log(`Fetching user data ${[email]}`);

    // Query database to fetch user data
    let query = `
      SELECT firstName, lastName, card, restingBPM, bloodpressure FROM Members WHERE email = $1
    `;
    let values = [email];
    let result = await client.query(query, values);

    // Query database to fetch exercise goals
    query = `
      SELECT exercise, goal FROM ExerciseGoals WHERE email = $1
    `;
    let exerciseGoalsResult = await client.query(query, values);
    let exercisegoals = exerciseGoalsResult.rows;

    // Extract user information from the query result
    const userInfo = result.rows[0]; // Assuming only one row is returned

    // Combine user information with exercise goals
    const userDataWithGoals = { ...userInfo, exercisegoals };

    res.status(200).json(userDataWithGoals);
  } catch (error) {
    console.error('Error getting data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

app.post('/update_info', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
    const {firstname, lastname, card, restingbpm, bloodpressure } = req.body;
    const email = req.session.user['email'];

    console.log(`Updating user info for ${email}`);

    // Check if exercise and goal are provided
    if (!firstname || !lastname || !card || !restingbpm || !bloodpressure || !isNumeric(card) || !isNumeric(restingbpm) || !isNumeric(bloodpressure)) {
      return res.status(400).json({ error: 'Exercise and goal are required.' });
    }
    const values = [firstname, lastname, card, restingbpm, bloodpressure, email];

    // Query to update user information
    const query = `
      UPDATE Members 
      SET firstName = $1, lastName = $2, card = $3, restingBPM = $4, bloodpressure = $5
      WHERE email = $6
    `;

    // Execute the update query
    await client.query(query, values);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to add a fitness goal to the user's profile
app.post('/add_fitness_goal', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
    const { exercise, goal } = req.body; // Assuming the client sends the exercise and goal in the request body
    
    // Check if exercise and goal are provided
    if (!exercise || !goal) {
      return res.status(400).json({ error: 'Exercise and goal are required.' });
    }
    const email = req.session.user['email'];
    const values = [email, exercise, goal];

    console.log(`Adding user goal ${[email, exercise, goal]}`);
    
    const checkQuery = `
      SELECT * FROM ExerciseGoals WHERE email = $1 AND exercise = $2 AND goal = $3;
    `;
    const checkResult = await client.query(checkQuery, values);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already exists.' });
    }

    // Insert the new fitness goal into the ExerciseGoals table
    const query = `
      INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ($1, $2, $3);
    `;
    await client.query(query, values);
    
    res.status(200).json({ success: true});

  } catch (error) {
    console.error('Error adding fitness goal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete a fitness goal from the user's profile
app.delete('/delete_fitness_goal', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
    const email = req.session.user['email'];
    const {exercise, goal} = req.body;

    if (!exercise || !goal) {
      return res.status(400).json({ error: 'Exercise and goal are required.' });
    }

    console.log(`Deleting user goal ${[email, exercise, goal]}`);

    // Delete the fitness goal from the ExerciseGoals table based on goalID
    const query = `
      DELETE FROM ExerciseGoals WHERE email = $1 AND exercise = $2 AND goal = $3
    `;
    const values = [email, exercise, goal];
    await client.query(query, values);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting fitness goal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








//trainer functions---------------------------------------------TRAINER FUNCTIONS----------------------------------------------------
app.post('/searchMembers', requireLogin(AccountTypes.TRAINER), async (req, res) => {
  const { firstName, lastName } = req.body;

  try {
    //console.log(`search request: ${firstName} ${lastName}`);
    // Query the database
    const searchResults = await client.query('SELECT firstName, lastName, email, restingbpm FROM Members WHERE firstName = $1 AND lastName = $2', [firstName, lastName])

    // Send formatted search results to the client
    res.json(searchResults.rows);
  } catch (error) {
    console.error('Error searching for members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/add_availability', requireLogin(AccountTypes.TRAINER), async (req, res) => {
  try {
    const { startTime, endTime, day } = req.body;
    const email = req.session.user['email'];

    // Validate data
    if (validateTimeSlot(startTime, endTime) == false) {
      return res.status(400).json({ error: 'Please provide valid startTime, endTime, and day.' });
    }
    const values = [email, day, startTime, endTime];
    console.log(`Adding availability: "${values}`)

    // Check if the availability already exists
    //end time is not part of the primary key
    const existingAvailability = await client.query(
      'SELECT * FROM TrainerAvailabilitys WHERE email = $1 AND day = $2 AND start_time = $3', [email, day, startTime]);
    if (existingAvailability.rows.length > 0) {
      console.log("Availability already exists")
      return res.status(400).json({ error: 'Availability already exists.' });
    }

    // Query database to insert availability
    await client.query(`INSERT INTO TrainerAvailabilitys (email, day, start_time, end_time) VALUES ($1, $2, $3, $4)`, values);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding availability:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/delete_availability', requireLogin(AccountTypes.TRAINER), async (req, res) => {
  try {
    const { start_time, end_time, day } = req.body;
    const email = req.session.user['email'];

    // Validate data
    if (validateTimeSlot(start_time, end_time) == false) {
      return res.status(400).json({ error: 'Please provide valid startTime, endTime, and day.' });
    }

    console.log(`Deleting availability: ${[day, start_time, end_time]}`)


    // Query database to insert availability
    const query = `
      DELETE FROM TrainerAvailabilitys
      WHERE email = $1 AND day = $2 AND start_time = $3 AND end_time = $4
    `;
    const values = [email, day, start_time, end_time];

    // Execute query
    await client.query(query, values);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch availabilities for a trainer
app.get('/trainer_availabilities', requireLogin(AccountTypes.TRAINER), async (req, res) => {
  try {
    // Get the logged-in trainer's email from the session
    const email = req.session.user['email'];

    // Query database to fetch availabilities for the trainer
    const query = `
      SELECT day, start_time, end_time
      FROM TrainerAvailabilitys
      WHERE email = $1
    `;
    const { rows } = await client.query(query, [email]);

    // Send the availabilities to the client
    res.json(rows);
  } catch (error) {
    console.error('Error fetching trainer availabilities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


function updateMember(cardNo, goals, bpm, bloodPressure) {
  client.query('UPDATE members SET fitnessgoals = $1, restingbpm = $2, bloodpressure = $3 WHERE card = $4', [goals, bpm, bloodPressure, cardNo])
}

//ROOM SCHEDULE
function createSchedule(memberCard, trainerID, start, end, roomNum) {
  client.query('SELECT add_schedule_entry($1, $2, $3, $4, $5);', [memberCard, roomNum, start, end, trainerID])
}

// Function to validate the time slot
function validateTimeSlot(startTime, endTime) {
  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Validate start and end times
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return false; // Invalid format
  }

  // Check if hour and minute values are within range
  if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
    endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
    return false; // Out of range
  }

  // Time slots are valid if start time is before end time
  if (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
    return true;
  } else {
    return false;
  }
}
