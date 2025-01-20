<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = [
        'id_produktu' => $_POST['id_produktu'],
        'nazwa' => $_POST['nazwa'],
        'opis' => $_POST['opis'],
        'cena' => $_POST['cena'],
        'ilosc_w_magazynie' => $_POST['ilosc_w_magazynie'],
    ];

    $query = "UPDATE produkty SET 
              nazwa = :nazwa, 
              opis = :opis, 
              cena = :cena, 
              ilosc_w_magazynie = :ilosc_w_magazynie 
              WHERE id_produktu = :id_produktu";

    $stmt = $pdo->prepare($query);
    $result = $stmt->execute($data);

    echo json_encode(['success' => $result]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd połączenia z bazą danych.']);
}
