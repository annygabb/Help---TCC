# Preparação da demonstração do Help

## Fluxos preparados

- O cartão do feed apresenta um nome curto, mantendo o nome completo no perfil.
- O login administrativo usa `/usuarios/login/admin`.
- Empresas podem publicar e alterar o estado das próprias vagas. A candidatura de uma pessoa autenticada é persistida uma única vez; apenas a empresa dona recebe os identificadores dos inscritos. A candidatura usa o perfil profissional do Help e não envia um arquivo de currículo.
- O banco de talentos retorna campos profissionais selecionados, sem CPF, e-mail, senha ou dados de sessão.
- A matrícula no curso gratuito de demonstração exige confirmação no e-mail da conta autenticada e fica salva. Cursos pagos estão sinalizados como indisponíveis; o QR Code pessoal e a interface de pagamento Pix foram removidos da versão atual.
- Avisos administrativos, perfis e mensagens têm mensagens de falha explícitas. Dados fictícios e ações sem persistência foram retirados das partes alteradas.

O catálogo de cursos desta versão continua demonstrativo: o fluxo de matrícula não cria aulas nem valida a existência de conteúdo ou certificação de terceiros.

## Antes do ensaio no ambiente publicado

1. Verificar se o backend iniciou com a migração `V8__matriculas_gratuitas.sql` aplicada e se o front-end está na mesma versão do backend.
2. Conferir a configuração SMTP existente no servidor. Usar uma conta de testes que receba e-mail e confirmar que o código de matrícula chega; um teste com envio simulado não prova entrega real.
3. Preparar duas contas de pessoa, uma de empresa e uma administrativa autorizada, com dados de demonstração e senhas fornecidas de forma segura. Não colocar credenciais no repositório.
4. Testar no endereço publicado: editar perfil e foto, criar post/comentar/curtir, buscar e seguir, trocar mensagens, publicar e encerrar vaga, candidatar-se, confirmar matrícula gratuita, decidir uma denúncia e enviar aviso para a candidata.
5. Acordar o servidor antes do ensaio, repetir o roteiro três vezes e gravar um vídeo de reserva. Fazer o congelamento do código na data combinada pela equipe.

## Testes automatizados

Na pasta `Help`, execute `mvn test` com Java 21. Na pasta `Help/frontend`, execute `npm ci`, `npm test` e `npm run build`. Os testes automatizados usam dados isolados e não enviam e-mail real.
