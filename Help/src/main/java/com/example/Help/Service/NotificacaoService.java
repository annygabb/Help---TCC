package com.example.Help.Service;

import com.example.Help.model.notificacao.Notificacao;
import com.example.Help.model.notificacao.NotificacaoRepository;
import com.example.Help.model.notificacao.NotificacaoResponseDTO;
import com.example.Help.model.notificacao.TipoNotificacao;
import com.example.Help.model.usuario.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificacaoService {

    @Autowired
    private NotificacaoRepository repository;

    @Transactional
    public void criarNotificacao(Usuario destinatario, TipoNotificacao tipo, String titulo,
                                 String mensagem, UUID origemId, String origemNome) {
        repository.save(new Notificacao(destinatario, tipo, titulo, mensagem, origemId, origemNome));
    }

    //se ja existe uma nao lida da mesma pessoa so atualiza, pra nao encher a lista
    @Transactional
    public void criarOuAtualizarNotificacao(Usuario destinatario, TipoNotificacao tipo, String titulo,
                                            String mensagem, UUID origemId, String origemNome) {
        var existente = repository.findFirstByUsuario_IdAndOrigemIdAndTipoAndLidaFalse(
                destinatario.getId(), origemId, tipo);

        if (existente.isPresent()) {
            Notificacao n = existente.get();
            n.setTitulo(titulo);
            n.setMensagem(mensagem);
            n.setDataCriacao(LocalDateTime.now());
            repository.save(n);
            return;
        }

        criarNotificacao(destinatario, tipo, titulo, mensagem, origemId, origemNome);
    }

    public List<NotificacaoResponseDTO> listarPorUsuario(UUID usuarioId) {
        return repository.findByUsuario_IdOrderByDataCriacaoDesc(usuarioId)
                .stream()
                .map(NotificacaoResponseDTO::fromEntity)
                .toList();
    }

    public long contarNaoLidas(UUID usuarioId) {
        return repository.countByUsuario_IdAndLidaFalse(usuarioId);
    }

    @Transactional
    public void marcarComoLida(UUID notificacaoId, UUID usuarioId) {
        Notificacao notificacao = repository.findById(notificacaoId)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada."));

        if (!notificacao.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("Você não tem permissão para alterar esta notificação.");
        }

        notificacao.setLida(true);
        repository.save(notificacao);
    }

    @Transactional
    public void marcarTodasComoLidas(UUID usuarioId) {
        List<Notificacao> naoLidas = repository.findByUsuario_IdAndLidaFalse(usuarioId);
        naoLidas.forEach(n -> n.setLida(true));
        repository.saveAll(naoLidas);
    }
}
