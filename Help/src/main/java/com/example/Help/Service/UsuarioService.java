package com.example.Help.Service;

import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private CursoRepository cursoRepository; //gerenciar os cursos do usuario

    public void salvar(UsuarioRequestDTO data) {
        if (repository.findByEmail(data.email()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado no sistema.");
        }
        Usuario usuarioData = new Usuario(data);
        repository.save(usuarioData);
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return repository.findAll().stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    public UsuarioResponseDTO autenticarUsuario(LoginRequestDTO data) {
        Usuario usuario = repository.findByEmail(data.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        if (usuario.getPassword().equals(data.password())) {
            return new UsuarioResponseDTO(usuario);
        } else {
            throw new RuntimeException("Senha incorreta!");
        }
    }

    public void atualizarPerfil(UsuarioRequestDTO data) {
        Usuario usuarioExistente = repository.findByEmail(data.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado para atualização."));

        usuarioExistente.setName(data.name());
        usuarioExistente.setJobRole(data.job_role());
        usuarioExistente.setBio(data.user_bio());
        usuarioExistente.setLocation(data.user_location());

        repository.save(usuarioExistente);
    }

    public List<Curso> listarCursosDoUsuario(UUID usuarioId) {//mostra os cursos que envolvem o usuário logado
        return cursoRepository.findByAlunoId(usuarioId);
    }
}