<?php
// Dane bazy danych
$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

// Połączenie z bazą danych
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd połączenia z bazą danych.']);
    exit;
}

// Odczyt danych z żądania
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['rental_id'])) {
    $rental_id = $data['rental_id'];

    // Aktualizacja statusu wypożyczenia
    $query = "UPDATE wypozyczenia SET status = 'zwrócony', data_zwrotu = NOW() WHERE id_wypozyczenia = :rental_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':rental_id', $rental_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nie udało się zaktualizować danych.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane wejściowe.']);
}
?>
