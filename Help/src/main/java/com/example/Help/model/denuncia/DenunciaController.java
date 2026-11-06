package com.example.Help.model.denuncia;

import com.example.Help.Service.DenunciaService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/denuncias")
public class DenunciaController {
    private final DenunciaService service; public DenunciaController(DenunciaService s){service=s;}
    @PostMapping public DenunciaDtos.Resposta criar(@RequestBody @Valid DenunciaDtos.Criar d, Authentication a){return service.criar(d,a);}
    @GetMapping("/minhas") public List<DenunciaDtos.Resposta> minhas(Authentication a){return service.minhas(a);}
}
