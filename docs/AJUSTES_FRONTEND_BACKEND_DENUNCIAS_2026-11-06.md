# HELP — auditoria, correções e módulo de denúncias

Data da revisão: 6 de novembro de 2026  
Base analisada: arquivo ZIP enviado e versão atual da branch `main` após o PR #20.

## Resultado da auditoria

O ZIP enviado estava anterior às correções mais recentes do repositório. Por isso, alguns problemas visíveis no ambiente de produção já estavam resolvidos no código atual, mas dependiam de novo deploy. Esta atualização preserva as correções existentes e atua apenas nos problemas que ainda permaneciam.

| Item relatado | Situação encontrada | Camada | Resultado |
| --- | --- | --- | --- |
| Busca administrativa não ignora acentos | A normalização apenas convertia para minúsculas | Backend | Corrigida com remoção de acentos antes da comparação |
| Conta desativada aparece na busca pública | O código atual já filtra participantes inativos; a lista administrativa mantém inativos de propósito | Backend/deploy | Regra confirmada; busca pública não retorna conta desativada |
| Conta desativada revela mensagem diferente no login | A exceção de conta desativada caía no tratamento genérico | Backend | Usuário e empresa recebem a resposta neutra `E-mail ou senha inválidos` com HTTP 401 |
| Usuário novo recebe imagem pessoal antiga | Algumas telas ainda usavam uma imagem fixa | Frontend | Criado avatar profissional padrão com contorno e iniciais |
| Vaga desaparece ao atualizar a página | A criação existia apenas no estado React | Frontend + backend | Criação passa pela API e fica persistida no PostgreSQL |
| Vaga não pode ser editada | Não existia rota `PUT` e o formulário alterava somente memória local | Frontend + backend | Adicionada edição persistente e validação de propriedade da empresa |
| Vagas não aparecem para usuários | A tela do usuário usava duas vagas fixas | Frontend + backend | Tela passa a consumir as vagas ativas da API |
| Relatório semanal não abre | Corrigido anteriormente no PR #20 | Frontend | Mantido o modal funcional |
| Empresa recebe vagas recomendadas para se candidatar | Corrigido anteriormente no PR #20 | Frontend | Empresa recebe acesso à gestão de vagas, não recomendações de candidatura |
| Feed da empresa duplicado | Corrigido anteriormente por deduplicação baseada no ID | Frontend | Mantida a correção |
| Curso aparece matriculado sem token | O curso fixo pré-matriculado foi removido anteriormente | Frontend | Matrícula só entra na lista depois da confirmação do token |
| Token gratuito/pago não chega | O backend agora propaga falha SMTP; entrega depende das credenciais da hospedagem | Backend + ambiente | O sistema não informa sucesso quando o e-mail falha; Railway precisa de SMTP válido |
| Telefone aceita letras | Corrigido anteriormente | Frontend | Máscara e validação numérica mantidas |
| Cidade/estado aceitam números | Corrigido anteriormente | Frontend | Cidade aceita letras e UF usa seleção válida |
| Ano de educação aceita texto | Campos não restringiam a entrada | Frontend | Entrada limitada a quatro dígitos |
| Denúncias do administrador eram fictícias | Tela usava uma constante local | Frontend + backend | Fluxo real criado e conectado ao banco |

## Vagas — funcionamento atual

Antes, o painel criava um objeto com `Date.now()` e o colocava em `setVagas`. Nenhuma requisição era enviada ao servidor. Ao recarregar, o React reiniciava e a vaga sumia.

Agora:

1. a empresa autenticada cria a vaga por `POST /api/vagas`;
2. o backend associa a vaga à empresa autenticada, sem aceitar outro proprietário enviado pelo navegador;
3. os detalhes da vaga são gravados no PostgreSQL;
4. o painel recupera as vagas por `GET /api/vagas/minhas`;
5. a edição usa `PUT /api/vagas/{id}` e só funciona para a empresa proprietária;
6. a exclusão usa `DELETE /api/vagas/{id}`;
7. usuários consultam vagas ativas por `GET /api/vagas`.

Foram acrescentados ao banco: modelo, tipo de contrato, status, senioridade, localização, faixa salarial, prioridade, descrição e unidade da experiência. A migração `V6__detalhes_vagas.sql` preserva vagas antigas e preenche valores padrão.

## Denúncias — frontend

Foram adicionadas ações reais nas seguintes áreas:

- perfil público de usuário;
- perfil público de empresa;
- publicação no feed;
- painel administrativo de denúncias.

O formulário exige motivo, permite uma descrição de até 2.000 caracteres e informa sucesso ou falha. Não é permitido denunciar a própria conta. O painel administrativo deixou de usar exemplos fixos e agora exibe registros reais, com filtros por situação e prioridade.

## Denúncias — backend

### Rotas de usuário e empresa

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/denuncias` | Registrar denúncia autenticada contra usuário, empresa ou publicação |
| `GET` | `/denuncias/minhas` | Consultar denúncias feitas pela conta atual |

### Rotas administrativas

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/admin/denuncias` | Listar denúncias; aceita filtros `status` e `prioridade` |
| `PATCH` | `/admin/denuncias/{id}` | Registrar status, decisão e justificativa da moderação |

Cada denúncia armazena denunciante tipado, alvo tipado, motivo, descrição, prioridade, status, administrador responsável e datas. As rotas administrativas continuam protegidas por `ROLE_ADMIN`. A decisão também é executada: advertência gera notificação, remoção exclui a publicação denunciada e suspensão desativa a conta de usuário ou empresa.

## Segurança e privacidade

- contas desativadas continuam visíveis no painel administrativo para permitir auditoria e reativação, mas não na descoberta pública;
- a mensagem de login não confirma se uma conta existe, está bloqueada ou usou senha errada;
- a empresa só altera ou exclui vagas que pertencem a ela;
- o alvo da denúncia é validado no servidor;
- a própria conta não pode se autodenunciar;
- decisões administrativas exigem justificativa;
- senhas, tokens e credenciais SMTP não foram adicionados ao repositório.

## Dependência externa: envio dos tokens de curso

O fluxo gratuito e o fluxo pago foram separados. O curso somente deve ser liberado depois da confirmação do token. No fluxo pago, o token só é solicitado depois da aprovação do pagamento.

O código não consegue garantir entrega de e-mail sem um SMTP funcional. No Railway devem estar corretas as variáveis `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME` e `SPRING_MAIL_PASSWORD`. A senha do Gmail deve ser uma senha de aplicativo. Se o SMTP rejeitar a autenticação, a API agora retorna falha e o frontend não deve afirmar que o token foi enviado.

## Validação executada

- 37 testes automatizados do frontend: aprovados;
- build Vite de produção: aprovado;
- verificação de formatação do diff: aprovada;
- validação Java/Maven: executada pelo GitHub Actions após a publicação da branch.

## Teste manual recomendado após o deploy

1. desativar uma conta e confirmar que ela aparece apenas no admin;
2. buscar `razao` e confirmar resultado para `Razão Social`;
3. criar uma vaga, atualizar a página e confirmar persistência;
4. editar a vaga e abrir a mesma oportunidade com uma conta de usuário;
5. denunciar um perfil e uma publicação;
6. entrar como administrador, analisar os dois registros e salvar justificativas;
7. testar token gratuito com SMTP válido;
8. testar pagamento aprovado em ambiente de teste e somente então confirmar o token pago;
9. testar telefone, cidade, UF e anos de educação com caracteres inválidos.

## Estado final

As correções de interface e regras de negócio agora estão conectadas ao backend e ao PostgreSQL nos pontos de vagas e denúncias. Os itens de matrícula, feed empresarial, relatório e recomendações empresariais já estavam corrigidos na versão atual e foram preservados. A única parte que depende de serviço externo é a entrega do e-mail, que exige credenciais SMTP válidas no ambiente de produção.
