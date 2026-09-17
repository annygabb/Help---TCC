package com.example.Help.model.recuperacao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.example.Help.model.usuario.Usuario;
import java.util.Optional;

@Repository
public interface TokenRecuperacaoRepository extends JpaRepository<TokenRecuperacao, Long> {

    Optional<TokenRecuperacao> findByToken(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM TokenRecuperacao t WHERE t.usuario = :usuario")
    void deleteByUsuario(Usuario usuario);
}