<?php 
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $connect = mysqli_connect("localhost", "root", "", "prefume_db");

    if (!$connect) {
        echo json_encode(["message" => "Connection failed"]);
        exit;
    }
    
if (!isset($_POST["product_id"]) || !isset($_POST["quantity"])) {
        echo json_encode(["message" => "Missing data"]);
        exit;
    }

    $product_id = $_POST["product_id"];
    $quantity = $_POST["quantity"];

    if ($quantity <= 0) {
        echo json_encode(["message" => "Invalid quantity"]);
        exit;
    }

    $checkStmt = mysqli_prepare($connect, "SELECT quantity FROM carts WHERE product_id = ?");
    mysqli_stmt_bind_param($checkStmt, "i", $product_id);
    mysqli_stmt_execute($checkStmt);

    $result = mysqli_stmt_get_result($checkStmt);

    if ($row = mysqli_fetch_assoc($result)) {

        $newQuantity = $row["quantity"] + $quantity;

        $updateStmt = mysqli_prepare($connect, "UPDATE carts SET quantity = ? WHERE product_id = ?");
        mysqli_stmt_bind_param($updateStmt, "ii", $newQuantity, $product_id);

        if (mysqli_stmt_execute($updateStmt)) {
            echo json_encode(["message" => "Quantity updated"]);
        } else {
            echo json_encode(["message" => "Update failed"]);
        }

        mysqli_stmt_close($updateStmt);

    } else {

        $insertStmt = mysqli_prepare($connect, "INSERT INTO carts (product_id, quantity) VALUES (?, ?)");
        mysqli_stmt_bind_param($insertStmt, "ii", $product_id, $quantity);

        if (mysqli_stmt_execute($insertStmt)) {
            echo json_encode(["message" => "Product added to cart"]);
        } else {
            echo json_encode(["message" => "Insert failed"]);
        }

        mysqli_stmt_close($insertStmt);
    }

    mysqli_stmt_close($checkStmt);
    mysqli_close($connect);

} else {
    echo json_encode(["message" => "Invalid request"]);
}