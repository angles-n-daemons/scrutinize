-- +goose Up
-- +goose StatementBegin
CREATE TABLE Metric(
	name            VARCHAR(256) NOT NULL,
	experiment_id   INT NOT NULL REFERENCES Experiment(id),
	created_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(name, experiment_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Metric;
-- +goose StatementEnd
