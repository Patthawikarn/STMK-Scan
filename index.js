document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  var employeeCode = document.getElementById('floatingInput').value;
  var password = document.getElementById('floatingPassword').value;
  
  if(employeeCode.trim() === '' || password.trim() === '') {
    alert('Please enter both employee code and password.');
  } else {
    fetch("https://starmark.work/ProductOnsiteAPI/api/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Username: employeeCode,
        Password: password
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.Status === "OK") {

        window.location.href = "./Scan.html";
      } else {
        throw new Error('Login failed. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error.message);
      alert('Login failed. Please try again.');
    });
  }
});
