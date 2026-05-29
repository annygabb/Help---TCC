package com.example.Help.model.cadastro;

import com.example.Help.Service.UsuarioService;
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

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CadastroController {

    @Autowired
    private CadastroRepository repository;

    @Autowired
    private UsuarioService usuarioService;

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
    public ResponseEntity<Cadastro> criarUsuario(@RequestBody @Valid Cadastro data) {
        if (repository.existsByEmail(data.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        String senhaCriptografada = passwordEncoder.encode(data.getPassword());
        data.setPassword(senhaCriptografada);

        Cadastro novoUsuario = repository.save(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
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
            usuarioService.gerarTokenMatricula(email, "Recuperação de Senha");
            return ResponseEntity.ok(Map.of("message", "Código enviado com sucesso para " + email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao processar solicitação: " + e.getMessage()));
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Cadastro>> listarUsuarios() {
        List<Cadastro> usuarios = repository.findAll();
        return usuarios.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(usuarios);
    }
}