package com.example.Help.model.cadastro;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CadastroRepository extends JpaRepository<Cadastro, UUID> {

    Optional<Cadastro> findByEmail(String email); //vai buscar o email
}