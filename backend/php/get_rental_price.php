<?php
header('Content-Type: application/json');

if (!isset($_GET['movieId'], $_GET['days'])) {
    echo json_encode(["success" => false, "message" => "Brak wymaganych danych."]);
    exit();
}

$movieId = $_GET['movieId'];
$days = (int)$_GET['days'];

// Logowanie danych wejściowych
error_log("movieId: $movieId, days: $days");

// Połączenie z bazą danych
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "wypozyczalnia_filmow";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Błąd połączenia z bazą danych: " . $conn->connect_error);
    echo json_encode(["success" => false, "message" => "Błąd połączenia z bazą danych."]);
    exit();
}

// Pobierz koszt wypożyczenia z tabeli cennik
$stmt = $conn->prepare("SELECT koszt_wypozyczenia FROM cennik WHERE id_produktu = ?");
if (!$stmt) {
    error_log("Błąd przygotowania zapytania: " . $conn->error);
    echo json_encode(["success" => false, "message" => "Błąd przygotowania zapytania."]);
    exit();
}
$stmt->bind_param("i", $movieId);
$stmt->execute();
$stmt->bind_result($costPerDay);
$stmt->fetch();

if ($costPerDay) {
    $totalCost = $costPerDay * $days;
    echo json_encode(["success" => true, "price" => $totalCost]);
} else {
    error_log("Nie znaleziono cennika dla filmu o ID: $movieId");
    echo json_encode(["success" => false, "message" => "Nie znaleziono cennika dla tego filmu."]);
}

$stmt->close();
$conn->close();
?>