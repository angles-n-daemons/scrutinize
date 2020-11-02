-- +goose Up
-- +goose StatementBegin
CREATE TABLE Observation(
	experiment_id   INT NOT NULL REFERENCES Experiment(id),
	treatment_id    INT NOT NULL REFERENCES Treatment(id),
	metric_name     VARCHAR(256),
	value           NUMERIC NOT NULL,
	user_id         VARCHAR(256) NOT NULL,
	treatment       BOOLEAN NOT NULL,
	created_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(treatment_id, metric_name)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Observation;
-- +goose StatementEnd
