package com.example.Help.model.cadastro;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController //recebe os dados
@RequestMapping("cadastro")
public class CadastroController {

    @Autowired //usa o cadastrorepository para guardar os dados do banco automaticamente
    private CadastroRepository repository;

    @PostMapping
    public void criarUsuario(@RequestBody Cadastro data) {
        repository.save(data);
    }

    @GetMapping
    public List<Cadastro> listarUsuarios() {
        return repository.findAll();
    }
}

//o post vai receber os dados do react, transformar em json, insere no banco, depois busca os dados, transforma em lista e devolve pro react