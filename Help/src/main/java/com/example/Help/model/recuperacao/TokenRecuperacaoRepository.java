package com.example.Help.model.recuperacao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.example.Help.model.usuario.Usuario;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

@Repository
public interface TokenRecuperacaoRepository extends JpaRepository<TokenRecuperacao, UUID> {

    Optional<TokenRecuperacao> findByToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TokenRecuperacao t WHERE lower(t.usuario.email) = lower(:email)")
    Optional<TokenRecuperacao> buscarPorEmailComBloqueio(@Param("email") String email);

    @Modifying
    @Transactional
    @Query("DELETE FROM TokenRecuperacao t WHERE t.usuario = :usuario")
    void deleteByUsuario(Usuario usuario);
}
