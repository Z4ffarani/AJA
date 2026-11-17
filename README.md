![AJA](./assets/banner.png)

**[Site](https://aja-app.up.railway.app)**

AJA é uma plataforma de participação cidadã que transforma relatos da comunidade em propostas fundamentadas de melhoria da infraestrutura dos bairros. O piloto acontece no Parque Doroteia, em São Paulo, com foco em acessibilidade para pessoas com deficiência visual e auditiva. Moradores relatam barreiras do jeito que preferirem (texto, áudio, foto ou vídeo em Libras), a comunidade apoia e reúne evidências, e o AJA monta um dossiê para a prefeitura e acompanha o protocolo até a barreira ser removida e verificada por quem passa por ali.

---

## Como funciona

1. **Relatar:** a pessoa conta a barreira por texto, áudio, foto ou vídeo em Libras, diz onde fica e se passa por ali. Um link do Google Maps ou do Street View vira evidência com a vista do local.
2. **Organizar:** relatos do mesmo tipo e no mesmo lugar são reunidos em um único tópico, com mapa e Street View do endereço.
3. **Apoiar:** um único voto, com a marcação opcional “Passo por essa barreira”, que conta como evidência. Apoio mostra mobilização, mas não é condição para a barreira ser atendida.
4. **Conversar:** comentários em texto ou áudio gravado no navegador, organizados em conversas, com respostas recuadas e marcação de comentários úteis.
5. **Fundamentar:** cada tópico reúne dados públicos (SP156), normas técnicas, leis e estudos, conferidos por voluntários.
6. **Dossiê:** o AJA gera um PDF com texto real, legível por leitor de tela, sem dados pessoais.
7. **Acompanhar:** protocolo, pendências, decisões e justificativas da prefeitura ficam visíveis numa linha do tempo.
8. **Conquistas:** depois da obra, o apoio dá lugar à avaliação. Antes e depois, notas e a pergunta “A barreira continua resolvida?” mantêm a melhoria verificada ao longo do tempo.

O piloto é o Parque Doroteia, e dois bairros vizinhos (Parque Primavera e Balneário São Francisco) mostram como o AJA cresce. A pessoa troca de bairro na página inicial. As ruas e coordenadas dos exemplos são reais; as barreiras, pessoas e protocolos são simulados e aparecem marcados como exemplo.

O bloco **Pergunte ao AJA** traz respostas prontas para dúvidas comuns, organizadas por assunto (piso tátil, travessias, Libras, prefeitura, dossiê, privacidade e acessibilidade). A pessoa toca na pergunta e lê ou ouve a resposta, sem precisar digitar nada.

---

## Acessibilidade

- Contraste WCAG AA conferido nos modos claro e escuro, e um modo de alto contraste.
- Tema claro, escuro ou automático, tamanho do texto ajustável e redução de animações, salvos no aparelho.
- Tradução para Libras com o **[VLibras](https://www.gov.br/governodigital/pt-br/vlibras)** em todas as páginas.
- Botões “Ouvir” que leem tópicos, comentários, respostas e o dossiê com a voz do aparelho.
- Fonte **[Atkinson Hyperlegible Next](https://www.brailleinstitute.org/freefont/)**, criada para leitores com baixa visão.
- Navegação completa por teclado, link para pular ao conteúdo, rótulos em todos os campos e descrição em todas as imagens.
- Verificação automática com **[axe-core](https://github.com/dequelabs/axe-core)** (WCAG 2.1 A/AA) em todas as telas, nos dois temas, no computador e no celular.

---

## Arquitetura

### Front-end
Aplicação em **[Next.js](https://nextjs.org)** com App Router e componentes de servidor. As páginas buscam os dados direto no back-end pelo servidor do front, repassando a sessão do usuário, e as partes interativas (apoio, comentários, relato, preferências) ficam em componentes de cliente. Uma rota em `app/api/[...path]` repassa as chamadas do navegador para o back-end, o que mantém o cookie de sessão na mesma origem e fora do alcance de scripts. O estilo vem de um único arquivo `globals.css`, com variáveis de cor para os temas e *container queries* para computador, tablet e celular. Os ícones são da biblioteca **[Phosphor Icons](https://phosphoricons.com)**, no estilo preenchido. O mapa do bairro usa **[Leaflet](https://leafletjs.com)** com **[OpenStreetMap](https://www.openstreetmap.org)**, e cada tópico mostra o mapa e o Street View do Google embutidos, sempre com o endereço por extenso ao lado.

### Back-end
API em **[Fastify](https://fastify.dev)** com TypeScript. O banco **PostgreSQL** guarda tópicos, relatos, apoios, comentários, referências, linha do tempo e o repertório do Pergunte ao AJA; o esquema é aplicado na inicialização e os dados de exemplo do piloto são refeitos quando a versão deles muda (as contas são mantidas). A autenticação usa senha cifrada com *scrypt* e sessão em JWT num cookie `httpOnly`. Fotos, áudios e vídeos vão para um bucket compatível com S3 (ou para a pasta `uploads/` em desenvolvimento). O dossiê é gerado com **[PDFKit](https://pdfkit.org)** como PDF marcado, com a fonte Atkinson incorporada. As entradas são validadas com **[Zod](https://zod.dev)** e as rotas sensíveis têm limite de requisições.

```
Navegador
   │  HTTPS
   ▼
Front-end (Next.js) ── /api/* ──► Back-end (Fastify) ──► PostgreSQL
                                        └──────────────► Bucket (fotos, áudios, vídeos)
```

---

## Como executar

### Pré-requisitos
- Node.js 22+ e PostgreSQL 15+

### Back-end

```bash
cd backend
npm install
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
createdb aja
npx tsx --env-file=.env src/server.ts
```

### Front-end

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Acesse `http://localhost:3000`. O back-end responde em `http://localhost:8080`.

---

## Deploy (Railway)

| Serviço | Root Directory | Variáveis de ambiente |
|---|---|---|
| Back-end | `backend/` | `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `BUCKET`, `ENDPOINT`, `REGION`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY` |
| Front-end | `frontend/` | `BACKEND_URL` |
| Postgres | — | — |
| Bucket | — | — |

O front-end conversa com o back-end pela rede privada do Railway (`BACKEND_URL=http://<back-end>.railway.internal:8080`).

---

## Observações

- Todos os dados do piloto são simulados: nomes, endereços, protocolos e números de dossiê.
- A consulta ao SP156 e o envio de avisos por e-mail e WhatsApp são simulados.
- As respostas do Pergunte ao AJA e os resumos são textos preparados, não gerados em tempo real.
- Os números de tempo de resposta vêm dos dados abertos do SP156 (2020 a 2026).
- O concept 3D é uma visualização conceitual, não um projeto executivo.
- Não insira informações pessoais reais na plataforma.

---

## Projetos acadêmicos

| Entrega | Repositório |
|---|---|
| Global Solution · Inteligência Artificial & Machine Learning · FIAP 2026.2 | [2026-SEM2-GS-ARTIFICIAL-INTELLIGENCE-AND-MACHINE-LEARNING](https://github.com/Z4FFARANI-EDUCATIONAL/2026-SEM2-GS-ARTIFICIAL-INTELLIGENCE-AND-MACHINE-LEARNING) |
| Global Solution · Cybersecurity · FIAP 2026.2 | [2026-SEM2-GS-CYBERSECURITY](https://github.com/Z4FFARANI-EDUCATIONAL/2026-SEM2-GS-CYBERSECURITY) |
| Global Solution · Physical Computing: IoT & IoB · FIAP 2026.2 | [GS-IOT](https://github.com/Z4ffarani/GS-IOT) |

---

## Tecnologias

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat-square&logo=fastify&logoColor=white)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.com)
