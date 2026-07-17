# Fase 2 — Knowledge Core e persistência

## Resultado

A Fase 2 transforma o conteúdo que estava embutido em módulos TypeScript em um núcleo canônico, versionado e validado. A interface atual continua funcional por meio de adaptadores, enquanto features novas podem trabalhar diretamente com entidades e IDs estáveis.

## Entidades

- `LexicalItem`: lema português, artigo, gênero, plural, sentidos em russo e exemplos.
- `SceneOccurrence`: posição de um item lexical em uma cena. A ocorrência não duplica o vocabulário.
- `Scene`, `Phrase` e `CultureNote`: composição pedagógica da cena por referências.
- `Verb`: paradigma verbal canônico.
- `Mission`: sequência de IDs globais de ocorrência.
- `Lesson` e `ExerciseTemplate`: metadados do currículo e competências.
- `UserProgress` e `Attempt`: contratos validados para persistência e telemetria pedagógica futura.

Os arquivos publicados ficam em `src/content/data`. O `manifest.json` declara `schemaVersion: 1` e as contagens de controle.

## Migração auditável

O comando `npm run migrate:content` reconstrói os JSONs a partir do conteúdo legado e valida o bundle antes de gravá-lo. A migração consolidou:

| Medida | Resultado |
| --- | ---: |
| Cenas | 8 |
| Hotspots/ocorrências | 90 |
| Itens lexicais únicos usados nas cenas | 78 |
| Itens lexicais totais, incluindo vocabulário avulso | 89 |
| Verbos | 50 |
| Missões | 8 |

Exemplo: `toalha` é um único `LexicalItem`, referenciado pelas ocorrências `banheiro:toalha` e `lavanderia:toalha-varal`.

## Fronteiras arquiteturais

`ContentRepository` carrega todos os JSONs, executa o schema Zod e oferece consultas canônicas. Os arquivos em `src/data` são adaptadores temporários para os componentes anteriores à Fase 2.

`ProgressRepository` e `PreferencesRepository` são as únicas camadas da aplicação autorizadas a acessar `localStorage`. O progresso persistido usa `schemaVersion: 2`; estados legados são migrados pelo provider e imediatamente salvos no contrato novo.

## Gates

- `npm run validate:content`: valida schemas, unicidade, referências, contagens e imagens.
- `npm run test`: testa entidades, referências, adaptadores e persistência.
- `npm run check`: valida conteúdo, lint, tipos, cobertura e build.
- `npm run check:all`: adiciona os testes E2E e acessibilidade.

Conteúdo pedagógico permanece bilíngue por entidade. Textos de navegação usam o catálogo em `src/locales`; a remoção completa do helper inline `t(pt, ru)` pode avançar incrementalmente sem alterar o Knowledge Core.
