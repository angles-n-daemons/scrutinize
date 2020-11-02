-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_observation_experiment_id ON Observation(experiment_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_observation_experiment_id;
-- +goose StatementEnd
