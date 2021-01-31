-- +goose Up
-- +goose StatementBegin
CREATE TABLE EvaluationCriterion(
    run_id           INT NOT NULL REFERENCES Run(id),
    metric_id        INT NOT NULL REFERENCES Metric(id),
    weight           NUMERIC NOT NULL DEFAULT 1.0,
    deleted_time     TIMESTAMP,
    PRIMARY KEY(run_id, metric_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE EvaluationCriterion;
-- +goose StatementEnd
