<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userId'])) {
    echo json_encode(["success" => false, "message" => "Musisz być zalogowany, aby zobaczyć historię płatności."]);
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

// Pobierz historię płatności użytkownika
$stmt = $conn->prepare("
    SELECT p.nazwa, pl.kwota, pl.data_platnosci, pl.metoda_platnosci, pl.status
    FROM platnosci pl
    JOIN wypozyczenia w ON pl.id_wypozyczenia = w.id_wypozyczenia
    JOIN produkty p ON w.id_produktu = p.id_produktu
    WHERE pl.id_uzytkownika = ?
    ORDER BY pl.data_platnosci DESC
");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$payments = [];
while ($row = $result->fetch_assoc()) {
    $payments[] = $row;
}

if (count($payments) > 0) {
    echo json_encode(["success" => true, "payments" => $payments]);
} else {
    echo json_encode(["success" => false, "message" => "Brak historii płatności."]);
}

$stmt->close();
$conn->close();
?>