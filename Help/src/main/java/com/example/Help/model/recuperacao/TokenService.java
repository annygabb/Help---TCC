package com.example.Help.model.recuperacao;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.usuario.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Duration;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    private static final String ISSUER = "Help-API";

    public String gerarToken(UserDetails conta) {
        if (conta instanceof Usuario usuario) {
            return criarToken(
                    usuario.getEmail(),
                    usuario.getId().toString(),
                    usuario.getTipoConta().name(),
                    usuario.getSessionVersion()
            );
        }
        if (conta instanceof Empresa empresa) {
            return criarToken(
                    empresa.getEmail(),
                    empresa.getId().toString(),
                    "EMPRESA",
                    empresa.getSessionVersion()
            );
        }
        return criarToken(conta.getUsername(), null, "DESCONHECIDO", null);
    }

    public String gerarToken(Usuario usuario) {
        return gerarToken((UserDetails) usuario);
    }

    public String gerarToken(Empresa empresa) {
        return gerarToken((UserDetails) empresa);
    }

    private String criarToken(String email, String id, String tipoConta, String sessionVersion) {
        try {
            var builder = JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(email)
                    .withClaim("tipoConta", tipoConta)
                    .withClaim("sessionVersion", sessionVersion)
                    .withExpiresAt(dataExpiracao());

            if (id != null) builder.withClaim("contaId", id);
            return builder.sign(Algorithm.HMAC256(secret));
        } catch (Exception exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String getSubject(String tokenJWT) {
        try {
            return verificar(tokenJWT).getSubject();
        } catch (JWTVerificationException exception) {
            return null;
        }
    }

    public String getTipoConta(String tokenJWT) {
        try {
            return verificar(tokenJWT).getClaim("tipoConta").asString();
        } catch (JWTVerificationException exception) {
            return null;
        }
    }

    public String getSessionVersion(String tokenJWT) {
        try {
            return verificar(tokenJWT).getClaim("sessionVersion").asString();
        } catch (JWTVerificationException exception) {
            return null;
        }
    }

    private com.auth0.jwt.interfaces.DecodedJWT verificar(String tokenJWT) {
        return JWT.require(Algorithm.HMAC256(secret))
                .withIssuer(ISSUER)
                .build()
                .verify(tokenJWT);
    }

    public Instant dataExpiracao() {
        return Instant.now().plus(Duration.ofHours(2));
    }
}
