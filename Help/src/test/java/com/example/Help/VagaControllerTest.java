package com.example.Help;

import com.example.Help.model.cadastro.CadastroRepository;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.vaga.Vaga;
import com.example.Help.model.vaga.VagaController;
import com.example.Help.model.vaga.VagaRepository;
import com.example.Help.model.vaga.VagaRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VagaController.class)
@AutoConfigureMockMvc(addFilters = false) // mesmo padrao do ResponseTimeTest
@DisplayName("Testes do VagaController")
class VagaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VagaRepository vagaRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    // Adicionado em 25/09/2026: o SecurityFilter e um @Component Filter e entra
    // automaticamente nas fatias @WebMvcTest. Sem estes tres beans o contexto nao sobe.
    @MockitoBean
    @SuppressWarnings("unused")
    private TokenService tokenService;

    @MockitoBean
    @SuppressWarnings("unused")
    private CadastroRepository cadastroRepository;

    @MockitoBean
    @SuppressWarnings("unused")
    private EmpresaRepository empresaRepository;

    private UUID usuarioId;
    private UUID vagaId;
    private Usuario usuarioMock;
    private VagaRequestDTO vagaRequestDTO;
    private Vaga vagaMock;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        vagaId = UUID.randomUUID();

        usuarioMock = new Usuario();
        usuarioMock.setId(usuarioId);
        usuarioMock.setName("Anny Gabrielly");
        usuarioMock.setEmail("anny@email.com");

        vagaRequestDTO = new VagaRequestDTO(
                "Desenvolvedor Java Pleno",
                "NTT DATA",
                "Desenvolvimento de sistemas corporativos em Java",
                8000.0,
                "Remoto"
        );

        vagaMock = new Vaga(vagaRequestDTO, usuarioMock);
        vagaMock.setId(vagaId);
    }

    @Test
    @DisplayName("GET /vagas - deve retornar lista de todas as vagas")
    void getAll_deveRetornarListaDeVagas() throws Exception {
        when(vagaRepository.findAll()).thenReturn(List.of(vagaMock));

        mockMvc.perform(get("/vagas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Desenvolvedor Java Pleno"))
                .andExpect(jsonPath("$[0].empresa").value("NTT DATA"))
                .andExpect(jsonPath("$[0].salario").value(8000.0));
    }

    @Test
    @DisplayName("GET /vagas - deve retornar lista vazia quando não há vagas")
    void getAll_deveRetornarListaVazia() throws Exception {
        when(vagaRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/vagas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("POST /vagas/{usuarioId} - deve criar vaga com sucesso")
    void saveVaga_deveCriarVaga_quandoSucesso() throws Exception {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioMock));
        when(vagaRepository.save(any(Vaga.class))).thenReturn(vagaMock);

        mockMvc.perform(post("/vagas/" + usuarioId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vagaRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Desenvolvedor Java Pleno"))
                .andExpect(jsonPath("$.empresa").value("NTT DATA"));

        verify(vagaRepository, times(1)).save(any(Vaga.class));
    }

    @Test
    @DisplayName("POST /vagas/{usuarioId} - deve lançar exceção quando usuário não encontrado")
    void saveVaga_deveLancarExcecao_quandoUsuarioNaoEncontrado() throws Exception {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        mockMvc.perform(post("/vagas/" + usuarioId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vagaRequestDTO)))
                // O RequestsExceptionHandler converte RuntimeException em 400 com {"error": ...}
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Usuário não encontrado"));

        verify(vagaRepository, never()).save(any(Vaga.class));
    }

    @Test
    @DisplayName("GET /vagas/anunciante/{usuarioId} - deve retornar vagas do anunciante")
    void getVagasPorAnunciante_deveRetornarVagasDoUsuario() throws Exception {
        when(vagaRepository.findByAnuncianteId(usuarioId)).thenReturn(List.of(vagaMock));

        mockMvc.perform(get("/vagas/anunciante/" + usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Desenvolvedor Java Pleno"))
                .andExpect(jsonPath("$[0].localizacao").value("Remoto"));
    }

    @Test
    @DisplayName("GET /vagas/anunciante/{usuarioId} - deve retornar lista vazia quando não há vagas do anunciante")
    void getVagasPorAnunciante_deveRetornarListaVazia_quandoSemVagas() throws Exception {
        when(vagaRepository.findByAnuncianteId(usuarioId)).thenReturn(List.of());

        mockMvc.perform(get("/vagas/anunciante/" + usuarioId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("DELETE /vagas/{id} - deve deletar vaga com sucesso")
    void deleteVaga_deveDeletarComSucesso() throws Exception {
        doNothing().when(vagaRepository).deleteById(vagaId);

        mockMvc.perform(delete("/vagas/" + vagaId))
                .andExpect(status().isNoContent());

        verify(vagaRepository, times(1)).deleteById(vagaId);
    }

    @Test
    @DisplayName("DELETE /vagas/{id} - deve retornar 400 quando falha ao deletar")
    void deleteVaga_deveRetornarErro_quandoFalha() throws Exception {
        doThrow(new RuntimeException("Erro ao deletar vaga"))
                .when(vagaRepository).deleteById(vagaId);

        mockMvc.perform(delete("/vagas/" + vagaId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Erro ao deletar vaga"));
    }
}