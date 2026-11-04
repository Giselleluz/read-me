(function () {

const API_BOOKS = `${window.API_BASE_URL}/api/books`;
const API_REVIEWS = `${window.API_BASE_URL}/api/reviews`;
const API_GOALS = `${window.API_BASE_URL}/api/goals`;

const editGoalButton = document.getElementById("edit-goal-button");
const goalModal = document.getElementById("goal-modal");
const closeGoalModal = document.getElementById("close-goal-modal");
const goalForm = document.getElementById("goal-form");
const goalYear = document.getElementById("goal-year");
const goalTargetInput = document.getElementById("goal-target-input");
const goalFormMessage = document.getElementById("goal-form-message");

const goalCompleted = document.getElementById("goal-completed");
const goalTarget = document.getElementById("goal-target");
const goalProgressFill = document.getElementById("goal-progress-fill");
const goalProgressText = document.getElementById("goal-progress-text");

let currentGoal = null;

// Elementos da página
const yearSelector = document.getElementById("stats-year");

const statBooksRead = document.getElementById("stat-books-read");
const statPagesRead = document.getElementById("stat-pages-read");
const statAverageRating = document.getElementById("stat-average-rating");
const statBooksReading = document.getElementById("stat-books-reading");

const statWantToRead = document.getElementById("stat-want-to-read");
const statCurrentlyReading = document.getElementById("stat-currently-reading");
const statFinished = document.getElementById("stat-finished");
const statTotalBooks = document.getElementById("stat-total-books");

const monthlyChart = document.getElementById("monthly-chart");
const genreChart = document.getElementById("genre-chart");

// Busca os livros cadastrados
async function loadStatistics() {
    try {
        // Busca livros e avaliações ao mesmo tempo
        const [booksResponse, reviewsResponse] = await Promise.all([
            fetch(API_BOOKS),
            fetch(API_REVIEWS)
        ]);

        if (!booksResponse.ok) {
            throw new Error("Não foi possível carregar os livros.");
        }

        if (!reviewsResponse.ok) {
            throw new Error("Não foi possível carregar as avaliações.");
        }

        const books = await booksResponse.json();
        const reviews = await reviewsResponse.json();

        // Atualiza os indicadores
        const selectedYear = Number(yearSelector.value);
        updateStatistics(books, selectedYear);
        updateAverageRating(reviews, books, selectedYear);
        await loadGoal(books);

        // Atualiza os gráficos
        renderCharts(books, selectedYear);

    } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
    }
}

function getBooksReadInYear(books, year) {
    return books.filter(book => {
        if (book.status !== "READ" || !book.finishedAt) {
            return false;
        }

        const finishedYear = Number(book.finishedAt.substring(0, 4));

        return finishedYear === year;
    });
}

// Calcula os indicadores da biblioteca
function updateStatistics(books, selectedYear) {
    // Livros concluídos no ano selecionado
    const finishedBooksInYear = getBooksReadInYear(books, selectedYear);

    // Livros que estão atualmente em leitura
    const readingBooks = books.filter(book => book.status === "READING");

    // Livros que estão atualmente na lista de desejos
    const wantToReadBooks = books.filter(book => book.status === "WANT_TO_READ");

    // Total de páginas dos livros concluídos no ano
    const totalPagesRead = finishedBooksInYear.reduce(
        (total, book) => total + Number(book.totalPages || 0),
        0
    );

    statBooksRead.textContent = finishedBooksInYear.length;
    statPagesRead.textContent = totalPagesRead.toLocaleString("pt-BR");

    statBooksReading.textContent = readingBooks.length;
    statWantToRead.textContent = wantToReadBooks.length;

    statCurrentlyReading.textContent = readingBooks.length;
    statFinished.textContent = finishedBooksInYear.length;
    statTotalBooks.textContent = books.length;
}

function updateAverageRating(reviews, books, selectedYear) {
    // Identifica os livros concluídos no ano selecionado
    const finishedBooks = getBooksReadInYear(books, selectedYear);

    // Cria uma lista com os IDs desses livros
    const finishedBookIds = finishedBooks.map(book => Number(book.id));

    // Mantém apenas as avaliações desses livros
    const filteredReviews = reviews.filter(review =>
        finishedBookIds.includes(Number(review.bookId))
    );

    // Se não houver avaliações, exibe um traço
    if (filteredReviews.length === 0) {
        statAverageRating.textContent = "—";
        return;
    }

    // Calcula a média das avaliações
    const totalRatings = filteredReviews.reduce(
        (total, review) => total + Number(review.rating),
        0
    );

    const average = totalRatings / filteredReviews.length;

    statAverageRating.textContent = average.toFixed(1).replace(".", ",");
}

// Atualiza os gráficos
function renderCharts(books, selectedYear) {
    renderMonthlyChart(books, selectedYear);
    renderGenreChart(books);
}

// Livros concluídos por mês
function renderMonthlyChart(books, selectedYear) {
    const months = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const monthlyData = Array(12).fill(0);

    books.forEach(book => {
        if (book.status !== "READ" || !book.finishedAt) return;

        const finishedDate = new Date(`${book.finishedAt}T00:00:00`);

        if (finishedDate.getFullYear() === selectedYear) {
            monthlyData[finishedDate.getMonth()]++;
        }
    });

    const maxValue = Math.max(...monthlyData, 1);

    monthlyChart.innerHTML = `
        <div class="monthly-chart">
            ${monthlyData.map((value, index) => {
                const height = (value / maxValue) * 100;

                return `
                    <div class="month-column">
                        <span class="month-value">${value}</span>
                        <div class="month-bar-container">
                            <div
                                class="month-bar"
                                style="height: ${height}%"
                            ></div>
                        </div>
                        <span class="month-label">${months[index]}</span>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

// Gêneros mais frequentes
function renderGenreChart(books) {
    const genreCounts = {};

    books.forEach(book => {
        if (!book.genre) return;

        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
    });

    const genres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1]);

    if (genres.length === 0) {
        genreChart.innerHTML = `
            <p class="chart-empty">
                Cadastre livros com gêneros para visualizar este gráfico.
            </p>
        `;
        return;
    }

    const maxValue = genres[0][1];

    genreChart.innerHTML = `
        <div class="genre-chart">
            ${genres.map(([genre, quantity]) => {
                const percentage = (quantity / maxValue) * 100;

                return `
                    <div class="genre-item">
                        <div class="genre-information">
                            <span>${genre}</span>
                            <span>${quantity}</span>
                        </div>

                        <div class="genre-bar-container">
                            <div
                                class="genre-bar"
                                style="width: ${percentage}%"
                            ></div>
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

async function loadGoal(books) {
    const selectedYear = Number(yearSelector.value);

    // Conta apenas os livros concluídos no ano selecionado
    const completedBooks = books.filter(book => {
        if (book.status !== "READ" || !book.finishedAt) {
            return false;
        }

        const finishedDate = new Date(`${book.finishedAt}T00:00:00`);

        return finishedDate.getFullYear() === selectedYear;
    }).length;

    try {
        const response = await fetch(`${API_GOALS}/${selectedYear}`);

        if (response.status === 404) {
            currentGoal = null;
            renderGoal(completedBooks, 0);
            return;
        }

        if (!response.ok) {
            throw new Error("Não foi possível carregar a meta.");
        }

        currentGoal = await response.json();

        renderGoal(completedBooks, currentGoal.targetBooks);

    } catch (error) {
        console.error("Erro ao carregar meta:", error);
        goalProgressText.textContent = "Não foi possível carregar sua meta.";
    }
}

function renderGoal(completed, target) {
    goalCompleted.textContent = completed;
    goalTarget.textContent = target;

    if (target === 0) {
        goalProgressFill.style.width = "0%";
        goalProgressText.textContent = "Defina uma meta para começar sua jornada!";
        return;
    }

    const percentage = Math.min((completed / target) * 100, 100);

    goalProgressFill.style.width = `${percentage}%`;

    if (completed >= target) {
        goalProgressText.textContent = "Parabéns! Você atingiu sua meta de leitura!";
    } else {
        const remaining = target - completed;

        goalProgressText.textContent =
            `Você já concluiu ${percentage.toFixed(0)}% da sua meta. Faltam ${remaining} livros!`;
    }
}

function openGoalModal() {
    const selectedYear = Number(yearSelector.value);

    goalYear.value = selectedYear;
    goalTargetInput.value = currentGoal ? currentGoal.targetBooks : "";
    goalFormMessage.textContent = "";

    goalModal.classList.add("active");
}

function closeGoalModalWindow() {
    goalModal.classList.remove("active");
}

editGoalButton.addEventListener("click", openGoalModal);

closeGoalModal.addEventListener("click", closeGoalModalWindow);

goalModal.addEventListener("click", event => {
    if (event.target === goalModal) {
        closeGoalModalWindow();
    }
});

goalForm.addEventListener("submit", async event => {
    event.preventDefault();

    const year = Number(goalYear.value);
    const targetBooks = Number(goalTargetInput.value);

    if (!year || targetBooks <= 0) {
        goalFormMessage.textContent = "Informe um ano e uma quantidade válida.";
        return;
    }

    const goalData = {
        year: year,
        targetBooks: targetBooks
    };

    const method = currentGoal ? "PUT" : "POST";
    const url = currentGoal
        ? `${API_GOALS}/${year}`
        : API_GOALS;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(goalData)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || "Não foi possível salvar a meta.");
        }

        currentGoal = await response.json();

        goalFormMessage.textContent = "Meta salva com sucesso!";

        // Atualiza a exibição
        const booksResponse = await fetch(API_BOOKS);
        const books = await booksResponse.json();

        await loadGoal(books);

        setTimeout(() => {
            closeGoalModalWindow();
        }, 800);

    } catch (error) {
        console.error(error);
        goalFormMessage.textContent = error.message;
    }
});

// Quando o usuário troca o ano, atualiza o gráfico mensal
yearSelector.addEventListener("change", loadStatistics);

// Inicializa a página
loadStatistics();

})();