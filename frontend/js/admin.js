document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('admin-login-form')
  const adminDashboard = document.getElementById('admin-dashboard')
  const adminName = document.getElementById('admin-name')
  const moviesContainer = document.getElementById('movies-container')
  const editFormContainer = document.getElementById('edit-form-container')
  const editForm = document.getElementById('edit-movie-form')
  const addMovieButton = document.getElementById('add-movie-button')
  const addMovieFormContainer = document.getElementById(
    'addmovie-form-container'
  )
  const closeAddMovieModal = document.getElementById('close-addmovie-modal')
  const addMovieForm = document.getElementById('add-movie-form')

  // Dodaj przycisk "Wyloguj"
  const logoutButton = document.createElement('button')
  logoutButton.className = 'btn btn-danger mt-3'
  logoutButton.textContent = 'Wyloguj się'
  adminDashboard.appendChild(logoutButton)

  // Funkcja sprawdzająca sesję administratora
  const checkSession = () => {
    fetch('../backend/php/admin_backend.php')
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Administrator zalogowany
          adminLoginForm.style.display = 'none'
          adminDashboard.style.display = 'block'
          adminName.textContent = result.adminName
          fetchMovies() // Pobierz filmy po potwierdzeniu zalogowania
        } else {
          // Administrator niezalogowany
          adminLoginForm.style.display = 'block'
          adminDashboard.style.display = 'none'
          moviesContainer.innerHTML = '' // Wyczyść listę filmów
        }
      })
      .catch((error) => console.error('Błąd sprawdzania sesji:', error))
  }

  // Obsługa logowania
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.getElementById('admin-email').value
    const password = document.getElementById('admin-password').value

    fetch('../backend/php/admin_backend.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Zalogowano pomyślnie
          checkSession()
        } else {
          alert('Błąd logowania: ' + result.message)
        }
      })
      .catch((error) => console.error('Błąd:', error))
  })

  // Obsługa wylogowania
  logoutButton.addEventListener('click', () => {
    fetch('../backend/php/admin_backend.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Wylogowano - przejdź do formularza logowania
          checkSession()
        } else {
          alert('Błąd podczas wylogowania: ' + result.message)
        }
      })
      .catch((error) => console.error('Błąd wylogowania:', error))
  })

  // Pobierz listę filmów
  const fetchMovies = () => {
    fetch('../backend/php/get_movies.php')
      .then((response) => response.json())
      .then((movies) => {
        moviesContainer.innerHTML = '' // Wyczyść listę przed załadowaniem

        movies.forEach((movie) => {
          const movieElement = document.createElement('div')
          movieElement.className = 'card mb-3'
          movieElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${movie.nazwa}</h5>
      <p class="card-text">${movie.opis}</p>
      <p class="card-text"><strong>Koszt wypożyczenia:</strong> ${movie.koszt_wypozyczenia} zł</p>
      <p class="card-text"><strong>Opłata za opóźnienie:</strong> ${movie.oplata_za_opoznienie} zł</p>
      <button class="btn btn-warning edit-button" data-id="${movie.id_produktu}">Edytuj</button>
    </div>
  `

          moviesContainer.appendChild(movieElement)
        })

        // Dodaj obsługę kliknięcia przycisku "Edytuj"
        document.querySelectorAll('.edit-button').forEach((button) => {
          button.addEventListener('click', () => {
            const movieId = button.dataset.id
            openEditForm(movieId)
          })
        })
      })
      .catch((error) => console.error('Błąd podczas pobierania filmów:', error))
  }

  // Otwórz formularz edycji
  const openEditForm = (movieId) => {
    fetch(`../backend/php/get_movie_by_id.php?id=${movieId}`)
      .then((response) => response.json())
      .then((movie) => {
        editForm['id_produktu'].value = movie.id_produktu
        editForm['nazwa'].value = movie.nazwa
        editForm['opis'].value = movie.opis
        editForm['ilosc_w_magazynie'].value = movie.ilosc_w_magazynie
        editForm['koszt_wypozyczenia'].value = movie.koszt_wypozyczenia
        editForm['oplata_za_opoznienie'].value = movie.oplata_za_opoznienie

        // Otwórz modal
        const editModal = new bootstrap.Modal(
          document.getElementById('edit-form-container')
        )
        editModal.show()
      })
      .catch((error) =>
        console.error('Błąd podczas pobierania szczegółów filmu:', error)
      )
  }

  // Obsługa zapisania zmian
  editForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(editForm)

    fetch('../backend/php/update_movie.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert('Film został zaktualizowany.')

          // Zamknij modal
          const editModal = bootstrap.Modal.getInstance(
            document.getElementById('edit-form-container')
          )
          editModal.hide()

          // Odśwież listę filmów
          fetchMovies()
        } else {
          alert('Błąd podczas aktualizacji filmu: ' + result.message)
        }
      })
      .catch((error) =>
        console.error('Błąd podczas aktualizacji filmu:', error)
      )
  })

  // Pokaż modal
  addMovieButton.addEventListener('click', () => {
    addMovieFormContainer.style.display = 'block'
  })

  // Zamknij modal
  closeAddMovieModal.addEventListener('click', () => {
    addMovieFormContainer.style.display = 'none'
  })

  // Obsługa dodawania filmu
  addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(addMovieForm)

    fetch('../backend/php/add_movie.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert('Film został dodany.')
          addMovieFormContainer.style.display = 'none'
          fetchMovies() // Odśwież listę filmów
        } else {
          alert('Błąd podczas dodawania filmu: ' + result.message)
        }
      })
      .catch((error) => console.error('Błąd podczas dodawania filmu:', error))
  })

  // Inicjalizacja - sprawdzanie sesji przy starcie
  checkSession()
})
