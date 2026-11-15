import test from 'node:test';
import assert from 'node:assert/strict';
import { alvosDeDenunciaDaPublicacao, mensagemErroDenuncia, protocoloDaDenuncia } from './denuncias.js';

const erroHttp = (status, data) => ({ response: { status, data } });

test('protocolo usa os 8 primeiros caracteres do id em maiúsculas', () => {
  assert.equal(protocoloDaDenuncia('3f2a9c1b-0d4e-4c1a-9b7e-123456789abc'), '#3F2A9C1B');
  assert.equal(protocoloDaDenuncia(''), '');
  assert.equal(protocoloDaDenuncia(undefined), '');
});

test('falha de rede e erro do servidor permitem tentar de novo', () => {
  assert.deepEqual(mensagemErroDenuncia(new Error('Network Error')).podeTentarDeNovo, true);
  assert.equal(mensagemErroDenuncia(erroHttp(500, {})).podeTentarDeNovo, true);
  assert.equal(mensagemErroDenuncia(erroHttp(503)).podeTentarDeNovo, true);
});

test('mensagens do backend aparecem para a pessoa', () => {
  assert.deepEqual(
    mensagemErroDenuncia(erroHttp(400, { error: 'Você não pode denunciar a própria conta.' })),
    { mensagem: 'Você não pode denunciar a própria conta.', podeTentarDeNovo: false }
  );
  assert.equal(mensagemErroDenuncia(erroHttp(400, { campo: 'motivo', mensagem: 'não deve estar em branco' })).mensagem, 'não deve estar em branco');
  assert.equal(mensagemErroDenuncia(erroHttp(400, [{ campo: 'corpo', mensagem: 'JSON inválido' }])).mensagem, 'JSON inválido');
  assert.equal(mensagemErroDenuncia(erroHttp(404, { error: 'Publicação não encontrada.' })).mensagem, 'Publicação não encontrada.');
});

test('status sem mensagem do backend recebem um texto padrão', () => {
  assert.match(mensagemErroDenuncia(erroHttp(401)).mensagem, /sessão expirou/);
  assert.match(mensagemErroDenuncia(erroHttp(404)).mensagem, /não está mais disponível/);
  assert.match(mensagemErroDenuncia(erroHttp(409)).mensagem, /já denunciou/);
  assert.equal(mensagemErroDenuncia(erroHttp(409)).podeTentarDeNovo, false);
});

test('envio cancelado por troca de sessão não sugere repetir', () => {
  assert.equal(mensagemErroDenuncia({ code: 'ERR_CANCELED' }).podeTentarDeNovo, false);
});

test('publicação de pessoa gera opções para o post e para a pessoa', () => {
  const alvos = alvosDeDenunciaDaPublicacao({ id: 'p1', autorId: 'u1', autorTipo: 'USUARIO', autorNome: 'Ana Souza' });
  assert.deepEqual(alvos.map(({ alvoTipo, alvoId, rotulo }) => ({ alvoTipo, alvoId, rotulo })), [
    { alvoTipo: 'PUBLICACAO', alvoId: 'p1', rotulo: 'Denunciar publicação' },
    { alvoTipo: 'USUARIO', alvoId: 'u1', rotulo: 'Denunciar Ana Souza' }
  ]);
  assert.equal(alvos[0].alvoNome, 'publicação de Ana Souza');
});

test('publicação de empresa denuncia a empresa como EMPRESA', () => {
  const [, autor] = alvosDeDenunciaDaPublicacao({ id: 'p2', autorId: 'e1', autorTipo: 'empresa', autorNome: 'Tech LTDA' });
  assert.equal(autor.alvoTipo, 'EMPRESA');
  assert.equal(autor.alvoId, 'e1');
});

test('sem tipo de autor válido só oferece denunciar a publicação', () => {
  assert.equal(alvosDeDenunciaDaPublicacao({ id: 'p3', autorId: 'x', autorTipo: 'ADMIN' }).length, 1);
  assert.deepEqual(alvosDeDenunciaDaPublicacao(null), []);
});
