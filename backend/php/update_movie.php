<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Pobierz dane z żądania POST
    $dataProdukty = [
        'id_produktu' => $_POST['id_produktu'],
        'nazwa' => $_POST['nazwa'],
        'opis' => $_POST['opis'],
        'ilosc_w_magazynie' => $_POST['ilosc_w_magazynie'],
    ];

    $dataCennik = [
        'id_produktu' => $_POST['id_produktu'],
        'koszt_wypozyczenia' => $_POST['koszt_wypozyczenia'],
        'oplata_za_opoznienie' => $_POST['oplata_za_opoznienie'],
    ];

    // Rozpocznij transakcję
    $pdo->beginTransaction();

    // Aktualizacja tabeli produkty
    $queryProdukty = "UPDATE produkty SET 
                      nazwa = :nazwa, 
                      opis = :opis, 
                      ilosc_w_magazynie = :ilosc_w_magazynie 
                      WHERE id_produktu = :id_produktu";
    $stmtProdukty = $pdo->prepare($queryProdukty);
    $stmtProdukty->execute($dataProdukty);

    // Aktualizacja tabeli cennik
    $queryCennik = "UPDATE cennik SET 
                    koszt_wypozyczenia = :koszt_wypozyczenia, 
                    oplata_za_opoznienie = :oplata_za_opoznienie 
                    WHERE id_produktu = :id_produktu";
    $stmtCennik = $pdo->prepare($queryCennik);
    $stmtCennik->execute($dataCennik);

    // Zatwierdź transakcję
    $pdo->commit();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    // Wycofaj transakcję w przypadku błędu
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Błąd podczas aktualizacji danych.', 'error' => $e->getMessage()]);
}
