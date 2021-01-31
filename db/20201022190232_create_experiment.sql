-- +goose Up
-- +goose StatementBegin
CREATE TABLE Experiment(
	id               SERIAL PRIMARY KEY,
	name             VARCHAR(256) NOT NULL UNIQUE,
	description      TEXT,
	active           BOOLEAN NOT NULL DEFAULT FALSE,
	created_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Experiment;
-- +goose StatementEnd
