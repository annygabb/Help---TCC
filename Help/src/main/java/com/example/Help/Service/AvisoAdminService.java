package com.example.Help.Service;

import com.example.Help.model.admin.*;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.notificacao.Notificacao;
import com.example.Help.model.notificacao.NotificacaoRepository;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AvisoAdminService {
    private final AvisoAdminRepository avisos;
    private final UsuarioRepository usuarios;
    private final EmpresaRepository empresas;
    private final NotificacaoRepository notificacoes;

    public AvisoAdminService(AvisoAdminRepository avisos, UsuarioRepository usuarios,
                             EmpresaRepository empresas, NotificacaoRepository notificacoes) {
        this.avisos = avisos; this.usuarios = usuarios; this.empresas = empresas; this.notificacoes = notificacoes;
    }

    @Transactional
    public AvisoAdminResponse publicar(AvisoAdminRequest request) {
        List<ParticipanteSocial> destinatarios = new ArrayList<>();
        if (request.publico() == PublicoAviso.TODOS || request.publico() == PublicoAviso.USUARIOS)
            usuarios.findAll().stream().filter(ParticipanteSocial::isAtivo).forEach(destinatarios::add);
        if (request.publico() == PublicoAviso.TODOS || request.publico() == PublicoAviso.EMPRESAS)
            empresas.findAll().stream().filter(ParticipanteSocial::isAtivo).forEach(destinatarios::add);

        destinatarios.forEach(destinatario -> notificacoes.save(
                Notificacao.avisoDoSistema(destinatario, request.titulo().trim(), request.mensagem().trim())));
        AvisoAdmin aviso = new AvisoAdmin(request.titulo().trim(), request.mensagem().trim(), request.publico(),
                request.prioridade(), request.destino());
        aviso.setEntregues(destinatarios.size());
        return AvisoAdminResponse.from(avisos.save(aviso));
    }

    @Transactional(readOnly = true)
    public List<AvisoAdminResponse> listar() {
        return avisos.findAllByOrderByCriadoEmDesc().stream().map(AvisoAdminResponse::from).toList();
    }
}
