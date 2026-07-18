# Radar PT — Threat Landscape Dashboard

Dashboard de threat intelligence focado em Portugal, construído sobre a
[Cloudflare Radar API](https://developers.cloudflare.com/radar/). Mostra em
tempo real ataques DDoS (layer 3/4 e layer 7) dirigidos a Portugal, os países
de origem, adoção de IPv6, percentagem de tráfego automatizado (bots), e
anomalias de tráfego reportadas pela Cloudflare.


## Porquê este projeto

Construí isto como parte da minha transição para SOC/Blue Team analyst — o
objetivo não era só "ter um dashboard bonito", mas praticar coisas que uso
todos os dias no meu trabalho atual (correlacionar dados de segurança,
desenhar deteções, pensar em confiabilidade de um sistema de monitorização) e
aplicá-las fora do contexto fechado da minha empresa, com uma API pública de
threat intelligence real.

## Arquitetura

```
┌─────────────┐        ┌──────────────────┐        ┌────────────────────┐
│   Browser    │──HTTP──▶│  Backend FastAPI │──HTTP──▶│  Cloudflare Radar   │
│  React/Vite  │◀────────│  (proxy + cache)  │◀────────│        API          │
└─────────────┘        └──────────────────┘        └────────────────────┘
```

O frontend **nunca** fala diretamente com a Cloudflare. Todos os pedidos
passam por um backend próprio, que:

- guarda o token de API fora do alcance do browser;
- faz cache em memória (TTL de 60s) para não esgotar o rate limit da Radar
  API nem repetir chamadas desnecessárias;
- normaliza erros antes de os devolver ao cliente (ver secção de segurança).

```
backend/          FastAPI — chama a Radar API com o token e faz cache
└── app/
    ├── main.py            entrypoint + CORS
    ├── config.py          settings via .env (pydantic-settings)
    ├── radar_client.py    cliente HTTP + cache TTL
    └── routers/radar.py   endpoints consumidos pelo frontend

frontend/          React + Vite + Tailwind + Recharts
└── src/
    ├── App.jsx            fetch de dados + parsing defensivo do JSON
    ├── api.js              wrapper de chamadas ao backend
    └── components/
        ├── Header.jsx        relógio + indicador live/erro
        ├── RadarSweep.jsx     elemento assinatura: radar giratório com os
        │                      países de origem dos ataques como "blips"
        ├── AttacksTimeline.jsx  layer3 vs layer7 ao longo do tempo
        ├── StatCard.jsx
        └── AnomaliesFeed.jsx
```

## Stack técnica

**Backend:** Python, FastAPI, httpx (async), pydantic-settings
**Frontend:** React 18, Vite, Tailwind CSS, Recharts
**Fonte de dados:** Cloudflare Radar API v4 (endpoints `attacks/layer3`,
`attacks/layer7`, `http/summary/*`, `annotations`)

## Desafios técnicos resolvidos

Vale a pena documentar isto porque foram os problemas reais encontrados a
correr o projeto, não hipotéticos — e são bom material de conversa em
entrevista:

**1. Endpoint de anomalias exigia um intervalo de datas obrigatório**
O endpoint `/radar/annotations` devolvia `400 Bad Request` com
`"You must send either range or start & end dates"`. O pedido inicial não
incluía `dateRange`. Correção: adicionar o parâmetro em falta no backend.
Isto por si só não seria grave — mas revelou um segundo problema:

**2. Um único endpoint a falhar derrubava o dashboard inteiro**
O frontend usava `Promise.all()` para pedir os 6 endpoints em paralelo.
`Promise.all` rejeita assim que **uma** promessa falha, o que significava que
os outros 5 gráficos — que já tinham dados válidos — ficavam presos no
estado de erro só por causa do endpoint de anomalias. Corrigido com
`Promise.allSettled()`: cada widget processa o seu próprio resultado
independentemente, e o dashboard só mostra erro se **todos** os pedidos
falharem. Isto é o mesmo princípio de **degradação graciosa** que se espera
de qualquer painel de monitorização em produção — um SIEM não fica cego
porque um data source específico está em baixo.

**3. Rate limit / setup de ambiente**
A cache TTL de 60s no backend existe especificamente para não esgotar o
rate limit da Radar API durante o desenvolvimento, já que o frontend
re-consulta os dados a cada 5 minutos automaticamente e a cada refresh
manual da página.

## Considerações de segurança

Tratei isto como trataria qualquer serviço com uma credencial válida lá
dentro, mesmo sendo um projeto local:

| Risco | Estado |
|---|---|
| Token exposto no browser | Mitigado — o token só existe no backend |
| Token commitado para o git | Mitigado — `.gitignore` exclui `backend/.env` |
| Fuga de detalhes internos via mensagens de erro | Mitigado — erros upstream ficam só no log do servidor; o cliente recebe uma mensagem genérica |
| XSS via dados da API | Mitigado por omissão — React escapa texto por defeito; sem `dangerouslySetInnerHTML` |
| Um endpoint em baixo a derrubar tudo | Mitigado — `Promise.allSettled` + degradação graciosa por widget |
| Backend exposto sem autenticação | **Não mitigado** — desenhado para correr em `localhost`. Se for exposto publicamente, qualquer pessoa pode chamar `/api/*` e esgotar a quota do token (open proxy). Precisaria de autenticação própria à frente |
| Sem rate limiting nos próprios endpoints | **Não mitigado** — a cache de 60s ajuda, mas não impede abuso direto do backend |
| Scope do token | Depende de usar sempre o template "Radar" (read-only), nunca um token com acesso a zonas/DNS |

## Como correr localmente

### 1. Obter o token da Cloudflare Radar
1. https://dash.cloudflare.com/profile/api-tokens
2. **Create Token** → template **"Radar"** (ou custom com `Account > Radar > Read`)
3. Guarda o token — só é mostrado uma vez

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows (PowerShell: venv\Scripts\Activate.ps1)
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
copy .env.example .env       # macOS/Linux: cp .env.example .env
# edita o .env e cola o CLOUDFLARE_API_TOKEN

uvicorn app.main:app --reload --port 8000
```
Confirma em http://localhost:8000/health

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173

## Roadmap

- [ ] `/radar/bgp/hijacks` — alertas de route hijacking / BGP leaks
- [ ] Watchlist configurável de ASNs e países
- [ ] Autenticação + rate limiting para permitir deploy público
- [ ] Exportar dados normalizados em formato KQL-friendly para ingestão no
      Sentinel/Wazuh como custom log source
- [ ] Histórico local (SQLite) para séries temporais além da janela que a
      Radar API oferece por omissão

## Autor

Octávio Garcia — Cybersecurity Support Lead / Application Support Analyst,
em transição para SOC/Blue Team analyst.
[LinkedIn](#) · [GitHub](#)
