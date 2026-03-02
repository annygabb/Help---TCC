package com.example.Help.model.vaga;

import com.example.Help.model.vaga.Vaga;
import com.example.Help.model.vaga.VagaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController //recebe e leva as informações
@RequestMapping("vagas") //define a rota pra conexão

public class VagaController {

    @Autowired
    private VagaRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*") //não deixa qualquer lugar acessar os dados, porém com o * é possível
    @PostMapping //verifica se os dados estão corretos
    public void saveVaga(@RequestBody Vaga data) { //ele lê os dados que vem em JSON e encaixa eles
        repository.save(data); //ele está escrevendo automaticamente os comandos de sql, por exempleo, verifica se o código é em ID, ou UUID, se for novo ele sobe para o banco e salva, se já existir ele atualiza
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping //vê que está pedindo os dados e solicita pra buscar eles
    public List<Vaga> getAll() { //lista todas as vagas
        return repository.findAll(); //pega os dados que pedimos para o banco e devolve
    }
}