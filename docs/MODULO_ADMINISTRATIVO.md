# Módulo administrativo do HELP

## Objetivo

Este documento registra de forma direta o que já existe no painel administrativo, o que foi ajustado nos perfis e o que ainda falta para a administração funcionar de ponta a ponta com segurança.

> A análise detalhada exclusivamente do frontend administrativo está em [PENDENCIAS_FRONTEND_ADMIN.md](./PENDENCIAS_FRONTEND_ADMIN.md).

## Perfis de usuários: como era antes

O cadastro, a área social e a tela de perfil usavam caminhos diferentes para acessar a mesma pessoa.

- O cadastro gravava o nome na coluna `nome`.
- A entidade usada por mensagens, seguidores e busca tentava ler `name` sem apontar para a coluna `nome`.
- A configuração carregava a maior parte dos dados do `localStorage`, e não do banco.
- O endpoint de perfil usava uma lista em memória com um perfil mock da Anny.
- O feed começava com nome, cargo, empresa, localização e foto pessoais definidos diretamente no código.
- A atualização não persistia experiências, cursos e foto como um perfil individual.

Por isso, uma nova conta podia visualizar dados da Anny. A busca também podia mostrar `?` ou não localizar pessoas.

## Perfis de usuários: como fica agora

- `Usuario.name` usa explicitamente a coluna `nome`, igual ao cadastro.
- `GET /perfis/me` devolve somente o perfil do usuário autenticado.
- `PUT /perfis/me` altera somente o perfil do usuário autenticado.
- O identificador enviado pelo navegador não decide qual conta será alterada.
- Perfil, experiências e cursos são persistidos no PostgreSQL.
- Nome, cargo, localização e biografia são sincronizados com a entidade social usada por busca, mensagens e seguidores.
- O feed consulta o perfil atual no backend e usa imagem genérica quando a conta não possui foto.
- Nome, empresa, cargo, cidade e foto da Anny foram retirados dos valores padrão.
- O e-mail aparece como somente leitura na edição do perfil.

A conta oficial da Anny continua existindo. Os dados dela serão exibidos somente quando ela entrar na própria conta e salvar o próprio perfil.

## O que já existe no frontend administrativo

O frontend possui uma base visual em `frontend/pages/admin`.

### Proteção e estrutura

- `AdminRoute.jsx` verifica a sessão, consulta `/auth/me` e libera a área quando `tipoConta` é `ADMIN`.
- `AdminLayout.jsx` oferece menu lateral, cabeçalho, navegação responsiva e saída.
- Há rotas para visão geral, usuários, detalhes do usuário, empresas e detalhes da empresa.
- `adminService.js` centraliza token, filtros, paginação e mensagens de erro.

A proteção do React melhora a experiência, mas não substitui a autorização no backend. Todos os endpoints `/admin/**` precisam exigir `ROLE_ADMIN` no servidor.

### Visão geral

`AdminHome.jsx` está preparada para mostrar total de contas, candidatos, administradores, empresas, contas inativas e empresas inativas. Os cartões esperam dados de `GET /admin/resumo`.

### Administração de usuários

`AdminUsuarios.jsx` já possui busca com atraso de digitação, filtros, paginação, detalhes, ativação/desativação, bloqueio visual da própria conta e estados de carregamento, vazio, sucesso e falha.

`AdminUsuarioDetalhe.jsx` espera nome, e-mail, tipo, status, cargo, localização, CPF mascarado, cadastro, conexões e histórico administrativo.

### Administração de empresas

`AdminEmpresas.jsx` já possui busca por razão social, CNPJ ou e-mail, filtro por status, paginação, detalhes e ativação/desativação.

`AdminEmpresaDetalhe.jsx` está preparada para mostrar dados corporativos e histórico administrativo.

## Contratos de backend aguardados pelo frontend

| Método | Rota | Finalidade |
| --- | --- | --- |
| GET | `/auth/me` | Identificar a conta autenticada e sua função |
| GET | `/admin/resumo` | Preencher os cartões da visão geral |
| GET | `/admin/contas` | Listar contas com busca, tipo, status e paginação |
| GET | `/admin/contas/{id}` | Consultar detalhes de uma conta |
| PATCH | `/admin/contas/{id}/status` | Ativar ou desativar uma conta |
| GET | `/admin/empresas` | Listar empresas com busca, status e paginação |
| GET | `/admin/empresas/{id}` | Consultar detalhes de uma empresa |
| PATCH | `/admin/empresas/{id}/status` | Ativar ou desativar uma empresa |

As listagens esperam o formato de página do Spring: `content`, `number`, `totalPages` e `totalElements`.

## O que falta no frontend de administração

### Prioridade essencial

1. **Ligar as telas a endpoints reais.** As páginas chamam as rotas acima, mas o backend administrativo ainda precisa fornecê-las.
2. **Tratar conta desativada durante a sessão.** Ao receber `401` ou `403`, limpar a sessão e encaminhar para o login.
3. **Usar confirmação com justificativa.** Substituir `window.confirm` por modal acessível que peça o motivo da ação.
4. **Mostrar permissão e acesso negado claramente.** Criar uma página própria em vez de redirecionar silenciosamente.
5. **Padronizar retorno de ações.** Usar notificações consistentes para sucesso e falha.

### Prioridade funcional

1. Mostrar foto, biografia, experiências e cursos no detalhe do usuário, apenas para consulta.
2. Mostrar vagas ativas, responsável e última atividade no detalhe da empresa.
3. Manter busca, página e filtros na URL.
4. Permitir ordenação por nome, cadastro e status.
5. Tratar separadamente falta de permissão, registro inexistente e conflito.
6. Melhorar o estado de carregamento sem deslocar o layout.
7. Confirmar ações destrutivas com motivo e resumo do impacto.

### Próximos módulos

Ainda não existem telas administrativas para:

- vagas;
- cursos;
- matrículas;
- pagamentos e estornos;
- denúncias e moderação;
- conteúdo denunciado;
- falhas de e-mail;
- auditoria geral;
- configurações da plataforma.

Esses módulos devem entrar depois que identidade, permissão e auditoria estiverem consolidadas.

### Qualidade e acessibilidade

Ainda faltam:

- testes de componentes para filtros, paginação e respostas `401`, `403` e `404`;
- teste completo do fluxo de administrador;
- foco correto nos futuros modais;
- operação completa por teclado;
- textos acessíveis para botões com ícone;
- revisão de contraste e tabelas em telas pequenas;
- prevenção de envios repetidos.

## O que falta no backend administrativo

### Identidade e autorização

- armazenar tipo e status da conta;
- incluir a função correta nas autoridades do Spring Security;
- emitir a função no fluxo de autenticação;
- proteger `/admin/**` com `ROLE_ADMIN`;
- impedir acesso administrativo por candidato ou empresa;
- impedir a desativação da própria conta;
- impedir a desativação do último administrador ativo.

Hoje as entidades de pessoa retornam sempre `ROLE_USER` e `isEnabled()` retorna `true`. Para a desativação funcionar, o status deve estar no banco e ser respeitado no login e nas requisições autenticadas.

### Dados e privacidade

- criar DTOs próprios para o painel;
- nunca retornar senha, hash, token ou CPF completo;
- mascarar CPF e CNPJ quando possível;
- limitar busca, página e ordenação;
- evitar dados sensíveis nos logs.

### Auditoria

Cada ação deve registrar administrador, registro afetado, ação, estado anterior e posterior, motivo, data/hora e identificador técnico da requisição. A auditoria deve ser escrita pelo backend.

## Ordem recomendada

### Etapa 1 — acesso seguro

- adicionar função e status às contas;
- implementar `/auth/me`;
- proteger `/admin/**`;
- bloquear contas inativas;
- criar testes de autorização.

### Etapa 2 — usuários

- implementar resumo e listagem paginada;
- implementar detalhes com CPF mascarado;
- ativar/desativar com motivo;
- registrar histórico;
- validar as telas existentes.

### Etapa 3 — empresas

- implementar listagem e detalhes;
- implementar status real;
- bloquear operações de empresa inativa;
- definir o efeito sobre vagas ativas;
- registrar histórico.

### Etapa 4 — acabamento do frontend

- trocar `window.confirm` por modal;
- criar página de acesso negado;
- manter filtros na URL;
- completar testes e acessibilidade;
- adicionar novas áreas quando necessário.

## Critérios para considerar o módulo pronto

- [ ] Usuário comum recebe `403` em qualquer rota administrativa.
- [ ] Administrador ativo consulta dados paginados.
- [ ] Conta desativada não entra nem continua usando JWT antigo.
- [ ] Administrador não desativa a própria conta nem o último administrador.
- [ ] CPF, senhas e tokens não aparecem nas respostas.
- [ ] Alteração de status exige motivo e gera auditoria.
- [ ] Busca, filtros, paginação e detalhes usam PostgreSQL.
- [ ] As telas tratam carregamento, vazio, rede, sessão expirada e acesso negado.
- [ ] Testes do backend comprovam autorização e isolamento.
- [ ] Testes do frontend comprovam os principais fluxos.
