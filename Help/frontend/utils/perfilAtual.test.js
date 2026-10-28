import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarPerfilAtual } from './perfilAtual.js';

test('normaliza os dados atuais do perfil de usuario', () => {
  const perfil = normalizarPerfilAtual({
    nome: 'Anny Atualizada',
    cargo: 'Desenvolvedora',
    localidade: 'Goiânia, Goiás',
    fotoUrl: 'https://exemplo.com/foto.jpg',
    experiencias: [
      { empresa: 'Empresa antiga', atual: false },
      { empresa: 'Empresa atual', atual: true }
    ]
  }, 'USUARIO');

  assert.deepEqual(perfil, {
    nome: 'Anny Atualizada',
    cargo: 'Desenvolvedora',
    localidade: 'Goiânia, Goiás',
    fotoUrl: 'https://exemplo.com/foto.jpg',
    empresaAtual: 'Empresa atual',
    tipoConta: 'USUARIO'
  });
});

test('normaliza os dados atuais do perfil de empresa', () => {
  const perfil = normalizarPerfilAtual({
    corporateName: 'Help Tecnologia',
    cidade: 'Anápolis, Goiás',
    fotoUrl: 'https://exemplo.com/logo.jpg'
  }, 'EMPRESA');

  assert.equal(perfil.nome, 'Help Tecnologia');
  assert.equal(perfil.cargo, 'Empresa');
  assert.equal(perfil.localidade, 'Anápolis, Goiás');
  assert.equal(perfil.tipoConta, 'EMPRESA');
});
