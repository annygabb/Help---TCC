package com.example.Help.Service;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.notificacao.TipoNotificacao;
import com.example.Help.model.seguidor.*;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SeguidorService {
    private final SeguidorRepository repository;
    private final ParticipanteService participantes;
    private final NotificacaoService notificacoes;

    public SeguidorService(SeguidorRepository repository, ParticipanteService participantes,
                           NotificacaoService notificacoes) {
        this.repository = repository;
        this.participantes = participantes;
        this.notificacoes = notificacoes;
    }

    @Transactional
    public void seguir(ParticipanteSocial seguidor, UUID seguidoId, TipoParticipante seguidoTipo) {
        ParticipanteSocial seguido = participantes.buscarAtivo(seguidoId, seguidoTipo);
        if (mesmaConta(seguidor, seguido)) throw new RuntimeException("Você não pode seguir a si mesmo.");
        if (existe(seguidor, seguido)) throw new RuntimeException("Você já está seguindo esta conta.");

        repository.save(new Seguidor(seguidor, seguido));
        notificacoes.criar(seguido, TipoNotificacao.NOVO_SEGUIDOR, "Novo seguidor",
                seguidor.getNomeSocial() + " começou a seguir você.", seguidor);
    }

    @Transactional
    public void deixarDeSeguir(ParticipanteSocial seguidor, UUID seguidoId, TipoParticipante seguidoTipo) {
        ParticipanteSocial seguido = participantes.buscarAtivo(seguidoId, seguidoTipo);
        Seguidor relacao = repository.encontrar(id(seguidor, TipoParticipante.USUARIO),
                        id(seguidor, TipoParticipante.EMPRESA), id(seguido, TipoParticipante.USUARIO),
                        id(seguido, TipoParticipante.EMPRESA))
                .orElseThrow(() -> new RuntimeException("Você não segue esta conta."));
        repository.delete(relacao);
    }

    public List<SeguidorResponseDTO> listarSeguindo(ParticipanteSocial atual) {
        return repository.listarSeguindo(id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA))
                .stream().map(s -> montarDTO(s.getSeguidoSocial(), atual)).toList();
    }

    public List<SeguidorResponseDTO> listarSeguidores(ParticipanteSocial atual) {
        return repository.listarSeguidores(id(atual, TipoParticipante.USUARIO), id(atual, TipoParticipante.EMPRESA))
                .stream().map(s -> montarDTO(s.getSeguidorSocial(), atual)).toList();
    }

    public List<ParticipanteSocial> listarParticipantesSeguidores(ParticipanteSocial conta) {
        return repository.listarSeguidores(id(conta, TipoParticipante.USUARIO), id(conta, TipoParticipante.EMPRESA))
                .stream()
                .map(Seguidor::getSeguidorSocial)
                .filter(ParticipanteSocial::isAtivo)
                .toList();
    }

    public boolean estaSeguindo(ParticipanteSocial seguidor, UUID seguidoId, TipoParticipante seguidoTipo) {
        ParticipanteSocial seguido = participantes.buscarAtivo(seguidoId, seguidoTipo);
        return existe(seguidor, seguido);
    }

    public ContagemSeguidoresDTO contar(UUID contaId, TipoParticipante tipo) {
        ParticipanteSocial conta = participantes.buscarAtivo(contaId, tipo);
        return new ContagemSeguidoresDTO(
                repository.contarSeguidores(id(conta, TipoParticipante.USUARIO), id(conta, TipoParticipante.EMPRESA)),
                repository.contarSeguindo(id(conta, TipoParticipante.USUARIO), id(conta, TipoParticipante.EMPRESA)));
    }

    private boolean existe(ParticipanteSocial seguidor, ParticipanteSocial seguido) {
        return repository.existe(id(seguidor, TipoParticipante.USUARIO), id(seguidor, TipoParticipante.EMPRESA),
                id(seguido, TipoParticipante.USUARIO), id(seguido, TipoParticipante.EMPRESA));
    }

    private SeguidorResponseDTO montarDTO(ParticipanteSocial conta, ParticipanteSocial atual) {
        String cargo = conta instanceof Usuario usuario ? usuario.getCargo() : "Empresa";
        String localizacao = conta instanceof Usuario usuario ? usuario.getCidade()
                : conta instanceof Empresa empresa ? empresa.getEmail() : null;
        return new SeguidorResponseDTO(conta.getId(), conta.getTipoParticipante(), conta.getNomeSocial(),
                cargo, localizacao, conta.getFotoUrl(), existe(atual, conta));
    }

    private UUID id(ParticipanteSocial p, TipoParticipante tipo) {
        return p.getTipoParticipante() == tipo ? p.getId() : null;
    }

    private boolean mesmaConta(ParticipanteSocial a, ParticipanteSocial b) {
        return a.getTipoParticipante() == b.getTipoParticipante() && a.getId().equals(b.getId());
    }
}
