ALTER TABLE publicacoes
    ADD COLUMN IF NOT EXISTS visibilidade VARCHAR(20) NOT NULL DEFAULT 'TODOS';

ALTER TABLE publicacoes
    ADD CONSTRAINT ck_publicacoes_visibilidade
    CHECK (visibilidade IN ('TODOS', 'SEGUIDORES'));
