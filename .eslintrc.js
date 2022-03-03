module.exports = {
    extends: ['@khanacademy'],
    root: true,
    parser: '@babel/eslint-parser',
    rules: {
        'prettier/prettier': ['error', {singleQuote: true}],
    },
};
