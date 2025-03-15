async function deleteItem(productId) {
    if (!confirm("Are you sure you want to remove this item?")) return;
        try {
            const response = await fetch(`/api/cart/remove/${productId}`, { method: "DELETE" });
            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                window.location.reload();
            } else {
                alert("Error removing item: " + result.message);
            }
    } catch (error) {
            console.error("Error:", error);
            alert("Server error while deleting item.");
    }
}
