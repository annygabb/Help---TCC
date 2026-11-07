package com.example.Help.unidade;

import com.example.Help.validation.CpfValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Validador de CPF (@CpfValido)")
class CpfValidatorTest {

    private final CpfValidator validador = new CpfValidator();

    private boolean valido(String cpf) {
        return validador.isValid(cpf, null);
    }

    @ParameterizedTest(name = "CT-UN-CPF-01: {0} é aceito")
    @ValueSource(strings = {"52998224725", "111.444.777-35", "529.982.247-25", "10000000108"})
    void aceitaCpfsValidosComOuSemMascara(String cpf) {
        assertThat(valido(cpf)).isTrue();
    }

    @Test
    @DisplayName("CT-UN-CPF-02: primeiro dígito verificador errado é recusado")
    void recusaPrimeiroDigitoErrado() {
        assertThat(valido("52998224715")).isFalse();
    }

    @Test
    @DisplayName("CT-UN-CPF-03: segundo dígito verificador errado é recusado")
    void recusaSegundoDigitoErrado() {
        assertThat(valido("52998224726")).isFalse();
    }

    @ParameterizedTest(name = "CT-UN-CPF-04: sequência repetida {0} é recusada")
    @ValueSource(strings = {"00000000000", "11111111111", "999.999.999-99"})
    void recusaSequenciasRepetidas(String cpf) {
        assertThat(valido(cpf)).isFalse();
    }

    @ParameterizedTest(name = "CT-UN-CPF-05: {0} com tamanho errado é recusado")
    @ValueSource(strings = {"5299822472", "529982247250", "abc"})
    void recusaTamanhoErrado(String cpf) {
        assertThat(valido(cpf)).isFalse();
    }

    @ParameterizedTest(name = "CT-UN-CPF-06: valor vazio fica para o @NotBlank")
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void vazioNaoEhResponsabilidadeDoValidador(String cpf) {
        assertThat(valido(cpf)).isTrue();
    }
}
