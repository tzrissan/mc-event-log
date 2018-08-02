import _ from 'lodash';
let index = -1;

export const CHART_COLORS = {
    green(alpha = 1) {
        return 'rgb(179, 193, 0,   alpha)'.replace(/alpha/, alpha);
    },
    blue(alpha = 1) {
        return 'rgb(76,  181, 245, alpha)'.replace(/alpha/, alpha);
    },
    pink(alpha = 1) {
        return 'rgb(255, 105, 180, alpha)'.replace(/alpha/, alpha);
    },
    pine(alpha = 1) {
        return 'rgb(52,  103, 92,  alpha)'.replace(/alpha/, alpha);
    },
    yellow(alpha = 1) {
        return 'rgb(255, 220, 0,   alpha)'.replace(/alpha/, alpha);
    }
};

export const CHART_COLOR_NAMES = _.keys(CHART_COLORS);

export function nextColor(alpha = 1) {
    const color = CHART_COLOR_NAMES[++index % _.values(CHART_COLOR_NAMES).length];
    return CHART_COLORS[color](alpha);
}

export function currentColor(alpha = 1) {
    const color = CHART_COLOR_NAMES[index % _.values(CHART_COLOR_NAMES).length];
    return CHART_COLORS[color](alpha);
}
