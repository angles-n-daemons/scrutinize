-- +goose Up
-- +goose StatementBegin
CREATE TABLE Experiment(
	id               SERIAL PRIMARY KEY,
	name             VARCHAR(256) UNIQUE,
	percentage       INT NOT NULL,
	created_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_active_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	deleted_time     TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Experiment;
-- +goose StatementEnd
