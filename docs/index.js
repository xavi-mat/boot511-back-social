const basicInfo = require('./basicInfo');
const comments = require('./comments');
const components = require('./components');
const posts = require('./posts');
const users = require('./users');
module.exports = {
    ...basicInfo,
    paths: {
        ...users,
        ...posts,
        ...comments,
    },
    ...components,
};