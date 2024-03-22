create table Members
	(userID		serial,
	 firstName		varchar(15),
     lastName       varChar(15),
     email          varChar(30),
     creditCard     varChar(16),
     fitnessGoals   text,
     restingbpm     real,
     bloodpressure  real,
	 primary key (userID)
	);

create table Trainers
	(trainerID		serial,
	 phone		    varchar(15),
     email          varchar(30),
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

-- Create basic roles
CREATE ROLE member;
CREATE ROLE trainer;
CREATE ROLE admin;

ALTER TABLE Member ENABLE ROW LEVEL SECURITY;
ALTER TABLE Trainer ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_policy
ON Member
FOR SELECT
USING (userID = current_setting('app.user_id')::integer);

CREATE POLICY trainer_policy
ON Trainer
FOR SELECT
USING (trainerID = current_setting('app.trainer_id')::integer);

GRANT SELECT, INSERT, UPDATE, DELETE ON Equipment, Schedule TO admin;

-- Grant necessary permissions to each role
--GRANT member TO user1;
--GRANT trainer TO user2;