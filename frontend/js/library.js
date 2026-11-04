
const API_URL = `${window.API_BASE_URL}/api/books`;

let allBooks = [];

// ======================================
// MODAL
// ======================================

const bookModal = document.getElementById("book-modal");
const openBookModal = document.getElementById("open-book-modal");

const closeBookModal = document.getElementById("close-book-modal");
const cancelBookModal = document.getElementById("cancel-book-modal");

function openModal() {
    bookModal.classList.add("active");
}

function closeModal() {
    bookModal.classList.remove("active");
}

openBookModal.addEventListener("click", openModal);

// Abre o modal automaticamente quando a página é acessada pelo link #cadastro
if (window.location.hash === "#cadastro") {
    openBookModal();
}
closeBookModal.addEventListener("click", closeModal);
cancelBookModal.addEventListener("click", closeModal);

bookModal.addEventListener("click", (event) => {
    if (event.target === bookModal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

// ======================================
// CARDS DOS LIVROS
// ======================================

const booksList = document.getElementById("books-list");

const statusLabels = {
    WANT_TO_READ: "Quero ler",
    READING: "Lendo",
    READ: "Concluído"
};

function createBookCard(book) {
    const totalPages = book.totalPages || 0;
    const currentPage = book.currentPage || 0;

    const progress = totalPages > 0
        ? Math.min((currentPage / totalPages) * 100, 100)
        : 0;

    const cover = book.coverUrl
        ? book.coverUrl
        : "../assets/images/book-placeholder.png";

    const card = document.createElement("article");
    card.classList.add("book-card");

    card.innerHTML = `
        <div class="book-cover">
            <img src="${cover}" alt="Capa de ${book.title}">
        </div>

        <div class="book-info">
            <span class="book-status">
                ${statusLabels[book.status] || book.status}
            </span>

            <h3>${book.title}</h3>
            <p class="book-author">${book.author}</p>

            <span class="book-genre">
                ${book.genre || "Gênero não informado"}
            </span>

            <div class="book-progress">
                <div class="progress-info">
                    <span>Progresso</span>
                    <span>${Math.round(progress)}%</span>
                </div>

                <div class="progress-track">
                    <div class="progress-fill"
                         style="width: ${progress}%">
                    </div>
                </div>

                <small>${currentPage} de ${totalPages} páginas</small>
            </div>

            <a href="book.html?id=${book.id}" class="book-details-link">
                Ver detalhes →
            </a>
        </div>
    `;

    return card;
}

function renderBooks(books) {
    booksList.innerHTML = "";

    if (books.length === 0) {
        booksList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum livro encontrado.</p>
                <p>Tente alterar sua pesquisa ou seus filtros.</p>
            </div>
        `;
        return;
    }

    books.forEach(book => {
        booksList.appendChild(createBookCard(book));
    });
}

// ======================================
// FILTRO DE GÊNEROS
// ======================================

function populateGenreFilter() {
    const genreFilter = document.getElementById("filter-genre");

    const selectedGenre = genreFilter.value;

    const genres = [...new Set(
        allBooks
            .map(book => book.genre)
            .filter(genre => genre && genre.trim() !== "")
    )].sort((a, b) => a.localeCompare(b, "pt-BR"));

    genreFilter.innerHTML = `
        <option value="">Todos os gêneros</option>
    `;

    genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });

    if (genres.includes(selectedGenre)) {
        genreFilter.value = selectedGenre;
    }
}

// ======================================
// APLICAÇÃO DOS FILTROS
// ======================================

function applyFilters() {
    const searchTerm = document
        .getElementById("search-book")
        .value
        .trim()
        .toLocaleLowerCase("pt-BR");

    const selectedStatus = document.getElementById("filter-status").value;
    const selectedGenre = document.getElementById("filter-genre").value;

    const filteredBooks = allBooks.filter(book => {

        const matchesSearch =
            book.title.toLocaleLowerCase("pt-BR").includes(searchTerm) ||
            book.author.toLocaleLowerCase("pt-BR").includes(searchTerm);

        const matchesStatus =
            !selectedStatus || book.status === selectedStatus;

        const matchesGenre =
            !selectedGenre || book.genre === selectedGenre;

        return matchesSearch && matchesStatus && matchesGenre;
    });

    renderBooks(filteredBooks);
}

// ======================================
// STATUS DOS LIVROS    
// ======================================


function updateLibraryStats() {
    const totalBooks = allBooks.length;

    const wantToRead = allBooks.filter(
        book => book.status === "WANT_TO_READ"
    ).length;

    const currentlyReading = allBooks.filter(
        book => book.status === "READING"
    ).length;

    const finishedBooks = allBooks.filter(
        book => book.status === "READ"
    ).length;

    document.getElementById("total-books").textContent = totalBooks;

    document.getElementById("want-to-read").textContent = wantToRead;

    document.getElementById("currently-reading").textContent = currentlyReading;

    document.getElementById("finished-books").textContent = finishedBooks;
}


// ======================================
// BUSCA DOS LIVROS NA API
// ======================================

async function loadBooks() {
    try {
        booksList.innerHTML = "<p>Carregando sua biblioteca...</p>";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Não foi possível carregar os livros.");
        }

        allBooks = await response.json();

        updateLibraryStats();
        populateGenreFilter();
        applyFilters();

    } catch (error) {
        console.error("Erro ao carregar livros:", error);

        booksList.innerHTML = `
            <div class="empty-state">
                <p>Não foi possível carregar sua biblioteca.</p>
                <p>Verifique se o backend está funcionando.</p>
            </div>
        `;
    }
}

// ======================================
// CADASTRO DE LIVROS
// ======================================

const bookForm = document.getElementById("book-form");
const formMessage = document.getElementById("form-message");

bookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newBook = {
        title: document.getElementById("title").value.trim(),
        author: document.getElementById("author").value.trim(),
        genre: document.getElementById("genre").value.trim(),
        totalPages: Number(document.getElementById("total-pages").value),
        currentPage: Number(document.getElementById("current-page").value),
        status: document.getElementById("status").value,
        synopsis: document.getElementById("synopsis").value.trim(),
        coverUrl: document.getElementById("cover-url").value.trim() || null
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newBook)
        });

        if (!response.ok) {
            throw new Error("Não foi possível cadastrar o livro.");
        }

        await response.json();

        bookMessageSuccess();

        bookForm.reset();
        closeModal();

        await loadBooks();

    } catch (error) {
        console.error("Erro ao cadastrar livro:", error);

        formMessage.textContent =
            "Erro ao cadastrar. Verifique os dados e tente novamente.";

        formMessage.style.color = "red";
    }
});

function bookMessageSuccess() {
    formMessage.textContent = "Livro cadastrado com sucesso!";
    formMessage.style.color = "green";
}

// ======================================
// EVENTOS DOS FILTROS
// ======================================

document
    .getElementById("search-book")
    .addEventListener("input", applyFilters);

document
    .getElementById("filter-status")
    .addEventListener("change", applyFilters);

document
    .getElementById("filter-genre")
    .addEventListener("change", applyFilters);

// ======================================
// INICIALIZAÇÃO
// ======================================

loadBooks();
