-- Delete the Egypt course and all related data
DELETE FROM sprints
WHERE module_id IN (
  SELECT id FROM modules
  WHERE path_id = '866b7496-c8b0-456c-88dd-57fa29d6185f'
);

DELETE FROM modules
WHERE path_id = '866b7496-c8b0-456c-88dd-57fa29d6185f';

DELETE FROM learning_paths
WHERE id = '866b7496-c8b0-456c-88dd-57fa29d6185f'; 