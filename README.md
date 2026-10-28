# YouTube Thumbnail Downloader

Cole o link de um vídeo do YouTube e baixe a thumbnail em todas as resoluções disponíveis, em **JPG**, **WebP** ou **AVIF**. Sem login, sem cadastro.

Construído com **React Router v7** (framework mode, sucessor do Remix), **TypeScript**, **Tailwind CSS v4** e **sharp**, pronto para deploy na **Vercel**.

![Tela inicial](docs/screenshots/home.png)

## Funcionalidades

- Aceita vários formatos de link: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`, `youtube.com/v/` ou o ID de 11 caracteres.
- Mostra 5 resoluções: 1920×1080, 640×480, 480×360, 320×180 e 120×90.
- Download em JPG (original do YouTube) e conversão para WebP/AVIF no servidor (qualidade 85).
- Tamanhos que não existem para o vídeo (comum em `maxres`) aparecem como "Not available".
- A busca fica na URL (`/?url=...`), então os resultados podem ser compartilhados.
- Layout responsivo, tema escuro.

![Resultados](docs/screenshots/results.png)

## Como usar

1. Abra o app.
2. Cole o link do vídeo no campo de busca e clique em **Search** (ou aperte Enter).
3. Escolha a resolução desejada:
   - **JPG**: abre a imagem original em outra aba (clique com o botão direito para salvar).
   - **WEBP** / **AVIF**: converte e baixa o arquivo direto.
4. Clique em **New search** para começar de novo.

Exemplos de entrada aceita:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
dQw4w9WgXcQ
```

<p align="center">
  <img src="docs/screenshots/mobile.png" alt="Versão mobile" width="300">
</p>

## Rodando localmente

Requisitos: Node.js 20+ e npm.

```bash
git clone https://github.com/gustavocardoso/youtube-thumbnail.git
cd youtube-thumbnail
npm install
npm run dev
```

Acesse http://localhost:5173.

### Scripts

| Comando             | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento com HMR         |
| `npm run build`     | Build de produção                           |
| `npm start`         | Serve o build (`react-router-serve`)        |
| `npm test`          | Testes unitários (Vitest)                   |
| `npm run typecheck` | Gera os tipos das rotas e roda o `tsc`      |

## API de conversão

`GET /api/convert`

| Parâmetro | Obrigatório | Valores                                                  | Padrão   |
| --------- | ----------- | -------------------------------------------------------- | -------- |
| `v`       | sim         | ID do vídeo (11 caracteres)                              | -        |
| `q`       | não         | `maxres`, `standard`, `high`, `medium`, `default`        | `maxres` |
| `format`  | não         | `avif`, `webp`                                           | `avif`   |

```bash
curl -o thumb.avif "http://localhost:5173/api/convert?v=dQw4w9WgXcQ&q=high&format=avif"
```

Respostas de erro (JSON `{ "error": "..." }`): `400` para parâmetros inválidos ou imagem inexistente no YouTube, `500` se a conversão falhar.

O endpoint recebe apenas o ID do vídeo e monta a URL em `img.youtube.com` no servidor, então não funciona como proxy aberto.

## Deploy na Vercel

1. Envie o repositório para o GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. O preset React Router é detectado automaticamente. Não há variáveis de ambiente.
4. Clique em **Deploy**.

A conversão com `sharp` roda em Vercel Functions (runtime Node.js).

## Estrutura

```
app/
├── lib/
│   ├── youtube.ts          # extração do ID e URLs das thumbnails
│   └── youtube.test.ts     # testes
├── routes/
│   ├── home.tsx            # página principal (busca + cards)
│   └── api.convert.ts      # conversão WebP/AVIF
├── routes.ts               # definição das rotas
├── root.tsx                # layout raiz
└── app.css                 # Tailwind + tema
```

## Autor

Desenvolvido por **Gustavo Cardoso**  
[gustavocardoso@gmail.com](mailto:gustavocardoso@gmail.com) · [github.com/gustavocardoso](https://github.com/gustavocardoso)

Thumbnails pertencem aos respectivos criadores e são servidas pelo YouTube. Este projeto não é afiliado ao YouTube.
