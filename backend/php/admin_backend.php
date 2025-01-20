<?php
session_start(); // Rozpoczęcie sesji
header('Content-Type: application/json');

// Połączenie z bazą danych
$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd połączenia z bazą danych.']);
    exit;
}

// Pobierz dane z żądania
$data = json_decode(file_get_contents('php://input'), true);

// Jeśli użytkownik chce się wylogować
if (isset($data['action']) && $data['action'] === 'logout') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Wylogowano pomyślnie.']);
    exit;
}

// Logowanie użytkownika
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;

if ($email && $password) {
    // Sprawdź, czy użytkownik istnieje i ma rolę admin
    $query = "SELECT id, imie, nazwisko, haslo FROM uzytkownicy WHERE email = :email AND rola = 'admin'";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['haslo'])) {
        // Logowanie powiodło się - ustaw sesję
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_name'] = $user['imie'] . ' ' . $user['nazwisko'];

        echo json_encode([
            'success' => true,
            'firstName' => $user['imie'],
            'lastName' => $user['nazwisko']
        ]);
    } else {
        // Logowanie nie powiodło się
        echo json_encode(['success' => false, 'message' => 'Nieprawidłowe dane logowania lub brak uprawnień.']);
    }
    exit;
}

// Sprawdzenie stanu sesji
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    echo json_encode([
        'success' => true,
        'message' => 'Jesteś zalogowany.',
        'adminName' => $_SESSION['admin_name']
    ]);
    exit;
}

// Jeśli żadne dane nie zostały przesłane
echo json_encode(['success' => false, 'message' => 'Brak danych logowania.']);
?>
