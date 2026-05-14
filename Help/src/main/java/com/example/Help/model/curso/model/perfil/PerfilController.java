package com.example.Help.model.perfil;

import com.example.Help.Service.ArquivoService;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/perfis")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowedHeaders = "*", allowCredentials = "true")
public class PerfilController {

    private static final List<Perfil> bancoEmMemoria = new ArrayList<>();

    @Autowired(required = false)
    private ArquivoService arquivoService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    static {
        Perfil p = new Perfil();
        p.setId(UUID.fromString("928498b6-0b9c-411a-ab08-9aa202358d61"));
        p.setName("Anny Gabrielly (Mock)");
        p.setExperiencias(new ArrayList<>());
        p.setCursos(new ArrayList<>());
        bancoEmMemoria.add(p);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updatePerfil(
            @PathVariable UUID id,
            @RequestPart("dados") String perfilJson,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            @RequestPart(value = "curriculo", required = false) MultipartFile pdf,
            @RequestPart(value = "certificados", required = false) List<MultipartFile> certificados) {

        System.out.println(">>> [TESTE MOCK] Recebido PUT para ID: " + id);

        Optional<Perfil> perfilOpt = bancoEmMemoria.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();

        if (perfilOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Perfil perfilExistente = perfilOpt.get();

        try {

            String jsonLimpo = perfilJson.replaceAll("\"id\":\\s*\\d+", "\"id\":null");

            Perfil novosDados = objectMapper.readValue(jsonLimpo, Perfil.class);

            if (novosDados.getName() != null) perfilExistente.setName(novosDados.getName());//atualização de campos
            if (novosDados.getBio() != null) perfilExistente.setBio(novosDados.getBio());
            if (novosDados.getCargoAtual() != null) perfilExistente.setCargoAtual(novosDados.getCargoAtual());

            if (novosDados.getCursos() != null) {
                novosDados.getCursos().forEach(curso -> {
                    if (curso.getId() == null) {
                        curso.setId(UUID.randomUUID()); //gera um UUID válido
                    }
                });
                perfilExistente.setCursos(new ArrayList<>(novosDados.getCursos()));
            }

            if (novosDados.getExperiencias() != null) {
                perfilExistente.setExperiencias(new ArrayList<>(novosDados.getExperiencias()));
            }

            if (foto != null && !foto.isEmpty()) perfilExistente.setFotoUrl("mock_foto_" + foto.getOriginalFilename());
            if (pdf != null && !pdf.isEmpty()) perfilExistente.setCurriculoUrl("mock_curriculo.pdf");

            System.out.println(">>> [TESTE MOCK] Perfil atualizado com sucesso!");
            return ResponseEntity.ok(perfilExistente);

        } catch (Exception e) {
            System.err.println(">>> Erro no processamento: " + e.getMessage());
            return ResponseEntity.status(400).body("Erro no formato dos dados JSON: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Perfil> getById(@PathVariable UUID id) {
        return bancoEmMemoria.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}