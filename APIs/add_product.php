<?php
header("Content-Type: application/json");
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $connect = mysqli_connect("localhost", "root", "", "prefume_db");
    if (!$connect) {
        echo json_encode(["message" => "Connection failed"]);
        exit;
    }

    $name = $_POST["name"];
    $price = $_POST["price"];

    $stmt = mysqli_prepare($connect, "INSERT INTO products (name, price) VALUES (?, ?)");

    mysqli_stmt_bind_param($stmt, "sd", $name, $price);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["message" => "Product added successfully"]);
    } else {
        echo json_encode(["message" => "Error"]);
    }

    mysqli_stmt_close($stmt);
    mysqli_close($connect);

} else {
    echo json_encode(["message" => "Invalid request"]);
}

