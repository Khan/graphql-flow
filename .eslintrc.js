module.exports = {
    extends: ['@khanacademy'],
    root: true,
    parser: '@babel/eslint-parser',
    plugins: ['flowtype-errors'],
    rules: {
        'prettier/prettier': ['error', {singleQuote: true}],
    },
};
