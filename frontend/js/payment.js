document.addEventListener('DOMContentLoaded', () => {
  const paymentForm = document.getElementById('payment-form')

  // Pobierz movieId i amount z URL
  const urlParams = new URLSearchParams(window.location.search)
  const movieId = urlParams.get('movieId')
  const amount = parseFloat(urlParams.get('amount'))

  // Ustaw kwotę płatności w polu formularza
  document.getElementById('amount').value = `${amount.toFixed(2)} PLN`

  // Utwórz rekord płatności o statusie "oczekuje"
  fetch('../backend/php/create_payment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movieId, amount }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (!result.success) {
        alert('Błąd tworzenia płatności: ' + result.message)
      }
    })
    .catch((error) => {
      console.error('Błąd:', error)
      alert('Wystąpił błąd podczas tworzenia płatności.')
    })

  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Pobierz dane z formularza
    const cardNumber = document.getElementById('card-number').value
    const expiryDate = document.getElementById('expiry-date').value
    const cvv = document.getElementById('cvv').value

    // Przykładowa walidacja danych karty
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      alert('Nieprawidłowy numer karty')
      return
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      alert('Nieprawidłowa data ważności')
      return
    }

    if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
      alert('Nieprawidłowy CVV')
      return
    }

    // Zmień status na "wypożyczony"
    fetch('../backend/php/confirm_payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId, amount }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert(
            'Płatność zakończona sukcesem! Status zmieniony na "wypożyczony".'
          )
          window.location.href = `confirmation.html?movieId=${movieId}&amount=${amount}`
        } else {
          alert('Błąd zmiany statusu: ' + result.message)
        }
      })
      .catch((error) => {
        console.error('Błąd:', error)
        alert('Wystąpił błąd podczas zmiany statusu.')
      })
  })
})
