-- +goose Up
-- +goose StatementBegin
CREATE TABLE Experiment(
	id               SERIAL PRIMARY KEY,
	name             VARCHAR(256) UNIQUE,
	description      TEXT,
	active           BOOLEAN NOT NULL,
	created_time     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Experiment;
-- +goose StatementEnd
