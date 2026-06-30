# Diarista Perto de Mim — Fase 1

Site otimizado para SEO que gera uma página por bairro de São Paulo
(ex.: `/diarista/pinheiros`) e conecta clientes a diaristas pelo WhatsApp.
Feito em **Next.js + Tailwind**, pronto para **Vercel + Supabase**.

> **O que já está pronto:** página inicial, 41 páginas de bairro geradas
> automaticamente (com título, descrição e dados estruturados para o Google),
> sitemap.xml, robots.txt, e o banco de dados do Supabase.
>
> **O que vem na Fase 2:** o chatbot com IA (OpenAI) para captar e distribuir
> os leads. Por enquanto, o botão leva ao seu WhatsApp.

---

## ⚠️ Antes de tudo: troque o seu WhatsApp

Abra o arquivo `lib/site.ts` e troque o número em `whatsapp` pelo seu, no
formato internacional, só números (ex.: `5511987654321`). É para lá que os
clientes serão enviados.

---

## Parte 1 — Subir o site no ar (15 min)

Você não precisa saber programar para isso. São basicamente cliques.

### 1.1 Coloque o código no GitHub
1. Crie um repositório novo (vazio) no [github.com](https://github.com), ex.: `diarista-perto-de-mim`.
2. No seu computador, dentro desta pasta, rode no terminal:
   ```bash
   git init
   git add .
   git commit -m "Fase 1"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/diarista-perto-de-mim.git
   git push -u origin main
   ```
   (Troque `SEU-USUARIO`.)

### 1.2 Publique na Vercel
1. Entre na [vercel.com](https://vercel.com) e clique em **Add New > Project**.
2. Escolha o repositório que você acabou de subir.
3. A Vercel detecta o Next.js sozinho. **Não mude nada**, só clique em **Deploy**.
4. Em ~1 minuto o site está no ar num endereço `...vercel.app`. 🎉

### 1.3 Ligue o seu domínio
1. No projeto da Vercel: **Settings > Domains**.
2. Adicione `diaristapertodemim.com.br` e `www.diaristapertodemim.com.br`.
3. A Vercel mostra os registros DNS. No painel do **registro.br**, aponte o
   domínio para a Vercel (geralmente um registro **A** e um **CNAME**, conforme
   a tela indicar). Pode levar algumas horas para propagar.

---

## Parte 2 — Configurar o banco (Supabase)

Necessário para a Fase 2, mas já deixe pronto.

1. No [Supabase](https://supabase.com), abra seu projeto.
2. Vá em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique **Run**.
3. Depois cole o conteúdo de `supabase/seed-bairros.sql` e **Run** (carrega os 41 bairros).
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.

---

## Parte 3 — Variáveis de ambiente

Na Vercel, em **Settings > Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://diaristapertodemim.com.br` |
| `NEXT_PUBLIC_SUPABASE_URL` | a Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a anon key do Supabase |

Depois de adicionar, clique em **Redeploy** para o site reconstruir com elas.
(O arquivo `.env.example` lista todas. Para rodar localmente, copie-o para `.env`.)

---

## Parte 4 — Avisar o Google (importante para SEO)

1. Entre no [Google Search Console](https://search.google.com/search-console).
2. Adicione a propriedade `diaristapertodemim.com.br` e confirme que é sua.
3. Em **Sitemaps**, envie: `sitemap.xml`.
4. Pronto — o Google vai começar a descobrir suas 41 páginas de bairro.

> Ranquear leva semanas. Por isso colocamos as páginas no ar já na Fase 1:
> o relógio do Google começa a contar agora.

---

## Rodar no seu computador (opcional)

Precisa do [Node.js](https://nodejs.org) instalado. Então:
```bash
npm install
npm run dev
```
Abra `http://localhost:3000`.

---

## Estrutura do projeto

```
app/
  page.tsx                  → página inicial
  diarista/[bairro]/page.tsx → a página de SEO de cada bairro (o motor de crescimento)
  sitemap.ts / robots.ts    → mapa do site para o Google
lib/
  bairros.ts                → a LISTA DE BAIRROS. Edite aqui para adicionar bairros.
  site.ts                   → nome, domínio e WhatsApp do site.
  supabase.ts               → conexão com o banco (usada na Fase 2).
components/                 → cabeçalho, rodapé, botão, FAQ, etc.
supabase/
  schema.sql                → cria as tabelas no Supabase.
  seed-bairros.sql          → carrega os bairros no banco.
```

### Como adicionar um bairro novo
Abra `lib/bairros.ts`, copie uma linha, troque `nome`, `slug` e `zona`, salve e
faça `git push`. A Vercel reconstrói e a nova página entra no ar e no sitemap
sozinha. (O `slug` é o nome em minúsculas, sem acento e com hífens.)
