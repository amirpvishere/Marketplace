// OPEN MODAL
function openModal() {
    document.getElementById('productModal').style.display = 'block';
}

// CLOSE MODAL
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// HANDLE PRODUCT FROM SUBMISSION
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('productForm').addEventListener('submit', async function (event) {
        // PREVENT DEFUALT FROM SUBMISSION
        event.preventDefault();

        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const price = document.getElementById('price').value;
        const inStock = parseInt(document.getElementById('stock').value, 10); // NUMBER OF ITEMS

        try {
            const response = await fetch('/add-product', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, price, inStock })
            });

            if (response.ok) {
                alert('Product added successfully!');
                closeModal(); 
                window.location.reload();
            } else {
                alert('Error adding product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error while adding product.');
        }
    });

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", async (event) => {
            const productId = event.target.getAttribute("data-product-id");

            try {
                const response = await fetch("/api/cart/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ productId, quantity: 1 }) 
                });

                const result = await response.json();
                alert(result.message || "Added to cart!");
            } catch (error) {
                console.error("Error adding to cart:", error);
                alert("Server error while adding to cart.");
            }
        });
    });
});

// FUNCTION ADD TO CART - USED BY ONCLICK ATTRIBUTE
async function addToBag(productId) {
    if (!productId) {
        alert("Invalid product ID.");
        return;
    }

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        const result = await response.json();
        alert(result.message || "Product added to cart!");

    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Server error while adding to cart.");
    }
}

