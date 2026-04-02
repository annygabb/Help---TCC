package com.example.Help.model.usuario;

import com.example.Help.Service.UsuarioService;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.recuperacao.DadosTokenJWT;
import com.example.Help.model.recuperacao.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody @Valid UsuarioRequestDTO data) {
        try {
            service.salvar(data);
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO data) {
        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(data.email(), data.password());
            var authentication = manager.authenticate(authenticationToken);

            var usuario = (Usuario) authentication.getPrincipal();

            var tokenJWT = tokenService.gerarToken(usuario);

            return ResponseEntity.ok(new DadosTokenJWT(tokenJWT, usuario.getId(), usuario.getName(), usuario.getEmail()));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha inválidos.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro no servidor.");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarPerfil(@PathVariable UUID id, @RequestBody @Valid UsuarioRequestDTO data) {
        try {
            service.atualizarPerfil(id, data);
            return ResponseEntity.ok("Perfil atualizado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @PostMapping("/gerar-token")
    public ResponseEntity<String> solicitarToken(@RequestParam String email) {
        try {
            String token = service.gerarTokenRecuperacao(email);
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<String> redefinirSenha(@RequestParam String token, @RequestParam String novaSenha) {
        try {
            service.redefinirSenhaComToken(token, novaSenha);
            return ResponseEntity.ok("Senha alterada com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}