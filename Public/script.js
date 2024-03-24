

const AccountTypes = {
  MEMBER: 0,
  TRAINER: 1,
  ADMIN: 2
};

document.addEventListener('DOMContentLoaded', function () {
  const registrationForm = document.getElementById('registrationForm');
  const loginForm = document.getElementById('loginForm');

  // Event listener for registration form submission
  registrationForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(registrationForm);
    const requestData = {
      firstName: formData.get('firstName'), // Retrieve first name from form data
      lastName: formData.get('lastName'),   // Retrieve last name from form data
      email: formData.get('email'),
      password: formData.get('password'),
      card: formData.get('card')
    };

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();
      alert(responseData.error); // Display registration status
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Failed to register user. Please try again later.');
    }
  });

  // Event listener for login form submission
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const requestData = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      const responseData = await response.json();
      if (response.ok) {
        switch (responseData.accountType) {
          case AccountTypes.MEMBER:
            window.location.href = '/Privileged/Member/member.html';
            break;
          case AccountTypes.TRAINER:
            window.location.href = '/Privileged/Trainer/trainer.html';
            break;
          case AccountTypes.ADMIN:
            window.location.href = '/Privileged/Admin/admin.html';
            break;
          default:
            console.error("Unknown account type: " + responseData.accountType);
            break;
        }
      }
      
      loginForm.reset(); // Reset the form after successful login
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to login. Please try again later.');
    }
  });
});
