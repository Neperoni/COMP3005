--users login with this data

--then we need to find out what they actually are
--member, trainer, admin
--i have to direct them to a table, as i cant store members and trainers in the same table
--and i cant just direct them to table
--unless i use email as a primary key
CREATE TABLE Users(
    email VARCHAR(30) NOT NULL UNIQUE,
    password NOT NULL,
    accountType BIT(2) NOT NULL
)

CREATE TABLE Members (
    email VARCHAR(30) NOT NULL UNIQUE,
    creditCard numeric(16,0) NOT NULL,
    fitnessGoals TEXT,
    restingbpm REAL,
    bloodpressure REAL,
    PRIMARY KEY (userID)
);


create table Trainers
	(email VARCHAR(30) NOT NULL UNIQUE,
    trainerID		serial,
	 phone		    varchar(15),
     availability   text, 
	 primary key (trainerID)
	);

--room and time are on schedule
create table Events
	(
    eventID		serial, 
    trainerID		integer,
    is_public         boolean,
    description    text,
    primary key (eventID),
    foreign key (trainerID) references Trainer
	);

create table Participants
(
    eventID integer,
    userID integer,
    primary key (eventID, userID),
    foreign key (eventID) references Event(eventID),
    foreign key (userID) references Member(userID)
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