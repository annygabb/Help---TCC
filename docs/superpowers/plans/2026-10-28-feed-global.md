# Feed global e permissões de comentários — Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persistir publicações no backend e mostrá-las a todas as contas da plataforma, deixando a restrição somente nas opções de comentário: todos, seguidores ou desativado.

**Architecture:** Publicações pertencem a um autor social tipado (usuário ou empresa) e são armazenadas no PostgreSQL. A listagem é global e cronológica; o backend calcula `podeComentar` para a conta autenticada usando a opção da publicação e a relação de seguidores. O frontend deixa de guardar posts exclusivamente em estado local.

**Tech Stack:** Java 21, Spring Boot/JPA/Security, PostgreSQL/Flyway, React/Vite, Axios, Vitest/Testing Library.

**Spec:** Relato do usuário em 2026-10-28.

**Global Constraints:** Não aceitar autor enviado pelo cliente; preço/segredos não se aplicam ao feed; limitar tamanho e tipos de mídia; manter ordenação estável; contas de usuário e empresa usam o mesmo contrato.

**Review Focus:** Visibilidade global versus permissão de comentário, autorização do autor, tamanho de mídia, paginação e ausência de dados fixos.

---

### Task 1: Modelar e migrar publicações globais

**Files:**
- Create: `Help/src/main/resources/db/migration/postgresql/V3__publicacoes_globais.sql`
- Create: `Help/src/main/java/com/example/Help/model/publicacao/Publicacao.java`
- Create: `Help/src/main/java/com/example/Help/model/publicacao/PermissaoComentario.java`
- Create: `Help/src/main/java/com/example/Help/model/publicacao/PublicacaoRepository.java`
- Create: `Help/src/main/java/com/example/Help/model/publicacao/PublicacaoRequestDTO.java`
- Create: `Help/src/main/java/com/example/Help/model/publicacao/PublicacaoResponseDTO.java`
- Create: `Help/src/test/java/com/example/Help/PublicacaoRepositoryTest.java`

**Step 1: Write the failing test**

- Persistir autor usuário e autor empresa sem misturar IDs.
- Ordenar por criação decrescente.
- Aceitar permissões `TODOS`, `SEGUIDORES`, `DESATIVADO`.

**Step 2: Run test to verify it fails**

Run: `cd Help && mvn -Dtest=PublicacaoRepositoryTest test`

Expected: modelo/repositório ainda inexistentes.

**Step 3: Write minimal implementation**

- Criar tabela com autor tipado, texto, mídia opcional em `TEXT`, permissão de comentário e timestamps.
- Criar índices para data e autor.
- Mapear entidade e DTOs.

**Step 4: Run test to verify it passes**

Run: `cd Help && mvn -Dtest=PublicacaoRepositoryTest test`

**Step 5: Commit**

```bash
git add Help/src/main/resources/db/migration/postgresql/V3__publicacoes_globais.sql Help/src/main/java/com/example/Help/model/publicacao Help/src/test/java/com/example/Help/PublicacaoRepositoryTest.java
git commit -m "feat: modela publicacoes globais"
```

### Task 2: Implementar serviço e API do feed

**Files:**
- Create: `Help/src/main/java/com/example/Help/Service/PublicacaoService.java`
- Create: `Help/src/main/java/com/example/Help/model/publicacao/PublicacaoController.java`
- Modify: `Help/src/main/java/com/example/Help/model/recuperacao/SecurityConfig.java`
- Create: `Help/src/test/java/com/example/Help/PublicacaoServiceTest.java`
- Create: `Help/src/test/java/com/example/Help/PublicacaoControllerTest.java`

**Step 1: Write the failing tests**

- Toda conta autenticada lista todas as publicações, mesmo sem seguir o autor.
- Autor é obtido do JWT, ignorando qualquer ID do payload.
- `TODOS` permite comentário; `SEGUIDORES` permite apenas quem segue o autor; `DESATIVADO` bloqueia.
- Usuário e empresa podem publicar.
- Mídia inválida ou grande retorna erro claro.

**Step 2: Run tests to verify they fail**

Run: `cd Help && mvn -Dtest=PublicacaoServiceTest,PublicacaoControllerTest test`

**Step 3: Write minimal implementation**

- Criar `GET /publicacoes` paginado e `POST /publicacoes` autenticado.
- Enriquecer autor com nome, foto, subtítulo e tipo.
- Consultar `SeguidorRepository` somente para calcular `podeComentar`.
- Manter feed protegido para contas cadastradas; caso seja desejado acesso realmente anônimo, criar decisão separada de privacidade e endpoint público sanitizado.

**Step 4: Run tests to verify they pass**

Run: `cd Help && mvn -Dtest=PublicacaoServiceTest,PublicacaoControllerTest test`

**Step 5: Commit**

```bash
git add Help/src/main/java/com/example/Help/Service/PublicacaoService.java Help/src/main/java/com/example/Help/model/publicacao Help/src/main/java/com/example/Help/model/recuperacao/SecurityConfig.java Help/src/test/java/com/example/Help/PublicacaoServiceTest.java Help/src/test/java/com/example/Help/PublicacaoControllerTest.java
git commit -m "feat: adiciona API do feed global"
```

### Task 3: Integrar criação e listagem no frontend

**Files:**
- Modify: `Help/frontend/pages/Feed.jsx`
- Modify: `Help/frontend/pages/Feed.css`
- Modify: `Help/frontend/pages/CriarPublicacao.jsx`
- Modify: `Help/frontend/pages/CriarPublicacao.css`
- Create: `Help/frontend/pages/Feed.test.jsx`
- Create: `Help/frontend/pages/CriarPublicacao.test.jsx`

**Step 1: Write the failing tests**

- Feed carrega `GET /publicacoes` e não depende do post fixo.
- Nova publicação chama API e aparece para outra sessão após recarregar.
- Não existe seletor de visibilidade do post; existe somente permissão de comentário.
- Foto/nome/tipo do autor vêm da API.
- Estado vazio, carregamento e erro são acessíveis e compreensíveis.

**Step 2: Run tests to verify they fail**

Run: `cd Help/frontend && npm test -- --run Feed.test.jsx CriarPublicacao.test.jsx`

Expected: feed atual é local e contém publicação estática.

**Step 3: Write minimal implementation**

- Substituir estado sem persistência por chamadas à API.
- Publicar texto/mídia e `permissaoComentario`.
- Atualizar a lista após sucesso sem duplicar post.
- Exibir visual consistente para usuários e empresas.
- Desabilitar ação de comentar quando `podeComentar=false`, explicando o motivo.

**Step 4: Run tests and build**

Run: `cd Help/frontend && npm test -- --run && npm run build`

Expected: testes e build aprovados.

**Step 5: Commit**

```bash
git add Help/frontend/pages/Feed.jsx Help/frontend/pages/Feed.css Help/frontend/pages/CriarPublicacao.jsx Help/frontend/pages/CriarPublicacao.css Help/frontend/pages/Feed.test.jsx Help/frontend/pages/CriarPublicacao.test.jsx
git commit -m "feat: integra feed global persistente"
```

### Task 4: Verificação ponta a ponta e implantação

**Files:**
- Create: `Help/docs/TESTE_SOCIAL_PONTA_A_PONTA.md`
- Modify: `README.md`

**Step 1: Write the acceptance matrix**

Cobrir pelo menos quatro contas: usuário A, usuário B, empresa X e empresa Y. Para cada par, verificar busca, seguir/deixar de seguir, notificação, mensagem, foto e publicação global.

**Step 2: Run complete verification**

Run: `cd Help && mvn test`

Run: `cd Help/frontend && npm test -- --run && npm run build`

Expected: tudo aprovado; nenhuma chamada contém `undefined`; nenhuma resposta 409 ocorre em edição válida.

**Step 3: Deploy backend first**

- Publicar migrações e backend no Railway.
- Confirmar healthcheck, Flyway V2/V3 e endpoints com duas contas de teste.

**Step 4: Deploy frontend second**

- Publicar Vercel apontando para o backend atualizado.
- Repetir matriz em janela anônima e dispositivo diferente.

**Step 5: Commit**

```bash
git add Help/docs/TESTE_SOCIAL_PONTA_A_PONTA.md README.md
git commit -m "docs: adiciona roteiro de validacao social"
```
