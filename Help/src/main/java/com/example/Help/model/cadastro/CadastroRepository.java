package com.example.Help.model.cadastro;

import com.example.Help.model.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Compatibilidade temporária para testes e código legado.
 * A entidade persistente é exclusivamente Usuario.
 */
@Deprecated
public interface CadastroRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<Usuario> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}
