# Comunicação social entre usuários e empresas

## Contexto e objetivo

O módulo social atual aceita somente pessoas cadastradas como `Usuario`. As tabelas de mensagens, notificações e seguidores mantêm chaves estrangeiras obrigatórias para `usuarios`, e os controllers recuperam exclusivamente um usuário autenticado. Por isso, uma `Empresa` autenticada não consegue participar desses fluxos.

Esta alteração deve permitir comunicação social entre todas as contas ativas:

- usuário para usuário;
- usuário para empresa;
- empresa para usuário;
- empresa para empresa.

O backend será implementado agora. O frontend não será alterado neste ciclo; receberá documentação em Markdown e PDF com contratos, telas, estados e critérios de teste.

## Decisões confirmadas

- Qualquer conta ativa poderá iniciar uma conversa com outra conta ativa.
- Mensagens, notificações e relações de seguir deixarão de ser exclusivas de usuários.
- O sistema notificará nova mensagem, novo seguidor e atualizações/publicações de empresas.
- Os dados sociais já existentes devem continuar válidos após a implantação.
- A identidade do remetente/seguidor será sempre obtida do JWT. O cliente não poderá escolher quem está realizando a ação.
- O frontend existente permanecerá compatível com os fluxos de usuário para usuário.

## Alternativas consideradas

### Entidade única de conta social

Criaria um terceiro cadastro comum a usuários e empresas. O modelo ficaria uniforme, mas exigiria migrar todas as referências existentes e sincronizar o ciclo de vida de três entidades. O risco e o volume de mudança não compensam neste estágio.

### Tabelas separadas por combinação

Criaria tabelas diferentes para usuário-empresa e empresa-empresa. Isso reduziria alterações nas tabelas atuais, mas duplicaria consultas, serviços e regras de autorização. Foi descartado para evitar comportamentos diferentes entre os mesmos recursos.

### Referências duplas no modelo atual — escolhida

Cada ponta de uma relação poderá apontar para um usuário ou para uma empresa. A aplicação validará que exatamente uma referência esteja preenchida em cada ponta. Essa estratégia preserva os UUIDs e registros existentes, mantém chaves estrangeiras reais e permite evolução gradual.

## Modelo comum de participante

Será criado o enum `TipoParticipante`:

- `USUARIO`
- `EMPRESA`

Um value object `ParticipanteRef` representará uma conta social com:

- `id`;
- `tipo`;
- `nomeExibicao`;
- `ativo`.

O serviço `ParticipanteService` será a única porta para:

- resolver a conta autenticada a partir de `Authentication`;
- localizar um destinatário por `id` e `tipo`;
- verificar se a conta existe e está ativa;
- retornar o nome público correto;
- impedir uma conta de agir sobre si mesma quando a operação não permitir.

O frontend nunca enviará o tipo ou ID do remetente. Eles serão derivados do principal autenticado.

## Persistência

### Mensagens

A tabela `mensagens` manterá as colunas atuais de usuário e receberá colunas opcionais para empresa:

- `remetente_id`: usuário remetente, agora opcional;
- `remetente_empresa_id`: empresa remetente, opcional;
- `destinatario_id`: usuário destinatário, agora opcional;
- `destinatario_empresa_id`: empresa destinatária, opcional.

Para cada mensagem:

- exatamente um remetente deverá estar preenchido;
- exatamente um destinatário deverá estar preenchido;
- remetente e destinatário não poderão representar a mesma conta;
- conteúdo vazio será rejeitado;
- contas inativas serão rejeitadas.

Os registros antigos continuarão usando `remetente_id` e `destinatario_id`, sem transformação dos UUIDs.

### Notificações

A tabela `notificacoes` manterá `usuario_id`, que passará a ser opcional, e receberá:

- `empresa_id`: empresa destinatária;
- `origem_tipo`: `USUARIO` ou `EMPRESA`.

Exatamente um destinatário deverá ser informado. `origem_id`, `origem_nome` e `origem_tipo` identificarão quem ou o que gerou o aviso.

### Seguidores

A tabela `seguidores` será ampliada com:

- `seguidor_id`: usuário seguidor, opcional;
- `seguidor_empresa_id`: empresa seguidora, opcional;
- `seguido_id`: usuário seguido, opcional;
- `seguido_empresa_id`: empresa seguida, opcional.

A unicidade será calculada pelo par lógico `(tipoSeguidor, idSeguidor, tipoSeguido, idSeguido)`. A aplicação bloqueará duplicidade e auto-seguimento.

### Migração e compatibilidade

A alteração deve ser aditiva:

1. adicionar as novas colunas;
2. remover apenas a obrigatoriedade das colunas de usuário que agora precisam aceitar empresa;
3. manter todas as linhas antigas intactas;
4. criar índices para consultas por usuário e por empresa;
5. validar, na inicialização/testes, que não existem relações com zero ou duas referências na mesma ponta.

O script de migração será idempotente para PostgreSQL. O perfil de testes usará estrutura equivalente no H2. Nenhuma tabela ou dado existente será apagado.

## Contratos HTTP

### Compatibilidade

Os endpoints existentes continuarão aceitos. Quando `tipoDestinatario` ou `tipoConta` não for enviado em uma operação antiga, o padrão será `USUARIO`.

### Diretório social

`GET /comunicacao/contatos?busca={texto}&tipo={USUARIO|EMPRESA}`

Retorna somente contas ativas e nunca inclui a própria conta autenticada.

Resposta resumida:

```json
[
  {
    "id": "uuid",
    "tipoConta": "EMPRESA",
    "nome": "Empresa Exemplo",
    "subtitulo": "Empresa",
    "seguindo": false
  }
]
```

### Enviar mensagem

`POST /mensagens/enviar`

```json
{
  "destinatarioId": "uuid",
  "tipoDestinatario": "EMPRESA",
  "conteudo": "Olá, gostaria de conversar."
}
```

O retorno acrescentará `remetenteTipo` e `destinatarioTipo`, preservando os campos atuais.

### Listar conversas

`GET /mensagens/conversas`

Funcionará para usuário e empresa. Cada item informará:

- `contaId`;
- `tipoConta`;
- `nome`;
- `subtitulo`;
- `ultimaMensagem`;
- `dataUltimaMensagem`;
- `naoLidas`.

Os campos legados de usuário serão mantidos durante a transição quando aplicável.

### Abrir conversa

Novo contrato explícito:

`GET /mensagens/conversa/{tipoConta}/{contaId}`

Abrir a conversa marcará como lidas somente as mensagens recebidas pela conta autenticada e enviadas pela outra conta.

O endpoint legado `GET /mensagens/conversa/{usuarioId}` continuará significando conversa com `USUARIO`.

### Notificações

Os endpoints existentes permanecerão:

- `GET /notificacoes`;
- `GET /notificacoes/nao-lidas/total`;
- `PUT /notificacoes/{id}/marcar-lida`;
- `PUT /notificacoes/marcar-todas-lidas`.

Eles passarão a funcionar para empresas. Uma conta só poderá marcar notificações que lhe pertençam.

### Seguir e deixar de seguir

Novos contratos explícitos:

- `POST /seguidores/seguir/{tipoConta}/{contaId}`;
- `DELETE /seguidores/deixar-de-seguir/{tipoConta}/{contaId}`;
- `GET /seguidores/status/{tipoConta}/{contaId}`;
- `GET /seguidores/contagem/{tipoConta}/{contaId}`.

Os endpoints antigos com apenas `{usuarioId}` continuarão direcionados a `USUARIO`.

`GET /seguidores/seguindo` e `GET /seguidores/meus-seguidores` funcionarão para o tipo de conta autenticado e retornarão o tipo de cada item.

## Eventos de notificação

Serão usados os seguintes tipos:

- `NOVA_MENSAGEM`: enviada ao destinatário da mensagem;
- `NOVO_SEGUIDOR`: enviada à conta seguida;
- `EMPRESA_ATUALIZADA`: enviada aos seguidores quando dados públicos relevantes da empresa mudarem;
- `NOVA_VAGA_EMPRESA`: enviada aos seguidores quando uma nova vaga for publicada.

Mensagens consecutivas não lidas do mesmo remetente continuarão consolidadas em uma única notificação. Atualizações de empresa deverão ser consolidadas por empresa e tipo enquanto a notificação anterior permanecer não lida.

Alterações administrativas, troca de senha, login e mudanças apenas técnicas não gerarão aviso social.

## Segurança e isolamento

- Todas as operações sociais exigirão autenticação.
- O remetente, leitor, seguidor e dono da notificação serão derivados do JWT.
- A aplicação verificará o tipo real do principal, não apenas o UUID.
- IDs iguais em tabelas diferentes não serão tratados como a mesma conta.
- Uma conta não poderá ler conversa de terceiros alterando parâmetros da URL.
- Uma conta não poderá marcar notificação de outra conta como lida.
- Contas desativadas serão excluídas das buscas e impedidas de iniciar ações.
- Respostas de erro não revelarão e-mail, CPF, CNPJ, senha ou token.
- Operações de seguir e envio serão transacionais.

## Erros HTTP

- `400`: conteúdo inválido, auto-seguimento ou tentativa de mensagem para si;
- `401`: token ausente ou inválido;
- `403`: conta inativa ou tentativa de acessar recurso pertencente a outra conta;
- `404`: destinatário, conversa ou notificação inexistente;
- `409`: relação de seguir duplicada;
- `201`: mensagem enviada ou relação criada;
- `204`: relação removida quando não há corpo de resposta.

O tratamento será centralizado no `RequestsExceptionHandler` para não depender de blocos `try/catch` diferentes em cada controller.

## Documentação do frontend

Será criado `docs/FRONTEND_COMUNICACAO_SOCIAL.md` e sua versão em PDF. A documentação será exclusivamente de frontend e incluirá:

- telas de conversas para usuário e empresa;
- seletor e busca de contatos por tipo;
- identificação visual de usuário e empresa;
- envio, carregamento, erro, vazio e bloqueio;
- badges de mensagens e notificações não lidas;
- seguir/deixar de seguir e atualização otimista segura;
- notificações de mensagem, seguidor, atualização e nova vaga;
- navegação ao clicar em cada tipo de notificação;
- contratos, payloads e exemplos de resposta;
- acessibilidade, responsividade e segurança do cliente;
- matriz de testes manuais do frontend.

O documento não prescreverá implementação de banco, entidades JPA ou serviços internos.

## Estratégia de testes

### Testes de serviço

- resolver usuário e empresa autenticados;
- rejeitar conta inexistente ou inativa;
- impedir mensagem e seguimento da própria conta;
- criar, consolidar e marcar notificações;
- atualizar contadores ao seguir e deixar de seguir.

### Testes de integração

- usuário → usuário, preservando o fluxo atual;
- usuário → empresa;
- empresa → usuário;
- empresa → empresa;
- lista de conversas e contagem de não lidas para cada lado;
- leitura afeta somente o destinatário autenticado;
- busca retorna a conta correta e exclui a conta atual;
- notificação pertence apenas ao destinatário;
- seguir/deixar de seguir nas quatro combinações;
- atualização da empresa e nova vaga notificam somente seus seguidores;
- conta X não lê nem altera dados da conta Y;
- endpoints legados continuam funcionando.

### Testes de persistência

- registros antigos de usuário para usuário continuam consultáveis;
- constraints lógicas impedem pontas vazias ou duplas;
- consultas funcionam no H2 de teste e no PostgreSQL de produção;
- índices cobrem remetente, destinatário, dono da notificação e relações de seguidores.

## Critérios de conclusão

A implementação será considerada concluída quando:

1. as quatro combinações de mensagem funcionarem;
2. usuários e empresas receberem e administrarem suas próprias notificações;
3. seguir/deixar de seguir funcionar entre qualquer tipo de conta;
4. seguidores receberem avisos de atualização pública e nova vaga de empresa;
5. os dados antigos permanecerem acessíveis;
6. nenhuma conta conseguir acessar dados sociais de outra;
7. os testes automatizados passarem;
8. o projeto compilar e empacotar com Java 21;
9. a documentação de frontend em Markdown e PDF estiver revisada;
10. nenhuma alteração de tela tiver sido feita neste ciclo.

## Fora do escopo

- anexos em mensagens;
- chamadas de áudio ou vídeo;
- grupos;
- exclusão para todos;
- presença online e indicador de digitação;
- bloqueio de contas;
- moderação automática de conteúdo;
- notificações push, e-mail ou SMS;
- implementação das telas descritas na documentação.
