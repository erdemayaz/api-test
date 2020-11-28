const Controller = require('../core/Controller');
const Joi = require('joi');
const moment = require('moment');
const Record = require('../models/mongodb/RecordModel');

/**
 * for request security, object validation
 */
const countHandlerSchema = Joi.object({
    startDate: Joi.date().iso().required(), // iso() function valitates for YYYY-MM-DD
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    minCount: Joi.number().integer().min(0).required(), // it validates for countable positive integer numbers
    maxCount: Joi.number().integer().min(Joi.ref('minCount')).required()
});

/**
 * Api controller
 */
class ApiController extends Controller {
    /**
     * this function is a handler for api requests
     */
    postCounts(req, res) {
        /**
         * input schema validation
         */
        const result = countHandlerSchema.validate(req.body);
        if (result.error) {
            return res.status(400).json({
                code: 1,
                msg: result.error.message,
                records: []
            });
        }

        /**
         * dates are acceptable only date, not datetime
         */
        const input = result.value;
        if (!(
            moment(req.body.startDate, "YYYY-MM-DD", true).isValid() &&
            moment(req.body.endDate, "YYYY-MM-DD", true).isValid()
        )) {
            return res.status(400).json({
                code: 2,
                msg: "Format of dates must be YYYY-MM-DD",
                records: []
            });
        }

        /**
         * Database aggregation to expected result. 
         * For eliminate, first matching reduces data count,
         * project operation gives new format,
         * and rematching operation controls for requested interval
         */
        Record.aggregate([
            {
                "$match": {
                    createdAt: { "$gte": input.startDate, "$lte": input.endDate }
                }
            },
            {
                "$project": {
                    _id: 0,
                    key: 1,
                    createdAt: 1,
                    totalCount: {
                        "$sum": "$counts"
                    }
                }
            },
            {
                "$match": {
                    totalCount: { "$gte": input.minCount, "$lte": input.maxCount }
                }
            }
        ]).then((docs) => {
            /**
             * if there is no document, nevertheless send standard api schema
             */
            if (!(docs && docs.length > 0)) {
                docs = [];
            }
            res.json({
                code: 0,
                msg: "Success",
                records: docs
            });
        }).catch((err) => {
            /**
             * if some error occures, nevertheless send standard api schema
             */
            res.status(500).json({
                code: 3,
                msg: "Internal server error",
                records: []
            });
        });
    }
}

module.exports = ApiController;