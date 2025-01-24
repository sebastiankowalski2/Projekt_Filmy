<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userId'])) {
    echo json_encode(["success" => false, "message" => "Musisz być zalogowany, aby potwierdzić płatność."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['movieId'], $data['amount'], $data['paymentMethod'])) {
    echo json_encode(["success" => false, "message" => "Brak wymaganych danych."]);
    exit();
}

$userId = $_SESSION['userId'];
$movieId = $data['movieId'];
$amount = $data['amount'];
$paymentMethod = $data['paymentMethod'];

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

// Rozpocznij transakcję
$conn->begin_transaction();

try {
    if ($paymentMethod === 'karta') {
        // Zaktualizowanie statusu płatności na "opłacono"
        $stmt = $conn->prepare("UPDATE platnosci SET status = 'opłacono', kwota = ?, metoda_platnosci = ? WHERE id_uzytkownika = ? AND id_wypozyczenia = (SELECT id_wypozyczenia FROM wypozyczenia WHERE id_uzytkownika = ? AND id_produktu = ? AND status = 'oczekuje' LIMIT 1)");
        $stmt->bind_param("dsiii", $amount, $paymentMethod, $userId, $userId, $movieId);
        $stmt->execute();
        $stmt->close();

        // Zaktualizowanie statusu wypożyczenia na "wypożyczony"
        $stmt = $conn->prepare("UPDATE wypozyczenia SET status = 'wypożyczony' WHERE id_uzytkownika = ? AND id_produktu = ? AND status = 'oczekuje' LIMIT 1");
        $stmt->bind_param("ii", $userId, $movieId);
        $stmt->execute();
        $stmt->close();
    } else {
        // Zaktualizowanie metody płatności na "gotówka"
        $stmt = $conn->prepare("UPDATE platnosci SET metoda_platnosci = ? WHERE id_uzytkownika = ? AND id_wypozyczenia = (SELECT id_wypozyczenia FROM wypozyczenia WHERE id_uzytkownika = ? AND id_produktu = ? AND status = 'oczekuje' LIMIT 1)");
        $stmt->bind_param("siii", $paymentMethod, $userId, $userId, $movieId);
        $stmt->execute();
        $stmt->close();

        // Zaktualizowanie statusu wypożyczenia na "oczekuje" (jeśli gotówka)
        $stmt = $conn->prepare("UPDATE wypozyczenia SET status = 'oczekuje' WHERE id_uzytkownika = ? AND id_produktu = ? AND status = 'oczekuje' LIMIT 1");
        $stmt->bind_param("ii", $userId, $movieId);
        $stmt->execute();
        $stmt->close();
    }

    // Zatwierdź transakcję
    $conn->commit();

    echo json_encode(["success" => true, "message" => "Status wypożyczenia zmieniony na '" . ($paymentMethod === 'karta' ? "wypożyczony i status płatności zmieniony na 'opłacono'." : "oczekuje'.")]);
} catch (Exception $e) {
    // Wycofaj transakcję w przypadku błędu
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Błąd podczas zmiany statusu: " . $e->getMessage()]);
}

$conn->close();
?>