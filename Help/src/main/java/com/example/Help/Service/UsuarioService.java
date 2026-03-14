package com.example.Help.Service;

import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import com.example.Help.model.login.LoginRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    public void salvar(UsuarioRequestDTO data) {
        if (repository.existsByEmail(data.email())) { //vai procurar se o email ja existe ou nao
            throw new RuntimeException("E-mail já cadastrado no sistema."); //aqui ele vai travar pra nao usar esse email
        }
        Usuario usuarioData = new Usuario(data);
        repository.save(usuarioData);
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return repository.findAll().stream() //aqui ele vai pegar as informações dos usuarios e guardar em response, para não ser possível ver os dados sensíveis
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    public String autenticar(LoginRequestDTO data) {
        Optional<Usuario> usuarioParaLogin = repository.findByEmail(data.email()); //o optional vai ajudar o cod em não travar, pois ele fará abrir mais ""caixas"" para achar as informações.
        if (usuarioParaLogin.isPresent()) {
            Usuario usuario = usuarioParaLogin.get(); //antes de ter o get ele vai verificar se os dados batem (senha etc)
            if (usuario.getPassword().equals(data.password())) {
                return "Login realizado com sucesso! Bem-vindo " + usuario.getName();
            }
            return "Senha incorreta!";
        }
        return "Usuário não encontrado!";
    }
        public void atualizarPerfil(UsuarioRequestDTO data) {
            Usuario usuarioExistente = repository.findByEmail(data.email())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado para atualização."));

            usuarioExistente.setName(data.full_name());
            usuarioExistente.setJobRole(data.job_role());
            usuarioExistente.setLocation(data.user_location());
            usuarioExistente.setBio(data.user_bio());

            repository.save(usuarioExistente);
        }
    }