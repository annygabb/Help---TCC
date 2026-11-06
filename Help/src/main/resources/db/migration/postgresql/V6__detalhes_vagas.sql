ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS tipo_experiencia VARCHAR(30);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS modelo VARCHAR(40);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS tipo VARCHAR(40);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS status VARCHAR(30);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS senioridade VARCHAR(50);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS localizacao VARCHAR(180);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS salario VARCHAR(120);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS prioridade VARCHAR(30);
ALTER TABLE vagas_empresa ADD COLUMN IF NOT EXISTS descricao TEXT;

UPDATE vagas_empresa SET tipo_experiencia = 'anos' WHERE tipo_experiencia IS NULL;
UPDATE vagas_empresa SET modelo = 'Remoto' WHERE modelo IS NULL;
UPDATE vagas_empresa SET tipo = 'CLT' WHERE tipo IS NULL;
UPDATE vagas_empresa SET status = 'ativa' WHERE status IS NULL;
UPDATE vagas_empresa SET senioridade = 'Pleno' WHERE senioridade IS NULL;
UPDATE vagas_empresa SET localizacao = 'Brasil' WHERE localizacao IS NULL;
UPDATE vagas_empresa SET salario = 'A combinar' WHERE salario IS NULL;
UPDATE vagas_empresa SET prioridade = 'media' WHERE prioridade IS NULL;
