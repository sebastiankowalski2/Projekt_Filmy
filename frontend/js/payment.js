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

    // Przekierowanie do strony potwierdzenia płatności
    alert('Płatność zakończona sukcesem!')
    window.location.href = 'confirmation.html'
  })
})
