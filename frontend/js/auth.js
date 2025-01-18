function logout() {
  fetch('../backend/php/logout.php')
    .then(() => {
      alert('Logged out successfully.')
      location.reload()
    })
    .catch((error) => console.error('Error during logout:', error))
}

// Sprawdzenie, czy użytkownik jest zalogowany
fetch('../backend/php/check_login.php')
  .then((response) => response.json())
  .then((data) => {
    if (data.loggedIn) {
      document.getElementById('login-link').style.display = 'none'
      document.getElementById('register-link').style.display = 'none'

      const logoutButton = document.createElement('a')
      logoutButton.id = 'logout-link'
      logoutButton.textContent = 'Logout'
      logoutButton.href = '#'
      logoutButton.addEventListener('click', logout)
      document.querySelector('nav').appendChild(logoutButton)

      // Wyświetl imię i nazwisko użytkownika na stronie
      const userInfo = document.getElementById('kto_to')
      userInfo.textContent = `Zalogowano jako: ${data.firstName} ${data.lastName}`
    } else {
      // Dodaj event listenery do linków logowania i rejestracji
      document.getElementById('login-link').addEventListener('click', () => {
        document.getElementById('login-modal').classList.remove('hidden')
      })

      document.getElementById('register-link').addEventListener('click', () => {
        document.getElementById('register-modal').classList.remove('hidden')
      })
    }
  })
  .catch((error) => console.error('Error checking login status:', error))

// Obsługa zamykania modalu
document.querySelectorAll('.close-modal').forEach((button) => {
  button.addEventListener('click', () => {
    button.closest('.modal').classList.add('hidden')
  })
})
