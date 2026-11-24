  // Ramos de Herbalismo (p. 148)
  var RAMOS_DB = [
    { id: 'amarelo', nome: 'Amarelo', min: 1, max: 4, preco: 5, desc: 'Revitalizante; alivia fadiga, melhora o humor e tem ação anti-inflamatória.' },
    { id: 'verde', nome: 'Verde', min: 5, max: 8, preco: 5, desc: 'Equilibrante; acalma a mente, melhora o sono e tem ação antioxidante.' },
    { id: 'laranja', nome: 'Laranja', min: 9, max: 11, preco: 5, desc: 'Calmante; reduz ansiedade e estresse, e melhora a digestão.' },
    { id: 'roxo', nome: 'Roxo', min: 12, max: 14, preco: 5, desc: 'Purificante; desintoxica o corpo, melhora função cerebral e é anti-inflamatório.' },
    { id: 'vermelho', nome: 'Vermelho', min: 15, max: 16, preco: 50, desc: 'Estimulante e energizante; melhora a concentração e aumenta a circulação.' },
    { id: 'azul', nome: 'Azul', min: 17, max: 18, preco: 50, desc: 'Relaxante; alivia tensão muscular e promove paz e tranquilidade.' },
    { id: 'branco', nome: 'Branco', min: 19, max: 19, preco: 150, desc: 'Purificante raro; clareza mental, paz interior e ação anti-inflamatória.' },
    { id: 'preto', nome: 'Preto', min: 20, max: 20, preco: 150, desc: 'Fortalecedor raro; aumenta resistência física e mental e tem ação analgésica.' }
  ];
  var RAMOS_MAP = {};
  RAMOS_DB.forEach(function (r) { RAMOS_MAP[r.id] = r; });


  // 23 Receitas de Herbalismo (p. 149–150) — 1h por item
  var HERBAL_DB = [
    {
      id: 'oleo_linhaca', categoria: 'Manutenção e Utilidades', nome: 'Óleo de Linhaça Fervido', preco: 1, rende: '1d10 usos', destaque: 'Forjador',
      ramos: [{ id: 'laranja', qtd: 1 }], extraText: '+ fonte de calor', extraCusto: 0,
      efeito: 'Protege equipamentos contra umidade e oxidação por 1 semana inteira e ignora a 1ª tentativa de quebra por outra criatura (exceto críticos).'
    },
    {
      id: 'cura_menor', categoria: 'Poções e Cura', nome: 'Poção Não Mágica de Cura Menor', preco: 50, rende: '1 poção',
      ramos: [{ id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }, { id: 'laranja', qtd: 1 }, { id: 'verde', qtd: 1 }],
      efeito: 'Ao beber ou administrar em outra criatura, recupera 2d4 + 2 pontos de vida.'
    },
    {
      id: 'cura_maior', categoria: 'Poções e Cura', nome: 'Poção Não Mágica de Cura Maior', preco: 250, rende: '1 poção',
      ramos: [{ id: 'vermelho', qtd: 1 }, { id: 'azul', qtd: 1 }], extraText: '+ 1 Poção de Cura Menor (50 po)', extraCusto: 50,
      efeito: 'Ao beber ou administrar em outra criatura, recupera 4d4 + 4 pontos de vida.'
    },
    {
      id: 'antitoxina', categoria: 'Poções e Cura', nome: 'Antitoxina', preco: 50, rende: '1 frasco',
      ramos: [{ id: 'laranja', qtd: 2 }, { id: 'verde', qtd: 2 }],
      efeito: 'Concede vantagem em testes de resistência contra veneno por 1 hora.'
    },
    {
      id: 'escalar', categoria: 'Poções e Cura', nome: 'Poção de Escalar', preco: 75, rende: '1 poção',
      ramos: [{ id: 'vermelho', qtd: 1 }],
      efeito: 'Deslocamento de escalada igual ao de caminhada por 1 hora, com vantagem em testes de Força (Atletismo) para escalar.'
    },
    {
      id: 'pomada_revit', categoria: 'Poções e Cura', nome: 'Pomada Revitalizante', preco: 5, rende: '1 pote',
      ramos: [{ id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }, { id: 'verde', qtd: 1 }, { id: 'laranja', qtd: 1 }],
      efeito: 'Aplicada em uma criatura durante um descanso curto, ela recupera 1d10 pontos de vida.'
    },
    {
      id: 'tonico_refrescante', categoria: 'Tônicos e Sobrevivência', nome: 'Tônico Refrescante', preco: 30, rende: '1 frasco',
      ramos: [{ id: 'azul', qtd: 1 }, { id: 'roxo', qtd: 2 }],
      efeito: 'Alívio contra calor extremo: vantagem em testes de resistência contra exaustão por calor por 24 horas.'
    },
    {
      id: 'tonico_aquecimento', categoria: 'Tônicos e Sobrevivência', nome: 'Tônico do Aquecimento', preco: 30, rende: '1 frasco',
      ramos: [{ id: 'vermelho', qtd: 1 }, { id: 'amarelo', qtd: 2 }],
      efeito: 'Proteção contra frio extremo: vantagem em testes de resistência contra exaustão por frio por 24 horas.'
    },
    {
      id: 'racao_vegetal', categoria: 'Tônicos e Sobrevivência', nome: 'Ração de Viagem Vegetal', preco: 0.5, rende: '1 dia',
      ramos: [{ id: 'qualquer', qtd: 3, label: '3 ramos de cores diferentes', precoUnit: 5 }],
      efeito: 'Alimentos desidratados (frutas secas, bolachas, nozes) sem carne. Alimenta por 1 dia.'
    },
    {
      id: 'conservante', categoria: 'Tônicos e Sobrevivência', nome: 'Conservante Alimentar', preco: 5, rende: 'até 5 kg de comida',
      ramos: [{ id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }],
      efeito: 'Adiciona 3 dias extras antes que até 5 kg de comida estrague (efeito não cumulativo).'
    },
    {
      id: 'repelente', categoria: 'Tônicos e Sobrevivência', nome: 'Repelente', preco: 5, rende: '1 pote',
      ramos: [{ id: 'laranja', qtd: 1 }, { id: 'verde', qtd: 1 }],
      efeito: 'Creme que impede qualquer inseto menor que você de se aproximar por 8 horas.'
    },
    {
      id: 'veneno_5e', categoria: 'Venenos', nome: 'Veneno Básico (D&D 5e)', preco: 50, rende: '1 vidro (1 arma ou 3 munições)',
      ramos: [{ id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }, { id: 'laranja', qtd: 1 }, { id: 'verde', qtd: 1 }],
      efeito: 'Reveste 1 arma cortante/perfurante ou até 3 munições por 1 min: alvo faz TR CON CD 10 ou sofre 1d4 de dano de veneno.'
    },
    {
      id: 'veneno_2024', categoria: 'Venenos', nome: 'Veneno Básico (D&D 2024)', preco: 100, rende: '1 vidro (1 arma ou 3 munições)',
      ramos: [{ id: 'azul', qtd: 1 }, { id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }],
      efeito: 'Reveste 1 arma cortante/perfurante ou até 3 munições por 1 min: alvo atingido sofre 1d4 de dano de veneno (sem TR).'
    },
    {
      id: 'cola_vegetal', categoria: 'Manutenção e Utilidades', nome: 'Cola Vegetal', preco: 10, rende: '5 usos',
      ramos: [{ id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }],
      efeito: 'Cada uso cola dois objetos Pequenos ou menores; removível com 1 min de esforço ou água quente.'
    },
    {
      id: 'corda_canhamo', categoria: 'Manutenção e Utilidades', nome: 'Corda de Cânhamo', preco: 0.1, rende: '5 metros',
      ramos: [{ id: 'verde', qtd: 2 }],
      efeito: 'Produz 5 metros de corda de cânhamo (item não consumível).'
    },
    {
      id: 'oleo_vegetal', categoria: 'Manutenção e Utilidades', nome: 'Óleo Vegetal', preco: 0.1, rende: '1 pote',
      ramos: [{ id: 'amarelo', qtd: 1 }, { id: 'laranja', qtd: 1 }],
      efeito: 'Pote de óleo que funciona da mesma forma que o óleo comum do Livro do Jogador.'
    },
    {
      id: 'sabonete', categoria: 'Manutenção e Utilidades', nome: 'Sabonete', preco: 0.1, rende: '1 barra',
      ramos: [{ id: 'roxo', qtd: 1 }, { id: 'verde', qtd: 1 }],
      efeito: 'Com 10 min de uso num descanso curto, remove sujeira, odores fortes e manchas não mágicas.'
    },
    {
      id: 'desodorante', categoria: 'Manutenção e Utilidades', nome: 'Desodorante', preco: 5, rende: '1 pote',
      ramos: [{ id: 'roxo', qtd: 1 }, { id: 'amarelo', qtd: 1 }],
      efeito: 'Pasta que neutraliza odores corporais por até 24 horas, útil para discrição.'
    },
    {
      id: 'kit_disfarce', categoria: 'Disfarce, Tintas e Social', nome: 'Kit de Disfarce Herbal', preco: 25, rende: '1 kit',
      ramos: [{ id: 'qualquer', qtd: 4, label: '4 ramos de cores diferentes', precoUnit: 5 }],
      efeito: 'Kit com pigmentos, maquiagem, cola vegetal e perfume neutralizante. Funciona como Kit de Disfarce comum.'
    },
    {
      id: 'tinta_invisivel', categoria: 'Disfarce, Tintas e Social', nome: 'Tinta Invisível', preco: 25, rende: '50 ml',
      ramos: [{ id: 'verde', qtd: 1 }, { id: 'amarelo', qtd: 1 }],
      efeito: 'Fica invisível após secar; reaparece com chama suave ou solução reveladora.'
    },
    {
      id: 'tinta_herbal', categoria: 'Disfarce, Tintas e Social', nome: 'Tinta Herbal', preco: 5, rende: '150 ml',
      ramos: [{ id: 'qualquer', qtd: 2, label: '2 ramos da mesma cor', precoUnit: 5 }],
      efeito: 'Produz 150 ml de tinta durável na cor dos ramos utilizados.'
    },
    {
      id: 'giz_herbal', categoria: 'Disfarce, Tintas e Social', nome: 'Giz Colorido Herbal', preco: 5, rende: '10 pedaços',
      ramos: [{ id: 'qualquer', qtd: 1, label: '1 ramo de qualquer cor', precoUnit: 5 }],
      efeito: '10 pedaços de giz na cor do ramo; marcas duram 24h em pedra, madeira e superfícies similares.'
    },
    {
      id: 'perfume_herbal', categoria: 'Disfarce, Tintas e Social', nome: 'Perfume Herbal', preco: 5, rende: '240 ml',
      ramos: [{ id: 'laranja', qtd: 1 }],
      efeito: 'Por 1 hora, concede vantagem em Carisma (Persuasão) ao Influenciar Humanoide Indiferente a até 1,5 m.'
    }
  ];
