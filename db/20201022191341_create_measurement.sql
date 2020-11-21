-- +goose Up
-- +goose StatementBegin
CREATE TABLE Measurement(
	metric_name     VARCHAR(256) REFERENCES Metric(name),
	value           NUMERIC NOT NULL,
	user_id         VARCHAR(256) NOT NULL,
	created_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Measurement;
-- +goose StatementEnd
