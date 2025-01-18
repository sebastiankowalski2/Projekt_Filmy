<?php
header('Content-Type: text/plain'); // Odpowiedź w formacie tekstowym

// Połączenie z bazą danych
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "wypozyczalnia_filmow";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Pobieranie danych z formularza
$firstname = $_POST['firstname'];
$lastname = $_POST['lastname'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

// Sprawdzanie, czy email już istnieje
$sql_check = "SELECT email FROM uzytkownicy WHERE email = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("s", $email);
$stmt_check->execute();
$stmt_check->store_result();

if ($stmt_check->num_rows > 0) {
    echo "Email already exists!";
    $stmt_check->close();
    $conn->close();
    exit();
}

// Wstawianie danych do tabeli
$sql = "INSERT INTO uzytkownicy (Imie, Nazwisko, haslo, email, rola) VALUES (?, ?, ?, ?, 'uzytkownik')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $firstname, $lastname, $password, $email);

if ($stmt->execute()) {
    echo "Registration successful!";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
