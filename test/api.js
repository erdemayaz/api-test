const axios = require('axios');

const TEST_PORT = 8080;

const correctRequestPayloads = [
    {
        startDate: "2016-01-26",
        endDate: "2018-02-02",
        minCount: 2400,
        maxCount: 3000
    },
    {
        startDate: "2017-08-17",
        endDate: "2017-08-25",
        minCount: 1500,
        maxCount: 7000
    },
    {
        startDate: "2016-12-26",
        endDate: "2020-01-31",
        minCount: 0,
        maxCount: 65000
    },
    {
        startDate: "2015-07-03",
        endDate: "2019-09-19",
        minCount: 99000,
        maxCount: 871000
    },
    {
        startDate: "2000-01-01",
        endDate: "2020-11-28",
        minCount: 2000,
        maxCount: 2000
    }
];

const incorrectRequestPayloads = [
    {
        startDate: "2000-01-01",
        endDate: "2020-11-28",
        minCount: 2000
    },
    {
        startDate: "2016-01-26 14:24:02",
        endDate: "2018-02-02",
        minCount: 2400,
        maxCount: 3000
    },
    {
        startDate: "2018-08-17",
        endDate: "2017-08-25",
        minCount: 1500,
        maxCount: 7000
    },
    {
        startDate: "2016-12-26",
        endDate: "2020-01-31",
        minCount: -20,
        maxCount: 65000
    },
    {
        startDate: "2015-07-03",
        endDate: "2019-09-19",
        minCount: 871000,
        maxCount: 99000
    }
];

/**
 * validation function for request responses
 */
function validateResponse(request, response) {
    if (response.status !== 200) {
        return false;
    }
    if (response.data.code !== 0) {
        return false;
    }
    if (!Array.isArray(response.data.records)) {
        return false;
    }
    var validation = true;
    for (let i = 0; i < response.data.records.length; i++) {
        const record = response.data.records[i];
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        const createdAt = new Date(record.createdAt);
        if (!(
            createdAt &&
            startDate <= createdAt &&
            endDate >= createdAt &&
            record.totalCount &&
            request.minCount <= record.totalCount &&
            request.maxCount >= record.totalCount
        )) {
            validation = false;
            break;
        }
    }

    return validation;
}

describe('API', () => {
    describe('#legal', () => {
        // test with single request
        it('single request', (done) => {
            axios.post(`http://localhost:${TEST_PORT}/api/counts`, correctRequestPayloads[0]).then((response) => {
                const result = validateResponse(correctRequestPayloads[0], response);
                if (result) {
                    done();
                } else {
                    done(new Error("Invalid response"));
                }
            }).catch((err) => {
                done(err);
            });
        });

        // test with multiple concurrent request
        it('multiple request', (done) => {
            Promise.all(correctRequestPayloads.map((v) => {
                return axios.post(`http://localhost:${TEST_PORT}/api/counts`, v);
            })).then((responses) => {
                var result = true;
                for (let i = 0; i < responses.length; i++) {
                    result &= validateResponse(correctRequestPayloads[i], responses[i]);
                }
                if (result) {
                    done();
                } else {
                    done(new Error("Invalid response(s)"));
                }
            }).catch((err) => {
                done(err);
            });
        });
    });
    describe('#illegal', () => {
        // test with missing parameter
        it('missing parameter', (done) => {
            axios.post(`http://localhost:${TEST_PORT}/api/counts`, incorrectRequestPayloads[0]).then((response) => {
                done(new Error("API accepted bad request"));
            }).catch((err) => {
                done();
            });
        });

        // test with invalid parameters
        it('invalid parameter', (done) => {
            Promise.all(incorrectRequestPayloads.map((v) => {
                return axios.post(`http://localhost:${TEST_PORT}/api/counts`, v);
            })).then((responses) => {
                done(new Error("API accepted bad request"));
            }).catch((err) => {
                done();
            });
        });
    });
});
