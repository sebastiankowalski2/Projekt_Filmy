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

// Pobieranie danych z tabeli produkty i cennik
$sql = "
    SELECT p.id_produktu, p.nazwa, p.opis, p.zdj, c.koszt_wypozyczenia AS cena
    FROM produkty p
    LEFT JOIN cennik c ON p.id_produktu = c.id_produktu
    WHERE p.typ = 'stacjonarny'
";
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
