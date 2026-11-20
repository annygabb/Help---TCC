package com.example.Help.Service;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.mensagem.*;
import com.example.Help.model.notificacao.TipoNotificacao;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class MensagemService {
    private final MensagemRepository repository;
    private final ParticipanteService participantes;
    private final NotificacaoService notificacoes;
    private final ControleConversaRepository controles;

    public MensagemService(MensagemRepository repository, ParticipanteService participantes,
                           NotificacaoService notificacoes, ControleConversaRepository controles) {
        this.repository = repository;
        this.participantes = participantes;
        this.notificacoes = notificacoes;
        this.controles = controles;
    }

    @Transactional
    public MensagemResponseDTO enviar(ParticipanteSocial remetente, MensagemRequestDTO data) {
        String conteudo = data.conteudo() == null ? "" : data.conteudo().trim();
        if (conteudo.isEmpty()) throw new RuntimeException("O conteúdo da mensagem é obrigatório.");

        ParticipanteSocial destinatario = participantes.buscarAtivo(
                data.destinatarioId(), data.tipoDestinatarioEfetivo());
        if (mesmaConta(remetente, destinatario)) {
            throw new RuntimeException("Você não pode enviar uma mensagem para si mesmo.");
        }

        if (bloqueada(remetente, destinatario) || bloqueada(destinatario, remetente))
            throw new RuntimeException("Não é possível enviar mensagens para esta conta.");

        Mensagem salva = repository.save(new Mensagem(remetente, destinatario, conteudo));
        String preview = conteudo.length() > 80 ? conteudo.substring(0, 80) + "..." : conteudo;
        notificacoes.criarOuAtualizar(destinatario, TipoNotificacao.NOVA_MENSAGEM,
                "Nova mensagem de " + remetente.getNomeSocial(), preview, remetente);
        return MensagemResponseDTO.fromEntity(salva);
    }

    public List<MensagemResponseDTO> buscarConversa(ParticipanteSocial atual, UUID outraId, TipoParticipante outroTipo) {
        ParticipanteSocial outra = participantes.buscarAtivo(outraId, outroTipo);
        var limite = controles.findByContaIdAndContaTipoAndOutroIdAndOutroTipo(atual.getId(), atual.getTipoParticipante(), outraId, outroTipo)
                .map(ControleConversa::getOcultaAte).orElse(null);
        return repository.buscarConversa(id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA),
                        id(outra, TipoParticipante.USUARIO), id(outra, TipoParticipante.EMPRESA)).stream()
                .filter(m -> limite == null || (m.getDataEnvio() != null && m.getDataEnvio().isAfter(limite)))
                .map(MensagemResponseDTO::fromEntity).toList();
    }

    @Transactional
    public void marcarConversaComoLida(ParticipanteSocial atual, UUID outraId, TipoParticipante outroTipo) {
        ParticipanteSocial outra = participantes.buscarAtivo(outraId, outroTipo);
        List<Mensagem> mensagens = repository.buscarNaoLidas(
                id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA),
                id(outra, TipoParticipante.USUARIO), id(outra, TipoParticipante.EMPRESA));
        mensagens.forEach(m -> m.setLida(true));
        repository.saveAll(mensagens);
    }

    public List<ConversaResponseDTO> listarConversas(ParticipanteSocial atual) {
        List<Mensagem> todas = repository.buscarTodasDaConta(
                id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA));
        LinkedHashMap<String, Mensagem> ultimas = new LinkedHashMap<>();
        Map<String, java.time.LocalDateTime> ocultas = new HashMap<>();
        for (ControleConversa controle : controles.findByContaIdAndContaTipo(atual.getId(), atual.getTipoParticipante())) {
            if (controle.getOcultaAte() != null) ocultas.put(controle.getOutroTipo() + ":" + controle.getOutroId(), controle.getOcultaAte());
        }
        for (Mensagem mensagem : todas) {
            ParticipanteSocial outro = mesmaConta(mensagem.getRemetenteSocial(), atual)
                    ? mensagem.getDestinatarioSocial() : mensagem.getRemetenteSocial();
            var limite = ocultas.get(chave(outro));
            if (limite == null || (mensagem.getDataEnvio() != null && mensagem.getDataEnvio().isAfter(limite)))
                ultimas.putIfAbsent(chave(outro), mensagem);
        }

        List<ConversaResponseDTO> resposta = new ArrayList<>();
        for (Mensagem ultima : ultimas.values()) {
            ParticipanteSocial outro = mesmaConta(ultima.getRemetenteSocial(), atual)
                    ? ultima.getDestinatarioSocial() : ultima.getRemetenteSocial();
            long naoLidas = repository.contarNaoLidas(
                    id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA),
                    id(outro, TipoParticipante.USUARIO), id(outro, TipoParticipante.EMPRESA));
            resposta.add(new ConversaResponseDTO(outro.getId(), outro.getTipoParticipante(),
                    outro.getNomeSocial(), subtitulo(outro), com.example.Help.util.Miniaturas.avatar(outro.getFotoUrl()), ultima.getConteudo(),
                    DataHora.comoUtc(ultima.getDataEnvio()), naoLidas));
        }
        return resposta;
    }

    public long contarNaoLidas(ParticipanteSocial atual) {
        return repository.contarTotalNaoLidas(id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA));
    }

    @Transactional
    public void ocultarConversa(ParticipanteSocial atual, UUID outroId, TipoParticipante tipo) {
        ParticipanteSocial outro = participantes.buscarAtivo(outroId, tipo);
        if (mesmaConta(atual, outro)) throw new IllegalArgumentException("Conta inválida.");
        ControleConversa controle = obterControle(atual, outro);
        controle.setOcultaAte(DataHora.agoraUtc());
        controles.save(controle);
        marcarConversaComoLida(atual, outroId, tipo);
    }

    @Transactional
    public boolean definirBloqueio(ParticipanteSocial atual, UUID outroId, TipoParticipante tipo, boolean bloquear) {
        ParticipanteSocial outro = participantes.buscarAtivo(outroId, tipo);
        if (mesmaConta(atual, outro)) throw new IllegalArgumentException("Você não pode bloquear a própria conta.");
        ControleConversa controle = obterControle(atual, outro);
        controle.setBloqueado(bloquear);
        controles.save(controle);
        return bloquear;
    }

    public boolean estaBloqueada(ParticipanteSocial atual, UUID outroId, TipoParticipante tipo) {
        return controles.existsByContaIdAndContaTipoAndOutroIdAndOutroTipoAndBloqueadoTrue(atual.getId(), atual.getTipoParticipante(), outroId, tipo);
    }

    private boolean bloqueada(ParticipanteSocial atual, ParticipanteSocial outro) {
        return estaBloqueada(atual, outro.getId(), outro.getTipoParticipante());
    }

    private ControleConversa obterControle(ParticipanteSocial atual, ParticipanteSocial outro) {
        return controles.findByContaIdAndContaTipoAndOutroIdAndOutroTipo(atual.getId(), atual.getTipoParticipante(), outro.getId(), outro.getTipoParticipante())
                .orElseGet(() -> { ControleConversa c = new ControleConversa(); c.setContaId(atual.getId()); c.setContaTipo(atual.getTipoParticipante());
                    c.setOutroId(outro.getId()); c.setOutroTipo(outro.getTipoParticipante()); return c; });
    }

    private UUID id(ParticipanteSocial participante, TipoParticipante tipo) {
        return participante.getTipoParticipante() == tipo ? participante.getId() : null;
    }

    private boolean mesmaConta(ParticipanteSocial a, ParticipanteSocial b) {
        return a.getTipoParticipante() == b.getTipoParticipante() && a.getId().equals(b.getId());
    }

    private String chave(ParticipanteSocial p) { return p.getTipoParticipante() + ":" + p.getId(); }

    private String subtitulo(ParticipanteSocial p) {
        if (p instanceof Usuario usuario) return usuario.getCargo();
        if (p instanceof Empresa empresa) return empresa.getEmail();
        return null;
    }
}
