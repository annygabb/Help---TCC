package com.example.Help.Service;

import com.example.Help.model.denuncia.*;
import com.example.Help.model.publicacao.PublicacaoRepository;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.TipoConta;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.notificacao.TipoNotificacao;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class DenunciaService {
    private final DenunciaRepository repository; private final ParticipanteService participantes;
    private final PublicacaoRepository publicacoes; private final UsuarioRepository usuarios;
    private final EmpresaRepository empresas; private final NotificacaoService notificacoes;
    public DenunciaService(DenunciaRepository r, ParticipanteService p, PublicacaoRepository pub,
            UsuarioRepository u, EmpresaRepository e, NotificacaoService n) {
        repository=r; participantes=p; publicacoes=pub; usuarios=u; empresas=e; notificacoes=n;
    }

    @Transactional public DenunciaDtos.Resposta criar(DenunciaDtos.Criar dados, Authentication auth) {
        ParticipanteSocial autor = participantes.obterAutenticado(auth); Denuncia d = new Denuncia();
        d.setDenuncianteTipo(autor.getTipoParticipante()); d.setDenuncianteId(autor.getId()); d.setDenuncianteNome(autor.getNomeSocial());
        d.setAlvoTipo(dados.alvoTipo()); d.setAlvoId(dados.alvoId()); d.setAlvoNome(nomeAlvo(dados.alvoTipo(), dados.alvoId()));
        if (d.getDenuncianteTipo().name().equals(d.getAlvoTipo().name()) && d.getDenuncianteId().equals(d.getAlvoId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode denunciar a própria conta.");
        d.setMotivo(dados.motivo().trim()); d.setDescricao(limpar(dados.descricao(), 2000)); d.setPrioridade(prioridade(d.getMotivo()));
        return toDto(repository.save(d));
    }
    public List<DenunciaDtos.Resposta> minhas(Authentication auth) { var a=participantes.obterAutenticado(auth); return repository.findByDenuncianteTipoAndDenuncianteIdOrderByCriadaEmDesc(a.getTipoParticipante(),a.getId()).stream().map(this::toDto).toList(); }
    public List<DenunciaDtos.Resposta> listar(String status, String prioridade) {
        return repository.findAll().stream()
                .filter(d -> status == null || status.isBlank()
                        || (status.equalsIgnoreCase("ABERTAS") && d.getStatus() != StatusDenuncia.RESOLVIDA)
                        || d.getStatus().name().equalsIgnoreCase(status))
                .filter(d -> prioridade == null || prioridade.isBlank()
                        || d.getPrioridade().name().equalsIgnoreCase(prioridade))
                .sorted(Comparator.comparing(Denuncia::getCriadaEm,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto).toList();
    }
    @Transactional public DenunciaDtos.Resposta moderar(UUID id, DenunciaDtos.Moderar dados, Authentication auth) {
        Usuario admin=admin(auth);
        Denuncia d=repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Denúncia não encontrada."));
        String decisao = limpar(dados.decisao(), 50);
        if (dados.status() == StatusDenuncia.RESOLVIDA && decisao == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a decisão da moderação.");
        executarDecisao(d, decisao, admin);
        d.setStatus(dados.status()); d.setDecisao(decisao); d.setJustificativa(dados.justificativa().trim());
        d.setAdminId(admin.getId()); d.setAdminNome(admin.getName()); d.setAtualizadaEm(LocalDateTime.now());
        return toDto(repository.save(d));
    }

    private void executarDecisao(Denuncia d, String decisao, Usuario admin) {
        if (decisao == null || "SEM_ACAO".equals(decisao)) return;
        if ("REMOVER_CONTEUDO".equals(decisao)) {
            if (d.getAlvoTipo() != TipoAlvoDenuncia.PUBLICACAO)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta decisão só pode ser aplicada a publicações.");
            if (!publicacoes.existsById(d.getAlvoId()))
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada.");
            publicacoes.deleteById(d.getAlvoId());
            return;
        }
        ParticipanteSocial alvo = obterAlvoDaConta(d);
        if ("SUSPENDER_CONTA".equals(decisao)) {
            if (alvo instanceof Usuario u) { u.setAtivo(false); usuarios.save(u); }
            else if (alvo instanceof com.example.Help.model.empresa.Empresa e) { e.setAtivo(false); empresas.save(e); }
            return;
        }
        if ("ADVERTIR".equals(decisao)) {
            notificacoes.criar(alvo, TipoNotificacao.OUTRO, "Aviso da moderação",
                    "Sua conta recebeu uma advertência após análise administrativa.", admin);
        }
    }

    private ParticipanteSocial obterAlvoDaConta(Denuncia d) {
        if (d.getAlvoTipo() == TipoAlvoDenuncia.PUBLICACAO)
            return publicacoes.findById(d.getAlvoId()).map(p -> p.getAutorSocial())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada."));
        if (d.getAlvoTipo() == TipoAlvoDenuncia.USUARIO)
            return usuarios.findById(d.getAlvoId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        return empresas.findById(d.getAlvoId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada."));
    }
    private String nomeAlvo(TipoAlvoDenuncia tipo, UUID id) {
        if (tipo == TipoAlvoDenuncia.PUBLICACAO) {
            return publicacoes.findById(id)
                    .map(p -> "Publicação de " + p.getAutorSocial().getNomeSocial())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada."));
        }
        TipoParticipante t = tipo == TipoAlvoDenuncia.EMPRESA
                ? TipoParticipante.EMPRESA : TipoParticipante.USUARIO;
        return participantes.buscarAtivo(id, t).getNomeSocial();
    }
    private Usuario admin(Authentication a){ if(a!=null&&a.getPrincipal() instanceof Usuario u&&u.getTipoConta()==TipoConta.ADMIN)return u; throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Acesso administrativo necessário."); }
    private PrioridadeDenuncia prioridade(String m){ String n=m.toLowerCase(); return n.contains("ameaça")||n.contains("violência")?PrioridadeDenuncia.CRITICA:n.contains("assédio")||n.contains("fraude")?PrioridadeDenuncia.ALTA:PrioridadeDenuncia.MEDIA; }
    private String limpar(String v,int max){ if(v==null||v.isBlank())return null; v=v.trim(); return v.length()>max?v.substring(0,max):v; }
    private DenunciaDtos.Resposta toDto(Denuncia d){ return new DenunciaDtos.Resposta(d.getId(),d.getDenuncianteTipo().name(),d.getDenuncianteId(),d.getDenuncianteNome(),d.getAlvoTipo().name(),d.getAlvoId(),d.getAlvoNome(),d.getMotivo(),d.getDescricao(),d.getPrioridade().name(),d.getStatus().name(),d.getDecisao(),d.getJustificativa(),d.getAdminNome(),d.getCriadaEm(),d.getAtualizadaEm()); }
}
