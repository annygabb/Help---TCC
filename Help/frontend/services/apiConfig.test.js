import test from 'node:test';
import assert from 'node:assert/strict';

import { buildApiUrl, normalizeApiBaseUrl } from './apiConfig.js';

test('usa localhost quando a URL da API não foi configurada', () => {
  assert.equal(normalizeApiBaseUrl(), 'http://localhost:8080');
});

test('remove barras finais da URL configurada', () => {
  assert.equal(
    normalizeApiBaseUrl('https://help-api.example.com///'),
    'https://help-api.example.com'
  );
});

test('monta URLs com exatamente uma barra entre a base e o caminho', () => {
  assert.equal(
    buildApiUrl('/api/usuarios/login', 'https://help-api.example.com/'),
    'https://help-api.example.com/api/usuarios/login'
  );
});

