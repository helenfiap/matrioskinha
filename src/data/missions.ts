export interface Mission {
  sceneId: string;
  titlePt: string;
  titleRu: string;
  steps: string[];
}

// Uma missão por cena: sequência ordenada de ids de hotspot já existentes,
// pensada como uma situação real (não apenas "clique em tudo"). Reduz a
// carga cognitiva: no modo missão, só o próximo alvo fica visível.
export const missions: Mission[] = [
  {
    sceneId: 'sala',
    titlePt: 'Chegar e relaxar na sala',
    titleRu: 'Прийти домой и расслабиться в гостиной',
    steps: ['sofa', 'tapete-sala', 'luminaria-sala', 'tv', 'poltrona', 'estante', 'manta', 'almofada', 'mesa-centro', 'vaso-sala', 'planta-sala', 'cortina-sala'],
  },
  {
    sceneId: 'cozinha',
    titlePt: 'Preparar uma refeição',
    titleRu: 'Приготовить еду',
    steps: ['geladeira', 'pia-cozinha', 'torneira-cozinha', 'panela', 'fogao', 'exaustor', 'microondas', 'armario-cozinha', 'mesa-jantar', 'cadeira-cozinha', 'luminaria-pendente'],
  },
  {
    sceneId: 'quarto',
    titlePt: 'Hora de dormir',
    titleRu: 'Время спать',
    steps: ['guarda-roupa', 'espelho-quarto', 'criado-mudo', 'luminaria-mesa', 'cama', 'travesseiro', 'manta-quarto', 'tapete-quarto', 'cortina-quarto', 'comoda', 'quadro'],
  },
  {
    sceneId: 'banheiro',
    titlePt: 'Tomar banho e se arrumar',
    titleRu: 'Принять душ и собраться',
    steps: ['chuveiro', 'banheira', 'toalha', 'pia-banheiro', 'torneira-banheiro', 'espelho-banheiro', 'vaso-sanitario', 'tapete-banheiro', 'cesto', 'planta-banheiro', 'quadro-banheiro'],
  },
  {
    sceneId: 'lavanderia',
    titlePt: 'Lavar e passar a roupa',
    titleRu: 'Постирать и погладить одежду',
    steps: ['cesto-roupa', 'maquina-lavar', 'tanque', 'torneira-lavanderia', 'varal', 'camiseta-varal', 'toalha-varal', 'tabua-passar', 'ferro-passar', 'balde-lavanderia', 'vassoura', 'armario-limpeza'],
  },
  {
    sceneId: 'supermercado',
    titlePt: 'Fazer compras no supermercado',
    titleRu: 'Сделать покупки в супермаркете',
    steps: ['entrada-mercado', 'carrinho-compras', 'prateleira-hortifruti', 'tomate-mercado', 'laranja-mercado', 'prateleira-mercearia', 'pote-conserva', 'caixas-papelao', 'planta-mercado', 'caixa-mercado', 'cesta-compras'],
  },
  {
    sceneId: 'farmacia',
    titlePt: 'Comprar um remédio',
    titleRu: 'Купить лекарство',
    steps: ['porta-farmacia', 'cruz-farmacia', 'prateleira-remedios', 'balcao-farmacia', 'balanca', 'computador-caixa', 'alcool-gel', 'prateleira-higiene', 'gondola-central', 'banco-espera', 'planta-farmacia'],
  },
  {
    sceneId: 'transporte',
    titlePt: 'Pegar o transporte até o centro',
    titleRu: 'Доехать до центра города',
    steps: ['ponto-onibus', 'banco-ponto', 'onibus', 'faixa-pedestre', 'semaforo', 'lixeira', 'ciclovia', 'carro', 'metro-trem', 'entrada-metro', 'aviao'],
  },
];

export function getMission(sceneId: string): Mission | undefined {
  return missions.find((m) => m.sceneId === sceneId);
}
