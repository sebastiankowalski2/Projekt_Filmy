document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm')
  const loginContainer = document.getElementById('loginContainer')
  const dashboard = document.getElementById('dashboard')
  const logoutButton = document.getElementById('logoutButton')
  const problemReportsList = document.getElementById('problemReportsList')
  const tabs = document.querySelectorAll('.tab-button')
  const tabContents = document.querySelectorAll('.tab-content')

  // Logowanie
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(loginForm)
    try {
      const response = await fetch('../backend/php/admin_backend.php', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        sessionStorage.setItem('admin_id', result.admin_id)
        loginContainer.style.display = 'none'
        logoutButton.style.display = 'block'
        loadDashboard(result.admin_id)
        loadProblemReports(result.admin_id)
        showTab('dashboard')
      } else {
        alert('Login failed: ' + result.message)
      }
    } catch (error) {
      console.error('Error during login:', error)
      alert('An error occurred during login.')
    }
  })

  // Wylogowanie
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch(
        '../backend/php/admin_backend.php?logout=true'
      )
      const result = await response.json()

      if (result.success) {
        sessionStorage.removeItem('admin_id')
        loginContainer.style.display = 'flex'
        logoutButton.style.display = 'none'
        dashboard.style.display = 'none'
        problemReportsList.innerHTML = '' // Clear problem reports list
      } else {
        alert('Failed to log out: ' + result.message)
      }
    } catch (error) {
      console.error('Error during logout:', error)
      alert('An error occurred during logout.')
    }
  })

  // Sprawdzenie sesji
  const adminId = sessionStorage.getItem('admin_id')
  if (adminId) {
    loginContainer.style.display = 'none'
    logoutButton.style.display = 'block'
    loadDashboard(adminId)
    loadProblemReports(adminId)
    showTab('dashboard')
  }

  async function loadDashboard(adminId) {
    try {
      const response = await fetch(
        `../backend/php/admin_backend.php?admin_id=${adminId}`
      )
      const result = await response.json()

      if (result.success) {
        dashboard.style.display = 'grid'
        dashboard.innerHTML = ''

        result.parkings.forEach((parking) => {
          const parkingDiv = document.createElement('div')
          parkingDiv.className = 'dashboard-item'
          parkingDiv.innerHTML = `
        <h3>${parking.Nazwa}</h3>
        <p><strong>Location:</strong> ${parking.Lokalizacja}</p>
        <p><strong>Capacity:</strong> ${parking.Liczba_Miejsc}</p>
        <p><strong>Available spots:</strong> ${parking.AvailableSpots}</p>
        <p><strong>Type:</strong> ${parking.Typ}</p>
        <button class="edit-parking-btn button-neutral" data-id="${
          parking.ID_Parkingu
        }" 
                data-name="${parking.Nazwa}" 
                data-location="${parking.Lokalizacja}" 
                data-type="${parking.Typ}">
          Edit Parking
        </button>
        <div class="pricing">
            <h4>Pricing:</h4>
            ${parking.cennik
              .map(
                (cennik) => `
                <p><strong>${cennik.Typ_Ceny}:</strong> ${cennik.Cena} PLN</p>
              `
              )
              .join('')}
            <button
                class="edit-pricing-btn button-neutral"
                data-id="${parking.ID_Parkingu}" 
                data-hourly="${
                  parking.cennik.find((c) => c.Typ_Ceny === 'Za godzinę')
                    ?.Cena || 0
                }" 
                data-daily="${
                  parking.cennik.find((c) => c.Typ_Ceny === 'Za dzień')?.Cena ||
                  0
                }" 
                data-monthly="${
                  parking.cennik.find((c) => c.Typ_Ceny === 'Za miesiąc')
                    ?.Cena || 0
                }"
              >
                Edit Pricing
            </button>

        </div>
    `
          dashboard.appendChild(parkingDiv)
        })

        // Obsługa przycisków edycji parkingu
        document.querySelectorAll('.edit-parking-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const { id, name, location, type } = e.target.dataset

            // Wypełnij pola formularza
            document.getElementById('editParkingId').value = id
            document.getElementById('editParkingName').value = name
            document.getElementById('editParkingLocation').value = location
            document.getElementById('editParkingType').value = type

            // Pokaż formularz i nakładkę
            document
              .getElementById('editParkingFormContainer')
              .classList.add('active')
            document.getElementById('overlay').classList.add('active')
          })
        })

        // Obsługa przycisków edycji cennika
        document.querySelectorAll('.edit-pricing-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const { id, hourly, daily, monthly } = e.target.dataset

            // Wypełnij pola formularza
            document.getElementById('editPricingId').value = id
            document.getElementById('editHourlyRate').value =
              parseFloat(hourly) || 0 // Domyślna wartość 0
            document.getElementById('editDailyRate').value =
              parseFloat(daily) || 0
            document.getElementById('editMonthlyRate').value =
              parseFloat(monthly) || 0

            // Pokaż formularz i nakładkę
            document
              .getElementById('editPricingFormContainer')
              .classList.add('active')
            document.getElementById('overlay').classList.add('active')
          })
        })
      } else {
        alert('Failed to load dashboard: ' + result.message)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      alert('An error occurred while loading the dashboard.')
    }
  }

  async function loadProblemReports(adminId) {
    try {
      const response = await fetch(
        `../backend/php/get_problem_reports.php?admin_id=${adminId}`
      )
      const result = await response.json()

      if (result.success) {
        problemReportsList.innerHTML = ''

        result.problems.forEach((problem) => {
          const li = document.createElement('li')
          li.innerHTML = `
            <p><strong>Parking Name:</strong> ${problem.Nazwa_Parkingu}</p>
            <p><strong>User Email:</strong> ${problem.Email}</p>
            <p><strong>Description:</strong> ${problem.Opis_Problemu}</p>
            <p class="report-date"><strong>Date:</strong> ${problem.Data_Zgloszenia}</p>
            <button class="complete-report-btn button-neutral" data-id="${problem.ID_Zgloszenia}">Close Report</button>
          `
          problemReportsList.appendChild(li)
        })

        // Obsługa przycisków zakończenia zgłoszenia
        document.querySelectorAll('.complete-report-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            const reportId = e.target.dataset.id
            try {
              const response = await fetch(
                `../backend/php/complete_report.php?report_id=${reportId}`,
                { method: 'POST' }
              )
              const result = await response.json()
              if (result.success) {
                alert('Report closed successfully!')
                loadProblemReports(adminId) // Odśwież listę zgłoszeń
              } else {
                alert('Closing the report failed: ' + result.message)
              }
            } catch (error) {
              console.error('Error completing report:', error)
              alert('Closing the report failed.')
            }
          })
        })
      } else {
        alert('Failed to load problem reports: ' + result.message)
      }
    } catch (error) {
      console.error('Error loading problem reports:', error)
      alert('An error occurred while loading the problem reports.')
    }
  }

  // Obsługa zapisywania edytowanego parkingu
  document
    .getElementById('editParkingForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault()

      const formData = new FormData(e.target)
      const response = await fetch('../backend/php/admin_backend.php', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        alert('Parking updated successfully!')
        document.getElementById('editParkingFormContainer').style.display =
          'none'
        //loadDashboard(sessionStorage.getItem('admin_id'))
        location.reload()
      } else {
        alert('Failed to update parking: ' + result.message)
      }
    })

  // Obsługa zapisywania edytowanego cennika
  document
    .getElementById('editPricingForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault()

      const formData = new FormData(e.target)
      const response = await fetch('../backend/php/admin_backend.php', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        alert('Pricing updated successfully!')
        document.getElementById('editPricingFormContainer').style.display =
          'none'
        //loadDashboard(sessionStorage.getItem('admin_id'))
        location.reload()
      } else {
        alert('Failed to update pricing: ' + result.message)
      }
    })

  // Obsługa anulowania edycji
  document
    .getElementById('closeEditParkingForm')
    .addEventListener('click', () => {
      document
        .getElementById('editParkingFormContainer')
        .classList.remove('active')
      document.getElementById('overlay').classList.remove('active')
    })

  document
    .getElementById('closeEditPricingForm')
    .addEventListener('click', () => {
      document
        .getElementById('editPricingFormContainer')
        .classList.remove('active')
      document.getElementById('overlay').classList.remove('active')
    })

  // Zamknij formularze po kliknięciu w nakładkę
  document.getElementById('overlay').addEventListener('click', () => {
    document.querySelectorAll('.form-container').forEach((form) => {
      form.classList.remove('active')
    })
    document.getElementById('overlay').classList.remove('active')
  })

  // Obsługa zakładek (tabs)
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'))
      tab.classList.add('active')
      showTab(tab.dataset.tab)
    })
  })

  function showTab(tabName) {
    tabContents.forEach((content) => {
      content.style.display = content.id === tabName ? 'grid' : 'none'
    })
  }

  document
    .getElementById('generateReportButton')
    .addEventListener('click', function () {
      document.getElementById('reportForm').style.display = 'block'
    })

  document
    .getElementById('reportFormElement')
    .addEventListener('submit', async function (event) {
      event.preventDefault()
      const startDate = document.getElementById('startDate').value
      const endDate = document.getElementById('endDate').value

      if (new Date(startDate) > new Date(endDate)) {
        alert('Start Date cannot be later than End Date.')
        return
      }

      try {
        const response = await fetch('../backend/php/generate_report.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ startDate, endDate }),
        })

        if (!response.ok) throw new Error('Error generating report')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `report_${startDate}_to_${endDate}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        alert('Report generated successfully!')
      } catch (error) {
        alert('Failed to generate report: ' + error.message)
      }
    })
})
