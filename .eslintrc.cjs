module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module', 
    ecmaFeatures: {
      jsx: true
    },
    parser: '@typescript-eslint/parser',
  },
  plugins: [
    '@typescript-eslint' ,
    'vue'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    'vue/require-v-for-key': 'error',        
    'vue/valid-v-for': 'error',               
    'vue/html-indent': ['error', 2],          
    'vue/multi-word-component-names': 'off',  
    'vue/attribute-hyphenation': ['error', 'always'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error', 
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        varsIgnorePattern: '^_', 
        argsIgnorePattern: '^_', 
        caughtErrors: 'all', 
        caughtErrorsIgnorePattern: '^_' 
      },
    ],
  }
}
