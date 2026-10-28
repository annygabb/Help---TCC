# Teste social ponta a ponta

Use quatro contas diferentes: **Usuário A**, **Usuário B**, **Empresa X** e **Empresa Y**.

## Ordem de implantação

1. Publicar primeiro o backend no Railway.
2. Conferir no log a execução das migrações `V2__identidade_perfil_e_sessao.sql` e `V3__publicacoes_globais.sql`.
3. Fazer login novamente; tokens criados antes da atualização não possuem a versão de sessão e serão recusados.
4. Publicar o frontend na Vercel.
5. Limpar o cache da página ou usar uma janela anônima no primeiro teste.

## Matriz obrigatória

Repita as ações abaixo para usuário→usuário, usuário→empresa, empresa→usuário e empresa→empresa.

- Pesquisar o nome com letras maiúsculas, minúsculas e sem acentos.
- Abrir o perfil pelo resultado da pesquisa.
- Seguir e deixar de seguir; conferir os dois contadores.
- Conferir a notificação com nome e foto da origem.
- Enviar mensagem; conferir preview e conteúdo dentro da conversa.
- Trocar foto da conta; conferir busca, seguidores, mensagens e notificações.
- Criar uma publicação; entrar em outra conta e conferir que ela aparece.
- Testar comentários em `TODOS`, `SEGUIDORES` e `DESATIVADO`.

## Isolamento de dados

1. Edite nome, foto, experiência e certificado do Usuário A.
2. Entre como Usuário B e confirme que nenhum dado do A apareceu.
3. Edite a Empresa X e confirme que a Empresa Y permaneceu inalterada.
4. Abra duas abas. Ao trocar a sessão em uma delas, a outra deve recarregar para a mesma conta.
5. Faça novo login da mesma conta em outro navegador; o token anterior deve receber HTTP 401.

## Cadastro e perfil

- Digite o CPF sem pontuação e confirme que a máscara aparece automaticamente.
- Cole um CPF formatado e confirme que o backend recebe somente os 11 dígitos.
- Tente CPF inválido, CPF duplicado e e-mail duplicado; as mensagens devem ser diferentes.
- Anexe foto de até 4 MB e certificado de até 8 MB.
- Confirme que um arquivo acima do limite é recusado antes do envio.

## Evidências esperadas

- Nenhuma requisição para `/mensagens/conversa/undefined`.
- Nenhum 409 ao salvar um perfil válido.
- Nenhuma conta mostra foto, nome ou dados profissionais de outra conta.
- O feed permanece depois de atualizar a página e aparece para outras contas.
- Empresas acessam busca, feed, mensagens e notificações.
