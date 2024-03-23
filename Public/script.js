document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');
  
    // Event listener for registration form submission
    registrationForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const formData = new FormData(registrationForm);
      const requestData = {
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
        alert(responseData.message); // Display registration status
        registrationForm.reset(); // Reset the form after successful registration
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
        alert(responseData.message); // Display login status
        loginForm.reset(); // Reset the form after successful login
      } catch (error) {
        console.error('Error logging in:', error);
        alert('Failed to login. Please try again later.');
      }
    });
  });
  