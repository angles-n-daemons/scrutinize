export interface Experiment {
    id?: number;
    name: string;
    percentage: number;
    active: boolean;
    run_count: number;
    evaluation_criterion?: Metric[];
    created_time?: Date;
    started_time?: Date;
    ended_time?: Date;
}

export interface Treatment {
    user_id: string;
    variant: 'control' | 'experiment';
    error: string;
    duration_ms: number;
    experiment_name: string;
    experiment_run?: number;
}

export interface Measurement {
    user_id: string;
    metric_name: string;
    value: number;
    created_time?: string;
}

export interface Metric {
    id?: number;
    name: string;
    type?: 'binomial' | 'continuous' | 'count';
}

export type Performance = Record<string, MetricData>;

export interface MetricData {
    control: DataPoint[];
    experiment: DataPoint[];
}

export interface DataPoint {
    metric_name: string;
    variant: 'control' | 'experiment';
    date: string;
    count: number;
    avg: number;
    stddev: number;
}

export interface VariantDetails {
    variant: string;
    volume: string;
    pct_error: string;
    duration_ms: string;
}

export interface Details {
    name: string;
    percentage: number;
    created_time?: Date;
    last_active_time?: Date;
    variants: VariantDetails[];
}
