const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

validation = {};

validation.validate = (method) => {

    switch (method) {
        case 'createEvent': {
            return [
                check('name').exists().withMessage("Must provide an event name"),
                check('region').exists().withMessage("Event must belong to a region"),
                sanitizeBody('timeRange.start').toDate(),
                sanitizeBody('timeRange.end').toDate()
            ]
        }
    }
}

validation.checkValidation = function(req, res, next) {
    console.log("Checking validation results");
    var result = validationResult(req)
    if (!result.isEmpty()) {
        console.log("There are validation errors");
        console.log(result.array());
        res.status(400).send(result.array());
    }
    else {
        next();
    }
}

module.exports = validation;