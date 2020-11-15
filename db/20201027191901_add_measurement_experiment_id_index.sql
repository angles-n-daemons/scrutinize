-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_measurement_experiment_id ON Measurement(experiment_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_measurement_experiment_id;
-- +goose StatementEnd
