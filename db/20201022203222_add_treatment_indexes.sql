-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_treatment_experiment_run_user ON Treatment(experiment_id, experiment_run);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_treatment_experiment_run_user;
-- +goose StatementEnd
