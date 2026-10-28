# Comunicação social, busca e seguidores — Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fazer busca, seguidores, mensagens e notificações funcionarem entre usuário↔usuário, usuário↔empresa e empresa↔empresa, com identidade, foto e tipo de conta preservados.

**Architecture:** O identificador de uma conta social é a chave composta lógica `tipoConta + contaId`. O frontend deve consumir somente os endpoints unificados de comunicação e rotas tipadas. As respostas sociais incluem nome, subtítulo, foto e tipo; a busca é normalizada sem diferenciar caixa nem acentos.

**Tech Stack:** Java 21, Spring Boot/JPA/Security, PostgreSQL/Flyway, React/Vite, Axios, Vitest/Testing Library.

**Spec:** Relato e capturas do usuário em 2026-10-28.

**Global Constraints:** Impedir seguir a própria conta; não colidir UUIDs de tipos diferentes; autorização sempre pelo JWT; compatibilidade temporária com endpoints antigos; lista e conversa devem usar o mesmo contrato.

**Review Focus:** Chaves compostas no React, simetria remetente/destinatário, empresas autenticadas, fotos em todos os DTOs e busca acento-insensível no PostgreSQL sem depender de configuração externa.

---

### Task 1: Corrigir o chat que abre com `undefined`

**Files:**
- Modify: `Help/frontend/pages/Mensagens.jsx`
- Modify: `Help/frontend/pages/Mensagens.css`
- Create: `Help/frontend/pages/Mensagens.test.jsx`
- Modify: `Help/frontend/package.json`

**Step 1: Write the failing tests**

- Conversa retornada como `{ contaId, tipoConta }` chama `GET /mensagens/conversa/{tipoConta}/{contaId}`.
- Envio inclui `destinatarioId`, `tipoDestinatario` e `conteudo`.
- Preview e conteúdo da conversa exibem a mesma mensagem.
- Chaves dos cartões usam `${tipoConta}:${contaId}`.

**Step 2: Run test to verify it fails**

Run: `cd Help/frontend && npm test -- --run Mensagens.test.jsx`

Expected: chamada atual contém `/mensagens/conversa/undefined`.

**Step 3: Write minimal implementation**

- Substituir todo `usuarioId` legado por `contaId` e `tipoConta`.
- Usar rota tipada no carregamento da conversa.
- Enviar `tipoDestinatario`.
- Manter conversa selecionada após atualizar a lista.
- Exibir `fotoUrl`, nome, subtítulo e marcador de empresa/usuário.

**Step 4: Run test to verify it passes**

Run: `cd Help/frontend && npm test -- --run Mensagens.test.jsx`

**Step 5: Commit**

```bash
git add Help/frontend/pages/Mensagens.jsx Help/frontend/pages/Mensagens.css Help/frontend/pages/Mensagens.test.jsx Help/frontend/package.json
git commit -m "fix: usa identidade tipada nas conversas"
```

### Task 2: Unificar descoberta e seguidores

**Files:**
- Modify: `Help/frontend/pages/ConfigPerfil.jsx`
- Modify: `Help/frontend/pages/ConfigPerfil.css`
- Move/Rewrite: `Help/src/test/java/com/example/Help/ConfigPerfilConexoes.test.jsx` -> `Help/frontend/pages/ConfigPerfilConexoes.test.jsx`
- Modify: `Help/src/main/java/com/example/Help/model/seguidor/SeguidorResponseDTO.java`
- Modify: `Help/src/main/java/com/example/Help/Service/SeguidorService.java`
- Test: `Help/src/test/java/com/example/Help/SeguidorServiceSocialTest.java`

**Step 1: Write the failing tests**

- Descoberta usa `/comunicacao/contatos` e retorna usuários e empresas.
- Própria conta nunca aparece.
- Seguir/deixar de seguir usa `/seguidores/{acao}/{tipoConta}/{contaId}`.
- Contadores e lista são atualizados sem a conta desaparecer por erro de chave.
- Cards exibem foto real ou fallback por iniciais.

**Step 2: Run tests to verify they fail**

Run: `cd Help/frontend && npm test -- --run ConfigPerfilConexoes.test.jsx`

Expected: frontend atual chama `/usuarios` e rotas sem tipo.

**Step 3: Write minimal implementation**

- Consumir diretório unificado.
- Normalizar objetos para `{contaId, tipoConta, nome, subtitulo, fotoUrl, seguindo}`.
- Usar chave composta em estado, lista e ações otimistas.
- Em falha, reverter somente o card afetado e manter a lista visível.
- Acrescentar foto ao DTO/listas de seguidores.

**Step 4: Run frontend and backend tests**

Run: `cd Help/frontend && npm test -- --run ConfigPerfilConexoes.test.jsx`

Run: `cd Help && mvn -Dtest=SeguidorServiceSocialTest test`

Expected: ambos aprovados.

**Step 5: Commit**

```bash
git add Help/frontend/pages/ConfigPerfil.jsx Help/frontend/pages/ConfigPerfil.css Help/frontend/pages/ConfigPerfilConexoes.test.jsx Help/src/main/java/com/example/Help/model/seguidor/SeguidorResponseDTO.java Help/src/main/java/com/example/Help/Service/SeguidorService.java Help/src/test/java/com/example/Help/SeguidorServiceSocialTest.java
git commit -m "fix: unifica seguidores de usuarios e empresas"
```

### Task 3: Tornar a busca global semelhante ao LinkedIn

**Files:**
- Modify: `Help/src/main/java/com/example/Help/Service/ParticipanteService.java`
- Modify: `Help/src/main/java/com/example/Help/model/social/ParticipanteResumoDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/social/ComunicacaoController.java`
- Create: `Help/frontend/components/GlobalSearch.jsx`
- Create: `Help/frontend/components/GlobalSearch.css`
- Create: `Help/frontend/components/GlobalSearch.test.jsx`
- Modify: `Help/frontend/pages/Feed.jsx`
- Modify: `Help/frontend/pages/ConfigPerfil.jsx`
- Modify: `Help/frontend/pages/Mensagens.jsx`
- Modify: `Help/frontend/pages/Notificacoes.jsx`
- Modify: `Help/frontend/pages/DashboardRH.jsx`
- Test: `Help/src/test/java/com/example/Help/ParticipanteAutenticadoServiceTest.java`

**Step 1: Write the failing tests**

- `José` é encontrado por `jose`, `JOSE` e `josé`.
- Resultado inclui usuários e empresas, foto e tipo.
- A conta autenticada não aparece nos resultados.
- Busca aguarda debounce, cancela resposta antiga e mostra recentes.

**Step 2: Run tests to verify they fail**

Run: `cd Help && mvn -Dtest=ParticipanteAutenticadoServiceTest test`

Run: `cd Help/frontend && npm test -- --run GlobalSearch.test.jsx`

**Step 3: Write minimal implementation**

- Normalizar Unicode com remoção de diacríticos no serviço antes da comparação.
- Retornar `fotoUrl` e identidade tipada.
- Criar componente compartilhado com debounce, estados carregando/vazio/erro e histórico local limitado.
- Ao clicar, abrir o perfil público ou iniciar conversa usando a chave tipada.
- Substituir caixas de pesquisa decorativas pelos pontos de integração reais.

**Step 4: Run tests to verify they pass**

Run: `cd Help && mvn -Dtest=ParticipanteAutenticadoServiceTest test && cd frontend && npm test -- --run GlobalSearch.test.jsx`

**Step 5: Commit**

```bash
git add Help/src/main/java/com/example/Help/Service/ParticipanteService.java Help/src/main/java/com/example/Help/model/social Help/frontend/components Help/frontend/pages Help/src/test/java/com/example/Help/ParticipanteAutenticadoServiceTest.java
git commit -m "feat: adiciona busca global de contas"
```

### Task 4: Completar notificações com origem visual

**Files:**
- Modify: `Help/src/main/java/com/example/Help/model/notificacao/NotificacaoResponseDTO.java`
- Modify: `Help/src/main/java/com/example/Help/Service/NotificacaoService.java`
- Modify: `Help/frontend/pages/Notificacoes.jsx`
- Modify: `Help/frontend/pages/Notificacoes.css`
- Modify: `Help/src/test/java/com/example/Help/NotificacaoServiceSocialTest.java`
- Create: `Help/frontend/pages/Notificacoes.test.jsx`

**Step 1: Write the failing tests**

- “Novo seguidor” inclui `origemNome`, `origemFotoUrl`, `origemId` e `origemTipo`.
- Mensagens de usuário e empresa mostram foto/nome corretos.
- Clique abre perfil ou conversa da origem tipada.

**Step 2: Run tests to verify they fail**

Run: `cd Help && mvn -Dtest=NotificacaoServiceSocialTest test`

Run: `cd Help/frontend && npm test -- --run Notificacoes.test.jsx`

**Step 3: Write minimal implementation**

- Enriquecer DTO pela conta de origem.
- Renderizar foto com fallback por iniciais e nome da origem no texto.
- Navegar usando `origemTipo + origemId`.

**Step 4: Run tests to verify they pass**

Run: `cd Help && mvn -Dtest=NotificacaoServiceSocialTest test && cd frontend && npm test -- --run Notificacoes.test.jsx`

**Step 5: Commit**

```bash
git add Help/src/main/java/com/example/Help/model/notificacao/NotificacaoResponseDTO.java Help/src/main/java/com/example/Help/Service/NotificacaoService.java Help/frontend/pages/Notificacoes.jsx Help/frontend/pages/Notificacoes.css Help/src/test/java/com/example/Help/NotificacaoServiceSocialTest.java Help/frontend/pages/Notificacoes.test.jsx
git commit -m "feat: exibe identidade da origem nas notificacoes"
```

### Task 5: Habilitar comunicação completa para empresas

**Files:**
- Modify: `Help/frontend/pages/LoginEmpresa.jsx`
- Modify: `Help/frontend/src/App.jsx`
- Modify: `Help/frontend/pages/ProteçãoRota.jsx` (ou renomear o arquivo existente com codificação quebrada)
- Modify: `Help/frontend/pages/DashboardRH.jsx`
- Test: `Help/frontend/pages/EmpresaSocial.test.jsx`
- Test: `Help/src/test/java/com/example/Help/MensagemServiceSocialTest.java`

**Step 1: Write the failing tests**

- Login da empresa salva sessão com `tipoConta=EMPRESA`.
- Empresa acessa mensagens e notificações.
- Empresa envia mensagem para usuário e empresa, mantendo tipos.
- Rotas continuam protegidas sem impedir empresa autenticada.

**Step 2: Run test to verify it fails**

Run: `cd Help/frontend && npm test -- --run EmpresaSocial.test.jsx`

**Step 3: Write minimal implementation**

- Criar sessão única a partir de `/auth/me` após qualquer login.
- Usar guarda autenticada compartilhada para feed, mensagens, notificações e perfis públicos.
- Adicionar atalhos sociais no dashboard empresarial.
- Remover dependência de `usuarioLogado` como prova exclusiva de autenticação.

**Step 4: Run tests and build**

Run: `cd Help/frontend && npm test -- --run && npm run build`

Expected: testes e build aprovados.

**Step 5: Commit**

```bash
git add Help/frontend/pages/LoginEmpresa.jsx Help/frontend/src/App.jsx Help/frontend/pages Help/frontend/pages/EmpresaSocial.test.jsx Help/src/test/java/com/example/Help/MensagemServiceSocialTest.java
git commit -m "feat: libera comunicacao social para empresas"
```
