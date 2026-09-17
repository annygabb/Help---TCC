package com.example.Help.model.cadastro;

import com.example.Help.Service.UsuarioService;
import com.example.Help.Service.PagamentoService;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.login.LoginRequestDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.example.Help.model.empresa.EmpresaRepository;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CadastroController {

    @Autowired
    private CadastroRepository repository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PagamentoService pagamentoService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO data) {
        var usuarioEncontrado = repository.findByEmail(data.email());

        if (usuarioEncontrado.isPresent()) {
            var usuario = usuarioEncontrado.get();

            if (passwordEncoder.matches(data.password(), usuario.getPassword())) {
                String token = tokenService.gerarToken(usuario);
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "id", usuario.getId(),
                        "nome", usuario.getName(),
                        "email", usuario.getEmail()
                ));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "E-mail ou senha inválidos."));
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<?> criarUsuario(@RequestBody @Valid CadastroRequestDTO data) {
        String email = data.email().trim().toLowerCase();

        if (repository.existsByEmail(email) || (empresaRepository != null && empresaRepository.existsByEmail(email))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("campo", "email", "mensagem", "E-mail já cadastrado no sistema."));
        }

        String cpfLimpo = data.cpf() != null ? data.cpf().replaceAll("\\D", "") : null;
        if (cpfLimpo != null && !cpfLimpo.isBlank()) {
            if (repository.existsByCpf(cpfLimpo) || repository.existsByCpf(data.cpf())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("campo", "cpf", "mensagem", "CPF já cadastrado no sistema."));
            }
        }

        Cadastro novoUsuario = new Cadastro();
        novoUsuario.setName(data.name());
        novoUsuario.setEmail(email);
        novoUsuario.setPassword(passwordEncoder.encode(data.password()));
        novoUsuario.setCpf(cpfLimpo);

        Cadastro salvo = repository.save(novoUsuario);

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
            var usuarioExistente = repository.findById(id);
            if (usuarioExistente.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
            }

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> dados = objectMapper.readValue(dadosJson, new TypeReference<Map<String, Object>>() {});

            var usuario = usuarioExistente.get();

            if (dados.containsKey("name")) usuario.setName((String) dados.get("name"));

            if (foto != null && !foto.isEmpty()) {
                System.out.println("Recebendo foto: " + foto.getOriginalFilename());
            }

            repository.save(usuario);
            return ResponseEntity.ok(Map.of("message", "Perfil atualizado com sucesso!"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar atualização: " + e.getMessage());
        }
    }

    @PostMapping("/gerar-token")
    public ResponseEntity<?> solicitarToken(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        try {
            if (!repository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "E-mail não encontrado no sistema."));
            }

            pagamentoService.gerarTokenMatricula(email, "Recuperação de Senha");

            return ResponseEntity.ok(Map.of("message", "Código enviado com sucesso para " + email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao processar solicitação: " + e.getMessage()));
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<CadastroResponseDTO>> listarUsuarios() {
        List<Cadastro> usuarios = repository.findAll();
        if (usuarios.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<CadastroResponseDTO> responseList = usuarios.stream()
                .map(u -> new CadastroResponseDTO(u.getId(), u.getName(), u.getEmail(), u.getCpf()))
                .toList();
        return ResponseEntity.ok(responseList);
    }
}