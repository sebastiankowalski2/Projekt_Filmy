document.addEventListener('DOMContentLoaded', () => {
  const paymentHistoryTab = document.getElementById('payment-history-tab')
  const paymentHistoryGrid = document.getElementById('payment-history-grid')

  // Funkcja do załadowania historii płatności
  function loadPaymentHistory() {
    fetch('../backend/php/get_payment_history.php')
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          paymentHistoryGrid.innerHTML = ''
          data.payments.forEach((payment) => {
            const paymentCard = document.createElement('div')
            paymentCard.classList.add('col-lg-4', 'col-md-6', 'mb-4')

            paymentCard.innerHTML = `
            <div class="card payment-card">
              <div class="card-body">
                <h5 class="payment-title">${payment.nazwa}</h5>
                <p class="card-text"><strong>Kwota:</strong> ${payment.kwota} PLN</p>
                <p class="card-text"><strong>Data płatności:</strong> ${payment.data_platnosci}</p>
                <p class="card-text"><strong>Metoda płatności:</strong> ${payment.metoda_platnosci}</p>
                <p class="card-text"><strong>Status:</strong> ${payment.status}</p>
              </div>
            </div>
          `
            paymentHistoryGrid.appendChild(paymentCard)
          })
        } else {
          paymentHistoryGrid.innerHTML = `<p>${data.message}</p>`
        }
      })
      .catch((error) => {
        paymentHistoryGrid.innerHTML = `<p>Błąd podczas ładowania historii płatności: ${error.message}</p>`
      })
  }

  // Załaduj historię płatności po kliknięciu zakładki
  paymentHistoryTab.addEventListener('click', loadPaymentHistory)
})
