# Maze Dash Runner

Um pequeno jogo de labirinto desenvolvido originalmente como um projeto de estudo utilizando **Phaser CE (Phaser 2)**.

Apos anos sem manutencao, o projeto foi restaurado e organizado novamente, preservando sua identidade original enquanto recebeu melhorias na estrutura, documentacao e ambiente de desenvolvimento.

O objetivo desta restauracao nao e transformar o jogo em algo completamente diferente, mas concluir ideias que ficaram inacabadas e evolve-lo de forma gradual.

> Este projeto continua em desenvolvimento.

---

## Sobre o jogo

Maze Dash Runner e um jogo de labirinto em estilo arcade.

O jogador deve percorrer o mapa coletando moedas enquanto evita goblins que tentam roubá-las. A proposta e simples, inspirada nos jogos classicos, com foco em uma jogabilidade rapida e estatica retro.

Funcionalidades atuais:

- Menu principal animado com perseguição dinamica
- Sistema de pausa com confirmacao de reinicio
- Configuracoes de audio e volume
- Sistema de coleta de moedas com re-posicionamento
- 4 goblins com IA de visao, perseguicao e coleta competitiva
- Efeitos sonoros e musicas por fase
- Tela de recordes e estatisticas
- Estilo visual pixel art

---

## Estrutura do projeto

```
js/
  core/           Configuracao, utilitarios, boot, load, game
  entities/       Player, Goblin, GoblinAI, CoinManager
  managers/       AudioManager, EnemyManager, ParticleEffects
  ui/             Menu, PauseUI, SettingsUI, Records, Credits, End, ChaseAnimation
  maps/           Dados dos niveis (maze, spawns, config)
  stages/         GameStage (orquestrador da fase)
```

### Principais modulos

| Modulo | Responsabilidade |
|--------|-----------------|
| `GameStage` | Orquestrador - carrega mapa, inicializa sistemas, atualiza logica |
| `PlayerController` | Sprite, animacoes e movimentacao do player |
| `GoblinAI` | IA dos goblins com visao, estados (PATROL/CHASE/COLLECT) e hints |
| `EnemyManager` | Cria e gerencia todos os inimigos do nivel |
| `CoinManager` | Gerencia moedas, coleta e re-posicionamento |
| `AudioManager` | Musica, efeitos sonoros e ticks de navegacao |
| `ParticleEffects` | Sistema de particulas para efeitos visuais |
| `PauseUI` | Sistema de pausa com overlay e confirmacao |
| `ChaseAnimation` | Animacao de perseguicao compartilhada entre menu e credits |
| `Stage01Data` | Dados do nivel 1 (labirinto, spawns, configuracao) |

---

## Tecnologias

- JavaScript (ES5/ES6)
- Phaser CE 2.10
- HTML5
- CSS3

---

## Executando o projeto

Clone o repositorio:

```bash
git clone https://github.com/Rafa-MKR2/Maze-Dash-Runner.git
```

Instale as dependencias:

```bash
npm install
```

Inicie o servidor local:

```bash
npm run dev
```

Depois basta abrir o navegador no endereco informado pelo servidor.

---

## Processo de restauracao

Este repositorio esta sendo restaurado em pequenas etapas.

Cada atualizacao busca preservar o codigo original enquanto melhora aspectos como:

- organizacao do projeto;
- documentacao;
- correcao de bugs;
- melhorias de interface;
- novas funcionalidades planejadas originalmente.

Sempre que possivel, as alteracoes respeitam a arquitetura e o estilo do projeto desenvolvido na epoca.

---

## Licenca

Este projeto esta licenciado sob a licenca MIT.
