<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Dane bazy danych
$host = 'localhost';
$dbname = 'wypozyczalnia_filmow';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Pobierz dane z żądania POST
    $dataProdukty = [
        'nazwa' => $_POST['nazwa'],
        'opis' => $_POST['opis'],
        'typ' => $_POST['typ'],
        'url_ogladania' => $_POST['url_ogladania'] ?? null,
        'ilosc_w_magazynie' => $_POST['ilosc_w_magazynie'],
        'zdj' => null,
    ];

    $dataCennik = [
        'koszt_wypozyczenia' => $_POST['koszt_wypozyczenia'],
        'oplata_za_opoznienie' => $_POST['oplata_za_opoznienie'],
    ];

    // Obsługa zdjęcia
if (isset($_FILES['zdj']) && $_FILES['zdj']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'G:/XAMPP/htdocs/Projekt_Filmy/img/';
    $fileName = pathinfo($_FILES['zdj']['name'], PATHINFO_FILENAME); // Pobranie nazwy pliku bez rozszerzenia
    $fileExtension = pathinfo($_FILES['zdj']['name'], PATHINFO_EXTENSION); // Pobranie rozszerzenia
    $uploadFile = $uploadDir . $fileName . '.' . $fileExtension;

    if (move_uploaded_file($_FILES['zdj']['tmp_name'], $uploadFile)) {
        $dataProdukty['zdj'] = $fileName; // Zapisz nazwę pliku bez rozszerzenia do bazy
    } else {
        echo json_encode(['success' => false, 'message' => 'Błąd podczas przesyłania zdjęcia.']);
        exit;
    }
}



    // Rozpocznij transakcję
    $pdo->beginTransaction();

    // Wstaw rekord do tabeli produkty
    $queryProdukty = "INSERT INTO produkty (nazwa, opis, typ, url_ogladania, ilosc_w_magazynie, zdj)
                      VALUES (:nazwa, :opis, :typ, :url_ogladania, :ilosc_w_magazynie, :zdj)";
    $stmtProdukty = $pdo->prepare($queryProdukty);
    $stmtProdukty->execute($dataProdukty);

    // Pobierz ID nowo dodanego produktu
    $id_produktu = $pdo->lastInsertId();

    // Wstaw rekord do tabeli cennik
    $queryCennik = "INSERT INTO cennik (id_produktu, koszt_wypozyczenia, oplata_za_opoznienie)
                    VALUES (:id_produktu, :koszt_wypozyczenia, :oplata_za_opoznienie)";
    $stmtCennik = $pdo->prepare($queryCennik);
    $dataCennik['id_produktu'] = $id_produktu;
    $stmtCennik->execute($dataCennik);

    // Zatwierdź transakcję
    $pdo->commit();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    // Wycofaj transakcję w przypadku błędu
$pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'Błąd podczas dodawania danych.',
        'error' => $e->getMessage(),
    ]);
}
?>
