module.exports = {
    root: true, // 停止向上查找父级目录中的配置文件
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-essential',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier', // eslint-config-prettier
        // 解决使用自动导入api报错
        './.eslintrc-auto-import.json',
        // 单独解决使用vue api时报错
        // 'vue-global-api',
    ],
    parser: 'vue-eslint-parser', // 指定要使用的解析器
    parserOptions: {
        ecmaVersion: 'latest', // 支持的es版本
        parser: '@typescript-eslint/parser',
        sourceType: 'module', // 模块类型
    },
    plugins: ['vue', '@typescript-eslint', 'prettier'], // eslint-plugin
    rules: {
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-var-requires': 'off',
    },
};

