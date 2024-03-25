

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
    fitnessGoals TEXT,
    restingbpm REAL,
    bloodpressure REAL
);

DROP TABLE IF EXISTS Trainers;
CREATE TABLE IF NOT EXISTS Trainers (
    email VARCHAR(30) PRIMARY KEY NOT NULL,
	name VARCHAR(15) NOT NULL,
    phone VARCHAR(15)
);

/*

--room and time are on schedule
--accessed by event id
create table Events
	(
    eventID		serial PRIMARY KEY, 
    trainerEmail		VARCHAR(30) NOT NULL,
    is_public         boolean,
    description    text,
    primary key (eventID),
    foreign key (trainerEmail) references Trainer
	);


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
create table TrainerAvailabilitys
(
    trainerID integer,
    day varchar(1),
    start_time time,
    end_time time,
    primary key (trainerID, day, start_time),
    foreign key (trainerID) references Trainer(trainerID),
    check (start_time < end_time)
);

create table Schedule
(
    eventID serial,
    day varchar(1),
    start_time time,
    end_time time,
    room integer,
    primary key (start_time, end_time, room)
    foreign key (room) references Event
    check (not exists (
        select 1
        from Schedule s
        where s.day = Schedule.day
        and s.room = Schedule.room
        and (s.start_time, s.end_time) OVERLAPS (Schedule.start_time, Schedule.end_time)
        and s.eventID <> Schedule.eventID
    ))
);
