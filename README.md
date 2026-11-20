# Calculadora do Forjador

Fiz esta calculadora para a minha mesa de D&D 5e, onde jogo com a classe **Forjador** do *Guia de Xyleff Sualky para Coisas Impensáveis*, escrito por Felix Klaus. A regra de materiais do Guia é ótima, mas na hora de forjar uma espada no meio da sessão ninguém quer ficar multiplicando PDE por material, aplicando desconto, dividindo a mão de obra e somando horas por tier. A calculadora faz essa conta e mostra de onde saiu cada número.

**Usar online:** https://gabriel-sbs.github.io/calculadora-forjador/

É um único arquivo HTML, sem instalação. Também dá para baixar o `index.html` e abrir direto no navegador, inclusive sem internet. No celular, dá para adicionar à tela inicial e ela abre como app.

## Como usar

1. Em **Equipamento do Guia**, digite o nome do item (por exemplo "espada longa" ou "cota de malha"). O PDE, o tipo e o peso são preenchidos sozinhos. Se o item não estiver na lista, digite o PDE à mão.
2. Em **Materiais**, busque o material ("aço", "prata", "coral"...). O multiplicador e o tier vêm da tabela do Guia. Dá para juntar até 4 materiais no mesmo item.
3. Ligue o que vale para o seu personagem: talento Artesão, se você já tem os materiais, Pressa, Obra-Prima.
4. O custo aparece no topo (no computador ele fica fixo na lateral). Logo abaixo vêm a conta passo a passo, a comparação com um ferreiro comum e o tempo de produção.

Os valores ficam salvos no seu navegador, então dá para fechar a página e voltar depois.

## O que ela calcula

**Custo**
- PDE × multiplicador do material, com o Trabalhador Itinerante do Forjador (paga só a matéria-prima, ou seja, metade) e o desconto de 20% do talento Artesão.
- Modo "Item para Venda", com margem de lucro, para quando o Forjador vende o trabalho.
- As 25 modificações de armas (p. 163–168). Elas entram no valor-base antes de multiplicar pelo material, como o livro manda. Se o item já existe, a calculadora cobra só a modificação vezes o material.
- Munições custam o preço de 4 unidades e rendem 2d4. Pólvoras custam 2 unidades e rendem 1d4 (p. 171).

**Tempo**
- 24h, 48h, 96h ou 192h conforme o tier, somando quando há mais de um material (regra de junção).
- Leve tira 8 horas, Pesado soma 8 horas, Pressa corta pela metade e o item sai com −1.
- O Forjador trabalha em 2/3 do tempo e aguenta 12 horas por dia. Também aparece o tempo com um ajudante e o de alguém de outra classe, para comparar.

**O item pronto**
- Dureza e modificador finais, contando Obra-Prima (+1, até +3) e O Melhor dos Melhores (nível 14).
- Aviso de equipamento SS ou SA quando os materiais passam do que a regra permite.
- Vantagens e desvantagens de cada material escolhido.

**Itens mágicos e transmutação**
- Custo e horas do encantamento por raridade (p. 169) e o material exigido: StarWood para raro, StarStone para muito raro, StarMetal para lendário.
- Habilidades do Forjador que mexem nisso: Perito, Especialista, Criações Automáticas, Versado e a energia de um item desencantado.
- Transmutação do Forjador Alquimista no 3º, 7º e 13º nível.

## Uma escolha da nossa mesa

Aqui o desconto do Artesão entra duas vezes: uma na compra do material e outra na fabricação do item, porque contamos as duas como compras separadas. Na prática isso dá 36% de desconto, não 20%. Se a sua mesa lê a regra de outro jeito, é só desligar o Artesão e aplicar o desconto que vocês usam.

## Limites

A calculadora não decide nada que o Guia deixa para o Mestre: o tempo de itens que não são armas, armaduras ou munições, a CD dos testes de criação e as receitas secretas dos materiais Tier A e S. Ela também não substitui o livro; os números de página estão aí para conferir.

Achou um número diferente do livro? Abra uma issue dizendo o item, os materiais e a página.

---

Conteúdo de fã, não oficial. *Dungeons & Dragons* é marca da Wizards of the Coast. As regras de materiais, classes e equipamentos são do *Guia de Xyleff Sualky para Coisas Impensáveis*, de Felix Klaus.
