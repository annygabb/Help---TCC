package com.example.Help.Service;

import com.example.Help.model.notificacao.*;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificacaoService {
    private final NotificacaoRepository repository;

    public NotificacaoService(NotificacaoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void criar(ParticipanteSocial destinatario, TipoNotificacao tipo, String titulo,
                      String mensagem, ParticipanteSocial origem) {
        repository.save(new Notificacao(destinatario, tipo, titulo, mensagem,
                origem.getId(), origem.getNomeSocial(), origem.getTipoParticipante()));
    }

    @Transactional
    public void criarOuAtualizar(ParticipanteSocial destinatario, TipoNotificacao tipo, String titulo,
                                 String mensagem, ParticipanteSocial origem) {
        UUID usuarioId = id(destinatario, TipoParticipante.USUARIO);
        UUID empresaId = id(destinatario, TipoParticipante.EMPRESA);
        var existente = repository.encontrarNaoLida(usuarioId, empresaId, origem.getId(),
                origem.getTipoParticipante(), tipo);
        if (existente.isPresent()) {
            Notificacao notificacao = existente.get();
            notificacao.setTitulo(titulo);
            notificacao.setMensagem(mensagem);
            notificacao.setOrigemNome(origem.getNomeSocial());
            notificacao.setDataCriacao(DataHora.agoraUtc());
            repository.save(notificacao);
        } else {
            criar(destinatario, tipo, titulo, mensagem, origem);
        }
    }

    public List<NotificacaoResponseDTO> listar(ParticipanteSocial destinatario) {
        return repository.listar(id(destinatario, TipoParticipante.USUARIO),
                        id(destinatario, TipoParticipante.EMPRESA)).stream()
                .map(n -> NotificacaoResponseDTO.fromEntity(n, fotoDaOrigem(n))).toList();
    }

    public long contarNaoLidas(ParticipanteSocial destinatario) {
        return repository.contarNaoLidas(id(destinatario, TipoParticipante.USUARIO),
                id(destinatario, TipoParticipante.EMPRESA));
    }

    @Transactional
    public void marcarComoLida(UUID notificacaoId, ParticipanteSocial destinatario) {
        Notificacao notificacao = repository.findById(notificacaoId)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada."));
        if (!mesmaConta(notificacao.getDestinatarioSocial(), destinatario)) {
            throw new RuntimeException("Você não tem permissão para alterar esta notificação.");
        }
        notificacao.setLida(true);
        repository.save(notificacao);
    }

    @Transactional
    public void marcarTodasComoLidas(ParticipanteSocial destinatario) {
        List<Notificacao> notificacoes = repository.listarNaoLidas(
                id(destinatario, TipoParticipante.USUARIO), id(destinatario, TipoParticipante.EMPRESA));
        notificacoes.forEach(n -> n.setLida(true));
        repository.saveAll(notificacoes);
    }

    // Compatibilidade com serviços antigos até a migração integral dos chamadores.
    public void criarNotificacao(Usuario destinatario, TipoNotificacao tipo, String titulo,
                                 String mensagem, UUID origemId, String origemNome) {
        repository.save(new Notificacao(destinatario, tipo, titulo, mensagem, origemId, origemNome));
    }

    public void criarOuAtualizarNotificacao(Usuario destinatario, TipoNotificacao tipo, String titulo,
                                            String mensagem, UUID origemId, String origemNome) {
        var origem = new Usuario();
        origem.setId(origemId);
        origem.setName(origemNome);
        origem.setAtivo(true);
        criarOuAtualizar(destinatario, tipo, titulo, mensagem, origem);
    }

    public List<NotificacaoResponseDTO> listarPorUsuario(UUID usuarioId) {
        return repository.listar(usuarioId, null).stream()
                .map(n -> NotificacaoResponseDTO.fromEntity(n, fotoDaOrigem(n))).toList();
    }

    public long contarNaoLidas(UUID usuarioId) { return repository.contarNaoLidas(usuarioId, null); }

    public void marcarComoLida(UUID notificacaoId, UUID usuarioId) {
        Usuario usuario = new Usuario(); usuario.setId(usuarioId); usuario.setAtivo(true);
        marcarComoLida(notificacaoId, usuario);
    }

    public void marcarTodasComoLidas(UUID usuarioId) {
        Usuario usuario = new Usuario(); usuario.setId(usuarioId); usuario.setAtivo(true);
        marcarTodasComoLidas(usuario);
    }

    private UUID id(ParticipanteSocial p, TipoParticipante tipo) {
        return p.getTipoParticipante() == tipo ? p.getId() : null;
    }

    private boolean mesmaConta(ParticipanteSocial a, ParticipanteSocial b) {
        return a != null && b != null && a.getTipoParticipante() == b.getTipoParticipante()
                && a.getId().equals(b.getId());
    }

    private String fotoDaOrigem(Notificacao notificacao) {
        if (notificacao.getOrigemId() == null || notificacao.getOrigemTipo() == null) return null;
        try {
            return notificacao.getOrigemTipo() == TipoParticipante.USUARIO
                    ? repository.buscarFotoUsuario(notificacao.getOrigemId())
                    : repository.buscarFotoEmpresa(notificacao.getOrigemId());
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
