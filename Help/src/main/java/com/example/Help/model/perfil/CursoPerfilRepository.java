package com.example.Help.model.perfil;

import com.example.Help.model.perfil.CursoPerfil;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CursoPerfilRepository extends JpaRepository<CursoPerfil, UUID> {
}
