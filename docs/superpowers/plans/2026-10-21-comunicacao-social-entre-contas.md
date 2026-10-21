# Comunicação Social Entre Contas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir mensagens, notificações e relações de seguir entre usuários e empresas, preservando os dados existentes e sem alterar o frontend neste ciclo.

**Architecture:** Usuário e empresa implementarão uma interface comum de participante social. As entidades atuais receberão referências opcionais separadas para usuário e empresa em cada ponta, com invariantes que exigem exatamente uma referência. Controllers continuarão com rotas legadas para usuário e ganharão rotas tipadas; a identidade de quem age será sempre derivada do JWT.

**Tech Stack:** Java 21, Spring Boot 3.5.10, Spring Security, Spring Data JPA, Hibernate, PostgreSQL em produção, H2 em testes, JUnit 5, MockMvc e Maven.

**Spec:** `docs/superpowers/specs/2026-10-21-comunicacao-social-entre-contas-design.md`

## Global Constraints

- Não alterar arquivos do frontend neste ciclo.
- Preservar mensagens, notificações e seguidores existentes de usuário para usuário.
- Aceitar `USUARIO` como tipo padrão nos contratos legados que não informam o tipo.
- Nunca aceitar do cliente o ID ou tipo de quem está autenticado.
- Bloquear contas inativas em busca, mensagem e seguimento.
- Usar transações para envio, leitura, seguir, deixar de seguir e geração de notificações.
- Não apagar tabelas ou registros existentes.
- Manter Java 21 e as dependências atuais, acrescentando somente o necessário para uma migração segura.
- Entregar documentação do frontend em Markdown e PDF, sem código de tela.

## Review Focus

- Um UUID igual em `usuarios` e `empresas` deve continuar representando contas diferentes; `ParticipanteAutenticadoServiceTest` e `ComunicacaoSocialIntegrationTest` fixarão tipo e ID juntos.
- `tipoDestinatario` ausente deve continuar abrindo/enviando conversa de usuário; `MensagemControllerCompatibilityTest` cobrirá o contrato legado.
- Conteúdo contendo apenas espaços deve retornar `400`, sem gravar mensagem ou notificação; `MensagemServiceSocialTest` verificará as duas tabelas.
- Duas ações concorrentes de seguir não podem criar duplicidade; `SeguidorSocialPersistenceTest` verificará a restrição lógica e o retorno `409`.
- Uma conta desativada depois de já ter conversas não poderá enviar novas mensagens, mas o outro participante ainda poderá consultar o histórico; `ComunicacaoSocialIntegrationTest` cobrirá ambos os comportamentos.

---

## Mapa de arquivos

### Novos arquivos de produção

- `Help/src/main/java/com/example/Help/model/social/TipoParticipante.java`: enum `USUARIO` e `EMPRESA`.
- `Help/src/main/java/com/example/Help/model/social/ParticipanteSocial.java`: interface comum implementada por `Usuario` e `Empresa`.
- `Help/src/main/java/com/example/Help/model/social/ParticipanteResumoDTO.java`: contrato público comum.
- `Help/src/main/java/com/example/Help/Service/ParticipanteService.java`: resolução de principal, busca ativa e diretório social.
- `Help/src/main/java/com/example/Help/Service/DiretorioSocialService.java`: composição da busca com o estado de seguimento, sem dependência circular.
- `Help/src/main/java/com/example/Help/model/social/ComunicacaoController.java`: busca autenticada de contatos.
- `Help/src/main/java/com/example/Help/model/empresa/EmpresaPerfilRequestDTO.java`: edição segura do nome público da empresa.
- `Help/src/main/resources/db/migration/postgresql/V1__comunicacao_social_entre_contas.sql`: alteração aditiva e idempotente do PostgreSQL existente.

### Arquivos de produção modificados

- `Usuario.java` e `Empresa.java`: implementação de `ParticipanteSocial`.
- `Mensagem.java`, `MensagemRepository.java`, DTOs, `MensagemService.java` e `MensagemController.java`: quatro combinações de conversa.
- `Notificacao.java`, `NotificacaoRepository.java`, DTO, enum, service e controller: destinatário usuário ou empresa.
- `Seguidor.java`, repository, DTOs, service e controller: relações entre quaisquer contas.
- `EmpresaController.java`: atualização do perfil público autenticado.
- `VagaEmpresaService.java`: aviso de nova vaga aos seguidores.
- `RequestsExceptionHandler.java`: respostas `400`, `403`, `404` e `409` coerentes.
- `pom.xml`, `application-prod.properties` e `application-test.properties`: migração PostgreSQL e isolamento do H2.

### Novos testes

- `ParticipanteAutenticadoServiceTest.java`
- `SocialSchemaMappingTest.java`
- `MensagemServiceSocialTest.java`
- `MensagemControllerCompatibilityTest.java`
- `NotificacaoServiceSocialTest.java`
- `SeguidorServiceSocialTest.java`
- `SeguidorSocialPersistenceTest.java`
- `EmpresaSocialEventsTest.java`
- `ComunicacaoSocialIntegrationTest.java`

## Task 1: Identidade social e diretório de contatos

**Files:**
- Create: `Help/src/main/java/com/example/Help/model/social/TipoParticipante.java`
- Create: `Help/src/main/java/com/example/Help/model/social/ParticipanteSocial.java`
- Create: `Help/src/main/java/com/example/Help/model/social/ParticipanteResumoDTO.java`
- Create: `Help/src/main/java/com/example/Help/Service/ParticipanteService.java`
- Create: `Help/src/main/java/com/example/Help/Service/DiretorioSocialService.java`
- Create: `Help/src/main/java/com/example/Help/model/social/ComunicacaoController.java`
- Modify: `Help/src/main/java/com/example/Help/model/usuario/Usuario.java`
- Modify: `Help/src/main/java/com/example/Help/model/empresa/Empresa.java`
- Test: `Help/src/test/java/com/example/Help/ParticipanteAutenticadoServiceTest.java`

**Interfaces:**
- Produces: `TipoParticipante { USUARIO, EMPRESA }`.
- Produces: `ParticipanteSocial#getId()`, `getTipoParticipante()`, `getNomeSocial()` e `isAtivo()`.
- Produces: `ParticipanteService.obterAutenticado(Authentication) -> ParticipanteSocial`.
- Produces: `ParticipanteService.buscarAtivo(UUID, TipoParticipante) -> ParticipanteSocial`.
- Produces: `ParticipanteService.listarAtivos(ParticipanteSocial, String, TipoParticipante) -> List<ParticipanteSocial>`.
- Produces: `DiretorioSocialService.listarContatos(ParticipanteSocial, String, TipoParticipante) -> List<ParticipanteResumoDTO>`.

- [ ] **Step 1: Escrever os testes que falham**

Criar testes `resolveUsuarioPeloPrincipal`, `resolveEmpresaPeloPrincipal`, `naoConfundeIdsIguaisDeTiposDiferentes`, `rejeitaContaInativa` e `diretorioExcluiContaAtualEInativas`.

- [ ] **Step 2: Confirmar a falha**

Run: `mvn -q -f Help/pom.xml -Dtest=ParticipanteAutenticadoServiceTest test`

Expected: FAIL porque os tipos e o serviço ainda não existem.

- [ ] **Step 3: Implementar a abstração mínima**

Fazer `Usuario` e `Empresa` implementarem `ParticipanteSocial`. No serviço, decidir pelo tipo concreto do principal; para `UserDetails`, pesquisar os dois repositórios por e-mail normalizado e exigir exatamente um resultado ativo. A busca pesquisa nome/e-mail/cargo para usuários e razão social/e-mail para empresas, sempre excluindo a conta atual.

- [ ] **Step 4: Expor `GET /comunicacao/contatos`**

Parâmetros opcionais: `busca` e `tipo`. O controller usa `DiretorioSocialService` e retorna `ParticipanteResumoDTO(UUID id, TipoParticipante tipoConta, String nome, String subtitulo, boolean seguindo)`; `seguindo` permanece `false` até Task 5 conectar o serviço de seguidores.

- [ ] **Step 5: Executar os testes**

Run: `mvn -q -f Help/pom.xml -Dtest=ParticipanteAutenticadoServiceTest test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Help/src/main/java/com/example/Help/model/social Help/src/main/java/com/example/Help/Service/ParticipanteService.java Help/src/main/java/com/example/Help/Service/DiretorioSocialService.java Help/src/main/java/com/example/Help/model/usuario/Usuario.java Help/src/main/java/com/example/Help/model/empresa/Empresa.java Help/src/test/java/com/example/Help/ParticipanteAutenticadoServiceTest.java
git commit -m "feat: adiciona identidade social para usuarios e empresas"
```

## Task 2: Schema aditivo e invariantes das relações sociais

**Files:**
- Modify: `Help/pom.xml`
- Modify: `Help/src/main/resources/application-prod.properties`
- Modify: `Help/src/test/resources/application-test.properties`
- Create: `Help/src/main/resources/db/migration/postgresql/V1__comunicacao_social_entre_contas.sql`
- Modify: `Help/src/main/java/com/example/Help/model/mensagem/Mensagem.java`
- Modify: `Help/src/main/java/com/example/Help/model/notificacao/Notificacao.java`
- Modify: `Help/src/main/java/com/example/Help/model/seguidor/Seguidor.java`
- Test: `Help/src/test/java/com/example/Help/SocialSchemaMappingTest.java`
- Test: `Help/src/test/java/com/example/Help/SeguidorSocialPersistenceTest.java`

**Interfaces:**
- Consumes: `ParticipanteSocial` e `TipoParticipante` da Task 1.
- Produces: `Mensagem#getRemetenteSocial()`, `getDestinatarioSocial()` e construtor `(ParticipanteSocial, ParticipanteSocial, String)`.
- Produces: `Notificacao#getDestinatarioSocial()` e construtor social completo.
- Produces: `Seguidor#getSeguidorSocial()`, `getSeguidoSocial()` e construtor `(ParticipanteSocial, ParticipanteSocial)`.

- [ ] **Step 1: Escrever testes de mapeamento que falham**

Verificar por reflexão os quatro vínculos de `Mensagem`, os dois destinatários de `Notificacao`, os quatro vínculos de `Seguidor`, os nomes exatos das colunas e a nulabilidade necessária. Persistir uma relação de cada combinação e rejeitar ponta vazia, ponta dupla, auto-relação e duplicidade.

- [ ] **Step 2: Confirmar a falha**

Run: `mvn -q -f Help/pom.xml -Dtest=SocialSchemaMappingTest,SeguidorSocialPersistenceTest test`

Expected: FAIL porque as referências de empresa não existem.

- [ ] **Step 3: Estender as entidades mantendo as colunas legadas**

Usar `remetente_id`/`destinatario_id`, `usuario_id` e `seguidor_id`/`seguido_id` para usuários. Acrescentar `*_empresa_id` para empresas. Implementar validação em `@PrePersist`/`@PreUpdate` exigindo XOR em cada ponta e proibindo a mesma conta nos dois lados.

- [ ] **Step 4: Criar a migração PostgreSQL idempotente**

Adicionar colunas e índices com `IF NOT EXISTS`, remover `NOT NULL` somente das colunas legadas necessárias, substituir `uk_seguidor_seguido` por índice único lógico e acrescentar checks XOR. O script deve verificar a existência das tabelas para também aceitar um banco novo, no qual o Hibernate criará o schema depois.

- [ ] **Step 5: Configurar migração apenas em produção**

Adicionar Flyway e suporte PostgreSQL no `pom.xml`; deixar `spring.flyway.enabled=false` por padrão/teste e ativar no perfil `prod` com localização `classpath:db/migration/postgresql`, `baseline-on-migrate=true` e `baseline-version=0`.

- [ ] **Step 6: Executar testes e validação de contexto**

Run: `mvn -q -f Help/pom.xml -Dtest=SocialSchemaMappingTest,SeguidorSocialPersistenceTest test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add Help/pom.xml Help/src/main/resources Help/src/main/java/com/example/Help/model/mensagem/Mensagem.java Help/src/main/java/com/example/Help/model/notificacao/Notificacao.java Help/src/main/java/com/example/Help/model/seguidor/Seguidor.java Help/src/test/java/com/example/Help/SocialSchemaMappingTest.java Help/src/test/java/com/example/Help/SeguidorSocialPersistenceTest.java
git commit -m "feat: prepara schema social para contas de empresa"
```

## Task 3: Mensagens entre todos os tipos de conta

**Files:**
- Modify: `Help/src/main/java/com/example/Help/model/mensagem/MensagemRepository.java`
- Modify: `Help/src/main/java/com/example/Help/model/mensagem/MensagemRequestDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/mensagem/MensagemResponseDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/mensagem/ConversaResponseDTO.java`
- Modify: `Help/src/main/java/com/example/Help/Service/MensagemService.java`
- Modify: `Help/src/main/java/com/example/Help/model/mensagem/MensagemController.java`
- Test: `Help/src/test/java/com/example/Help/MensagemServiceSocialTest.java`
- Test: `Help/src/test/java/com/example/Help/MensagemControllerCompatibilityTest.java`

**Interfaces:**
- Consumes: `ParticipanteService.obterAutenticado` e `buscarAtivo`.
- Produces: `MensagemRequestDTO(UUID destinatarioId, TipoParticipante tipoDestinatario, String conteudo)`, com fábrica/constructor compatível que assume `USUARIO` quando o tipo vier nulo.
- Produces: `MensagemService.enviar(ParticipanteSocial, MensagemRequestDTO)`.
- Produces: `buscarConversa(ParticipanteSocial, UUID, TipoParticipante)`, `marcarConversaComoLida(...)` e `listarConversas(ParticipanteSocial)`.

- [ ] **Step 1: Escrever testes que falham para as quatro combinações**

Cobrir U→U, U→E, E→U, E→E, autoenvio, destinatário inativo, conteúdo vazio, UUID igual com tipo diferente e ausência de gravação quando a operação falhar.

- [ ] **Step 2: Confirmar a falha**

Run: `mvn -q -f Help/pom.xml -Dtest=MensagemServiceSocialTest,MensagemControllerCompatibilityTest test`

Expected: FAIL nas combinações com empresa e nos campos de tipo.

- [ ] **Step 3: Implementar consultas sociais no repository**

Adicionar consultas de conversa, lista, não lidas e leitura que recebem separadamente IDs opcionais de usuário/empresa. Todas as condições devem comparar tipo e ID; ordenar conversa crescente e lista de conversas pela última mensagem decrescente.

- [ ] **Step 4: Implementar DTOs e service**

Adicionar tipos do remetente/destinatário nas respostas. A lista usa `contaId`, `tipoConta`, `nome`, `subtitulo`, última mensagem e contagem não lida. Validar `trim()` não vazio, mas preservar o texto original sem espaços externos.

- [ ] **Step 5: Implementar rotas tipadas e legadas**

Adicionar `GET /mensagens/conversa/{tipoConta}/{contaId}`. Manter `GET /mensagens/conversa/{usuarioId}` como usuário. Fazer `POST /mensagens/enviar` aceitar tipo ausente como usuário. Remover a dependência exclusiva de `UsuarioAutenticadoService`.

- [ ] **Step 6: Executar testes**

Run: `mvn -q -f Help/pom.xml -Dtest=MensagemServiceSocialTest,MensagemControllerCompatibilityTest test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add Help/src/main/java/com/example/Help/model/mensagem Help/src/main/java/com/example/Help/Service/MensagemService.java Help/src/test/java/com/example/Help/MensagemServiceSocialTest.java Help/src/test/java/com/example/Help/MensagemControllerCompatibilityTest.java
git commit -m "feat: habilita mensagens entre usuarios e empresas"
```

## Task 4: Notificações próprias para usuário e empresa

**Files:**
- Modify: `Help/src/main/java/com/example/Help/model/notificacao/TipoNotificacao.java`
- Modify: `Help/src/main/java/com/example/Help/model/notificacao/NotificacaoRepository.java`
- Modify: `Help/src/main/java/com/example/Help/model/notificacao/NotificacaoResponseDTO.java`
- Modify: `Help/src/main/java/com/example/Help/Service/NotificacaoService.java`
- Modify: `Help/src/main/java/com/example/Help/model/notificacao/NotificacaoController.java`
- Modify: `Help/src/main/java/com/example/Help/Service/MensagemService.java`
- Test: `Help/src/test/java/com/example/Help/NotificacaoServiceSocialTest.java`

**Interfaces:**
- Produces: tipos `EMPRESA_ATUALIZADA` e `NOVA_VAGA_EMPRESA` além dos atuais.
- Produces: `NotificacaoService.criar(ParticipanteSocial destinatario, TipoNotificacao, String, String, ParticipanteSocial origem)`.
- Produces: `criarOuAtualizar(...)`, `listar(ParticipanteSocial)`, `contarNaoLidas(ParticipanteSocial)`, `marcarComoLida(UUID, ParticipanteSocial)` e `marcarTodasComoLidas(ParticipanteSocial)`.

- [ ] **Step 1: Escrever testes que falham**

Cobrir notificação para usuário e empresa, consolidação de mensagens do mesmo remetente, isolamento ao marcar uma notificação, marcar todas somente da conta atual, origem com UUID igual/tipo diferente e histórico visível quando a origem for desativada.

- [ ] **Step 2: Confirmar a falha**

Run: `mvn -q -f Help/pom.xml -Dtest=NotificacaoServiceSocialTest test`

Expected: FAIL porque o serviço aceita somente `Usuario`.

- [ ] **Step 3: Generalizar repository e service**

Consultar destinatário por coluna de usuário ou empresa. Consolidar por destinatário, `origemId`, `origemTipo`, tipo da notificação e `lida=false`.

- [ ] **Step 4: Generalizar controller e integração com mensagens**

Substituir `UsuarioAutenticadoService` por `ParticipanteService`. Remover o fallback que devolve zero para empresa; empresa deverá receber o total real. O envio de mensagem cria notificação para qualquer tipo de destinatário.

- [ ] **Step 5: Executar testes**

Run: `mvn -q -f Help/pom.xml -Dtest=MensagemServiceSocialTest,NotificacaoServiceSocialTest test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Help/src/main/java/com/example/Help/model/notificacao Help/src/main/java/com/example/Help/Service/NotificacaoService.java Help/src/main/java/com/example/Help/Service/MensagemService.java Help/src/test/java/com/example/Help/NotificacaoServiceSocialTest.java
git commit -m "feat: entrega notificacoes para usuarios e empresas"
```

## Task 5: Seguir e deixar de seguir qualquer conta

**Files:**
- Modify: `Help/src/main/java/com/example/Help/model/seguidor/SeguidorRepository.java`
- Modify: `Help/src/main/java/com/example/Help/model/seguidor/SeguidorResponseDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/seguidor/ContagemSeguidoresDTO.java`
- Modify: `Help/src/main/java/com/example/Help/Service/SeguidorService.java`
- Modify: `Help/src/main/java/com/example/Help/model/seguidor/SeguidorController.java`
- Modify: `Help/src/main/java/com/example/Help/Service/ParticipanteService.java`
- Modify: `Help/src/main/java/com/example/Help/Service/DiretorioSocialService.java`
- Test: `Help/src/test/java/com/example/Help/SeguidorServiceSocialTest.java`

**Interfaces:**
- Produces: `SeguidorService.seguir(ParticipanteSocial, UUID, TipoParticipante)` e `deixarDeSeguir(...)`.
- Produces: `listarSeguindo(ParticipanteSocial)`, `listarSeguidores(ParticipanteSocial)`, `estaSeguindo(ParticipanteSocial, UUID, TipoParticipante)` e `contar(UUID, TipoParticipante)`.
- Updates: `ParticipanteResumoDTO.seguindo` com valor real.

- [ ] **Step 1: Escrever testes que falham**

Cobrir seguir e deixar de seguir nas quatro combinações, contadores dos dois lados, duplicidade `409`, auto-seguimento, conta inativa e criação de `NOVO_SEGUIDOR` para usuário/empresa.

- [ ] **Step 2: Confirmar a falha**

Run: `mvn -q -f Help/pom.xml -Dtest=SeguidorServiceSocialTest,SeguidorSocialPersistenceTest test`

Expected: FAIL nas combinações com empresa.

- [ ] **Step 3: Generalizar repository e service**

Todas as consultas recebem tipo e ID para cada ponta. A remoção exige relação existente. A criação chama `NotificacaoService.criar` dentro da mesma transação.

- [ ] **Step 4: Implementar rotas tipadas e preservar rotas antigas**

Adicionar `/{tipoConta}/{contaId}` para seguir, deixar de seguir, status e contagem. Rotas antigas continuam usando `USUARIO`. Listagens derivam a conta atual do JWT.

- [ ] **Step 5: Integrar o diretório social**

Fazer `DiretorioSocialService.listarContatos` consultar `SeguidorService` por um conjunto pré-carregado de relações da conta atual, evitando uma consulta por item. `ParticipanteService` permanece independente de `SeguidorService`, evitando ciclo de injeção.

- [ ] **Step 6: Executar testes**

Run: `mvn -q -f Help/pom.xml -Dtest=SeguidorServiceSocialTest,SeguidorSocialPersistenceTest,ParticipanteAutenticadoServiceTest test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add Help/src/main/java/com/example/Help/model/seguidor Help/src/main/java/com/example/Help/Service/SeguidorService.java Help/src/main/java/com/example/Help/Service/DiretorioSocialService.java Help/src/test/java/com/example/Help/SeguidorServiceSocialTest.java
git commit -m "feat: permite conexoes sociais entre todas as contas"
```

## Task 6: Avisos de atualização e publicação de empresa

**Files:**
- Create: `Help/src/main/java/com/example/Help/model/empresa/EmpresaPerfilRequestDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/empresa/EmpresaController.java`
- Modify: `Help/src/main/java/com/example/Help/Service/VagaEmpresaService.java`
- Modify: `Help/src/main/java/com/example/Help/Service/SeguidorService.java`
- Modify: `Help/src/main/java/com/example/Help/Service/NotificacaoService.java`
- Test: `Help/src/test/java/com/example/Help/EmpresaSocialEventsTest.java`

**Interfaces:**
- Produces: `PUT /empresas/me` com `EmpresaPerfilRequestDTO(String corporateName)`.
- Produces: `SeguidorService.listarParticipantesSeguidores(ParticipanteSocial) -> List<ParticipanteSocial>`.
- Produces: `NotificacaoService.notificarSeguidoresDaEmpresa(Empresa, TipoNotificacao, String, String)`.

- [ ] **Step 1: Escrever testes que falham**

Cobrir mudança real do nome público, requisição sem mudança, criação de vaga, seguidores usuários/empresas, não seguidores, seguidor inativo e consolidação de aviso não lido.

- [ ] **Step 2: Confirmar a falha**

Run: `mvn -q -f Help/pom.xml -Dtest=EmpresaSocialEventsTest test`

Expected: FAIL porque os eventos ainda não existem.

- [ ] **Step 3: Implementar atualização autenticada da empresa**

Validar nome não vazio, normalizar espaços e salvar somente a própria empresa. Gerar `EMPRESA_ATUALIZADA` apenas quando o valor público realmente mudar.

- [ ] **Step 4: Notificar nova vaga**

Depois de salvar a vaga com sucesso, gerar `NOVA_VAGA_EMPRESA` para seguidores ativos. O título da vaga e o ID serão incluídos no texto/metadata já disponível, sem enviar salário ou dados privados.

- [ ] **Step 5: Executar testes**

Run: `mvn -q -f Help/pom.xml -Dtest=EmpresaSocialEventsTest test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Help/src/main/java/com/example/Help/model/empresa Help/src/main/java/com/example/Help/Service/VagaEmpresaService.java Help/src/main/java/com/example/Help/Service/SeguidorService.java Help/src/main/java/com/example/Help/Service/NotificacaoService.java Help/src/test/java/com/example/Help/EmpresaSocialEventsTest.java
git commit -m "feat: notifica seguidores sobre atualizacoes de empresas"
```

## Task 7: Segurança, compatibilidade e integração completa

**Files:**
- Modify: `Help/src/main/java/com/example/Help/Service/RequestsExceptionHandler.java`
- Test: `Help/src/test/java/com/example/Help/ComunicacaoSocialIntegrationTest.java`
- Test: `Help/src/test/java/com/example/Help/BackendIdentityIsolationTest.java`

**Interfaces:**
- Consumes: todos os serviços e controllers anteriores.
- Produces: respostas JSON padronizadas `{ "error": "mensagem" }` para `400`, `403`, `404` e `409`.

- [ ] **Step 1: Escrever o teste ponta a ponta que falha**

Com MockMvc e H2, criar duas pessoas e duas empresas. Autenticar cada conta e executar as quatro conversas, notificações, leitura, seguir/deixar de seguir, contagens, atualização de empresa e nova vaga. Tentar ler/marcar recursos de outra conta e usar conta inativa.

- [ ] **Step 2: Confirmar a falha**

Run: `mvn -q -f Help/pom.xml -Dtest=ComunicacaoSocialIntegrationTest,BackendIdentityIsolationTest test`

Expected: FAIL até os códigos de status e regras de isolamento estarem alinhados.

- [ ] **Step 3: Centralizar códigos de erro**

Usar `ResponseStatusException` ou exceções de domínio mapeadas para: `400` entrada inválida, `401` autenticação, `403` acesso/conta inativa, `404` inexistente e `409` duplicidade. Retirar `try/catch` locais que transformem tudo em `400`.

- [ ] **Step 4: Verificar autorização das rotas**

Testar que `/mensagens/**`, `/notificacoes/**`, `/seguidores/**` e `/comunicacao/**` retornam `401` sem JWT e confirmar que a regra existente `anyRequest().authenticated()` permanece responsável por protegê-las.

- [ ] **Step 5: Executar suíte focada**

Run: `mvn -q -f Help/pom.xml -Dtest=ParticipanteAutenticadoServiceTest,SocialSchemaMappingTest,MensagemServiceSocialTest,MensagemControllerCompatibilityTest,NotificacaoServiceSocialTest,SeguidorServiceSocialTest,SeguidorSocialPersistenceTest,EmpresaSocialEventsTest,ComunicacaoSocialIntegrationTest,BackendIdentityIsolationTest test`

Expected: PASS.

- [ ] **Step 6: Executar toda a suíte backend**

Run: `mvn -f Help/pom.xml test`

Expected: BUILD SUCCESS sem teste ignorado por esta funcionalidade.

- [ ] **Step 7: Commit**

```bash
git add Help/src/main/java/com/example/Help/Service/RequestsExceptionHandler.java Help/src/test/java/com/example/Help/ComunicacaoSocialIntegrationTest.java Help/src/test/java/com/example/Help/BackendIdentityIsolationTest.java
git commit -m "test: valida isolamento da comunicacao social"
```

## Task 8: Documentação exclusiva do frontend e PDF

**Files:**
- Create: `docs/FRONTEND_COMUNICACAO_SOCIAL.md`
- Create: `docs/Documentacao_Frontend_Comunicacao_Social_HELP.pdf`

**Interfaces:**
- Consumes: contratos HTTP finais verificados nas Tasks 3–7.
- Produces: documentação sem detalhes internos de JPA, SQL ou implementação de serviços.

- [ ] **Step 1: Escrever a documentação Markdown**

Cobrir telas de caixa de entrada, conversa, busca de contatos, perfil/seguir, central de notificações e badges para usuário e empresa. Para cada tela, registrar endpoint, request, response, loading, vazio, erro, sucesso, acessibilidade, responsividade e segurança.

- [ ] **Step 2: Adicionar matriz de eventos e navegação**

Mapear `NOVA_MENSAGEM` para conversa, `NOVO_SEGUIDOR` para perfil, `EMPRESA_ATUALIZADA` para perfil da empresa e `NOVA_VAGA_EMPRESA` para a vaga. Incluir regras de atualização dos contadores sem inventar dados locais.

- [ ] **Step 3: Gerar o PDF**

Usar o skill de PDF, criar layout legível, renderizar todas as páginas em PNG e revisar cortes, tabelas, cabeçalhos, acentuação e links.

- [ ] **Step 4: Verificar que a documentação contém somente trabalho de frontend**

Run: `rg -n "Entity|Repository|JPA|Hibernate|SQL|Flyway|PostgreSQL" docs/FRONTEND_COMUNICACAO_SOCIAL.md`

Expected: nenhuma ocorrência explicando tarefa interna de backend; nomes podem aparecer apenas se indispensáveis em um aviso de dependência, preferencialmente não aparecem.

- [ ] **Step 5: Commit**

```bash
git add docs/FRONTEND_COMUNICACAO_SOCIAL.md docs/Documentacao_Frontend_Comunicacao_Social_HELP.pdf
git commit -m "docs: orienta frontend da comunicacao social"
```

## Task 9: Verificação de entrega

**Files:**
- Modify somente arquivos necessários caso a verificação encontre defeito.

**Interfaces:**
- Consumes: implementação e documentação completas.
- Produces: evidência reproduzível de compilação, testes e artefatos.

- [ ] **Step 1: Verificar diferenças e arquivos sensíveis**

Run: `git diff origin/main...HEAD --check && git status --short && git diff origin/main...HEAD -- . ':!docs/*.pdf'`

Expected: sem whitespace inválido, sem `.env`, token, senha ou arquivo de banco.

- [ ] **Step 2: Executar testes e empacotamento limpo**

Run: `mvn -f Help/pom.xml clean test && mvn -f Help/pom.xml -DskipTests package`

Expected: dois `BUILD SUCCESS` e JAR criado em `Help/target/`.

- [ ] **Step 3: Validar o PDF renderizado**

Renderizar novamente o PDF final e conferir número de páginas, texto extraível, links e ausência de cortes.

- [ ] **Step 4: Revisar compatibilidade**

Executar especificamente os testes antigos de identidade, perfil, login, cadastro e vagas junto aos novos testes sociais.

- [ ] **Step 5: Commit de correções finais, se houver**

```bash
git add -u
git commit -m "fix: conclui verificacao da comunicacao social"
```

- [ ] **Step 6: Preparar integração**

Apresentar resumo dos commits, testes executados, riscos de migração e instruções de deploy Railway. Não fazer push ou merge sem autorização explícita da usuária.
