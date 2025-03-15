function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    fetch(`/orders/cancel/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(result => {
        if (result.message) {
            alert(result.message);
            window.location.reload(); 
        } else {
            alert("Error: " + result.error);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Server error while cancelling order.");
    });
}