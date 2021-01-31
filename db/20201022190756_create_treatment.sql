-- +goose Up
-- +goose StatementBegin
CREATE TABLE Treatment(
	id                 SERIAL PRIMARY KEY,
	user_id            VARCHAR(256) NOT NULL,
	variant            VARCHAR(256) NOT NULL,
	error              VARCHAR(256),
	duration_ms        NUMERIC,
	created_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	run_id             INT NOT NULL REFERENCES Run(id)
);

CREATE INDEX idx_treatment_run_user ON Treatment(run_id, user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Treatment;
-- +goose StatementEnd
