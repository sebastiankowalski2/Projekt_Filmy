<?php
header('Content-Type: application/json');

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

// Pobieranie danych z tabeli produkty
$sql = "SELECT nazwa, opis, CAST(cena AS DECIMAL(10, 2)) AS cena, zdj FROM produkty WHERE typ = 'stacjonarny'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $movies = [];
    while ($row = $result->fetch_assoc()) {
        $movies[] = $row;
    }
    echo json_encode(["success" => true, "movies" => $movies]);
} else {
    echo json_encode(["success" => false, "message" => "Brak dostępnych filmów."]);
}

$conn->close();
?>
