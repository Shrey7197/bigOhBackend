const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
    try {
        const token = request.headers.authorization;
        console.log(token);

        const decoded = jwt.verify(token, process.env.JWT_KEY, null,);
        request.userData = decoded;
        next();
    }  catch(error) {
        return response.status(404).json({
            message: 'Authentication failed'
        });
    }
};