package com.example.Help.model.empresa;

import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/empresas", "/api/empresas"})
public class EmpresaController {

    private final EmpresaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager manager;
    private final TokenService tokenService;

    public EmpresaController(
            EmpresaRepository repository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager manager,
            TokenService tokenService
    ) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.manager = manager;
        this.tokenService = tokenService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrarEmpresa(@RequestBody @Valid EmpresaRequestDTO dados) {
        String email = Empresa.normalizarEmail(dados.email());

        if (repository.existsByEmailIgnoreCase(email) || usuarioRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "email", "mensagem", "E-mail já cadastrado no sistema."));
        }

        String cnpjLimpo = dados.cnpj().replaceAll("\\D", "");
        if (repository.existsByCnpj(cnpjLimpo)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "cnpj", "mensagem", "CNPJ já cadastrado no sistema."));
        }

        String senhaPura = dados.password() != null ? dados.password() : dados.senha();
        if (senhaPura == null || senhaPura.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("campo", "senha", "mensagem", "A senha é obrigatória."));
        }

        if (senhaPura.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("campo", "senha", "mensagem", "A senha deve ter no mínimo 8 caracteres."));
        }

        Empresa novaEmpresa = new Empresa();
        novaEmpresa.setCorporateName(dados.corporateName().trim());
        novaEmpresa.setEmail(email);
        novaEmpresa.setCnpj(cnpjLimpo);
        novaEmpresa.setPassword(passwordEncoder.encode(senhaPura));
        novaEmpresa.setAtivo(true);

        repository.save(novaEmpresa);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Empresa cadastrada com sucesso!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody @Valid EmpresaLoginDTO dados) {
        try {
            String senhaLogin = dados.password() != null ? dados.password() : dados.senha();
            if (senhaLogin == null || senhaLogin.isBlank()) {
                return ResponseEntity.badRequest().body("A senha é obrigatória.");
            }

            var authenticationToken = new UsernamePasswordAuthenticationToken(
                    Empresa.normalizarEmail(dados.email()),
                    senhaLogin
            );
            Authentication authentication = manager.authenticate(authenticationToken);
            Empresa empresa = (Empresa) authentication.getPrincipal();

            if (!empresa.isAtivo()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Conta desativada.");
            }

            var tokenJWT = tokenService.gerarToken(empresa);
            return ResponseEntity.ok(new TokenDadosEmpresaDTO(tokenJWT));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha inválidos.");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<EmpresaAtualDTO> minhaEmpresa(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof Empresa empresa)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(new EmpresaAtualDTO(
                empresa.getId(),
                empresa.getCorporateName(),
                empresa.getEmail(),
                empresa.getCnpj(),
                "EMPRESA",
                empresa.isAtivo()
        ));
    }
}
