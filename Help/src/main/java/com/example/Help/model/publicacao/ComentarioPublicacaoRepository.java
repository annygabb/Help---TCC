package com.example.Help.model.publicacao;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ComentarioPublicacaoRepository extends JpaRepository<ComentarioPublicacao,UUID>{List<ComentarioPublicacao> findAllByPublicacaoIdOrderByCriadoEmAsc(UUID id);}
