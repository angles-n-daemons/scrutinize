-- +goose Up
-- +goose StatementBegin
CREATE TABLE Metric(
	id              SERIAL PRIMARY KEY,
	name            VARCHAR(256) UNIQUE NOT NULL,
	type            VARCHAR(256),
	created_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Metric;
-- +goose StatementEnd
