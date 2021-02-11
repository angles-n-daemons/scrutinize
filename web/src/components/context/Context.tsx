import React from 'react';

import { Experiment } from 'api/api';

export interface ExperimentState {
    experiments: Experiment[];
    setExperiments: Function;
}

export const ExperimentContext = React.createContext<ExperimentState>({
    experiments: [],
    setExperiments: () => {}
});
