package com.example.Help.model.recuperacao;

import com.example.Help.Service.AdminAccountService;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.usuario.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final AdminAccountService adminAccountService;

    public SecurityFilter(
            TokenService tokenService,
            UsuarioRepository usuarioRepository,
            EmpresaRepository empresaRepository,
            AdminAccountService adminAccountService
    ) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.adminAccountService = adminAccountService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null && !tokenJWT.isBlank()) {
            try {
                String email = tokenService.getSubject(tokenJWT);
                String tipoConta = tokenService.getTipoConta(tokenJWT);
                String sessionVersion = tokenService.getSessionVersion(tokenJWT);

                if (email != null) {
                    UserDetails conta = localizarConta(email, tipoConta);
                    if (conta != null && conta.isEnabled() && sessaoValida(conta, sessionVersion)) {
                        var authentication = new UsernamePasswordAuthenticationToken(
                                conta,
                                null,
                                conta.getAuthorities()
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        rejeitar(response, "Sessão expirada ou substituída por outro login.");
                        return;
                    }
                } else {
                    rejeitar(response, "Token inválido ou expirado.");
                    return;
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                logger.warn("Token rejeitado durante a autenticação.");
                rejeitar(response, "Token inválido ou expirado.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void rejeitar(HttpServletResponse response, String mensagem) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + mensagem + "\"}");
    }

    private boolean sessaoValida(UserDetails conta, String tokenVersion) {
        if (tokenVersion == null || tokenVersion.isBlank()) return false;
        if (conta instanceof com.example.Help.model.usuario.Usuario usuario) {
            return tokenVersion.equals(usuario.getSessionVersion());
        }
        if (conta instanceof com.example.Help.model.empresa.Empresa empresa) {
            return tokenVersion.equals(empresa.getSessionVersion());
        }
        return false;
    }

    private UserDetails localizarConta(String email, String tipoConta) {
        if ("EMPRESA".equals(tipoConta)) {
            return empresaRepository.findByEmailIgnoreCase(email).orElse(null);
        }

        if ("CANDIDATO".equals(tipoConta) || "ADMIN".equals(tipoConta)) {
            return usuarioRepository.findByEmailIgnoreCase(email)
                    .map(adminAccountService::sincronizar)
                    .orElse(null);
        }

        UserDetails usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .map(adminAccountService::sincronizar)
                .orElse(null);
        return usuario != null
                ? usuario
                : empresaRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim();
        }
        return null;
    }
}
