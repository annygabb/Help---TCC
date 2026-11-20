package com.example.Help.model.mensagem;

import com.example.Help.Service.MensagemService;
import com.example.Help.Service.ParticipanteService;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/mensagens")
public class MensagemController {

    @Autowired
    private MensagemService service;

    @Autowired
    private ParticipanteService participanteService;

    @PostMapping("/enviar")
    public ResponseEntity<?> enviar(@RequestBody @Valid MensagemRequestDTO data, Authentication authentication) {
        try {
            ParticipanteSocial remetente = participanteService.obterAutenticado(authentication);
            MensagemResponseDTO enviada = service.enviar(remetente, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(enviada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/conversas")
    public ResponseEntity<?> listarConversas(Authentication authentication) {
        try {
            return ResponseEntity.ok(service.listarConversas(participanteService.obterAutenticado(authentication)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/nao-lidas/total")
    public java.util.Map<String, Long> totalNaoLidas(Authentication authentication) {
        return java.util.Map.of("total", service.contarNaoLidas(participanteService.obterAutenticado(authentication)));
    }

    @DeleteMapping("/conversa/{tipoConta}/{contaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirConversa(@PathVariable TipoParticipante tipoConta, @PathVariable UUID contaId, Authentication authentication) {
        service.ocultarConversa(participanteService.obterAutenticado(authentication), contaId, tipoConta);
    }

    @GetMapping("/bloqueios/{tipoConta}/{contaId}")
    public java.util.Map<String, Boolean> bloqueio(@PathVariable TipoParticipante tipoConta, @PathVariable UUID contaId, Authentication auth) {
        return java.util.Map.of("bloqueado", service.estaBloqueada(participanteService.obterAutenticado(auth), contaId, tipoConta));
    }

    @PutMapping("/bloqueios/{tipoConta}/{contaId}")
    public java.util.Map<String, Boolean> bloquear(@PathVariable TipoParticipante tipoConta, @PathVariable UUID contaId, Authentication auth) {
        return java.util.Map.of("bloqueado", service.definirBloqueio(participanteService.obterAutenticado(auth), contaId, tipoConta, true));
    }

    @DeleteMapping("/bloqueios/{tipoConta}/{contaId}")
    public java.util.Map<String, Boolean> desbloquear(@PathVariable TipoParticipante tipoConta, @PathVariable UUID contaId, Authentication auth) {
        return java.util.Map.of("bloqueado", service.definirBloqueio(participanteService.obterAutenticado(auth), contaId, tipoConta, false));
    }

    @GetMapping("/conversa/{outroUsuarioId}")
    public ResponseEntity<?> buscarConversa(@PathVariable UUID outroUsuarioId, Authentication authentication) {
        try {
            ParticipanteSocial atual = participanteService.obterAutenticado(authentication);
            List<MensagemResponseDTO> conversa = service.buscarConversa(atual, outroUsuarioId, TipoParticipante.USUARIO);
            service.marcarConversaComoLida(atual, outroUsuarioId, TipoParticipante.USUARIO);
            return ResponseEntity.ok(conversa);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/conversa/{tipoConta}/{contaId}")
    public ResponseEntity<?> buscarConversaTipada(@PathVariable TipoParticipante tipoConta,
                                                   @PathVariable UUID contaId,
                                                   Authentication authentication) {
        try {
            ParticipanteSocial atual = participanteService.obterAutenticado(authentication);
            List<MensagemResponseDTO> conversa = service.buscarConversa(atual, contaId, tipoConta);
            service.marcarConversaComoLida(atual, contaId, tipoConta);
            return ResponseEntity.ok(conversa);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
