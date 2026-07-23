# External Art A4 — Gemini Handoff V0

## 1. Instrução de abertura para o próximo agente

Você assumirá somente o track **External Art Production & Integration**, Milestone **A4 — Walls, Obstacles & World Props**, no projeto:

`G:\Meu Drive\Ideias Ruins\Jogo Tormenta\prototipo_d20_jogavel`

Antes de agir:

1. trabalhe exclusivamente nesse diretório;
2. leia integralmente `AGENTS.md`;
3. leia `docs/EXTERNAL_ART_DIRECTION_DESIGN_CUT_V0.md`;
4. use este handoff como auditoria autoritativa enquanto o código não tiver mudado;
5. não repita uma auditoria ampla sem evidência de mudança;
6. não faça commit ou push;
7. não altere regras, movimento, combate ou exploração;
8. não use IP protegida, nomes oficiais, lore, símbolos protegidos ou estilo de artista vivo;
9. não avance automaticamente entre gates ou milestones.

O próximo passo proposto é um conjunto mínimo **A4-P1R2** com três edits. Ele ainda requer confirmação humana antes da geração.

## 2. Estado aprovado anterior ao A4

Ativos externos habilitados por padrão:

- `explorationGround`: E2P1 — `public/assets/terrain/exploration/abandoned-temple-floor-e2p1.png`;
- `combatGround`: C2P1 — `public/assets/terrain/combat/ruined-sanctuary-floor-c2p1.png`;
- `playerActor`: P2R1 — `public/assets/actors/player/guardian-explorer-p2r1.png`;
- `enemyActor`: M2 — `public/assets/actors/enemies/sanctuary-guardian-m2.png`.

Os fallbacks determinísticos, chaves semânticas e comportamento normal/debug devem permanecer intactos.

Última validação completa anterior ao A4: `405/405` testes, typecheck e build aprovados. P1/P1R1 foram somente provas externas e não exigiram nova execução da suíte.

Nota documental: a seção histórica de A1 que afirma que todos os assets estavam desabilitados e que nenhum binário existia descreve o estado pré-A2. As especificações e gates de A1 continuam autoritativos; para o estado atual do catálogo, valem os quatro assets aprovados listados acima.

## 3. Auditoria A4 já concluída

| Chave | Lógico | Anchor | Uso | Estados | Estado runtime atual |
| --- | ---: | ---: | --- | --- | --- |
| `wallObstacle` | 32×32 | (0.5, 0.5) | exploração | presença por `blockedCells`; sem estado do asset | code-native fallback |
| `surveyPoint` | 18×18 | (0.5, 0.5) | exploração | idle/inspected | code-native fallback |
| `switchPoint` | 18×18 | (0.5, 0.5) | exploração | inactive/active; inspected após interação | code-native fallback |
| `exitPoint` | 24×24 | (0.5, 0.5) | exploração | locked/available/completed | code-native fallback |
| `encounterPoint` | 18×18 | (0.5, 0.5) | exploração | idle/inspected | code-native fallback |

Fatos importantes:

- nenhuma chave A4 está habilitada por padrão;
- não há raster físico runtime para os cinco itens;
- wall ocupa exatamente uma célula 32×32;
- POIs são centralizados em uma célula, mas não bloqueiam movimento;
- esses assets são usados somente em exploração;
- normal e debug usam os mesmos world assets; debug acrescenta diagnósticos;
- os paths reservados antigos de wall/exit em `/assets/exploration/...` apontam para arquivos inexistentes;
- os destinos documentados corretos ficam sob `public/assets/world/...`;
- não copiar prova para `public/assets` antes de aprovação humana.

### Limitação arquitetural que não pode ser ignorada

O renderer atual aceita somente uma textura estática por chave de POI. Se uma textura simples fosse habilitada hoje:

- survey perderia a distinção inspected;
- switch perderia inactive/active;
- exit perderia locked/available e manteria apenas parte do completed overlay;
- encounter perderia a apresentação inspected.

Integração futura deve permanecer estritamente na apresentação:

- wall: imagem estática;
- survey/encounter: raster base + tratamento code-native de estado;
- switch: frames OFF/ON sob a mesma chave;
- exit: frames locked/available/completed sob a mesma chave;
- regras e estados autoritativos não mudam.

## 4. Direção visual consolidada após feedback humano

O usuário pediu explicitamente algo com **menos terra** e mais aparência de **masmorra/templo abandonado**.

Direção correta:

- pedra fria charcoal e blue-gray;
- ashlar de templo gasto e úmido;
- ferro escurecido com oxidação discreta;
- highlights minerais pálidos e controlados;
- terra marrom e musgo apenas residuais;
- arquitetura antiga reconhecível, sem símbolos, runas ou iconografia religiosa;
- paredes devem parecer massas elevadas e bloqueadoras, nunca piso;
- props devem continuar ilustrados/painterly, nunca pixel art.

Continuam proibidos:

- texto, letras, números, runas e escrita legível;
- logos, heráldica, símbolos religiosos ou protegidos;
- base cenográfica, disco, badge ou marcador tático embutido;
- pressure plates, portas, portais ou aberturas que sugiram regra inexistente;
- long shadows, bloom amplo e detalhe fino que vire ruído;
- photorealism, pixel art, voxel art e imitação de artista vivo.

## 5. Histórico de provas A4

### A4-P1

Proof root:

`D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1`

Resultado:

- W1 earth masonry: semântica bloqueadora forte; paleta marrom/terra demais;
- W2 cool sanctuary block: rejeitar; parece pressure plate/piso;
- Y1 rolled record: melhor survey; manter provisoriamente;
- Y2 folded record: ambíguo como livro/pacote;
- S1 OFF/ON: melhor switch; painterly e estado legível, mas escuro, largo e quente;
- S2 OFF/ON: rejeitar; parece portão/nicho.

Arquivos principais:

- `A4-P1/proofs/A4-P1-E2P1-world-composite.png`;
- `A4-P1/proofs/A4-P1-overlay-grayscale-matrix.png`;
- `A4-P1/proofs/A4-P1-footprint-state-review.png`;
- `A4-P1/proofs/A4-P1-GENERATION-PROCESSING-MANIFEST.md`;
- `A4-P1/proofs/A4-P1-G1-DIRECTOR-REVIEW.md`.

### A4-P1R1

Proof root:

`D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1R1`

Resultado:

- W3 cold worn ashlar: paleta correta, mas parece pavimento/floor patch;
- W4 fallen sanctuary pier: rejeitar; parece altar/pedestal/fachada;
- S3 OFF/ON: estado e contraste melhores, mas saiu pixel art e o housing lembra arco.

Nenhum P1R1 está pronto para integração.

Arquivos principais:

- `A4-P1R1/proofs/A4-P1R1-E2P1-world-composite.png`;
- `A4-P1R1/proofs/A4-P1R1-revision-comparison.png`;
- `A4-P1R1/proofs/A4-P1R1-overlay-footprint-matrix.png`;
- `A4-P1R1/proofs/A4-P1R1-GENERATION-PROCESSING-MANIFEST.md`;
- `A4-P1R1/proofs/A4-P1R1-DIRECTOR-REVIEW.md`;
- `A4-P1R1/proofs/A4-P1R1-independent-review.md`.

Nota de rastreabilidade: cópias duplicadas de S3 ficaram inadvertidamente em `A4-P1/sources`. Elas têm hashes idênticos às fontes corretas em `A4-P1R1/sources`, não estão no runtime e não devem ser usadas como candidates distintos.

## 6. Próximo conjunto recomendado — A4-P1R2

Objetivo: combinar a semântica e o painterly bem-sucedidos do P1 com a paleta/contraste aprendidos no P1R1.

Quantidade: **três chamadas de edição**, uma por imagem.

### 6.1 W1R1 — cold temple wall edit

Edit target:

`D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1\sources\A4-wall-W1-heavy-earth-masonry-source.png`

Prompt proposto:

```text
Use case: precise-object-edit.
Image 1 is the edit target A4-wall-W1-heavy-earth-masonry.
Preserve the exact square blocking silhouette, one-cell footprint, orthographic camera, raised frontal mass, shallow visible top surface, padding and lighting direction. Preserve its immediate reading as an impassable wall rather than a floor tile.

Repaint only its material language and simplify its surface: replace the warm earth-brown masonry with cold charcoal-gray and muted blue-gray abandoned-temple ashlar. Add damp age darkening inside broad joints, restrained pale mineral highlights and very subtle desaturated oxidation or moss traces. Reduce repetitive brick detail and tiny cracks; retain only a few broad hand-cut stone masses. Make the shallow vertical face clearly darker than the top surface so the asset still reads as raised architecture at 32 and 19 pixels.

Keep the illustrated restrained-painterly style consistent with E2P1, C2P1, P2R1 and M2. Do not turn it into paving, a floor patch, pressure plate, framed slab, altar, doorway, portal or rubble pile.

Preserve the perfectly flat solid #00ff00 chroma-key background with no gradient, texture, floor, reflection or shadow. Do not use #00ff00 in the object. No cast/contact shadow.

No text, runes, letters, numbers, logo, heraldry, religious symbol, protected identity, named-artist imitation, pixel art, voxel art, photorealism, scenic base, tactical marker, inset panel, loose fragments, long shadow, glow, crop or duplicate object.
```

### 6.2 S1R1-OFF — cold compact temple lever

Edit target:

`D:\Codex\home\visualizations\2026\07\18\019f729e-cca7-7e03-9d9c-5ad472887e17\A4-P1\sources\A4-switch-S1-low-lever-off-source.png`

Prompt proposto:

```text
Use case: precise-object-edit.
Image 1 is the edit target A4-switch-S1-low-lever-off.
Preserve the painterly illustrated rendering, camera, framing, pivot position, short thick lever lowered toward the left, OFF silhouette and perfectly flat #00ff00 background.

Refine only the housing and material language. Replace warm brown stone with cold charcoal-gray and muted blue-gray abandoned-temple stone; use dark aged iron for the mechanism and restrained pale neutral highlights. Simplify and slightly reduce the broad tiled housing so the lever becomes the dominant readable shape at 18 pixels. Preserve a compact physical socket, but remove any scenic-plinth feeling. Increase local neutral-value separation between lever, pivot and housing without cyan, glow or color-only state coding.

Keep the same soft three-quarter volume and restrained painterly style as the approved art family. The result must remain readable at 18 and 11 pixels in grayscale and must not resemble a doorway, arch, gate, portal, pressure plate or floor tile.

Preserve the perfectly flat solid #00ff00 chroma-key background with no gradient, texture, floor, reflection or shadow. Do not use #00ff00 in the object. No cast/contact shadow.

No pixel art, voxel art, photorealism, text, runes, letters, numbers, logo, heraldry, religious symbol, protected identity, named-artist imitation, scenic base, disc, badge, marker, aura, checkmark, long shadow, extra supports, crop or duplicate object.
```

### 6.3 S1R1-ON — state edit

Edit target: the newly generated and accepted-for-proof `S1R1-OFF`, not the old S1 source.

Prompt proposto:

```text
Use case: precise-object-edit.
Image 1 is the edit target A4-switch-S1R1-cold-temple-lever-off.
Preserve exactly the revised compact housing, pivot position, camera, framing, scale, silhouette bounds, cold stone and dark iron materials, painterly brushwork, lighting, padding and perfectly flat #00ff00 background.

Change only the lever state: rotate the same short thick lever arm upward and toward the right, opening a clear negative space and exposing one restrained pale neutral-value highlight. The OFF/ON difference must remain obvious by angle, height, silhouette and grayscale value at 18 and 11 pixels.

Do not add cyan, glow, aura, extra supports, arch, doorway, gate, portal, base, disc, shadow, reflection, text, symbol, object, crop or background variation. No pixel art, voxel art, photorealism, protected identity or named-artist imitation.
```

## 7. Regras de geração e processamento

- confirmar o plano P1R2 com o humano antes da primeira chamada;
- uma chamada por candidate/state;
- usar edição com a imagem-alvo carregada como referência real;
- não gerar ON independentemente do OFF revisado;
- usar fundo plano `#00ff00` sem sombra, gradiente ou floor plane;
- manter sources e provas fora de `public/assets`;
- nunca sobrescrever P1/P1R1;
- registrar prompt exato, ferramenta/modelo disponível, generation ID, referências, data, processamento, hash e limitações;
- se o agente não conseguir fazer edição preservando o target, parar e informar o humano; não substituir por geração independente silenciosa.

Helper oficial disponível nesta máquina:

`D:\Codex\home\skills\.system\imagegen\scripts\remove_chroma_key.py`

Comando-base:

```powershell
& 'C:\Users\rnaba\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'D:\Codex\home\skills\.system\imagegen\scripts\remove_chroma_key.py' `
  --input '<source>' `
  --out '<keyed.png>' `
  --auto-key border `
  --soft-matte `
  --transparent-threshold 12 `
  --opaque-threshold 220 `
  --despill
```

Usar `--edge-contract 1` somente se houver fringe visível e registrar a repetição.

Normalização:

- wall: master RGBA 256×256, alpha bbox máxima 240×240, anchor (0.5,0.5);
- switch: master RGBA 144×144, union bbox OFF/ON máxima 128×128;
- OFF/ON devem usar exatamente a mesma transformação de crop, escala e posição;
- Lanczos, sem deformação;
- neutralizar pixels transparentes e validar cantos alpha zero.

## 8. Matriz de provas obrigatória

### W1R1

- 64, 32 e 19 px;
- color e grayscale;
- isolado, 1×3 e 2×2 sobre E2P1;
- verificar leitura wall/blocked versus floor/paving;
- cyan, amber, coral e violet acima da wall;
- footprint exato de uma célula.

### S1R1

- OFF/ON em 36, 18 e 11 px;
- color e grayscale;
- mesma escala/enquadramento;
- confirmar estado por ângulo, altura, silhouette e value;
- overlays cyan/amber/coral/violet abaixo do POI;
- verificar que não parece arco, portão, portal, pressure plate ou marcador;
- comparar com P2R1/M2 e Y1 no mapa E2P1.

### Técnica

- RGBA e sRGB;
- transparent corners;
- alpha bbox plausível;
- sem halo em `#15181F` e `#F4F0E8`;
- sem chroma residual visível;
- hashes SHA-256;
- prompts/IDs/processamento completos.

## 9. Gates

1. **P1R2 Plan Gate:** humano confirma os três edits e prompts.
2. **P1R2 Proof Gate:** gerar/processar/compor fora de runtime; apresentar e parar.
3. **Selection Gate:** humano aprova, rejeita ou pede revisão por candidate/família.
4. **Integration Gate:** somente após autorização explícita, copiar aprovados, atualizar provenance/catalog/renderer de apresentação.
5. **Runtime Gate:** fallbacks, normal/debug, 800×450, 640×360, resize/transition/reset, testes/typecheck/build.
6. Parar antes de exit/encounter e antes do A5, salvo nova autorização humana.

## 10. Critério de sucesso para encerrar esta revisão

Não escolher o candidato “menos ruim”. O conjunto só avança se:

- W1R1 parecer simultaneamente **templo frio** e **parede elevada bloqueadora** em 32 px;
- S1R1 permanecer painterly, compacto e legível como switch;
- OFF/ON forem distinguíveis sem depender de cor;
- nenhum asset comunicar regra inexistente;
- overlays continuarem prioritários;
- fallbacks e catálogo permanecerem intactos até aprovação.

## 11. Estado de entrega deste handoff

- Nenhum A4 aprovado ou integrado.
- Nenhuma alteração de código realizada durante P1/P1R1.
- Nenhum commit ou push.
- Próxima ação: apresentar/confirmar o plano A4-P1R2 ao humano no novo agente.
