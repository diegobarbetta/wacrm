BEGIN;

-- Capture only pipelines whose complete stage structure still matches the
-- original five-stage English seed. Any renamed, added, removed or reordered
-- stage excludes the entire pipeline and therefore preserves customization.
CREATE TEMP TABLE default_pipelines_to_localize ON COMMIT DROP AS
SELECT pipeline_id
FROM pipeline_stages
GROUP BY pipeline_id
HAVING COUNT(*) = 5
   AND COUNT(*) FILTER (
     WHERE (position = 0 AND name = 'New Lead')
        OR (position = 1 AND name = 'Qualified')
        OR (position = 2 AND name = 'Proposal Sent')
        OR (position = 3 AND name = 'Negotiation')
        OR (position = 4 AND name = 'Won')
   ) = 5;

UPDATE pipelines AS pipeline
SET name = 'Funil de vendas'
FROM default_pipelines_to_localize AS candidate
WHERE pipeline.id = candidate.pipeline_id
  AND pipeline.name = 'Sales Pipeline';

UPDATE pipeline_stages AS stage
SET name = CASE stage.position
  WHEN 0 THEN 'Novo lead'
  WHEN 1 THEN 'Qualificado'
  WHEN 2 THEN 'Proposta enviada'
  WHEN 3 THEN 'Negociação'
  WHEN 4 THEN 'Ganho'
END
FROM default_pipelines_to_localize AS candidate
WHERE stage.pipeline_id = candidate.pipeline_id;

COMMIT;
