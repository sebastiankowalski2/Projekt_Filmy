<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userId'])) {
    echo json_encode(["success" => false, "message" => "Musisz być zalogowany, aby wypożyczyć film."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['movieId'], $data['date'])) {
    echo json_encode(["success" => false, "message" => "Brak wymaganych danych."]);
    exit();
}

$userId = $_SESSION['userId'];
$movieId = $data['movieId'];
$date = $data['date'];
$currentDateTime = date('Y-m-d H:i:s'); // Bieżąca data i godzina

// Sprawdzenie, czy data zwrotu nie jest wcześniejsza niż bieżąca data
if ($date < $currentDateTime) {
    echo json_encode(["success" => false, "message" => "Data zwrotu nie może być wcześniejsza niż bieżąca data."]);
    exit();
}

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

// Dodanie wypożyczenia do bazy danych z ustawieniem statusu na "oczekuje"
$stmt = $conn->prepare("INSERT INTO wypozyczenia (id_uzytkownika, id_produktu, data_wypozyczenia, data_przewidywanego_zwrotu, status) VALUES (?, ?, ?, ?, 'oczekuje')");
$stmt->bind_param("iiss", $userId, $movieId, $currentDateTime, $date);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Status ustawiony na 'oczekuje'."]);
} else {
    echo json_encode(["success" => false, "message" => "Błąd podczas ustawiania statusu."]);
}

$stmt->close();
$conn->close();
?>