-- +goose Up
-- +goose StatementBegin
ALTER TABLE  Experiment
 DROP COLUMN started_time,
 DROP COLUMN ended_time;

CREATE TABLE Run(
	id               SERIAL PRIMARY KEY,
	started_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	ended_time       TIMESTAMP,
	run_count        INT NOT NULL,
	experiment_id    INT NOT NULL REFERENCES Experiment(id)
);

CREATE INDEX run_experient_started ON Run(experiment_id, started_time);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE  Experiment
 ADD COLUMN started_time TIMESTAMP,
 ADD COLUMN ended_time   TIMESTAMP;

DROP TABLE Run;
-- +goose StatementEnd
