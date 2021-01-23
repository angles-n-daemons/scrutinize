-- +goose Up
-- +goose StatementBegin
CREATE TABLE Run(
	id               SERIAL PRIMARY KEY,
	started_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	ended_time       TIMESTAMP,
	run_count        INT NOT NULL,
	experiment_id    INT NOT NULL REFERENCES Experiment(id)
);

CREATE INDEX run_experiment_started ON Run(experiment_id, started_time);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Run;
-- +goose StatementEnd
