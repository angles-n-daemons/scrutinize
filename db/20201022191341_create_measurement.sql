-- +goose Up
-- +goose StatementBegin
CREATE TABLE Measurement(
	metric_name     VARCHAR(256) REFERENCES Metric(name),
	value           NUMERIC NOT NULL,
	user_id         VARCHAR(256) NOT NULL,
	created_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_measurement_metric_time_user ON Measurement(metric_name, created_time, user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Measurement;
-- +goose StatementEnd
