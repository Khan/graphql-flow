module.exports = {
    root: true,
    plugins: ["prettier", "jest"],
    extends: ["eslint:recommended", "prettier"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
    },
    rules: {
        "prettier/prettier": "error",
        "no-unused-vars": "off",
        "no-case-declarations": "off",
    },
    env: {
        es6: true,
        node: true,
        jest: true,
    },
};
