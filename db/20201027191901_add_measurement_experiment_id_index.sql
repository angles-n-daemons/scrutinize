-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_measurement_metric_date ON Measurement(metric_name, created_time);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_measurement_metric_date;
-- +goose StatementEnd
