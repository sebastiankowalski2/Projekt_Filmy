document.addEventListener('DOMContentLoaded', () => {
  const authForms = document.getElementById('auth-forms')
  const loginForm = document.getElementById('login-form')
  const registerForm = document.getElementById('register-form')
  const loginLink = document.getElementById('login-link')
  const registerLink = document.getElementById('register-link')
  const logoutLink = document.getElementById('logout-link')
  const profileLink = document.getElementById('profile-link')
  const moviesGrid = document.getElementById('movies-grid')
  const moviesSection = document.getElementById('movies')
  const profileSection = document.getElementById('profile')
  const rentedMoviesGrid = document.getElementById('rented-movies')
  const reservationModal = new bootstrap.Modal(
    document.getElementById('reservationModal')
  )
  const reservationForm = document.getElementById('reservation-form')
  const movieTitleInput = document.getElementById('movie-title')
  const reservationDateInput = document.getElementById('reservation-date')
  const rentalPriceInput = document.getElementById('rental-price')

  // Sprawdź status logowania użytkownika
  fetch('../backend/php/check_login.php')
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn) {
        loginLink.style.display = 'none'
        registerLink.style.display = 'none'
        logoutLink.style.display = 'block'
        profileLink.style.display = 'block'
      } else {
        loginLink.style.display = 'block'
        registerLink.style.display = 'block'
        logoutLink.style.display = 'none'
        profileLink.style.display = 'none'
      }
    })
    .catch((error) => {
      console.error('Błąd sprawdzania statusu logowania:', error)
    })

  // Pokaż formularz logowania
  loginLink.addEventListener('click', (e) => {
    e.preventDefault()
    authForms.style.display = 'block'
    loginForm.style.display = 'block'
    registerForm.style.display = 'none'
    moviesSection.style.display = 'none' // Ukryj sekcję z filmami
    profileSection.style.display = 'none' // Ukryj sekcję profilu
  })

  // Pokaż formularz rejestracji
  registerLink.addEventListener('click', (e) => {
    e.preventDefault()
    authForms.style.display = 'block'
    loginForm.style.display = 'none'
    registerForm.style.display = 'block'
    moviesSection.style.display = 'none' // Ukryj sekcję z filmami
    profileSection.style.display = 'none' // Ukryj sekcję profilu
  })

  // Wylogowanie użytkownika
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault()
    fetch('../backend/php/logout.php')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message)
          location.reload()
        } else {
          alert('Błąd wylogowania: ' + data.message)
        }
      })
      .catch((error) => {
        console.error('Błąd:', error)
        alert('Wystąpił błąd podczas wylogowywania.')
      })
  })

  // Pokaż profil użytkownika
  profileLink.addEventListener('click', (e) => {
    e.preventDefault()
    authForms.style.display = 'none'
    moviesSection.style.display = 'none'
    profileSection.style.display = 'block'
    loadRentedMovies()
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
          <div class="card movie-card">
            <img src="../img/${movie.zdj}.jpeg" class="card-img-top" alt="${
            movie.nazwa
          }">
            <div class="card-body">
              <h5 class="movie-title">${movie.nazwa}</h5>
              <p class="card-text">${movie.opis}</p>
              <p class="card-text"><strong>Cena:</strong> ${cena.toFixed(
                2
              )} PLN</p>
              <button class="rent-btn btn btn-primary" data-bs-toggle="modal" data-bs-target="#reservationModal">Wypożycz</button>
            </div>
          </div>
        `

          moviesGrid.appendChild(movieCard)
          movieCard.firstElementChild.setAttribute(
            'data-movie-id',
            parseInt(movie.id_produktu)
          )
        })

        // Dodaj obsługę kliknięcia na przycisk wypożyczenia
        document.querySelectorAll('.rent-btn').forEach((button) => {
          button.addEventListener('click', (event) => {
            const movieCard = event.target.closest('.movie-card')

            const movieId = movieCard.getAttribute('data-movie-id')
            const movieTitle = movieCard.querySelector('.movie-title').innerText

            movieTitleInput.value = movieTitle
            movieTitleInput.dataset.id = movieId

            console.log(
              `Modal otwarty dla filmu: ID=${movieId}, Tytuł=${movieTitle}`
            )
          })
        })
      } else {
        moviesGrid.innerHTML = `<p>${data.message}</p>`
      }
    })
    .catch((error) => {
      moviesGrid.innerHTML = `<p>Błąd podczas ładowania filmów: ${error.message}</p>`
    })

  // Oblicz cenę wypożyczenia na podstawie daty zakończenia wypożyczenia
  reservationDateInput.addEventListener('change', () => {
    const movieId = movieTitleInput.dataset.id
    const endDate = new Date(reservationDateInput.value)
    const startDate = new Date()

    if (endDate <= startDate) {
      rentalPriceInput.value = 'Nieprawidłowa data'
      return
    }

    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

    fetch(`../backend/php/get_rental_price.php?movieId=${movieId}&days=${days}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          rentalPriceInput.value = `${data.price.toFixed(2)} PLN`
        } else {
          console.log(data.message)
          rentalPriceInput.value = 'Błąd obliczania ceny'
        }
      })
      .catch((error) => {
        console.error('Błąd:', error)
        rentalPriceInput.value = 'Błąd obliczania ceny'
      })
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

  // Obsługa formularza wypożyczenia
  reservationForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const movieId = movieTitleInput.dataset.id
    const date = reservationDateInput.value
    const amount = parseFloat(rentalPriceInput.value)

    fetch('../backend/php/rent_movie.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId, date }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert(`Wypożyczono film: ${movieTitleInput.value} na dzień: ${date}`)
          reservationModal.hide()
          window.location.href = `payment.html?movieId=${movieId}&amount=${amount}`
        } else {
          alert('Błąd wypożyczenia: ' + result.message)
        }
      })
      .catch((error) => {
        console.error('Błąd:', error)
        alert('Wystąpił błąd podczas wypożyczania filmu.')
      })
  })

  // Funkcja do załadowania aktualnie wypożyczonych filmów
  function loadRentedMovies() {
    fetch('../backend/php/get_rented_movies.php')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          rentedMoviesGrid.innerHTML = ''
          data.movies.forEach((movie) => {
            const movieCard = document.createElement('div')
            movieCard.classList.add('col-lg-4', 'col-md-6', 'mb-4')

            movieCard.innerHTML = `
            <div class="card movie-card">
              <img src="../img/${movie.zdj}.jpeg" class="card-img-top" alt="${movie.nazwa}">
              <div class="card-body">
                <h5 class="movie-title">${movie.nazwa}</h5>
                <p class="card-text">${movie.opis}</p>
                <p class="card-text"><strong>Data zwrotu:</strong> ${movie.data_zwrotu}</p>
              </div>
            </div>
          `
            rentedMoviesGrid.appendChild(movieCard)
          })
        } else {
          rentedMoviesGrid.innerHTML = `<p>${data.message}</p>`
        }
      })
      .catch((error) => {
        rentedMoviesGrid.innerHTML = `<p>Błąd podczas ładowania wypożyczonych filmów: ${error.message}</p>`
      })
  }
})
