CREATE TABLE IF NOT EXISTS denuncias (
 id UUID PRIMARY KEY, denunciante_tipo VARCHAR(20) NOT NULL, denunciante_id UUID NOT NULL,
 denunciante_nome VARCHAR(150) NOT NULL, alvo_tipo VARCHAR(20) NOT NULL, alvo_id UUID NOT NULL,
 alvo_nome VARCHAR(180) NOT NULL, motivo VARCHAR(120) NOT NULL, descricao VARCHAR(2000),
 prioridade VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, decisao VARCHAR(50),
 justificativa VARCHAR(1000), admin_id UUID, admin_nome VARCHAR(150), criada_em TIMESTAMP NOT NULL,
 atualizada_em TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias(status, prioridade, criada_em DESC);
CREATE INDEX IF NOT EXISTS idx_denuncias_autor ON denuncias(denunciante_tipo, denunciante_id);
