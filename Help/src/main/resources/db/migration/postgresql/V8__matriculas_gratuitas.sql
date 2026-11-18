CREATE TABLE IF NOT EXISTS matriculas_gratuitas (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    curso_codigo VARCHAR(80) NOT NULL,
    confirmada BOOLEAN NOT NULL DEFAULT FALSE,
    codigo_hash VARCHAR(64),
    expira_em TIMESTAMP,
    solicitado_em TIMESTAMP,
    tentativas INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uk_matricula_gratuita_usuario_curso UNIQUE (usuario_id, curso_codigo)
);
