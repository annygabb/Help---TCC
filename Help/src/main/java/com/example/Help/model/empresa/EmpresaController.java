package com.example.Help.model.empresa;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.Help.model.cadastro.CadastroRepository;
import com.example.Help.model.recuperacao.TokenService;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping({"/empresas", "/api/empresas"})
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class EmpresaController {

    @Autowired
    private EmpresaRepository repository;

    @Autowired
    private CadastroRepository cadastroRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrarEmpresa(@RequestBody @Valid EmpresaRequestDTO dados) {
        String email = dados.email().trim().toLowerCase();

        if (repository.existsByEmail(email) || cadastroRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "email", "mensagem", "E-mail já cadastrado no sistema."));
        }

        String cnpjLimpo = dados.cnpj().replaceAll("\\D", "");
        if (repository.existsByCnpj(dados.cnpj()) || repository.existsByCnpj(cnpjLimpo)) {
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

        String senhaCriptografada = passwordEncoder.encode(senhaPura);

        Empresa novaEmpresa = new Empresa();
        novaEmpresa.setCorporateName(dados.corporateName());
        novaEmpresa.setEmail(email);
        novaEmpresa.setCnpj(cnpjLimpo);
        novaEmpresa.setPassword(senhaCriptografada);
        novaEmpresa.setSenha(senhaCriptografada);

        repository.save(novaEmpresa);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Empresa cadastrada com sucesso!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody @Valid EmpresaLoginDTO dados) {
        try {
            String senhaLogin = dados.password() != null ? dados.password() : dados.senha();//Captura usando a sintaxe de Record

            if (senhaLogin == null || senhaLogin.isBlank()) {
                return ResponseEntity.badRequest().body("A senha é obrigatória.");
            }

            var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), senhaLogin);

            Authentication authentication = manager.authenticate(authenticationToken);//Dispara a validação cruzada do Spring Security

            var tokenJWT = tokenService.gerarToken((Empresa) authentication.getPrincipal());//Se as credenciais estiverem corretas, gera o Token de acesso

            return ResponseEntity.ok(new TokenDadosEmpresaDTO(tokenJWT));//Retorna o token
        } catch (Exception e) {
            return ResponseEntity.status(401).body("E-mail ou senha inválidos.");
        }
    }
}
