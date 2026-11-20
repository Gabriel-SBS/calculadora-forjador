# Calculadora do Forjador

Fiz esta calculadora para a minha mesa de D&D 5e, onde jogo com a classe **Forjador** do *Guia de Xyleff Sualky para Coisas Impensáveis*, escrito por Felix Klaus. A regra de materiais do Guia é ótima, mas na hora de forjar uma espada no meio da sessão ninguém quer ficar multiplicando PDE por material, aplicando desconto, dividindo a mão de obra e somando horas por tier. A calculadora faz essa conta e mostra de onde saiu cada número.

**Usar online:** https://gabriel-sbs.github.io/calculadora-forjador/

É um único arquivo HTML, sem instalação. Também dá para baixar o `index.html` e abrir direto no navegador, inclusive sem internet. No celular, dá para adicionar à tela inicial e ela abre como app.

## Como usar

1. Em **Equipamento do Guia**, digite o nome do item (por exemplo "espada longa" ou "cota de malha"). O PDE, o tipo e o peso são preenchidos sozinhos. Se o item não estiver na lista, digite o PDE à mão.
2. Em **Materiais**, busque o material ("aço", "prata", "coral"...). O multiplicador e o tier vêm da tabela do Guia. Dá para juntar até 4 materiais no mesmo item.
3. Em **O Forjador**, ligue o que vale para o seu personagem: talento Artesão (e se o desconto entra uma ou duas vezes), se você já tem os materiais, Pressa, Obra-Prima.
4. O custo e o tempo do Forjador aparecem no painel de resultado (no computador ele fica fixo na lateral; no celular, uma barra no rodapé mostra os dois enquanto você rola). Logo abaixo vêm a conta passo a passo, a comparação com um ferreiro comum e o tempo de produção em detalhe.

Os valores ficam salvos no seu navegador, então dá para fechar a página e voltar depois.

## Aparência

No topo da página há três controles:

- **Tema (lua / sol):** troca entre o tema diurno e o noturno, numa onda que sai do botão. Na primeira visita a calculadora segue o tema do seu sistema; depois lembra a sua escolha.
- **Mostrar dureza:** esconde a Dureza do item pronto, para mesas que não usam a regra opcional de quebra de equipamentos.
- **Modo forja:** liga brasas subindo pelo fundo da página. Vem desligado e é só enfeite: não muda nenhuma conta.

Se o sistema estiver com "reduzir movimento" ligado, a troca de tema é instantânea e as brasas ficam paradas. No Firefox a troca de tema também é instantânea, porque ele ainda não tem suporte à animação.

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

## Desconto do Artesão: 36% ou 20%?

O talento Artesão dá 20% de desconto na compra de itens não-mágicos. A dúvida é quantas compras o Forjador faz, e por isso a calculadora tem um botão para escolher:

- **Duas compras (−36%)**, como jogamos na nossa mesa. O Forjador compra a matéria-prima de um NPC e depois paga a fabricação do item, e cada uma recebe os 20%. Descontos seguidos se multiplicam, não se somam: 0,8 × 0,8 = 0,64. Você paga 64% do preço, ou seja, 36% de desconto, e não 40%.
- **Uma compra (−20%)**, a leitura literal do talento. Como o próprio Forjador fabrica o item, a única compra é a da matéria-prima, e o desconto entra uma vez só.

Exemplo com uma espada longa de aço (PDE 50 × 36 de materiais = 1.800 po cheio, ÷ 2 pelo Trabalhador Itinerante): 576 po com duas compras, 720 po com uma. Combine com o seu Mestre qual vale.

## Limites

A calculadora não decide nada que o Guia deixa para o Mestre: o tempo de itens que não são armas, armaduras ou munições, a CD dos testes de criação e as receitas secretas dos materiais Tier A e S. Ela também não substitui o livro; os números de página estão aí para conferir.

Achou um número diferente do livro? Abra uma issue dizendo o item, os materiais e a página.

---

Conteúdo de fã, não oficial. *Dungeons & Dragons* é marca da Wizards of the Coast. As regras de materiais, classes e equipamentos são do *Guia de Xyleff Sualky para Coisas Impensáveis*, de Felix Klaus.
