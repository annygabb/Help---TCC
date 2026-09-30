import { describe, it, expect } from 'vitest';
import {
  validarCPF,
  formatarCPF,
  apenasDigitos,
  validarSenha,
  motivoSenhaInvalida,
  validarEmail,
  validarCNPJ,
} from '../utils/validacoes.js';

describe('Validacao de CPF', () => {
  it('aceita CPFs com digitos verificadores corretos', () => {
    expect(validarCPF('529.982.247-25')).toBe(true);
    expect(validarCPF('52998224725')).toBe(true);
    expect(validarCPF('111.444.777-35')).toBe(true);
  });

  it('rejeita o primeiro digito verificador errado', () => {
    expect(validarCPF('529.982.247-15')).toBe(false);
  });

  it('rejeita o segundo digito verificador errado', () => {
    expect(validarCPF('529.982.247-26')).toBe(false);
    expect(validarCPF('111.444.777-30')).toBe(false);
  });

  it('rejeita sequencias de digitos iguais', () => {
    ['00000000000', '11111111111', '22222222222', '99999999999'].forEach((cpf) => {
      expect(validarCPF(cpf)).toBe(false);
    });
  });

  it('rejeita tamanhos errados', () => {
    expect(validarCPF('123')).toBe(false);
    expect(validarCPF('5299822472')).toBe(false);
    expect(validarCPF('529982247251')).toBe(false);
  });

  it('rejeita vazio, nulo e texto', () => {
    expect(validarCPF('')).toBe(false);
    expect(validarCPF(null)).toBe(false);
    expect(validarCPF(undefined)).toBe(false);
    expect(validarCPF('abcdefghijk')).toBe(false);
  });

  it('funciona com ou sem mascara', () => {
    expect(validarCPF('529.982.247-25')).toBe(validarCPF('52998224725'));
  });
});

describe('Mascara de CPF', () => {
  it('formata progressivamente enquanto digita', () => {
    expect(formatarCPF('5')).toBe('5');
    expect(formatarCPF('529')).toBe('529');
    expect(formatarCPF('5299')).toBe('529.9');
    expect(formatarCPF('529982')).toBe('529.982');
    expect(formatarCPF('529982247')).toBe('529.982.247');
    expect(formatarCPF('52998224725')).toBe('529.982.247-25');
  });

  it('ignora caracteres nao numericos', () => {
    expect(formatarCPF('a5b2c9d9e8f2g2h4i7j2k5')).toBe('529.982.247-25');
  });

  it('descarta o excesso alem de 11 digitos', () => {
    expect(formatarCPF('529982247259999')).toBe('529.982.247-25');
  });

  it('lida com vazio sem quebrar', () => {
    expect(formatarCPF('')).toBe('');
    expect(formatarCPF(null)).toBe('');
  });
});

describe('apenasDigitos', () => {
  it('remove tudo que nao for numero', () => {
    expect(apenasDigitos('529.982.247-25')).toBe('52998224725');
    expect(apenasDigitos('(62) 3310-6658')).toBe('6233106658');
    expect(apenasDigitos('abc')).toBe('');
  });
});

describe('Regra de senha (espelha o CadastroRequestDTO de 16/09)', () => {
  it('aceita senhas dentro da regra', () => {
    expect(validarSenha('Teste123')).toBe(true);
    expect(validarSenha('Abcdefg1')).toBe(true);
    expect(validarSenha('Senha2026')).toBe(true);
    expect(validarSenha('1Teste12')).toBe(true);
    expect(validarSenha('teste123A')).toBe(true);
  });

  it('rejeita senha sem nenhuma letra maiuscula', () => {
    expect(validarSenha('teste123')).toBe(false);
    expect(validarSenha('senha2026')).toBe(false);
  });

  it('rejeita senha sem letra minuscula', () => {
    expect(validarSenha('TESTE123')).toBe(false);
  });

  it('rejeita senha sem numero', () => {
    expect(validarSenha('Testeabc')).toBe(false);
  });

  it('rejeita senha curta demais (minimo 8)', () => {
    expect(validarSenha('Teste12')).toBe(false); 
    expect(validarSenha('Te1')).toBe(false);
    expect(validarSenha('')).toBe(false);
  });

  it('rejeita senha longa demais (maximo 64)', () => {
    expect(validarSenha('Aa1' + 'x'.repeat(61))).toBe(true); 
    expect(validarSenha('Aa1' + 'x'.repeat(62))).toBe(false); 

  it('explica o motivo da recusa com as mensagens do back-end', () => {
    expect(motivoSenhaInvalida('')).toBe('A senha é obrigatória.');
    expect(motivoSenhaInvalida('abc')).toContain('mínimo 8 caracteres');
    expect(motivoSenhaInvalida('teste123')).toContain('letra maiúscula');
    expect(motivoSenhaInvalida('Testeabc')).toContain('um número');
    expect(motivoSenhaInvalida('Aa1' + 'x'.repeat(62))).toContain('máximo 64');
    expect(motivoSenhaInvalida('Teste123')).toBe('');
  });
});

describe('Validacao de e-mail', () => {
  it('aceita e-mails validos', () => {
    expect(validarEmail('ana@help.com')).toBe(true);
    expect(validarEmail('ana.silva@help.com.br')).toBe(true);
    expect(validarEmail('ana+tag@sub.help.com')).toBe(true);
  });

  it('rejeita e-mails invalidos', () => {

    ['ana', 'ana@', 'ána@help.com', '@help.com', 'ana help.com', 'ana@help', 'ana@@help.com', ''].forEach(
      (e) => expect(validarEmail(e)).toBe(false)
    );
  });

  it('ignora espacos nas pontas', () => {
    expect(validarEmail('  ana@help.com  ')).toBe(true);
  });
});

describe('Validacao de CNPJ', () => {
  it('aceita CNPJs com digitos verificadores corretos', () => {
    expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
    expect(validarCNPJ('11444777000161')).toBe(true);
  });

  it('rejeita digito verificador errado', () => {
    expect(validarCNPJ('11.222.333/0001-82')).toBe(false);
  });

  it('rejeita sequencias iguais e tamanhos errados', () => {
    expect(validarCNPJ('00000000000000')).toBe(false);
    expect(validarCNPJ('1122233300018')).toBe(false);
    expect(validarCNPJ('')).toBe(false);
  });
});
