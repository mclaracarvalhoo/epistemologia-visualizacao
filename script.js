var DADOS = "dados.csv"

let dados = [];

const svg = document.getElementById("graph");

const filtros = {};

const nodes = [];
const edges = [];

let chart;
let chartDistribuicao;
let ultimoFiltrado = [];

if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
}

window.onload = async () => {

    const response =
        await fetch(DADOS);

    const csv =
        await response.text();

    dados = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
    }).data;

    document.getElementById("statTotal").textContent = dados.length;

    criarGrafico();

    criarGraficoDistribuicao();

    criarScatterCharts();

    criarRadarChart();

    gerarGrafo();

    atualizarGrafico();
};

function criarGrafico() {

    chart = new Chart(
        document.getElementById("chart"),
        {
            type: "bar",

            data: {
                labels: [],
                datasets: [{
                    label: "Autor predominante",
                    data: [],
                    backgroundColor: "#0a85a7",
                    borderRadius: 6,
                    maxBarThickness: 70
                },
                {
                    label: "Segundo autor",
                    data: [],
                    backgroundColor: "#f8c133",
                    borderRadius: 6,
                    maxBarThickness: 70
                }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        labels: {
                            font: {
                                family: "Poppins",
                                weight: 600
                            },
                            color: "#052f5c"
                        }
                    },
                    datalabels: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#052f5c" },
                        grid: { color: "#e2e6ea" },
                        title: {
                            display: true,
                            text: "Quantidade de Pessoas",
                            color: "#052f5c",
                            font: { family: "Poppins", weight: 600 }
                        }
                    },

                    x: {
                        ticks: {
                            color: "#052f5c",
                            font: { family: "Poppins", weight: 700 }
                        },
                        grid: { display: false },
                        title: {
                            display: true,
                            text: "Filósofos",
                            color: "#052f5c",
                            font: { family: "Poppins", weight: 600 }
                        }
                    }
                }
            }
        }
    );

}

function criarGraficoDistribuicao() {

    const cor = {
        discorda: "#e2574c",
        neutro: "#c9d3da",
        concorda: "#0a85a7",
        concordaForte: "#f8c133"
    };

    chartDistribuicao = new Chart(
        document.getElementById("chartDistribuicao"),
        {
            type: "bar",

            data: {
                labels: ["Bacon", "Popper", "Kuhn", "Feyerabend"],
                datasets: [{
                    label: "Discorda (-2 a -0.4)",
                    data: [],
                    backgroundColor: cor.discorda,
                    datalabels: { color: "#ffffff" }
                },
                {
                    label: "Neutro (-0.4 a 0.4)",
                    data: [],
                    backgroundColor: cor.neutro,
                    datalabels: { color: "#052f5c" }
                },
                {
                    label: "Concorda (0.4 a 1.2)",
                    data: [],
                    backgroundColor: cor.concorda,
                    datalabels: { color: "#ffffff" }
                },
                {
                    label: "Concorda Fortemente (1.2 a 2)",
                    data: [],
                    backgroundColor: cor.concordaForte,
                    datalabels: { color: "#052f5c" }
                }
                ]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: { family: "Poppins", weight: 600 },
                            color: "#052f5c",
                            boxWidth: 14,
                            padding: 16
                        }
                    },
                    datalabels: {
                        formatter: (valor) =>
                            valor >= 5 ? Math.round(valor) + "%" : "",
                        font: { family: "Poppins", weight: 700, size: 12 }
                    },
                    tooltip: {
                        enabled: false
                    }
                },

                scales: {
                    x: {
                        stacked: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            color: "#052f5c",
                            callback: (v) => v + "%"
                        },
                        grid: { color: "#e2e6ea" }
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            color: "#052f5c",
                            font: { family: "Poppins", weight: 700 }
                        },
                        grid: { display: false }
                    }
                }
            }
        }
    );

}

function corGrupo(grupo) {

    if (grupo === "Você é:")
        return "#0a85a7";

    if (grupo === "Idade:")
        return "#2f6fb0";

    return "#f3b21a";
}

// Quebra um texto em várias linhas curtas para caber dentro do círculo.
// Também quebra palavras muito longas usando o hífen como ponto de corte.
function quebrarTexto(texto, maxChars) {

    const palavrasBrutas = texto.split(" ");

    const palavras = [];

    palavrasBrutas.forEach(p => {

        if (p.length > maxChars && p.includes("-")) {

            const partes = p.split("-");

            partes.forEach((parte, i) => {
                palavras.push(
                    i < partes.length - 1 ? parte + "-" : parte
                );
            });

        } else {
            palavras.push(p);
        }
    });

    const linhas = [];
    let atual = "";

    palavras.forEach(palavra => {

        const teste =
            atual ? atual + " " + palavra : palavra;

        if (teste.length > maxChars && atual) {
            linhas.push(atual);
            atual = palavra;
        } else {
            atual = teste;
        }
    });

    if (atual) linhas.push(atual);

    return linhas;
}

// Calcula o raio necessário para caber as linhas de texto com folga.
function calcularRaio(linhas) {

    const maiorLinha =
        Math.max(...linhas.map(l => l.length), 1);

    const raioLargura = maiorLinha * 15 + 18;
    const raioAltura = linhas.length * 20 + 30;

    return Math.max(48, raioLargura, raioAltura);
}

function gerarGrafo() {

    svg.innerHTML = "";
    nodes.length = 0;
    edges.length = 0;

    const grupos = [
        "Você é:",
        "Idade:",
        "Gênero"
    ];

    const yPos = [
        1,
        1000,
        2000
    ];

    const MAX_CHARS_LINHA = 13;

    // 1ª passada: monta os dados de cada grupo (valores, linhas, raio)
    // e descobre o espaçamento necessário para não haver sobreposição.
    const gruposInfo = grupos.map(grupo => {

        const valores = grupo === "Gênero"
            ? ["Feminino", "Masculino", "Todos"]
            : [
                ...new Set(
                    dados
                        .map(x => x[grupo])
                        .filter(Boolean)
                )
            ];

        const itens = valores.map(valor => {

            const linhas =
                quebrarTexto(valor, MAX_CHARS_LINHA);

            const raio =
                calcularRaio(linhas);

            return { valor, linhas, raio };
        });

        const raioMaximo =
            Math.max(...itens.map(it => it.raio), 54);

        const espacamento =
            raioMaximo * 2 + 44;

        return { grupo, itens, espacamento };
    });

    // Largura do canvas: a maior necessária entre os 3 grupos
    // (com um mínimo de 900 para não ficar espremido).
    const largura = Math.max(
        900,
        ...gruposInfo.map(g => g.espacamento * (g.itens.length + 1))
    );

    gruposInfo.forEach((info, indice) => {

        const { grupo, itens } = info;

        filtros[grupo] = [];

        const titulo =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        titulo.setAttribute("x", 20);

        titulo.setAttribute(
            "y",
            yPos[indice] - 95
        );

        titulo.setAttribute(
            "class",
            "group-title"
        );

        titulo.setAttribute(
            "fill",
            corGrupo(grupo)
        );

        titulo.textContent = grupo;

        svg.appendChild(titulo);

        const espacamento =
            largura /
            (itens.length + 1);

        itens.forEach((item, i) => {

            const x =
                espacamento * (i + 1);

            const y =
                yPos[indice];

            filtros[grupo].push(item.valor);

            const isTodos = (grupo === "Gênero" && item.valor === "Todos");

            nodes.push({
                grupo,
                valor: item.valor,
                linhas: item.linhas,
                raio: item.raio,
                ativo: true,
                x,
                y,
                isTodos: isTodos
            });
        });
    });

    // Recorta o viewBox para caber só o conteúdo (sem sobra de espaço
    // em branco no topo/embaixo), deixando o grafo maior e mais legível.
    const primeiroGrupo = gruposInfo[0];
    const ultimoGrupo = gruposInfo[gruposInfo.length - 1];

    const raioMaxPrimeiro = Math.max(
        ...primeiroGrupo.itens.map(it => it.raio),
        54
    );

    const topoViewBox = Math.min(
        yPos[0] - raioMaxPrimeiro - 40,
        yPos[0] - 95 - 10
    );

    const raioMaxUltimo = Math.max(
        ...ultimoGrupo.itens.map(it => it.raio),
        54
    );

    const baseViewBox = yPos[yPos.length - 1] + raioMaxUltimo + 40;
    const alturaViewBox = baseViewBox - topoViewBox;

    svg.setAttribute(
        "viewBox",
        `0 ${topoViewBox} ${largura} ${alturaViewBox}`
    );

    criarArestasAutomaticas();

    desenharArestas();

    desenharVertices();
}

function criarArestasAutomaticas() {

    const mapa = {};

    nodes.forEach(n => {
        // Não incluir o nó "Todos" no mapa, pois ele não existe no CSV
        if (n.isTodos) return;
        mapa[
            `${n.grupo}|${n.valor}`
        ] = n;
    });

    const conexoes =
        new Set();

    dados.forEach(linha => {

        const g1 =
            linha["Você é:"];

        const g2 =
            linha["Idade:"];

        const g3 =
            linha["Gênero"];

        if (g1 && g2) {

            conexoes.add(
                `Você é:|${g1}|Idade:|${g2}`
            );
        }

        if (g2 && g3) {

            conexoes.add(
                `Idade:|${g2}|Gênero|${g3}`
            );
        }
    });

    conexoes.forEach(c => {

        const partes =
            c.split("|");

        const origem =
            mapa[
                `${partes[0]}|${partes[1]}`
            ];

        const destino =
            mapa[
                `${partes[2]}|${partes[3]}`
            ];

        if (origem && destino) {

            edges.push({
                origem,
                destino
            });
        }
    });
}

function desenharArestas() {

    edges.forEach(edge => {

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

        line.setAttribute(
            "x1",
            edge.origem.x
        );

        line.setAttribute(
            "y1",
            edge.origem.y
        );

        line.setAttribute(
            "x2",
            edge.destino.x
        );

        line.setAttribute(
            "y2",
            edge.destino.y
        );

        line.setAttribute(
            "class",
            "edge"
        );

        edge.element = line;

        svg.appendChild(line);
    });
}

function desenharVertices() {

    const svgNS = "http://www.w3.org/2000/svg";

    nodes.forEach(node => {

        const circle =
            document.createElementNS(svgNS, "circle");

        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        circle.setAttribute("r", node.raio);
        circle.setAttribute("fill", "#ffffff");
        circle.setAttribute("stroke", corGrupo(node.grupo));
        circle.setAttribute("class", "node");
        circle.style.strokeWidth = "8px";
        circle.style.stroke = corGrupo(node.grupo);

        circle.addEventListener(
            "click",
            () => toggleNode(node)
        );

        const tooltip =
            document.createElementNS(svgNS, "title");

        tooltip.textContent = node.valor;

        circle.appendChild(tooltip);

        svg.appendChild(circle);

        const text =
            document.createElementNS(svgNS, "text");

        text.setAttribute("x", node.x);
        text.setAttribute("y", node.y);
        text.setAttribute("class", "label");
        text.style.pointerEvents = "none";

        const alturaLinha = 52.5;

        const dyInicial =
            -((node.linhas.length - 1) / 2) * alturaLinha;

        node.linhas.forEach((linha, i) => {

            const tspan =
                document.createElementNS(svgNS, "tspan");

            tspan.setAttribute("x", node.x);

            tspan.setAttribute(
                "dy",
                i === 0 ? dyInicial : alturaLinha
            );

            tspan.textContent = linha;

            text.appendChild(tspan);
        });

        svg.appendChild(text);

        node.circle = circle;
    });
}

// ============================================================
// LÓGICA DE CLIQUE COM TRATAMENTO ESPECIAL PARA O GRUPO GÊNERO
// ============================================================
function toggleNode(node) {

    const grupo = node.grupo;

    // ---- TRATAMENTO ESPECIAL PARA GÊNERO ----
    if (grupo === "Gênero") {
        const todosNos = nodes.filter(n => n.grupo === "Gênero");
        const todosNode = todosNos.find(n => n.isTodos);
        const femininoNode = todosNos.find(n => n.valor === "Feminino");
        const masculinoNode = todosNos.find(n => n.valor === "Masculino");

        // Se clicou no nó "Todos"
        if (node.isTodos) {
            if (node.ativo) {
                // Desativar apenas "Todos", manter Feminino e Masculino ativos (se já estavam)
                node.ativo = false;
                node.circle.classList.add("node-disabled");
                // Garantir que pelo menos um gênero esteja ativo
                if (!femininoNode.ativo && !masculinoNode.ativo) {
                    // Se ambos estiverem inativos (caso raro), ativar ambos
                    femininoNode.ativo = true;
                    femininoNode.circle.classList.remove("node-disabled");
                    masculinoNode.ativo = true;
                    masculinoNode.circle.classList.remove("node-disabled");
                }
            } else {
                // Ativar "Todos" e também ativar Feminino e Masculino (se não estiverem)
                node.ativo = true;
                node.circle.classList.remove("node-disabled");
                femininoNode.ativo = true;
                femininoNode.circle.classList.remove("node-disabled");
                masculinoNode.ativo = true;
                masculinoNode.circle.classList.remove("node-disabled");
            }
        } else {
            // Clicou em Feminino ou Masculino
            // Se "Todos" estiver ativo, desativá-lo
            if (todosNode.ativo) {
                todosNode.ativo = false;
                todosNode.circle.classList.add("node-disabled");
            }

            // Alterna o estado do nó clicado
            node.ativo = !node.ativo;
            if (node.ativo) {
                node.circle.classList.remove("node-disabled");
            } else {
                node.circle.classList.add("node-disabled");
            }

            // Após a alternância, verifica se ambos Feminino e Masculino estão inativos
            if (!femininoNode.ativo && !masculinoNode.ativo) {
                // Ambos inativos → reativar o nó clicado (não pode ficar vazio)
                node.ativo = true;
                node.circle.classList.remove("node-disabled");
            }
        }

        // Monta a lista de valores reais para o filtro
        const ativos = todosNos.filter(n => n.ativo);
        let valoresFiltro = [];
        const temTodos = ativos.some(n => n.isTodos);
        if (temTodos) {
            valoresFiltro = ["Feminino", "Masculino", "Outros"];
        } else {
            if (femininoNode.ativo) valoresFiltro.push("Feminino");
            if (masculinoNode.ativo) valoresFiltro.push("Masculino");
        }
        filtros[grupo] = valoresFiltro;

        atualizarArestas();
        atualizarGrafico();
        return;
    }
    // ---- FIM DO TRATAMENTO ESPECIAL ----

    // ---- LÓGICA PADRÃO PARA OS DEMAIS GRUPOS ----
    const todos =
        nodes.filter(n => n.grupo === grupo);

    const ativos =
        todos.filter(n => n.ativo);

    // Se só existe um ativo e ele foi clicado, ativa todos novamente.
    if (ativos.length === 1 && node.ativo) {

        todos.forEach(n => {
            n.ativo = true;
            n.circle.classList.remove("node-disabled");
        });

    }
    // Se todos estão ativos, deixa somente o clicado.
    else if (ativos.length === todos.length) {

        todos.forEach(n => {

            n.ativo = (n === node);

            if (n.ativo) {
                n.circle.classList.remove("node-disabled");
            } else {
                n.circle.classList.add("node-disabled");
            }

        });

    }
    // Caso intermediário
    else {

        node.ativo = !node.ativo;

        if (node.ativo) {
            node.circle.classList.remove("node-disabled");
        } else {
            node.circle.classList.add("node-disabled");
        }

    }

    filtros[grupo] =
        todos
            .filter(n => n.ativo)
            .map(n => n.valor);

    atualizarArestas();
    atualizarGrafico();
}

function atualizarArestas() {

    edges.forEach(edge => {

        const ativa =
            edge.origem.ativo &&
            edge.destino.ativo;

        if (ativa) {
            edge.element.classList.remove(
                "edge-disabled"
            );
        } else {
            edge.element.classList.add(
                "edge-disabled"
            );
        }
    });
}

function atualizarGrafico() {

    // Aplica os filtros
    let filtrado = [...dados];

    Object.keys(filtros).forEach(grupo => {

        if (filtros[grupo].length > 0) {

            filtrado = filtrado.filter(
                linha => filtros[grupo].includes(linha[grupo])
            );

        }

    });

    // Autores do gráfico
    const autores = [
        "Bacon",
        "Popper",
        "Kuhn",
        "Feyerabend"
    ];

    // Contadores
    const predominante = {};
    const segundo = {};

    autores.forEach(autor => {
        predominante[autor] = 0;
        segundo[autor] = 0;
    });

    // Conta as ocorrências
    filtrado.forEach(linha => {

        const a1 = linha["Autor_Predominante"];
        const a2 = linha["Segundo_Predominante"];

        if (predominante.hasOwnProperty(a1)) {
            predominante[a1]++;
        }

        if (segundo.hasOwnProperty(a2)) {
            segundo[a2]++;
        }

    });

    // Atualiza o gráfico
    chart.data.labels = autores;

    chart.data.datasets[0].label = "Autor predominante";
    chart.data.datasets[0].data =
        autores.map(autor => predominante[autor]);

    chart.data.datasets[1].label = "Segundo autor";
    chart.data.datasets[1].data =
        autores.map(autor => segundo[autor]);

    chart.update();

    atualizarDistribuicao(filtrado);

    atualizarScatterCharts(filtrado);

    desenharBoxplot(filtrado);

    atualizarRadarChart(filtrado);

    ultimoFiltrado = filtrado;

    const statFiltered = document.getElementById("statFiltered");

    if (statFiltered) {
        statFiltered.textContent = filtrado.length;
    }

}

function atualizarDistribuicao(filtrado) {

    if (!chartDistribuicao) return;

    const autores = [
        "Bacon",
        "Popper",
        "Kuhn",
        "Feyerabend"
    ];

    const faixas = {
        discorda: [],
        neutro: [],
        concorda: [],
        concordaForte: []
    };

    autores.forEach(autor => {

        let discorda = 0;
        let neutro = 0;
        let concorda = 0;
        let concordaForte = 0;
        let total = 0;

        filtrado.forEach(linha => {

            const bruto = linha[autor];

            if (bruto === undefined || bruto === null || bruto === "") return;

            const valor =
                parseFloat(String(bruto).replace(",", "."));

            if (isNaN(valor)) return;

            total++;

            if (valor < -0.4) discorda++;
            else if (valor < 0.4) neutro++;
            else if (valor < 1.2) concorda++;
            else concordaForte++;
        });

        faixas.discorda.push(
            total > 0 ? (discorda / total) * 100 : 0
        );

        faixas.neutro.push(
            total > 0 ? (neutro / total) * 100 : 0
        );

        faixas.concorda.push(
            total > 0 ? (concorda / total) * 100 : 0
        );

        faixas.concordaForte.push(
            total > 0 ? (concordaForte / total) * 100 : 0
        );
    });

    chartDistribuicao.data.datasets[0].data = faixas.discorda;
    chartDistribuicao.data.datasets[1].data = faixas.neutro;
    chartDistribuicao.data.datasets[2].data = faixas.concorda;
    chartDistribuicao.data.datasets[3].data = faixas.concordaForte;

    chartDistribuicao.update();

}

/* ==========================================================
FUNÇÕES ESTATÍSTICAS
========================================================== */

function media(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function desvioPadrao(arr) {
    if (arr.length < 2) return 0;
    const m = media(arr);
    const variancia =
        arr.reduce((acc, v) => acc + (v - m) * (v - m), 0) / (arr.length - 1);
    return Math.sqrt(variancia);
}

function valorMinimo(arr) {
    return arr.length ? Math.min(...arr) : 0;
}

function valorMaximo(arr) {
    return arr.length ? Math.max(...arr) : 0;
}

// Percentil por interpolação linear (p de 0 a 100)
function percentil(arr, p) {
    if (!arr.length) return 0;
    const ordenado = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (ordenado.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return ordenado[lo];
    return ordenado[lo] + (ordenado[hi] - ordenado[lo]) * (idx - lo);
}

// Regressão linear (mínimos quadrados) + coeficiente de Pearson
function calcularPearson(xs, ys) {

    const n = xs.length;

    if (n === 0) return { m: 0, b: 0, r: 0 };

    let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;

    for (let i = 0; i < n; i++) {
        sx += xs[i];
        sy += ys[i];
        sxy += xs[i] * ys[i];
        sxx += xs[i] * xs[i];
        syy += ys[i] * ys[i];
    }

    const mx = sx / n;
    const my = sy / n;

    const varX = sxx / n - mx * mx;
    const varY = syy / n - my * my;

    const dx = Math.sqrt(Math.max(0, varX));
    const dy = Math.sqrt(Math.max(0, varY));

    const num = n * sxy - sx * sy;
    const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));

    const r = den === 0 ? 0 : num / den;
    const m = dx === 0 ? 0 : r * (dy / dx);
    const b = my - m * mx;

    return { m, b, r };
}

// Extrai os valores numéricos válidos de um autor a partir das linhas filtradas
function valoresAutor(filtrado, autor) {

    return filtrado
        .map(linha => parseFloat(String(linha[autor]).replace(",", ".")))
        .filter(v => !isNaN(v));
}

// Extrai os pares {x,y} válidos (mesma linha) entre dois autores
function pontosPorPar(filtrado, autorX, autorY) {

    const pontos = [];

    filtrado.forEach(linha => {

        const xBruto = linha[autorX];
        const yBruto = linha[autorY];

        if (!xBruto || !yBruto) return;

        const x = parseFloat(String(xBruto).replace(",", "."));
        const y = parseFloat(String(yBruto).replace(",", "."));

        if (isNaN(x) || isNaN(y)) return;

        pontos.push({ x, y });
    });

    return pontos;
}

/* ==========================================================
GRÁFICOS DE DISPERSÃO (correlação entre pares de filósofos)
========================================================== */

let scatterCharts = {};

const PARES_SCATTER = [
    ["Bacon", "Popper", "scatterBaconPopper"],
    ["Bacon", "Kuhn", "scatterBaconKuhn"],
    ["Bacon", "Feyerabend", "scatterBaconFeyerabend"],
    ["Popper", "Kuhn", "scatterPopperKuhn"],
    ["Popper", "Feyerabend", "scatterPopperFeyerabend"],
    ["Kuhn", "Feyerabend", "scatterKuhnFeyerabend"]
];

function criarScatterCharts() {

    PARES_SCATTER.forEach(([autorX, autorY, canvasId]) => {

        const canvasEl = document.getElementById(canvasId);

        if (!canvasEl) return;

        scatterCharts[canvasId] = new Chart(canvasEl, {

            data: {
                datasets: [{
                    type: "scatter",
                    label: "Pessoas",
                    data: [],
                    backgroundColor: "rgba(10,133,167,0.55)",
                    pointRadius: 4,
                    pointHoverRadius: 5
                },
                {
                    type: "line",
                    label: "Tendência",
                    data: [],
                    borderColor: "#f8c133",
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,

                plugins: {
                    legend: { display: false },
                    datalabels: { display: false },
                    title: {
                        display: true,
                        text: `${autorX} vs ${autorY}`,
                        color: "#052f5c",
                        font: { family: "Poppins", weight: 700, size: 12 }
                    },
                    tooltip: {
                        enabled: false
                    }
                },

                scales: {
                    x: {
                        type: "linear",
                        min: -2,
                        max: 2,
                        title: { display: true, text: autorX, color: "#5b6b7a", font: { size: 10 } },
                        ticks: { color: "#5b6b7a", font: { size: 9 } },
                        grid: { color: "#eef1f4" }
                    },
                    y: {
                        min: -2,
                        max: 2,
                        title: { display: true, text: autorY, color: "#5b6b7a", font: { size: 10 } },
                        ticks: { color: "#5b6b7a", font: { size: 9 } },
                        grid: { color: "#eef1f4" }
                    }
                }
            }
        });
    });
}

function atualizarScatterCharts(filtrado) {

    PARES_SCATTER.forEach(([autorX, autorY, canvasId]) => {

        const instancia = scatterCharts[canvasId];

        if (!instancia) return;

        const pontos = pontosPorPar(filtrado, autorX, autorY);

        const { m, b, r } =
            calcularPearson(pontos.map(p => p.x), pontos.map(p => p.y));

        instancia.data.datasets[0].data = pontos;

        instancia.data.datasets[1].data = [
            { x: -2, y: m * -2 + b },
            { x: 2, y: m * 2 + b }
        ];

        instancia.options.plugins.title.text =
            `${autorX} vs ${autorY}  (r = ${r.toFixed(2)})`;

        instancia.update();
    });
}

/* ==========================================================
BOXPLOT (desenhado direto no canvas)
========================================================== */

function desenharBoxplot(filtrado) {

    const canvas = document.getElementById("boxplotCanvas");

    if (!canvas || !canvas.parentElement) return;

    const larguraCss = canvas.parentElement.clientWidth;
    const alturaCss = 360;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = larguraCss * dpr;
    canvas.height = alturaCss * dpr;
    canvas.style.width = larguraCss + "px";
    canvas.style.height = alturaCss + "px";

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, larguraCss, alturaCss);

    const autores = ["Bacon", "Popper", "Kuhn", "Feyerabend"];
    const cores = ["#0a85a7", "#2f6fb0", "#f3b21a", "#e2574c"];

    const PAD_ESQ = 46;
    const PAD_DIR = 24;
    const PAD_TOPO = 20;
    const PAD_BASE = 36;

    const areaLargura = larguraCss - PAD_ESQ - PAD_DIR;
    const areaAltura = alturaCss - PAD_TOPO - PAD_BASE;

    const VALOR_MIN = -2;
    const VALOR_MAX = 2;

    const mapY = (v) =>
        PAD_TOPO + areaAltura - ((v - VALOR_MIN) / (VALOR_MAX - VALOR_MIN)) * areaAltura;

    // grade horizontal + eixo numérico
    ctx.strokeStyle = "#e2e6ea";
    ctx.fillStyle = "#5b6b7a";
    ctx.font = "11px Poppins, Arial, sans-serif";
    ctx.textAlign = "right";

    for (let v = VALOR_MIN; v <= VALOR_MAX; v++) {
        const y = mapY(v);
        ctx.beginPath();
        ctx.moveTo(PAD_ESQ, y);
        ctx.lineTo(larguraCss - PAD_DIR, y);
        ctx.stroke();
        ctx.fillText(v, PAD_ESQ - 8, y + 4);
    }

    const passo = areaLargura / autores.length;

    autores.forEach((autor, i) => {

        const valores = valoresAutor(filtrado, autor);

        if (!valores.length) return;

        const vmin = valorMinimo(valores);
        const vmax = valorMaximo(valores);
        const p20 = percentil(valores, 20);
        const p80 = percentil(valores, 80);
        const m = media(valores);

        const xc = PAD_ESQ + passo * i + passo / 2;
        const largCaixa = Math.min(56, passo * 0.55);

        // linha do bigode (min a max)
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(xc, mapY(vmin));
        ctx.lineTo(xc, mapY(vmax));
        ctx.moveTo(xc - largCaixa / 4, mapY(vmin));
        ctx.lineTo(xc + largCaixa / 4, mapY(vmin));
        ctx.moveTo(xc - largCaixa / 4, mapY(vmax));
        ctx.lineTo(xc + largCaixa / 4, mapY(vmax));
        ctx.stroke();

        // caixa (20º ao 80º percentil)
        const yTopo = mapY(p80);
        const yBase = mapY(p20);

        ctx.fillStyle = cores[i] + "cc";
        ctx.fillRect(xc - largCaixa / 2, yTopo, largCaixa, yBase - yTopo);
        ctx.strokeStyle = cores[i];
        ctx.lineWidth = 1.5;
        ctx.strokeRect(xc - largCaixa / 2, yTopo, largCaixa, yBase - yTopo);

        // linha da média
        ctx.strokeStyle = "#caff61";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(xc - largCaixa / 2, mapY(m));
        ctx.lineTo(xc + largCaixa / 2, mapY(m));
        ctx.stroke();

        // rótulo do autor
        ctx.fillStyle = "#052f5c";
        ctx.font = "bold 12px Poppins, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(autor, xc, alturaCss - 12);
    });
}

/* ==========================================================
RADAR COMPARATIVO (Estudantes / Professores / Funcionários)
========================================================== */

// 1. REGISTRA O SEGUIDOR DE CURSOR
if (Chart && Chart.Tooltip && !Chart.Tooltip.positioners.cursor) {
    Chart.Tooltip.positioners.cursor = function(elements, eventPosition) {
        return {
            x: eventPosition.x + 25,
            y: eventPosition.y - 30
        };
    };
}

// 2. PLUGIN DE FUNDO
const regioesFundoPlugin = {
    id: 'regioesFundo',
    beforeDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom }, scales: { r } } = chart;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const raioZero = r.getDistanceFromCenterForValue(0);  
        const raioMax = r.getDistanceFromCenterForValue(2);   

        ctx.save();
        ctx.beginPath(); ctx.fillStyle = 'rgba(255, 99, 132, 0.11)';
        ctx.arc(centerX, centerY, raioZero, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = 'rgba(75, 192, 192, 0.11)';
        ctx.arc(centerX, centerY, raioMax, 0, 2 * Math.PI, false);
        ctx.arc(centerX, centerY, raioZero, 0, 2 * Math.PI, true); ctx.fill();
        ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.strokeStyle = '#052f5c';
        ctx.lineWidth = 1.5; ctx.arc(centerX, centerY, raioZero, 0, 2 * Math.PI); ctx.stroke();
        ctx.restore();
    },
    afterDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom }, scales: { r } } = chart;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const raioZero = r.getDistanceFromCenterForValue(0);  
        const raioMax = r.getDistanceFromCenterForValue(2);   

        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = 'bold 10px Poppins, sans-serif';
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
        const espacamentoLinha = 12;

        ctx.fillStyle = 'rgba(30, 123, 123, 0.75)';
        const distConc = raioZero + (raioMax - raioZero) / 2;
        const posXConc = centerX + Math.cos(Math.PI * 1.28) * distConc;
        const posYConc = centerY + Math.sin(Math.PI * 1.28) * distConc;
        ["REGIÃO DE", "CONCORDÂNCIA"].forEach((l, i) => {
            const y = posYConc + (i * espacamentoLinha) - 6;
            ctx.strokeText(l, posXConc, y); ctx.fillText(l, posXConc, y);
        });

        ctx.fillStyle = 'rgba(179, 58, 83, 0.75)';
        const distDisc = raioZero * 0.6;
        const posXDisc = centerX + Math.cos(Math.PI * 0.28) * distDisc;
        const posYDisc = centerY + Math.sin(Math.PI * 0.28) * distDisc;
        ["REGIÃO DE", "DISCORDÂNCIA"].forEach((l, i) => {
            const y = posYDisc + (i * espacamentoLinha) - 6;
            ctx.strokeText(l, posXDisc, y); ctx.fillText(l, posXDisc, y);
        });
        ctx.restore();
    }
};

// 3. INICIALIZAÇÃO DO CHART
function criarRadarChart() {
    const canvasEl = document.getElementById("radarChart");
    if (!canvasEl) return;

    radarChart = new Chart(canvasEl, {
        type: "radar",
        data: {
            labels: ["Bacon", "Popper", "Kuhn", "Feyerabend"],
            datasets: [
                {
                    label: "Estudantes", data: [], tension: 0.5, fill: false,
                    borderColor: "#0a85a7", borderWidth: 3,
                    pointBackgroundColor: "#ffffff", pointBorderColor: "#0a85a7", pointBorderWidth: 3,
                    pointRadius: 6, pointHoverRadius: 8
                },
                {
                    label: "Professores", data: [], tension: 0.5, fill: false,
                    borderColor: "#f3b21a", borderWidth: 3,
                    pointBackgroundColor: "#ffffff", pointBorderColor: "#f3b21a", pointBorderWidth: 3,
                    pointRadius: 6, pointHoverRadius: 8
                },
                {
                    label: "Funcionários / Técnico-administrativos", data: [], tension: 0.5, fill: false,
                    borderColor: "#6f4fd6", borderWidth: 3,
                    pointBackgroundColor: "#ffffff", pointBorderColor: "#6f4fd6", pointBorderWidth: 3,
                    pointRadius: 6, pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',     
                intersect: true
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { family: "Poppins", weight: 600, size: 12 },
                        color: "#052f5c",
                        padding: 15,
                        usePointStyle: true, pointStyle: 'circle'
                    }
                },
            tooltip: {
                    backgroundColor: "#ffffff",
                    titleColor: "#052f5c",
                    bodyColor: "#333",
                    borderColor: "#e2e6ea",
                    borderWidth: 1,
                    mode: 'nearest',
                    intersect: true,
                    position: 'cursor',
                    callbacks: {
                        title: function(context) {
                            const autor = context[0].label;
                            const grupo = context[0].dataset.label;
                            return `${autor} (${grupo})`;
                        },
                        label: function(context) {
                            let valor = context.parsed.r;
                            let desc = valor >= 0 ? 'Concorda' : 'Discorda';
                            let intensidade = Math.abs(valor) === 2 ? 'fortemente' : (Math.abs(valor) === 1 ? 'parcialmente' : 'neutro');
                            if (valor === 0) desc = 'Neutro';
                            else desc += (intensidade ? ' ' + intensidade : '');
                            return 'Valor: ' + valor.toFixed(1) + ' (' + desc + ')';
                        }
                    }
                },
                datalabels: { display: false }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                r: {
                    min: -2, max: 2,
                    ticks: {
                        color: "#5b6b7a", backdropColor: "transparent", stepSize: 1, showLabelBackdrop: false,
                        font: { size: 11, weight: '500' },
                        callback: (valor) => (valor === 2 ? "+2" : (valor === -2 ? "-2" : (valor === 0 ? "0" : valor)))
                    },
                    grid: { color: "#dce0e5", lineWidth: 1.2, circular: true },
                    angleLines: { color: "#dce0e5", lineWidth: 1.2 },
                    pointLabels: {
                        font: { family: "Poppins", weight: 700, size: 13 },
                        color: "#052f5c",
                        padding: 15
                    }
                }
            },
            layout: {
                padding: { top: 20, bottom: 25, left: 20, right: 20 }
            }
        },
        plugins: [regioesFundoPlugin]
    });
}

function atualizarRadarChart(filtrado) {
    if (!radarChart) return;

    const autores = ["Bacon", "Popper", "Kuhn", "Feyerabend"];
    const grupos = [
        "Estudante do IMPA Tech ou UFRJ",
        "Professor",
        "Funcionário / Técnico-administrativo"
    ];

    const FATOR_EXAGERO = 1

    const dadosPorGrupo = grupos.map(grupo => {
        const linhasDoGrupo = filtrado.filter(linha => linha["Você é:"] === grupo);
        return autores.map(autor => {
            const valores = valoresAutor(linhasDoGrupo, autor);
            if (!valores.length) return null;
            const mediaOriginal = media(valores);
            const distortion = Math.sign(mediaOriginal) * Math.pow(Math.abs(mediaOriginal), FATOR_EXAGERO);
            return Math.round(distortion * 100) / 100;
        });
    });

    radarChart.data.datasets[0].data = dadosPorGrupo[0];
    radarChart.data.datasets[1].data = dadosPorGrupo[1];
    radarChart.data.datasets[2].data = dadosPorGrupo[2];

    radarChart.update();
}

// Redesenha o boxplot (canvas puro) quando a janela é redimensionada
window.addEventListener("resize", () => {
    if (ultimoFiltrado.length) desenharBoxplot(ultimoFiltrado);
});