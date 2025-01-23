<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userId'])) {
    echo json_encode(["success" => false, "message" => "Musisz być zalogowany, aby potwierdzić płatność."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['movieId'])) {
    echo json_encode(["success" => false, "message" => "Brak wymaganych danych."]);
    exit();
}

$userId = $_SESSION['userId'];
$movieId = $data['movieId'];

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

// Zaktualizowanie statusu na "wypożyczony"
$stmt = $conn->prepare("UPDATE wypozyczenia SET status = 'wypożyczony' WHERE id_uzytkownika = ? AND id_produktu = ? AND status = 'oczekuje'");
$stmt->bind_param("ii", $userId, $movieId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Status zmieniony na 'wypożyczony'."]);
} else {
    echo json_encode(["success" => false, "message" => "Błąd podczas zmiany statusu."]);
}

$stmt->close();
$conn->close();
?>