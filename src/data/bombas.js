  // Cargas de Pólvora para Bombas (p. 217 + preços p. 160)
  var POLVORAS_BOMBA_DB = [
    { id: 'negra', categoria: 'Básica e Utilitária', nome: 'Pólvora Negra (padrão)', preco: 5, efeito: 'Pólvora padrão já inclusa no preço base da bomba.' },
    { id: 'elukiana', categoria: 'Básica e Utilitária', nome: 'Pólvora Elukiana', preco: 15, efeito: 'O pavio queima mesmo submerso e a bomba explode debaixo d’água.' },
    { id: 'silente', categoria: 'Básica e Utilitária', nome: 'Pólvora Silente', preco: 15, efeito: 'O pavio não faz som enquanto queima.' },
    { id: 'fumegante', categoria: 'Básica e Utilitária', nome: 'Pólvora Fumegante', preco: 20, efeito: 'Cria o efeito da Bomba de Fumaça no local (ou dobra a duração se já for de Fumaça; na Bombinha de Fumaça estende +2 rodadas).' },
    { id: 'luz', categoria: 'Básica e Utilitária', nome: 'Pólvora de Luz', preco: 75, efeito: 'Cria o efeito da Bomba de Clarão na área (ou dobra a duração se já for de Clarão).' },
    { id: 'poderosa', categoria: 'Potência e Dano', nome: 'Pólvora Poderosa (Potente)', preco: 30, efeito: 'Dobra o raio da explosão e a área de efeito da bomba.' },
    { id: 'refinada', categoria: 'Potência e Dano', nome: 'Pólvora Refinada', preco: 50, efeito: 'Causa dano extra igual ao seu nível de personagem (mesmo tipo da bomba, ou fogo se não causar dano).' },
    { id: 'vermelha', categoria: 'Elemental', nome: 'Pólvora Vermelha', preco: 100, efeito: 'Muda o dano da bomba para Fogo (ou soma seu bônus de proficiência se já causar Fogo).' },
    { id: 'azul', categoria: 'Elemental', nome: 'Pólvora Azul', preco: 100, efeito: 'Muda o dano da bomba para Frio (ou soma seu bônus de proficiência se já causar Frio).' },
    { id: 'amarela', categoria: 'Elemental', nome: 'Pólvora Amarela', preco: 100, efeito: 'Muda o dano da bomba para Eletricidade (ou soma seu bônus de proficiência se já causar Eletricidade).' },
    { id: 'verde', categoria: 'Elemental', nome: 'Pólvora Verde', preco: 100, efeito: 'Muda o dano da bomba para Ácido (ou soma seu bônus de proficiência se já causar Ácido).' }
  ];

  // 16 Bombas do Guia (p. 217–220)
  var BOMBAS_DB = [
    {
      id: 'estilhaco', categoria: 'Dano Direto', nome: 'Bomba de Estilhaço', preco: 50, cargas: 1, cd: 12, raio: '4,5 m', tr: 'Destreza',
      receita: '1 carga de pólvora, recipiente, vidro e pregos ou semelhantes.',
      efeito: 'Explosão de estilhaços de vidro e pregos: 4d6 de dano perfurante em falha, ou metade em sucesso.',
      bombinha: 'Causa dano perfurante igual ao seu bônus de proficiência em uma área de 1,5 m ao redor do ponto atingido.'
    },
    {
      id: 'polvora', categoria: 'Dano Direto', nome: 'Bomba de Pólvora', preco: 50, cargas: 2, cd: 12, raio: '4,5 m', tr: 'Destreza',
      receita: '2 cargas de pólvora, recipiente.',
      efeito: 'Explosão incendiária: 4d6 de dano de fogo em falha, ou metade em sucesso.',
      bombinha: 'Usa só 1 carga de pólvora. Causa dano de fogo (ou do tipo da pólvora usada) igual ao seu bônus de proficiência em 1,5 m.'
    },
    {
      id: 'acida', categoria: 'Dano Direto', nome: 'Bomba Ácida', preco: 50, cargas: 1, cd: 15, raio: '6 m', tr: 'Destreza',
      receita: '1 carga de pólvora, recipiente e 1 frasco de ácido.',
      efeito: 'Spray corrosivo letal: 4d6 de dano de ácido em falha, ou metade em sucesso.',
      bombinha: 'Afeta apenas uma criatura: 2d6 de dano de ácido em falha, ou metade em sucesso.'
    },
    {
      id: 'oleo', categoria: 'Dano Direto', nome: 'Bomba de Óleo', preco: 50, cargas: 1, cd: 12, raio: '4,5 m', tr: 'Nenhum',
      receita: '1 carga de pólvora, recipiente e óleo.',
      efeito: 'Terreno difícil em chamas (1 min): criaturas na área ficam Queimando (1d10 de dano de fogo por turno até apagar com uma ação).',
      bombinha: 'Afeta apenas uma criatura: 1d4 de dano de fogo e condição Queimando até apagar.'
    },
    {
      id: 'santa_granada', categoria: 'Dano Direto', nome: 'A Santa Granada de Mão', preco: 150, cargas: 1, cd: 18, raio: '7,5 m', tr: 'Sabedoria',
      receita: '1 carga de pólvora, recipiente, pó de prata, 1 ramo Branco e um Símbolo Sagrado.',
      ramos: [{ id: 'branco', qtd: 1 }],
      efeito: 'Explosão radiante: 7d4 de dano radiante (metade em sucesso). Corruptores e Mortos-vivos têm desvantagem no TR e vulnerabilidade ao dano; Celestiais são imunes.',
      bombinha: 'Afeta apenas uma criatura: 2d4 de dano radiante em falha (desvantagem e vulnerabilidade contra Corruptores e Mortos-vivos).'
    },
    {
      id: 'corrosao', categoria: 'Dano Direto', nome: 'Bomba de Corrosão', preco: 100, cargas: 1, cd: 15, raio: '1,5 m', tr: 'Destreza',
      receita: '1 carga de pólvora, recipiente e lodo de Limo Cinzento.',
      efeito: 'Equipamentos não mágicos de metal na área sofrem −1 cumulativo (quebra em −5, p. 169). Criaturas de metal sofrem 4d6 de dano de ácido (metade em sucesso).',
      bombinha: 'Afeta apenas um objeto de metal não mágico, aplicando penalidade de −1.'
    },
    {
      id: 'empurrao', categoria: 'Controle e Área', nome: 'Bomba de Empurrão', preco: 50, cargas: 2, cd: 12, raio: '3 m', tr: 'Força',
      receita: '2 cargas de pólvora e recipiente.',
      efeito: 'Explosão concussiva: 2d6 de dano de concussão e empurra 4,5 m para trás em falha (nada em sucesso).',
      bombinha: 'Afeta apenas uma criatura: 1d4 de dano de concussão e empurra 1,5 m para trás em falha.'
    },
    {
      id: 'grudenta', categoria: 'Controle e Área', nome: 'Bomba Grudenta', preco: 50, cargas: 1, cd: 12, raio: '6 m', tr: 'Força',
      receita: '1 carga de pólvora, recipiente, resina e 1 ramo Verde.',
      ramos: [{ id: 'verde', qtd: 1 }],
      efeito: 'Líquido viscoso: criaturas na área ficam Impedidas (escapa com Atletismo no início do turno) e a área vira terreno difícil permanente.',
      bombinha: 'Afeta apenas uma criatura (Impedida até o fim do próximo turno), sem criar terreno difícil.'
    },
    {
      id: 'atordoante', categoria: 'Controle e Área', nome: 'Bomba Atordoante', preco: 100, cargas: 1, cd: 15, raio: '1,5 m', tr: 'Constituição',
      receita: '1 carga de pólvora, recipiente, pó de Quartzo de Inércia (p. 191), 1 ramo Azul + 1 ramo Vermelho.',
      ramos: [{ id: 'azul', qtd: 1 }, { id: 'vermelho', qtd: 1 }],
      efeito: 'Onda concussiva: criaturas na área ficam Atordoadas até o início do próximo turno delas em falha.',
      bombinha: 'Afeta apenas uma criatura: fica Atordoada até o início do próximo turno dela em falha.'
    },
    {
      id: 'confusao', categoria: 'Controle e Área', nome: 'Bomba de Confusão', preco: 100, cargas: 1, cd: 15, raio: '6 m', tr: 'Sabedoria',
      receita: '1 carga de pólvora, recipiente, 2 ramos Vermelhos + 1 ramo Preto.',
      ramos: [{ id: 'vermelho', qtd: 2 }, { id: 'preto', qtd: 1 }],
      efeito: 'Gás alucinógeno: sem reações e rola 1d10 no início de cada turno (1: anda aleatório; 2–6: não age; 7–8: ataca criatura aleatória; 9–10: age normal). Repete TR SAB no fim do turno.',
      bombinha: 'Afeta apenas uma criatura com o mesmo efeito de confusão (d10 por turno e TR no final).'
    },
    {
      id: 'riso', categoria: 'Controle e Área', nome: 'Bomba de Riso', preco: 75, cargas: 1, cd: 12, raio: '4,5 m', tr: 'Constituição',
      receita: '1 carga de pólvora, recipiente, 1 ramo Vermelho + 3 ramos Amarelos.',
      ramos: [{ id: 'vermelho', qtd: 1 }, { id: 'amarelo', qtd: 3 }],
      efeito: 'Gás transparente (1 min): criaturas em falha têm desvantagem em testes e ataques (repete TR no fim do turno; se passar, fica imune a esta bomba).',
      bombinha: 'Afeta apenas uma criatura: desvantagem em testes e ataques até o final do próximo turno em falha.'
    },
    {
      id: 'sono', categoria: 'Controle e Área', nome: 'Bomba de Sono', preco: 50, cargas: 1, cd: 15, raio: '9 m', tr: 'Constituição',
      receita: '1 carga de pólvora, recipiente, 1 ramo Azul.',
      ramos: [{ id: 'azul', qtd: 1 }],
      efeito: 'Gás sonífero (3 rodadas): criaturas caem Inconscientes em falha (acordam ao sofrer dano ou passar no TR). Não funciona em combate ou adrenalina.',
      bombinha: 'Afeta apenas uma criatura: cai Inconsciente até o início do próximo turno (acorda se sofrer dano).'
    },
    {
      id: 'fumaca', categoria: 'Táticas e Gás', nome: 'Bomba de Fumaça', preco: 20, cargas: 1, cd: 10, raio: '3 m', tr: 'Nenhum',
      receita: '1 carga de pólvora, recipiente, carvão e 5 ramos Roxo ou 1 ramo Preto.',
      ramos: [{ id: 'roxo', qtd: 5, alt: 'ou 1 Preto' }],
      efeito: 'Cria esfera de fumaça densa (3 m de raio) que bloqueia visão por 3 rodadas ou até vento moderado (15 km/h).',
      bombinha: 'Esfera de fumaça de 1,5 m que dura 1 rodada. Pólvora Fumegante estende em +2 rodadas.'
    },
    {
      id: 'clarao', categoria: 'Táticas e Gás', nome: 'Bomba de Clarão', preco: 50, cargas: 1, cd: 15, raio: '18 m', tr: 'Constituição',
      receita: '1 carga de pólvora, recipiente, pó de metal e salitre (ou pó de Pedra Cegante, p. 187).',
      efeito: 'Clarão luminoso: criaturas a até 18 m que puderem ver ficam Cegas até o final da próxima rodada em falha.',
      bombinha: 'Afeta apenas uma criatura (o alvo atingido).'
    },
    {
      id: 'veneno', categoria: 'Táticas e Gás', nome: 'Bomba de Veneno', preco: 100, cargas: 1, cd: 15, raio: '4,5 m', tr: 'Constituição',
      receita: '1 carga de pólvora, recipiente, 1 ramo Azul + 1 ramo Roxo + 1 ramo Amarelo.',
      ramos: [{ id: 'azul', qtd: 1 }, { id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }],
      efeito: 'Nuvem venenosa (1 min, obstrui visão): 2d6 de dano de veneno e Envenenado. Repete o TR todo turno (+1d6 veneno por falha) até passar.',
      bombinha: 'Causa 1d6 de dano de veneno extra em área de 1,5 m, sem envenenamento prolongado.'
    },
    {
      id: 'fedorenta', categoria: 'Táticas e Gás', nome: 'Bomba Fedorenta', preco: 50, cargas: 1, cd: 12, raio: '6 m', tr: 'CON (Bestas/Monstr.)',
      receita: '1 carga de pólvora, recipiente, 2 ramos Laranja + 1 ramo Roxo e enxofre (ou substância fedorenta).',
      ramos: [{ id: 'laranja', qtd: 2 }, { id: 'roxo', qtd: 1 }],
      efeito: 'Gás fétido (1 min): desvantagem em ataques/testes na área e cheiro impregna por 10 min (vantagem para rastrear por olfato). Bestas e Monstruosidades fazem TR CON ou ficam Amedrontadas (1 min).',
      bombinha: 'Afeta apenas uma criatura (impregnada por 10 min, sem nuvem). Efeito contra Bestas e Monstruosidades funciona normalmente.'
    }
  ];
