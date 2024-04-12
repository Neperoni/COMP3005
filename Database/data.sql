

--user login table
--we then find out what kind of account they have
--and direct it to the table and use email as the primary key

DROP TABLE IF EXISTS Users CASCADE;
CREATE TABLE IF NOT EXISTS Users (
    email VARCHAR(30) PRIMARY KEY NOT NULL,
    password VARCHAR(255) NOT NULL,
    accountType NUMERIC(1,0) NOT NULL
);

DROP TABLE IF EXISTS Members CASCADE;
CREATE TABLE IF NOT EXISTS Members (
    email VARCHAR(30) PRIMARY KEY NOT NULL,
    firstName VARCHAR(15) NOT NULL,
    lastName VARCHAR(15) NOT NULL,
    card NUMERIC(16,0) NOT NULL,
    restingbpm REAL,
    bloodpressure REAL
);

DROP TABLE IF EXISTS ExerciseGoals CASCADE;
CREATE TABLE IF NOT EXISTS ExerciseGoals (
    email VARCHAR(30) NOT NULL,
    exercise TEXT NOT NULL,
    goal TEXT NOT NULL,
    PRIMARY KEY (email, exercise, goal),
    FOREIGN KEY (email) REFERENCES Members(email) ON DELETE CASCADE,
    FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE
);

DROP TABLE IF EXISTS ExerciseRoutine CASCADE;
CREATE TABLE IF NOT EXISTS ExerciseRoutine (
    email VARCHAR(30) NOT NULL,
    exercisename TEXT NOT NULL,
    exerciseinstructions TEXT NOT NULL,
    PRIMARY KEY (email, exercisename),
    FOREIGN KEY (email) REFERENCES Members(email) ON DELETE CASCADE,
    FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE
);

DROP TABLE IF EXISTS ExerciseHistory CASCADE;
CREATE TABLE IF NOT EXISTS ExerciseHistory (
    email VARCHAR(30) NOT NULL,
    date DATE NOT NULL,
    exercisename TEXT NOT NULL,
    progress BOOLEAN NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 0 AND difficulty <= 10),
    PRIMARY KEY (email, date, exercisename),
    FOREIGN KEY (email) REFERENCES Members(email) ON DELETE CASCADE,
    FOREIGN KEY (email, exercisename) REFERENCES ExerciseRoutine(email, exercisename) ON DELETE CASCADE,
    FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE
);

DROP TABLE IF EXISTS Trainers CASCADE;
CREATE TABLE IF NOT EXISTS Trainers (
    email VARCHAR(30) PRIMARY KEY NOT NULL,
	name VARCHAR(15) NOT NULL,
    phone VARCHAR(15),
    FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE
);

DROP TABLE IF EXISTS TrainerAvailabilitys;
CREATE TABLE IF NOT EXISTS TrainerAvailabilitys
(
    email VARCHAR(30) NOT NULL, 
    day varchar(1),
    start_time time,
    end_time time,
    PRIMARY KEY (email, day, start_time),
    FOREIGN KEY (email) REFERENCES Trainers(email),
    FOREIGN KEY (email) REFERENCES Users(email) ON DELETE CASCADE,
    check (start_time < end_time)
);

CREATE OR REPLACE FUNCTION check_overlap(
    p_day DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_room INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    overlap_found BOOLEAN;
BEGIN
    overlap_found := EXISTS (
        SELECT 1
        FROM Booking
        WHERE day = p_day
        AND room = p_room
        AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );

    RETURN overlap_found;
END;
$$ LANGUAGE plpgsql;

DROP TABLE IF EXISTS Booking CASCADE;
CREATE TABLE IF NOT EXISTS Booking (
    bookingID SERIAL, 
    day DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room INTEGER NOT NULL,
    traineremail VARCHAR(30) NOT NULL,
    seats INTEGER NOT NULL,
    public BOOLEAN NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (bookingID),
    CHECK (NOT check_overlap(day, start_time, end_time, room)),
    FOREIGN KEY (traineremail) REFERENCES Users(email) ON DELETE CASCADE,
    FOREIGN KEY (traineremail) REFERENCES Trainers(email) ON DELETE CASCADE
);


DROP TABLE IF EXISTS Participants;
CREATE TABLE Participants (
    bookingID INTEGER,
    memberemail VARCHAR(30) NOT NULL,
    PRIMARY KEY (bookingID, memberemail),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID) ON DELETE CASCADE,
    FOREIGN KEY (memberemail) REFERENCES Members(email) ON DELETE CASCADE,
    FOREIGN KEY (memberemail) REFERENCES Users(email) ON DELETE CASCADE
);

DROP TABLE IF EXISTS Bills;
CREATE TABLE Bills (
    billID SERIAL PRIMARY KEY
    memberemail VARCHAR(30),
    amount FLOAT,
    paid BOOLEAN,
    FOREIGN KEY (memberemail) REFERENCES Members(email) ON DELETE CASCADE,
    FOREIGN KEY (memberemail) REFERENCES Users(email) ON DELETE CASCADE
)
/*

create table Equipments
(
    equipmentID serial,
    equipName varchar(30) unique,
    lastService date,
    room INTEGER NOT NULL,
    servicePeriod integer,
    companyName varchar(40),
    companyEmail varchar(40),
    companyPhone varchar(40),
    serviceCost real,
    primary key (equipmentID)
);

/*
--trainers have several availability windows
--so we need a one to many relationship
--if there are two windows on the same day then trainerID and day is not unique enough
--so also needs start time
--convenient for displaying by soonness



