var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

// GET all documents with id, types, questions and answers
router.get('/', function(req, res, next) {
    req.db.collection('tasks').find({}).toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
});

// GET all documents with id, types, questions
router.get('/tasks', function (req, res, next) {
    req.db.collection('tasks').find({}, {type: 1, question: 1}).toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
});

// Create document with type, question and answer properties
router.post('/', function (req, res, next) {
    const task = req.body;

    if (!validateTask(task)) {
        res.status(400).send('Bad Request.');
        console.log('Invalid task');
        return;
    }

    req.db.collection('tasks').insertOne(task, function (error, result) {
        if (error) throw error;
        res.status(201).send('Created.');
    });

});

// Submit answers and calculate the quiz result
router.post('/submit', function (req, res, next) {
    const assignment = req.body;

    if (!validateAssignment(assignment)) {
        res.status(400).send('Bad Request.');
        console.log(`Invalid assignment`);
        return;
    }

    req.db.collection('tasks').find(
        { _id: { $in: assignment.map(element => ObjectId(element._id)) } },
        {answer: 1, type: 1}).toArray((error, documents) => {
            if (error) throw error;

            if (documents.length !== assignment.length) {
                res.status(404).send('Not Found');
                return;
            }

            const marks = [];

            assignment.forEach(a => {
                const correctAnswer = documents.find(value => value._id.toString() === a._id.toString());

                if (correctAnswer === undefined) {
                    res.status(404).send('Not Found');
                    return;
                }

                const mark = calculateAssignmentMark(a, correctAnswer);


                if (mark === -1){
                    res.status(400).send('Bad request');
                    console.log('Assignment calculation returned negative result: ', a);
                    return;
                }

                marks.push({
                    _id: a._id,
                    mark: mark
                });
            });

        try {
            res.status(200).send(marks);
        } catch (e) {}
    });
});

/*
Schema:
    true-false-question:
        {
            value: boolean
        }
    one-from-four-question:
        [
            { value: string, price: number },
            { value: string, price: number },
            { value: string, price: number },
            { value: string, price: number }
        ]
    n-from-four-question:
        [
            { value: string, sign: boolean },
            { value: string, sign: boolean },
            { value: string, sign: boolean },
            { value: string, sign: boolean }
        ]

    number-question:
        {
            value: number
        }
*/
function calculateAssignmentMark(assignmentAnswer, correctAnswer) {
    switch (correctAnswer.type) {
        case 'true-false-question':
            if (!trueFalseQuestionValidator(assignmentAnswer)) {
                console.log(`Assignment #${assignmentAnswer._id} didn't pass validation`);
                return -1;
            }
            return correctAnswer.answer.value === assignmentAnswer.answer.value ? 1.0 : 0.0;

        case 'one-from-four-question':
            if (!oneFromFourQuestionValidator(assignmentAnswer)) {
                console.log(`Assignment #${assignmentAnswer._id} didn't pass validation`);
                return -1;
            }
            const option = correctAnswer.answer.find(opt => opt.value === assignmentAnswer.answer.value);
            if (option === undefined) {
                console.log(`Can't find ${assignmentAnswer.answer.value} option`);
                return -1;
            }
            return option.price;

        case 'n-from-four-question':
            if (!nFromFourQuestionValidator(assignmentAnswer)) {
                console.log(`Assignment #${assignmentAnswer._id} didn't pass validation`);
                return -1;
            }

            const falseTotal = correctAnswer.answer.filter(opt => !opt.sign).length;
            const trueTotal = 4 - falseTotal;
            let trueSelected = 0;
            let falseSelected = 0;

            if (falseTotal === 0) {
                return 1.0;
            }
            if (trueTotal === 0) {
                return 0.0;
            }

            assignmentAnswer.answer.forEach(answer => {
                const option = correctAnswer.answer.find(opt => opt.value === answer.value);
                if (option === undefined) {
                    console.log(`Can't find ${answer.value} option`);
                    return -1;
                }
                if (option.sign) {
                    trueSelected++;
                } else {
                    falseSelected++;
                }
            });

            const mark = (trueSelected / trueTotal) * (1 - (falseSelected / falseTotal));
            return mark;

        case 'number-question':
            if (!numberQuestionValidator(assignmentAnswer)) {
                console.log(`Assignment #${assignmentAnswer._id} didn't pass validation`);
                return -1;
            }
            return correctAnswer.answer.value === assignmentAnswer.answer.value ? 1.0 : 0.0;
            
        default:
            console.log(`Unknown question type '${correctAnswer.type}'`);
            return -1
    }
}

// Validators
function validateTask(task) {
    return task.hasOwnProperty('type') &&
        task.hasOwnProperty('question') &&
        task.hasOwnProperty('answer');
}
function validateAssignment(assignment) {
    assignment.forEach(a => {
        if (!a.hasOwnProperty('_id') || !a.hasOwnProperty('answer')) {
            return false;
        }
    });
    return true;
}

function trueFalseQuestionValidator(answer) {
    if (answer.answer.hasOwnProperty('value')) {
        if (typeof(answer.answer.value) === 'boolean') {
            return true;
        }
    }
    return false;
}
function oneFromFourQuestionValidator(answer) {
    if (answer.answer.hasOwnProperty('value')) {
        if (typeof(answer.answer.value) === 'string') {
            return true;
        }
    }
    return false;
}
function nFromFourQuestionValidator(answer) {

    if (!Array.isArray(answer.answer)) {
        return false;
    }

    answer.answer.forEach(opt => {
        if (!opt.hasOwnProperty('value')) {
            return false;
        }
        if (typeof(opt.value) !== 'string') {
            return false;
        }
    });

    return true;
}
function numberQuestionValidator(answer) {
    if (answer.answer.hasOwnProperty('value')) {
        if (typeof(answer.answer.value) === 'number') {
            return true;
        }
    }
    return false;
}

module.exports = router;
