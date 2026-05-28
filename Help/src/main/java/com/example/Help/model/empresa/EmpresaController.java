package com.example.Help.model.empresa;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.Help.model.recuperacao.TokenService;

@RestController
@RequestMapping("/empresas")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class EmpresaController {

    @Autowired
    private EmpresaRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrarEmpresa(@RequestBody @Valid EmpresaRequestDTO dados) {
        if (repository.findByEmail(dados.email()).isPresent()) {//valida pelo email
            return ResponseEntity.badRequest().body("E-mail já cadastrado no sistema.");
        }

        String senhaPura = dados.password() != null ? dados.password() : dados.senha();//Captura o valor usando chamadas de métodos de Record

        if (senhaPura == null || senhaPura.isBlank()) {
            return ResponseEntity.badRequest().body("A senha é obrigatória.");
        }

        String senhaCriptografada = passwordEncoder.encode(senhaPura);//Criptografa a senha com BCrypt

        Empresa novaEmpresa = new Empresa();//alimenta a entidade Empresa
        novaEmpresa.setCorporateName(dados.corporateName());
        novaEmpresa.setEmail(dados.email());
        novaEmpresa.setCnpj(dados.cnpj());
        novaEmpresa.setPassword(senhaCriptografada);
        novaEmpresa.setSenha(senhaCriptografada);

        repository.save(novaEmpresa);//salva

        return ResponseEntity.ok().build();
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