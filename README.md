# Maze Dash Runner

Jogo de labirinto desenvolvido com Phaser.js (Phaser 2).

## Como executar

```bash
npm install
npm run dev
```

O navegador abrirá automaticamente em `http://localhost:3000`.

## Controles

- **Setas do teclado** — Mover o personagem
- **Enter** — Iniciar jogo / Reiniciar
- **Esc** — Voltar ao menu

## Estrutura do projeto

```
├── index.html          # Página principal
├── css/
│   ├── estilo.css      # Estilos do jogo
│   └── emulogic.ttf    # Fonte Emulogic
├── js/
│   ├── phaser.min.js   # Framework Phaser 2
│   ├── boot.js         # Estado de inicialização
│   ├── load.js         # Carregamento de assets
│   ├── menu.js         # Tela do menu principal
│   ├── stage1.js       # Gameplay do labirinto
│   ├── end.js          # Tela de game over
│   └── game.js         # Criação da instância do jogo
├── img/                # Sprites e imagens
└── sfx/                # Efeitos sonoros e música
```

## Licença

MIT
