CREATE TABLE IF NOT EXISTS publicacoes (
    id UUID PRIMARY KEY,
    autor_usuario_id UUID REFERENCES usuarios(id),
    autor_empresa_id UUID REFERENCES empresas(id),
    conteudo TEXT,
    midia_url TEXT,
    midia_tipo VARCHAR(20),
    permissao_comentario VARCHAR(20) NOT NULL DEFAULT 'TODOS',
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_publicacao_autor_xor CHECK ((autor_usuario_id IS NOT NULL) <> (autor_empresa_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_publicacoes_criada_em ON publicacoes(criada_em DESC);
CREATE INDEX IF NOT EXISTS idx_publicacoes_autor_usuario ON publicacoes(autor_usuario_id);
CREATE INDEX IF NOT EXISTS idx_publicacoes_autor_empresa ON publicacoes(autor_empresa_id);
