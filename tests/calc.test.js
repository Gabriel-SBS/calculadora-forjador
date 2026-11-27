'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = path.join(__dirname, '..', 'src');
const ARQUIVOS = [
  'data/forja.js',
  'data/bombas.js',
  'data/ramos.js',
  'data/herbalismo.js',
  'core/util.js',
  'regras/estado.js',
  'regras/forja.js',
  'regras/bombas.js',
  'regras/herbalismo.js',
];

// btoa/atob são da web e não existem num contexto vm vazio
const app = { btoa, atob };
vm.createContext(app);
for (const f of ARQUIVOS) {
  vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), app, { filename: f });
}

function approx(actual, expected, eps = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= eps, `Esperado ${expected}, obtido ${actual}`);
}

function estado(mudancas = {}) {
  return Object.assign(app.estadoPadrao(), mudancas);
}

function linhaMaterial(id) {
  const m = app.materialById(id);
  assert.ok(m, `Material ${id} não existe`);
  return { materialId: m.id, name: m.nome, mult: m.mult, tier: m.tier };
}

const ACO = linhaMaterial('metal_aco');
const MITHRAL = linhaMaterial('metal_mithral');
const REMOCAO_MAESTRIA = app.MODS_DB.findIndex((m) => /Remoção de Maestria \(−30/.test(m[0]));
const ESTRUTURA_LEVE = app.MODS_DB.findIndex((m) => m[0] === 'Estrutura Leve');

// Catálogos

test('Catálogos têm as quantidades exatas do Guia de Xyleff Sualky', () => {
  assert.equal(app.MATERIALS_DB.length, 69);
  assert.equal(app.BOMBAS_DB.length, 16);
  assert.equal(app.POLVORAS_BOMBA_DB.length, 11);
  assert.equal(app.HERBAL_DB.length, 23);
  assert.equal(app.RAMOS_DB.length, 8);
  assert.equal(app.MUNICAO_MODS.length, 8);
  assert.equal(app.MODS_DB.length, 26);
});

test('IDs únicos em todos os catálogos e ramos referenciados existem', () => {
  for (const [nome, lista] of [
    ['MATERIALS_DB', app.MATERIALS_DB],
    ['BOMBAS_DB', app.BOMBAS_DB],
    ['POLVORAS_BOMBA_DB', app.POLVORAS_BOMBA_DB],
    ['HERBAL_DB', app.HERBAL_DB],
    ['RAMOS_DB', app.RAMOS_DB],
  ]) {
    const ids = lista.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `IDs duplicados em ${nome}`);
  }
  const ramosValidos = new Set(app.RAMOS_DB.map((r) => r.id));
  ramosValidos.add('qualquer');
  for (const item of [...app.BOMBAS_DB, ...app.HERBAL_DB]) {
    for (const rm of item.ramos || []) {
      assert.ok(ramosValidos.has(rm.id), `Ramo inválido ${rm.id} em ${item.id}`);
    }
  }
});

test('Pesos em kg do Guia e materiais que mudam o peso', () => {
  const peso = (n) => app.equipByNome(n).pesoKg;
  assert.equal(peso('Adaga'), 0.5);
  assert.equal(peso('Espada Longa'), 2);
  assert.equal(peso('Placas'), 32);
  assert.equal(peso('Escudo de duas mãos'), 20);
  assert.equal(peso('Agulha'), null);
  assert.equal(app.materialById('metal_mithral').pesoMult, 0.5);
  assert.equal(app.materialById('metal_ouro').pesoMult, 2);
  assert.equal(app.materialById('veg_iron_wood').forcaPesado, true);
  assert.equal(app.MATERIALS_DB.filter((m) => m.materialVivo).length, 7);
});

// Utilitários

test('Moedas: arredonda no pc e não usa electro nem platina', () => {
  assert.equal(app.fmtMoeda(0.05), '5 pc');
  assert.equal(app.fmtMoeda(9.6), '9 po 6 pp');
  assert.equal(app.fmtMoeda(1500), '1.500 po');
  assert.equal(app.fmtMoeda(0), '0 po');
  assert.equal(app.fmtMoeda(-2.5), '−2 po 5 pp');
});

test('Busca ignora acento e acha por categoria e tier', () => {
  assert.ok(app.searchMaterials('aco').some((m) => m.id === 'metal_aco'));
  assert.ok(app.searchMaterials('tier s').every((m) => m.tier === 'S'));
  assert.ok(app.searchEquip('espada longa').some((e) => e.nome === 'Espada Longa'));
  assert.ok(app.searchEquip('flecha').length === 0, 'Munição fica na oficina de Bombas');
});

test('Links: ida e volta, links antigos valem e link de outro app é recusado', () => {
  const obj = { app: app.APP_ID, v: 1, pde: '50', nome: 'Aço' };
  // Objetos do vm têm outro protótipo; compara pelo conteúdo
  assert.equal(JSON.stringify(app.decodeJsonB64(app.encodeJsonB64(obj))), JSON.stringify(obj));
  assert.equal(app.decodeJsonB64('%%%lixo'), null);
  assert.equal(app.linkDesteApp({ pde: '50' }), true);
  assert.equal(app.linkDesteApp({ app: 'forjador' }), true);
  assert.equal(app.linkDesteApp({ app: 'cozinheiro' }), false);
  assert.equal(app.linkDesteApp(null), false);
});

// Forja

test('Forja: Espada Longa (PDE 50) de Aço, Artesão duplo e simples', () => {
  const duplo = app.forjaCalc(estado({ pde: '50', materials: [ACO] }));
  approx(duplo.cheio, 1500);
  approx(duplo.final, 480);
  const simples = app.forjaCalc(estado({ pde: '50', materials: [ACO], artesaoModo: 'simples' }));
  approx(simples.final, 600);
  const semArtesao = app.forjaCalc(estado({ pde: '50', materials: [ACO], artesao: false }));
  approx(semArtesao.final, 750);
});

test('Forja: tempo do Tier B, peso do item e Excalibur', () => {
  const t = app.forjaTempo(estado({ materials: [ACO] }));
  approx(t.baseHoras, 48);
  approx(t.forjadorHoras, 32);
  approx(t.comumHoras, 48);
  approx(app.forjaTempo(estado({ materials: [ACO], peso: 'leve' })).baseHoras, 40);
  approx(app.forjaTempo(estado({ materials: [ACO], peso: 'pesado' })).baseHoras, 56);
  approx(app.forjaTempo(estado({ materials: [ACO], ajudante: true })).horasEfetivas, 16);
  assert.equal(app.forjaTempo(estado()).semTempo, 'sem-tier');

  // Excalibur: até 6 materiais e o tempo de um único Tier S
  const exc = estado({ excalibur: true, materials: [ACO, MITHRAL] });
  assert.equal(app.forjaMaxMateriais(exc), 6);
  approx(app.forjaTempo(exc).baseHoras, 192);
  assert.equal(app.forjaMaxMateriais(estado()), 4);
});

test('Forja: Criações Automáticas só cortam o tempo de material raro (Tier A ou S)', () => {
  const aco = app.forjaTempo(estado({ materials: [ACO], criacoesAutomaticas: true }));
  assert.equal(aco.usaAuto, false);
  approx(aco.forjadorHoras, 32);
  const mithral = app.forjaTempo(estado({ materials: [MITHRAL], criacoesAutomaticas: true }));
  assert.equal(mithral.usaAuto, true);
  approx(mithral.forjadorHoras, 96 * 2 / 3 / 2);
});

test('Forja: fração fixa em armadura (Placas PDE 750, Aço, 20% sensível)', () => {
  const c = app.forjaCalc(estado({
    pde: '750', materials: [ACO], tipoItem: 'armadura', fracaoFixa: true, artesaoModo: 'simples',
  }));
  approx(c.cheio, 5100);
  approx(c.final, 2040);
});

test('Forja: venda, conserto e conserto de material vivo', () => {
  approx(app.forjaCalc(estado({ pde: '50', materials: [ACO], modo: 'vendido', lucro: 30 })).final, 624);
  approx(app.forjaCalc(estado({ pde: '50', materials: [ACO], modo: 'conserto' })).final, 240);
  const vivo = app.forjaCalc(estado({ pde: '50', materials: [linhaMaterial('metal_elementium')], modo: 'conserto' }));
  assert.equal(vivo.consertoVivo, true);
  assert.equal(vivo.final, 0);
});

test('Forja: PDE negativo vale zero e PDE abaixo de 1 po não vira 1 po', () => {
  assert.equal(app.forjaCalc(estado({ pde: '-50', materials: [ACO] })).final, 0);
  approx(app.forjaBase(estado({ pde: '0.1' })).valor, 0.1);
  approx(app.forjaCalc(estado({ pde: '0.1', materials: [ACO] })).final, 0.96);
});

test('Forja: Remoção de Maestria tem piso de 1 po (p. 163)', () => {
  assert.ok(REMOCAO_MAESTRIA >= 0);
  approx(app.forjaBase(estado({ pde: '20', mods: [REMOCAO_MAESTRIA] })).valor, 1);
  approx(app.forjaBase(estado({ pde: '50', mods: [REMOCAO_MAESTRIA] })).valor, 20);
});

test('Forja: Obra-Prima e O Melhor dos Melhores dão +1 e não somam; Pressa tira 1', () => {
  const base = { materials: [ACO] };
  assert.equal(app.forjaItemProps(estado(base)).mod, 1);
  assert.equal(app.forjaItemProps(estado({ ...base, obraPrima: true })).mod, 2);
  assert.equal(app.forjaItemProps(estado({ ...base, obraPrima: true, melhorDosMelhores: true })).mod, 2);
  assert.equal(app.forjaItemProps(estado({ ...base, obraPrima: true, pressa: true })).mod, 1);
  approx(app.forjaTempo(estado({ ...base, pressa: true })).forjadorHoras, 16);
});

test('Forja: peso final com Mithral e Estrutura Leve', () => {
  const w = app.forjaPeso(estado({ equipNome: 'Placas', materials: [MITHRAL], mods: [ESTRUTURA_LEVE] }));
  approx(w.finalKg, 12);
  assert.equal(app.forjaPeso(estado({ materials: [ACO] })), null);
});

test('Comparador de materiais dá o mesmo resultado que o painel para um material', () => {
  for (const mat of [ACO, MITHRAL]) {
    for (const extra of [{}, { obraPrima: true, melhorDosMelhores: true }, { criacoesAutomaticas: true }, { modo: 'vendido' }]) {
      const s = estado({ pde: '50', equipNome: 'Espada Longa', materials: [mat], ...extra });
      const painel = app.forjaCalc(s);
      const comp = app.forjaMaterialUnico(s, app.materialById(mat.materialId));
      approx(comp.final, painel.final);
      approx(comp.horas, app.forjaTempo(s).horasEfetivas);
      assert.equal(comp.modNum, app.forjaItemProps(s).mod);
    }
  }
});

// Bombas, munições e pólvoras

test('Bombas: Bomba de Pólvora com Artesão duplo e Forjador sai a 16 po', () => {
  const c = app.bombaCalc(estado({ bombaId: 'polvora' }));
  approx(c.final, 16);
  assert.equal(app.bombaCalc(estado()), null);
});

test('Bombas: carga especial custa a diferença por carga; bombinha não troca carga', () => {
  const poderosa = app.polvoraBombaById('poderosa');
  const c = app.bombaCalc(estado({ bombaId: 'empurrao', bombaPolvora: 'poderosa' }));
  approx(c.extraPolvoraUnit, (poderosa.preco - 5) * 2);
  const bombinha = app.bombaCalc(estado({ bombaId: 'empurrao', bombaPolvora: 'poderosa', bombaFormato: 'bombinha' }));
  assert.equal(bombinha.polvoraBloqueada, true);
  assert.equal(bombinha.extraPolvoraUnit, 0);
});

test('Bombas: CD de detonação = 8 + DES, + BP com Mestre das Bombas', () => {
  assert.equal(app.bombaCalc(estado({ bombaId: 'polvora', bombaDes: 3 })).cdDetonacao, 11);
  assert.equal(app.bombaCalc(estado({ bombaId: 'polvora', bombaDes: 3, bombaBp: 4, bombaMestre: true })).cdDetonacao, 15);
});

test('Munições: lote de 4 unidades × material (p. 171)', () => {
  const ferro = app.materialById('metal_ferro');
  const c = app.municaoCalc(estado({ bmMunPde: '0.05', bmMunMatId: 'metal_ferro' }));
  approx(c.cheioBase, 0.2 * ferro.mult);
  approx(c.final, 0.2 * ferro.mult * 0.64 / 2);
});

test('Pólvora: lote custa 2 unidades e leva 8h base (Forjador: 2/3)', () => {
  const c = app.polvoraCalc(estado({ bmPolvId: 'negra' }));
  approx(c.cheioTotal, 10);
  approx(c.horas, 16 / 3);
});

// Herbalismo

test('Herbalismo: Cura Menor comprando ramos com Artesão sai a 16 po', () => {
  const c = app.herbalCalc(estado({ herbalId: 'cura_menor' }));
  approx(c.custoRamosCheio, 20);
  approx(c.final, 16);
  approx(c.horas, 1);
});

test('Herbalismo: venda com ramos forrageados usa a base de mercado', () => {
  const c = app.herbalCalc(estado({ herbalId: 'oleo_linhaca', herbalOrigem: 'forragear', herbalModo: 'vendido', herbalLucro: 50 }));
  approx(c.final, c.custoRamosCheio * 0.8 * 1.5);
});
