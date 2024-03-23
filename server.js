const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { access } = require('fs');

const app = express();

const secretKey = crypto.randomBytes(32).toString('hex');

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

const port = 3000;

const pool = new Pool({
  user: 'app',
  host: 'localhost',
  database: '3005Final',
  password: 'app',
  port: 5432,
});


app.use(bodyParser.json());

// Serve static files from the "Public" directory
app.use(express.static(path.join(__dirname, 'Public')));

app.post('/login', async (req, res) => {
  const {email, password, loginType} = req.body;

  //data validation
  if(!(email && password)){
    return res.status(400).json({ error: 'At least one value invalid' });
  }

  const result = await pool.query('SELECT 1 FROM Users WHERE email = $1, password = %2', [email, password]);

  if(result.length==0){
    return res.status(400).json({ error: 'Incorrect email or password' });
  }

  const accountType = result.rows[0].accountType;

  if(accountType<0 || accountType>2){
    res.status(500).json({ error: 'Internal Server Error, unknown account type' });
  }

  //user is logged in
  //remember their connection, store their user id
    req.session.user = {
      email: email,
      accountType: accountType
  };

  //when they make other requests, remember their connection, get the user id,
    //handled by express-session middleware

  //and restrict the info they can request
  //only members are in members table, only trainers in trainer table, admins dont have user data they just have elevated permissions
  //redirect to profile
  res.redirect('/profile');

})

// Route to add a new user
app.post('/register', async (req, res) => {
  const {email, password, card} = req.body;
  try {

    //data validation
    if(!(email && password && card)){
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

    //transcation to add member and user info to tables
    const registerResult = await pool.query('SELECT RegisterMember($1, $2, $3) AS registration_status', [email, password, card]);
    // Extract registration status from the result
    const registrationStatus = registerResult.rows[0].registration_status;

    if (registrationStatus) {
      return res.status(201).json({ message: 'User added successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to register user' });
    }
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

  //redirect to login
  res.redirect('/login');
});

function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
      // User is logged in, proceed to the next middleware
      next();
  } else {
      // User is not logged in, redirect to login page or send an error response
      res.status(401).send('Unauthorized');
  }
}

// Usage: Apply this middleware to routes that require authentication
app.get('/profile', requireLogin, (req, res) => {
  // Access user data from session
  const user = req.session.user;
  res.send(`Welcome ${user.username}`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
