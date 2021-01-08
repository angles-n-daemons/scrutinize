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

CREATE INDEX run_experiment_started ON Run(experiment_id, started_time);

ALTER TABLE Treatment
 ADD  COLUMN run_id INT,
 ADD  CONSTRAINT fk_treatment_run_id
      FOREIGN KEY (run_id) REFERENCES Run(id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE Experiment
 ADD COLUMN started_time TIMESTAMP,
 ADD COLUMN ended_time   TIMESTAMP;

DROP TABLE Run;

DROP INDEX run_experiment_started;

ALTER TABLE Treatment
 DROP COLUMN run_id;
-- +goose StatementEnd
