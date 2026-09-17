package com.example.Help.Service;

import com.example.Help.model.notificacao.TipoNotificacao;
import com.example.Help.model.seguidor.ContagemSeguidoresDTO;
import com.example.Help.model.seguidor.Seguidor;
import com.example.Help.model.seguidor.SeguidorRepository;
import com.example.Help.model.seguidor.SeguidorResponseDTO;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SeguidorService {

    @Autowired
    private SeguidorRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    @Transactional
    public void seguir(UUID seguidorId, UUID seguidoId) {
        if (seguidorId.equals(seguidoId)) {
            throw new RuntimeException("Você não pode seguir a si mesmo.");
        }

        if (repository.existsBySeguidor_IdAndSeguido_Id(seguidorId, seguidoId)) {
            throw new RuntimeException("Você já está seguindo este usuário.");
        }

        Usuario seguidor = usuarioRepository.findById(seguidorId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        Usuario seguido = usuarioRepository.findById(seguidoId)
                .orElseThrow(() -> new RuntimeException("Usuário a seguir não encontrado."));

        repository.save(new Seguidor(seguidor, seguido));

        notificacaoService.criarNotificacao(
                seguido,
                TipoNotificacao.NOVO_SEGUIDOR,
                "Novo seguidor",
                seguidor.getName() + " começou a seguir você.",
                seguidor.getId(),
                seguidor.getName()
        );
    }

    @Transactional
    public void deixarDeSeguir(UUID seguidorId, UUID seguidoId) {
        if (!repository.existsBySeguidor_IdAndSeguido_Id(seguidorId, seguidoId)) {
            throw new RuntimeException("Você não segue este usuário.");
        }
        repository.deleteBySeguidor_IdAndSeguido_Id(seguidorId, seguidoId);
    }

    public List<SeguidorResponseDTO> listarSeguindo(UUID usuarioId, UUID usuarioLogadoId) {
        return repository.findBySeguidor_IdOrderByDataSeguindoDesc(usuarioId)
                .stream()
                .map(s -> montarDTO(s.getSeguido(), usuarioLogadoId))
                .toList();
    }

    public List<SeguidorResponseDTO> listarSeguidores(UUID usuarioId, UUID usuarioLogadoId) {
        return repository.findBySeguido_IdOrderByDataSeguindoDesc(usuarioId)
                .stream()
                .map(s -> montarDTO(s.getSeguidor(), usuarioLogadoId))
                .toList();
    }

    public boolean estaSeguindo(UUID seguidorId, UUID seguidoId) {
        return repository.existsBySeguidor_IdAndSeguido_Id(seguidorId, seguidoId);
    }

    public ContagemSeguidoresDTO contar(UUID usuarioId) {
        return new ContagemSeguidoresDTO(
                repository.countBySeguido_Id(usuarioId),
                repository.countBySeguidor_Id(usuarioId)
        );
    }

    private SeguidorResponseDTO montarDTO(Usuario usuario, UUID usuarioLogadoId) {
        //serve pro botao aparecer como Seguir ou Deixar de seguir
        boolean euSigoEle = repository.existsBySeguidor_IdAndSeguido_Id(usuarioLogadoId, usuario.getId());
        return new SeguidorResponseDTO(
                usuario.getId(),
                usuario.getName(),
                usuario.getCargo(),
                usuario.getCidade(),
                euSigoEle
        );
    }
}
