
let index = -1;

export const CHART_COLORS = [

    'rgb(52, 103, 92, alpha)',
    'rgb(179,193,0, alpha)',
    'rgb(76, 181, 245, alpha)',
    'rgb(255,105,180, alpha)'

];

export function nextColor(alpha = 1) {
    return CHART_COLORS[++index % CHART_COLORS.length].replace(/alpha/, alpha);
}

export function currentColor(alpha = 1) {
    return CHART_COLORS[index % CHART_COLORS.length].replace(/alpha/, alpha);
}
