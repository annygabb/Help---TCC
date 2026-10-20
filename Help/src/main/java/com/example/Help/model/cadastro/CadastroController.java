package com.example.Help.model.cadastro;

import com.example.Help.Service.AdminAccountService;
import com.example.Help.Service.PagamentoService;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.TipoConta;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class CadastroController {

    private final UsuarioRepository repository;
    private final EmpresaRepository empresaRepository;
    private final PagamentoService pagamentoService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AdminAccountService adminAccountService;

    public CadastroController(
            UsuarioRepository repository,
            EmpresaRepository empresaRepository,
            PagamentoService pagamentoService,
            PasswordEncoder passwordEncoder,
            TokenService tokenService,
            AdminAccountService adminAccountService
    ) {
        this.repository = repository;
        this.empresaRepository = empresaRepository;
        this.pagamentoService = pagamentoService;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.adminAccountService = adminAccountService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO data) {
        String email = Usuario.normalizarEmail(data.email());
        var encontrado = repository.findByEmailIgnoreCase(email);

        if (encontrado.isPresent()) {
            Usuario usuario = adminAccountService.sincronizar(encontrado.get());
            if (!usuario.isAtivo()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Conta desativada."));
            }
            if (passwordEncoder.matches(data.password(), usuario.getPassword())) {
                String token = tokenService.gerarToken(usuario);
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "id", usuario.getId(),
                        "nome", usuario.getName(),
                        "email", usuario.getEmail(),
                        "tipoConta", usuario.getTipoConta().name()
                ));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "E-mail ou senha inválidos."));
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<?> criarUsuario(@RequestBody @Valid CadastroRequestDTO data) {
        String email = Usuario.normalizarEmail(data.email());

        if (repository.existsByEmailIgnoreCase(email) || empresaRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "email", "mensagem", "E-mail já cadastrado no sistema."));
        }

        String cpfLimpo = data.cpf().replaceAll("\\D", "");
        if (repository.existsByCpf(cpfLimpo)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "cpf", "mensagem", "CPF já cadastrado no sistema."));
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setName(data.name().trim());
        novoUsuario.setEmail(email);
        novoUsuario.setSenha(passwordEncoder.encode(data.password()));
        novoUsuario.setCpf(cpfLimpo);
        novoUsuario.setTipoConta(adminAccountService.deveSerAdmin(email) ? TipoConta.ADMIN : TipoConta.CANDIDATO);
        novoUsuario.setAtivo(true);

        Usuario salvo = repository.save(novoUsuario);

        CadastroResponseDTO response = new CadastroResponseDTO(
                salvo.getId(),
                salvo.getName(),
                salvo.getEmail(),
                salvo.getCpf()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarPerfil(
            @PathVariable UUID id,
            @RequestPart("dados") String dadosJson,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {

        try {
            Usuario usuario = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> dados = objectMapper.readValue(
                    dadosJson,
                    new TypeReference<Map<String, Object>>() {}
            );

            if (dados.containsKey("name")) usuario.setName((String) dados.get("name"));
            repository.save(usuario);

            return ResponseEntity.ok(Map.of("message", "Perfil atualizado com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Não foi possível processar a atualização.");
        }
    }

    @PostMapping("/gerar-token")
    public ResponseEntity<?> solicitarToken(@RequestBody Map<String, String> payload) {
        String email = Usuario.normalizarEmail(payload.get("email"));
        try {
            if (!repository.existsByEmailIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "E-mail não encontrado no sistema."));
            }

            pagamentoService.gerarTokenMatricula(email, "Recuperação de Senha");
            return ResponseEntity.ok(Map.of("message", "Código enviado com sucesso para " + email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao processar solicitação."));
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<CadastroResponseDTO>> listarUsuarios() {
        List<CadastroResponseDTO> responseList = repository.findAll().stream()
                .map(u -> new CadastroResponseDTO(u.getId(), u.getName(), u.getEmail(), u.getCpf()))
                .toList();
        return ResponseEntity.ok(responseList);
    }
}
