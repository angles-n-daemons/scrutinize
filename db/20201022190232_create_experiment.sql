-- +goose Up
-- +goose StatementBegin
CREATE TABLE Experiment(
	id               SERIAL PRIMARY KEY,
	name             VARCHAR(256) UNIQUE,
	percentage       INT NOT NULL,
	active           BOOLEAN NOT NULL,
	run_count        INT NOT NULL DEFAULT 0,
	created_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	started_time     TIMESTAMP,
	ended_time       TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Experiment;
-- +goose StatementEnd
