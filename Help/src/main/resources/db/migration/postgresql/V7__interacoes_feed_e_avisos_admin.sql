CREATE TABLE IF NOT EXISTS curtidas_publicacao (
    id UUID PRIMARY KEY,
    publicacao_id UUID NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
    participante_id UUID NOT NULL,
    participante_tipo VARCHAR(20) NOT NULL,
    CONSTRAINT uk_curtida_publicacao_conta UNIQUE (publicacao_id, participante_id, participante_tipo)
);

CREATE TABLE IF NOT EXISTS comentarios_publicacao (
    id UUID PRIMARY KEY,
    publicacao_id UUID NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL,
    autor_tipo VARCHAR(20) NOT NULL,
    autor_nome VARCHAR(160) NOT NULL,
    autor_foto_url TEXT,
    conteudo VARCHAR(1000) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comentarios_publicacao ON comentarios_publicacao(publicacao_id, criado_em);

CREATE TABLE IF NOT EXISTS avisos_admin (
    id UUID PRIMARY KEY,
    titulo VARCHAR(90) NOT NULL,
    mensagem TEXT NOT NULL,
    publico VARCHAR(20) NOT NULL,
    prioridade VARCHAR(20) NOT NULL,
    destino VARCHAR(120) NOT NULL,
    entregues INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
