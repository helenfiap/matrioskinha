# Reestruturação de Cenários e Ateliê das Emoções

## Decisão de produto

A área deixa de ser apresentada como uma lista única de “cenários da casa” e passa a ser uma biblioteca de experiências organizada por coleções. Os cenários existentes continuam intactos; a mudança inicial é de navegação e arquitetura editorial.

## Coleções

| Coleção | Conteúdo | Estado |
| --- | --- | --- |
| Casa e rotina | sala, cozinha, quarto, banheiro e lavanderia | disponível |
| Cidade e serviços | supermercado e farmácia | disponível |
| Mobilidade | transportes | disponível |
| Ateliê das Emoções | 16 emoções com Matrioskinha e Misha | em produção |
| Viagem pelo Brasil | futuros cenários regionais e de viagem | planejada |

## Ateliê das Emoções

O Ateliê será uma experiência afetiva e gramatical. Cada mood terá duas ilustrações equivalentes:

- Matrioskinha, variante feminina;
- **Misha Matriôshkin**, variante masculina.

Isso permite trabalhar simultaneamente:

- reconhecimento visual da emoção;
- adjetivos e expressões afetivas;
- concordância de gênero em português e russo;
- formas invariáveis, como “feliz”, “triste” e “confiante”;
- perguntas e respostas: “Como ela está?”, “Como ele está?”, “Como você se sente?”.

### Catálogo visual

1. feliz;
2. triste;
3. apaixonada/apaixonado;
4. preocupada/preocupado;
5. assustada/assustado;
6. calma/calmo;
7. irritada/irritado;
8. surpresa/surpreso;
9. cansada/cansado;
10. animada/animado;
11. tímida/tímido;
12. confiante;
13. orgulhosa/orgulhoso;
14. envergonhada/envergonhado;
15. confusa/confuso;
16. aliviada/aliviado.

O lote completo contém 32 imagens. Os IDs são estáveis e os arquivos finais devem ser gravados em:

```text
public/assets/scenarios/emotions/
  matrioskinha/<mood-id>.png
  misha/<mood-id>.png
```

## Personagem masculino

**Nome recomendado:** Misha Matriôshkin.

Misha usa a mesma linguagem formal arredondada da Matrioskinha, mas tem identidade própria. Sua nostalgia soviética aparece em elementos cotidianos e gráficos: casaco de trabalho azul-marinho desbotado, cachecol bordô, relógio mecânico de latão e bordados inspirados no modernismo geométrico. Não são usadas insígnias políticas reais, propaganda ou uniforme militar.

## Gerador de arte

O script `scripts/generate-emotion-moods.ps1` chama o CLI oficial instalado com a habilidade de imagens do Codex. Por segurança, sua execução padrão apenas lista o plano e não chama a API.

```powershell
# Planejar as 32 imagens sem custo
npm run art:moods

# Planejar uma emoção
npm run art:moods -- -Mood feliz

# Gerar somente as personagens femininas
npm run art:moods -- -Execute -Gender feminine

# Gerar o lote completo
npm run art:moods -- -Execute
```

A execução real requer `OPENAI_API_KEY`, o pacote Python `openai`, acesso à internet e créditos de API. A imagem de referência está versionada em `public/assets/scenarios/emotions/reference/matrioskinha-reference.png`.

Instale o cliente no mesmo venv usado pelo workspace:

```powershell
uv pip install --python "..\.venv\Scripts\python.exe" --upgrade openai
```

## Etapas seguintes

1. gerar três provas: feliz, triste e assustada, nos dois personagens;
2. validar consistência de rosto, roupas, enquadramento e legibilidade em miniatura;
3. ajustar o prompt-base antes de consumir o lote completo;
4. gerar as 32 artes finais;
5. cadastrar frases, áudio e exercícios no Knowledge Core;
6. implementar alternância ela/ele e comparação lado a lado;
7. adicionar missão afetiva e revisão espaçada;
8. revisar todo o conteúdo russo com foco em gênero e naturalidade.
