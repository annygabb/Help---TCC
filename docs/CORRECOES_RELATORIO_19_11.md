# Correções do relatório de testes de 19/11/2026

Base: commit `2a0ebb7`. As alterações foram testadas localmente; o funcionamento de ponta a ponta em produção depende da disponibilidade do backend e dos serviços externos descritos abaixo.

## Alterações

- Recuperação de senha: código aleatório de 24 caracteres, associado ao e-mail, com expiração, intervalo entre solicitações, limite de tentativas, armazenamento de hash e resposta genérica para contas existentes ou não. A troca de senha invalida as sessões anteriores.
- Pagamento e matrícula antigos: controladores, serviço e permissões públicas removidos. As matrículas gratuitas usam suas rotas próprias.
- Gemini: chamada transferida para o backend, com acesso apenas a contas de empresa. O frontend não deve receber uma chave de API.
- Configuração: removidos os valores de reserva de produção para JWT, senha do banco e e-mails de administração. O login de candidato recusa contas administrativas e não informa se uma conta está desativada a quem fornece uma senha incorreta.
- Frontend: dependências ajustadas e remoção da dependência não utilizada de PDF; telas carregadas sob demanda.
- Vagas e empresa: operações transacionais e migração da restrição de tipos de notificações.
- Perfis profissionais públicos: apresentação, experiências e cursos, sem exibir informações particulares e certificados.
- Banco de talentos: filtros de senioridade e pretensão salarial que não funcionavam foram retirados.
- Publicações e comentários: exclusão disponível para o próprio autor. Links compartilhados direcionam para a publicação quando ela está acessível.
- Desempenho: uso de miniaturas para fotos nas listagens, resumo de perfil sem certificados e endpoint leve para contagem de mensagens não lidas. Os arquivos originais continuam no banco até ser configurado armazenamento externo e executada a migração.
- CI: execução da suíte completa do backend; removidos testes Vitest obsoletos guardados na árvore de testes Java.
- Interface: ajustes no menu e acesso de empresas, formulário de vaga, busca, mensagens vazias, notificações e permissões de telas. É possível ocultar a conversa para a própria conta e bloquear o envio de mensagens entre duas contas; o bloqueio não é um bloqueio global de perfil.
- Denúncias: uma conta não pode repetir uma denúncia do mesmo alvo enquanto houver denúncia sua pendente.

## Configurar antes de testar em produção

1. Restabeleça o serviço do backend no Railway e confirme sua URL e a conexão com o banco. Em 20/11/2026, `https://help-tcc-production.up.railway.app/api/vagas` respondia `404 Application not found`.
2. Confirme `JWT_SECRET` e `SPRING_DATASOURCE_PASSWORD` como variáveis do serviço. Configure `APP_ADMIN_EMAILS` com os e-mails autorizados a receber perfil de administração, separados por vírgula. Administradores já classificados não são rebaixados pela ausência da variável.
3. Para os e-mails de recuperação e matrícula, configure `RESEND_API_KEY` e `EMAIL_FROM` com um remetente de domínio verificado no Resend. O perfil de produção usa a API HTTPS por padrão. Sem esses valores, o envio não funciona.
4. Para a análise opcional por IA, configure `GEMINI_API_KEY` somente no backend. Revogue e substitua qualquer chave anteriormente publicada em `VITE_GEMINI_API_KEY` ou em arquivos JavaScript do site. Sem chave, a interface usa a alternativa local.
5. Como os valores antigos já estiveram no repositório, troque o segredo JWT e a senha do banco em coordenação com a configuração do banco e do Railway. Trocar o JWT encerra as sessões existentes. Nunca registre segredos no Git.
6. Configure e valide um serviço de armazenamento de objetos para fotos e certificados antes de migrar os arquivos existentes. As miniaturas reduzem a transferência, mas não substituem essa migração.
7. Faça backup e aplique normalmente as migrações Flyway `V9`, `V10` e `V11` no PostgreSQL. Valide criação de vaga, edição de empresa, recuperação de senha, matrícula por e-mail, perfis e mensagens com contas de teste reais. A suíte automatizada local usa H2 e não comprova a aplicação dessas migrações no banco de produção.

Não remova do histórico dados ou arquivos antigos sem antes coordenar a troca dos segredos e revisar as consequências. O QR Code Pix antigo continua no histórico público caso já tenha sido publicado.
