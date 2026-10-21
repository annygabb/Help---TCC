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
