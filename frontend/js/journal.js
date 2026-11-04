(function () {

const API_BOOKS = `${window.API_BASE_URL}/api/books`;
const API_JOURNAL = `${window.API_BASE_URL}/api/journal`;

let allBooks = [];
let allEntries = [];

// ELEMENTOS HTML
const journalForm = document.getElementById("journal-form");
const entryBook = document.getElementById("entry-book");
const entriesList = document.getElementById("journal-entries-list");
const formMessage = document.getElementById("form-message");

const filterBook = document.getElementById("filter-entry-book");
const filterType = document.getElementById("filter-entry-type");

const editEntryModal = document.getElementById("edit-entry-modal");
const editEntryForm = document.getElementById("edit-entry-form");
const editEntryBook = document.getElementById("edit-entry-book");
const editEntryMessage = document.getElementById("edit-entry-message");

let editingEntryId = null;

// TIPOS DE REGISTRO
const entryTypeLabels = {
    NOTE: "Anotação",
    QUOTE: "Citação",
    REFLECTION: "Reflexão"
};

// CARREGAR LIVROS
async function loadBooks() {
    try {
        const response = await fetch(API_BOOKS);

        if (!response.ok) {
            throw new Error("Não foi possível carregar os livros.");
        }

        allBooks = await response.json();

        populateBookSelects();

    } catch (error) {
        console.error("Erro ao carregar livros:", error);

        entryBook.innerHTML = '<option value="">Erro ao carregar livros</option>';
        showFormMessage("Não foi possível carregar seus livros.", "error");
    }
}

// PREENCHER OS SELECTS DE LIVROS
function populateBookSelects() {
    entryBook.innerHTML = '<option value="">Selecione um livro</option>';
    filterBook.innerHTML = '<option value="">Todos os livros</option>';
    editEntryBook.innerHTML = '<option value="">Selecione um livro</option>';

    allBooks.forEach(book => {
        const option = document.createElement("option");
        option.value = book.id;
        option.textContent = book.title;
        entryBook.appendChild(option);

        const filterOption = document.createElement("option");
        filterOption.value = book.id;
        filterOption.textContent = book.title;
        filterBook.appendChild(filterOption);

        const editOption = document.createElement("option");
        editOption.value = book.id;
        editOption.textContent = book.title;
        editEntryBook.appendChild(editOption);
    });
}

// CARREGAR ENTRADAS DO DIÁRIO
async function loadEntries() {
    try {
        entriesList.innerHTML = "<p>Carregando suas entradas...</p>";

        const response = await fetch(API_JOURNAL);

        if (!response.ok) {
            throw new Error("Não foi possível carregar o diário.");
        }

        allEntries = await response.json();

        applyFilters();

    } catch (error) {
        console.error("Erro ao carregar entradas:", error);

        entriesList.innerHTML = `
            <div class="empty-state">
                <p>Não foi possível carregar seu diário.</p>
                <p>Verifique se o backend está funcionando.</p>
            </div>`;
    }
}

// CRIAR CARD DE ENTRADA
function createEntryCard(entry) {
    const book = allBooks.find(
        book => book.id === entry.bookId
    );

    const card = document.createElement("article");
    card.classList.add("journal-entry-card");

    const type = document.createElement("span");
    type.classList.add("entry-type");
    type.textContent = entryTypeLabels[entry.type] || entry.type;

    const title = document.createElement("h3");
    title.textContent = entry.title || "Sem título";

    const bookName = document.createElement("p");
    bookName.classList.add("entry-book");
    bookName.textContent = book ? book.title : "Livro não encontrado";

    const content = document.createElement("p");
    content.classList.add("entry-content");
    content.textContent = entry.content;

    const metadata = document.createElement("div");
    metadata.classList.add("entry-metadata");

    if (entry.pageNumber) {
        const page = document.createElement("span");
        page.textContent = `Página ${entry.pageNumber}`;
        metadata.appendChild(page);
    }

    if (entry.createdAt) {
        const date = document.createElement("span");
        date.textContent = new Date(entry.createdAt).toLocaleDateString("pt-BR");
        metadata.appendChild(date);
    }

    // AÇÕES DO CARD
    const actions = document.createElement("div");
    actions.classList.add("entry-actions");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("btn", "btn-secondary");
    editButton.textContent = "Editar";
    editButton.dataset.action = "edit";
    editButton.dataset.id = entry.id;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("btn", "btn-delete");
    deleteButton.textContent = "Excluir";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = entry.id;

    actions.append(editButton, deleteButton);

    card.append(type, title, bookName, content, metadata, actions);

    return card;
}

// ABRIR MODAL DE EDIÇÃO
function openEditModal(entry) {
    editingEntryId = entry.id;

    document.getElementById("edit-entry-type").value = entry.type;
    editEntryBook.value = entry.bookId;
    document.getElementById("edit-entry-title").value = entry.title || "";
    document.getElementById("edit-entry-page").value = entry.pageNumber || "";
    document.getElementById("edit-entry-content").value = entry.content;

    editEntryMessage.textContent = "";
    editEntryModal.classList.add("active");
}

// FECHAR MODAL
function closeEditModal() {
    editEntryModal.classList.remove("active");
    editEntryForm.reset();
    editingEntryId = null;
}

document.getElementById("close-edit-entry-modal")
    .addEventListener("click", closeEditModal);

document.getElementById("cancel-edit-entry")
    .addEventListener("click", closeEditModal);

editEntryModal.addEventListener("click", event => {
    if (event.target === editEntryModal) {
        closeEditModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeEditModal();
    }
});

// SALVAR ALTERAÇÕES
editEntryForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!editingEntryId) return;

    const updatedEntry = {
        bookId: Number(editEntryBook.value),
        type: document.getElementById("edit-entry-type").value,
        title: document.getElementById("edit-entry-title").value.trim() || null,
        content: document.getElementById("edit-entry-content").value.trim(),
        pageNumber: document.getElementById("edit-entry-page").value
            ? Number(document.getElementById("edit-entry-page").value)
            : null
    };

    try {
        const response = await fetch(`${API_JOURNAL}/${editingEntryId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedEntry)
        });

        if (!response.ok) {
            throw new Error("Não foi possível atualizar a entrada.");
        }

        closeEditModal();
        await loadEntries();

    } catch (error) {
        console.error("Erro ao editar entrada:", error);

        editEntryMessage.textContent = "Não foi possível salvar as alterações.";
        editEntryMessage.style.color = "red";
    }
});

// EXCLUIR ENTRADA
async function deleteEntry(id) {
    const entry = allEntries.find(entry => entry.id === Number(id));

    if (!entry) return;

    const confirmed = confirm(
        `Deseja realmente excluir a entrada "${entry.title || "Sem título"}"? Essa ação não poderá ser desfeita.`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_JOURNAL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Não foi possível excluir a entrada.");
        }

        await loadEntries();

    } catch (error) {
        console.error("Erro ao excluir entrada:", error);
        alert("Não foi possível excluir a entrada. Tente novamente.");
    }
}

// EXIBIR ENTRADAS
function renderEntries(entries) {
    entriesList.innerHTML = "";

    if (entries.length === 0) {
        entriesList.innerHTML = `
            <div class="empty-state">
                <p>Seu diário ainda está vazio.</p>
                <p>Que tal registrar sua primeira memória literária?</p>
            </div>`;
        return;
    }

    entries.forEach(entry => {
        entriesList.appendChild(createEntryCard(entry));
    });
}

// FILTRAR ENTRADAS
function applyFilters() {
    const selectedBook = filterBook.value;
    const selectedType = filterType.value;

    const filteredEntries = allEntries.filter(entry => {
        const matchesBook =
            !selectedBook || entry.bookId === Number(selectedBook);

        const matchesType =
            !selectedType || entry.type === selectedType;

        return matchesBook && matchesType;
    });

    renderEntries(filteredEntries);
}

// MENSAGEM DO FORMULÁRIO
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.style.color = type === "success" ? "green" : "red";
}

// CADASTRAR ENTRADA
journalForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newEntry = {
        bookId: Number(entryBook.value),
        type: document.getElementById("entry-type").value,
        title: document.getElementById("entry-title").value.trim() || null,
        content: document.getElementById("entry-content").value.trim(),
        pageNumber: document.getElementById("entry-page").value
            ? Number(document.getElementById("entry-page").value)
            : null
    };

    try {
        const response = await fetch(API_JOURNAL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newEntry)
        });

        if (!response.ok) {
            throw new Error("Não foi possível salvar a entrada.");
        }

        journalForm.reset();

        showFormMessage("Entrada salva com sucesso!", "success");

        await loadEntries();

    } catch (error) {
        console.error("Erro ao salvar entrada:", error);

        showFormMessage(
            "Erro ao salvar. Verifique os dados e tente novamente.",
            "error"
        );
    }
});

// EVENTOS DOS BOTÕES DOS CARDS
entriesList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "edit") {
        const entry = allEntries.find(entry => entry.id === id);

        if (entry) {
            openEditModal(entry);
        }
    }

    if (action === "delete") {
        deleteEntry(id);
    }
});

// EVENTOS DOS FILTROS
filterBook.addEventListener("change", applyFilters);
filterType.addEventListener("change", applyFilters);

// INICIALIZAÇÃO
async function initializeJournal() {
    await loadBooks();
    await loadEntries();
}

initializeJournal();

})();