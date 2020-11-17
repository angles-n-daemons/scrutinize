-- +goose Up
-- +goose StatementBegin
CREATE TABLE EvaluationCriterion(
    experiment_id    INT NOT NULL REFERENCES Experiment(id),
    metric_id        INT NOT NULL REFERENCES Metric(id),
    weight           NUMERIC NOT NULL DEFAULT 1.0,
    deleted_time     TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE EvaluationCriterion;
-- +goose StatementEnd
