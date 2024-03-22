CREATE OR REPLACE FUNCTION create_member(
    p_first_name VARCHAR(15),
    p_last_name VARCHAR(15),
    p_email VARCHAR(30),
    p_credit_card VARCHAR(16),
    p_fitness_goals TEXT,
    p_resting_bpm REAL,
    p_blood_pressure REAL
)
RETURNS INTEGER AS
$$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Insert new member into the Member table
    INSERT INTO Member (firstName, lastName, email, creditCard, fitnessGoals, restingbpm, bloodpressure)
    VALUES (p_first_name, p_last_name, p_email, p_credit_card, p_fitness_goals, p_resting_bpm, p_blood_pressure)
    RETURNING userID INTO v_user_id;

    RETURN v_user_id;
END;
$$
LANGUAGE plpgsql;
