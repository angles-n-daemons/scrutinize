export interface Experiment {
    id?: number;
    name: string;
    description: string;
    active: boolean;
    percentage?: number;
    run_id?: number;
    created_time?: Date;
}

export interface Run {
    id?: number
    experiment_id: number;
    percentage: number;
    metrics?: Metric[];
    started_time?: Date;
    ended_time?: Date;
}

export interface Treatment {
    user_id: string;
    run_id: number;
    variant: 'control' | 'experiment';
    error: string;
    duration_ms: number;
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

export interface Performance {
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
    evaluation_criterion: Metric[];
}
