package com.example.Help.model.recuperacao;

import com.example.Help.model.cadastro.CadastroRepository;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.empresa.EmpresaRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CadastroRepository cadastroRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null && !tokenJWT.isBlank()) {
            try {
                var email = tokenService.getSubject(tokenJWT);

                if (email != null) {
                    UserDetails user = cadastroRepository.findByEmail(email).orElse(null);//encontrar na tabela de Cadastros comuns

                    if (user == null) {
                        user = usuarioRepository.findByEmail(email).orElse(null);//Se não achou, tenta na tabela de Usuários
                    }

                    if (user == null && empresaRepository != null) {
                        user = empresaRepository.findByEmail(email).orElse(null);//Se ainda não achou, busca na parte de Empresas
                    }

                    if (user != null) {
                        var authentication = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                user.getAuthorities()
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                logger.error("Erro na autenticação via filtro: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.replace("Bearer ", "").trim();
        }
        return null;
    }
}