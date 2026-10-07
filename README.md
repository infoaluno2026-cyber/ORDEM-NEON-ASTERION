# ORDEM NEON ASTERION

Primeira versão jogável de um jogo 2D de ação em navegador, desenvolvida com HTML5 Canvas, CSS3 e JavaScript puro. Esta versão foi pensada para funcionar diretamente abrindo o arquivo `index.html` localmente ou publicando o projeto no GitHub Pages.

## Como executar localmente

1. Abra a pasta do projeto em um navegador.
2. Você pode abrir diretamente o arquivo `index.html`.
3. Ou servir a pasta via Python em um terminal:

```bash
cd /caminho/para/o/projeto
python3 -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000/
```

## Como criar o repositório

```bash
git init
git add .
git commit -m "Primeira versão jogável"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ORDEM-NEON-ASTERION.git
git push -u origin main
```

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente o conteúdo da raiz do projeto a cada push para a branch `main`. Para ativar:

1. Envie o workflow para o GitHub na branch `main`.
2. No repositório, acesse `Settings` > `Pages`.
3. Em `Build and deployment`, escolha `GitHub Actions` como origem.
4. Aguarde a execução de `Deploy GitHub Pages` terminar com sucesso.

A URL pública será:

```text
https://infoaluno2026-cyber.github.io/ORDEM-NEON-ASTERION/
```

## Como atualizar o jogo

1. Edite os arquivos do projeto.
2. Teste em um navegador local.
3. Faça commit e push para a branch `main`.
4. O workflow do GitHub Pages publica a nova versão automaticamente.

## Controles

- A / D: movimento
- W / Espaço: pulo
- J: ataque
- K: habilidade especial
- L: habilidade secundária
- 1 / 2 / 3: trocar personagem
- Esc: pausar

## Estrutura do projeto

```text
/
├── index.html
├── style.css
├── README.md
├── js/
│   ├── main.js
│   ├── game.js
│   ├── player.js
│   ├── enemies.js
│   ├── bosses.js
│   ├── combat.js
│   ├── levels.js
│   ├── dialogue.js
│   ├── ai.js
│   ├── effects.js
│   ├── audio.js
│   ├── save.js
│   └── ui.js
├── data/
│   ├── characters.js
│   ├── enemies.js
│   └── story.js
├── assets/
│   ├── images/
│   ├── sprites/
│   ├── audio/
│   └── backgrounds/
└── .gitignore
```

## Esta versão inclui

- Menu principal
- Sistema de equipe com Kael, Rio e Lira
- Cenário ilustrado da cidade de Asterion como fundo das fases
- Movimento, pulo, ataque e habilidades
- Inimigos básicos, rápidos, cristalinos e de distância
- HUD com vida, energia, cooldowns e inimigos derrotados
- Primeira fase jogável: Estação Abandonada
- Diálogos e cenas em jogo
- Sistema de progresso com localStorage
- Controles virtuais para mobile
- Arquitetura pronta para expansão com sprites, áudio e fases futuras

## Observações

- Não há backend ou servidor obrigatório para execução.
- Os sons são placeholders funcionais, esperando arquivos reais.
- O cenário usa uma imagem local; personagens, plataformas e efeitos continuam sendo desenhados no Canvas.
- A estrutura foi organizada para facilitar a troca por assets pixel art e música definitiva no futuro.
