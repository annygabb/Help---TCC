package com.example.Help;

import com.example.Help.Service.PerfilService;
import com.example.Help.model.perfil.Perfil;
import com.example.Help.model.perfil.PerfilRepository;
import com.example.Help.model.perfil.PerfilRequestDTO;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class PerfilServiceIsolationTest {

    @Test
    void atualizarUmPerfilNaoAlteraOsDadosDeOutroUsuario() {
        UUID idAnny = UUID.randomUUID();
        UUID idTeste = UUID.randomUUID();

        Usuario anny = new Usuario();
        anny.setId(idAnny);
        anny.setName("Anny Gabrielly");

        Usuario teste = new Usuario();
        teste.setId(idTeste);
        teste.setName("Usuário antigo");

        Perfil perfilAnny = new Perfil();
        perfilAnny.setUsuario(anny);
        perfilAnny.setName("Anny Gabrielly");
        perfilAnny.setCargoAtual("Analista");

        Perfil perfilTeste = new Perfil();
        perfilTeste.setUsuario(teste);
        perfilTeste.setName("Usuário antigo");
        perfilTeste.setCargoAtual("Cargo antigo");

        PerfilRepository perfilRepository = mock(PerfilRepository.class);
        UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);

        when(usuarioRepository.findById(idTeste)).thenReturn(Optional.of(teste));
        when(perfilRepository.findByUsuarioId(idTeste)).thenReturn(Optional.of(perfilTeste));
        when(perfilRepository.save(perfilTeste)).thenReturn(perfilTeste);

        PerfilService service = new PerfilService(perfilRepository, usuarioRepository);
        PerfilRequestDTO dados = new PerfilRequestDTO(
                "Usuário Teste",
                "Desenvolvedor",
                "Goiânia, GO",
                "Perfil individual",
                null,
                List.of(),
                List.of()
        );

        service.atualizar(idTeste, dados);

        assertEquals("Usuário Teste", perfilTeste.getName());
        assertEquals("Desenvolvedor", perfilTeste.getCargoAtual());
        assertEquals("Anny Gabrielly", perfilAnny.getName());
        assertEquals("Analista", perfilAnny.getCargoAtual());
        verify(perfilRepository).save(perfilTeste);
        verify(usuarioRepository).save(teste);
        verifyNoMoreInteractions(perfilRepository, usuarioRepository);
    }
}
