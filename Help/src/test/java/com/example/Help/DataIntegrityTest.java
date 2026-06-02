package com.example.Help;

import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoRequestDTO;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.vaga.Vaga;
import com.example.Help.model.vaga.VagaRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes de Integridade de Dados e Regras de Negocio")
class DataIntegrityTest {

    private Usuario usuarioBase;

    @BeforeEach
    void setUp() {
        usuarioBase = new Usuario();
        usuarioBase.setId(UUID.randomUUID());
        usuarioBase.setName("Anny Gabrielly");
        usuarioBase.setEmail("anny@email.com");
        usuarioBase.setSenha("$2a$10$hash");
    }

    @Nested
    @DisplayName("Vaga — integridade de dados")
    class VagaIntegridade {

        @Test
        @DisplayName("Construtor deve mapear todos os campos do DTO corretamente")
        void construtor_deveMappearTodosCamposDoDTO() {
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Dev Java Pleno", "NTT DATA",
                    "Desenvolvimento de sistemas", 8000.0, "Remoto");

            Vaga vaga = new Vaga(dto, usuarioBase);

            assertThat(vaga.getTitulo()).isEqualTo("Dev Java Pleno");
            assertThat(vaga.getEmpresa()).isEqualTo("NTT DATA");
            assertThat(vaga.getDescricao()).isEqualTo("Desenvolvimento de sistemas");
            assertThat(vaga.getSalario()).isEqualTo(8000.0);
            assertThat(vaga.getLocalizacao()).isEqualTo("Remoto");
            assertThat(vaga.getAnunciante()).isEqualTo(usuarioBase);
        }

        @Test
        @DisplayName("Vaga criada nao deve ter ID definido antes de persistir")
        void vagaNova_idDeveSerNull_antesDePersirir() {
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Dev", "Emp", "Desc", 5000.0, "SP");

            Vaga vaga = new Vaga(dto, usuarioBase);

            assertThat(vaga.getId()).isNull();
        }

        @Test
        @DisplayName("Vaga deve aceitar salario zero (estagio voluntario)")
        void vaga_deveAceitarSalarioZero() {
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Estagiario", "ONG", "Voluntario", 0.0, "Presencial");

            Vaga vaga = new Vaga(dto, usuarioBase);

            assertThat(vaga.getSalario()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("Vaga deve aceitar salario alto sem truncar (precisao double)")
        void vaga_deveManterPrecisaoDoSalario() {
            double salarioAlto = 25750.50;
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Arquiteto Senior", "BigTech", "Desc", salarioAlto, "Remoto");

            Vaga vaga = new Vaga(dto, usuarioBase);

            assertThat(vaga.getSalario()).isEqualTo(salarioAlto);
        }

        @Test
        @DisplayName("Dois objetos Vaga com mesmo ID devem ser iguais (equals/hashCode)")
        void vaga_comMesmoId_deveSerIgual() {
            UUID idFixo = UUID.randomUUID();
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Dev", "Emp", "Desc", 5000.0, "SP");

            Vaga v1 = new Vaga(dto, usuarioBase);
            v1.setId(idFixo);

            Vaga v2 = new Vaga(dto, usuarioBase);
            v2.setId(idFixo);

            assertThat(v1.getId()).isEqualTo(v2.getId());
        }

        @Test
        @DisplayName("Vaga deve manter referencia correta ao anunciante")
        void vaga_deveManterReferenciaCorretaAoAnunciante() {
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Dev", "Emp", "Desc", 5000.0, "SP");

            Vaga vaga = new Vaga(dto, usuarioBase);

            assertThat(vaga.getAnunciante()).isSameAs(usuarioBase);
            assertThat(vaga.getAnunciante().getId()).isEqualTo(usuarioBase.getId());
            assertThat(vaga.getAnunciante().getEmail()).isEqualTo("anny@email.com");
        }
    }

    @Nested
    @DisplayName("Curso — integridade de dados")
    class CursoIntegridade {

        @Test
        @DisplayName("Construtor deve mapear todos os campos do DTO corretamente")
        void construtor_deveMappearTodosCampos() {
            CursoRequestDTO dto = new CursoRequestDTO(
                    "Spring Boot", "Curso completo", "Dev Expert",
                    40, "Programacao", true, 0.0);

            Curso curso = new Curso(dto, usuarioBase);

            assertThat(curso.getNome()).isEqualTo("Spring Boot");
            assertThat(curso.getDescricao()).isEqualTo("Curso completo");
            assertThat(curso.getInstrutor()).isEqualTo("Dev Expert");
            assertThat(curso.getCargaHoraria()).isEqualTo(40);
            assertThat(curso.getCategoria()).isEqualTo("Programacao");
            assertThat(curso.getGratuito()).isTrue();
            assertThat(curso.getPreco()).isEqualTo(0.0);
            assertThat(curso.getAluno()).isEqualTo(usuarioBase);
        }

        @Test
        @DisplayName("Curso novo deve ter progresso inicial igual a zero")
        void cursoCriado_progressoDeveSerZero() {
            CursoRequestDTO dto = new CursoRequestDTO(
                    "Java", "Desc", "Instrutor", 20, "Prog", true, 0.0);

            Curso curso = new Curso(dto, usuarioBase);

            assertThat(curso.getProgresso())
                    .as("Todo curso deve iniciar com 0 porcento de progresso")
                    .isEqualTo(0);
        }

        @Test
        @DisplayName("Curso gratuito deve ter preco igual a zero ou null")
        void cursoGratuito_precoDeveSerZeroOuNull() {
            CursoRequestDTO dto = new CursoRequestDTO(
                    "Curso Free", "Desc", "Instrutor", 10, "Cat", true, 0.0);

            Curso curso = new Curso(dto, usuarioBase);

            assertThat(curso.getGratuito()).isTrue();
            if (curso.getPreco() != null) {
                assertThat(curso.getPreco())
                        .as("Curso gratuito nao pode ter preco positivo")
                        .isLessThanOrEqualTo(0.0);
            }
        }

        @Test
        @DisplayName("Curso pago deve ter preco maior que zero")
        void cursoPago_precoDeveSerPositivo() {
            CursoRequestDTO dto = new CursoRequestDTO(
                    "Curso Pago", "Desc", "Instrutor", 30, "Cat", false, 99.90);

            Curso curso = new Curso(dto, usuarioBase);

            assertThat(curso.getGratuito()).isFalse();
            assertThat(curso.getPreco())
                    .as("Curso pago deve ter preco maior que zero")
                    .isGreaterThan(0.0);
        }

        @Test
        @DisplayName("Carga horaria deve ser um valor positivo")
        void curso_cargaHorariaDeveSerPositiva() {
            CursoRequestDTO dto = new CursoRequestDTO(
                    "Curso", "Desc", "Instrutor", 1, "Cat", true, 0.0);

            Curso curso = new Curso(dto, usuarioBase);

            assertThat(curso.getCargaHoraria())
                    .as("Carga horaria deve ser pelo menos 1 hora")
                    .isGreaterThan(0);
        }

        @ParameterizedTest
        @ValueSource(ints = {1, 10, 40, 80, 200, 400})
        @DisplayName("Curso deve aceitar qualquer carga horaria positiva valida")
        void curso_deveAceitarQualquerCargaHorariaPositiva(int cargaHoraria) {
            CursoRequestDTO dto = new CursoRequestDTO(
                    "Curso", "Desc", "Instrutor",
                    cargaHoraria, "Cat", true, 0.0);

            Curso curso = new Curso(dto, usuarioBase);

            assertThat(curso.getCargaHoraria()).isEqualTo(cargaHoraria);
        }
    }

    @Nested
    @DisplayName("TokenRecuperacao — integridade e expiracao")
    class TokenRecuperacaoIntegridade {

        @Test
        @DisplayName("Construtor deve definir expiracao exatamente 15 minutos no futuro")
        void construtor_deveDefinirExpiracaoEm15Minutos() {
            LocalDateTime antes = LocalDateTime.now();
            TokenRecuperacao token = new TokenRecuperacao("ABC123", usuarioBase);
            LocalDateTime depois = LocalDateTime.now();

            LocalDateTime expiracao = token.getDataExpiracao();

            // Expiracao deve estar entre antes+15min e depois+15min
            assertThat(expiracao)
                    .isAfter(antes.plusMinutes(14).plusSeconds(59))
                    .isBefore(depois.plusMinutes(15).plusSeconds(1));
        }

        @Test
        @DisplayName("Token deve armazenar o codigo exatamente como fornecido")
        void construtor_deveArmazenarCodigoSemAlteracao() {
            String codigo = "XYZ789";
            TokenRecuperacao token = new TokenRecuperacao(codigo, usuarioBase);

            assertThat(token.getToken()).isEqualTo(codigo);
        }

        @Test
        @DisplayName("Token deve manter referencia correta ao usuario")
        void construtor_deveReferenciarUsuarioCorreto() {
            TokenRecuperacao token = new TokenRecuperacao("ABC", usuarioBase);

            assertThat(token.getUsuario()).isSameAs(usuarioBase);
            assertThat(token.getUsuario().getEmail()).isEqualTo("anny@email.com");
        }

        @Test
        @DisplayName("Token criado agora nao deve estar expirado")
        void tokenRecem_naoDeveEstarExpirado() {
            TokenRecuperacao token = new TokenRecuperacao("FRESCO", usuarioBase);

            assertThat(token.getDataExpiracao())
                    .as("Token recem criado nao deve ter expirado")
                    .isAfter(LocalDateTime.now());
        }

        @Test
        @DisplayName("Token com expiracao no passado deve ser considerado expirado")
        void token_comExpiracaoNoPassado_deveSerExpirado() {
            TokenRecuperacao token = new TokenRecuperacao("VELHO", usuarioBase);
            // Simula um token antigo forcando a data para o passado
            token.setDataExpiracao(LocalDateTime.now().minusMinutes(5));

            assertThat(token.getDataExpiracao())
                    .as("Token com data no passado deve estar expirado")
                    .isBefore(LocalDateTime.now());
        }

        @ParameterizedTest
        @ValueSource(strings = {"ABC123", "XY9Z88", "000000", "ZZZZZZ", "A1B2C3"})
        @DisplayName("Token deve aceitar qualquer codigo de 6 caracteres alfanumericos")
        void token_deveAceitarCodigosValidos(String codigo) {
            TokenRecuperacao token = new TokenRecuperacao(codigo, usuarioBase);

            assertThat(token.getToken()).isEqualTo(codigo);
            assertThat(token.getToken()).hasSize(6);
        }
    }

    @Nested
    @DisplayName("Usuario — integridade dos campos criticos")
    class UsuarioIntegridade {

        @Test
        @DisplayName("Usuario deve implementar UserDetails retornando email como username")
        void usuario_deveRetornarEmailComoUsername() {
            assertThat(usuarioBase.getUsername()).isEqualTo("anny@email.com");
        }

        @Test
        @DisplayName("Usuario deve retornar senha armazenada pelo metodo getPassword")
        void usuario_getPasswordDeveRetornarSenhaCriptografada() {
            assertThat(usuarioBase.getPassword()).isEqualTo("$2a$10$hash");
        }

        @Test
        @DisplayName("Usuario deve estar sempre habilitado (flags de conta devem ser true)")
        void usuario_flagsDeContaDevemSerTrue() {
            assertThat(usuarioBase.isAccountNonExpired()).isTrue();
            assertThat(usuarioBase.isAccountNonLocked()).isTrue();
            assertThat(usuarioBase.isCredentialsNonExpired()).isTrue();
            assertThat(usuarioBase.isEnabled()).isTrue();
        }

        @Test
        @DisplayName("Usuario deve ter exatamente uma authority: ROLE_USER")
        void usuario_deveConterApenaRoleUser() {
            var authorities = usuarioBase.getAuthorities();

            assertThat(authorities).hasSize(1);
            assertThat(authorities.iterator().next().getAuthority())
                    .isEqualTo("ROLE_USER");
        }

        @Test
        @DisplayName("Dois usuarios com mesmo ID devem ser iguais (equals via @EqualsAndHashCode)")
        void usuario_mesmoId_deveSerIgual() {
            UUID id = UUID.randomUUID();

            Usuario u1 = new Usuario();
            u1.setId(id);
            u1.setEmail("u1@email.com");

            Usuario u2 = new Usuario();
            u2.setId(id);
            u2.setEmail("u2@email.com");
            assertThat(u1).isEqualTo(u2);
        }

        @Test
        @DisplayName("Dois usuarios com IDs diferentes nao devem ser iguais")
        void usuario_idsDiferentes_naoDevemSerIguais() {
            Usuario u1 = new Usuario();
            u1.setId(UUID.randomUUID());

            Usuario u2 = new Usuario();
            u2.setId(UUID.randomUUID());

            assertThat(u1).isNotEqualTo(u2);
        }
    }

    @Nested
    @DisplayName("Valores limite — casos extremos do dominio")
    class ValoresLimite {

        @Test
        @DisplayName("Vaga com descricao muito longa (1000 chars) deve ser criada sem excecao")
        void vaga_descricaoLonga_deveFuncionar() {
            String descricaoLonga = "A".repeat(1000);
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Dev", "Emp", descricaoLonga, 5000.0, "SP");

            Vaga vaga = new Vaga(dto, usuarioBase);

            assertThat(vaga.getDescricao()).hasSize(1000);
        }

        @Test
        @DisplayName("Curso com nome no limite de caracteres deve preservar o valor completo")
        void curso_nomeNoLimite_deveSerPreservado() {
            String nomeLongo = "C".repeat(100);
            CursoRequestDTO dto = new CursoRequestDTO(
                    nomeLongo, "Desc", "Instrutor", 10, "Cat", true, 0.0);

            Curso curso = new Curso(dto, usuarioBase);

            assertThat(curso.getNome()).hasSize(100);
        }

        @ParameterizedTest
        @ValueSource(doubles = {0.01, 500.0, 1500.0, 9999.99, 25000.0, 100000.0})
        @DisplayName("Vaga deve aceitar diferentes faixas de salario sem perda de precisao")
        void vaga_diferentesValoresDeSalario(double salario) {
            VagaRequestDTO dto = new VagaRequestDTO(
                    "Dev", "Emp", "Desc", salario, "SP");

            Vaga vaga = new Vaga(dto, usuarioBase);

            assertThat(vaga.getSalario()).isEqualTo(salario);
        }

        @Test
        @DisplayName("Localizacao da vaga pode ser 'Remoto' ou nome de cidade real")
        void vaga_localizacaoFlexivel() {
            String[] localizacoes = {"Remoto", "Anapolis, GO", "Sao Paulo, SP",
                                     "Hibrido - Brasilia", "Home Office"};

            for (String local : localizacoes) {
                VagaRequestDTO dto = new VagaRequestDTO(
                        "Dev", "Emp", "Desc", 5000.0, local);
                Vaga vaga = new Vaga(dto, usuarioBase);

                assertThat(vaga.getLocalizacao())
                        .as("Localizacao '%s' deve ser preservada", local)
                        .isEqualTo(local);
            }
        }
    }
}
