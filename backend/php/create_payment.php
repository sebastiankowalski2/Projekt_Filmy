<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userId'])) {
    echo json_encode(["success" => false, "message" => "Musisz być zalogowany, aby dokonać płatności."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['movieId'])) {
    echo json_encode(["success" => false, "message" => "Brak wymaganych danych."]);
    exit();
}

$userId = $_SESSION['userId'];
$movieId = $data['movieId'];
$amount = $data['amount']; // Kwota płatności
$currentDateTime = date('Y-m-d H:i:s'); // Bieżąca data i godzina

// Połączenie z bazą danych
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "wypozyczalnia_filmow";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Błąd połączenia z bazą danych."]);
    exit();
}

// Pobierz id_wypozyczenia z tabeli wypozyczenia
$stmt = $conn->prepare("SELECT id_wypozyczenia FROM wypozyczenia WHERE id_uzytkownika = ? AND id_produktu = ? AND status = 'oczekuje'");
$stmt->bind_param("ii", $userId, $movieId);
$stmt->execute();
$stmt->bind_result($rentalId);
$stmt->fetch();
$stmt->close();

if (!$rentalId) {
    echo json_encode(["success" => false, "message" => "Nie znaleziono wypożyczenia."]);
    exit();
}

// Dodanie płatności do bazy danych z ustawieniem statusu na "oczekuje"
$stmt = $conn->prepare("INSERT INTO platnosci (id_uzytkownika, id_wypozyczenia, kwota, data_platnosci, metoda_platnosci, status) VALUES (?, ?, ?, ?, 'karta', 'oczekujące')");
$stmt->bind_param("iiss", $userId, $rentalId, $amount, $currentDateTime);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Płatność utworzona."]);
} else {
    echo json_encode(["success" => false, "message" => "Błąd podczas tworzenia płatności."]);
}

$stmt->close();
$conn->close();
?>