
--members
INSERT INTO Users (email, password, accountType) VALUES ('user1@example.com', 'password123', 0);
INSERT INTO Users (email, password, accountType) VALUES ('member1@example.com', 'securepass', 0);
INSERT INTO Users (email, password, accountType) VALUES ('member2@example.com', 'safepass', 0);
--trainers
INSERT INTO Users (email, password, accountType) VALUES ('trainer1@example.com', 'workout123', 1);
INSERT INTO Users (email, password, accountType) VALUES ('trainer2@example.com', 'exercise256', 1);
INSERT INTO Users (email, password, accountType) VALUES ('trainer3@example.com', 'trainer117', 1);
--admins
INSERT INTO Users (email, password, accountType) VALUES ('admin@example.com', 'admin456', 2);

INSERT INTO Members (email, firstName, lastName, card, restingbpm, bloodpressure) VALUES
('member1@example.com', 'John', 'Doe', 1234567890123456,  60, 120);
INSERT INTO Members (email, firstName, lastName, card, restingbpm, bloodpressure) VALUES
('member2@example.com', 'Jane', 'Doe', 1234567890123457, 70, 140);
INSERT INTO Members (email, firstName, lastName, card, restingbpm, bloodpressure) VALUES
('user1@example.com', 'Jim', 'Doe', 1234567890123466, 40, 110);
INSERT INTO Members (email, firstName, lastName, card, restingbpm, bloodpressure) VALUES
('default@example.com', 'Jim', 'Dough', 1234567890123466, 40, 110);

INSERT INTO Trainers (email, name, phone) VALUES ('trainer1@example.com', 'Alice', '555-0101');
INSERT INTO Trainers (email, name, phone) VALUES ('trainer2@example.com', 'Harry', '768-9112');
INSERT INTO Trainers (email, name, phone) VALUES ('trainer3@example.com', 'Henry', '705-3567');


-- Insert some bill entries

INSERT INTO Bills (memberemail, amount, reason, paid) VALUES 
('member1@example.com', 200.05, 'Training Session', false);

INSERT INTO Bills (memberemail, amount, reason, paid) VALUES
('member1@example.com', 50.00, 'Gym membership fee', FALSE);

INSERT INTO Bills (memberemail, amount, reason, paid) VALUES
('member2@example.com', 100.00, 'Medical checkup fee', TRUE);

INSERT INTO Bills (memberemail, amount, reason, paid) VALUES
('user1@example.com', 75.00, 'Fitness class fee', FALSE);

INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) 
VALUES ('member1@example.com', 'PUSHUPS', 'REPS: 30, SETS: 30');

-- Insert availability for trainer Alice
INSERT INTO TrainerAvailabilitys (email, day, start_time, end_time)
VALUES 
    ('trainer1@example.com', '1', '09:00:00', '12:00:00'), -- Monday 9 AM - 12 PM
    ('trainer1@example.com', '2', '13:00:00', '17:00:00'); -- Tuesday 1 PM - 5 PM

-- Insert availability for trainer Harry
INSERT INTO TrainerAvailabilitys (email, day, start_time, end_time)
VALUES 
    ('trainer2@example.com', '1', '10:00:00', '14:00:00'), -- Wednesday 10 AM - 2 PM
    ('trainer2@example.com', '3', '08:00:00', '11:00:00'); -- Thursday 8 AM - 11 AM

-- Insert availability for trainer Henry
INSERT INTO TrainerAvailabilitys (email, day, start_time, end_time)
VALUES 
    ('trainer3@example.com', '2', '09:00:00', '12:00:00'), -- Friday 9 AM - 12 PM
    ('trainer3@example.com', '6', '14:00:00', '18:00:00'); -- Saturday 2 PM - 6 PM


-- Insert data into Booking table
INSERT INTO Booking (day, start_time, end_time, room, traineremail, seats, public, name, description) VALUES
('2024-04-15', '09:00:00', '10:00:00', 1, 'trainer1@example.com', 10, true, 'Morning Yoga', 'Relaxing yoga session to start your day'),
('2024-04-15', '12:00:00', '13:00:00', 2, 'trainer2@example.com', 15, true, 'Cardio Kickboxing', 'High-intensity cardio workout with kickboxing techniques'),
('2024-04-16', '10:00:00', '11:00:00', 3, 'trainer3@example.com', 12, true, 'Strength Training', 'Build muscle and improve strength with weightlifting exercises');

-- Add participation entries
INSERT INTO Participants (bookingID, memberemail) VALUES
(1, 'member1@example.com'),
(1, 'member2@example.com'),
(1, 'user1@example.com');

INSERT INTO Participants (bookingID, memberemail) VALUES
(2, 'member2@example.com'),
(2, 'user1@example.com');

INSERT INTO Participants (bookingID, memberemail) VALUES
(3, 'member1@example.com'),
(3, 'user1@example.com');

INSERT INTO Equipments (equipName, lastService, room, servicePeriod, companyName, companyEmail, companyPhone, serviceCost) 
VALUES ('Treadmill', '2024-03-15', 101, 30, 'Fitness Tech Inc.', 'info@fitnesstech.com', '123-456-7890', 1000.00);

INSERT INTO Equipments (equipName, lastService, room, servicePeriod, companyName, companyEmail, companyPhone, serviceCost) 
VALUES ('Stationary Bike', '2024-02-20', 102, 45, 'Cardio Equipment Co.', 'sales@cardioequipment.com', '987-654-3210', 800.00);

INSERT INTO Equipments (equipName, lastService, room, servicePeriod, companyName, companyEmail, companyPhone, serviceCost) 
VALUES ('Dumbbells Set', '2024-04-01', 103, 90, 'Iron Gym Supplies', 'support@irongymsupplies.com', '555-123-4567', 500.00);

-- Exercise goals for member1@example.com
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('member1@example.com', 'Running', 'Run 5 miles every week');
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('member1@example.com', 'Weightlifting', 'Lift weights 3 times a week');
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('member1@example.com', 'Yoga', 'Practice yoga for 30 minutes daily');

-- Exercise goals for member2@example.com
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('member2@example.com', 'Cycling', 'Bike 10 miles every other day');
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('member2@example.com', 'Swimming', 'Swim laps for 30 minutes twice a week');
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('member2@example.com', 'Pilates', 'Attend Pilates class every Monday and Friday');

-- Exercise goals for user1@example.com
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('user1@example.com', 'Running', 'Increase running speed by 10% within 2 months');
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('user1@example.com', 'Circuit Training', 'Complete a full circuit in under 30 minutes');
INSERT INTO ExerciseGoals (email, exercise, goal) VALUES ('user1@example.com', 'Hiking', 'Hike 10 different trails in the next 6 months');

-- Exercise routine for member1@example.com
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('member1@example.com', 'Morning Run', 'Run for 30 minutes at a moderate pace in the morning.');
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('member1@example.com', 'Weightlifting', 'Perform 3 sets of bench press, 3 sets of squats, and 3 sets of deadlifts with 10 reps each.');
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('member1@example.com', 'Yoga Session', 'Follow a 45-minute Vinyasa flow yoga routine focusing on flexibility and relaxation.');

-- Exercise routine for member2@example.com
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('member2@example.com', 'Cycling Workout', 'Bike for 45 minutes, alternating between high-intensity sprints and recovery periods.');
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('member2@example.com', 'Swimming Drills', 'Complete 10 laps of freestyle, 5 laps of backstroke, and 5 laps of breaststroke, focusing on technique and speed.');
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('member2@example.com', 'Pilates Class', 'Attend a 1-hour Pilates class focusing on core strength and stability.');

-- Exercise routine for user1@example.com
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('user1@example.com', 'Evening Jog', 'Jog for 20 minutes around the neighborhood, focusing on steady breathing and posture.');
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('user1@example.com', 'Circuit Training', 'Complete a circuit consisting of burpees, jumping jacks, lunges, and push-ups, 3 sets of 10 reps each.');
INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) VALUES ('user1@example.com', 'Hiking Adventure', 'Embark on a 2-hour hike on a nearby trail, enjoying nature and maintaining a steady pace.');

-- Generate ExerciseHistory entries for the last 3 days for member1@example.com
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('member1@example.com', CURRENT_DATE - INTERVAL '3 days', 'Morning Run', TRUE, 5);
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('member1@example.com', CURRENT_DATE - INTERVAL '3 days', 'Weightlifting', TRUE, 7);
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('member1@example.com', CURRENT_DATE - INTERVAL '3 days', 'Yoga Session', TRUE, 4);

-- Generate ExerciseHistory entries for the last 5 days for member2@example.com
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('member2@example.com', CURRENT_DATE - INTERVAL '5 days', 'Cycling Workout', TRUE, 6);
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('member2@example.com', CURRENT_DATE - INTERVAL '5 days', 'Swimming Drills', TRUE, 8);
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('member2@example.com', CURRENT_DATE - INTERVAL '5 days', 'Pilates Class', TRUE, 3);

-- Generate ExerciseHistory entries for the last 4 days for user1@example.com
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('user1@example.com', CURRENT_DATE - INTERVAL '4 days', 'Evening Jog', TRUE, 5);
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('user1@example.com', CURRENT_DATE - INTERVAL '4 days', 'Circuit Training', TRUE, 7);
INSERT INTO ExerciseHistory (email, date, exercisename, progress, difficulty) VALUES ('user1@example.com', CURRENT_DATE - INTERVAL '4 days', 'Hiking Adventure', TRUE, 4);
