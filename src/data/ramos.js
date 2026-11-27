  // Ramos de Herbalismo (p. 148). O Cozinheiro usa este mesmo arquivo; não mude o formato.
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
