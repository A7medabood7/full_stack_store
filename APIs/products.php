<?php
header("Content-Type: application/json");

$connect = mysqli_connect("localhost", "root", "", "prefume_db");
if (!$connect) {
        echo json_encode(["message" => "Connection failed"]);
        exit;
    }

$query = "SELECT * FROM products";
$result = mysqli_query($connect, $query);

$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}

echo json_encode($products);

