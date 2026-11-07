package com.example.Help;

import com.example.Help.Service.AdminAccountService;
import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoController;
import com.example.Help.model.curso.CursoRepository;
import com.example.Help.model.curso.CursoRequestDTO;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(CursoController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Testes do CursoController")
class CursoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CursoRepository cursoRepository;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    @SuppressWarnings("unused")
    private TokenService tokenService;

    @MockitoBean
    @SuppressWarnings("unused")
    private EmpresaRepository empresaRepository;

    @MockitoBean
    @SuppressWarnings("unused")
    private AdminAccountService adminAccountService;

    private UUID alunoId;
    private Usuario aluno;
    private CursoRequestDTO cursoDTO;

    @BeforeEach
    void setUp() {
        alunoId = UUID.randomUUID();
        aluno = new Usuario();
        aluno.setId(alunoId);
        aluno.setName("Anny Gabrielly");
        aluno.setEmail("anny@email.com");
        cursoDTO = new CursoRequestDTO("Java Spring Boot Profissional", "Curso completo", "Dev Mastery",
                40, "Programação", true, 0.0);
    }

    @Tag("defeito") 
    @Test
    @DisplayName("CT-UN-CUR-01: novo curso começa com progresso 0% e fica ligado ao aluno")
    void novoCursoComecaComProgressoZero() throws Exception {
        when(usuarioRepository.findById(alunoId)).thenReturn(Optional.of(aluno));

        mockMvc.perform(post("/cursos/" + alunoId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cursoDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Java Spring Boot Profissional"))
                .andExpect(jsonPath("$.progresso").value(0));

        ArgumentCaptor<Curso> salvo = ArgumentCaptor.forClass(Curso.class);
        verify(cursoRepository).save(salvo.capture());
        assertThat(salvo.getValue().getAluno()).isSameAs(aluno);
        assertThat(salvo.getValue().getGratuito()).isTrue();
    }

    @Test
    @DisplayName("CT-UN-CUR-02: aluno inexistente devolve 400 e nada é gravado")
    void alunoInexistenteDevolve400() throws Exception {
        when(usuarioRepository.findById(alunoId)).thenReturn(Optional.empty());

        mockMvc.perform(post("/cursos/" + alunoId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cursoDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Usuário não encontrado"));
        verify(cursoRepository, never()).save(any());
    }

    @Test
    @DisplayName("CT-UN-CUR-03: a listagem traz somente os cursos do aluno informado")
    void listagemTrazCursosDoAluno() throws Exception {
        Curso curso = new Curso(cursoDTO, null);
        curso.setId(UUID.randomUUID());
        when(cursoRepository.findByAlunoId(alunoId)).thenReturn(List.of(curso));

        mockMvc.perform(get("/cursos/" + alunoId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].categoria").value("Programação"));
        verify(cursoRepository).findByAlunoId(alunoId);
    }

    @Test
    @DisplayName("CT-UN-CUR-04: identificador que não é UUID devolve 400")
    void identificadorInvalidoDevolve400() throws Exception {
        mockMvc.perform(get("/cursos/nao-e-uuid"))
                .andExpect(status().isBadRequest());
    }
}
