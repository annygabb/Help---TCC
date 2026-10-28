package com.example.Help.Service;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.text.Normalizer;

@Service
public class ParticipanteService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;

    public ParticipanteService(UsuarioRepository usuarioRepository, EmpresaRepository empresaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
    }

    public ParticipanteSocial obterAutenticado(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta não autenticada.");
        }

        Object principal = authentication.getPrincipal();
        ParticipanteSocial participante;

        if (principal instanceof ParticipanteSocial social) {
            participante = social;
        } else if (principal instanceof UserDetails userDetails) {
            participante = buscarPorEmail(userDetails.getUsername());
        } else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta não autenticada.");
        }

        validarAtivo(participante);
        return participante;
    }

    public ParticipanteSocial buscarAtivo(UUID id, TipoParticipante tipo) {
        if (id == null || tipo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID e tipo da conta são obrigatórios.");
        }

        ParticipanteSocial participante = switch (tipo) {
            case USUARIO -> usuarioRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
            case EMPRESA -> empresaRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada."));
        };
        validarAtivo(participante);
        return participante;
    }

    public List<ParticipanteSocial> listarAtivos(
            ParticipanteSocial atual,
            String busca,
            TipoParticipante filtroTipo
    ) {
        String termo = normalizar(busca);
        List<ParticipanteSocial> candidatos = new ArrayList<>();
        if (filtroTipo == null || filtroTipo == TipoParticipante.USUARIO) {
            candidatos.addAll(usuarioRepository.findAll());
        }
        if (filtroTipo == null || filtroTipo == TipoParticipante.EMPRESA) {
            candidatos.addAll(empresaRepository.findAll());
        }

        return candidatos.stream()
                .filter(ParticipanteSocial::isAtivo)
                .filter(p -> !mesmaConta(p, atual))
                .filter(p -> termo.isEmpty() || corresponde(p, termo))
                .toList();
    }

    public boolean mesmaConta(ParticipanteSocial primeira, ParticipanteSocial segunda) {
        return primeira != null && segunda != null
                && primeira.getTipoParticipante() == segunda.getTipoParticipante()
                && primeira.getId().equals(segunda.getId());
    }

    private ParticipanteSocial buscarPorEmail(String email) {
        String normalizado = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        var usuario = usuarioRepository.findByEmailIgnoreCase(normalizado);
        var empresa = empresaRepository.findByEmailIgnoreCase(normalizado);

        if (usuario.isPresent() && empresa.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail associado a mais de uma conta.");
        }
        if (usuario.isPresent()) return usuario.get();
        if (empresa.isPresent()) return empresa.get();
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta autenticada não encontrada.");
    }

    private void validarAtivo(ParticipanteSocial participante) {
        if (!participante.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta desativada.");
        }
    }

    private boolean corresponde(ParticipanteSocial participante, String termo) {
        if (normalizar(participante.getNomeSocial()).contains(termo)) return true;
        if (participante instanceof Usuario usuario) {
            return normalizar(usuario.getEmail()).contains(termo)
                    || normalizar(usuario.getCargo()).contains(termo)
                    || normalizar(usuario.getFormacao()).contains(termo);
        }
        if (participante instanceof Empresa empresa) {
            return normalizar(empresa.getEmail()).contains(termo);
        }
        return false;
    }

    private String normalizar(String valor) {
        if (valor == null) return "";
        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
