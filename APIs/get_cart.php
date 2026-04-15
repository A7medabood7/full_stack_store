<?php
header("Content-Type: application/json");

$connect = mysqli_connect("localhost", "root", "", "prefume_db");
if (!$connect) {
        echo json_encode(["message" => "Connection failed"]);
        exit;
    }

$query = "SELECT carts.product_id, products.name, products.price, products.type, carts.quantity
          FROM carts
          JOIN products ON carts.product_id = products.id";
          $result = mysqli_query($connect, $query);

$cart = [];
while ($row = mysqli_fetch_assoc($result)) {
    $cart[] = $row;
}

echo json_encode($cart);


