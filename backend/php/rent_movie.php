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
$currentDate = date('Y-m-d'); // Bieżąca data

// Sprawdzenie, czy data zwrotu nie jest wcześniejsza niż bieżąca data
if ($date < $currentDate) {
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

// Dodanie wypożyczenia do bazy danych
$stmt = $conn->prepare("INSERT INTO wypozyczenia (id_uzytkownika, id_produktu, data_przewidywanego_zwrotu) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $userId, $movieId, $date);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Wypożyczenie zakończone sukcesem."]);
} else {
    echo json_encode(["success" => false, "message" => "Błąd podczas wypożyczania filmu."]);
}

$stmt->close();
$conn->close();
?>