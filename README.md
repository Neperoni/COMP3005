# COMP3005

### Alexander Stone 101233480
### Alex Davidson 101149335
### Qusai Alkhawaldeh 101202913

### Video link: https://youtu.be/_J114TTQEs0




then run DDL and DML and it should work

## How to run
1. Create a Postgres SQL database using the provided DDL and DML files
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
1. The admin is a secretary, so knows all the valid rooms, so any room number entered is valid
2. Private sessions can have multiple people, and so is the same table as public, just with a boolean showing if it is public
3. Email is unique across the member, trainer, and admin users as it is used for login
4. Most fields are non-unique, unless specified as a key like email or are compositely unique in a primary key exercise_name, exercise_goal)
5. Members should not create a personal training session, this functionality is given to the admin/secretary/receptionist, in my experience with sports clinics you make appointments through a receptionist. This also would have otherwise exposed a lot of trainer information to members, like their working hours every day of the week.
6. Health stats requirement is fulfilled by resting bpm and blood pressure
7. Exercise routines requirement is fulfilled by exercise name, instructions, and history of completion
8. Admin server endpoints are only going to be accessed by the admin page
9. The relationships an admin partakes in are not specific to the admin. So if they schedule something, or create a bill, the admin who did the task is not stored, as their identity is not relevant to the bill or schedule. This is why their lines in the ER model are dashed, they are responsible or partake in many of the relationships, but are not relevant to the contents of the relationship. We also do not store anything about them other than login details.

