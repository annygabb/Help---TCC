# Cadastro, perfil e identidade por conta — Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir cadastro por CPF digitado, isolamento e persistência do perfil, foto única por conta e upload de certificados para usuários e empresas.

**Architecture:** A conta autenticada continua sendo identificada pelo JWT, nunca por um ID fornecido pelo navegador. Foto passa a ser atributo canônico da conta (`usuarios` ou `empresas`), e o perfil do usuário mantém sincronização temporária para compatibilidade. Certificados ficam em coluna `TEXT`, com validação explícita de tamanho antes da persistência.

**Tech Stack:** Java 21, Spring Boot, Spring Security, JPA/Hibernate, PostgreSQL/Flyway, H2 para testes locais, React/Vite, Axios, Vitest/Testing Library.

**Spec:** Relato e capturas do usuário em 2026-10-28.

**Global Constraints:** Preservar contas existentes; não misturar dados entre usuários; nunca confiar em ID de conta enviado pelo frontend para editar o próprio perfil; respostas de erro devem distinguir validação (400), duplicidade (409) e falha inesperada (500); não registrar dados sensíveis.

**Review Focus:** Migração segura em PostgreSQL, compatibilidade do H2, autorização baseada no JWT, limites de base64 e regressão em perfis existentes.

---

### Task 1: Corrigir o contrato e a experiência do CPF no cadastro

**Files:**
- Modify: `Help/frontend/pages/Cadastro.jsx`
- Create: `Help/frontend/utils/validacoes.js`
- Create: `Help/frontend/utils/validacoes.test.js`
- Modify: `Help/frontend/package.json`
- Modify: `Help/src/test/java/com/example/Help/CadastroControllerTest.java`

**Step 1: Write the failing tests**

- Testar máscara progressiva para CPF digitado e colado.
- Testar envio normalizado com apenas 11 dígitos.
- Testar que resposta 400 exibe a mensagem real de validação e que 409 identifica duplicidade.
- No backend, testar cadastro válido com CPF formatado e sem máscara.

**Step 2: Run tests to verify they fail**

Run: `cd Help/frontend && npm test -- --run`

Expected: falha porque o formulário não usa `formatarCPF`, não normaliza o envio e não possui script completo de testes.

**Step 3: Write minimal implementation**

- Mover/regularizar as validações atualmente soltas sob `src/test/java` para `frontend/utils`.
- Aplicar `formatarCPF` no `onChange`, mantendo `maxLength=14`.
- Validar localmente e enviar `apenasDigitos(cpf)`.
- Ler `error.response.data.campo`, `mensagem` e `error`; usar texto genérico apenas quando não houver resposta da API.

**Step 4: Run tests to verify they pass**

Run: `cd Help/frontend && npm test -- --run`

Expected: máscara, normalização e mensagens aprovadas.

**Step 5: Commit**

```bash
git add Help/frontend/pages/Cadastro.jsx Help/frontend/utils Help/frontend/package.json Help/src/test/java/com/example/Help/CadastroControllerTest.java
git commit -m "fix: normaliza CPF e exibe erros de cadastro"
```

### Task 2: Criar migração para foto canônica e certificados extensos

**Files:**
- Create: `Help/src/main/resources/db/migration/postgresql/V2__perfil_fotos_e_certificados.sql`
- Modify: `Help/src/main/java/com/example/Help/model/usuario/Usuario.java`
- Modify: `Help/src/main/java/com/example/Help/model/empresa/Empresa.java`
- Modify: `Help/src/main/java/com/example/Help/model/perfil/CursoPerfil.java`
- Modify: `Help/src/main/java/com/example/Help/model/perfil/Perfil.java`
- Test: `Help/src/test/java/com/example/Help/PerfilServiceTest.java`

**Step 1: Write the failing test**

- Persistir certificado maior que 255 caracteres.
- Atualizar a foto do perfil e verificar que pertence somente ao usuário autenticado.
- Verificar que a foto de uma empresa não altera a de outra conta.

**Step 2: Run test to verify it fails**

Run: `cd Help && mvn -Dtest=PerfilServiceTest test`

Expected: falha no tamanho do certificado e ausência de foto canônica nas contas.

**Step 3: Write minimal implementation**

- Adicionar `foto_url TEXT` em `usuarios` e `empresas`.
- Alterar `perfil_cursos.certificado_url` para `TEXT`.
- Copiar foto legada de `perfis` para o usuário correspondente quando a foto canônica estiver vazia.
- Mapear os campos com `@Column(columnDefinition = "TEXT")`.
- Manter `perfis.foto_url` sincronizado durante a transição para não quebrar registros existentes.

**Step 4: Run test to verify it passes**

Run: `cd Help && mvn -Dtest=PerfilServiceTest test`

Expected: foto isolada por conta e certificado persistido.

**Step 5: Commit**

```bash
git add Help/src/main/resources/db/migration/postgresql/V2__perfil_fotos_e_certificados.sql Help/src/main/java/com/example/Help/model Help/src/test/java/com/example/Help/PerfilServiceTest.java
git commit -m "fix: persiste fotos e certificados por conta"
```

### Task 3: Tornar `/perfis/me` previsível e seguro

**Files:**
- Modify: `Help/src/main/java/com/example/Help/Service/PerfilService.java`
- Modify: `Help/src/main/java/com/example/Help/model/perfil/PerfilController.java`
- Modify: `Help/src/main/java/com/example/Help/model/perfil/PerfilRequestDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/perfil/PerfilResponseDTO.java`
- Modify: `Help/src/main/java/com/example/Help/Service/RequestsExceptionHandler.java`
- Modify: `Help/frontend/pages/ConfigPerfil.jsx`
- Test: `Help/src/test/java/com/example/Help/PerfilControllerIsolationTest.java`

**Step 1: Write the failing tests**

- Usuário A edita `/perfis/me`; usuário B permanece inalterado.
- `GET /perfis/me` devolve somente o perfil associado ao principal autenticado.
- Payload excedente devolve 413 ou 400 com `campo` e `mensagem`, não 409 genérico.
- Erro da API é exibido no frontend com a mensagem devolvida.

**Step 2: Run tests to verify they fail**

Run: `cd Help && mvn -Dtest=PerfilControllerIsolationTest test`

Expected: ausência de limites/mensagens consistentes.

**Step 3: Write minimal implementation**

- Resolver identidade exclusivamente pelo `Authentication`/principal.
- Atualizar ou criar somente o perfil do usuário autenticado.
- Sincronizar `fotoUrl` na conta canônica.
- Validar MIME e tamanho de foto/certificado antes de salvar.
- Mapear violação de tamanho e validação para resposta com `campo` e `mensagem`.
- No frontend, preservar os dados do formulário quando o salvamento falhar e mostrar a razão exata.

**Step 4: Run tests to verify they pass**

Run: `cd Help && mvn -Dtest=PerfilControllerIsolationTest test`

Expected: isolamento e contrato de erro aprovados.

**Step 5: Commit**

```bash
git add Help/src/main/java/com/example/Help/Service/PerfilService.java Help/src/main/java/com/example/Help/model/perfil Help/src/main/java/com/example/Help/Service/RequestsExceptionHandler.java Help/frontend/pages/ConfigPerfil.jsx Help/src/test/java/com/example/Help/PerfilControllerIsolationTest.java
git commit -m "fix: isola e valida edicao do perfil autenticado"
```

### Task 4: Completar perfil básico da empresa

**Files:**
- Modify: `Help/src/main/java/com/example/Help/model/empresa/EmpresaPerfilRequestDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/empresa/EmpresaAtualDTO.java`
- Modify: `Help/src/main/java/com/example/Help/model/empresa/EmpresaController.java`
- Modify: `Help/frontend/pages/DashboardRH.jsx`
- Test: `Help/src/test/java/com/example/Help/EmpresaPerfilIsolationTest.java`

**Step 1: Write the failing tests**

- Empresa autenticada altera nome/foto sem afetar outra empresa nem um usuário.
- Resposta `/empresas/me` inclui a foto canônica.

**Step 2: Run test to verify it fails**

Run: `cd Help && mvn -Dtest=EmpresaPerfilIsolationTest test`

**Step 3: Write minimal implementation**

- Aceitar e devolver `fotoUrl` no perfil da empresa.
- Aplicar os mesmos limites e mensagens do perfil de usuário.
- Exibir e editar foto no dashboard da empresa.

**Step 4: Run tests and production build**

Run: `cd Help && mvn -Dtest=EmpresaPerfilIsolationTest test && cd frontend && npm run build`

Expected: testes e build aprovados.

**Step 5: Commit**

```bash
git add Help/src/main/java/com/example/Help/model/empresa Help/frontend/pages/DashboardRH.jsx Help/src/test/java/com/example/Help/EmpresaPerfilIsolationTest.java
git commit -m "feat: adiciona identidade visual ao perfil da empresa"
```
