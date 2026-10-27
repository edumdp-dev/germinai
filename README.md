# GerminAI

Site e comunidade do Instituto GerminAI. React + Vite no front, Cloudflare Workers + D1 na API.

- `src/` e `worker/`: site e API.
- `packages/design-system/`: `@germinai/design-system`, componentes e tokens (workspace npm).
- `migrations/`: esquema do D1.

## Rodando localmente

```bash
npm install            # instala e compila o design system
cp .dev.vars.example .dev.vars   # ou crie .dev.vars com AUTH_SECRET=qualquer-texto-longo
npx wrangler d1 migrations apply germinai-community --local
npm run build
npm run dev:api        # API em :8787
npm run dev            # site em :5173, com proxy para /api
```

Sem `RESEND_API_KEY` o login por e-mail não envia mensagens; o resto funciona.

## Contribuindo

1. Faça um fork e crie uma branch.
2. `npm run build` precisa passar. `npm test` roda os testes do Worker.
3. Abra um PR descrevendo o que mudou e por quê. Todo PR é revisado antes do merge.

Nunca inclua chaves ou o conteúdo de `.dev.vars` em commits. O deploy em produção é feito pelos mantenedores.
