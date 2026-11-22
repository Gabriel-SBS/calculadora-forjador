# Calculadora do Forjador

Fiz esta calculadora para a minha mesa de D&D 5e, onde jogo com a classe **Forjador** do *Guia de Xyleff Sualky para Coisas Impensáveis*, escrito por Felix Klaus. A regra de materiais do Guia é ótima, mas na hora de forjar uma espada no meio da sessão ninguém quer ficar multiplicando PDE por material, aplicando desconto, dividindo a mão de obra e somando horas por tier. A calculadora faz essa conta e mostra de onde saiu cada número.

**Usar online:** https://gabriel-sbs.github.io/calculadora-forjador/

É um único arquivo HTML, sem instalação. Também dá para baixar o `index.html` e abrir direto no navegador, inclusive sem internet. No celular, dá para adicionar à tela inicial e ela abre como app; depois da primeira visita, ela continua abrindo mesmo sem internet.

## Como usar

1. Em **Equipamento do Guia**, digite o nome do item (por exemplo "espada longa", "cota de malha" ou "orbe"). A lista tem as armas, escudos, armaduras, munições, pólvoras, focos de conjuração, instrumento musical e carregador de munição do Guia. O PDE, o tipo e o peso são preenchidos sozinhos. Se o item não estiver na lista, digite o PDE à mão.
   O botão **Como funciona?**, ao lado do tipo de item, resume as regras de criação daquele tipo (arma, armadura, munição ou pólvora) com as páginas do Guia. O que não vale para o tipo escolhido some da tela: a pólvora, por exemplo, não usa materiais nem modificações.
2. Em **Materiais**, busque o material ("aço", "prata", "coral", "pedra filosofal"...). O multiplicador e o tier vêm da tabela do Guia. Dá para juntar até 4 materiais no mesmo item (ou até 6 na **Excalibur**, do 20º nível).
3. Em **O Forjador**, ligue o que vale para o seu personagem. Em **Custo** ficam o talento Artesão (e se o desconto entra uma ou duas vezes) e se você já tem os materiais; em **Tempo e qualidade**, Pressa, Obra-Prima, O Melhor dos Melhores, Criações Automáticas e Excalibur.
4. Em **Finalidade**, escolha entre **Uso próprio**, **Para venda** (com margem de lucro) ou **Consertar quebrado** (metade do valor do item, p. 173, com a mão de obra dividida por 2 pelo Trabalhador Itinerante).
5. O custo e o tempo do Forjador aparecem no painel de resultado (no computador ele fica fixo na lateral; no celular, uma barra no rodapé mostra os dois enquanto você rola). Logo abaixo vêm a conta passo a passo, a comparação com um ferreiro comum e o tempo de produção em detalhe.

Os valores aparecem em moedas do D&D: peças de ouro (po), prata (pp) e cobre (pc), arredondados para a peça de cobre. Uma flecha, por exemplo, custa 5 pc, e não 0,05 po. Electro e platina ficam de fora porque o Livro do Jogador diz que são incomuns em transações. Os campos de preço continuam em po, como os preços do Guia.

Os valores ficam salvos no seu navegador, então dá para fechar a página e voltar depois.

### Copiar e montar uma lista

- **Copiar resultado** gera um texto pronto para colar no Discord ou no WhatsApp da mesa, com item, materiais, custo, tempo, modificador e dureza.
- **Adicionar à lista** guarda o item atual na **Lista da sessão**, que soma o custo e o tempo de todos os itens (o tempo considera um item feito depois do outro). Serve para quando o grupo encomenda vários equipamentos de uma vez. A lista também pode ser copiada inteira e fica salva no navegador até você limpar.

## Aparência

No topo da página há três controles:

- **Tema (lua / sol):** troca entre o tema diurno e o noturno, numa onda que sai do botão. Na primeira visita a calculadora segue o tema do seu sistema; depois lembra a sua escolha.
- **Mostrar dureza:** esconde a Dureza do item pronto, para mesas que não usam a regra opcional de quebra de equipamentos.
- **Modo forja:** liga brasas subindo pelo fundo da página. Vem desligado e é só enfeite: não muda nenhuma conta.

Se o sistema estiver com "reduzir movimento" ligado, a troca de tema é instantânea e as brasas ficam paradas. No Firefox a troca de tema também é instantânea, porque ele ainda não tem suporte à animação.

## O que ela calcula

**Custo**
- PDE × multiplicador do material, com o Trabalhador Itinerante do Forjador (paga só a matéria-prima, ou seja, metade) e o desconto de 20% do talento Artesão.
- Modos "Para venda" (com margem de lucro) e "Consertar quebrado" (metade do valor do item, p. 173, pagando só a matéria-prima pelo Trabalhador Itinerante).
- As 26 modificações de armas e equipamentos (p. 163–167). Elas entram no valor-base antes de multiplicar pelo material, como o livro manda. Se o item já existe, a calculadora cobra só a modificação vezes o material.
- Munições custam o preço de 4 unidades e rendem 2d4. Pólvoras custam 2 unidades e rendem 1d4 (p. 171).
- As 8 modificações de munição (p. 160), uma por munição: preço fixo por munição transformada (a Assobiante sai 5 po a cada 5), fora do multiplicador do material. Dá para modificar munições novas, somando ao custo da criação, ou só transformar as que você já tem.

**Tempo**
- 24h, 48h, 96h ou 192h conforme o tier, somando quando há mais de um material (regra de junção).
- Leve tira 8 horas, Pesado soma 8 horas, Pressa corta pela metade e o item sai com −1.
- O Forjador trabalha em 2/3 do tempo e aguenta 12 horas por dia. Também aparece o tempo com um ajudante, com a ferramenta automatizada de **Criações Automáticas** (17º nível da Forja Arcana, que corta pela metade o tempo de materiais raros e itens mágicos, p. 130) e o de alguém de outra classe, para comparar.

**O item pronto**
- Dureza e modificador finais, contando Obra-Prima (+1, até +3) e O Melhor dos Melhores (nível 14).
- **Excalibur** (20º nível, p. 128): permite combinar até 6 materiais (4 Tier S + 2 Tier A ou mais baixo) numa arma ou foco de conjuração, com o tempo de criação de um único material Tier S e encantamento Lendário sem exigir StarMetal (+0h).
- Aviso de equipamento SS ou SA quando os materiais passam do que a regra permite.
- Vantagens e desvantagens dos 69 materiais do livro completo (incluindo a **Pedra Filosofal**, exclusiva do Alquimista de 17º nível, p. 131).

**Itens mágicos e transmutação**
- Custo e horas do encantamento por raridade (p. 169), tempo total somado à fabricação do item e o material exigido: StarWood para raro, StarStone para muito raro, StarMetal para lendário.
- Habilidades do Forjador que mexem nisso: Perito, Especialista, Criações Automáticas, Versado, Excalibur e a energia de um item desencantado.
- Transmutação do Forjador Alquimista no 3º, 7º e 13º nível (p. 130–131).

## Desconto do Artesão: 36% ou 20%?

O talento Artesão dá 20% de desconto na compra de itens não-mágicos. A dúvida é quantas compras o Forjador faz, e por isso a calculadora tem um botão para escolher:

- **Duas compras (−36%)**, como jogamos na nossa mesa. O Forjador compra a matéria-prima de um NPC e depois paga a fabricação do item, e cada uma recebe os 20%. Descontos seguidos se multiplicam, não se somam: 0,8 × 0,8 = 0,64. Você paga 64% do preço, ou seja, 36% de desconto, e não 40%.
- **Uma compra (−20%)**, a leitura literal do talento. Como o próprio Forjador fabrica o item, a única compra é a da matéria-prima, e o desconto entra uma vez só.

Exemplo com uma espada longa de aço (PDE 50 × 36 de materiais = 1.800 po cheio, ÷ 2 pelo Trabalhador Itinerante): 576 po com duas compras, 720 po com uma. Combine com o seu Mestre qual vale.

## Limites

A calculadora não decide nada que o Guia deixa para o Mestre: o tempo de itens que não são armas, armaduras ou munições, a CD dos testes de criação e as receitas secretas dos materiais Tier A e S. Ela também não substitui o livro; os números de página estão aí para conferir.

Achou um número diferente do livro? Abra uma issue dizendo o item, os materiais e a página.

## O que mudou em cada versão

### v3
- As moedas de ouro (`po`), prata (`pp`) e cobre (`pc`) agora têm cores e selos próprios no resultado principal, para bater o olho e separar o ouro dos trocados.
- Cada tier (`D` a `S`) ganhou uma etiqueta colorida nas vantagens e um friso da mesma cor no campo do material escolhido. Quando a Excalibur está ligada, aparece também um selo roxo de Artefato no resultado.
- Entraram um ícone de bigorna no topo (que acende junto com o Modo forja), fio duplo de livro-caixa nos totais do recibo e da lista, barra em cor de brasa com a porcentagem economizada no comparativo e relevo nos botões e interruptores.
- Os botões de seleção (*Arma / Armadura / Munição / Pólvora*, *Peso* e *Finalidade*) agora têm uma pílula que desliza de uma opção para outra no clique, mas muda na hora quando você usa as setas do teclado.
- As gavetas de Modificações e de Itens Mágicos abrem e fecham deslizando (`220ms` para abrir, `165ms` para fechar), as linhas saem suavemente quando você apaga um material ou item da lista, os botões de copiar e adicionar mostram um `✓` de confirmação e a onda da troca de tema ficou mais curta (`1,15s`).

### v2
- Conferi os 68 materiais com o livro completo de 239 páginas (p. 174–197), atualizando os efeitos de armas com a propriedade Munição e a regra *Despertar* da Samambaia Metamórfica.
- Entraram a Pedra Filosofal (o 69º material, Tier S do Alquimista de 17º nível, p. 131), o instrumento musical (`75 po`, p. 162 e 170) e o carregador de munição (`5 po`, p. 166).
- Adicionei as 8 modificações de munição da p. 160 (*Alquímica*, *Assobiante*, *Contundente*, *Farpada*, *Incendiária*, *Perfurante*, *Pesada* e *Serrilhada*), com campo de quantidade e opção de só transformar munições que você já tem.
- Entraram o modo Consertar quebrado em Finalidade (metade do valor do item, p. 173, pagando só a matéria-prima pelo Trabalhador Itinerante), Criações Automáticas do 17º nível (corta pela metade o tempo de materiais raros e itens mágicos, p. 130) e a Excalibur do 20º nível (até 6 materiais em armas ou focos, tempo de 1 Tier S e encantamento Lendário sem StarMetal, p. 128).
- Corrigi o tempo da Transmutação Avançada (7º nível) ao trocar de categoria entre materiais Tier D e C (p. 130–131) e somei o tempo de fabricação ao de encantamento nos Itens Mágicos.
- Os preços passaram a sair em moedas do D&D (`po`, `pp` e `pc`), entrou o botão *Como funciona?* com o resumo das regras por tipo de item, o que não vale para o tipo escolhido fica escondido e o aviso de *Desfazer* pausa enquanto o mouse está em cima ou você troca de aba.

### v1
- Primeira versão: conta de custo com PDE × até 4 materiais, Trabalhador Itinerante (`÷2`), talento Artesão (uma compra de `−20%` ou duas de `−36%`), fração fixa opcional para armaduras e modo Para venda com margem de lucro.
- Tempo de produção por tier e peso do item, com o tempo do Forjador sozinho, com ajudante (12h por dia) e o de alguém de outra classe (8h por dia).
- Dureza e modificador finais do item (com Pressa, Obra-Prima e O Melhor dos Melhores), avisos da Junção de Materiais (Tier SS e SA), lista de equipamentos do Guia, as 26 modificações de armas e equipamentos, Itens Mágicos e Transmutação.
- Recibo com a conta passo a passo, barras de comparação com um ferreiro comum, barra fixa de custo no celular, botão de copiar para o chat da mesa, Lista da sessão para somar encomendas do grupo, tema claro/escuro em onda, Modo forja com brasas no fundo e funcionamento sem internet (`sw.js`).

---

Conteúdo de fã, não oficial. *Dungeons & Dragons* é marca da Wizards of the Coast. As regras de materiais, classes e equipamentos são do *Guia de Xyleff Sualky para Coisas Impensáveis*, de Felix Klaus.
