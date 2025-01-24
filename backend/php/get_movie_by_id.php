<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $id = $_GET['id'];
    $query = "SELECT p.id_produktu, p.nazwa, p.opis, p.ilosc_w_magazynie, 
                     c.koszt_wypozyczenia, c.oplata_za_opoznienie 
              FROM produkty p
              LEFT JOIN cennik c ON p.id_produktu = c.id_produktu
              WHERE p.id_produktu = :id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $movie = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($movie);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd połączenia z bazą danych.']);
}
