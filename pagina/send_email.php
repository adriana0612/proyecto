<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $order = $_POST['order'];

    $to = "santacecilia.velas@gmail.com";
    $subject = "Nuevo Pedido de $name";
    $message = "Nombre: $name\nCorreo: $email\nDetalles del Pedido:\n$order";
    $headers = "From: $email";

    if (mail($to, $subject, $message, $headers)) {
        echo "Pedido enviado con éxito.";
    } else {
        echo "Error al enviar el pedido.";
    }
}
?>
