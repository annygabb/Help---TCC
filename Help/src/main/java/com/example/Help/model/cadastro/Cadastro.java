package com.example.Help.model.cadastro;

import com.example.Help.validation.CpfValido;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Cadastro implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome", nullable = false)
    @NotBlank(message = "O nome é obrigatório.")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
    @Pattern(regexp = "^.*[a-zA-ZÀ-ÿ]+.*$", message = "O nome deve conter letras.")
    @JsonAlias({"nome", "name"})
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Formato de e-mail inválido.")
    private String email;

    @Column(name = "senha", nullable = false)
    @NotBlank(message = "A senha é obrigatória.")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JsonAlias({"senha", "password"})
    private String password;

    @Column(name = "cpf", unique = true, length = 14)
    @NotBlank(message = "O CPF é obrigatório.")
    @CpfValido(message = "CPF inválido. Forneça um CPF válido com 11 dígitos.")
    @JsonAlias({"cpf", "cpfNumero"})
    private String cpf;

    public String getNome() {
        return this.name;
    }

    public void setNome(String nome) {
        this.name = nome;
    }

    public String getSenha() {
        return this.password;
    }

    public void setSenha(String senha) {
        this.password = senha;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));//padrão do usuario
    }

    @Override
    public String getUsername() { //O Spring Security usa o e-mail como o identificador (username)
        return this.email;
    }

    @Override
    public String getPassword() { //Retorna a senha criptografada do banco
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; //Conta não expira
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; //Conta não bloqueia
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; //Senha não expira
    }

    @Override
    public boolean isEnabled() {
        return true; //Usuário ativo
    }
}