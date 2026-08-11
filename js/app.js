const STOCKS = [
    { ticker: "EBAY", name: "eBay" },
    { ticker: "SMMT", name: "Summit Therapeutics" },
    { ticker: "MU", name: "Micron Technology" },
    { ticker: "ASTS", name: "AST SpaceMobile" },
    { ticker: "MRVL", name: "Marvell Technology" },
    { ticker: "ACGL", name: "Arch Capital" }
];

const STORAGE_KEY = "corrida45_start_prices";

async function loadQuotes() {

    const symbols =
        STOCKS.map(s => s.ticker).join(",");

    const url =
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

    const response = await fetch(url);

    const json = await response.json();

    return json.quoteResponse.result;
}

async function updateRace() {

    try {

        const quotes = await loadQuotes();

        let startPrices =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

        if (!startPrices) {

            startPrices = {};

            quotes.forEach(q => {
                startPrices[q.symbol] =
                    q.regularMarketPrice;
            });

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(startPrices)
            );
        }

        const ranking = quotes.map(q => {

            const start =
                startPrices[q.symbol];

            const current =
                q.regularMarketPrice;

            const perf =
                ((current - start) / start) * 100;

            return {
                ticker: q.symbol,
                name: STOCKS.find(
                    s => s.ticker === q.symbol
                ).name,
                current,
                start,
                performance: perf
            };
        });

        ranking.sort(
            (a, b) =>
                b.performance - a.performance
        );

        renderRanking(ranking);

    } catch (err) {

        console.error(err);

        alert(
            "Erro ao obter dados do Yahoo Finance."
        );
    }
}

function renderRanking(ranking) {

    const board =
        document.getElementById(
            "leaderBoard"
        );

    board.innerHTML = "";

    document.getElementById(
        "leaderName"
    ).innerText =
        ranking[0].name;

    document.getElementById(
        "leaderPerf"
    ).innerText =
        ranking[0].performance.toFixed(2) + "%";

    const maxPerf =
        Math.max(
            ...ranking.map(
                r => Math.max(
                    r.performance,
                    1
                )
            )
        );

    ranking.forEach((stock, idx) => {

        const card =
            document.createElement("div");

        card.className = "runner";

        if (idx === 0)
            card.classList.add("gold");

        if (idx === 1)
            card.classList.add("silver");

        if (idx === 2)
            card.classList.add("bronze");

        const horsePosition =
            Math.max(
                3,
                (stock.performance / maxPerf) * 88
            );

        card.innerHTML = `
            <div class="runner-header">

                <div class="stock-name">
                    ${idx === 0 ? "🥇" :
                        idx === 1 ? "🥈" :
                        idx === 2 ? "🥉" :
                        idx + 1 + "º"}
                    ${stock.name}
                </div>

                <div class="performance ${
                    stock.performance >= 0
                    ? "positive"
                    : "negative"
                }">
                    ${stock.performance.toFixed(2)}%
                </div>

            </div>

            <div class="track">

                <div
                    class="horse"
                    style="left:${horsePosition}%">
                    🐎
                </div>

                <div class="finish">
                    🏁
                </div>

            </div>

            <div class="stock-info">
                Início: $${stock.start.toFixed(2)}
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Atual: $${stock.current.toFixed(2)}
            </div>
        `;

        board.appendChild(card);
    });

    document.getElementById(
        "lastUpdate"
    ).innerHTML =
        "Última atualização: " +
        new Date().toLocaleString("pt-PT");
}

function resetRace() {

    if (
        confirm(
            "Reiniciar preços de partida?"
        )
    ) {

        localStorage.removeItem(
            STORAGE_KEY
        );

        updateRace();
    }
}

document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        updateRace
    );

document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        resetRace
    );

updateRace();
