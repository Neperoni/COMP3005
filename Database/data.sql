

--user login table
--we then find out what kind of account they have
--and direct it to the table and use email as the primary key

DROP TABLE IF EXISTS Users;
CREATE TABLE IF NOT EXISTS Users (
    email VARCHAR(30) PRIMARY KEY NOT NULL,
    password VARCHAR(255) NOT NULL,
    accountType NUMERIC(1,0) NOT NULL
);

DROP TABLE IF EXISTS Members;
CREATE TABLE IF NOT EXISTS Members (
    email VARCHAR(30) PRIMARY KEY NOT NULL,
    firstName VARCHAR(15) NOT NULL,
    lastName VARCHAR(15) NOT NULL,
    card NUMERIC(16,0) NOT NULL,
    restingbpm REAL,
    bloodpressure REAL
);

DROP TABLE IF EXISTS ExerciseGoals;
CREATE TABLE IF NOT EXISTS ExerciseGoals (
    email VARCHAR(30) NOT NULL,
    exercise TEXT NOT NULL,
    goal TEXT NOT NULL,
    PRIMARY KEY (email, exercise, goal),
    FOREIGN KEY (email) REFERENCES Members(email)
);

DROP TABLE IF EXISTS Trainers;
CREATE TABLE IF NOT EXISTS Trainers (
    email VARCHAR(30) PRIMARY KEY NOT NULL,
	name VARCHAR(15) NOT NULL,
    phone VARCHAR(15)
);

DROP TABLE IF EXISTS Schedule;
CREATE TABLE IF NOT EXISTS Schedule (
    ScheduleID SERIAL PRIMARY KEY,
    UserID INT,
    StartTime TIMESTAMP,
    EndTime TIMESTAMP,
    RoomID INT,
	email INT
);

DROP TABLE IF EXISTS TrainerAvailabilitys;
CREATE TABLE IF NOT EXISTS TrainerAvailabilitys
(
    email VARCHAR(30) NOT NULL, 
    day varchar(1),
    start_time time,
    end_time time,
    primary key (email, day, start_time),
    foreign key (email) references Trainers(email),
    check (start_time < end_time)
);

CREATE OR REPLACE FUNCTION add_schedule_entry(
    p_UserID INT,
    p_RoomID INT,
    p_StartTime TIMESTAMP,
    p_EndTime TIMESTAMP,
    p_TrainerID INT
) RETURNS VOID AS $$
BEGIN
    -- Check for any schedule conflict for the room
    IF EXISTS (
        SELECT 1
        FROM Schedules
        WHERE RoomID = p_RoomID
        AND (
            (StartTime < p_EndTime AND EndTime > p_StartTime) -- Checks if there is any overlap
        )
    ) THEN 
        RAISE EXCEPTION 'Schedule conflict for room detected.';
    END IF;
    
    -- Check for any schedule conflict for the user
    IF EXISTS (
        SELECT 1
        FROM Schedules
        WHERE UserID = p_UserID
        AND (
            (StartTime < p_EndTime AND EndTime > p_StartTime) -- Checks if there is any overlap
        )
    ) THEN
        RAISE EXCEPTION 'Schedule conflict for user detected.';
    END IF;

    -- If no conflicts, insert the new schedule
    INSERT INTO Schedules (UserID, StartTime, EndTime, RoomID, TrainerID)
    VALUES (p_UserID, p_StartTime, p_EndTime, p_RoomID, p_TrainerID);
    
    RAISE NOTICE 'Schedule successfully added.';
END;
$$ LANGUAGE plpgsql;

--admins dont have user data except for login credentials
--which is handled by Users


/*

--map many to many members to events
create table Participants
(
    eventID integer,
    memberEmail VARCHAR(30) NOT NULL,
    primary key (eventID, memberEmail),
    foreign key (eventID) references Event(eventID),
    foreign key (memberEmail) references Member(memberEmail)
);

create table Equipments
(
    equipmentID serial,
    equipName varchar(30) unique,
    lastService date,
    room varchar(10),
    servicePeriod integer,
    companyName varchar(40),
    companyEmail varchar(40),
    companyPhone varchar(40),
    serviceCost real,
    primary key (equipmentID)
);

--trainers have several availability windows
--so we need a one to many relationship
--if there are two windows on the same day then trainerID and day is not unique enough
--so also needs start time
--convenient for displaying by soonness



create table Schedule
(
    eventID     serial,
    day         varchar(1),
    start_time  time,
    end_time    time,
    description text,
    is_public   boolean,
    room        integer,
    primary key (eventID),
    
    check (not exists (
        select 1
        from Schedule s
        where s.day = Schedule.day
        and s.room = Schedule.room
        and (s.start_time, s.end_time) OVERLAPS (Schedule.start_time, Schedule.end_time)
        and s.eventID <> Schedule.eventID
    ))
);
