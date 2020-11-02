-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_treatment_experiment_user_date ON Treatment(experiment_id, user_id, created_time);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_treatment_experiment_user_date;
-- +goose StatementEnd
