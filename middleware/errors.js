const handleValidationError = (err, res) => {
    let errors = Object.values(err.errors).map(el => el.message);
    res.status(400).send({ msg: errors });
}

const typeError = (err, req, res, next) => {
    console.log(err);
    if (err.name === 'ValidationError') return err = handleValidationError(err, res);
    else if (err.code === 11000) {
        res.status(400).send({ msg: 'Unique constraint error: ' + Object.keys(err.keyPattern) })
    }
    else
        if (!err.origin) {
            res.status(500).send({ msg: 'ERROR' });
        } else {
            res.status(400).send({ msg: `Error: ${err.suborigin}-${err.origin}` });
        }
}

module.exports = { typeError }
