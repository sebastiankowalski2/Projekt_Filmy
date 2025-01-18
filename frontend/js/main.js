document.addEventListener('DOMContentLoaded', () => {
  const authForms = document.getElementById('auth-forms')
  const loginForm = document.getElementById('login-form')
  const registerForm = document.getElementById('register-form')
  const loginLink = document.getElementById('login-link')
  const registerLink = document.getElementById('register-link')
  const moviesGrid = document.getElementById('movies-grid')
  const moviesSection = document.getElementById('movies')

  // Pokaż formularz logowania
  loginLink.addEventListener('click', (e) => {
    e.preventDefault()
    authForms.style.display = 'block'
    loginForm.style.display = 'block'
    registerForm.style.display = 'none'
    moviesSection.style.display = 'none' // Ukryj sekcję z filmami
  })

  // Pokaż formularz rejestracji
  registerLink.addEventListener('click', (e) => {
    e.preventDefault()
    authForms.style.display = 'block'
    loginForm.style.display = 'none'
    registerForm.style.display = 'block'
    moviesSection.style.display = 'none' // Ukryj sekcję z filmami
  })

  // Pobierz filmy z serwera
  fetch('../backend/php/fetch_movies.php')
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        data.movies.forEach((movie) => {
          const movieCard = document.createElement('div')
          movieCard.classList.add('col-lg-4', 'col-md-6', 'mb-4')

          // Ensure cena is a number
          const cena = parseFloat(movie.cena)

          movieCard.innerHTML = `
            <div class="card">
              <img src="../img/${movie.zdj}.jpeg" class="card-img-top" alt="${
            movie.nazwa
          }">
              <div class="card-body">
                <h5 class="card-title">${movie.nazwa}</h5>
                <p class="card-text">${movie.opis}</p>
                <p class="card-text"><strong>Cena:</strong> ${cena.toFixed(
                  2
                )} PLN</p>
              </div>
            </div>
          `
          moviesGrid.appendChild(movieCard)
        })
      } else {
        moviesGrid.innerHTML = `<p>${data.message}</p>`
      }
    })
    .catch((error) => {
      moviesGrid.innerHTML = `<p>Błąd podczas ładowania filmów: ${error.message}</p>`
    })

  // Obsługa formularza rejestracji
  document
    .getElementById('register-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault()

      // Pobranie danych z formularza
      const formData = new FormData(e.target)

      try {
        const response = await fetch('../backend/php/register.php', {
          method: 'POST',
          body: formData,
        })

        const message = await response.text()
        alert(message) // Wyświetlenie wiadomości zwrotnej od serwera
      } catch (error) {
        console.error('Błąd:', error)
        alert('Wystąpił błąd podczas wysyłania formularza.')
      }
    })

  // Obsługa formularza logowania
  document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault()
    const data = {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    }
    fetch('../backend/php/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert('Zalogowano pomyślnie!')
          location.reload()
        } else {
          alert('Błąd logowania: ' + result.message)
        }
      })
  })
})
