# Calculadora do Forjador

Fiz esta calculadora para a minha mesa de D&D 5e, onde jogo com a classe **Forjador** do *Guia de Xyleff Sualky para Coisas Impensáveis*, escrito por Felix Klaus. A regra de materiais do Guia é ótima, mas na hora de forjar uma espada no meio da sessão ninguém quer ficar multiplicando PDE por material, aplicando desconto, dividindo a mão de obra e somando horas por tier. A calculadora faz essa conta e mostra de onde saiu cada número.

**Usar online:** https://gabriel-sbs.github.io/calculadora-forjador/

É um único arquivo HTML, sem instalação. Também dá para baixar o `index.html` e abrir direto no navegador, inclusive sem internet. No celular, dá para adicionar à tela inicial e ela abre como app; depois da primeira visita, ela continua abrindo mesmo sem internet.

## Como usar

No topo da página ficam as três abas do Guia:

- **Forja de Equipamento:** armas, armaduras, escudos, focos de conjuração e instrumentos musicais.
- **Bombas e Munições:** as 16 bombas e bombinhas (p. 216–220), munições (inclusive de armas de fogo e canhão, p. 159–160) e as 11 pólvoras do Guia.
- **Herbalismo e Poções:** as 23 receitas herbáceas e a tabela dos 8 ramos (p. 148–150), com referência de forrageamento, estoque de herbolário e limite de receitas memorizadas.

Na **Forja de Equipamento**:

1. Em **Equipamento do Guia**, digite parte do nome (como "espada longa", "cota de malha" ou "orbe") ou a categoria ("armas", "armaduras", "escudos", "focos", "instrumentos"). O PDE, o tipo e o peso são preenchidos sozinhos. Se o item não estiver na lista, digite o PDE à mão.
   Em todas as buscas, o botão **Como funciona a pesquisa?** mostra o que dá para digitar (nome sem acento, categoria, tier, tipo de material, CD, salvaguarda, efeito ou cor do ramo), e **Como funciona?** resume as regras com as páginas do Guia.
2. Em **Materiais**, busque pelo nome ("aço", "prata", "coral", "pedra filosofal"), pelo tier ("tier d" a "tier s") ou pelo tipo ("metal", "vegetal", "geologico", "organico"). Dá para juntar até 4 materiais no mesmo item (ou até 6 na **Excalibur**, do 20º nível).
3. Em **O Forjador**, ligue o que vale para o seu personagem. Em **Custo** ficam o talento Artesão (com escolha entre duas compras de −36% ou uma de −20%, sincronizada com *Bombas e Munições*) e se você já tem os materiais; em **Tempo e qualidade**, Pressa, Obra-Prima, O Melhor dos Melhores, Criações Automáticas e Excalibur.
4. Em **Finalidade**, escolha entre **Uso próprio**, **Para venda** (com margem de lucro, disponível nas três abas) ou **Consertar quebrado** (metade do valor do item, p. 173, com a mão de obra dividida por 2 pelo Trabalhador Itinerante).
5. O custo e o tempo aparecem no painel de resultado (no computador ele fica fixo na lateral; no celular, uma barra no rodapé mostra os dois enquanto você rola). Logo abaixo vêm a conta passo a passo, a comparação com loja, alquimista ou ferreiro comum e os detalhes de vantagens, receitas ou tempo de produção.

Os valores aparecem em moedas do D&D: peças de ouro (po), prata (pp) e cobre (pc), arredondados para a peça de cobre. Uma flecha, por exemplo, custa 5 pc, e não 0,05 po. Electro e platina ficam de fora porque o Livro do Jogador diz que são incomuns em transações. Os campos de preço continuam em po, como os preços do Guia.

Os valores ficam salvos no seu navegador, então dá para fechar a página e voltar depois.

### Copiar, compartilhar e montar uma lista

- **Copiar resultado** gera um texto pronto para colar no Discord ou no WhatsApp da mesa, com item, materiais, custo, tempo, modificador e dureza.
- **Copiar link** gera um endereço (`?s=...`) com a oficina, o item, os materiais e as opções preenchidos. Quem abrir o link vê a mesma conta no navegador.
- **Adicionar à lista** guarda o item atual na **Lista da sessão**, que soma o custo, o tempo (um item feito depois do outro) e o peso em kg de todos os itens. Dá para mudar a quantidade (`−` e `+`) direto na lista, marcar o que já ficou pronto (separando o pendente do total) e apagar só os itens concluídos. A lista também pode ser copiada inteira e fica salva no navegador até você limpar.

## Aparência

No topo da página há três controles:

- **Tema (lua / sol):** troca entre o tema diurno e o noturno, numa onda que sai do botão. Na primeira visita a calculadora segue o tema do seu sistema; depois lembra a sua escolha.
- **Mostrar dureza:** esconde a Dureza do item pronto, para mesas que não usam a regra opcional de quebra de equipamentos.
- **Modo forja / pólvora / jardim:** liga a animação ambiente no fundo da página, mudando conforme a oficina ativa (**brasas subindo** na Forja, **névoa de pólvora com clarões abafados e grãos inflamando** em Bombas e Munições, e **folhas botânicas caindo** em Herbalismo e Poções). Vem desligado e é só enfeite: não muda nenhuma conta.

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
- Peso final em kg (com os pesos oficiais das p. 155–162), ajustando sozinho quando o material dobra (*Ouro*, *Iron-Wood*, *Pedra Anã Refinada*), corta pela metade (*Mithral*, *Ébano*, *Aço Verde Baatoriano*, *Ossos*, *Quitina*) ou recebe a modificação *Estrutura Leve* (`−25%`).
- Dureza e modificador finais, indicando onde o bônus se aplica (p. 169: ataque e dano, só ataque em armas com munição, ataque de magia em focos, CA em armaduras/escudos ou teste em instrumentos), contando Obra-Prima (+1, até +3) e O Melhor dos Melhores (nível 14).
- Avisos sem bloqueio quando alguma modificação conflita com o item escolhido (como *Estrutura Ocultável* em item Pesado ou *Câmara Expandida* fora de arma de fogo) e chips de requisito para *Mithral* e materiais que tornam o item Pesado (`+2` Força).
- Conserto de **Material Vivo** (p. 173): zera o custo em po e lembra que exige magia de ressurreição.
- **Excalibur** (20º nível, p. 128): permite combinar até 6 materiais (4 Tier S + 2 Tier A ou mais baixo) numa arma ou foco de conjuração, com o tempo de criação de um único material Tier S e encantamento Lendário sem exigir StarMetal (+0h).
- Aviso de equipamento SS ou SA quando os materiais passam do que a regra permite.
- Vantagens e desvantagens dos 69 materiais do livro completo (incluindo a **Pedra Filosofal**, exclusiva do Alquimista de 17º nível, p. 131).

**Itens mágicos, transmutação e comparador**
- Custo e horas do encantamento por raridade (p. 169), tempo total somado à fabricação do item e o material exigido: StarWood para raro, StarStone para muito raro, StarMetal para lendário.
- Habilidades do Forjador que mexem nisso: Perito, Especialista, Criações Automáticas, Versado, Excalibur e a energia de um item desencantado.
- Transmutação do Forjador Alquimista no 3º, 7º e 13º nível (p. 130–131).
- Gaveta **Comparar Materiais Lado a Lado** para testar até 3 materiais no item atual e ver custo, tempo do Forjador, modificador, dureza e peso lado a lado.

**Bombas, Munições e Herbalismo**
- As 16 bombas do Guia (inteira ou bombinhas com peso `0,1 kg/un.`, 2d4 por lote ou ¼ do preço), troca de carga para as 11 pólvoras (p. 217), fabricação de lotes de pólvora (1d4 cargas em 8h base), nota do talento *Especialista em Pólvora* (p. 212) e CD de detonação (8 + DES + Mestre das Bombas).
- Munições comuns, bala de arma de fogo e bala colossal de canhão (p. 159), com peso do lote e as 8 modificações da p. 160.
- As 23 receitas herbáceas e a tabela dos 8 ramos (p. 148–150), comprando ramos, forrageando ou comprando pronto, modo Para venda com margem de lucro e referência de limite de receitas memorizadas (p. 148–149).

## Desconto do Artesão: 36% ou 20%?

O talento Artesão dá 20% de desconto na compra de itens não-mágicos. A dúvida é quantas compras o Forjador faz, e por isso a calculadora tem um botão para escolher (sincronizado entre Forja e Bombas; ligar ou desligar o talento vale nas três abas):

- **Duas compras (−36%)**, como jogamos na nossa mesa. O Forjador compra a matéria-prima de um NPC e depois paga a fabricação do item, e cada uma recebe os 20%. Descontos seguidos se multiplicam, não se somam: 0,8 × 0,8 = 0,64. Você paga 64% do preço, ou seja, 36% de desconto, e não 40%.
- **Uma compra (−20%)**, a leitura literal do talento. Como o próprio Forjador fabrica o item, a única compra é a da matéria-prima, e o desconto entra uma vez só. No Herbalismo só existe uma compra direta (os ramos ou a poção pronta), então o desconto entra uma vez só.

Exemplo com uma espada longa de aço (PDE 50 × 30 de Aço = 1.500 po cheio, ÷ 2 pelo Trabalhador Itinerante): 480 po com duas compras, 600 po com uma. Combine com o seu Mestre qual vale.

## Como montar o arquivo e rodar os testes

O código fica separado em `src/` (`template.html`, `styles.css`, `data/` e `js/`) e o `build.py` junta tudo no `index.html` único:

```bash
python build.py --sync
node --test tests/calc.test.js
```

## Limites

A calculadora não decide nada que o Guia deixa para o Mestre: o tempo de itens que não são armas, armaduras ou munições, a CD dos testes de criação e as receitas secretas dos materiais Tier A e S. Ela também não substitui o livro; os números de página estão aí para conferir.

Achou um número diferente do livro? Abra uma issue dizendo o item, os materiais e a página.

## O que mudou em cada versão

### v5
- Entrou o **peso real em kg** de todos os 143 equipamentos do Guia (p. 155–162) na busca, no resultado, no resumo copiado, no Comparador de Materiais, nas munições e na Lista da sessão (que agora soma o peso total e pendente).
- O peso recalcula sozinho conforme o material escolhido (`×2` em Ouro, Iron-Wood e Pedra Anã Refinada; `÷2` em Mithral, Ébano, Aço Verde Baatoriano, Ossos e Quitina) e com a modificação *Estrutura Leve* (`−25%`). Materiais que tornam o item Pesado (*Iron-Wood* e *Pedra Anã Refinada*) também marcam o botão **Pesado (+8h)** sozinhos.
- Novas regras do Guia aplicadas direto na conta e nos avisos: conserto de **Material Vivo** zerando o custo em po e avisando sobre magia de ressurreição (p. 173), indicação de onde o modificador se aplica no item (p. 169), nota de hora extra e exaustão (p. 125 e 170), peso da **Bombinha** (`0,1 kg/un.`, p. 216), nota de *Especialista em Pólvora* (p. 212) e limite de receitas memorizadas no Herbalismo (p. 148–149).
- Avisos não bloqueantes na Forja quando alguma modificação conflita com o item escolhido e chips de requisito para *Mithral* e materiais que aumentam requisito de Força.
- Melhorias de uso no dia a dia: botão `×` para limpar qualquer campo de busca em um toque, botão **limpar concluídos** na Lista da sessão (com Desfazer) e remoção dos roladores automáticos do Herbalismo para deixar a tabela dos 8 ramos limpa para quem rola presencialmente ou no Discord.
- Cache offline (`sw.js`) atualizado para `forjador-v5` e novos testes de peso e materiais vivos em `tests/calc.test.js`.

### v4
- A calculadora ganhou três abas no topo: **Forja de Equipamento**, **Bombas e Munições** e **Herbalismo e Poções**. Cada uma tem paleta própria, ícone no cabeçalho e animação de fundo diferente (brasas na Forja, névoa com clarões e grãos de pólvora em Bombas, e folhas caindo no Herbalismo), calibradas no tema claro e no escuro.
- Munições e pólvoras saíram da Forja e foram para **Bombas e Munições**, junto com as 16 bombas (inteira ou bombinhas 2d4), as 11 pólvoras (como carga ou lote 1d4), bala de arma de fogo e bala colossal (p. 159), CD de detonação com Mestre das Bombas e o modo do talento Artesão sincronizado com a Forja.
- Entrou a aba **Herbalismo e Poções** (p. 148–150) com as 23 receitas, a tabela dos 8 ramos, cálculo comprando ramos, forrageando ou comprando pronto, modo Para venda e roladores de Forragear e Estoque do Herbolário.
- Todas as buscas agora seguem o mesmo padrão da Forja: começam vazias (inclusive PDE e materiais, deixando só o Artesão ligado), só abrem a lista quando você digita, limpam ao apagar o texto e têm o botão *Como funciona a pesquisa?* logo ao lado.
- Entraram o comparador de até 3 materiais lado a lado na Forja, o botão *Copiar link* (`?s=...`) para mandar a receita pronta no chat e melhorias na Lista da sessão (quantidade `−` / `+` e marcar itens já fabricados).
- Separei o código em `src/` com `build.py` para gerar o `index.html` único sem dependências, adicionei testes de fórmula em `tests/calc.test.js` e atualizei o cache offline (`sw.js`) para `forjador-v4`.

### v3
- As moedas de ouro (`po`), prata (`pp`) e cobre (`pc`) agora têm cores e selos próprios no resultado principal, para bater o olho e separar o ouro dos trocados.
- Cada tier (`D` a `S`) ganhou uma etiqueta colorida nas vantagens e um friso da mesma cor no campo do material escolhido. Quando a Excalibur está ligada, aparece também um selo roxo de Artefato no resultado.
- Entraram um ícone de bigorna no topo (que acende junto com o Modo forja), fio duplo de livro-caixa nos totais do recibo e da lista, barra em cor de brasa com a porcentagem economizada no comparativo e relevo nos botões e interruptores.
- Os botões de seleção (*Arma / Armadura / Munição / Pólvora*, *Peso* e *Finalidade*) agora têm uma pílula que desliza de uma opção para outra no clique, mas muda na hora quando você usa as setas do teclado.
- As gavetas de Modificações e de Itens Mágicos abrem e fecham deslizando (`220ms` para abrir, `165ms` para fechar), as linhas saem suavemente quando você apaga um material ou item da lista e os botões de copiar e adicionar mostram um `✓` de confirmação.
- No celular, a barra do topo cabe sempre numa linha só, o menu de busca de materiais e equipamentos foi ajustado para não ficar atrás do teclado virtual, a barra fixa de custo ganhou fundo translúcido e o aviso de *Desfazer* também pausa quando você encosta nele.

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
