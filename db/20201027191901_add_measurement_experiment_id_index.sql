-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_measurement_experiment_id_metric ON Measurement(experiment_id, metric_name);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_measurement_experiment_id_metric;
-- +goose StatementEnd
