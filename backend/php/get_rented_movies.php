<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userId'])) {
    echo json_encode(["success" => false, "message" => "Musisz być zalogowany, aby zobaczyć wypożyczone filmy."]);
    exit();
}

$userId = $_SESSION['userId'];

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

// Pobierz wypożyczone filmy użytkownika
$stmt = $conn->prepare("
    SELECT p.nazwa, p.opis, p.zdj, w.data_przewidywanego_zwrotu AS data_zwrotu
    FROM wypozyczenia w
    JOIN produkty p ON w.id_produktu = p.id_produktu
    WHERE w.id_uzytkownika = ? AND w.data_przewidywanego_zwrotu > NOW()
");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$movies = [];
while ($row = $result->fetch_assoc()) {
    $movies[] = $row;
}

if (count($movies) > 0) {
    echo json_encode(["success" => true, "movies" => $movies]);
} else {
    echo json_encode(["success" => false, "message" => "Brak wypożyczonych filmów."]);
}

$stmt->close();
$conn->close();
?>