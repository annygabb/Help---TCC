package com.example.Help.model.curso;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatriculaGratuitaRepository extends JpaRepository<MatriculaGratuita, UUID> {
    Optional<MatriculaGratuita> findByUsuarioIdAndCursoCodigo(UUID usuarioId, String cursoCodigo);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from MatriculaGratuita m where m.usuarioId = :usuarioId and m.cursoCodigo = :cursoCodigo")
    Optional<MatriculaGratuita> buscarComBloqueio(@Param("usuarioId") UUID usuarioId, @Param("cursoCodigo") String cursoCodigo);
    List<MatriculaGratuita> findByUsuarioIdAndConfirmadaTrue(UUID usuarioId);
}
