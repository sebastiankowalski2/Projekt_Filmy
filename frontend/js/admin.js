document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('admin-login-form')
  const adminDashboard = document.getElementById('admin-dashboard')
  const adminName = document.getElementById('admin-name')
  const adminSecCon = document.getElementById('admin-sections-content')
  const adminsections = document.getElementById('admin-sections')
  const moviesContainer = document.getElementById('movies-container')
  const rentalsContainer = document.getElementById('rentals-container')
  const editFormContainer = document.getElementById('edit-form-container')
  const editForm = document.getElementById('edit-movie-form')
  const addMovieButton = document.getElementById('add-movie-button')
  const addMovieFormContainer = document.getElementById(
    'addmovie-form-container'
  )
  const closeAddMovieModal = document.getElementById('close-addmovie-modal')
  const addMovieForm = document.getElementById('add-movie-form')

  // Dodaj przycisk "Wyloguj"
  const logoutButton = document.getElementById('logout-button')

  // Funkcja sprawdzająca sesję administratora
  const checkSession = () => {
    fetch('../backend/php/admin_backend.php')
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // Administrator zalogowany
          adminLoginForm.style.display = 'none'
          adminDashboard.style.display = 'block'
          addMovieButton.style.display = 'block'
          adminsections.style.display = 'block'
          adminSecCon.style.display = 'block'
          adminName.textContent = result.adminName
          fetchMovies() // Pobierz filmy po potwierdzeniu zalogowania
          fetchRentals() // Pobierz wypożyczenia
        } else {
          // Administrator niezalogowany
          adminLoginForm.style.display = 'block'
          adminDashboard.style.display = 'none'
          moviesContainer.innerHTML = '' // Wyczyść listę filmów
          addMovieButton.style.display = 'none'
          adminSecCon.style.display = 'none'
          adminsections.style.display = 'none'
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

  // Pobierz wypożyczenia
  // Pobierz wypożyczenia
  const fetchRentals = () => {
    fetch('../backend/php/get_rentals.php')
      .then((response) => response.json())
      .then((rentals) => {
        rentalsContainer.innerHTML = ''

        rentals.forEach((rental) => {
          const rentalElement = document.createElement('div')
          rentalElement.className = 'card mb-3'

          // Podstawowa zawartość wypożyczenia
          rentalElement.innerHTML = `
          <div class="card-body">
            <p><strong>Imię:</strong> ${rental.user_first_name}</p>
            <p><strong>Nazwisko:</strong> ${rental.user_last_name}</p>
            <p><strong>Film:</strong> ${rental.movie_name}</p>
            <p><strong>Status wypożyczenia:</strong> ${rental.rental_status}</p>
            <p><strong>Metoda płatności:</strong> ${
              rental.payment_method ?? 'Brak informacji'
            }</p>
            <p><strong>Status płatności:</strong> ${
              rental.payment_status ?? 'Brak informacji'
            }</p>
            <p><strong>Data wypożyczenia:</strong> ${new Date(
              rental.rental_date
            ).toLocaleDateString()}</p>
            <p><strong>Przewidywana data zwrotu:</strong> ${new Date(
              rental.expected_return_date
            ).toLocaleDateString()}</p>
          </div>
        `

          // Dodanie przycisku "Zapłacono na miejscu"
          if (
            rental.payment_method === 'gotówka' &&
            rental.payment_status === 'gotówka'
          ) {
            const payOnSiteButton = document.createElement('button')
            payOnSiteButton.className = 'btn btn-success'
            payOnSiteButton.textContent = 'Zapłacono na miejscu'
            payOnSiteButton.onclick = () => {
              fetch('../backend/php/update_payment.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  rental_id: rental.rental_id,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    alert('Płatność została zaktualizowana.')
                    fetchRentals() // Odśwież dane
                  } else {
                    alert('Błąd podczas aktualizacji płatności.')
                  }
                })
                .catch((error) =>
                  console.error('Błąd podczas aktualizacji płatności:', error)
                )
            }
            rentalElement
              .querySelector('.card-body')
              .appendChild(payOnSiteButton)
          }

          // Dodanie przycisku "Zwróć"
          if (rental.rental_status === 'wypożyczony') {
            const returnButton = document.createElement('button')
            returnButton.className = 'btn btn-warning'
            returnButton.textContent = 'Zwróć'
            returnButton.onclick = () => {
              fetch('../backend/php/update_rental_status.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  rental_id: rental.rental_id,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    alert('Status wypożyczenia został zaktualizowany.')
                    fetchRentals() // Odśwież dane
                  } else {
                    alert('Błąd podczas aktualizacji statusu wypożyczenia.')
                  }
                })
                .catch((error) =>
                  console.error(
                    'Błąd podczas aktualizacji statusu wypożyczenia:',
                    error
                  )
                )
            }
            rentalElement.querySelector('.card-body').appendChild(returnButton)
          }

          rentalsContainer.appendChild(rentalElement)
        })
      })
      .catch((error) =>
        console.error('Błąd podczas pobierania wypożyczeń:', error)
      )
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
