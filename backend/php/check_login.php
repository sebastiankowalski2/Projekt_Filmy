<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['userId'])) {
    $response = [
        "loggedIn" => true,
        "firstName" => $_SESSION['firstName'] ?? "Unknown", // Pobierz imię z sesji
        "lastName" => $_SESSION['lastName'] ?? "Unknown",   // Pobierz nazwisko z sesji
    ];
    echo json_encode($response);
} else {
    echo json_encode(["loggedIn" => false]);
}
?>
