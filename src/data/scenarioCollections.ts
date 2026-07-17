export type ScenarioCollectionStatus = 'available' | 'in-production' | 'planned';
export type ScenarioCollectionKind = 'scenes' | 'emotion-atelier';

export interface ScenarioCollection {
  id: 'house' | 'city-services' | 'mobility' | 'emotions' | 'brazil';
  kind: ScenarioCollectionKind;
  titlePt: string;
  titleRu: string;
  descriptionPt: string;
  descriptionRu: string;
  sceneIds: string[];
  status: ScenarioCollectionStatus;
}

export const scenarioCollections: ScenarioCollection[] = [
  {
    id: 'emotions',
    kind: 'emotion-atelier',
    titlePt: 'Ateliê das Emoções',
    titleRu: 'Ателье эмоций',
    descriptionPt: 'Observe expressões, nomeie sentimentos e pratique gênero e concordância.',
    descriptionRu: 'Наблюдайте за выражениями, называйте чувства и практикуйте род и согласование.',
    sceneIds: [],
    status: 'in-production',
  },
  {
    id: 'house',
    kind: 'scenes',
    titlePt: 'Cenários da casa',
    titleRu: 'Сцены дома',
    descriptionPt: 'Explore os ambientes, objetos e ações da rotina doméstica.',
    descriptionRu: 'Исследуйте комнаты, предметы и действия домашней жизни.',
    sceneIds: ['sala', 'cozinha', 'quarto', 'banheiro', 'lavanderia'],
    status: 'available',
  },
  {
    id: 'city-services',
    kind: 'scenes',
    titlePt: 'Cidade e serviços',
    titleRu: 'Город и услуги',
    descriptionPt: 'Pratique situações úteis de compras, saúde e atendimento.',
    descriptionRu: 'Практикуйте полезные ситуации покупок, здоровья и обслуживания.',
    sceneIds: ['supermercado', 'farmacia'],
    status: 'available',
  },
  {
    id: 'mobility',
    kind: 'scenes',
    titlePt: 'Mobilidade',
    titleRu: 'Транспорт',
    descriptionPt: 'Aprenda a circular, pedir informação e reconhecer transportes.',
    descriptionRu: 'Учитесь передвигаться, спрашивать дорогу и узнавать транспорт.',
    sceneIds: ['transporte'],
    status: 'available',
  },
  {
    id: 'brazil',
    kind: 'scenes',
    titlePt: 'Viagem pelo Brasil',
    titleRu: 'Путешествие по Бразилии',
    descriptionPt: 'Uma futura coleção de encontros, paisagens e situações de viagem.',
    descriptionRu: 'Будущая коллекция встреч, пейзажей и ситуаций в путешествии.',
    sceneIds: [],
    status: 'planned',
  },
];

export function getCollectionForScene(sceneId: string) {
  return scenarioCollections.find((collection) => collection.sceneIds.includes(sceneId))
    ?? scenarioCollections.find((collection) => collection.id === 'house')!;
}
