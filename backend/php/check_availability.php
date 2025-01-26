<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userId'])) {
    echo json_encode(["success" => false, "message" => "Musisz być zalogowany, aby sprawdzić dostępność."]);
    exit();
}

if (!isset($_GET['movieId'])) {
    echo json_encode(["success" => false, "message" => "Brak wymaganych danych."]);
    exit();
}

$movieId = $_GET['movieId'];

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

// Pobierz ilość w magazynie
$stmt = $conn->prepare("SELECT ilosc_w_magazynie FROM produkty WHERE id_produktu = ?");
$stmt->bind_param("i", $movieId);
$stmt->execute();
$stmt->bind_result($ilosc_w_magazynie);
$stmt->fetch();
$stmt->close();

if (!$ilosc_w_magazynie) {
    echo json_encode(["success" => false, "message" => "Nie znaleziono produktu."]);
    exit();
}

// Pobierz ilość wypożyczonych produktów
$stmt = $conn->prepare("SELECT COUNT(*) FROM wypozyczenia WHERE id_produktu = ? AND (status = 'wypożyczony' OR status = 'odbiór')");
$stmt->bind_param("i", $movieId);
$stmt->execute();
$stmt->bind_result($ilosc_wypozyczonych);
$stmt->fetch();
$stmt->close();

if ($ilosc_wypozyczonych >= $ilosc_w_magazynie) {
    echo json_encode(["success" => false, "message" => "Nie można wypożyczyć tego filmu - brak w magazynie."]);
} else {
    echo json_encode(["success" => true, "message" => "Produkt dostępny."]);
}

$conn->close();
?>