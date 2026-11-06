package com.example.Help.model.admin;

import com.example.Help.Service.AvisoAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/avisos")
public class AvisoAdminController {
    private final AvisoAdminService service;
    public AvisoAdminController(AvisoAdminService service) { this.service = service; }

    @GetMapping public List<AvisoAdminResponse> listar() { return service.listar(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public AvisoAdminResponse publicar(@RequestBody @Valid AvisoAdminRequest request) { return service.publicar(request); }
}
