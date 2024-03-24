const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { access } = require('fs');

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

const pool = new Pool({
  user: 'app',
  host: 'localhost',
  database: '3005Final',
  password: 'app',
  port: 5432,
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
    const result = await pool.query('SELECT accountType FROM Users WHERE email = $1 AND password = $2', [email, password]);

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
  const { email, password, card , firstName, lastName} = req.body;
  try {
    
    console.log(`register request: ${email} ${password} ${card}`);
    //data validation
    if (!(email && password && card && firstName && lastName)) {
      return res.status(400).json({ error: 'At least one value invalid' });
    }
    if (isNaN(Number(card)) || card.length !== 16) {
      return res.status(400).json({ error: 'Card number must be a 16 digit numeric string' });
    }

    const result = await pool.query('SELECT 1 FROM Members WHERE email = $1', [email]);
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
      await pool.query('BEGIN');

      await pool.query('INSERT INTO Users (email, password, accountType) VALUES ($1, $2, $3)', [email, password, AccountTypes.MEMBER]);
      await pool.query('INSERT INTO Members (email, card, firstName, lastName) VALUES ($1, $2, $3, $4)', [email, card, firstName, lastName]);

      // Commit the transaction if both insertions succeed
      await pool.query('COMMIT');

      console.log('User registered successfully');
    } catch (error) {
      // If an error occurs during either insertion, rollback the transaction
      await pool.query('ROLLBACK');
      console.error('Error registering user:', error);
    }

  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

function requireLogin(accountType) {
  return function(req, res, next) {
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



//trainer functions
app.post('/searchMembers', requireLogin(AccountTypes.TRAINER), async (req, res) => {
  const { firstName, lastName } = req.body;

  try {
    //console.log(`search request: ${firstName} ${lastName}`);
    // Query the database
    const searchResults = await pool.query('SELECT firstName, lastName, email, restingbpm FROM Members WHERE firstName = $1 AND lastName = $2', [firstName, lastName])

    // Send formatted search results to the client
    res.json(searchResults.rows);
  } catch (error) {
    console.error('Error searching for members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
