package com.example.Help.Service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class RequestsExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)//capturas de erros de validação
    public ResponseEntity<?> tratarErro400(MethodArgumentNotValidException ex) {
        List<FieldError> erros = ex.getFieldErrors();
        List<DadosErroValidacao> lista = erros.stream().map(DadosErroValidacao::new).toList();
        return ResponseEntity.badRequest().body(lista);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)//corpo vazio ou json inválido
    public ResponseEntity<?> tratarErroCorpoRequisicao(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(List.of(
                new DadosErroValidacao("corpo", "O corpo da requisição é obrigatório e deve estar em formato JSON válido.")
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)//evita erros técnicos como rawPassword cannot be null
    public ResponseEntity<?> tratarArgumentoInvalido(IllegalArgumentException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("rawPassword")) {
            return ResponseEntity.badRequest().body(List.of(
                    new DadosErroValidacao("senha", "A senha é obrigatória e não pode ser nula.")
            ));
        }
        return ResponseEntity.badRequest().body(List.of(
                new DadosErroValidacao("requisicao", msg != null ? msg : "Argumento inválido.")
        ));
    }

    @ExceptionHandler(BadCredentialsException.class)//autenticação inválida
    public ResponseEntity<?> tratarErroCredenciais(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "E-mail ou senha inválidos."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)//duplicidade no banco
    public ResponseEntity<?> tratarConflitoBanco(DataIntegrityViolationException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.toLowerCase().contains("email")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "email", "mensagem", "E-mail já cadastrado no sistema."));
        }
        if (msg != null && msg.toLowerCase().contains("cpf")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "cpf", "mensagem", "CPF já cadastrado no sistema."));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Conflito de dados já existentes no sistema."));
    }

    @ExceptionHandler(EntityNotFoundException.class)//captura quando um id não é encontrado
    public ResponseEntity<?> tratarErro404() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(RuntimeException.class)//captura erros genericos de lógica
    public ResponseEntity<?> tratarErroRegraDeNegocio(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    public record DadosErroValidacao(String campo, String mensagem) {
        public DadosErroValidacao(FieldError erro) {
            this(erro.getField(), erro.getDefaultMessage());
        }
    }
}