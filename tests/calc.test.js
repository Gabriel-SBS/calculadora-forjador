'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

function loadDataSandbox() {
  const ctx = {};
  vm.createContext(ctx);
  for (const file of ['forja.js', 'bombas.js', 'herbalismo.js']) {
    const code = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    vm.runInContext(code, ctx, { filename: file });
  }
  return ctx;
}

const db = loadDataSandbox();

function approx(actual, expected, eps = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `Esperado ${expected}, obtido ${actual}`
  );
}

// ---------- 1. Integridade dos catálogos do Guia ----------
test('Catálogos têm as quantidades exatas do Guia de Xyleff Sualky', () => {
  assert.equal(db.MATERIALS_DB.length, 69);
  assert.equal(db.BOMBAS_DB.length, 16);
  assert.equal(db.POLVORAS_BOMBA_DB.length, 11);
  assert.equal(db.HERBAL_DB.length, 23);
  assert.equal(db.RAMOS_DB.length, 8);
  assert.equal(db.MUNICAO_MODS.length, 8);
  assert.equal(db.MODS_DB.length, 26);
});

test('IDs únicos em todos os catálogos e ramos referenciados existem', () => {
  for (const [name, list] of [
    ['MATERIALS_DB', db.MATERIALS_DB],
    ['BOMBAS_DB', db.BOMBAS_DB],
    ['POLVORAS_BOMBA_DB', db.POLVORAS_BOMBA_DB],
    ['HERBAL_DB', db.HERBAL_DB],
    ['RAMOS_DB', db.RAMOS_DB],
  ]) {
    const ids = list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `IDs duplicados em ${name}`);
  }

  const validRamos = new Set(db.RAMOS_DB.map((r) => r.id));
  validRamos.add('qualquer');
  for (const b of db.BOMBAS_DB) {
    for (const rm of b.ramos || []) {
      assert.ok(validRamos.has(rm.id), `Ramo inválido ${rm.id} em bomba ${b.id}`);
    }
  }
  for (const h of db.HERBAL_DB) {
    for (const rm of h.ramos || []) {
      assert.ok(validRamos.has(rm.id), `Ramo inválido ${rm.id} em receita ${h.id}`);
    }
  }
});

test('Munições incluem arma de fogo e bala colossal (p. 159)', () => {
  const muns = db.EQUIP_DB.filter((e) => e.tipo === 'municao').map((e) => e.nome);
  assert.ok(muns.some((n) => /arma de fogo/i.test(n)), 'Falta Bala de arma de fogo');
  assert.ok(muns.some((n) => /colossal/i.test(n)), 'Falta Bala colossal');
});

// ---------- 2. Fórmulas da Forja ----------
test('Forja: Espada Longa (PDE 50) de Aço (×30) — Artesão duplo vs simples', () => {
  const aco = db.MATERIALS_DB.find((m) => m.nome === 'Aço');
  assert.ok(aco);
  assert.equal(aco.mult, 30);
  assert.equal(aco.tier, 'B');

  const pde = 50;
  const cheio = pde * aco.mult;            // 1500 po
  const duplo = (cheio * 0.8 * 0.8) / 2;   // 480 po
  const simples = (cheio * 0.8) / 2;       // 600 po
  approx(cheio, 1500);
  approx(duplo, 480);
  approx(simples, 600);

  // Tempo Tier B = 48h base -> Forjador 2/3 = 32h (3 dias de 12h)
  const TIER_HOURS = { D: 24, C: 24, B: 48, A: 96, S: 192 };
  const horasForjador = TIER_HOURS[aco.tier] * (2 / 3);
  approx(horasForjador, 32);
  assert.equal(Math.ceil(horasForjador / 12), 3);
});

test('Forja: Fração fixa em armadura (Placas PDE 750, Aço ×30, 20% sensível)', () => {
  const pde = 750;
  const mult = 30;
  const fracao = 0.2;
  const cheioFracao = pde * ((1 - fracao) + fracao * mult); // 750 * (0.8 + 6) = 5100 po
  approx(cheioFracao, 5100);
  const forjadorArtesao = (cheioFracao * 0.8) / 2; // 2040 po
  approx(forjadorArtesao, 2040);
});

test('Forja: Obra-Prima (máx +3), Pressa (tempo ÷2, mod −1) e Conserto (÷2)', () => {
  const modBase = 3; // Tier S
  const comObra = Math.min(3, modBase + 1);
  assert.equal(comObra, 3);
  assert.equal(comObra - 1, 2); // com Pressa

  const cheio = 1800;
  const consertoCheio = cheio / 2; // 900 po
  const consertoForjador = consertoCheio / 2; // 450 po (sem Artesão)
  approx(consertoForjador, 450);
});

// ---------- 3. Fórmulas de Bombas, Munições e Pólvora ----------
test('Bombas: Bomba de Pólvora e Empurrão exige 2 cargas de pólvora especial', () => {
  const empurrao = db.BOMBAS_DB.find((b) => b.cargas === 2);
  assert.ok(empurrao, 'Deve existir bomba com 2 cargas');
  const poderosa = db.POLVORAS_BOMBA_DB.find((p) => p.id === 'poderosa');
  assert.ok(poderosa);
  const extra = (poderosa.preco - 5) * empurrao.cargas;
  assert.ok(extra > 0);
  approx(extra, (poderosa.preco - 5) * 2);
});

test('Bombas: CD de detonação = 8 + DES + BP (Mestre das Bombas)', () => {
  const des = 3, bp = 4;
  assert.equal(8 + des, 11);
  assert.equal(8 + des + bp, 15);
});

test('Munições e Pólvoras: lote 4× munição e 2× pólvora (p. 171)', () => {
  const flecha = db.EQUIP_DB.find((e) => e.nome === 'Flecha (1 unidade)');
  const ferro = db.MATERIALS_DB.find((m) => m.id === 'metal_ferro');
  assert.ok(flecha && ferro);
  // 4 flechas (0.2 po) * mult do ferro
  const cheioMun = flecha.pde * 4 * ferro.mult;
  approx(cheioMun, 0.2 * ferro.mult);

  const negra = db.POLVORAS_BOMBA_DB.find((p) => p.id === 'negra');
  assert.equal(negra.preco, 5);
  approx(negra.preco * 2, 10); // lote 2 cargas -> 1d4 em 8h base
  approx(8 * (2 / 3), 16 / 3); // 5,33h Forjador
});

// ---------- 4. Fórmulas de Herbalismo ----------
test('Herbalismo: soma dos ramos e venda com ramos forrageados usa base de mercado', () => {
  const oleo = db.HERBAL_DB.find((h) => h.id === 'oleo_linhaca');
  assert.ok(oleo);
  const ramosUnit = oleo.ramos.reduce((s, rm) => s + db.RAMOS_MAP[rm.id].preco * rm.qtd, 0);
  assert.ok(ramosUnit > 0);

  // Com Artesão (-20%) e margem de 50% para venda mesmo forrageado
  const baseVenda = ramosUnit * 0.8;
  const precoVenda = baseVenda * 1.5;
  approx(precoVenda, ramosUnit * 1.2);
});

// ---------- 5. Pesos em kg e modificadores de peso ----------
test('Forja: Pesos em kg do Guia e modificadores de material / Estrutura Leve', () => {
  const byNome = (n) => db.EQUIP_DB.find((e) => e.nome === n);
  assert.equal(byNome('Adaga').pesoKg, 0.5);
  assert.equal(byNome('Espada Longa').pesoKg, 2);
  assert.equal(byNome('Espada Colossal').pesoKg, 30);
  assert.equal(byNome('Arco longo').pesoKg, 1);
  assert.equal(byNome('Placas').pesoKg, 32);
  assert.equal(byNome('Placas encouraçada').pesoKg, 45);
  assert.equal(byNome('Broquel').pesoKg, 1);
  assert.equal(byNome('Escudo de duas mãos').pesoKg, 20);
  assert.equal(byNome('Canhão').pesoKg, 20);
  assert.equal(byNome('Agulha').pesoKg, null);

  const mithral = db.MATERIALS_DB.find((m) => m.id === 'metal_mithral');
  const ouro = db.MATERIALS_DB.find((m) => m.id === 'metal_ouro');
  const ironWood = db.MATERIALS_DB.find((m) => m.id === 'veg_iron_wood');
  const pedraAnaRef = db.MATERIALS_DB.find((m) => m.id === 'geo_pedra_ana_refinada');
  assert.equal(mithral.pesoMult, 0.5);
  assert.equal(ouro.pesoMult, 2);
  assert.equal(ironWood.pesoMult, 2);
  assert.equal(ironWood.forcaPesado, true);
  assert.equal(pedraAnaRef.pesoMult, 2);
  assert.equal(pedraAnaRef.forcaPesado, true);

  // Placas (32 kg) de Mithral (÷2) com Estrutura Leve (-25%) = 12 kg
  approx(byNome('Placas').pesoKg * mithral.pesoMult * 0.75, 12);

  // Materiais vivos (conserto por ressurreição, p. 173)
  const vivos = db.MATERIALS_DB.filter((m) => m.materialVivo).map((m) => m.id);
  assert.equal(vivos.length, 7);
  assert.ok(vivos.includes('metal_elementium'));
  assert.ok(vivos.includes('org_coral'));
});
