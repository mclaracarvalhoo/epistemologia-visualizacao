# O que é Ciência? — Dashboard de Epistemologia

Dashboard interativo com os resultados da pesquisa **Nó da Ciência**, que relaciona as respostas da comunidade acadêmica do IMPA Tech aos quatro filósofos da ciência estudados na disciplina: **Francis Bacon**, **Karl Popper**, **Thomas Kuhn** e **Paul Feyerabend**.

🔗 **Acesse o site:** [mclaracarvalhoo.github.io/epistemologia-visualizacao](https://mclaracarvalhoo.github.io/epistemologia-visualizacao)

## Autoria

**Disciplina:** HU31 — Epistemologia da Ciência (2026.1), IMPA Tech
**Professor:** Rafael Beraldo
**Monitor:** Daniel Silva

**Alunos:**

| Nº | Participante | Curso/Ênfase |
|----|---------------|--------------|
| 01 | Andressa N Pantoja | Física (UFRJ) |
| 02 | Beatriz Nunes Carvalho | Ciência de Dados |
| 03 | Cléo Rodrigues da Paixão Vilhena | Física (UFRJ) |
| 04 | Daphny Selchea Santos | Ciência de Dados |
| 05 | Eliani Magalhães Beloni | Ciência de Dados |
| 06 | Francisco José Gomes de Souza Júnior | Matemática |
| 07 | Gabriel de Souza Vieira | Ciência da Computação |
| 08 | Henrique Assis Silva Rodrigues | Matemática |
| 09 | Herivelton Guilherme A. de Siqueira | Ciência de Dados |
| 10 | Jader Rezende Mohr Apollo Duarte | Matemática |
| 11 | Jonathas David de Lima Santos | Ciência de Dados |
| 12 | Luísa Pereira da Silva Goldenstein | Física (UFRJ) |
| 13 | Maria Clara Carvalho Fernandes | Ciência da Computação |
| 14 | Maria Eduarda Carvalho Rêgo Martins | Matemática |
| 15 | Maria Fernanda Costa Martins Rodrigues da Cunha | Ciência de Dados |
| 16 | Pedro Jetro de Albuquerque Souza de Souza | Física (UFRJ) |

## Relatório final

📄 O relatório completo do projeto (metodologia, público-alvo, impacto e referências) está anexado neste repositório: **[`relatorio.pdf`](./relatorio.pdf)**

## Sobre o projeto

O projeto **Nó da Ciência** teve como objetivo identificar os perfis epistemológicos predominantes entre professores, estudantes e funcionários do IMPA Tech, a partir das concepções filosóficas de Bacon, Popper, Kuhn e Feyerabend. A coleta de dados foi concluída em 25 de junho de 2026, com **101 participantes**, e os resultados foram apresentados publicamente em 4 de julho de 2026.

## Cópia do questionário

O instrumento de pesquisa foi composto por 16 afirmações em escala Likert (além de perguntas demográficas de perfil, idade, gênero e ênfase acadêmica), elaboradas a partir da revisão bibliográfica dos quatro autores estudados.

- 📄 **Cópia completa das perguntas:** [`questionario.md`](./questionario.md)

> O link original do Google Forms parou de funcionar, então a cópia das perguntas passou a ficar versionada diretamente neste repositório, sem depender de um serviço externo.

## Política de compartilhamento dos dados

- Os dados em [`dados.csv`](./dados.csv) são as respostas **anonimizadas** dos 101 participantes — nenhum nome, e-mail ou identificador pessoal é coletado ou divulgado.
- As variáveis demográficas (perfil, idade, gênero, ênfase acadêmica) são usadas apenas de forma agregada, para permitir comparações entre grupos, e não permitem identificar indivíduos.
- O uso e redistribuição dos dados é livre para fins acadêmicos e de pesquisa, desde que citada a autoria do projeto (ver [Licença](#licença)).
- Dúvidas ou pedidos relacionados aos dados podem ser encaminhados à equipe do projeto ou ao professor responsável pela disciplina.

## Licença

Este repositório está licenciado sob a **Licença MIT** — veja o arquivo [`LICENSE`](./LICENSE) para o texto completo. Em resumo: qualquer pessoa pode usar, copiar, modificar e redistribuir este código (e os dados anonimizados), inclusive para fins comerciais, desde que mantido o aviso de copyright original.

## Funcionalidades do site

- **Filtros interativos** — grafo clicável para isolar respostas por perfil, faixa etária e gênero.
- **Autor predominante** — gráfico de barras com o filósofo mais próximo de cada pessoa.
- **Distribuição percentual** — barras empilhadas de discordância/concordância com cada filósofo.
- **Correlação entre filósofos** — dispersão par a par, com reta de tendência e coeficiente de Pearson.
- **Boxplot** — mínimo, máximo, média e faixas de 20%/80% por filósofo.
- **Radar comparativo** — Top 20% vs. Média vs. Bottom 20%.
- **Cards dos filósofos** — introdução a Bacon, Popper, Kuhn e Feyerabend.

## Tecnologias

HTML, CSS e JavaScript puro · [Chart.js](https://www.chartjs.org/) · [PapaParse](https://www.papaparse.com/) · SVG e Canvas nativos.

## Estrutura de arquivos

```
├── index.html
├── style.css
├── script.js
├── dados.csv
├── questionario.md
├── relatorio.pdf
├── LICENSE
└── img/
    ├── bacon.png
    ├── popper.png
    ├── kuhn.png
    └── feyerabend.png
```

## Referências

BACON, Francis. *Novum Organum*. São Paulo: Editora Abril Cultural, 1973. </br>
POPPER, Karl. *A lógica da descoberta científica*. São Paulo: Cultrix, 2007. </br>
POPPER, Karl. *Conjecturas e refutações*. Brasília: Editora UNB, 1982. </br>
KUHN, Thomas S. *A estrutura das revoluções científicas*. São Paulo: Perspectiva, 2013. </br>
FEYERABEND, Paul. *Contra o método*. Rio de Janeiro: Francisco Alves, 1989.
