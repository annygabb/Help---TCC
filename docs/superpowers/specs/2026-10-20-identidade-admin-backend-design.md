# Especificação — Backend de identidade, isolamento e administração do HELP

**Data:** 20 de outubro de 2026  
**Repositório:** `annygabb/Help---TCC`

## 1. Objetivo

Estabilizar o backend para que usuários, empresas e administradores sejam identificados corretamente, tenham dados próprios e não alterem nem recebam informações pertencentes a outras contas.

A implementação deve preservar os registros existentes no PostgreSQL usado pelo Railway e continuar compatível com as rotas públicas já utilizadas pelo frontend.

## 2. Limite desta implementação

### Código que será alterado

Somente o backend Spring Boot:

- autenticação e JWT;
- cadastro e login de usuários;
- cadastro e login de empresas;
- perfil individual;
- mensagens;
- seguidores;
- dados pertencentes às empresas;
- endpoints administrativos;
- modelos, repositórios, serviços, controllers e testes do backend.

### Código que não será alterado

Nenhum arquivo funcional do frontend será modificado nesta etapa.

As pendências do frontend administrativo serão entregues em uma documentação separada e em PDF. O documento deverá conter somente itens de frontend que ainda faltam.

## 3. Situação encontrada

### 3.1 Duas entidades para a mesma tabela

As classes `Cadastro` e `Usuario` estão configuradas como entidades JPA da tabela `usuarios`. O cadastro e o login principal usam `CadastroRepository`, enquanto perfil, mensagens, seguidores e outras funcionalidades usam `UsuarioRepository`.

Isso permite que a mesma conta percorra representações diferentes durante uma única sessão e torna a resolução do usuário dependente da ordem de consulta dos repositórios.

### 3.2 Sessão sem identidade explícita

O JWT possui o e-mail como assunto, mas não informa claramente:

- ID da conta;
- tipo da conta;
- papel de acesso;
- situação ativa ou desativada.

O filtro tenta localizar a conta em mais de um repositório. Esse comportamento pode autenticar uma representação diferente da usada pelo recurso solicitado.

### 3.3 Perfil individual parcialmente isolado

Os endpoints `GET /perfis/me` e `PUT /perfis/me` já usam a autenticação para obter o ID do usuário. A associação `Perfil.usuario` também é única.

Essa base será preservada, mas deverá passar a receber sempre a identidade canônica do usuário autenticado.

### 3.4 Empresas sem endpoint de identidade própria

O login da empresa retorna apenas o token. Não existe um contrato equivalente a `/empresas/me` para carregar ID, razão social, e-mail e estado da empresa autenticada.

Também será necessário verificar todos os recursos corporativos para garantir que consultas e alterações sejam limitadas à empresa do JWT.

### 3.5 Backend administrativo ausente

O frontend administrativo espera endpoints `/auth/me` e `/admin/**`, mas eles ainda não existem no backend.

As contas atuais também não possuem uma representação persistida e consistente de tipo de conta, estado ativo e histórico administrativo.

## 4. Arquitetura aprovada

## 4.1 Usuário como identidade única de pessoas

A entidade `Usuario` será a fonte única das contas de pessoas.

As rotas públicas existentes serão preservadas para não quebrar o frontend:

- `POST /api/usuarios/cadastrar`;
- `POST /api/usuarios/login`;
- rotas equivalentes que ainda forem necessárias por compatibilidade.

Os DTOs de cadastro podem continuar existindo, mas `Cadastro` deixará de representar uma segunda identidade persistente da mesma tabela.

### Resultado esperado

Cadastro, login, perfil, mensagens, seguidores e administração consultarão a mesma entidade e o mesmo ID.

## 4.2 E-mail canônico

Todo e-mail será:

1. validado;
2. aparado;
3. convertido para letras minúsculas antes de salvar;
4. procurado sem diferença entre maiúsculas e minúsculas.

A conta oficial considerada nesta especificação é:

`annygabbyoficial@gmail.com`

O e-mail será usado apenas para localizar e classificar a conta existente. Nome, cargo, perfil, experiências e demais dados da Anny não serão usados como valores padrão de novas contas.

Se o registro oficial não existir no banco de produção, a aplicação não criará uma conta silenciosamente sem senha e CPF. O log indicará a ausência para que a conta seja cadastrada ou migrada de maneira válida.

## 4.3 Tipos e estado das contas

Usuários terão tipo persistido:

- `CANDIDATO`;
- `ADMIN`.

Empresas continuarão como contas corporativas com papel `EMPRESA`.

Usuários e empresas terão estado ativo. Uma conta desativada não poderá autenticar nem continuar utilizando um JWT antigo.

A conta oficial poderá ser promovida a administradora por configuração do ambiente, usando uma lista de e-mails administrativos. Nenhum segredo ou senha será colocado no código.

## 4.4 JWT e autenticação

O token passará a carregar informações suficientes para resolver a conta correta:

- ID;
- e-mail canônico;
- tipo da conta.

O filtro de segurança deverá:

1. validar assinatura e expiração;
2. identificar o tipo da conta;
3. buscar somente no repositório correspondente;
4. verificar se a conta continua ativa;
5. preencher o contexto com a identidade correta;
6. rejeitar token inválido, expirado ou pertencente a conta desativada.

## 4.5 Endpoint de sessão

Será criado:

### `GET /auth/me`

Retorno comum:

```json
{
  "id": "uuid",
  "nome": "Nome da conta",
  "email": "email@dominio.com",
  "tipoConta": "CANDIDATO",
  "ativo": true
}
```

Para empresas, `tipoConta` será `EMPRESA`; para administradores, `ADMIN`.

Também será criado ou preservado um endpoint corporativo próprio:

### `GET /empresas/me`

Ele retornará apenas os dados da empresa autenticada.

## 4.6 Isolamento dos perfis

As regras serão:

- o perfil será localizado por `usuario_id`;
- haverá no máximo um perfil para cada usuário;
- `/perfis/me` ignorará qualquer ID fornecido pelo navegador;
- atualizações usarão somente o ID autenticado;
- criar um perfil nunca copiará dados de outra conta;
- listas internas de experiências e cursos pertencerão ao perfil correto;
- respostas não incluirão senha, CPF integral ou dados internos desnecessários.

## 4.7 Mensagens e seguidores

O remetente e o seguidor serão sempre obtidos do JWT.

O backend não aceitará que o frontend escolha:

- quem está enviando a mensagem;
- quem está seguindo;
- qual conta está executando a ação.

Testes deverão comprovar que:

- usuário A não lê conversa entre B e C;
- usuário A não envia mensagem em nome de B;
- usuário A não altera seguidores de B;
- a busca de pessoas não substitui dados de uma conta pelos dados de outra.

## 4.8 Isolamento das empresas

Recursos corporativos deverão possuir uma associação obrigatória com a empresa proprietária.

As consultas de criação, atualização, encerramento e exclusão deverão utilizar a empresa autenticada. Informar o ID de outra empresa na URL ou no corpo não concederá acesso.

Os testes usarão duas empresas independentes para comprovar que:

- empresa A não altera vagas da empresa B;
- empresa A não recebe dados privados da empresa B;
- cada painel carrega seus próprios dados;
- administradores podem consultar ambas somente pelas rotas administrativas.

## 4.9 Módulo administrativo do backend

Serão implementados os contratos já esperados pelo frontend:

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| GET | `/auth/me` | Identificar a conta autenticada |
| GET | `/admin/resumo` | Indicadores de usuários e empresas |
| GET | `/admin/contas` | Listar e filtrar contas de pessoas |
| GET | `/admin/contas/{id}` | Consultar detalhes de uma conta |
| PATCH | `/admin/contas/{id}/status` | Ativar ou desativar uma conta |
| GET | `/admin/empresas` | Listar e filtrar empresas |
| GET | `/admin/empresas/{id}` | Consultar detalhes de uma empresa |
| PATCH | `/admin/empresas/{id}/status` | Ativar ou desativar uma empresa |

Todas as rotas `/admin/**` exigirão `ROLE_ADMIN`.

### Proteções administrativas

O backend impedirá:

- conta comum acessando endpoints administrativos;
- empresa acessando endpoints administrativos;
- administrador desativando a própria conta;
- desativação do último administrador ativo;
- alteração de status sem registro do responsável;
- uso de conta desativada.

## 4.10 Auditoria

As mudanças de status deverão registrar:

- administrador responsável;
- tipo e ID da conta afetada;
- ação;
- situação anterior e nova;
- motivo, quando enviado;
- data e hora.

A auditoria não armazenará senhas, tokens ou credenciais.

## 5. Preservação do banco existente

A implementação não apagará tabelas nem registros.

Como o projeto atualmente usa `spring.jpa.hibernate.ddl-auto=update`, as novas colunas serão adicionadas de forma compatível e haverá uma rotina controlada de preenchimento para registros existentes:

- usuários existentes: `CANDIDATO` e ativos por padrão;
- empresas existentes: ativas por padrão;
- e-mails existentes: tratados de forma canônica durante as consultas;
- e-mails configurados como administradores: promovidos sem alterar perfil, senha ou CPF.

Qualquer conflito de e-mails que diferem apenas por maiúsculas e minúsculas deverá ser detectado e informado, não sobrescrito automaticamente.

## 6. Tratamento de erros

A API deverá distinguir:

- `400`: dados inválidos;
- `401`: sessão ausente, inválida ou expirada;
- `403`: conta autenticada sem permissão;
- `404`: registro realmente inexistente;
- `409`: e-mail, CPF ou CNPJ duplicado;
- `500`: falha inesperada sem exposição de detalhes internos.

Mensagens deverão usar um formato consistente com código e texto legível.

## 7. Estratégia de testes

## 7.1 Autenticação

- cadastro e login com e-mail normalizado;
- login da conta oficial;
- diferenciação entre candidato, empresa e administrador;
- bloqueio de conta desativada;
- rejeição de JWT inválido e expirado.

## 7.2 Isolamento de usuários

- dois usuários recebem perfis diferentes;
- atualização do usuário B não altera o usuário A;
- experiências e cursos pertencem ao perfil correto;
- mensagens e seguidores respeitam o usuário autenticado;
- consultas não retornam senha.

## 7.3 Isolamento de empresas

- duas empresas mantêm dados separados;
- empresa não acessa recurso pertencente à outra;
- empresa autenticada é obtida do JWT;
- operações corporativas não confiam em ID enviado pelo frontend.

## 7.4 Administração

- candidato recebe `403`;
- empresa recebe `403`;
- administrador lista usuários e empresas;
- busca, filtros e paginação funcionam;
- alteração de status é auditada;
- autoproteção e último administrador são preservados.

## 7.5 Regressão

Executar:

- testes Maven;
- testes existentes de perfil, autenticação, cadastro, mensagens e seguidores;
- validação de inicialização com H2;
- validação das configurações compatíveis com PostgreSQL;
- compilação completa do backend.

## 8. Documentações finais

Serão produzidos dois documentos separados:

### Documento 1 — Frontend administrativo

Somente pendências do frontend, incluindo:

- telas;
- navegação;
- mensagens;
- acessibilidade;
- responsividade;
- estados de carregamento;
- filtros;
- modais;
- testes visuais e de interação.

Não deverá listar tarefas de implementação do backend como se fossem pendências visuais.

### Documento 2 — Backend de usuários e empresas

Deverá registrar:

- o que foi corrigido;
- o que foi testado;
- como funciona o isolamento;
- como a conta oficial é localizada;
- contratos administrativos;
- pontos ainda pendentes;
- procedimento de teste no Railway e PostgreSQL.

Ambos terão versão Markdown no repositório e versão PDF para download.

## 9. Critérios de conclusão

A etapa será considerada concluída quando:

- houver uma única identidade persistente para contas de pessoas;
- a conta oficial puder ser localizada sem dados fixos copiados para terceiros;
- dois usuários mantiverem perfis independentes;
- duas empresas mantiverem recursos independentes;
- os endpoints administrativos usados pelo frontend responderem;
- contas comuns não acessarem o admin;
- todos os testes relevantes passarem;
- nenhum código do frontend tiver sido alterado;
- os dois documentos e PDFs estiverem publicados no GitHub.
