package com.example.Help.model.admin;

import com.example.Help.Service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/resumo")
    public AdminDtos.Resumo resumo() {
        return adminService.resumo();
    }

    @GetMapping("/contas")
    public Page<AdminDtos.ContaLista> listarContas(
            @RequestParam(defaultValue = "") String busca,
            @RequestParam(defaultValue = "") String tipo,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.listarContas(busca, tipo, status, page, size);
    }

    @GetMapping("/contas/{id}")
    public AdminDtos.ContaDetalhe buscarConta(@PathVariable UUID id) {
        return adminService.buscarConta(id);
    }

    @PatchMapping("/contas/{id}/status")
    public ResponseEntity<AdminDtos.ContaDetalhe> alterarStatusConta(
            @PathVariable UUID id,
            @RequestBody AdminDtos.AlterarStatus dados,
            Authentication authentication
    ) {
        return ResponseEntity.ok(adminService.alterarStatusConta(id, dados, authentication));
    }

    @GetMapping("/empresas")
    public Page<AdminDtos.EmpresaLista> listarEmpresas(
            @RequestParam(defaultValue = "") String busca,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.listarEmpresas(busca, status, page, size);
    }

    @GetMapping("/empresas/{id}")
    public AdminDtos.EmpresaDetalhe buscarEmpresa(@PathVariable UUID id) {
        return adminService.buscarEmpresa(id);
    }

    @PatchMapping("/empresas/{id}/status")
    public ResponseEntity<AdminDtos.EmpresaDetalhe> alterarStatusEmpresa(
            @PathVariable UUID id,
            @RequestBody AdminDtos.AlterarStatus dados,
            Authentication authentication
    ) {
        return ResponseEntity.ok(adminService.alterarStatusEmpresa(id, dados, authentication));
    }
}
