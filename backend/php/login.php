<?php
header('Content-Type: application/json');

// Sprawdzanie metody żądania
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}

// Pobieranie danych JSON z żądania
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'], $data['password'])) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit();
}

$email = $data['email'];
$password = $data['password'];

// Połączenie z bazą danych
$servername = "localhost";
$username = "root";
$dbpassword = "";
$dbname = "wypozyczalnia_filmow";

$conn = new mysqli($servername, $username, $dbpassword, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// Pobieranie ID użytkownika, hasła, imienia i nazwiska
$stmt = $conn->prepare("SELECT id, haslo, Imie, Nazwisko FROM uzytkownicy WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($userId, $hashedPassword, $firstName, $lastName);
$stmt->fetch();

if ($userId && password_verify($password, $hashedPassword)) {
    session_start();
    $_SESSION['userId'] = $userId;
    $_SESSION['firstName'] = $firstName;
    $_SESSION['lastName'] = $lastName;

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "firstName" => $firstName ?? "Unknown",
        "lastName" => $lastName ?? "Unknown"
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials."]);
}

$stmt->close();
$conn->close();
?>
