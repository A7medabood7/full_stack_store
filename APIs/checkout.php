<?php
header("Content-Type: application/json");

$connect = mysqli_connect("localhost", "root", "", "prefume_db");

if (!$connect) {
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
    exit;
}

$query = "SELECT carts.product_id, products.price, carts.quantity 
          FROM carts 
          JOIN products ON carts.product_id = products.id";

$result = mysqli_query($connect, $query);

if (!$result) {
    echo json_encode(["status" => "error", "message" => mysqli_error($connect)]);
    exit;
}

$cart = [];
$total = 0;

while ($row = mysqli_fetch_assoc($result)) {
    $cart[] = $row;
    $total += $row['price'] * $row['quantity'];
}

if (count($cart) == 0) {
    echo json_encode(["status" => "error", "message" => "Cart is empty"]);
    exit;
}

$stmtOrder = mysqli_prepare($connect, "INSERT INTO orders (total_price) VALUES (?)");

if (!$stmtOrder) {
    echo json_encode(["status" => "error", "message" => mysqli_error($connect)]);
    exit;
}

mysqli_stmt_bind_param($stmtOrder, "d", $total);
mysqli_stmt_execute($stmtOrder);

$order_id = mysqli_insert_id($connect);

$stmtItem = mysqli_prepare($connect, 
    "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)");

if (!$stmtItem) {
    echo json_encode(["status" => "error", "message" => mysqli_error($connect)]);
    exit;
}

foreach ($cart as $item) {
    $product_id = (int)$item['product_id'];
    $quantity = (int)$item['quantity'];

    mysqli_stmt_bind_param($stmtItem, "iii", $order_id, $product_id, $quantity);
    mysqli_stmt_execute($stmtItem);
}

$resDelete = mysqli_query($connect, "DELETE FROM carts");

if (!$resDelete) {
    echo json_encode(["status" => "error", "message" => mysqli_error($connect)]);
    exit;
}

echo json_encode([
    "status" => "success",
    "message" => "Order placed successfully"
]);