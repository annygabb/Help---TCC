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

    public MensagemService(MensagemRepository repository, ParticipanteService participantes,
                           NotificacaoService notificacoes) {
        this.repository = repository;
        this.participantes = participantes;
        this.notificacoes = notificacoes;
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

        Mensagem salva = repository.save(new Mensagem(remetente, destinatario, conteudo));
        String preview = conteudo.length() > 80 ? conteudo.substring(0, 80) + "..." : conteudo;
        notificacoes.criarOuAtualizar(destinatario, TipoNotificacao.NOVA_MENSAGEM,
                "Nova mensagem de " + remetente.getNomeSocial(), preview, remetente);
        return MensagemResponseDTO.fromEntity(salva);
    }

    public List<MensagemResponseDTO> buscarConversa(ParticipanteSocial atual, UUID outraId, TipoParticipante outroTipo) {
        ParticipanteSocial outra = participantes.buscarAtivo(outraId, outroTipo);
        return repository.buscarConversa(id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA),
                        id(outra, TipoParticipante.USUARIO), id(outra, TipoParticipante.EMPRESA)).stream()
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
        for (Mensagem mensagem : todas) {
            ParticipanteSocial outro = mesmaConta(mensagem.getRemetenteSocial(), atual)
                    ? mensagem.getDestinatarioSocial() : mensagem.getRemetenteSocial();
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
                    outro.getNomeSocial(), subtitulo(outro), outro.getFotoUrl(), ultima.getConteudo(),
                    ultima.getDataEnvio(), naoLidas));
        }
        return resposta;
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
