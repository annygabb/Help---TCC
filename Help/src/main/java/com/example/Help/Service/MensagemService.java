package com.example.Help.Service;

import com.example.Help.model.mensagem.*;
import com.example.Help.model.notificacao.TipoNotificacao;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class MensagemService {

    @Autowired
    private MensagemRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    @Transactional
    public MensagemResponseDTO enviar(UUID remetenteId, MensagemRequestDTO data) {
        if (remetenteId.equals(data.destinatarioId())) {
            throw new RuntimeException("Você não pode enviar uma mensagem para si mesmo.");
        }

        Usuario remetente = usuarioRepository.findById(remetenteId)
                .orElseThrow(() -> new RuntimeException("Usuário remetente não encontrado."));
        Usuario destinatario = usuarioRepository.findById(data.destinatarioId())
                .orElseThrow(() -> new RuntimeException("Usuário destinatário não encontrado."));

        Mensagem mensagem = repository.save(new Mensagem(remetente, destinatario, data.conteudo()));

        String preview = data.conteudo().length() > 80
                ? data.conteudo().substring(0, 80) + "..."
                : data.conteudo();

        //varias mensagens seguidas viram so uma notificação
        notificacaoService.criarOuAtualizarNotificacao(
                destinatario,
                TipoNotificacao.NOVA_MENSAGEM,
                "Nova mensagem de " + remetente.getName(),
                preview,
                remetente.getId(),
                remetente.getName()
        );

        return MensagemResponseDTO.fromEntity(mensagem);
    }

    public List<MensagemResponseDTO> buscarConversa(UUID usuarioLogadoId, UUID outroUsuarioId) {
        return repository.buscarConversa(usuarioLogadoId, outroUsuarioId)
                .stream()
                .map(MensagemResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public void marcarConversaComoLida(UUID usuarioLogadoId, UUID outroUsuarioId) {
        List<Mensagem> naoLidas =
                repository.findByDestinatario_IdAndRemetente_IdAndLidaFalse(usuarioLogadoId, outroUsuarioId);
        naoLidas.forEach(m -> m.setLida(true));
        repository.saveAll(naoLidas);
    }

    //monta a lista lateral do chat, uma linha por pessoa
    public List<ConversaResponseDTO> listarConversas(UUID usuarioLogadoId) {
        List<Mensagem> todas = repository.buscarTodasDoUsuario(usuarioLogadoId);

        //a query ja vem ordenada por data, entao o putIfAbsent guarda so a mais recente
        LinkedHashMap<UUID, Mensagem> ultimaPorConversa = new LinkedHashMap<>();

        for (Mensagem m : todas) {
            Usuario outro = m.getRemetente().getId().equals(usuarioLogadoId)
                    ? m.getDestinatario()
                    : m.getRemetente();
            ultimaPorConversa.putIfAbsent(outro.getId(), m);
        }

        List<ConversaResponseDTO> resultado = new ArrayList<>();

        for (Map.Entry<UUID, Mensagem> entry : ultimaPorConversa.entrySet()) {
            UUID outroId = entry.getKey();
            Mensagem ultima = entry.getValue();

            Usuario outro = ultima.getRemetente().getId().equals(outroId)
                    ? ultima.getRemetente()
                    : ultima.getDestinatario();

            long naoLidas = repository
                    .countByDestinatario_IdAndRemetente_IdAndLidaFalse(usuarioLogadoId, outroId);

            resultado.add(new ConversaResponseDTO(
                    outro.getId(),
                    outro.getName(),
                    outro.getCargo(),
                    ultima.getConteudo(),
                    ultima.getDataEnvio(),
                    naoLidas
            ));
        }

        return resultado;
    }
}
