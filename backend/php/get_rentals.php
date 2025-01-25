<?php
// Dane bazy danych
$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

header('Content-Type: application/json');

try {
    // Połączenie z bazą danych
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Zapytanie do bazy danych
    $query = "
        SELECT 
            wypozyczenia.id_wypozyczenia AS rental_id,
            uzytkownicy.imie AS user_first_name,
            uzytkownicy.nazwisko AS user_last_name,
            produkty.nazwa AS movie_name,
            wypozyczenia.status AS rental_status,
            platnosci.status AS payment_status,
            platnosci.metoda_platnosci AS payment_method,
            wypozyczenia.data_wypozyczenia AS rental_date,
            wypozyczenia.data_przewidywanego_zwrotu AS expected_return_date,
            wypozyczenia.oplata_za_opoznienie AS late_fee
        FROM wypozyczenia
        INNER JOIN uzytkownicy ON wypozyczenia.id_uzytkownika = uzytkownicy.id
        INNER JOIN produkty ON wypozyczenia.id_produktu = produkty.id_produktu
        LEFT JOIN platnosci ON wypozyczenia.id_wypozyczenia = platnosci.id_wypozyczenia
        
        ORDER BY wypozyczenia.data_wypozyczenia DESC
    ";

    // Wykonanie zapytania
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    // Pobranie wyników
    $rentals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Zwrot wyników w formacie JSON
    echo json_encode($rentals);

} catch (PDOException $e) {
    // Obsługa błędów
    echo json_encode(['error' => 'Błąd połączenia z bazą danych: ' . $e->getMessage()]);
}
