const container = document.getElementById('makeup-container');
const selectProduct = document.getElementById('product-select');
const favCountLabel = document.getElementById('fav-count');
const modal = document.getElementById('modal-favoritos');
const btnFavs = document.getElementById('btn-favoritos');
const spanClose = document.querySelector(".close");
const listaFavsContent = document.getElementById('lista-favs-content');

let todosLosProductos = [];
let favoritos = [];

async function obtenerColeccion() {
    try {
        container.innerHTML = "<h2 class='bodoni' style='grid-column: 1/-1; text-align: center;'>Iniciando ALMA Makeup...</h2>";
        const marcas = ['nyx', 'maybelline'];
        const peticiones = marcas.map(m => fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?brand=${m}`));
        const respuestas = await Promise.all(peticiones);
        const resultados = await Promise.all(respuestas.map(r => r.json()));
        
        todosLosProductos = resultados.flat().filter(p => p.price > 0 && p.image_link.includes('http'));
        renderizar(todosLosProductos);
    } catch (e) {
        container.innerHTML = "Error al conectar con la boutique.";
    }
}

function renderizar(lista) {
    container.innerHTML = "";
    lista.forEach(p => {
        const cop = Math.round(p.price * 4200);
        const precio = new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0
        }).format(cop);

        container.innerHTML += `
            <div class="card">
                <div class="img-wrapper">
                    <img src="${p.image_link}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500'">
                </div>
                <span class="brand">${p.brand}</span>
                <h3>${p.name}</h3>
                <p class="price">${precio}</p>
                <button class="btn-add-fav" onclick="agregarFavorito(${p.id})">Añadir a mi selección</button>
            </div>
        `;
    });
}

function agregarFavorito(id) {
    const prod = todosLosProductos.find(p => p.id === id);
    if(!favoritos.find(p => p.id === id)) {
        favoritos.push(prod);
        actualizarContador();
    }
}

function quitarFavorito(id) {
    favoritos = favoritos.filter(p => p.id !== id);
    actualizarContador();
    abrirLista();
}

function actualizarContador() {
    favCountLabel.innerText = favoritos.length;
}

function abrirLista() {
    modal.style.display = "block";
    listaFavsContent.innerHTML = favoritos.length ? "" : "<p>Tu selección está vacía.</p>";
    favoritos.forEach(p => {
        const item = document.createElement('div');
        item.classList.add('fav-item');
        item.innerHTML = `
            <div style="text-align: left;">
                <strong style="display:block; font-size:12px;">${p.name}</strong>
                <small style="color:var(--gold); font-size:9px;">${p.brand}</small>
            </div>
            <button class="btn-remove" onclick="quitarFavorito(${p.id})">Quitar</button>
        `;
        listaFavsContent.appendChild(item);
    });
}

btnFavs.onclick = abrirLista;
spanClose.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; }

selectProduct.addEventListener('change', (e) => {
    const val = e.target.value;
    const filtrados = val === "all" ? todosLosProductos : todosLosProductos.filter(p => p.product_type === val);
    renderizar(filtrados);
});

obtenerColeccion();