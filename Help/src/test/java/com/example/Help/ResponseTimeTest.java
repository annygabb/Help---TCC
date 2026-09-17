package com.example.Help;

import com.example.Help.model.cadastro.CadastroRepository;
import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoController;
import com.example.Help.model.curso.CursoRepository;
import com.example.Help.model.curso.CursoRequestDTO;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.vaga.Vaga;
import com.example.Help.model.vaga.VagaController;
import com.example.Help.model.vaga.VagaRepository;
import com.example.Help.model.vaga.VagaRequestDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.ArrayList;
import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {VagaController.class, CursoController.class})
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Testes de Tempo de Resposta")
class ResponseTimeTest {

    private static final long LIMITE_GET_SIMPLES_MS    = 200L;
    private static final long LIMITE_POST_MS           = 300L;
    private static final long LIMITE_DELETE_MS         = 300L;
    private static final long LIMITE_LISTA_GRANDE_MS   = 500L;
    private static final long LIMITE_MEDIA_REPETIDA_MS = 150L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VagaRepository vagaRepository;

    @MockitoBean
    private CursoRepository cursoRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    @SuppressWarnings("unused")
    private EmpresaRepository empresaRepository;

    @MockitoBean
    @SuppressWarnings("unused")
    private TokenService tokenService;

    @MockitoBean
    @SuppressWarnings("unused")
    private CadastroRepository cadastroRepository;

    private UUID usuarioId;
    private UUID vagaId;
    private Usuario usuarioMock;
    private Vaga vagaMock;
    private Curso cursoMock;
    private VagaRequestDTO vagaRequestDTO;
    private CursoRequestDTO cursoRequestDTO;

    @BeforeEach
    void setUp() {
        objectMapper.addMixIn(Usuario.class, IgnorarUsuarioMixIn.class);

        usuarioId = UUID.randomUUID();
        vagaId    = UUID.randomUUID();

        usuarioMock = new Usuario();
        usuarioMock.setId(usuarioId);
        usuarioMock.setName("Anny Gabrielly");
        usuarioMock.setEmail("anny@email.com");
        usuarioMock.setSenha("$2a$10$hash");

        vagaRequestDTO = new VagaRequestDTO(
                "Desenvolvedor Java Pleno", "NTT DATA",
                "Desenvolvimento de sistemas corporativos", 8000.0, "Remoto");

        cursoRequestDTO = new CursoRequestDTO(
                "Java Spring Boot Avancado", "Curso completo de Spring Boot",
                "Dev Mastery", 40, "Programacao", true, 0.0);

        vagaMock = new Vaga(vagaRequestDTO, usuarioMock);
        vagaMock.setId(vagaId);

        cursoMock = new Curso(cursoRequestDTO, usuarioMock);
        cursoMock.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Vagas - GET /vagas deve responder em menos de 200 ms")
    void vagas_getAll_deveResponderDentroDoLimite() throws Exception {
        when(vagaRepository.findAll()).thenReturn(new ArrayList<>(List.of(vagaMock)));

        long inicio  = System.currentTimeMillis();
        mockMvc.perform(get("/vagas")).andExpect(status().isOk());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("GET /vagas levou %d ms — limite %d ms", duracao, LIMITE_GET_SIMPLES_MS)
                .isLessThan(LIMITE_GET_SIMPLES_MS);
    }

    @Test
    @DisplayName("Vagas - GET /vagas/anunciante/{id} deve responder em menos de 200 ms")
    void vagas_getVagasPorAnunciante_deveResponderDentroDoLimite() throws Exception {
        when(vagaRepository.findByAnuncianteId(usuarioId)).thenReturn(new ArrayList<>(List.of(vagaMock)));

        long inicio  = System.currentTimeMillis();
        mockMvc.perform(get("/vagas/anunciante/" + usuarioId)).andExpect(status().isOk());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("GET /vagas/anunciante levou %d ms", duracao)
                .isLessThan(LIMITE_GET_SIMPLES_MS);
    }

    @Test
    @DisplayName("Vagas - POST /vagas/{id} deve responder em menos de 300 ms")
    void vagas_postVaga_deveResponderDentroDoLimite() throws Exception {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioMock));
        when(vagaRepository.save(any(Vaga.class))).thenReturn(vagaMock);

        long inicio  = System.currentTimeMillis();
        mockMvc.perform(post("/vagas/" + usuarioId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vagaRequestDTO)))
                .andExpect(status().isOk());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("POST /vagas levou %d ms", duracao)
                .isLessThan(LIMITE_POST_MS);
    }

    @Test
    @DisplayName("Vagas - DELETE /vagas/{id} deve responder em menos de 300 ms")
    void vagas_deleteVaga_deveResponderDentroDoLimite() throws Exception {
        long inicio  = System.currentTimeMillis();
        mockMvc.perform(delete("/vagas/" + vagaId)).andExpect(status().isNoContent());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("DELETE /vagas levou %d ms", duracao)
                .isLessThan(LIMITE_DELETE_MS);
    }

    @Test
    @DisplayName("Vagas - GET /vagas com 100 vagas deve responder em menos de 500 ms")
    void vagas_getAll_listaGrande_deveResponderDentroDoLimite() throws Exception {
        List<Vaga> listaGrande = new ArrayList<>(IntStream.range(0, 100).mapToObj(i -> {
            Vaga v = new Vaga(new VagaRequestDTO(
                    "Vaga " + i, "Empresa " + i, "Desc " + i,
                    5000.0 + (i * 100), "Remoto"), usuarioMock);
            v.setId(UUID.randomUUID());
            return v;
        }).toList());

        when(vagaRepository.findAll()).thenReturn(listaGrande);

        long inicio  = System.currentTimeMillis();
        mockMvc.perform(get("/vagas")).andExpect(status().isOk());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("GET /vagas com 100 itens levou %d ms", duracao)
                .isLessThan(LIMITE_LISTA_GRANDE_MS);
    }

    @Test
    @DisplayName("Vagas - GET /vagas executado 10 vezes deve ter media abaixo de 150 ms")
    void vagas_getAll_repetido_mediaDentroDoLimite() throws Exception {
        when(vagaRepository.findAll()).thenReturn(new ArrayList<>(List.of(vagaMock)));

        List<Long> tempos = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            long inicio = System.currentTimeMillis();
            mockMvc.perform(get("/vagas")).andExpect(status().isOk());
            tempos.add(System.currentTimeMillis() - inicio);
        }

        LongSummaryStatistics stats = tempos.stream()
                .mapToLong(Long::longValue).summaryStatistics();

        System.out.printf(
                "[ResponseTime] GET /vagas x10 min=%d ms | max=%d ms | media=%.1f ms%n",
                stats.getMin(), stats.getMax(), stats.getAverage());

        assertThat(stats.getAverage())
                .as("Media de 10 chamadas foi %.1f ms — limite %d ms",
                        stats.getAverage(), LIMITE_MEDIA_REPETIDA_MS)
                .isLessThan((double) LIMITE_MEDIA_REPETIDA_MS);
    }

    @Test
    @DisplayName("Cursos - GET /cursos/{usuarioId} deve responder em menos de 200 ms")
    void cursos_getCursos_deveResponderDentroDoLimite() throws Exception {
        when(cursoRepository.findByAlunoId(usuarioId)).thenReturn(new ArrayList<>(List.of(cursoMock)));

        long inicio  = System.currentTimeMillis();
        mockMvc.perform(get("/cursos/" + usuarioId)).andExpect(status().isOk());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("GET /cursos levou %d ms", duracao)
                .isLessThan(LIMITE_GET_SIMPLES_MS);
    }

    @Test
    @DisplayName("Cursos - POST /cursos/{usuarioId} deve responder em menos de 300 ms")
    void cursos_postCurso_deveResponderDentroDoLimite() throws Exception {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioMock));
        when(cursoRepository.save(any(Curso.class))).thenReturn(cursoMock);

        long inicio  = System.currentTimeMillis();
        mockMvc.perform(post("/cursos/" + usuarioId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cursoRequestDTO)))
                .andExpect(status().isOk());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("POST /cursos levou %d ms", duracao)
                .isLessThan(LIMITE_POST_MS);
    }

    @Test
    @DisplayName("Cursos - GET /cursos/{usuarioId} com 50 cursos deve responder em menos de 500 ms")
    void cursos_getCursos_listaMedia_deveResponderDentroDoLimite() throws Exception {
        List<Curso> listaCursos = new ArrayList<>(IntStream.range(0, 50).mapToObj(i -> {
            Curso c = new Curso(new CursoRequestDTO(
                    "Curso " + i, "Desc " + i, "Instrutor " + i,
                    20 + i, "Cat" + (i % 5), i % 2 == 0, i % 2 == 0 ? 0.0 : 99.9),
                    usuarioMock);
            c.setId(UUID.randomUUID());
            return c;
        }).toList());

        when(cursoRepository.findByAlunoId(usuarioId)).thenReturn(listaCursos);

        long inicio  = System.currentTimeMillis();
        mockMvc.perform(get("/cursos/" + usuarioId)).andExpect(status().isOk());
        long duracao = System.currentTimeMillis() - inicio;

        assertThat(duracao)
                .as("GET /cursos com 50 itens levou %d ms", duracao)
                .isLessThan(LIMITE_LISTA_GRANDE_MS);
    }

    @Test
    @DisplayName("Cursos - GET /cursos executado 10 vezes deve ter media abaixo de 150 ms")
    void cursos_getCursos_repetido_mediaDentroDoLimite() throws Exception {
        when(cursoRepository.findByAlunoId(usuarioId)).thenReturn(new ArrayList<>(List.of(cursoMock)));

        List<Long> tempos = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            long inicio = System.currentTimeMillis();
            mockMvc.perform(get("/cursos/" + usuarioId)).andExpect(status().isOk());
            tempos.add(System.currentTimeMillis() - inicio);
        }

        LongSummaryStatistics stats = tempos.stream()
                .mapToLong(Long::longValue).summaryStatistics();

        System.out.printf(
                "[ResponseTime] GET /cursos x10 min=%d ms | max=%d ms | media=%.1f ms%n",
                stats.getMin(), stats.getMax(), stats.getAverage());

        assertThat(stats.getAverage())
                .as("Media %.1f ms excedeu limite de %d ms",
                        stats.getAverage(), LIMITE_MEDIA_REPETIDA_MS)
                .isLessThan((double) LIMITE_MEDIA_REPETIDA_MS);
    }

    @Test
    @DisplayName("Comparativo - GET /vagas nao deve demorar mais de 50 ms alem do POST /vagas")
    void comparativo_get_deveSerMaisRapidoQuePost() throws Exception {
        when(vagaRepository.findAll()).thenReturn(new ArrayList<>(List.of(vagaMock)));
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioMock));
        when(vagaRepository.save(any(Vaga.class))).thenReturn(vagaMock);

        mockMvc.perform(get("/vagas"));
        mockMvc.perform(post("/vagas/" + usuarioId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vagaRequestDTO)));

        long inicioGet  = System.currentTimeMillis();
        mockMvc.perform(get("/vagas")).andExpect(status().isOk());
        long duracaoGet = System.currentTimeMillis() - inicioGet;

        long inicioPost  = System.currentTimeMillis();
        mockMvc.perform(post("/vagas/" + usuarioId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vagaRequestDTO)))
                .andExpect(status().isOk());
        long duracaoPost = System.currentTimeMillis() - inicioPost;

        System.out.printf(
                "[Comparativo] GET /vagas=%d ms | POST /vagas=%d ms%n",
                duracaoGet, duracaoPost);

        assertThat(duracaoGet)
                .as("GET (%d ms) demorou mais que POST (%d ms) + 50 ms de margem",
                        duracaoGet, duracaoPost)
                .isLessThanOrEqualTo(duracaoPost + 50L);
    }

    @Test
    @DisplayName("Comparativo - lista vazia nao deve demorar mais que lista com 100 itens + 100 ms")
    void comparativo_listaVazia_deveSeMaisRapidaQueListaCheia() throws Exception {
        when(vagaRepository.findAll()).thenReturn(new ArrayList<>());
        long inicioVazia  = System.currentTimeMillis();
        mockMvc.perform(get("/vagas")).andExpect(status().isOk());
        long duracaoVazia = System.currentTimeMillis() - inicioVazia;

        List<Vaga> lista100 = new ArrayList<>(IntStream.range(0, 100).mapToObj(i -> {
            Vaga v = new Vaga(vagaRequestDTO, usuarioMock);
            v.setId(UUID.randomUUID());
            return v;
        }).toList());
        when(vagaRepository.findAll()).thenReturn(lista100);

        long inicioCheia  = System.currentTimeMillis();
        mockMvc.perform(get("/vagas")).andExpect(status().isOk());
        long duracaoCheia = System.currentTimeMillis() - inicioCheia;

        System.out.printf(
                "[Comparativo] Lista vazia=%d ms | Lista 100 itens=%d ms%n",
                duracaoVazia, duracaoCheia);

        assertThat(duracaoVazia)
                .as("Lista vazia (%d ms) mais lenta que lista cheia (%d ms)",
                        duracaoVazia, duracaoCheia)
                .isLessThanOrEqualTo(duracaoCheia + 100L);
    }

    @JsonIgnoreType
    private interface IgnorarUsuarioMixIn {}
}