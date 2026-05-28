package com.example.Help.model.recuperacao;

import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.empresa.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private EmpresaRepository empresaRepository; //repositório de empresas

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var usuario = repository.findByEmail(username).orElse(null);//Tenta buscar na tabela de usuarios
        if (usuario != null) {
            return usuario;
        }

        var empresa = empresaRepository.findByEmail(username).orElse(null);//Se não achou, tenta buscar na tabela de empresas
        if (empresa != null) {
            return empresa;
        }

        throw new UsernameNotFoundException("Usuário ou Empresa não cadastrados com o e-mail: " + username);//Se não encontrou em nenhum dos dois, lança a exceção
    }
}