package com.example.Help.model.recuperacao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/usuarios/login").permitAll()//autenticar e cadastrar usuario
                        .requestMatchers(HttpMethod.POST, "/usuarios/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/cadastrar").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios/cadastrar").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/empresas/cadastro").permitAll()//autenticar e cadastrar empresa
                        .requestMatchers(HttpMethod.POST, "/empresas/cadastro").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/empresas/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/empresas/login").permitAll()


                        .requestMatchers(HttpMethod.POST, "/auth/esqueci-senha").permitAll()//recuperar senha
                        .requestMatchers(HttpMethod.POST, "/auth/redefinir-senha").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/gerar-token").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios/gerar-token").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/redefinir-senha").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios/redefinir-senha").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/matricula/gratuita/gerar-token").permitAll()//matriculas
                        .requestMatchers(HttpMethod.POST, "/matricula/gratuita/gerar-token").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/matricula/gratuita/confirmar").permitAll()
                        .requestMatchers(HttpMethod.POST, "/matricula/gratuita/confirmar").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/matricula/paga/gerar-token").permitAll()
                        .requestMatchers(HttpMethod.POST, "/matricula/paga/gerar-token").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/matricula/paga/confirmar").permitAll()
                        .requestMatchers(HttpMethod.POST, "/matricula/paga/confirmar").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/pagamento/cartao").permitAll()//pagamento cartao e pix
                        .requestMatchers(HttpMethod.POST, "/api/pagamento/pix").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/pagamento/pix/status/**").permitAll()
                        .requestMatchers("/api/pagamento/**").permitAll()
                        .requestMatchers("/pagamento/**").permitAll()

                        .requestMatchers("/api/banco/**").permitAll()//publicos
                        .requestMatchers("/api/matricula/**").permitAll()
                        .requestMatchers("/matricula/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        .requestMatchers(HttpMethod.GET,    "/api/vagas").permitAll()//vaga e talento
                        .requestMatchers(HttpMethod.POST,   "/api/vagas").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/vagas/**").permitAll()
                        .requestMatchers(HttpMethod.GET,    "/api/vagas/talentos").permitAll()
                        .requestMatchers(HttpMethod.GET,    "/api/vagas/talentos/**").permitAll()

                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").authenticated()//rotas autenticada
                        .requestMatchers(HttpMethod.PUT, "/usuarios/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/usuarios/**").authenticated()

                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}