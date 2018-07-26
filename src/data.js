import axios from 'axios';

const _data = {
    events: []
};

axios.create().get('/data')
    .then((response) => {
        _data.events = response.data;
    });

var GasLogData = {
    get: function () {
        return _data;
    }
};

export default GasLogData;