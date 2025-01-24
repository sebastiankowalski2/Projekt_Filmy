<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $query = "SELECT p.id_produktu, p.nazwa, p.opis, p.typ, 
                     p.ilosc_w_magazynie, p.data_dodania, p.data_aktualizacji, p.zdj,
                     c.koszt_wypozyczenia, c.oplata_za_opoznienie 
              FROM produkty p
              LEFT JOIN cennik c ON p.id_produktu = c.id_produktu";
    $stmt = $pdo->query($query);
    $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($movies);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Błąd połączenia z bazą danych.']);
}
