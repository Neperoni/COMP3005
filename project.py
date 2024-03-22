
import psycopg2

from datetime import datetime

#formats the SQL command and prints results for select
def getAllStudents():
    
    cur = conn.cursor()
    cur.execute("SELECT * FROM Students")
    data = cur.fetchall()
    
    print("\nSTUDENTS: ")
    for (id, first, last, email, dateTime) in data:
        
        print(id, first, last, email, dateTime.strftime("%Y-%m-%d"))
    print("")

    #free DB resources    
    cur.close()
    #update DB
    conn.commit()

#formats SQL request, prints error if failure
    
#formatting in this way with cur.execute(%d) is safe
#apparently this way will prevent SQL injection

def addStudent(first_name, last_name, email, enrollment_date):
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO students (first_name, last_name, email, enrollment_date) VALUES (%s, %s, %s, %s)", (first_name, last_name, email, enrollment_date))
        print("Insert successful")
    except psycopg2.Error as e:
        print("Error inserting data:", e)
    
    cur.close()
    conn.commit()

#formats SQL request, prints error if failure
def updateStudentEmail(student_id, new_email):
    
    cur = conn.cursor()
    try:
        cur.execute("UPDATE Students SET email = %s WHERE student_id = %s ", (new_email, student_id))
    except psycopg2.Error as e:
        print("Error updating student: ", e)
    cur.close()
    conn.commit()
    

#formats SQL request, prints error if failure
def deleteStudent(student_id):
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM Students WHERE student_id = %s", (student_id,))#single element tuple
    except psycopg2.Error as e:
        print("Error deleting student: ",e)
    cur.close()
    conn.commit()
    

#used to look for @ symbol in email
#basic email validation
def indexOf(string, char):
    for i, entry in enumerate(string):
        if(char == entry):
            return i
    return -1

#an input loop that keeps asking user until input is valid
def getValidEmail():
    emailInput = ""
    while (True):
        emailInput = input()

        if(indexOf(emailInput, '@') == -1):
            print("please input a valid email")
        else:
            break
    return emailInput

def getValidDate():
    enrollment = ""
    while(True):
        enrollment = input()
        try:
            enrollment = datetime.strptime(enrollment, "%Y-%m-%d").date()
            break
        except ValueError as e:
            print("Invalid date: ", e)
            print("please enter date again in YYYY-MM-DD format")
    return enrollment

while (True):
    
    print("Please login")
    print("username: ")
    username = input()
    password = input()
        
    try:
        conn = psycopg2.connect(database="30005Final",
                                host="127.0.0.1",
                                user=username,
                                password=password,
                                port="5432")
        print("Login successful!")
        
        # Fetch the user's group
        cursor = conn.cursor()
        cursor.execute("SELECT rolname FROM pg_roles WHERE rolname = %s;", (username,))
        role = cursor.fetchone()

        if role:
            print(f"Logged in as user {username} in group {role[0]}.")
        else:
            print(f"User {username} not found in the database.")
            
    except psycopg2.OperationalError as e:
        if isinstance(e, psycopg2.errors.InvalidPassword):
            print("Incorrect login credentials. Please check your username and password.")
        elif isinstance(e, psycopg2.errors.UndefinedDatabase) or isinstance(e, psycopg2.errors.UndefinedObject):
            print("Unable to find the server. Please check the server address.")
        else:
            print("An error occurred while connecting to the database:", e)
    except psycopg2.Error as e:
        print("An error occurred while connecting to the database:", e)

    
    
    #select function
    #an input loop
    while(True):
        message = input()

        if(message.isnumeric):
            number = int(message)
            if(number<0 or number>4):
                print("please input a number between 0 and 4")
            else:
                break
        else:
                print("please input a number between 0 and 4")
    number = int(message)



    if(number == 0):#quit
        break
    elif(number == 1):#get students
        getAllStudents()
    elif(number == 2):#add student
        
        print("Please input first name")
        first = input() 
        print("please input last name")
        last = input()
        print("please input email")
        emailInput = getValidEmail()
       
        print("please input enrollment date in YYYY-MM-DD format")
        enrollment = getValidDate()
        
        addStudent(first, last, emailInput, enrollment)
        
    elif(number == 3):#update student email
        print("please input student id")
        id = ""
        while(True):
            id = input()
            if(id.isnumeric == False):
                print('Please input a number')
            else:
                break
        
        print("please input new email")
        emailInput = getValidEmail()
            
        updateStudentEmail(id, emailInput)
        
        
    elif(number==4):#delete student
        
        print("please input student id")
        id = ""
        while(True):
            id = input()
            try:
                id = int(id)
                break
            except ValueError:
                print("id is not an integer")
        
        deleteStudent(id)

        