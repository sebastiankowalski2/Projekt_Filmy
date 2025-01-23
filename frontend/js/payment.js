document.addEventListener('DOMContentLoaded', () => {
  const paymentForm = document.getElementById('payment-form')

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

    // Pobierz movieId z URL
    const urlParams = new URLSearchParams(window.location.search)
    const movieId = urlParams.get('movieId')

    // Zmień status na "wypożyczony"
    fetch('../backend/php/confirm_payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert(
            'Płatność zakończona sukcesem! Status zmieniony na "wypożyczony".'
          )
          window.location.href = 'confirmation.html'
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
