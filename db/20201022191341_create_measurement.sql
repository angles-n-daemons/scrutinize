-- +goose Up
-- +goose StatementBegin
CREATE TABLE Measurement(
	experiment_id   INT NOT NULL REFERENCES Experiment(id),
	treatment_id    INT NOT NULL REFERENCES Treatment(id),
	metric_name     VARCHAR(256),
	value           NUMERIC NOT NULL,
	user_id         VARCHAR(256) NOT NULL,
	variant         VARCHAR(256) NOT NULL,
	created_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Measurement;
-- +goose StatementEnd
