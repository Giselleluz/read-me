
const API_BOOKS = `${window.API_BASE_URL}/api/books`;
const API_REVIEWS = `${window.API_BASE_URL}/api/reviews`;
const API_GOALS = `${window.API_BASE_URL}/api/goals`;
const API_JOURNAL = `${window.API_BASE_URL}/api/journal`;

const currentYear = new Date().getFullYear();

// ======================================
// CARREGAMENTO DOS DADOS
// ======================================

async function loadHome() {
    try {
        const [booksResponse, reviewsResponse, journalResponse] =
            await Promise.all([
                fetch(API_BOOKS),
                fetch(API_REVIEWS),
                fetch(API_JOURNAL)
            ]);

        if (!booksResponse.ok || !reviewsResponse.ok || !journalResponse.ok) {
            throw new Error("Não foi possível carregar os dados da página inicial.");
        }

        const books = await booksResponse.json();
        const reviews = await reviewsResponse.json();
        const journalEntries = await journalResponse.json();

        updateReadingSummary(books, reviews);
        renderContinueReading(books);
        renderRecentActivity(journalEntries, books);

        await loadAnnualGoal(books);

    } catch (error) {
        console.error("Erro ao carregar página inicial:", error);
    }
}

// ======================================
// RESUMO DE LEITURA
// ======================================

function updateReadingSummary(books, reviews) {
    const finishedBooks = books.filter(
        book => book.status === "READ"
    );

    const readingBooks = books.filter(
        book => book.status === "READING"
    );

    const totalPages = finishedBooks.reduce(
        (total, book) => total + Number(book.totalPages || 0),
        0
    );

    document.getElementById("books-read").textContent =
        finishedBooks.length;

    document.getElementById("books-reading").textContent =
        readingBooks.length;

    document.getElementById("pages-read").textContent =
        totalPages.toLocaleString("pt-BR");

    if (reviews.length === 0) {
        document.getElementById("average-rating").textContent = "—";
        return;
    }

    const totalRatings = reviews.reduce(
        (total, review) => total + Number(review.rating || 0),
        0
    );

    const averageRating = totalRatings / reviews.length;

    document.getElementById("average-rating").textContent =
        averageRating.toFixed(1).replace(".", ",");
}

// ======================================
// CONTINUE DE ONDE PAROU
// ======================================

function renderContinueReading(books) {
    const container = document.getElementById("continue-reading-list");

    const readingBooks = books.filter(
        book => book.status === "READING"
    );

    container.innerHTML = "";

    if (readingBooks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma leitura em andamento.</p>
                <a href="pages/library.html">Que tal escolher o próximo livro?</a>
            </div>
        `;
        return;
    }

    readingBooks.forEach(book => {
        const totalPages = Number(book.totalPages || 0);
        const currentPage = Number(book.currentPage || 0);

        const progress = totalPages > 0
            ? Math.min((currentPage / totalPages) * 100, 100)
            : 0;

        const card = document.createElement("article");
        card.classList.add("card", "continue-reading-card");

        const cover = document.createElement("img");
        cover.src = book.coverUrl || "assets/images/book-placeholder.png";
        cover.alt = `Capa de ${book.title}`;
        cover.classList.add("continue-book-cover");

        cover.onerror = () => {
            cover.src = "assets/images/book-placeholder.png";
        };

        const info = document.createElement("div");
        info.classList.add("continue-book-info");

        const title = document.createElement("h3");
        title.textContent = book.title;

        const author = document.createElement("p");
        author.textContent = book.author;

        const progressText = document.createElement("p");
        progressText.textContent =
            `${currentPage} de ${totalPages} páginas`;

        const progressTrack = document.createElement("div");
        progressTrack.classList.add("progress-track");

        const progressFill = document.createElement("div");
        progressFill.classList.add("progress-fill");
        progressFill.style.width = `${progress}%`;

        progressTrack.appendChild(progressFill);

        const detailsLink = document.createElement("a");
        detailsLink.href = `pages/book.html?id=${book.id}`;
        detailsLink.textContent = "Continuar leitura →";
        detailsLink.classList.add("book-details-link");

        info.append(title, author, progressText, progressTrack, detailsLink);
        card.append(cover, info);

        container.appendChild(card);
    });
}

// ======================================
// META ANUAL
// ======================================

async function loadAnnualGoal(books) {
    const goalYearElement = document.getElementById("goal-year");
    const goalPercentage = document.getElementById("goal-percentage");
    const goalProgressFill = document.getElementById("goal-progress-fill");
    const goalProgressCount = document.getElementById("goal-progress-count");
    const goalDescription = document.getElementById("goal-description");

    goalYearElement.textContent = currentYear;

    const finishedBooks = books.filter(book => {
        if (book.status !== "READ" || !book.finishedAt) {
            return false;
        }

        return Number(book.finishedAt.substring(0, 4)) === currentYear;
    });

    try {
        const response = await fetch(`${API_GOALS}/${currentYear}`);

        if (response.status === 404) {
            goalPercentage.textContent = "0%";
            goalProgressFill.style.width = "0%";
            goalProgressCount.textContent = `${finishedBooks.length}/0`;
            goalDescription.textContent = "Defina sua meta na página de estatísticas.";
            return;
        }

        if (!response.ok) {
            throw new Error("Não foi possível carregar a meta anual.");
        }

        const goal = await response.json();
        const target = Number(goal.targetBooks);
        const completed = finishedBooks.length;

        const percentage = target > 0
            ? Math.min((completed / target) * 100, 100)
            : 0;

        goalPercentage.textContent = `${percentage.toFixed(0)}%`;
        goalProgressFill.style.width = `${percentage}%`;
        goalProgressCount.textContent = `${completed}/${target}`;

        goalDescription.textContent = completed >= target
            ? "Parabéns! Você alcançou sua meta de leitura!"
            : "Continue sua jornada literária, um livro de cada vez.";

    } catch (error) {
        console.error("Erro ao carregar meta anual:", error);
        goalDescription.textContent = "Não foi possível carregar sua meta.";
    }
}

// ======================================
// ATIVIDADE RECENTE
// ======================================

function renderRecentActivity(entries, books) {
    const container = document.getElementById("recent-activity-list");

    container.innerHTML = "";

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Suas anotações, citações e resenhas aparecerão aqui.</p>
                <a href="pages/journal.html">Explorar diário de leitura</a>
            </div>
        `;
        return;
    }

    const recentEntries = [...entries]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const typeLabels = {
        NOTE: "Anotação",
        QUOTE: "Citação",
        REFLECTION: "Reflexão"
    };

    recentEntries.forEach(entry => {
        const book = books.find(
            item => Number(item.id) === Number(entry.bookId)
        );

        const activity = document.createElement("article");
        activity.classList.add("card", "activity-item");

        const type = document.createElement("span");
        type.classList.add("activity-type");
        type.textContent = typeLabels[entry.type] || entry.type;

        const title = document.createElement("h3");
        title.textContent = entry.title || type.textContent;

        const content = document.createElement("p");
        content.textContent = entry.content;

        const bookName = document.createElement("span");
        bookName.classList.add("activity-book");
        bookName.textContent = book
            ? `Livro: ${book.title}`
            : "Livro não encontrado";

        const date = document.createElement("small");
        date.textContent = entry.createdAt
            ? new Date(entry.createdAt).toLocaleDateString("pt-BR")
            : "";

        activity.append(type, title, content, bookName, date);
        container.appendChild(activity);
    });
}

// ======================================
// INICIALIZAÇÃO
// ======================================

loadHome();
