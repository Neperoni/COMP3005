INSERT INTO Users (email, password, accountType) VALUES ('user1@example.com', 'password123', 0);
INSERT INTO Users (email, password, accountType) VALUES ('member1@example.com', 'securepass', 0);
INSERT INTO Users (email, password, accountType) VALUES ('member2@example.com', 'safepass', 0);
INSERT INTO Users (email, password, accountType) VALUES ('trainer1@example.com', 'workout123', 1);
INSERT INTO Users (email, password, accountType) VALUES ('admin@example.com', 'admin456', 2);

INSERT INTO Members (email, firstName, lastName, card, fitnessGoals, restingbpm, bloodpressure) VALUES
('member1@example.com', 'John', 'Doe', 1234567890123456, 'Lose weight, Gain muscle', 60, 120);
INSERT INTO Members (email, firstName, lastName, card, fitnessGoals, restingbpm, bloodpressure) VALUES
('member2@example.com', 'Jane', 'Doe', 1234567890123457, 'Live Actively', 70, 140);
INSERT INTO Members (email, firstName, lastName, card, fitnessGoals, restingbpm, bloodpressure) VALUES
('user1@example.com', 'Jim', 'Doe', 1234567890123466, 'Get Shredded', 40, 110);
INSERT INTO Members (email, firstName, lastName, card, fitnessGoals, restingbpm, bloodpressure) VALUES
('default@example.com', 'Jim', 'Dough', 1234567890123466, 'Get Porky', 40, 110);

INSERT INTO Trainers (email, name, phone) VALUES ('trainer1@example.com', 'Alice', '555-0101');


INSERT INTO ExerciseRoutine (email, exercisename, exerciseinstructions) 
VALUES ('member1@example.com', 'PUSHUPS', 'REPS: 30, SETS: 30');

-- Insert data into Booking table
INSERT INTO Booking (day, start_time, end_time, room, traineremail, seats, public, name, description) VALUES
('2024-04-15', '09:00:00', '10:00:00', 1, 'trainer1@example.com', 10, true, 'Morning Yoga', 'Relaxing yoga session to start your day'),
('2024-04-15', '12:00:00', '13:00:00', 2, 'trainer2@example.com', 15, true, 'Cardio Kickboxing', 'High-intensity cardio workout with kickboxing techniques'),
('2024-04-16', '10:00:00', '11:00:00', 3, 'trainer3@example.com', 12, true, 'Strength Training', 'Build muscle and improve strength with weightlifting exercises');
