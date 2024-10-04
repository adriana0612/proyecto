const cart = [];
const cartItemsElement = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const cartCountElement = document.getElementById('cart-count');
const productCountElement = document.getElementById('product-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const sections = document.querySelectorAll('section');
const cartLink = document.getElementById('cart-link');

addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const productElement = button.closest('.product');
        const productName = productElement.dataset.name;
        const productPrice = parseFloat(productElement.dataset.price);
        const productImage = productElement.dataset.image;
        const quantity = parseInt(productElement.querySelector('.quantity').value);
        addToCart(productName, productPrice, productImage, quantity);
    });
});

function addToCart(name, price, image, quantity) {
    const existingProduct = cart.find(item => item.name === name);
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart.push({ name, price, image, quantity });
    }
    updateCartDisplay();
}

function removeFromCart(name, quantity) {
    const product = cart.find(item => item.name === name);
    if (product) {
        product.quantity -= quantity;
        if (product.quantity <= 0) {
            const productIndex = cart.findIndex(item => item.name === name);
            cart.splice(productIndex, 1);
        }
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    cartItemsElement.innerHTML = '';
    let total = 0;
    let totalCount = 0;

    cart.forEach(item => {
        const totalItemPrice = item.price * item.quantity;
        total += totalItemPrice;
        totalCount += item.quantity;

        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 150px; height: auto; margin-right: 10px;">
            ${item.name} - $${item.price.toFixed(2)} x ${item.quantity} = $${totalItemPrice.toFixed(2)}
            <input type="number" min="1" max="${item.quantity}" value="1" style="width: 50px; margin-left: 10px;">
            <button class="remove-from-cart" onclick="removeFromCart('${item.name}', this.previousElementSibling.value)" style="margin-left: 10px; padding: 5px; border: 1px solid #ccc; background-color: #f4f4f4; cursor: pointer;">
                Quitar
            </button>
        `;
        cartItemsElement.appendChild(li);
    });

    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
    cartCountElement.textContent = totalCount;
}

function updateProductCount() {
    const productCount = document.querySelectorAll('.product').length;
    productCountElement.textContent = `Total de productos: ${productCount}`;
}

function createOrderDocument() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const companyName = "La candelaria";
    const companyAddress = "Córdoba, Ver. Colonia: Ursulo Galvan. Av.12 entre calles 25 y 27";
    const companyPhone = "2711732181";

    // Título
    doc.setFontSize(18);
    doc.text(companyName, 10, 10);
    doc.setFontSize(12);
    doc.text(" ", 10, 30); // Espacio en blanco

    // Cabeceras de la tabla
    doc.setFontSize(14);
    doc.text("Productos solicitados:", 10, 40);
    doc.text("Nombre del Producto", 10, 50);
    doc.text("Cantidad", 100, 50);
    doc.text("Precio", 140, 50);

    doc.setLineWidth(0.5);
    doc.line(10, 55, 190, 55); // Línea de separación

    let y = 60;
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        doc.text(item.name, 10, y);
        doc.text(item.quantity.toString(), 100, y);
        doc.text(`$${item.price.toFixed(2)}`, 140, y);
        y += 10;
        total += itemTotal;
    });

    // Total
    doc.setFontSize(14);
    doc.text(`Total a pagar: $${total.toFixed(2)}`, 10, y + 10);

    // Información de contacto
    doc.setFontSize(10);
    doc.text(`Teléfono: ${companyPhone}`, 10, y + 20);
    doc.text(`Dirección: ${companyAddress}`, 10, y + 25);

    // Generar el PDF como un Blob
    const pdfBlob = doc.output('blob');

    // Crear un FormData para enviar al backend
    const formData = new FormData();
    formData.append('file', pdfBlob, 'pedido.pdf');

    // Enviar el PDF al backend
    fetch('/send-pdf', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('PDF enviado con éxito');
            // Mostrar mensaje de éxito al usuario
            showConfirmationMessage();
        } else {
            console.error('Error al enviar PDF');
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}

function showConfirmationMessage() {
    // Vaciar el carrito
    cart.length = 0; // Esto vacía el carrito
    updateCartDisplay(); // Actualiza la visualización del carrito

    // Limpiar el contenido del orderSection
    orderSection.innerHTML = '';

    // Crear un nuevo div para el mensaje de confirmación
    const confirmationMessage = document.createElement('div');
    confirmationMessage.style.textAlign = 'center'; // Centramos el texto
    confirmationMessage.style.position = 'absolute'; // Posicionamiento absoluto
    confirmationMessage.style.top = '50%'; // Centro vertical
    confirmationMessage.style.left = '50%'; // Centro horizontal
    confirmationMessage.style.transform = 'translate(-50%, -50%)'; // Ajustar para centrar
    confirmationMessage.innerHTML = `
        <h2>Pedido Realizado</h2>
        <p>¡Gracias por su compra!</p>
        <p>Cualquier duda con su compra, favor de contactarse directamente con la empresa al siguiente número: 271 173 2181</p>
    `;
    
    // Agregar el mensaje al orderSection
    orderSection.appendChild(confirmationMessage);

    sections.forEach(section => {
        section.classList.add('hidden-section');
    });
    orderSection.classList.remove('hidden-section');
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetSectionId = e.target.getAttribute('href').substring(1);
        sections.forEach(section => {
            section.classList.add('hidden-section');
        });
        document.getElementById(targetSectionId).classList.remove('hidden-section');

        if (targetSectionId === 'products') {
            updateProductCount();
        }
    });
});

cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    sections.forEach(section => {
        section.classList.add('hidden-section');
    });
    document.getElementById('cart').classList.remove('hidden-section');
});

const orderButton = document.getElementById('order-button');
const orderSection = document.getElementById('order');

orderButton.addEventListener('click', () => {
    createOrderDocument();
});

document.addEventListener('DOMContentLoaded', () => {
    updateProductCount();
});
