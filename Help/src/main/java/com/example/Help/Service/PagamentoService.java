package com.example.Help.Service;

import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.core.MPRequestOptions;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class PagamentoService {

    private static final Logger logger = Logger.getLogger(PagamentoService.class.getName());
    private static final long TOKEN_EXPIRACAO_MINUTOS = 5;

    @Value("${mercadopago.access-token}")
    private String mercadoPagoAccessToken;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenRecuperacaoRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @PostConstruct
    public void inicializarMercadoPago() {
        if (mercadoPagoAccessToken == null || mercadoPagoAccessToken.isBlank()) {
            logger.severe("❌ ERRO CRÍTICO: O Spring NÃO conseguiu ler o 'mercadopago.access-token' do application.properties!");
            return;
        }
        MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);
        logger.info("✅ MercadoPago SDK inicializado. Token carregado com sucesso.");
    }

    private MPRequestOptions buildRequestOptions() {
        return MPRequestOptions.builder()
                .accessToken(mercadoPagoAccessToken)
                .build();
    }

    public Map<String, Object> processarPagamentoCartao(
            String cardToken,
            int installments,
            BigDecimal transactionAmount,
            String description,
            String payerEmail,
            String payerCpf
    ) {
        try {
            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .token(cardToken)
                    .installments(installments)
                    .transactionAmount(transactionAmount)
                    .description(description)
                    .payer(
                            PaymentPayerRequest.builder()
                                    .email(payerEmail)
                                    .identification(
                                            IdentificationRequest.builder()
                                                    .type("CPF")
                                                    .number(payerCpf != null ? payerCpf.replaceAll("[^0-9]", "") : "")
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            PaymentClient client = new PaymentClient();
            Payment payment = client.create(request, buildRequestOptions());

            logger.info("Pagamento cartão processado — ID: " + payment.getId() + " | Status: " + payment.getStatus());

            if ("approved".equals(payment.getStatus())) {
                try {
                    String nomeCurso = (description != null && !description.isBlank()) ? description : "Curso Adquirido";
                    gerarTokenMatriculaPagaAposConfirmacaoPagamento(payerEmail, nomeCurso);
                    logger.info("Faturamento concluído: Token de acesso enviado para " + payerEmail);
                } catch (Exception e) {
                    logger.severe("Pagamento APROVADO, mas falha ao gerar matrícula/e-mail: " + e.getMessage());
                }
            }

            return Map.of(
                    "id",           payment.getId(),
                    "status",       payment.getStatus(),
                    "statusDetail", payment.getStatusDetail(),
                    "message",      resolverMensagemStatus(payment.getStatus())
            );

        } catch (MPApiException apiException) {
            String errorDetail = apiException.getApiResponse() != null
                    ? apiException.getApiResponse().getContent()
                    : "Sem detalhes";
            logger.severe("Erro na API do Mercado Pago (Cartão): " + errorDetail);
            return Map.of(
                    "status",  "error",
                    "message", "O Mercado Pago recusou a transação. Verifique os dados do cartão."
            );
        } catch (Exception e) {
            logger.severe("Erro interno inesperado no processamento de cartão: " + e.getMessage());
            return Map.of(
                    "status",  "error",
                    "message", "Não foi possível processar o pagamento internamente. Tente novamente."
            );
        }
    }

    public Map<String, Object> criarPagamentoPix(
            BigDecimal transactionAmount,
            String description,
            String payerEmail,
            String payerFirstName,
            String payerLastName,
            String payerCpf
    ) {
        try {
            String cpfLimpo      = payerCpf != null ? payerCpf.replaceAll("[^0-9]", "") : "";
            String emailValidado = (payerEmail != null && payerEmail.contains("@"))
                    ? payerEmail
                    : "test_user_anon@testuser.com";

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(transactionAmount)
                    .description(description != null && !description.isBlank() ? description : "Inscrição Help Academy")
                    .paymentMethodId("pix")
                    .payer(
                            PaymentPayerRequest.builder()
                                    .email(emailValidado)
                                    .firstName(payerFirstName != null && !payerFirstName.isBlank() ? payerFirstName : "Aluno")
                                    .lastName(payerLastName  != null && !payerLastName.isBlank()  ? payerLastName  : "Academy")
                                    .identification(
                                            IdentificationRequest.builder()
                                                    .type("CPF")
                                                    .number(cpfLimpo)
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            PaymentClient client = new PaymentClient();
            Payment payment = client.create(request, buildRequestOptions());

            if (payment.getPointOfInteraction() == null
                    || payment.getPointOfInteraction().getTransactionData() == null) {
                logger.severe("❌ MP respondeu, mas PointOfInteraction é nulo — PIX não gerado.");
                return Map.of(
                        "status",  "error",
                        "message", "O gateway não retornou os dados do PIX. Tente novamente."
                );
            }

            var pixInfo = payment.getPointOfInteraction().getTransactionData();
            logger.info("✅ PIX gerado com sucesso — ID: " + payment.getId());

            return Map.of(
                    "id",             payment.getId(),
                    "qr_code",        pixInfo.getQrCode()       != null ? pixInfo.getQrCode()       : "",
                    "qr_code_base64", pixInfo.getQrCodeBase64() != null ? pixInfo.getQrCodeBase64() : "",
                    "status",         payment.getStatus()
            );

        } catch (MPApiException apiException) {
            String errorDetail = apiException.getApiResponse() != null
                    ? apiException.getApiResponse().getContent()
                    : "Sem conteúdo detalhado";
            logger.warning("⚠️ Erro MP API ao gerar PIX: " + errorDetail);
            return Map.of(
                    "status",  "error",
                    "message", "Gateway de pagamento instável. Tente novamente em instantes."
            );

        } catch (Exception e) {
            logger.severe("❌ Erro de sistema ao criar pagamento PIX: " + e.getMessage());
            return Map.of(
                    "status",  "error",
                    "message", "Não foi possível gerar o PIX devido a uma falha interna."
            );
        }
    }

    public Map<String, Object> consultarStatusPagamento(Long paymentId) {
        try {
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(paymentId, buildRequestOptions());

            logger.info("Consulta status — ID: " + paymentId + " | Status: " + payment.getStatus());

            return Map.of(
                    "id",           payment.getId(),
                    "status",       payment.getStatus(),
                    "statusDetail", payment.getStatusDetail(),
                    "message",      resolverMensagemStatus(payment.getStatus())
            );

        } catch (MPApiException apiException) {
            String errorDetail = apiException.getApiResponse() != null
                    ? apiException.getApiResponse().getContent()
                    : "Sem detalhes";
            logger.severe("Erro ao consultar status na API do MP (" + paymentId + "): " + errorDetail);
            return Map.of(
                    "status",  "error",
                    "message", "Não foi possível verificar o status junto ao intermediador de pagamento."
            );
        } catch (Exception e) {
            logger.severe("Erro interno ao consultar status do pagamento " + paymentId + ": " + e.getMessage());
            return Map.of(
                    "status",  "error",
                    "message", "Não foi possível recuperar o status do pagamento no momento."
            );
        }
    }

    @Transactional
    public void gerarTokenMatricula(String email, String nomeCurso) {
        logger.info("Gerando token de matrícula gratuita para: " + email + " | Curso: " + nomeCurso);
        Usuario usuario = buscarUsuarioPorEmailOuFalhar(email);
        String token = prepararNovoToken(usuario);
        enviarEmailConfirmacaoMatriculaGratuita(usuario, token, nomeCurso);
    }

    @Transactional
    public void confirmarMatriculaComToken(String token) {
        TokenRecuperacao tokenEncontrado = buscarTokenOuFalhar(token);
        verificarExpiracaoEDeletar(tokenEncontrado, "O código de confirmação de matrícula expirou.");
        tokenRepository.delete(tokenEncontrado);
        logger.info("Matrícula gratuita confirmada para: " + tokenEncontrado.getUsuario().getEmail());
    }

    @Transactional
    public void gerarTokenMatriculaPagaAposConfirmacaoPagamento(String email, String nomeCurso) {
        logger.info("Pagamento confirmado. Gerando token para: " + email + " | Curso: " + nomeCurso);
        Usuario usuario = buscarUsuarioPorEmailOuFalhar(email);
        String token = prepararNovoToken(usuario);
        enviarEmailConfirmacaoMatriculaPaga(usuario, token, nomeCurso);
    }

    @Transactional
    public void confirmarMatriculaPagaComToken(String token) {
        TokenRecuperacao tokenEncontrado = buscarTokenOuFalhar(token);
        verificarExpiracaoEDeletar(tokenEncontrado, "O código de confirmação de matrícula paga expirou.");
        tokenRepository.delete(tokenEncontrado);
        logger.info("Matrícula paga confirmada para: " + tokenEncontrado.getUsuario().getEmail());
    }

    private Usuario buscarUsuarioPorEmailOuFalhar(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
    }

    private TokenRecuperacao buscarTokenOuFalhar(String token) {
        return tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Código inválido ou inexistente."));
    }

    private String prepararNovoToken(Usuario usuario) {
        tokenRepository.deleteByUsuario(usuario);
        tokenRepository.flush();
        String token = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        TokenRecuperacao novoToken = new TokenRecuperacao(
                token, usuario, LocalDateTime.now().plusMinutes(TOKEN_EXPIRACAO_MINUTOS)
        );
        tokenRepository.save(novoToken);
        return token;
    }

    private void verificarExpiracaoEDeletar(TokenRecuperacao token, String message) {
        if (token.getDataExpiracao().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(token);
            throw new RuntimeException(message);
        }
    }

    private String resolverMensagemStatus(String status) {
        return switch (status) {
            case "approved"   -> "Pagamento aprovado.";
            case "in_process" -> "Pagamento em análise. Você receberá uma confirmação por e-mail.";
            case "rejected"   -> "Pagamento recusado pela operadora. Verifique os dados ou tente outro cartão.";
            default           -> "Status desconhecido: " + status;
        };
    }

    @Async
    protected void enviarMimeMessage(String para, String assunto, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom("suportesistemahelp@gmail.com", "Help Academy");
            helper.setTo(para);
            helper.setSubject(assunto);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            logger.severe("Erro ao enviar e-mail: " + e.getMessage());
        }
    }

    private void enviarEmailConfirmacaoMatriculaGratuita(Usuario usuario, String token, String nomeCurso) {
        String nome = (usuario.getName() != null && !usuario.getName().isBlank()) ? usuario.getName() : "Aluno(a)";
        String html = String.format("""
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                <h2 style="color:#a855f7;margin-top:0;">🎓 Confirme sua Matrícula</h2>
                <p>Olá, <strong>%s</strong>! Você está quase lá.</p>
                <p>Curso: <strong>%s</strong></p>
                <p>Use o código abaixo para confirmar sua matrícula:</p>
                <div style="background:#121217;color:#a855f7;padding:16px;font-size:28px;font-weight:bold;text-align:center;border-radius:8px;letter-spacing:6px;">
                    %s
                </div>
                <p style="color:#6b7280;font-size:13px;margin-top:16px;">⚠️ Expira em %d minutos.</p>
            </div>
            """, nome, nomeCurso, token, TOKEN_EXPIRACAO_MINUTOS);
        enviarMimeMessage(usuario.getEmail(), "Confirme sua Matrícula — Help Academy", html);
    }

    private void enviarEmailConfirmacaoMatriculaPaga(Usuario usuario, String token, String nomeCurso) {
        String nome = (usuario.getName() != null && !usuario.getName().isBlank()) ? usuario.getName() : "Aluno(a)";
        String html = String.format("""
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                <h2 style="color:#22c55e;margin-top:0;">✅ Pagamento Confirmado!</h2>
                <p>Olá, <strong>%s</strong>! Seu acesso foi liberado com sucesso.</p>
                <p>Curso: <strong>%s</strong></p>
                <p>Use o código abaixo para ativar sua matrícula:</p>
                <div style="background:#052e16;color:#4ade80;padding:16px;font-size:28px;font-weight:bold;text-align:center;border-radius:8px;letter-spacing:6px;">
                    %s
                </div>
                <p style="color:#6b7280;font-size:13px;margin-top:16px;">⚠️ Expira em %d minutos.</p>
            </div>
            """, nome, nomeCurso, token, TOKEN_EXPIRACAO_MINUTOS);
        enviarMimeMessage(usuario.getEmail(), "Acesso Liberado — Help Academy", html);
    }
}