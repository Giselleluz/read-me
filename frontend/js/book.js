
const API_URL = `${window.API_BASE_URL}/api/books`;
const API_REVIEWS = `${window.API_BASE_URL}/api/reviews`;

// Captura o ID que veio pela URL
const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

// Elementos da página
const bookTitle = document.getElementById("book-title");
const bookAuthor = document.getElementById("book-author");
const bookGenre = document.getElementById("book-genre");
const bookStatus = document.getElementById("book-status");
const bookSynopsis = document.getElementById("book-synopsis");

const bookCover = document.getElementById("book-cover");
const coverPlaceholder = document.getElementById("cover-placeholder");

const progressPercentage = document.getElementById("progress-percentage");
const progressFill = document.getElementById("progress-fill");
const progressPages = document.getElementById("progress-pages");

const startedAt = document.getElementById("started-at");
const finishedAt = document.getElementById("finished-at");

const detailsMessage = document.getElementById("details-message");


const editBookButton = document.getElementById("edit-book");
const editModal = document.getElementById("edit-book-modal");
const editBookForm = document.getElementById("edit-book-form");
const editFormMessage = document.getElementById("edit-form-message");

const closeEditModal = document.getElementById("close-edit-modal");
const cancelEditModal = document.getElementById("cancel-edit-modal");

const deleteBookButton = document.getElementById("delete-book");

const progressForm = document.getElementById("progress-form");
const updateCurrentPage = document.getElementById("update-current-page");
const progressMessage = document.getElementById("progress-message");

// Elementos da avaliação
const reviewForm = document.getElementById("review-form");
const ratingStars = document.getElementById("rating-stars");
const ratingMessage = document.getElementById("rating-message");
const reviewText = document.getElementById("review-text");
const saveReviewButton = document.getElementById("save-review");
const deleteReviewButton = document.getElementById("delete-review");
const reviewFormMessage = document.getElementById("review-form-message");

// Estado da avaliação
let selectedRating = 0;
let currentReview = null;

let currentBook = null;


// Tradução dos status
const statusLabels = {
    WANT_TO_READ: "Quero ler",
    READING: "Lendo",
    READ: "Concluído"
};

// Formata as datas
function formatDate(date) {
    if (!date) return "Não informado";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

// Retorna a data atual no formato AAAA-MM-DD
function getLocalDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Busca os dados do livro
async function loadBookDetails() {

    if (!bookId || !/^\d+$/.test(bookId)) {
        showError("ID do livro inválido.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${bookId}`);

        if (response.status === 404) {
            showError("Livro não encontrado.");
            return;
        }

        if (!response.ok) {
            throw new Error("Erro ao buscar os dados do livro.");
        }

        const book = await response.json();

        renderBookDetails(book);

    } catch (error) {
        console.error(error);
        showError("Não foi possível carregar os detalhes do livro.");
    }
}

// Preenche a página
function renderBookDetails(book) {

    document.title = `${book.title} | Read.me`;

    bookTitle.textContent = book.title;
    bookAuthor.textContent = book.author;
    bookGenre.textContent = book.genre || "Gênero não informado";

    bookStatus.textContent =
        statusLabels[book.status] || book.status;

    bookSynopsis.textContent =
        book.synopsis || "Nenhuma sinopse cadastrada.";

    const totalPages = book.totalPages || 0;
    const currentPage = book.currentPage || 0;

    const progress = totalPages > 0
        ? Math.min((currentPage / totalPages) * 100, 100)
        : 0;

    progressPercentage.textContent = `${Math.round(progress)}%`;
    progressFill.style.width = `${progress}%`;

    progressPages.textContent =
        `${currentPage} de ${totalPages} páginas`;

    startedAt.textContent = formatDate(book.startedAt);
    finishedAt.textContent = formatDate(book.finishedAt);

    // Exibe a capa, se existir
    if (book.coverUrl) {
        bookCover.src = book.coverUrl;
        bookCover.style.display = "block";
        coverPlaceholder.style.display = "none";

        bookCover.onerror = () => {
            bookCover.style.display = "none";
            coverPlaceholder.style.display = "flex";
        };
    }
    currentBook = book;
    updateCurrentPage.value = book.currentPage;
    updateCurrentPage.max = book.totalPages;
}

// Exibe mensagens de erro
function showError(message) {
    detailsMessage.textContent = message;
    detailsMessage.style.color = "red";
    bookTitle.textContent = "Livro indisponível";
}


// ======================================
// EDIÇÃO DO LIVRO
// ======================================

// Abre o modal e preenche os campos
function openEditModal() {

    if (!currentBook) return;

    document.getElementById("edit-title").value = currentBook.title;
    document.getElementById("edit-author").value = currentBook.author;
    document.getElementById("edit-genre").value = currentBook.genre || "";
    document.getElementById("edit-total-pages").value = currentBook.totalPages;
    document.getElementById("edit-current-page").value = currentBook.currentPage;
    document.getElementById("edit-status").value = currentBook.status;
    document.getElementById("edit-started-at").value = currentBook.startedAt || "";
    document.getElementById("edit-finished-at").value = currentBook.finishedAt || "";
    document.getElementById("edit-synopsis").value = currentBook.synopsis || "";
    document.getElementById("edit-cover-url").value = currentBook.coverUrl || "";

    editFormMessage.textContent = "";

    editModal.classList.add("active");
}

// Fecha o modal
function closeModal() {
    editModal.classList.remove("active");
}

editBookButton.addEventListener("click", openEditModal);
closeEditModal.addEventListener("click", closeModal);
cancelEditModal.addEventListener("click", closeModal);

editModal.addEventListener("click", (event) => {
    if (event.target === editModal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

// Envia as alterações para o backend
editBookForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const updatedBook = {
        title: document.getElementById("edit-title").value.trim(),
        author: document.getElementById("edit-author").value.trim(),
        genre: document.getElementById("edit-genre").value.trim() || null,
        totalPages: Number(document.getElementById("edit-total-pages").value),
        currentPage: Number(document.getElementById("edit-current-page").value),
        status: document.getElementById("edit-status").value,
        startedAt: document.getElementById("edit-started-at").value || null,
        finishedAt: document.getElementById("edit-finished-at").value || null,
        synopsis: document.getElementById("edit-synopsis").value.trim() || null,
        coverUrl: document.getElementById("edit-cover-url").value.trim() || null
    };

    // valida a data de início e conclusão

    if (
    updatedBook.startedAt &&
    updatedBook.finishedAt &&
    updatedBook.finishedAt < updatedBook.startedAt
) {
    editFormMessage.textContent =
        "A data de conclusão não pode ser anterior à data de início.";

    editFormMessage.style.color = "red";
    return;
}

    // Valida a quantidade de páginas
    if (
        updatedBook.totalPages < 1 ||
        updatedBook.currentPage < 0 ||
        updatedBook.currentPage > updatedBook.totalPages
    ) {
        editFormMessage.textContent =
            "Confira a quantidade de páginas informada.";

        editFormMessage.style.color = "red";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${bookId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedBook)
        });

        if (!response.ok) {
            throw new Error("Não foi possível atualizar o livro.");
        }

        currentBook = await response.json();

        renderBookDetails(currentBook);

        editFormMessage.textContent = "Livro atualizado com sucesso!";
        editFormMessage.style.color = "green";

        closeModal();

    } catch (error) {

        console.error("Erro ao atualizar livro:", error);

        editFormMessage.textContent =
            "Erro ao atualizar. Tente novamente.";

        editFormMessage.style.color = "red";
    }
});

// ======================================
// EXCLUSÃO DO LIVRO
// ======================================

deleteBookButton.addEventListener("click", async () => {

    if (!currentBook) {
        alert("Os dados do livro ainda não foram carregados.");
        return;
    }

    const confirmed = confirm(
        `Tem certeza de que deseja excluir "${currentBook.title}"? Essa ação não poderá ser desfeita.`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${bookId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Não foi possível excluir o livro.");
        }

        alert("Livro excluído com sucesso!");

        window.location.href = "library.html";

    } catch (error) {
        console.error("Erro ao excluir livro:", error);

        detailsMessage.textContent =
            "Não foi possível excluir o livro. Tente novamente.";

        detailsMessage.style.color = "red";
    }
});

// ======================================
// ATUALIZAÇÃO DO PROGRESSO
// ======================================

progressForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentBook) return;

    const newCurrentPage = Number(updateCurrentPage.value);

    // Validação das páginas
    if (
        !Number.isInteger(newCurrentPage) ||
        newCurrentPage < 0 ||
        newCurrentPage > currentBook.totalPages
    ) {
        progressMessage.textContent =
            `Informe uma página entre 0 e ${currentBook.totalPages}.`;

        progressMessage.style.color = "red";
        return;
    }

    // Define o status conforme o progresso
    let newStatus;
    let newStartedAt = currentBook.startedAt;
    let newFinishedAt = null;

    if (newCurrentPage === currentBook.totalPages) {

        newStatus = "READ";
        newFinishedAt = getLocalDate();

    } else if (newCurrentPage > 0) {

        newStatus = "READING";

        if (!newStartedAt) {
            newStartedAt = getLocalDate();
        }

    } else {

        newStatus = "WANT_TO_READ";
        newStartedAt = null;
    }

    const updatedBook = {
        title: currentBook.title,
        author: currentBook.author,
        genre: currentBook.genre,
        synopsis: currentBook.synopsis,
        totalPages: currentBook.totalPages,
        currentPage: newCurrentPage,
        status: newStatus,
        coverUrl: currentBook.coverUrl,
        startedAt: newStartedAt,
        finishedAt: newFinishedAt
    };

    try {

        const response = await fetch(`${API_URL}/${bookId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedBook)
        });

        if (!response.ok) {
            throw new Error("Não foi possível atualizar o progresso.");
        }

        const savedBook = await response.json();

        currentBook = savedBook;
        renderBookDetails(savedBook);

        progressMessage.textContent =
            "Progresso atualizado com sucesso!";

        progressMessage.style.color = "green";

    } catch (error) {

        console.error("Erro ao atualizar progresso:", error);

        progressMessage.textContent =
            "Não foi possível atualizar o progresso. Tente novamente.";

        progressMessage.style.color = "red";
    }
});


 // ======================================
 // AVALIAÇÃO DO LIVRO
 // ======================================

// Busca a avaliação cadastrada para o livro
async function loadReview() {

    try {
        const response = await fetch(
            `${API_REVIEWS}/book/${bookId}`
        );

        // O livro ainda não possui avaliação
        if (response.status === 404) {
            currentReview = null;
            resetReviewForm();
            return;
        }

        if (!response.ok) {
            throw new Error("Erro ao buscar avaliação.");
        }

        currentReview = await response.json();

        // Preenche o formulário com os dados existentes
        selectedRating = currentReview.rating;
        reviewText.value = currentReview.review || "";

        updateRatingStars();

        saveReviewButton.textContent = "Atualizar avaliação";
        deleteReviewButton.style.display = "inline-flex";

        ratingMessage.textContent =
            `Você avaliou este livro com ${selectedRating} de 5 estrelas.`;

    } catch (error) {
        console.error("Erro ao carregar avaliação:", error);

        reviewFormMessage.textContent =
            "Não foi possível carregar sua avaliação.";

        reviewFormMessage.style.color = "red";
    }
}

// Atualiza a aparência das estrelas
function updateRatingStars() {

    const stars = ratingStars.querySelectorAll(".rating-star");

    stars.forEach(star => {

        const rating = Number(star.dataset.rating);

        star.classList.toggle(
            "selected",
            rating <= selectedRating
        );
    });
}

// Reseta o formulário quando não existe avaliação
function resetReviewForm() {

    selectedRating = 0;
    currentReview = null;

    reviewText.value = "";

    updateRatingStars();

    ratingMessage.textContent =
        "Selecione uma nota de 1 a 5.";

    saveReviewButton.textContent = "Salvar avaliação";
    deleteReviewButton.style.display = "none";
}

// Seleciona a nota ao clicar em uma estrela
ratingStars.addEventListener("click", (event) => {

    const star = event.target.closest(".rating-star");

    if (!star) return;

    selectedRating = Number(star.dataset.rating);

    updateRatingStars();

    ratingMessage.textContent =
        `Você selecionou ${selectedRating} de 5 estrelas.`;

    reviewFormMessage.textContent = "";
});

// Salva ou atualiza a avaliação
reviewForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentBook) return;

    if (selectedRating < 1 || selectedRating > 5) {

        reviewFormMessage.textContent =
            "Selecione uma nota antes de salvar.";

        reviewFormMessage.style.color = "red";
        return;
    }

    const reviewData = {
        bookId: Number(bookId),
        rating: selectedRating,
        review: reviewText.value.trim()
    };

    const isEditing = currentReview !== null;

    const url = isEditing
        ? `${API_REVIEWS}/${currentReview.id}`
        : API_REVIEWS;

    const method = isEditing ? "PUT" : "POST";

    try {

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            throw new Error("Não foi possível salvar a avaliação.");
        }

        currentReview = await response.json();

        reviewFormMessage.textContent =
            isEditing
                ? "Avaliação atualizada com sucesso!"
                : "Avaliação cadastrada com sucesso!";

        reviewFormMessage.style.color = "green";

        saveReviewButton.textContent = "Atualizar avaliação";
        deleteReviewButton.style.display = "inline-flex";

    } catch (error) {

        console.error("Erro ao salvar avaliação:", error);

        reviewFormMessage.textContent =
            "Não foi possível salvar sua avaliação. Tente novamente.";

        reviewFormMessage.style.color = "red";
    }
});

// Exclui a avaliação
deleteReviewButton.addEventListener("click", async () => {

    if (!currentReview) return;

    const confirmed = confirm(
        "Tem certeza de que deseja excluir sua avaliação?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `${API_REVIEWS}/${currentReview.id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Não foi possível excluir a avaliação.");
        }

        resetReviewForm();

        reviewFormMessage.textContent =
            "Avaliação excluída com sucesso!";

        reviewFormMessage.style.color = "green";

    } catch (error) {

        console.error("Erro ao excluir avaliação:", error);

        reviewFormMessage.textContent =
            "Não foi possível excluir a avaliação.";

        reviewFormMessage.style.color = "red";
    }
});


// Inicialização
loadBookDetails().then(() => {
    if (currentBook) {
        loadReview();
    }
});