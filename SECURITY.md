# Security Policy

Este é um projeto pessoal de portefólio, não um produto com equipa dedicada
de segurança — mas isso não significa que vulnerabilidades não sejam
levadas a sério. Esta política explica o que está coberto e como reportar
um problema.

## Versões suportadas

Não há versões numeradas nem branches de manutenção — apenas a branch
`main` é mantida ativamente. Correções de segurança são aplicadas
diretamente aí.

| Versão | Suportada |
| --- | --- |
| `main` (mais recente) | ✅ |
| Qualquer fork/commit antigo | ❌ |

## Âmbito

**Está no âmbito:**
- Código deste repositório (backend FastAPI, frontend React)
- Gestão de credenciais, CORS, validação de input, dependências

**Não está no âmbito:**
- A própria Cloudflare Radar API — reporta diretamente à Cloudflare via
  [hackerone.com/cloudflare](https://hackerone.com/cloudflare)
- Falta de rate limiting ou autenticação no backend em ambiente **local**
  — isto é uma limitação de design conhecida e documentada no
  [README](./README.md#considerações-de-segurança); o projeto assume
  execução em `localhost`, não deploy público. Se encontrares algo além
  disso, ainda assim reporta.

## Como reportar uma vulnerabilidade

Preferência, por ordem:

1. **GitHub Security Advisories** — aba
   [Security → Report a vulnerability](../../security/advisories/new)
   deste repositório. Cria um canal privado só entre nós até haver
   correção, que é o método recomendado pelo próprio GitHub.
2. Se preferires, abre uma **issue normal** só se o problema for de baixo
   risco (ex. uma dependência desatualizada sem exploit conhecido) — para
   qualquer coisa que possa ser explorável, usa sempre o canal privado
   acima em vez de issue pública.

Por favor não abras uma issue pública a divulgar detalhes de uma
vulnerabilidade ainda sem correção.

## O que esperar depois de reportar

Isto é mantido por uma pessoa, no tempo livre — não há SLA formal, mas o
compromisso é:
- confirmar receção em poucos dias
- corrigir e publicar um advisory a explicar o problema e a correção,
  dando crédito a quem reportou (a menos que peças anonimato)

## Autoavaliação de segurança já feita

Antes de qualquer report externo, já foi feita uma revisão interna ao
próprio código. Riscos identificados, o que está mitigado, e o que é uma
limitação de design conhecida (não uma vulnerabilidade por descobrir):

| Risco | Estado |
| --- | --- |
| Token exposto no browser | Mitigado — o token só existe no backend |
| Token commitado para o git | Mitigado — `.gitignore` exclui `backend/.env` |
| Fuga de detalhes internos via mensagens de erro | Mitigado — erros upstream ficam só no log do servidor; o cliente recebe uma mensagem genérica |
| XSS via dados da API | Mitigado por omissão — React escapa texto por defeito; sem `dangerouslySetInnerHTML` |
| Um endpoint em baixo a derrubar tudo | Mitigado — `Promise.allSettled` + degradação graciosa por widget |
| Backend exposto sem autenticação | **Não mitigado** — desenhado para correr em `localhost`. Se for exposto publicamente, qualquer pessoa pode chamar `/api/*` e esgotar a quota do token (open proxy). Precisaria de autenticação própria à frente |
| Sem rate limiting nos próprios endpoints | **Não mitigado** — a cache de 60s ajuda, mas não impede abuso direto do backend |
| Scope do token | Depende de usar sempre o template "Radar" (read-only), nunca um token com acesso a zonas/DNS |

## Nota sobre segredos

Se alguma vez encontrares um token, chave ou segredo exposto neste
repositório (histórico incluído), assume-o como comprometido e reporta
imediatamente pelo canal privado acima — não é preciso esperar por
confirmação antes de eu revogar a credencial do lado da Cloudflare.
