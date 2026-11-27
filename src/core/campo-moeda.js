  // Campo de preço com seletor PO/PP/PC ao lado. O estado guarda sempre PO;
  // o campo mostra o valor na moeda escolhida (5 PC aparece como 5, não 0,05).
  function campoMoeda(input, select) {
    return {
      lerPo: function () {
        if (input.value === '') return '';
        var m = moedaValida(select.value);
        return m === 'po' ? input.value : String(paraPo(num(input.value, 0), m));
      },
      mostrar: function (po, moeda) {
        var m = moedaValida(moeda);
        select.value = m;
        input.step = MOEDA_PASSO[m];
        input.value = (po === '' || po == null) ? '' : dePo(num(po, 0), m);
      }
    };
  }
