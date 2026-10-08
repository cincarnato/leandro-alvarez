const projectPasswordPolicy = {
    minLength: 8,
    maxLength: 32,
    requireUppercase: false,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    allowedSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
    disallowSpaces: false,
    preventReuse: 3,
    expirationDays: null
};
export { projectPasswordPolicy };
