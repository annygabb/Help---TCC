package com.example.Help.model.publicacao;
import com.example.Help.Service.DataHora; import com.example.Help.model.social.TipoParticipante; import java.time.OffsetDateTime; import java.util.UUID;
public record ComentarioResponseDTO(UUID id,UUID autorId,TipoParticipante autorTipo,String autorNome,String autorFotoUrl,String conteudo,OffsetDateTime criadoEm){
 public static ComentarioResponseDTO from(ComentarioPublicacao c){return new ComentarioResponseDTO(c.getId(),c.getAutorId(),c.getAutorTipo(),c.getAutorNome(),c.getAutorFotoUrl(),c.getConteudo(),DataHora.comoUtc(c.getCriadoEm()));}
}
