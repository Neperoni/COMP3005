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


//#################WEB SERVER PORT  

const port = 3003;

//###############################################################POSTGRESQL SERVER LOGIN CREDENTIALS##################################################

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: '3005Final',
  password: 'alex3689',
  port: 5432,
});

//###############################################################POSTGRESQL SERVER LOGIN CREDENTIALS##################################################

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

//EXERCISE ROUTINES

/*
const exerciseHistoryData = [
  { 
    name: "Glute Ridge",
    instructions: "REPS: 5, SETS:3, lift body straight",
    history: [
      { day: 1, progress: 2, difficulty: 5 },
      { day: 2, progress: 3, difficulty: 4 },
      { day: 3, progress: 4, difficulty: 3 },
      { day: 4, progress: 5, difficulty: 2 },
      { day: 5, progress: 3, difficulty: 4 },
      { day: 6, progress: 4, difficulty: 3 },
      { day: 7, progress: 5, difficulty: 2 }
    ]
  }
  // Add more exercise history data as needed
];
*/

app.get('/fetch_exercises', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
    const email = req.session.user['email'];
    console.log(`Fetching exercises for user ${email}`);

    const getExercisesQuery = `
      SELECT exercisename, exerciseinstructions FROM ExerciseRoutine WHERE email = $1;
    `;
    const exerciseResult = await client.query(getExercisesQuery, [email]);

    const allData = [];

    for (const row of exerciseResult.rows) {
      const entry = {
        exercisename: row.exercisename,
        exerciseinstructions: row.exerciseinstructions,
        history: []
      };

      const getHistoryQuery = 'SELECT date, progress, difficulty FROM ExerciseHistory WHERE email = $1 AND exercisename = $2';
      const historyResult = await client.query(getHistoryQuery, [email, row.exercisename]);

      entry.history = historyResult.rows;
      allData.push(entry);
    }

    res.status(200).json({"data":allData});

  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/update_exercise_history', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
    const {exercisename, date, progress, difficulty } = req.body;
    const email = req.session.user['email'];
    console.log(`Updating exercise history for user ${email}, exercise ${exercisename}, date ${date}`);

    
    if (!exercisename || !date || !progress || !difficulty) {
      return res.status(400).json({ error: 'exercisename, day, progress, difficulty required.' });
    }

    const updateHistoryQuery = `
      INSERT INTO ExerciseHistory (email, exercisename, date, progress, difficulty)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email, exercisename, date) DO UPDATE
      SET progress = $4, difficulty = $5;
    `;

    const values = [email, exercisename, date, progress, difficulty];

    await client.query(updateHistoryQuery, values);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error updating exercise history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to add a new exercise routine
app.post('/add_exercise_routine', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
      const { exercisename, exerciseinstructions } = req.body;
      const email = req.session.user['email'];

      // Check if required values are present
      if (!exercisename || !exerciseinstructions) {
          return res.status(400).json({ error: 'Exercise name, exercise instructions, and email are required.' });
      }

      console.log(`Adding new exercise routine for user ${email}, exercise ${exercisename}`);

      // Check if the exercise routine already exists for the user
      const checkExistenceQuery = `
          SELECT * FROM ExerciseRoutine
          WHERE email = $1 AND exercisename = $2;
      `;
      const checkExistenceValues = [email, exercisename];
      const existingRoutine = await client.query(checkExistenceQuery, checkExistenceValues);

      if (existingRoutine.rows.length > 0) {
          return res.status(400).json({ error: 'Exercise routine already exists for this user.' });
      }

      // Insert the new exercise routine into the database
      const insertQuery = `
          INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions)
          VALUES ($1, $2, $3);
      `;
      const insertValues = [email, exercisename, exerciseinstructions];
      await client.query(insertQuery, insertValues);

      res.status(200).json({ success: true });

  } catch (error) {
      console.error('Error adding new exercise routine:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete an exercise routine
app.post('/delete_exercise_routine', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
      const { exercisename } = req.body;
      const email = req.session.user['email'];


      // Check if required values are present
      if (!exercisename || !email) {
          return res.status(400).json({ error: 'Exercise name and email are required.' });
      }
      
      console.log(`Deleting exercise routine for user ${email}, exercise ${exercisename}`);

      // Delete the exercise routine from the database
      const deleteQuery = `
          DELETE FROM ExerciseRoutine
          WHERE email = $1 AND exercisename = $2;
      `;

      const deleteValues = [email, exercisename];
      await client.query(deleteQuery, deleteValues);

      res.status(200).json({ success: true });

  } catch (error) {
      console.error('Error deleting exercise routine:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


//------------------------member schedule
// Endpoint to leave a session
app.post('/leave_session', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
      const email = req.session.user['email'];
      const { bookingID } = req.body;
      if (!email || !bookingID) {
          return res.status(400).json({ error: 'Invalid email or bookingID.' });
      }

      // Delete the user's entry from the Participants table only if they are enrolled in the session
      const leaveSessionQuery = `
          DELETE FROM Participants
          WHERE bookingID = $1 AND memberemail = $2;
      `;
      const result = await client.query(leaveSessionQuery, [bookingID, email]);
      if (result.rowCount === 0) {
          return res.status(400).json({ error: 'User is not enrolled in this session.' });
      }

      res.status(200).json({ success: true });
  } catch (error) {
      console.error('Error leaving session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to join a session
app.post('/join_session', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
      const email = req.session.user['email'];
      const { bookingID } = req.body;
      if (!email || !bookingID) {
          throw new Error('Invalid email or bookingID.');
      }

      // Attempt to insert the user's entry into the Participants table
      const joinSessionQuery = `
          INSERT INTO Participants (bookingID, memberemail)
          VALUES ($1, $2);
      `;
      await client.query(joinSessionQuery, [bookingID, email]);
      res.status(200).json({ success: true });
  } catch (error) {
      // Check if the error indicates that the session is already booked
      if (error.code === '23505' && error.constraint === 'participants_pkey') {
          console.error('Session already booked by the user:', error);
          res.status(400).json({ error: 'Session already booked by the user' });
      } else {
          console.error('Error joining session:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  }
});

// Endpoint to fetch user's bookings
app.get('/fetch_user_bookings', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
      const email = req.session.user['email'];
      if (!email) {
          return res.status(400).json({ error: 'Invalid user email.' });
      }

      //return all bookings the user is a participant in
      const userBookingsQuery = `
      SELECT b.bookingID, b.name, b.description, b.day, b.start_time, b.end_time, b.room, t.name AS trainername, b.public
      FROM Booking b
      JOIN Participants p ON b.bookingID = p.bookingID
      JOIN Trainers t ON b.traineremail = t.email
      WHERE p.memberemail = $1;      
      `;
      const userBookings = await client.query(userBookingsQuery, [email]);

      //select all bookings that are public, are not enrolled by the user, and are not fully booked
      const availablePublicSessionsQuery = `
      SELECT b.bookingID, b.name, b.description, b.day, b.start_time, b.end_time, b.room, b.seats, t.name AS trainername, COUNT(p.memberemail) AS seats_filled
      FROM BOOKING b
      JOIN TRAINERS t ON b.traineremail = t.email
      LEFT JOIN PARTICIPANTS p ON b.bookingID = p.bookingID
      WHERE b.public = TRUE
      AND b.bookingID NOT IN (
          SELECT bookingID
          FROM PARTICIPANTS
          WHERE memberemail = $1
      )
      GROUP BY b.bookingID, b.name, b.description, b.day, b.start_time, b.end_time, b.room, b.seats, t.name
      HAVING COUNT(p.memberemail) < b.seats;
      `;

      const availableSessions = await client.query(availablePublicSessionsQuery, [email])

      res.status(200).json({ bookings: userBookings.rows , available: availableSessions.rows});
  } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Endpoint to create a session for a member
app.post('/create_session_member', requireLogin(AccountTypes.MEMBER), async (req, res) => {
  try {
      const { trainername, description, start_time, end_time, date } = req.body;
      const memberEmail = req.session.user.email;

      // Validate data
      if (!trainername || !description || !start_time || !end_time || !date) {
          return res.status(400).json({ error: 'Please provide valid name, description, start time, end time, and date.' });
      }

      // Check if the session already exists
      // You can add your own logic here if necessary

      // Insert the session into the database
      const insertQuery = `
          INSERT INTO Sessions (trainer_name, member_email, session_date, start_time, end_time, description)
          VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const values = [name, memberEmail, date, start_time, end_time, description];
      await client.query(insertQuery, values);

      res.status(200).json({ success: true });
  } catch (error) {
      console.error('Error creating session for member:', error);
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


//--------------------------------------------------ADMIN FUNCTIONS

// Endpoint to fetch bookings for a specific room
app.post('/fetch_bookings_by_room', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { roomnumber } = req.body;

    // Validate data
    if (!roomnumber || isNaN(roomnumber)) {
      return res.status(400).json({ error: 'Please provide a valid numeric room number.' });
    }

    // Query database to fetch bookings for the specified room
    const query = `
    SELECT *
    FROM Booking
    WHERE room = $1;    
    `;

    const values = [roomnumber];
    const bookings = await client.query(query, values);

    res.status(200).json({ bookings: bookings.rows });
  } catch (error) {
    console.error('Error fetching bookings by room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Endpoint to fetch bookings for a specific room
app.post('/fetch_bookings_by_trainer_date', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { traineremail, date } = req.body;

    // Validate data
    if (!traineremail || !date) {
      return res.status(400).json({ error: 'Please provide a valid numeric room number.' });
    }

    // Query database to fetch bookings for the specified room
    const query = `
    SELECT *
    FROM Booking
    WHERE traineremail = $1 AND day = $2;    
    `;

    const values = [traineremail, date];
    const bookings = await client.query(query, values);

    res.status(200).json({ bookings: bookings.rows });
  } catch (error) {
    console.error('Error fetching bookings by traineremail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch bookings for a specific room
app.post('/fetch_bookings_by_trainer', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { traineremail } = req.body;

    // Validate data
    if (!traineremail) {
      return res.status(400).json({ error: 'Please provide a valid numeric room number.' });
    }

    // Query database to fetch bookings for the specified room
    const query = `
    SELECT *
    FROM Booking
    WHERE traineremail = $1;    
    `;

    const values = [traineremail];
    const bookings = await client.query(query, values);

    res.status(200).json({ bookings: bookings.rows });
  } catch (error) {
    console.error('Error fetching bookings by traineremail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/create_booking', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { date, start_time, end_time, room, traineremail, seats, public, name, description } = req.body;

    // Validate data
    if (!date || !start_time || !end_time || !room || isNaN(room) || !traineremail || !seats || isNaN(seats) || public === undefined || public === null || !name || !description) {
      return res.status(400).json({ error: 'Please provide all required fields with valid values.' });
    }

    const parsedDate = new Date(date + "T00:00:00");

    // Check if the parsing was successful
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please provide a valid date.' });
    }

    const dayOfWeek = parsedDate.getDay();

    // Check trainer availability
    const availabilityQuery = `
      SELECT * FROM TrainerAvailabilitys 
      WHERE email = $1 AND day = $2 
      AND start_time <= $3 AND end_time >= $4;
    `;

    const availabilityValues = [traineremail, dayOfWeek, start_time, end_time];
    const availabilityResult = await client.query(availabilityQuery, availabilityValues);

    if (availabilityResult.rows.length === 0) {
      return res.status(400).json({ error: 'Trainer is not available at the specified time.' });
    }

    // Query database to insert the new booking
    const bookingQuery = `
      INSERT INTO Booking (day, start_time, end_time, room, traineremail, seats, public, name, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const bookingValues = [date, start_time, end_time, room, traineremail, seats, public, name, description];
    const newBooking = await client.query(bookingQuery, bookingValues);

    res.status(200).json({ booking: newBooking.rows[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/add_member_to_booking', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { bookingid, memberemail } = req.body;

    // Validate input
    if (!bookingid || !memberemail) {
      return res.status(400).json({ error: 'Please provide all required fields with valid values.' });
    }

    // Query database to add member to the booking
    const query = `
      INSERT INTO Participants (bookingID, memberemail)
      VALUES ($1, $2);
    `;

    const values = [bookingid, memberemail];
    await client.query(query, values);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding member to booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/fetch_participants_by_bookingID', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { bookingID } = req.body;

    // Validate input
    if (!bookingID || isNaN(bookingID)) {
      return res.status(400).json({ error: 'Please provide a valid Booking ID.' });
    }

    // Query database to fetch participants and their names for the specified bookingID
    const query = `
      SELECT p.memberemail, m.firstname, m.lastname
      FROM Participants p
      JOIN Members m ON p.memberemail = m.email
      WHERE p.bookingID = $1;
    `;

    const values = [bookingID];
    const participants = await client.query(query, values);

    res.status(200).json({ participants: participants.rows });
  } catch (error) {
    console.error('Error fetching participants by bookingID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/fetch_bookings_by_date', requireLogin(AccountTypes.ADMIN),  async (req, res) => {
  try {
      const {date } = req.body;

      // Validate data
      if (!date) {
          return res.status(400).json({ error: 'Please provide valid date.' });
      }

      // Query database to fetch bookings for the specified room and date
      const query = `
          SELECT *
          FROM Booking
          WHERE day = $1;
      `;

      const values = [date];
      const bookings = await client.query(query, values);

      res.status(200).json({ bookings: bookings.rows });
  } catch (error) {
      console.error('Error fetching bookings by date:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/delete_booking_by_id', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
      const { bookingID } = req.body;

      // Validate session ID
      if (!bookingID || isNaN(bookingID)) {
          return res.status(400).json({ error: 'Please provide a valid session ID.' });
      }

      // Query database to delete the session
      const query = `
          DELETE FROM Booking
          WHERE bookingID = $1
      `;
      const values = [bookingID];
      await client.query(query, values);

      res.status(200).json({ message: 'Session deleted successfully.' });
  } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/delete_participant', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
      const { memberEmail, bookingID } = req.body;

      // Validate member email and booking ID
      if (!memberEmail || !bookingID) {
          return res.status(400).json({ error: 'Please provide valid member email and booking ID.' });
      }

      // Query database to delete the participant
      const query = `
          DELETE FROM Participants
          WHERE memberemail = $1 AND bookingID = $2
      `;
      const values = [memberEmail, bookingID];
      const result = await client.query(query, values);

      if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Participant not found.' });
      }

      res.status(200).json({ message: 'Participant deleted successfully.' });
  } catch (error) {
      console.error('Error deleting participant:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch trainer availabilities for a specific date
app.post('/fetch_trainer_availabilities', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { date } = req.body;
    //const email = req.session.user['email'];

    // Validate data
    if (!date) {
      return res.status(400).json({ error: 'Please provide a valid date.' });
    }

    const [year, month, day] = date.split('-');
        
    //this is retarded, why does Date(2024-04-14) give you 2024-04-13
    const parsedDate = new Date(date+"T00:00:00");
    
    // Check if the parsing was successful
    if (parsedDate === "Invalid Date") {
      return res.status(400).json({ error: 'Invalid date format. Please provide a valid date.' });
    }

    let dayOfWeek = parsedDate.getDay();


    // Query database to fetch trainer availabilities for the specified date
    const query = `
    SELECT t.name, a.email, a.start_time, a.end_time
    FROM TrainerAvailabilitys a
    JOIN Trainers t ON a.email = t.email
    WHERE a.day = $1;    
    `;

    const values = [dayOfWeek];
    const availabilities = await client.query(query, values);

    res.status(200).json({ availabilities: availabilities.rows });
  } catch (error) {
    console.error('Error fetching trainer availabilities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch equipment by room
app.post('/fetch_equipment_by_room', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { roomNumber } = req.body;

    // Validate room number
    if (!roomNumber || isNaN(roomNumber)) {
      return res.status(400).json({ error: 'Please provide a valid room number.' });
    }

    // Query database to fetch equipment by room
    const query = `
    SELECT * FROM Equipments
    WHERE room = $1;
    `;

    const values = [roomNumber];
    const equipment = await client.query(query, values);

    res.status(200).json({ equipment: equipment.rows });
  } catch (error) {
    console.error('Error fetching equipment by room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch equipment needing service within the next 60 days
app.get('/fetch_equipment_for_service', async (req, res) => {
  try {
    // Calculate today's date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Calculate date 60 days from today
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 60);
    const futureDateString = futureDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Query database to fetch equipment needing service within the next 60 days
    const query = `
      SELECT * 
      FROM Equipments
      WHERE lastService + servicePeriod <= $1;
    `;
    const values = [futureDateString];
    const equipments = await client.query(query, values);

    res.status(200).json({ equipments: equipments.rows });
  } catch (error) {
    console.error('Error fetching equipment for service:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to update maintenance for equipment
app.post('/update_maintenance', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { equipmentId, serviceDate } = req.body;

    // Validate data
    if (!equipmentId || !serviceDate) {
      return res.status(400).json({ error: 'Please provide valid equipment ID and service date.' });
    }

    // Check if equipment with the specified ID exists
    const checkExistenceQuery = `
      SELECT equipmentID
      FROM Equipments
      WHERE equipmentID = $1;
    `;
    const checkExistenceValues = [equipmentId];
    const checkExistenceResult = await client.query(checkExistenceQuery, checkExistenceValues);

    if (checkExistenceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment with the specified ID does not exist.' });
    }

    // Update maintenance record in the database
    const updateQuery = `
      UPDATE Equipments
      SET lastService = $1
      WHERE equipmentID = $2;
    `;
    const updateValues = [serviceDate, equipmentId];
    await client.query(updateQuery, updateValues);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete equipment by ID
app.post('/remove_equipment', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { removeEquipmentId } = req.body;

    // Validate data
    if (!removeEquipmentId) {
      return res.status(400).json({ error: 'Please provide a valid equipment ID.' });
    }

    // Check if equipment with the specified ID exists
    const checkExistenceQuery = `
      SELECT equipmentID
      FROM Equipments
      WHERE equipmentID = $1;
    `;
    const checkExistenceValues = [removeEquipmentId];
    const checkExistenceResult = await client.query(checkExistenceQuery, checkExistenceValues);

    if (checkExistenceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment with the specified ID does not exist.' });
    }

    // Delete equipment from the database
    const deleteQuery = `
      DELETE FROM Equipments
      WHERE equipmentID = $1;
    `;
    const deleteValues = [removeEquipmentId];
    await client.query(deleteQuery, deleteValues);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing equipment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to add new equipment
app.post('/add_equipment', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    const { equipName, lastService, room, servicePeriod, companyName, companyEmail, companyPhone, serviceCost } = req.body;

    // Validate data
    if (!equipName || !lastService || !room || !servicePeriod || !companyName || !companyEmail || !companyPhone || !serviceCost) {
      return res.status(400).json({ error: 'Please provide valid equipment details.' });
    }

    // Insert equipment record into the database
    const insertQuery = `
      INSERT INTO Equipments (equipName, lastService, room, servicePeriod, companyName, companyEmail, companyPhone, serviceCost)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    const values = [equipName, lastService, room, servicePeriod, companyName, companyEmail, companyPhone, serviceCost];
    await client.query(insertQuery, values);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding equipment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Endpoint to fetch all equipment
app.post('/get_all_equipment', requireLogin(AccountTypes.ADMIN), async (req, res) => {
  try {
    // Query database to fetch all equipment
    const query = `
      SELECT *
      FROM Equipments;
    `;
    const result = await client.query(query);

    // Send the equipment data in the response
    res.status(200).json({ equipment: result.rows });
  } catch (error) {
    console.error('Error fetching all equipment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//----------------------------BILLING
// Creates a new Bill
app.post('/create_bill', async (req,res) => {
  try{
    const {email, price, reason} = req.body;

    if(!email || !price || !reason || isNaN(price)) {
      return res.status(400).json({error: "Please ensure all fields are correctly filled"});
    }

    const query = "INSERT INTO Bills (memberemail, amount, reason, paid) VALUES ($1,$2,$3,false)"

    const values = [email, parseFloat(price), reason]

    await client.query(query,values);
    res.status(200).json({success: true});
  } catch (error) {
    console.error("Error creating new bill", error);
    res.status(500).json({error: 'Internal Server Error'})
  }
});

app.post('/search_bills', requireLogin(AccountTypes.ADMIN), async (req,res) => {
  try{
    const userEmail = req.body
    const query = `SELECT * FROM Bills WHERE memberemail = $1;`

    const values = [userEmail]
    const bills = await client.query(query, [userEmail.email])
    console.log(values)
    res.status(200).json({ bills: bills.rows });
  } catch (error) {
    console.error('Error searching for bills:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/pay_bill', requireLogin(AccountTypes.ADMIN), async (req,res) => {
  try{
    const {billID} = req.body

    if(!billID || isNaN(billID)){
      return res.status(400).json({error: "Invalid bill number"})
    }

    const query = "UPDATE Bills SET paid = true WHERE billid = $1"
    const values = [billID]

    await client.query(query,values)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Error paying bill", error);
    res.status(500).json({error: 'Internal Server Error'})
  }
})
