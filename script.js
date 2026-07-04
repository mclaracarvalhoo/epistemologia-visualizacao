var DADOS = "dados.csv"

let dados = [];

const svg = document.getElementById("graph");

const filtros = {};

const nodes = [];
const edges = [];

let chart;
let chartDistribuicao;

if(typeof ChartDataLabels !== "undefined"){
    Chart.register(ChartDataLabels);
}

window.onload = async () => {

    const response =
        await fetch(DADOS);

    const csv =
        await response.text();

    dados = Papa.parse(csv,{
        header:true,
        skipEmptyLines:true
    }).data;

    document.getElementById("statTotal").textContent = dados.length;

    criarGrafico();

    criarGraficoDistribuicao();

    gerarGrafo();

    atualizarGrafico();
};

function criarGrafico(){

    chart = new Chart(
        document.getElementById("chart"),
        {
            type:"bar",

            data:{
                labels:[],
                datasets:[
                    {
                        label:"Autor predominante",
                        data:[],
                        backgroundColor:"#0a85a7",
                        borderRadius:6,
                        maxBarThickness:70
                    },
                    {
                        label:"Segundo autor",
                        data:[],
                        backgroundColor:"#f8c133",
                        borderRadius:6,
                        maxBarThickness:70
                    }
                ]
            },

            options:{
                responsive:true,
                maintainAspectRatio:false,

                plugins:{
                    legend:{
                        labels:{
                            font:{
                                family:"Poppins",
                                weight:600
                            },
                            color:"#052f5c"
                        }
                    },
                    datalabels:{
                        display:false
                    }
                },

                scales:{
                    y:{
                        beginAtZero:true,
                        ticks:{ color:"#052f5c" },
                        grid:{ color:"#e2e6ea" },
                        title:{
                            display:true,
                            text:"Quantidade de Pessoas",
                            color:"#052f5c",
                            font:{ family:"Poppins", weight:600 }
                        }
                    },

                    x:{
                        ticks:{
                            color:"#052f5c",
                            font:{ family:"Poppins", weight:700 }
                        },
                        grid:{ display:false },
                        title:{
                            display:true,
                            text:"Filósofos",
                            color:"#052f5c",
                            font:{ family:"Poppins", weight:600 }
                        }
                    }
                }
            }
        }
    );

}

function criarGraficoDistribuicao(){

    const cor = {
        discorda:"#e2574c",
        neutro:"#c9d3da",
        concorda:"#0a85a7",
        concordaForte:"#f8c133"
    };

    chartDistribuicao = new Chart(
        document.getElementById("chartDistribuicao"),
        {
            type:"bar",

            data:{
                labels:["Bacon","Popper","Kuhn","Feyerabend"],
                datasets:[
                    {
                        label:"Discorda (-2 a -0.4)",
                        data:[],
                        backgroundColor:cor.discorda,
                        datalabels:{ color:"#ffffff" }
                    },
                    {
                        label:"Neutro (-0.4 a 0.4)",
                        data:[],
                        backgroundColor:cor.neutro,
                        datalabels:{ color:"#052f5c" }
                    },
                    {
                        label:"Concorda (0.4 a 1.2)",
                        data:[],
                        backgroundColor:cor.concorda,
                        datalabels:{ color:"#ffffff" }
                    },
                    {
                        label:"Concorda Fortemente (1.2 a 2)",
                        data:[],
                        backgroundColor:cor.concordaForte,
                        datalabels:{ color:"#052f5c" }
                    }
                ]
            },

            options:{
                indexAxis:"y",
                responsive:true,
                maintainAspectRatio:false,

                plugins:{
                    legend:{
                        position:"bottom",
                        labels:{
                            font:{ family:"Poppins", weight:600 },
                            color:"#052f5c",
                            boxWidth:14,
                            padding:16
                        }
                    },
                    datalabels:{
                        formatter:(valor)=>
                            valor >= 5 ? Math.round(valor) + "%" : "",
                        font:{ family:"Poppins", weight:700, size:12 }
                    }
                },

                scales:{
                    x:{
                        stacked:true,
                        min:0,
                        max:100,
                        ticks:{
                            color:"#052f5c",
                            callback:(v)=> v + "%"
                        },
                        grid:{ color:"#e2e6ea" }
                    },
                    y:{
                        stacked:true,
                        ticks:{
                            color:"#052f5c",
                            font:{ family:"Poppins", weight:700 }
                        },
                        grid:{ display:false }
                    }
                }
            }
        }
    );

}

function corGrupo(grupo){

    if(grupo==="Você é:")
        return "#0a85a7";

    if(grupo==="Idade:")
        return "#2f6fb0";

    return "#f3b21a";
}

// Quebra um texto em várias linhas curtas para caber dentro do círculo.
// Também quebra palavras muito longas usando o hífen como ponto de corte.
function quebrarTexto(texto, maxChars){

    const palavrasBrutas = texto.split(" ");

    const palavras = [];

    palavrasBrutas.forEach(p=>{

        if(p.length > maxChars && p.includes("-")){

            const partes = p.split("-");

            partes.forEach((parte,i)=>{
                palavras.push(
                    i < partes.length - 1 ? parte + "-" : parte
                );
            });

        }else{
            palavras.push(p);
        }
    });

    const linhas = [];
    let atual = "";

    palavras.forEach(palavra=>{

        const teste =
            atual ? atual + " " + palavra : palavra;

        if(teste.length > maxChars && atual){
            linhas.push(atual);
            atual = palavra;
        }else{
            atual = teste;
        }
    });

    if(atual) linhas.push(atual);

    return linhas;
}

// Calcula o raio necessário para caber as linhas de texto com folga.
function calcularRaio(linhas){

    const maiorLinha =
        Math.max(...linhas.map(l => l.length), 1);

    const raioLargura = maiorLinha * 3.6 + 18;
    const raioAltura = linhas.length * 9 + 30;

    return Math.max(48, raioLargura, raioAltura);
}

function gerarGrafo(){

    svg.innerHTML="";

    nodes.length = 0;
    edges.length = 0;

    const grupos = [
        "Você é:",
        "Idade:",
        "Gênero"
    ];

    const yPos = [
        150,
        430,
        720
    ];

    const MAX_CHARS_LINHA = 13;

    // 1ª passada: monta os dados de cada grupo (valores, linhas, raio)
    // e descobre o espaçamento necessário para não haver sobreposição.
    const gruposInfo = grupos.map(grupo=>{

        const valores = [
            ...new Set(
                dados
                    .map(x => x[grupo])
                    .filter(Boolean)
            )
        ];

        const itens = valores.map(valor=>{

            const linhas =
                quebrarTexto(valor, MAX_CHARS_LINHA);

            const raio =
                calcularRaio(linhas);

            return { valor, linhas, raio };
        });

        const raioMaximo =
            Math.max(...itens.map(it => it.raio), 48);

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

    gruposInfo.forEach((info,indice)=>{

        const { grupo, itens } = info;

        filtros[grupo] = [];

        const titulo =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

        titulo.setAttribute("x",20);

        titulo.setAttribute(
            "y",
            yPos[indice]-95
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

        itens.forEach((item,i)=>{

            const x =
                espacamento * (i+1);

            const y =
                yPos[indice];

            filtros[grupo].push(item.valor);

            nodes.push({
                grupo,
                valor:item.valor,
                linhas:item.linhas,
                raio:item.raio,
                ativo:true,
                x,
                y
            });
        });
    });

    svg.setAttribute(
        "viewBox",
        `0 0 ${largura} 900`
    );

    criarArestasAutomaticas();

    desenharArestas();

    desenharVertices();
}

function criarArestasAutomaticas(){

    const mapa = {};

    nodes.forEach(n=>{

        mapa[
            `${n.grupo}|${n.valor}`
        ] = n;
    });

    const conexoes =
        new Set();

    dados.forEach(linha=>{

        const g1 =
            linha["Você é:"];

        const g2 =
            linha["Idade:"];

        const g3 =
            linha["Gênero"];

        if(g1 && g2){

            conexoes.add(
                `Você é:|${g1}|Idade:|${g2}`
            );
        }

        if(g2 && g3){

            conexoes.add(
                `Idade:|${g2}|Gênero|${g3}`
            );
        }
    });

    conexoes.forEach(c=>{

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

        if(origem && destino){

            edges.push({
                origem,
                destino
            });
        }
    });
}

function desenharArestas(){

    edges.forEach(edge=>{

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

        edge.element=line;

        svg.appendChild(line);
    });
}

function desenharVertices(){

    const svgNS = "http://www.w3.org/2000/svg";

    nodes.forEach(node=>{

        const circle =
            document.createElementNS(svgNS,"circle");

        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        circle.setAttribute("r", node.raio);
        circle.setAttribute("fill", "#ffffff");
        circle.setAttribute("stroke", corGrupo(node.grupo));
        circle.setAttribute("class", "node");

        circle.addEventListener(
            "click",
            ()=>toggleNode(node)
        );

        const tooltip =
            document.createElementNS(svgNS,"title");

        tooltip.textContent = node.valor;

        circle.appendChild(tooltip);

        svg.appendChild(circle);

        const text =
            document.createElementNS(svgNS,"text");

        text.setAttribute("x", node.x);
        text.setAttribute("y", node.y);
        text.setAttribute("class", "label");
        text.style.pointerEvents = "none";

        const alturaLinha = 14;

        const dyInicial =
            -((node.linhas.length - 1) / 2) * alturaLinha;

        node.linhas.forEach((linha,i)=>{

            const tspan =
                document.createElementNS(svgNS,"tspan");

            tspan.setAttribute("x", node.x);

            tspan.setAttribute(
                "dy",
                i === 0 ? dyInicial : alturaLinha
            );

            tspan.textContent = linha;

            text.appendChild(tspan);
        });

        svg.appendChild(text);

        node.circle=circle;
    });
}

function toggleNode(node){

    const grupo = node.grupo;

    const todos =
        nodes.filter(n => n.grupo === grupo);

    const ativos =
        todos.filter(n => n.ativo);

    // Se só existe um ativo e ele foi clicado,
    // ativa todos novamente.
    if(ativos.length === 1 && node.ativo){

        todos.forEach(n=>{
            n.ativo = true;
            n.circle.classList.remove("node-disabled");
        });

    }

    // Se todos estão ativos,
    // deixa somente o clicado.
    else if(ativos.length === todos.length){

        todos.forEach(n=>{

            n.ativo = (n === node);

            if(n.ativo){
                n.circle.classList.remove("node-disabled");
            }else{
                n.circle.classList.add("node-disabled");
            }

        });

    }

    // Caso intermediário
    else{

        node.ativo = !node.ativo;

        if(node.ativo){
            node.circle.classList.remove("node-disabled");
        }else{
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

function atualizarArestas(){

    edges.forEach(edge=>{

        const ativa =
            edge.origem.ativo &&
            edge.destino.ativo;

        if(ativa){
            edge.element.classList.remove(
                "edge-disabled"
            );
        }
        else{
            edge.element.classList.add(
                "edge-disabled"
            );
        }
    });
}

function atualizarGrafico(){

    // Aplica os filtros
    let filtrado = [...dados];

    Object.keys(filtros).forEach(grupo => {

        if(filtros[grupo].length > 0){

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

        if(predominante.hasOwnProperty(a1)){
            predominante[a1]++;
        }

        if(segundo.hasOwnProperty(a2)){
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

    const statFiltered = document.getElementById("statFiltered");

    if(statFiltered){
        statFiltered.textContent = filtrado.length;
    }

}

function atualizarDistribuicao(filtrado){

    if(!chartDistribuicao) return;

    const autores = [
        "Bacon",
        "Popper",
        "Kuhn",
        "Feyerabend"
    ];

    const faixas = {
        discorda:[],
        neutro:[],
        concorda:[],
        concordaForte:[]
    };

    autores.forEach(autor=>{

        let discorda = 0;
        let neutro = 0;
        let concorda = 0;
        let concordaForte = 0;
        let total = 0;

        filtrado.forEach(linha=>{

            const bruto = linha[autor];

            if(bruto === undefined || bruto === null || bruto === "") return;

            const valor =
                parseFloat(String(bruto).replace(",","."));

            if(isNaN(valor)) return;

            total++;

            if(valor < -0.4) discorda++;
            else if(valor < 0.4) neutro++;
            else if(valor < 1.2) concorda++;
            else concordaForte++;
        });

        faixas.discorda.push(
            total > 0 ? (discorda/total)*100 : 0
        );

        faixas.neutro.push(
            total > 0 ? (neutro/total)*100 : 0
        );

        faixas.concorda.push(
            total > 0 ? (concorda/total)*100 : 0
        );

        faixas.concordaForte.push(
            total > 0 ? (concordaForte/total)*100 : 0
        );
    });

    chartDistribuicao.data.datasets[0].data = faixas.discorda;
    chartDistribuicao.data.datasets[1].data = faixas.neutro;
    chartDistribuicao.data.datasets[2].data = faixas.concorda;
    chartDistribuicao.data.datasets[3].data = faixas.concordaForte;

    chartDistribuicao.update();

}
