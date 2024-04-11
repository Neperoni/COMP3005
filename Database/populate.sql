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
