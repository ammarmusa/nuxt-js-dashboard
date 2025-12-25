import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    // Relax rules for existing codebase
    "vue/multi-word-component-names": "off",
    "vue/attribute-hyphenation": "warn",
    "vue/attributes-order": "warn",
    "vue/html-self-closing": "warn",
    "vue/require-default-prop": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/unified-signatures": "warn",
    "@typescript-eslint/no-unsafe-function-type": "warn",
  },
});
