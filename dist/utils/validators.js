"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignIn = exports.validateSignup = void 0;
const validateSignup = (options) => {
    const errors = {};
    if (!options.username.trim())
        errors.username = 'Username is required';
    if (options.username.length <= 2)
        errors.username = 'username must be greater than two';
    if (options.username.includes('@'))
        errors.username = 'should not contain @';
    if (!options.email.trim())
        errors.email = 'email is required';
    if (options.email.length <= 3)
        errors.email = 'username too short';
    if (!options.email.includes('@'))
        errors.email = 'should not contain @';
    if (!options.password.trim())
        errors.password = 'password is required';
    if (options.password.length < 6)
        errors.password = 'password too short';
    return {
        errors,
        valid: Object.keys(errors).length === 0
    };
};
exports.validateSignup = validateSignup;
const validateSignIn = (usernameOrEmail, password) => {
    const errors = {};
    if (!usernameOrEmail.trim())
        errors.usernameOrEmail = "username name or email is required";
    if (!password)
        errors.password = "password is required";
    return {
        errors,
        valid: Object.keys(errors).length === 0
    };
};
exports.validateSignIn = validateSignIn;
//# sourceMappingURL=validators.js.map