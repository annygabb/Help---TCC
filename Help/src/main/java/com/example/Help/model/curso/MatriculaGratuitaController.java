package com.example.Help.model.curso;

import com.example.Help.Service.MatriculaGratuitaService;
import com.example.Help.Service.UsuarioAutenticadoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/matriculas/gratuitas")
public class MatriculaGratuitaController {
    private final MatriculaGratuitaService service;
    private final UsuarioAutenticadoService usuarioService;
    public MatriculaGratuitaController(MatriculaGratuitaService service, UsuarioAutenticadoService usuarioService) {
        this.service = service;
        this.usuarioService = usuarioService;
    }
    @PostMapping("/{curso}/solicitar")
    public Map<String, String> solicitar(@PathVariable String curso, Authentication auth) {
        service.solicitar(usuarioService.obter(auth), curso);
        return Map.of("mensagem", "Código enviado. Verifique seu e-mail.");
    }
    @PostMapping("/{curso}/confirmar")
    public Map<String, String> confirmar(@PathVariable String curso, @RequestBody Map<String, String> dados, Authentication auth) {
        service.confirmar(usuarioService.obter(auth), curso, dados.get("codigo"));
        return Map.of("mensagem", "Matrícula confirmada.");
    }
    @GetMapping("/minhas")
    public List<Map<String, String>> minhas(Authentication auth) { return service.minhas(usuarioService.obter(auth)); }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> erro(ResponseStatusException erro) {
        return ResponseEntity.status(erro.getStatusCode()).body(Map.of("mensagem", erro.getReason() == null ? "Não foi possível concluir a matrícula." : erro.getReason()));
    }
}
