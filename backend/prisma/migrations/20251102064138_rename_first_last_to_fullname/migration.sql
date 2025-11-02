-- 1) Adiciona a coluna nova (ainda opcional)
ALTER TABLE "User" ADD COLUMN "full_name" TEXT;

-- 2) Preenche a coluna nova a partir dos campos antigos
-- CONCAT_WS ignora NULLs e coloca espaço apenas quando ambos existem
UPDATE "User"
SET "full_name" = TRIM(BOTH ' ' FROM CONCAT_WS(' ', "first_name", "last_name"));

-- 3) Garante que ninguém fique sem nome (fallback simples)
UPDATE "User"
SET "full_name" = COALESCE(NULLIF("full_name", ''), 'Usuário');

-- 4) Agora pode tornar NOT NULL
ALTER TABLE "User" ALTER COLUMN "full_name" SET NOT NULL;

-- 5) Remove colunas antigas (se existirem)
ALTER TABLE "User"
DROP COLUMN IF EXISTS "first_name",
DROP COLUMN IF EXISTS "last_name";
