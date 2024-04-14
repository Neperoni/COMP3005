# COMP3005

### Alexander Stone 101233480
### Alex Davidson 101149335
### Qusai Alkhawaldeh 101202913

### Video link: https://youtu.be/_J114TTQEs0




then run DDL and DML and it should work

## How to run
1. Create a postgre SQL database using the provided DDL and DML files
2. In the server.js file change the variables in the client variable (starts on line 29) to match the login variables for your Postgre Database instance
3. Ensure you have Node JS installed, then run npm install to download the required dependencies
4. Run the server by running node server.js
5. If the server launches correctly it will inform you if it has connected to the database, then it will display the localhost port which has the application

### DML insertion
Some of the DML is inserting data referencing autoincremented IDs
these are manually typed, and so may not match
before running any DDL or DML make sure to wipe the server with 
####   DROP SCHEMA public CASCADE;
####   CREATE SCHEMA public;
this should make it work


### Design assumptions:
1. The admin is a secretary, and so knows all the valid rooms, so any room number entered is valid
2. Private sessions can have multiple people, and so is the same table as public, just with a boolean showing if it is public
3. Email is unique across member, trainer, and admin as it is used for login
4. Most fields are non unique, unless specified as a key like email or are compositely unique in a primary key exercise_name, exercise_goal)
5. 
