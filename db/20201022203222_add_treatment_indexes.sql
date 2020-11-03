-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_treatment_user_date ON Treatment(user_id, created_time);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_treatment_user_date;
-- +goose StatementEnd
