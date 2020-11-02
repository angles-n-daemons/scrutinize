-- +goose Up
-- +goose StatementBegin
CREATE TABLE Treatment(
	id              SERIAL PRIMARY KEY,
	user_id         VARCHAR(256) NOT NULL,
	treatment       BOOLEAN NOT NULL,
	error           VARCHAR(256),
	created_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	experiment_id   INT NOT NULL REFERENCES Experiment(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE Treatment;
-- +goose StatementEnd
