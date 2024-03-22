create table Member
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

create table Trainer
	(trainerID		serial,
	 phone		    varchar(15),
     email          varchar(30),
     availability   text, 
	 primary key (trainerID)
	);

--room and time are on schedule
create table Event
	(
    eventID		serial, 
    trainerID		integer,
    is_public         boolean,
    description    text,
    primary key (eventID),
    foreign key (trainerID) references Trainer
	);

create table Participant
(
    eventID integer,
    userID integer,
    primary key (eventID, userID),
    foreign key (eventID) references Event(eventID),
    foreign key (userID) references Member(userID)
);

create table Equipment
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

create table TrainerAvailability
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