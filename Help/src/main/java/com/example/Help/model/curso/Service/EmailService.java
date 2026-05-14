package com.example.Help.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void enviarEmailToken(String para, String assunto, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("suportesistemahelp@gmail.com", "Help Academy");
            helper.setTo(para);
            helper.setSubject(assunto);
            helper.setText(htmlContent, true);
            helper.setPriority(1);

            mailSender.send(mimeMessage);
            logger.info("SMTP: E-mail enviado com sucesso para " + para);
        } catch (Exception e) {
            logger.severe("SMTP ERRO: Falha ao enviar para " + para + " -> " + e.getMessage());
        }
    }
}