package com.example.Help.model.cadastro;

import jakarta.persistence.*;
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
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "senha", nullable = false)
    private String password;

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