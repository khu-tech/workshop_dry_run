/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@aws-amplify/auth/lib-esm/Auth.js":
/*!********************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/Auth.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Auth: () => (/* binding */ Auth),
/* harmony export */   AuthClass: () => (/* binding */ AuthClass)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! tslib */ "./node_modules/@aws-amplify/auth/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./types/Auth */ "./node_modules/@aws-amplify/auth/lib-esm/types/Auth.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Hub.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Credentials.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Platform/index.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/parseAWSExports.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/UniversalStorage/index.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/StorageHelper/index.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/JS.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Util/StringUtils.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Amplify.js");
/* harmony import */ var amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! amazon-cognito-identity-js */ "./node_modules/amazon-cognito-identity-js/es/index.js");
/* harmony import */ var amazon_cognito_identity_js_internals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! amazon-cognito-identity-js/internals */ "./node_modules/amazon-cognito-identity-js/es/internals/index.js");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! url */ "./node_modules/@aws-amplify/auth/node_modules/url/url.js");
/* harmony import */ var _OAuth_OAuth__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./OAuth/OAuth */ "./node_modules/@aws-amplify/auth/lib-esm/OAuth/OAuth.js");
/* harmony import */ var _urlListener__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./urlListener */ "./node_modules/@aws-amplify/auth/lib-esm/urlListener.js");
/* harmony import */ var _Errors__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./Errors */ "./node_modules/@aws-amplify/auth/lib-esm/Errors.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0










var logger = new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_3__.ConsoleLogger('AuthClass');
var USER_ADMIN_SCOPE = 'aws.cognito.signin.user.admin';
// 10 sec, following this guide https://www.nngroup.com/articles/response-times-3-important-limits/
var OAUTH_FLOW_MS_TIMEOUT = 10 * 1000;
var AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
    ? Symbol.for('amplify_default')
    : '@@amplify_default');
var dispatchAuthEvent = function (event, data, message) {
    _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.Hub.dispatch('auth', { event: event, data: data, message: message }, 'Auth', AMPLIFY_SYMBOL);
};
// Cognito Documentation for max device
// tslint:disable-next-line:max-line-length
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListDevices.html#API_ListDevices_RequestSyntax
var MAX_DEVICES = 60;
var MAX_AUTOSIGNIN_POLLING_MS = 3 * 60 * 1000;
/**
 * Provide authentication steps
 */
var AuthClass = /** @class */ (function () {
    /**
     * Initialize Auth with AWS configurations
     * @param {Object} config - Configuration of the Auth
     */
    function AuthClass(config) {
        var _this = this;
        this.userPool = null;
        this.user = null;
        this.oAuthFlowInProgress = false;
        this.autoSignInInitiated = false;
        this.inflightSessionPromise = null;
        this.inflightSessionPromiseCounter = 0;
        this.Credentials = _aws_amplify_core__WEBPACK_IMPORTED_MODULE_5__.Credentials;
        this.wrapRefreshSessionCallback = function (callback) {
            var wrapped = function (error, data) {
                if (data) {
                    dispatchAuthEvent('tokenRefresh', undefined, "New token retrieved");
                }
                else {
                    dispatchAuthEvent('tokenRefresh_failure', error, "Failed to retrieve new token");
                }
                return callback(error, data);
            };
            return wrapped;
        }; // prettier-ignore
        this.configure(config);
        this.currentCredentials = this.currentCredentials.bind(this);
        this.currentUserCredentials = this.currentUserCredentials.bind(this);
        _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.Hub.listen('auth', function (_a) {
            var payload = _a.payload;
            var event = payload.event;
            switch (event) {
                case 'verify':
                case 'signIn':
                    _this._storage.setItem('amplify-signin-with-hostedUI', 'false');
                    break;
                case 'signOut':
                    _this._storage.removeItem('amplify-signin-with-hostedUI');
                    break;
                case 'cognitoHostedUI':
                    _this._storage.setItem('amplify-signin-with-hostedUI', 'true');
                    break;
            }
        });
        (0,amazon_cognito_identity_js_internals__WEBPACK_IMPORTED_MODULE_1__.addAuthCategoryToCognitoUserAgent)();
        (0,amazon_cognito_identity_js_internals__WEBPACK_IMPORTED_MODULE_1__.addFrameworkToCognitoUserAgent)(_aws_amplify_core__WEBPACK_IMPORTED_MODULE_6__.Platform.framework);
        _aws_amplify_core__WEBPACK_IMPORTED_MODULE_6__.Platform.observeFrameworkChanges(function () {
            (0,amazon_cognito_identity_js_internals__WEBPACK_IMPORTED_MODULE_1__.addFrameworkToCognitoUserAgent)(_aws_amplify_core__WEBPACK_IMPORTED_MODULE_6__.Platform.framework);
        });
    }
    AuthClass.prototype.getModuleName = function () {
        return 'Auth';
    };
    AuthClass.prototype.configure = function (config) {
        var _this = this;
        if (!config)
            return this._config || {};
        logger.debug('configure Auth');
        var conf = Object.assign({}, this._config, (0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_7__.parseAWSExports)(config).Auth, config);
        this._config = conf;
        var _a = this._config, userPoolId = _a.userPoolId, userPoolWebClientId = _a.userPoolWebClientId, cookieStorage = _a.cookieStorage, oauth = _a.oauth, region = _a.region, identityPoolId = _a.identityPoolId, mandatorySignIn = _a.mandatorySignIn, refreshHandlers = _a.refreshHandlers, identityPoolRegion = _a.identityPoolRegion, clientMetadata = _a.clientMetadata, endpoint = _a.endpoint, storage = _a.storage;
        if (!storage) {
            // backward compatability
            if (cookieStorage)
                this._storage = new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CookieStorage(cookieStorage);
            else {
                this._storage = config.ssr
                    ? new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_8__.UniversalStorage()
                    : new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_9__.StorageHelper().getStorage();
            }
        }
        else {
            if (!this._isValidAuthStorage(storage)) {
                logger.error('The storage in the Auth config is not valid!');
                throw new Error('Empty storage object');
            }
            this._storage = storage;
        }
        this._storageSync = Promise.resolve();
        if (typeof this._storage['sync'] === 'function') {
            this._storageSync = this._storage['sync']();
        }
        if (userPoolId) {
            var userPoolData = {
                UserPoolId: userPoolId,
                ClientId: userPoolWebClientId,
                endpoint: endpoint,
            };
            userPoolData.Storage = this._storage;
            this.userPool = new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUserPool(userPoolData, this.wrapRefreshSessionCallback);
        }
        this.Credentials.configure({
            mandatorySignIn: mandatorySignIn,
            region: region,
            userPoolId: userPoolId,
            identityPoolId: identityPoolId,
            refreshHandlers: refreshHandlers,
            storage: this._storage,
            identityPoolRegion: identityPoolRegion,
        });
        // initialize cognitoauth client if hosted ui options provided
        // to keep backward compatibility:
        var cognitoHostedUIConfig = oauth
            ? (0,_types__WEBPACK_IMPORTED_MODULE_10__.isCognitoHostedOpts)(this._config.oauth)
                ? oauth
                : oauth.awsCognito
            : undefined;
        if (cognitoHostedUIConfig) {
            var cognitoAuthParams = Object.assign({
                cognitoClientId: userPoolWebClientId,
                UserPoolId: userPoolId,
                domain: cognitoHostedUIConfig['domain'],
                scopes: cognitoHostedUIConfig['scope'],
                redirectSignIn: cognitoHostedUIConfig['redirectSignIn'],
                redirectSignOut: cognitoHostedUIConfig['redirectSignOut'],
                responseType: cognitoHostedUIConfig['responseType'],
                Storage: this._storage,
                urlOpener: cognitoHostedUIConfig['urlOpener'],
                clientMetadata: clientMetadata,
            }, cognitoHostedUIConfig['options']);
            this._oAuthHandler = new _OAuth_OAuth__WEBPACK_IMPORTED_MODULE_11__["default"]({
                scopes: cognitoAuthParams.scopes,
                config: cognitoAuthParams,
                cognitoClientId: cognitoAuthParams.cognitoClientId,
            });
            // **NOTE** - Remove this in a future major release as it is a breaking change
            // Prevents _handleAuthResponse from being called multiple times in Expo
            // See https://github.com/aws-amplify/amplify-js/issues/4388
            var usedResponseUrls_1 = {};
            (0,_urlListener__WEBPACK_IMPORTED_MODULE_12__["default"])(function (_a) {
                var url = _a.url;
                if (usedResponseUrls_1[url]) {
                    return;
                }
                usedResponseUrls_1[url] = true;
                _this._handleAuthResponse(url);
            });
        }
        dispatchAuthEvent('configured', null, "The Auth category has been configured successfully");
        if (!this.autoSignInInitiated &&
            typeof this._storage['getItem'] === 'function') {
            var pollingInitiated = this.isTrueStorageValue('amplify-polling-started');
            if (pollingInitiated) {
                dispatchAuthEvent('autoSignIn_failure', null, _types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.AutoSignInError);
                this._storage.removeItem('amplify-auto-sign-in');
            }
            this._storage.removeItem('amplify-polling-started');
        }
        return this._config;
    };
    /**
     * Sign up with username, password and other attributes like phone, email
     * @param {String | object} params - The user attributes used for signin
     * @param {String[]} restOfAttrs - for the backward compatability
     * @return - A promise resolves callback data if success
     */
    AuthClass.prototype.signUp = function (params) {
        var _this = this;
        var restOfAttrs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            restOfAttrs[_i - 1] = arguments[_i];
        }
        var _a, _b, _c;
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        var username = null;
        var password = null;
        var attributes = [];
        var validationData = null;
        var clientMetadata;
        var autoSignIn = { enabled: false };
        var autoSignInValidationData = {};
        var autoSignInClientMetaData = {};
        if (params && typeof params === 'string') {
            username = params;
            password = restOfAttrs ? restOfAttrs[0] : null;
            var email = restOfAttrs ? restOfAttrs[1] : null;
            var phone_number = restOfAttrs ? restOfAttrs[2] : null;
            if (email)
                attributes.push(new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUserAttribute({ Name: 'email', Value: email }));
            if (phone_number)
                attributes.push(new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUserAttribute({
                    Name: 'phone_number',
                    Value: phone_number,
                }));
        }
        else if (params && typeof params === 'object') {
            username = params['username'];
            password = params['password'];
            if (params && params.clientMetadata) {
                clientMetadata = params.clientMetadata;
            }
            else if (this._config.clientMetadata) {
                clientMetadata = this._config.clientMetadata;
            }
            var attrs_1 = params['attributes'];
            if (attrs_1) {
                Object.keys(attrs_1).map(function (key) {
                    attributes.push(new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUserAttribute({ Name: key, Value: attrs_1[key] }));
                });
            }
            var validationDataObject_1 = params['validationData'];
            if (validationDataObject_1) {
                validationData = [];
                Object.keys(validationDataObject_1).map(function (key) {
                    validationData.push(new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUserAttribute({
                        Name: key,
                        Value: validationDataObject_1[key],
                    }));
                });
            }
            autoSignIn = (_a = params.autoSignIn) !== null && _a !== void 0 ? _a : { enabled: false };
            if (autoSignIn.enabled) {
                this._storage.setItem('amplify-auto-sign-in', 'true');
                autoSignInValidationData = (_b = autoSignIn.validationData) !== null && _b !== void 0 ? _b : {};
                autoSignInClientMetaData = (_c = autoSignIn.clientMetaData) !== null && _c !== void 0 ? _c : {};
            }
        }
        else {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.SignUpError);
        }
        if (!username) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyUsername);
        }
        if (!password) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyPassword);
        }
        logger.debug('signUp attrs:', attributes);
        logger.debug('signUp validation data:', validationData);
        return new Promise(function (resolve, reject) {
            _this.userPool.signUp(username, password, attributes, validationData, function (err, data) {
                if (err) {
                    dispatchAuthEvent('signUp_failure', err, username + " failed to signup");
                    reject(err);
                }
                else {
                    dispatchAuthEvent('signUp', data, username + " has signed up successfully");
                    if (autoSignIn.enabled) {
                        _this.handleAutoSignIn(username, password, autoSignInValidationData, autoSignInClientMetaData, data);
                    }
                    resolve(data);
                }
            }, clientMetadata);
        });
    };
    AuthClass.prototype.handleAutoSignIn = function (username, password, validationData, clientMetadata, data) {
        this.autoSignInInitiated = true;
        var authDetails = new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.AuthenticationDetails({
            Username: username,
            Password: password,
            ValidationData: validationData,
            ClientMetadata: clientMetadata,
        });
        if (data.userConfirmed) {
            this.signInAfterUserConfirmed(authDetails);
        }
        else if (this._config.signUpVerificationMethod === 'link') {
            this.handleLinkAutoSignIn(authDetails);
        }
        else {
            this.handleCodeAutoSignIn(authDetails);
        }
    };
    AuthClass.prototype.handleCodeAutoSignIn = function (authDetails) {
        var _this = this;
        var listenEvent = function (_a) {
            var payload = _a.payload;
            if (payload.event === 'confirmSignUp') {
                _this.signInAfterUserConfirmed(authDetails, listenEvent);
            }
        };
        _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.Hub.listen('auth', listenEvent);
    };
    AuthClass.prototype.handleLinkAutoSignIn = function (authDetails) {
        var _this = this;
        this._storage.setItem('amplify-polling-started', 'true');
        var start = Date.now();
        var autoSignInPollingIntervalId = setInterval(function () {
            if (Date.now() - start > MAX_AUTOSIGNIN_POLLING_MS) {
                clearInterval(autoSignInPollingIntervalId);
                dispatchAuthEvent('autoSignIn_failure', null, 'Please confirm your account and use your credentials to sign in.');
                _this._storage.removeItem('amplify-auto-sign-in');
            }
            else {
                _this.signInAfterUserConfirmed(authDetails, null, autoSignInPollingIntervalId);
            }
        }, 5000);
    };
    AuthClass.prototype.signInAfterUserConfirmed = function (authDetails, listenEvent, autoSignInPollingIntervalId) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var user, error_1;
            var _this = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = this.createCognitoUser(authDetails.getUsername());
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, user.authenticateUser(authDetails, this.authCallbacks(user, function (value) {
                                dispatchAuthEvent('autoSignIn', value, authDetails.getUsername() + " has signed in successfully");
                                if (listenEvent) {
                                    _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.Hub.remove('auth', listenEvent);
                                }
                                if (autoSignInPollingIntervalId) {
                                    clearInterval(autoSignInPollingIntervalId);
                                    _this._storage.removeItem('amplify-polling-started');
                                }
                                _this._storage.removeItem('amplify-auto-sign-in');
                            }, function (error) {
                                logger.error(error);
                                _this._storage.removeItem('amplify-auto-sign-in');
                            }))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        logger.error(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send the verification code to confirm sign up
     * @param {String} username - The username to be confirmed
     * @param {String} code - The verification code
     * @param {ConfirmSignUpOptions} options - other options for confirm signup
     * @return - A promise resolves callback data if success
     */
    AuthClass.prototype.confirmSignUp = function (username, code, options) {
        var _this = this;
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        if (!username) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyUsername);
        }
        if (!code) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyCode);
        }
        var user = this.createCognitoUser(username);
        var forceAliasCreation = options && typeof options.forceAliasCreation === 'boolean'
            ? options.forceAliasCreation
            : true;
        var clientMetadata;
        if (options && options.clientMetadata) {
            clientMetadata = options.clientMetadata;
        }
        else if (this._config.clientMetadata) {
            clientMetadata = this._config.clientMetadata;
        }
        return new Promise(function (resolve, reject) {
            user.confirmRegistration(code, forceAliasCreation, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    dispatchAuthEvent('confirmSignUp', data, username + " has been confirmed successfully");
                    var autoSignIn = _this.isTrueStorageValue('amplify-auto-sign-in');
                    if (autoSignIn && !_this.autoSignInInitiated) {
                        dispatchAuthEvent('autoSignIn_failure', null, _types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.AutoSignInError);
                        _this._storage.removeItem('amplify-auto-sign-in');
                    }
                    resolve(data);
                }
            }, clientMetadata);
        });
    };
    AuthClass.prototype.isTrueStorageValue = function (value) {
        var item = this._storage.getItem(value);
        return item ? item === 'true' : false;
    };
    /**
     * Resend the verification code
     * @param {String} username - The username to be confirmed
     * @param {ClientMetadata} clientMetadata - Metadata to be passed to Cognito Lambda triggers
     * @return - A promise resolves code delivery details if successful
     */
    AuthClass.prototype.resendSignUp = function (username, clientMetadata) {
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        if (!username) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyUsername);
        }
        var user = this.createCognitoUser(username);
        return new Promise(function (resolve, reject) {
            user.resendConfirmationCode(function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            }, clientMetadata);
        });
    };
    /**
     * Sign in
     * @param {String | SignInOpts} usernameOrSignInOpts - The username to be signed in or the sign in options
     * @param {String} pw - The password of the username
     * @param {ClientMetaData} clientMetadata - Client metadata for custom workflows
     * @return - A promise resolves the CognitoUser
     */
    AuthClass.prototype.signIn = function (usernameOrSignInOpts, pw, clientMetadata) {
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        var username = null;
        var password = null;
        var validationData = {};
        // for backward compatibility
        if (typeof usernameOrSignInOpts === 'string') {
            username = usernameOrSignInOpts;
            password = pw;
        }
        else if ((0,_types__WEBPACK_IMPORTED_MODULE_10__.isUsernamePasswordOpts)(usernameOrSignInOpts)) {
            if (typeof pw !== 'undefined') {
                logger.warn('The password should be defined under the first parameter object!');
            }
            username = usernameOrSignInOpts.username;
            password = usernameOrSignInOpts.password;
            validationData = usernameOrSignInOpts.validationData;
        }
        else {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.InvalidUsername);
        }
        if (!username) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyUsername);
        }
        var authDetails = new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.AuthenticationDetails({
            Username: username,
            Password: password,
            ValidationData: validationData,
            ClientMetadata: clientMetadata,
        });
        if (password) {
            return this.signInWithPassword(authDetails);
        }
        else {
            return this.signInWithoutPassword(authDetails);
        }
    };
    /**
     * Return an object with the authentication callbacks
     * @param {CognitoUser} user - the cognito user object
     * @param {} resolve - function called when resolving the current step
     * @param {} reject - function called when rejecting the current step
     * @return - an object with the callback methods for user authentication
     */
    AuthClass.prototype.authCallbacks = function (user, resolve, reject) {
        var _this = this;
        var that = this;
        return {
            onSuccess: function (session) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                var cred, e_1, currentUser, e_2;
                return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            logger.debug(session);
                            delete user['challengeName'];
                            delete user['challengeParam'];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, 5, 9]);
                            return [4 /*yield*/, this.Credentials.clear()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.Credentials.set(session, 'session')];
                        case 3:
                            cred = _a.sent();
                            logger.debug('succeed to get cognito credentials', cred);
                            return [3 /*break*/, 9];
                        case 4:
                            e_1 = _a.sent();
                            logger.debug('cannot get cognito credentials', e_1);
                            return [3 /*break*/, 9];
                        case 5:
                            _a.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.currentUserPoolUser()];
                        case 6:
                            currentUser = _a.sent();
                            that.user = currentUser;
                            dispatchAuthEvent('signIn', currentUser, "A user " + user.getUsername() + " has been signed in");
                            resolve(currentUser);
                            return [3 /*break*/, 8];
                        case 7:
                            e_2 = _a.sent();
                            logger.error('Failed to get the signed in user', e_2);
                            reject(e_2);
                            return [3 /*break*/, 8];
                        case 8: return [7 /*endfinally*/];
                        case 9: return [2 /*return*/];
                    }
                });
            }); },
            onFailure: function (err) {
                logger.debug('signIn failure', err);
                dispatchAuthEvent('signIn_failure', err, user.getUsername() + " failed to signin");
                reject(err);
            },
            customChallenge: function (challengeParam) {
                logger.debug('signIn custom challenge answer required');
                user['challengeName'] = 'CUSTOM_CHALLENGE';
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            mfaRequired: function (challengeName, challengeParam) {
                logger.debug('signIn MFA required');
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            mfaSetup: function (challengeName, challengeParam) {
                logger.debug('signIn mfa setup', challengeName);
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                logger.debug('signIn new password');
                user['challengeName'] = 'NEW_PASSWORD_REQUIRED';
                user['challengeParam'] = {
                    userAttributes: userAttributes,
                    requiredAttributes: requiredAttributes,
                };
                resolve(user);
            },
            totpRequired: function (challengeName, challengeParam) {
                logger.debug('signIn totpRequired');
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
            selectMFAType: function (challengeName, challengeParam) {
                logger.debug('signIn selectMFAType', challengeName);
                user['challengeName'] = challengeName;
                user['challengeParam'] = challengeParam;
                resolve(user);
            },
        };
    };
    /**
     * Sign in with a password
     * @private
     * @param {AuthenticationDetails} authDetails - the user sign in data
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    AuthClass.prototype.signInWithPassword = function (authDetails) {
        var _this = this;
        if (this.pendingSignIn) {
            throw new Error('Pending sign-in attempt already in progress');
        }
        var user = this.createCognitoUser(authDetails.getUsername());
        this.pendingSignIn = new Promise(function (resolve, reject) {
            user.authenticateUser(authDetails, _this.authCallbacks(user, function (value) {
                _this.pendingSignIn = null;
                resolve(value);
            }, function (error) {
                _this.pendingSignIn = null;
                reject(error);
            }));
        });
        return this.pendingSignIn;
    };
    /**
     * Sign in without a password
     * @private
     * @param {AuthenticationDetails} authDetails - the user sign in data
     * @return - A promise resolves the CognitoUser object if success or mfa required
     */
    AuthClass.prototype.signInWithoutPassword = function (authDetails) {
        var _this = this;
        var user = this.createCognitoUser(authDetails.getUsername());
        user.setAuthenticationFlowType('CUSTOM_AUTH');
        return new Promise(function (resolve, reject) {
            user.initiateAuth(authDetails, _this.authCallbacks(user, resolve, reject));
        });
    };
    /**
     * This was previously used by an authenticated user to get MFAOptions,
     * but no longer returns a meaningful response. Refer to the documentation for
     * how to setup and use MFA: https://docs.amplify.aws/lib/auth/mfa/q/platform/js
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves the current preferred mfa option if success
     */
    AuthClass.prototype.getMFAOptions = function (user) {
        return new Promise(function (res, rej) {
            user.getMFAOptions(function (err, mfaOptions) {
                if (err) {
                    logger.debug('get MFA Options failed', err);
                    rej(err);
                    return;
                }
                logger.debug('get MFA options success', mfaOptions);
                res(mfaOptions);
                return;
            });
        });
    };
    /**
     * get preferred mfa method
     * @param {CognitoUser} user - the current cognito user
     * @param {GetPreferredMFAOpts} params - options for getting the current user preferred MFA
     */
    AuthClass.prototype.getPreferredMFA = function (user, params) {
        var _this = this;
        var that = this;
        return new Promise(function (res, rej) {
            var clientMetadata = _this._config.clientMetadata; // TODO: verify behavior if this is override during signIn
            var bypassCache = params ? params.bypassCache : false;
            user.getUserData(function (err, data) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                var cleanUpError_1, mfaType;
                return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!err) return [3 /*break*/, 5];
                            logger.debug('getting preferred mfa failed', err);
                            if (!this.isSessionInvalid(err)) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.cleanUpInvalidSession(user)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            cleanUpError_1 = _a.sent();
                            rej(new Error("Session is invalid due to: " + err.message + " and failed to clean up invalid session: " + cleanUpError_1.message));
                            return [2 /*return*/];
                        case 4:
                            rej(err);
                            return [2 /*return*/];
                        case 5:
                            mfaType = that._getMfaTypeFromUserData(data);
                            if (!mfaType) {
                                rej('invalid MFA Type');
                                return [2 /*return*/];
                            }
                            else {
                                res(mfaType);
                                return [2 /*return*/];
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, { bypassCache: bypassCache, clientMetadata: clientMetadata });
        });
    };
    AuthClass.prototype._getMfaTypeFromUserData = function (data) {
        var ret = null;
        var preferredMFA = data.PreferredMfaSetting;
        // if the user has used Auth.setPreferredMFA() to setup the mfa type
        // then the "PreferredMfaSetting" would exist in the response
        if (preferredMFA) {
            ret = preferredMFA;
        }
        else {
            // if mfaList exists but empty, then its noMFA
            var mfaList = data.UserMFASettingList;
            if (!mfaList) {
                // if SMS was enabled by using Auth.enableSMS(),
                // the response would contain MFAOptions
                // as for now Cognito only supports for SMS, so we will say it is 'SMS_MFA'
                // if it does not exist, then it should be NOMFA
                var MFAOptions = data.MFAOptions;
                if (MFAOptions) {
                    ret = 'SMS_MFA';
                }
                else {
                    ret = 'NOMFA';
                }
            }
            else if (mfaList.length === 0) {
                ret = 'NOMFA';
            }
            else {
                logger.debug('invalid case for getPreferredMFA', data);
            }
        }
        return ret;
    };
    AuthClass.prototype._getUserData = function (user, params) {
        var _this = this;
        return new Promise(function (res, rej) {
            user.getUserData(function (err, data) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                var cleanUpError_2;
                return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!err) return [3 /*break*/, 5];
                            logger.debug('getting user data failed', err);
                            if (!this.isSessionInvalid(err)) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.cleanUpInvalidSession(user)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            cleanUpError_2 = _a.sent();
                            rej(new Error("Session is invalid due to: " + err.message + " and failed to clean up invalid session: " + cleanUpError_2.message));
                            return [2 /*return*/];
                        case 4:
                            rej(err);
                            return [2 /*return*/];
                        case 5:
                            res(data);
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            }); }, params);
        });
    };
    /**
     * set preferred MFA method
     * @param {CognitoUser} user - the current Cognito user
     * @param {string} mfaMethod - preferred mfa method
     * @return - A promise resolve if success
     */
    AuthClass.prototype.setPreferredMFA = function (user, mfaMethod) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var clientMetadata, userData, smsMfaSettings, totpMfaSettings, _a, mfaList, currentMFAType, that;
            var _this = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        clientMetadata = this._config.clientMetadata;
                        return [4 /*yield*/, this._getUserData(user, {
                                bypassCache: true,
                                clientMetadata: clientMetadata,
                            })];
                    case 1:
                        userData = _b.sent();
                        smsMfaSettings = null;
                        totpMfaSettings = null;
                        _a = mfaMethod;
                        switch (_a) {
                            case 'TOTP': return [3 /*break*/, 2];
                            case 'SOFTWARE_TOKEN_MFA': return [3 /*break*/, 2];
                            case 'SMS': return [3 /*break*/, 3];
                            case 'SMS_MFA': return [3 /*break*/, 3];
                            case 'NOMFA': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 2:
                        totpMfaSettings = {
                            PreferredMfa: true,
                            Enabled: true,
                        };
                        return [3 /*break*/, 7];
                    case 3:
                        smsMfaSettings = {
                            PreferredMfa: true,
                            Enabled: true,
                        };
                        return [3 /*break*/, 7];
                    case 4:
                        mfaList = userData['UserMFASettingList'];
                        return [4 /*yield*/, this._getMfaTypeFromUserData(userData)];
                    case 5:
                        currentMFAType = _b.sent();
                        if (currentMFAType === 'NOMFA') {
                            return [2 /*return*/, Promise.resolve('No change for mfa type')];
                        }
                        else if (currentMFAType === 'SMS_MFA') {
                            smsMfaSettings = {
                                PreferredMfa: false,
                                Enabled: false,
                            };
                        }
                        else if (currentMFAType === 'SOFTWARE_TOKEN_MFA') {
                            totpMfaSettings = {
                                PreferredMfa: false,
                                Enabled: false,
                            };
                        }
                        else {
                            return [2 /*return*/, this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.InvalidMFA)];
                        }
                        // if there is a UserMFASettingList in the response
                        // we need to disable every mfa type in that list
                        if (mfaList && mfaList.length !== 0) {
                            // to disable SMS or TOTP if exists in that list
                            mfaList.forEach(function (mfaType) {
                                if (mfaType === 'SMS_MFA') {
                                    smsMfaSettings = {
                                        PreferredMfa: false,
                                        Enabled: false,
                                    };
                                }
                                else if (mfaType === 'SOFTWARE_TOKEN_MFA') {
                                    totpMfaSettings = {
                                        PreferredMfa: false,
                                        Enabled: false,
                                    };
                                }
                            });
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        logger.debug('no validmfa method provided');
                        return [2 /*return*/, this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.NoMFA)];
                    case 7:
                        that = this;
                        return [2 /*return*/, new Promise(function (res, rej) {
                                user.setUserMfaPreference(smsMfaSettings, totpMfaSettings, function (err, result) {
                                    if (err) {
                                        logger.debug('Set user mfa preference error', err);
                                        return rej(err);
                                    }
                                    logger.debug('Set user mfa success', result);
                                    logger.debug('Caching the latest user data into local');
                                    // cache the latest result into user data
                                    user.getUserData(function (err, data) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                                        var cleanUpError_3;
                                        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!err) return [3 /*break*/, 5];
                                                    logger.debug('getting user data failed', err);
                                                    if (!this.isSessionInvalid(err)) return [3 /*break*/, 4];
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    return [4 /*yield*/, this.cleanUpInvalidSession(user)];
                                                case 2:
                                                    _a.sent();
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    cleanUpError_3 = _a.sent();
                                                    rej(new Error("Session is invalid due to: " + err.message + " and failed to clean up invalid session: " + cleanUpError_3.message));
                                                    return [2 /*return*/];
                                                case 4: return [2 /*return*/, rej(err)];
                                                case 5: return [2 /*return*/, res(result)];
                                            }
                                        });
                                    }); }, {
                                        bypassCache: true,
                                        clientMetadata: clientMetadata,
                                    });
                                });
                            })];
                }
            });
        });
    };
    /**
     * disable SMS
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves is success
     */
    AuthClass.prototype.disableSMS = function (user) {
        return new Promise(function (res, rej) {
            user.disableMFA(function (err, data) {
                if (err) {
                    logger.debug('disable mfa failed', err);
                    rej(err);
                    return;
                }
                logger.debug('disable mfa succeed', data);
                res(data);
                return;
            });
        });
    };
    /**
     * enable SMS
     * @deprecated
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves is success
     */
    AuthClass.prototype.enableSMS = function (user) {
        return new Promise(function (res, rej) {
            user.enableMFA(function (err, data) {
                if (err) {
                    logger.debug('enable mfa failed', err);
                    rej(err);
                    return;
                }
                logger.debug('enable mfa succeed', data);
                res(data);
                return;
            });
        });
    };
    /**
     * Setup TOTP
     * @param {CognitoUser} user - the current user
     * @return - A promise resolves with the secret code if success
     */
    AuthClass.prototype.setupTOTP = function (user) {
        return new Promise(function (res, rej) {
            user.associateSoftwareToken({
                onFailure: function (err) {
                    logger.debug('associateSoftwareToken failed', err);
                    rej(err);
                    return;
                },
                associateSecretCode: function (secretCode) {
                    logger.debug('associateSoftwareToken success', secretCode);
                    res(secretCode);
                    return;
                },
            });
        });
    };
    /**
     * verify TOTP setup
     * @param {CognitoUser} user - the current user
     * @param {string} challengeAnswer - challenge answer
     * @return - A promise resolves is success
     */
    AuthClass.prototype.verifyTotpToken = function (user, challengeAnswer) {
        logger.debug('verification totp token', user, challengeAnswer);
        var signInUserSession;
        if (user && typeof user.getSignInUserSession === 'function') {
            signInUserSession = user.getSignInUserSession();
        }
        var isLoggedIn = signInUserSession === null || signInUserSession === void 0 ? void 0 : signInUserSession.isValid();
        return new Promise(function (res, rej) {
            user.verifySoftwareToken(challengeAnswer, 'My TOTP device', {
                onFailure: function (err) {
                    logger.debug('verifyTotpToken failed', err);
                    rej(err);
                    return;
                },
                onSuccess: function (data) {
                    if (!isLoggedIn) {
                        dispatchAuthEvent('signIn', user, "A user " + user.getUsername() + " has been signed in");
                    }
                    dispatchAuthEvent('verify', user, "A user " + user.getUsername() + " has been verified");
                    logger.debug('verifyTotpToken success', data);
                    res(data);
                    return;
                },
            });
        });
    };
    /**
     * Send MFA code to confirm sign in
     * @param {Object} user - The CognitoUser object
     * @param {String} code - The confirmation code
     */
    AuthClass.prototype.confirmSignIn = function (user, code, mfaType, clientMetadata) {
        var _this = this;
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        if (!code) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyCode);
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.sendMFACode(code, {
                onSuccess: function (session) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                    var cred, e_3, currentUser, e_4;
                    return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                logger.debug(session);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 4, 5, 10]);
                                return [4 /*yield*/, this.Credentials.clear()];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, this.Credentials.set(session, 'session')];
                            case 3:
                                cred = _a.sent();
                                logger.debug('succeed to get cognito credentials', cred);
                                return [3 /*break*/, 10];
                            case 4:
                                e_3 = _a.sent();
                                logger.debug('cannot get cognito credentials', e_3);
                                return [3 /*break*/, 10];
                            case 5:
                                that.user = user;
                                _a.label = 6;
                            case 6:
                                _a.trys.push([6, 8, , 9]);
                                return [4 /*yield*/, this.currentUserPoolUser()];
                            case 7:
                                currentUser = _a.sent();
                                user.attributes = currentUser.attributes;
                                return [3 /*break*/, 9];
                            case 8:
                                e_4 = _a.sent();
                                logger.debug('cannot get updated Cognito User', e_4);
                                return [3 /*break*/, 9];
                            case 9:
                                dispatchAuthEvent('signIn', user, "A user " + user.getUsername() + " has been signed in");
                                resolve(user);
                                return [7 /*endfinally*/];
                            case 10: return [2 /*return*/];
                        }
                    });
                }); },
                onFailure: function (err) {
                    logger.debug('confirm signIn failure', err);
                    reject(err);
                },
            }, mfaType, clientMetadata);
        });
    };
    AuthClass.prototype.completeNewPassword = function (user, password, requiredAttributes, clientMetadata) {
        var _this = this;
        if (requiredAttributes === void 0) { requiredAttributes = {}; }
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        if (!password) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyPassword);
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.completeNewPasswordChallenge(password, requiredAttributes, {
                onSuccess: function (session) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                    var cred, e_5;
                    return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                logger.debug(session);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 4, 5, 6]);
                                return [4 /*yield*/, this.Credentials.clear()];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, this.Credentials.set(session, 'session')];
                            case 3:
                                cred = _a.sent();
                                logger.debug('succeed to get cognito credentials', cred);
                                return [3 /*break*/, 6];
                            case 4:
                                e_5 = _a.sent();
                                logger.debug('cannot get cognito credentials', e_5);
                                return [3 /*break*/, 6];
                            case 5:
                                that.user = user;
                                dispatchAuthEvent('signIn', user, "A user " + user.getUsername() + " has been signed in");
                                resolve(user);
                                return [7 /*endfinally*/];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); },
                onFailure: function (err) {
                    logger.debug('completeNewPassword failure', err);
                    dispatchAuthEvent('completeNewPassword_failure', err, _this.user + " failed to complete the new password flow");
                    reject(err);
                },
                mfaRequired: function (challengeName, challengeParam) {
                    logger.debug('signIn MFA required');
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                },
                mfaSetup: function (challengeName, challengeParam) {
                    logger.debug('signIn mfa setup', challengeName);
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                },
                totpRequired: function (challengeName, challengeParam) {
                    logger.debug('signIn mfa setup', challengeName);
                    user['challengeName'] = challengeName;
                    user['challengeParam'] = challengeParam;
                    resolve(user);
                },
            }, clientMetadata);
        });
    };
    /**
     * Send the answer to a custom challenge
     * @param {CognitoUser} user - The CognitoUser object
     * @param {String} challengeResponses - The confirmation code
     */
    AuthClass.prototype.sendCustomChallengeAnswer = function (user, challengeResponses, clientMetadata) {
        var _this = this;
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        if (!challengeResponses) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyChallengeResponse);
        }
        var that = this;
        return new Promise(function (resolve, reject) {
            user.sendCustomChallengeAnswer(challengeResponses, _this.authCallbacks(user, resolve, reject), clientMetadata);
        });
    };
    /**
     * Delete an authenticated users' attributes
     * @param {CognitoUser} - The currently logged in user object
     * @return {Promise}
     **/
    AuthClass.prototype.deleteUserAttributes = function (user, attributeNames) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that.userSession(user).then(function (session) {
                user.deleteAttributes(attributeNames, function (err, result) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        return resolve(result);
                    }
                });
            });
        });
    };
    /**
     * Delete the current authenticated user
     * @return {Promise}
     **/
    // TODO: Check return type void
    AuthClass.prototype.deleteUser = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var e_6, isSignedInHostedUI;
            var _this = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._storageSync];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_6 = _a.sent();
                        logger.debug('Failed to sync cache info into memory', e_6);
                        throw new Error(e_6);
                    case 3:
                        isSignedInHostedUI = this._oAuthHandler &&
                            this._storage.getItem('amplify-signin-with-hostedUI') === 'true';
                        return [2 /*return*/, new Promise(function (res, rej) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                                var user_1;
                                var _this = this;
                                return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                                    if (this.userPool) {
                                        user_1 = this.userPool.getCurrentUser();
                                        if (!user_1) {
                                            logger.debug('Failed to get user from user pool');
                                            return [2 /*return*/, rej(new Error('No current user.'))];
                                        }
                                        else {
                                            user_1.getSession(function (err, session) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                                                var cleanUpError_4;
                                                var _this = this;
                                                return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!err) return [3 /*break*/, 5];
                                                            logger.debug('Failed to get the user session', err);
                                                            if (!this.isSessionInvalid(err)) return [3 /*break*/, 4];
                                                            _a.label = 1;
                                                        case 1:
                                                            _a.trys.push([1, 3, , 4]);
                                                            return [4 /*yield*/, this.cleanUpInvalidSession(user_1)];
                                                        case 2:
                                                            _a.sent();
                                                            return [3 /*break*/, 4];
                                                        case 3:
                                                            cleanUpError_4 = _a.sent();
                                                            rej(new Error("Session is invalid due to: " + err.message + " and failed to clean up invalid session: " + cleanUpError_4.message));
                                                            return [2 /*return*/];
                                                        case 4: return [2 /*return*/, rej(err)];
                                                        case 5:
                                                            user_1.deleteUser(function (err, result) {
                                                                if (err) {
                                                                    rej(err);
                                                                }
                                                                else {
                                                                    dispatchAuthEvent('userDeleted', result, 'The authenticated user has been deleted.');
                                                                    user_1.signOut();
                                                                    _this.user = null;
                                                                    try {
                                                                        _this.cleanCachedItems(); // clean aws credentials
                                                                    }
                                                                    catch (e) {
                                                                        // TODO: change to rejects in refactor
                                                                        logger.debug('failed to clear cached items');
                                                                    }
                                                                    if (isSignedInHostedUI) {
                                                                        _this.oAuthSignOutRedirect(res, rej);
                                                                    }
                                                                    else {
                                                                        dispatchAuthEvent('signOut', _this.user, "A user has been signed out");
                                                                        res(result);
                                                                    }
                                                                }
                                                            });
                                                            _a.label = 6;
                                                        case 6: return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                        }
                                    }
                                    else {
                                        logger.debug('no Congito User pool');
                                        rej(new Error('Cognito User pool does not exist'));
                                    }
                                    return [2 /*return*/];
                                });
                            }); })];
                }
            });
        });
    };
    /**
     * Update an authenticated users' attributes
     * @param {CognitoUser} - The currently logged in user object
     * @return {Promise}
     **/
    AuthClass.prototype.updateUserAttributes = function (user, attributes, clientMetadata) {
        var _this = this;
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        var attributeList = [];
        var that = this;
        return new Promise(function (resolve, reject) {
            that.userSession(user).then(function (session) {
                for (var key in attributes) {
                    if (key !== 'sub' && key.indexOf('_verified') < 0) {
                        var attr = {
                            Name: key,
                            Value: attributes[key],
                        };
                        attributeList.push(attr);
                    }
                }
                user.updateAttributes(attributeList, function (err, result, details) {
                    if (err) {
                        dispatchAuthEvent('updateUserAttributes_failure', err, 'Failed to update attributes');
                        return reject(err);
                    }
                    else {
                        var attrs = _this.createUpdateAttributesResultList(attributes, details === null || details === void 0 ? void 0 : details.CodeDeliveryDetailsList);
                        dispatchAuthEvent('updateUserAttributes', attrs, 'Attributes successfully updated');
                        return resolve(result);
                    }
                }, clientMetadata);
            });
        });
    };
    AuthClass.prototype.createUpdateAttributesResultList = function (attributes, codeDeliveryDetailsList) {
        var attrs = {};
        Object.keys(attributes).forEach(function (key) {
            attrs[key] = {
                isUpdated: true,
            };
            var codeDeliveryDetails = codeDeliveryDetailsList === null || codeDeliveryDetailsList === void 0 ? void 0 : codeDeliveryDetailsList.find(function (value) { return value.AttributeName === key; });
            if (codeDeliveryDetails) {
                attrs[key].isUpdated = false;
                attrs[key].codeDeliveryDetails = codeDeliveryDetails;
            }
        });
        return attrs;
    };
    /**
     * Return user attributes
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to user attributes if success
     */
    AuthClass.prototype.userAttributes = function (user) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.userSession(user).then(function (session) {
                user.getUserAttributes(function (err, attributes) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(attributes);
                    }
                });
            });
        });
    };
    AuthClass.prototype.verifiedContact = function (user) {
        var that = this;
        return this.userAttributes(user).then(function (attributes) {
            var attrs = that.attributesToObject(attributes);
            var unverified = {};
            var verified = {};
            if (attrs['email']) {
                if (attrs['email_verified']) {
                    verified['email'] = attrs['email'];
                }
                else {
                    unverified['email'] = attrs['email'];
                }
            }
            if (attrs['phone_number']) {
                if (attrs['phone_number_verified']) {
                    verified['phone_number'] = attrs['phone_number'];
                }
                else {
                    unverified['phone_number'] = attrs['phone_number'];
                }
            }
            return {
                verified: verified,
                unverified: unverified,
            };
        });
    };
    AuthClass.prototype.isErrorWithMessage = function (err) {
        return (typeof err === 'object' &&
            Object.prototype.hasOwnProperty.call(err, 'message'));
    };
    // Session revoked by another app
    AuthClass.prototype.isTokenRevokedError = function (err) {
        return (this.isErrorWithMessage(err) &&
            err.message === 'Access Token has been revoked');
    };
    AuthClass.prototype.isRefreshTokenRevokedError = function (err) {
        return (this.isErrorWithMessage(err) &&
            err.message === 'Refresh Token has been revoked');
    };
    AuthClass.prototype.isUserDisabledError = function (err) {
        return this.isErrorWithMessage(err) && err.message === 'User is disabled.';
    };
    AuthClass.prototype.isUserDoesNotExistError = function (err) {
        return (this.isErrorWithMessage(err) && err.message === 'User does not exist.');
    };
    AuthClass.prototype.isRefreshTokenExpiredError = function (err) {
        return (this.isErrorWithMessage(err) &&
            err.message === 'Refresh Token has expired');
    };
    AuthClass.prototype.isPasswordResetRequiredError = function (err) {
        return (this.isErrorWithMessage(err) &&
            err.message === 'Password reset required for the user');
    };
    AuthClass.prototype.isSignedInHostedUI = function () {
        return (this._oAuthHandler &&
            this._storage.getItem('amplify-signin-with-hostedUI') === 'true');
    };
    AuthClass.prototype.isSessionInvalid = function (err) {
        return (this.isUserDisabledError(err) ||
            this.isUserDoesNotExistError(err) ||
            this.isTokenRevokedError(err) ||
            this.isRefreshTokenRevokedError(err) ||
            this.isRefreshTokenExpiredError(err) ||
            this.isPasswordResetRequiredError(err));
    };
    AuthClass.prototype.cleanUpInvalidSession = function (user) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var e_7;
            var _this = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user.signOut();
                        this.user = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.cleanCachedItems()];
                    case 2:
                        _a.sent(); // clean aws credentials
                        return [3 /*break*/, 4];
                    case 3:
                        e_7 = _a.sent();
                        logger.debug('failed to clear cached items');
                        return [3 /*break*/, 4];
                    case 4:
                        if (this.isSignedInHostedUI()) {
                            return [2 /*return*/, new Promise(function (res, rej) {
                                    _this.oAuthSignOutRedirect(res, rej);
                                })];
                        }
                        else {
                            dispatchAuthEvent('signOut', this.user, "A user has been signed out");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current authenticated user
     * @return - A promise resolves to current authenticated CognitoUser if success
     */
    AuthClass.prototype.currentUserPoolUser = function (params) {
        var _this = this;
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        return new Promise(function (res, rej) {
            _this._storageSync
                .then(function () { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                var user, session, bypassCache, clientMetadata, _a, scope, err_1;
                var _this = this;
                return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.isOAuthInProgress()) return [3 /*break*/, 2];
                            logger.debug('OAuth signIn in progress, waiting for resolution...');
                            return [4 /*yield*/, new Promise(function (res) {
                                    var timeoutId = setTimeout(function () {
                                        logger.debug('OAuth signIn in progress timeout');
                                        _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.Hub.remove('auth', hostedUISignCallback);
                                        res();
                                    }, OAUTH_FLOW_MS_TIMEOUT);
                                    _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.Hub.listen('auth', hostedUISignCallback);
                                    function hostedUISignCallback(_a) {
                                        var payload = _a.payload;
                                        var event = payload.event;
                                        if (event === 'cognitoHostedUI' ||
                                            event === 'cognitoHostedUI_failure') {
                                            logger.debug("OAuth signIn resolved: " + event);
                                            clearTimeout(timeoutId);
                                            _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.Hub.remove('auth', hostedUISignCallback);
                                            res();
                                        }
                                    }
                                })];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2:
                            user = this.userPool.getCurrentUser();
                            if (!user) {
                                logger.debug('Failed to get user from user pool');
                                rej('No current user');
                                return [2 /*return*/];
                            }
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 7, , 8]);
                            return [4 /*yield*/, this._userSession(user)];
                        case 4:
                            session = _b.sent();
                            bypassCache = params ? params.bypassCache : false;
                            if (!bypassCache) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.Credentials.clear()];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            clientMetadata = this._config.clientMetadata;
                            _a = session.getAccessToken().decodePayload().scope, scope = _a === void 0 ? '' : _a;
                            if (scope.split(' ').includes(USER_ADMIN_SCOPE)) {
                                user.getUserData(function (err, data) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                                    var cleanUpError_5, preferredMFA, attributeList, i, attribute, userAttribute, attributes;
                                    return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!err) return [3 /*break*/, 7];
                                                logger.debug('getting user data failed', err);
                                                if (!this.isSessionInvalid(err)) return [3 /*break*/, 5];
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, this.cleanUpInvalidSession(user)];
                                            case 2:
                                                _a.sent();
                                                return [3 /*break*/, 4];
                                            case 3:
                                                cleanUpError_5 = _a.sent();
                                                rej(new Error("Session is invalid due to: " + err.message + " and failed to clean up invalid session: " + cleanUpError_5.message));
                                                return [2 /*return*/];
                                            case 4:
                                                rej(err);
                                                return [3 /*break*/, 6];
                                            case 5:
                                                res(user);
                                                _a.label = 6;
                                            case 6: return [2 /*return*/];
                                            case 7:
                                                preferredMFA = data.PreferredMfaSetting || 'NOMFA';
                                                attributeList = [];
                                                for (i = 0; i < data.UserAttributes.length; i++) {
                                                    attribute = {
                                                        Name: data.UserAttributes[i].Name,
                                                        Value: data.UserAttributes[i].Value,
                                                    };
                                                    userAttribute = new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUserAttribute(attribute);
                                                    attributeList.push(userAttribute);
                                                }
                                                attributes = this.attributesToObject(attributeList);
                                                Object.assign(user, { attributes: attributes, preferredMFA: preferredMFA });
                                                return [2 /*return*/, res(user)];
                                        }
                                    });
                                }); }, { bypassCache: bypassCache, clientMetadata: clientMetadata });
                            }
                            else {
                                logger.debug("Unable to get the user data because the " + USER_ADMIN_SCOPE + " " +
                                    "is not in the scopes of the access token");
                                return [2 /*return*/, res(user)];
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            err_1 = _b.sent();
                            rej(err_1);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); })
                .catch(function (e) {
                logger.debug('Failed to sync cache info into memory', e);
                return rej(e);
            });
        });
    };
    AuthClass.prototype.isOAuthInProgress = function () {
        return this.oAuthFlowInProgress;
    };
    /**
     * Get current authenticated user
     * @param {CurrentUserOpts} - options for getting the current user
     * @return - A promise resolves to current authenticated CognitoUser if success
     */
    AuthClass.prototype.currentAuthenticatedUser = function (params) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var federatedUser, e_8, federatedInfo, user, e_9;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug('getting current authenticated user');
                        federatedUser = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._storageSync];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_8 = _a.sent();
                        logger.debug('Failed to sync cache info into memory', e_8);
                        throw e_8;
                    case 4:
                        try {
                            federatedInfo = JSON.parse(this._storage.getItem('aws-amplify-federatedInfo'));
                            if (federatedInfo) {
                                federatedUser = (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_13__.__assign)({}, federatedInfo.user), { token: federatedInfo.token });
                            }
                        }
                        catch (e) {
                            logger.debug('cannot load federated user from auth storage');
                        }
                        if (!federatedUser) return [3 /*break*/, 5];
                        this.user = federatedUser;
                        logger.debug('get current authenticated federated user', this.user);
                        return [2 /*return*/, this.user];
                    case 5:
                        logger.debug('get current authenticated userpool user');
                        user = null;
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.currentUserPoolUser(params)];
                    case 7:
                        user = _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_9 = _a.sent();
                        if (e_9 === 'No userPool') {
                            logger.error('Cannot get the current user because the user pool is missing. ' +
                                'Please make sure the Auth module is configured with a valid Cognito User Pool ID');
                        }
                        logger.debug('The user is not authenticated by the error', e_9);
                        return [2 /*return*/, Promise.reject('The user is not authenticated')];
                    case 9:
                        this.user = user;
                        return [2 /*return*/, this.user];
                }
            });
        });
    };
    /**
     * Get current user's session
     * @return - A promise resolves to session object if success
     */
    AuthClass.prototype.currentSession = function () {
        var that = this;
        logger.debug('Getting current session');
        // Purposely not calling the reject method here because we don't need a console error
        if (!this.userPool) {
            return Promise.reject(new Error('No User Pool in the configuration.'));
        }
        return new Promise(function (res, rej) {
            that
                .currentUserPoolUser()
                .then(function (user) {
                that
                    .userSession(user)
                    .then(function (session) {
                    res(session);
                    return;
                })
                    .catch(function (e) {
                    logger.debug('Failed to get the current session', e);
                    rej(e);
                    return;
                });
            })
                .catch(function (e) {
                logger.debug('Failed to get the current user', e);
                rej(e);
                return;
            });
        });
    };
    AuthClass.prototype._userSession = function (user) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var clientMetadata, userSession;
            var _this = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) {
                            logger.debug('the user is null');
                            return [2 /*return*/, this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.NoUserSession)];
                        }
                        clientMetadata = this._config.clientMetadata;
                        // Debouncing the concurrent userSession calls by caching the promise.
                        // This solution assumes users will always call this function with the same CognitoUser instance.
                        if (this.inflightSessionPromiseCounter === 0) {
                            this.inflightSessionPromise = new Promise(function (res, rej) {
                                user.getSession(function (err, session) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                                    var cleanUpError_6;
                                    return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!err) return [3 /*break*/, 5];
                                                logger.debug('Failed to get the session from user', user);
                                                if (!this.isSessionInvalid(err)) return [3 /*break*/, 4];
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, this.cleanUpInvalidSession(user)];
                                            case 2:
                                                _a.sent();
                                                return [3 /*break*/, 4];
                                            case 3:
                                                cleanUpError_6 = _a.sent();
                                                rej(new Error("Session is invalid due to: " + err.message + " and failed to clean up invalid session: " + cleanUpError_6.message));
                                                return [2 /*return*/];
                                            case 4:
                                                rej(err);
                                                return [2 /*return*/];
                                            case 5:
                                                logger.debug('Succeed to get the user session', session);
                                                res(session);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, { clientMetadata: clientMetadata });
                            });
                        }
                        this.inflightSessionPromiseCounter++;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, this.inflightSessionPromise];
                    case 2:
                        userSession = _a.sent();
                        // Set private member. Avoid user.setSignInUserSession() to prevent excessive localstorage refresh.
                        // @ts-ignore
                        user.signInUserSession = userSession;
                        return [2 /*return*/, userSession];
                    case 3:
                        this.inflightSessionPromiseCounter--;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the corresponding user session
     * @param {Object} user - The CognitoUser object
     * @return - A promise resolves to the session
     */
    AuthClass.prototype.userSession = function (user) {
        return this._userSession(user);
    };
    /**
     * Get authenticated credentials of current user.
     * @return - A promise resolves to be current user's credentials
     */
    AuthClass.prototype.currentUserCredentials = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var e_10, federatedInfo;
            var _this = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.debug('Getting current user credentials');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._storageSync];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_10 = _a.sent();
                        logger.debug('Failed to sync cache info into memory', e_10);
                        throw e_10;
                    case 4:
                        federatedInfo = null;
                        try {
                            federatedInfo = JSON.parse(this._storage.getItem('aws-amplify-federatedInfo'));
                        }
                        catch (e) {
                            logger.debug('failed to get or parse item aws-amplify-federatedInfo', e);
                        }
                        if (federatedInfo) {
                            // refresh the jwt token here if necessary
                            return [2 /*return*/, this.Credentials.refreshFederatedToken(federatedInfo)];
                        }
                        else {
                            return [2 /*return*/, this.currentSession()
                                    .then(function (session) {
                                    logger.debug('getting session success', session);
                                    return _this.Credentials.set(session, 'session');
                                })
                                    .catch(function () {
                                    logger.debug('getting guest credentials');
                                    return _this.Credentials.set(null, 'guest');
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthClass.prototype.currentCredentials = function () {
        logger.debug('getting current credentials');
        return this.Credentials.get();
    };
    /**
     * Initiate an attribute confirmation request
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attributes to be verified
     * @return - A promise resolves to callback data if success
     */
    AuthClass.prototype.verifyUserAttribute = function (user, attr, clientMetadata) {
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        return new Promise(function (resolve, reject) {
            user.getAttributeVerificationCode(attr, {
                onSuccess: function (success) {
                    return resolve(success);
                },
                onFailure: function (err) {
                    return reject(err);
                },
            }, clientMetadata);
        });
    };
    /**
     * Confirm an attribute using a confirmation code
     * @param {Object} user - The CognitoUser
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    AuthClass.prototype.verifyUserAttributeSubmit = function (user, attr, code) {
        if (!code) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyCode);
        }
        return new Promise(function (resolve, reject) {
            user.verifyAttribute(attr, code, {
                onSuccess: function (data) {
                    resolve(data);
                    return;
                },
                onFailure: function (err) {
                    reject(err);
                    return;
                },
            });
        });
    };
    AuthClass.prototype.verifyCurrentUserAttribute = function (attr) {
        var that = this;
        return that
            .currentUserPoolUser()
            .then(function (user) { return that.verifyUserAttribute(user, attr); });
    };
    /**
     * Confirm current user's attribute using a confirmation code
     * @param {Object} attr - The attribute to be verified
     * @param {String} code - The confirmation code
     * @return - A promise resolves to callback data if success
     */
    AuthClass.prototype.verifyCurrentUserAttributeSubmit = function (attr, code) {
        var that = this;
        return that
            .currentUserPoolUser()
            .then(function (user) { return that.verifyUserAttributeSubmit(user, attr, code); });
    };
    AuthClass.prototype.cognitoIdentitySignOut = function (opts, user) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var e_11, isSignedInHostedUI;
            var _this = this;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._storageSync];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_11 = _a.sent();
                        logger.debug('Failed to sync cache info into memory', e_11);
                        throw e_11;
                    case 3:
                        isSignedInHostedUI = this._oAuthHandler &&
                            this._storage.getItem('amplify-signin-with-hostedUI') === 'true';
                        return [2 /*return*/, new Promise(function (res, rej) {
                                if (opts && opts.global) {
                                    logger.debug('user global sign out', user);
                                    // in order to use global signout
                                    // we must validate the user as an authenticated user by using getSession
                                    var clientMetadata = _this._config.clientMetadata; // TODO: verify behavior if this is override during signIn
                                    user.getSession(function (err, result) { return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(_this, void 0, void 0, function () {
                                        var cleanUpError_7;
                                        var _this = this;
                                        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!err) return [3 /*break*/, 5];
                                                    logger.debug('failed to get the user session', err);
                                                    if (!this.isSessionInvalid(err)) return [3 /*break*/, 4];
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    return [4 /*yield*/, this.cleanUpInvalidSession(user)];
                                                case 2:
                                                    _a.sent();
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    cleanUpError_7 = _a.sent();
                                                    rej(new Error("Session is invalid due to: " + err.message + " and failed to clean up invalid session: " + cleanUpError_7.message));
                                                    return [2 /*return*/];
                                                case 4: return [2 /*return*/, rej(err)];
                                                case 5:
                                                    user.globalSignOut({
                                                        onSuccess: function (data) {
                                                            logger.debug('global sign out success');
                                                            if (isSignedInHostedUI) {
                                                                _this.oAuthSignOutRedirect(res, rej);
                                                            }
                                                            else {
                                                                return res();
                                                            }
                                                        },
                                                        onFailure: function (err) {
                                                            logger.debug('global sign out failed', err);
                                                            return rej(err);
                                                        },
                                                    });
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }, { clientMetadata: clientMetadata });
                                }
                                else {
                                    logger.debug('user sign out', user);
                                    user.signOut(function () {
                                        if (isSignedInHostedUI) {
                                            _this.oAuthSignOutRedirect(res, rej);
                                        }
                                        else {
                                            return res();
                                        }
                                    });
                                }
                            })];
                }
            });
        });
    };
    AuthClass.prototype.oAuthSignOutRedirect = function (resolve, reject) {
        var isBrowser = (0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_14__.browserOrNode)().isBrowser;
        if (isBrowser) {
            this.oAuthSignOutRedirectOrReject(reject);
        }
        else {
            this.oAuthSignOutAndResolve(resolve);
        }
    };
    AuthClass.prototype.oAuthSignOutAndResolve = function (resolve) {
        this._oAuthHandler.signOut();
        resolve();
    };
    AuthClass.prototype.oAuthSignOutRedirectOrReject = function (reject) {
        this._oAuthHandler.signOut(); // this method redirects url
        // App should be redirected to another url otherwise it will reject
        setTimeout(function () { return reject(Error('Signout timeout fail')); }, 3000);
    };
    /**
     * Sign out method
     * @
     * @return - A promise resolved if success
     */
    AuthClass.prototype.signOut = function (opts) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var e_12, user;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cleanCachedItems()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_12 = _a.sent();
                        logger.debug('failed to clear cached items');
                        return [3 /*break*/, 3];
                    case 3:
                        if (!this.userPool) return [3 /*break*/, 7];
                        user = this.userPool.getCurrentUser();
                        if (!user) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.cognitoIdentitySignOut(opts, user)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        logger.debug('no current Cognito user');
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        logger.debug('no Cognito User pool');
                        _a.label = 8;
                    case 8:
                        /**
                         * Note for future refactor - no reliable way to get username with
                         * Cognito User Pools vs Identity when federating with Social Providers
                         * This is why we need a well structured session object that can be inspected
                         * and information passed back in the message below for Hub dispatch
                         */
                        dispatchAuthEvent('signOut', this.user, "A user has been signed out");
                        this.user = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthClass.prototype.cleanCachedItems = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // clear cognito cached item
                    return [4 /*yield*/, this.Credentials.clear()];
                    case 1:
                        // clear cognito cached item
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Change a password for an authenticated user
     * @param {Object} user - The CognitoUser object
     * @param {String} oldPassword - the current password
     * @param {String} newPassword - the requested new password
     * @return - A promise resolves if success
     */
    AuthClass.prototype.changePassword = function (user, oldPassword, newPassword, clientMetadata) {
        var _this = this;
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        return new Promise(function (resolve, reject) {
            _this.userSession(user).then(function (session) {
                user.changePassword(oldPassword, newPassword, function (err, data) {
                    if (err) {
                        logger.debug('change password failure', err);
                        return reject(err);
                    }
                    else {
                        return resolve(data);
                    }
                }, clientMetadata);
            });
        });
    };
    /**
     * Initiate a forgot password request
     * @param {String} username - the username to change password
     * @return - A promise resolves if success
     */
    AuthClass.prototype.forgotPassword = function (username, clientMetadata) {
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        if (!username) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyUsername);
        }
        var user = this.createCognitoUser(username);
        return new Promise(function (resolve, reject) {
            user.forgotPassword({
                onSuccess: function () {
                    resolve();
                    return;
                },
                onFailure: function (err) {
                    logger.debug('forgot password failure', err);
                    dispatchAuthEvent('forgotPassword_failure', err, username + " forgotPassword failed");
                    reject(err);
                    return;
                },
                inputVerificationCode: function (data) {
                    dispatchAuthEvent('forgotPassword', user, username + " has initiated forgot password flow");
                    resolve(data);
                    return;
                },
            }, clientMetadata);
        });
    };
    /**
     * Confirm a new password using a confirmation Code
     * @param {String} username - The username
     * @param {String} code - The confirmation code
     * @param {String} password - The new password
     * @return - A promise that resolves if success
     */
    AuthClass.prototype.forgotPasswordSubmit = function (username, code, password, clientMetadata) {
        if (clientMetadata === void 0) { clientMetadata = this._config.clientMetadata; }
        if (!this.userPool) {
            return this.rejectNoUserPool();
        }
        if (!username) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyUsername);
        }
        if (!code) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyCode);
        }
        if (!password) {
            return this.rejectAuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.EmptyPassword);
        }
        var user = this.createCognitoUser(username);
        return new Promise(function (resolve, reject) {
            user.confirmPassword(code, password, {
                onSuccess: function (success) {
                    dispatchAuthEvent('forgotPasswordSubmit', user, username + " forgotPasswordSubmit successful");
                    resolve(success);
                    return;
                },
                onFailure: function (err) {
                    dispatchAuthEvent('forgotPasswordSubmit_failure', err, username + " forgotPasswordSubmit failed");
                    reject(err);
                    return;
                },
            }, clientMetadata);
        });
    };
    /**
     * Get user information
     * @async
     * @return {Object }- current User's information
     */
    AuthClass.prototype.currentUserInfo = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var source, user, attributes, userAttrs, credentials, e_13, info, err_2, user;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        source = this.Credentials.getCredSource();
                        if (!(!source || source === 'aws' || source === 'userPool')) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.currentUserPoolUser().catch(function (err) {
                                return logger.error(err);
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this.userAttributes(user)];
                    case 3:
                        attributes = _a.sent();
                        userAttrs = this.attributesToObject(attributes);
                        credentials = null;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.currentCredentials()];
                    case 5:
                        credentials = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_13 = _a.sent();
                        logger.debug('Failed to retrieve credentials while getting current user info', e_13);
                        return [3 /*break*/, 7];
                    case 7:
                        info = {
                            id: credentials ? credentials.identityId : undefined,
                            username: user.getUsername(),
                            attributes: userAttrs,
                        };
                        return [2 /*return*/, info];
                    case 8:
                        err_2 = _a.sent();
                        logger.error('currentUserInfo error', err_2);
                        return [2 /*return*/, {}];
                    case 9:
                        if (source === 'federated') {
                            user = this.user;
                            return [2 /*return*/, user ? user : {}];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AuthClass.prototype.federatedSignIn = function (providerOrOptions, response, user) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var options, provider, customState, client_id, redirect_uri, provider, loggedInUser, token, identity_id, expires_at, credentials, currentUser;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._config.identityPoolId && !this._config.userPoolId) {
                            throw new Error("Federation requires either a User Pool or Identity Pool in config");
                        }
                        // Ensure backwards compatability
                        if (typeof providerOrOptions === 'undefined') {
                            if (this._config.identityPoolId && !this._config.userPoolId) {
                                throw new Error("Federation with Identity Pools requires tokens passed as arguments");
                            }
                        }
                        if (!((0,_types__WEBPACK_IMPORTED_MODULE_10__.isFederatedSignInOptions)(providerOrOptions) ||
                            (0,_types__WEBPACK_IMPORTED_MODULE_10__.isFederatedSignInOptionsCustom)(providerOrOptions) ||
                            (0,_types__WEBPACK_IMPORTED_MODULE_10__.hasCustomState)(providerOrOptions) ||
                            typeof providerOrOptions === 'undefined')) return [3 /*break*/, 1];
                        options = providerOrOptions || {
                            provider: _types__WEBPACK_IMPORTED_MODULE_10__.CognitoHostedUIIdentityProvider.Cognito,
                        };
                        provider = (0,_types__WEBPACK_IMPORTED_MODULE_10__.isFederatedSignInOptions)(options)
                            ? options.provider
                            : options.customProvider;
                        customState = (0,_types__WEBPACK_IMPORTED_MODULE_10__.isFederatedSignInOptions)(options)
                            ? options.customState
                            : options.customState;
                        if (this._config.userPoolId) {
                            client_id = (0,_types__WEBPACK_IMPORTED_MODULE_10__.isCognitoHostedOpts)(this._config.oauth)
                                ? this._config.userPoolWebClientId
                                : this._config.oauth.clientID;
                            redirect_uri = (0,_types__WEBPACK_IMPORTED_MODULE_10__.isCognitoHostedOpts)(this._config.oauth)
                                ? this._config.oauth.redirectSignIn
                                : this._config.oauth.redirectUri;
                            this._oAuthHandler.oauthSignIn(this._config.oauth.responseType, this._config.oauth.domain, redirect_uri, client_id, provider, customState);
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        provider = providerOrOptions;
                        // To check if the user is already logged in
                        try {
                            loggedInUser = JSON.stringify(JSON.parse(this._storage.getItem('aws-amplify-federatedInfo')).user);
                            if (loggedInUser) {
                                logger.warn("There is already a signed in user: " + loggedInUser + " in your app.\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tYou should not call Auth.federatedSignIn method again as it may cause unexpected behavior.");
                            }
                        }
                        catch (e) { }
                        token = response.token, identity_id = response.identity_id, expires_at = response.expires_at;
                        return [4 /*yield*/, this.Credentials.set({ provider: provider, token: token, identity_id: identity_id, user: user, expires_at: expires_at }, 'federation')];
                    case 2:
                        credentials = _a.sent();
                        return [4 /*yield*/, this.currentAuthenticatedUser()];
                    case 3:
                        currentUser = _a.sent();
                        dispatchAuthEvent('signIn', currentUser, "A user " + currentUser.username + " has been signed in");
                        logger.debug('federated sign in credentials', credentials);
                        return [2 /*return*/, credentials];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Used to complete the OAuth flow with or without the Cognito Hosted UI
     * @param {String} URL - optional parameter for customers to pass in the response URL
     */
    AuthClass.prototype._handleAuthResponse = function (URL) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var currentUrl, hasCodeOrError, hasTokenOrError, _a, accessToken, idToken, refreshToken, state, session, credentials, isCustomStateIncluded, currentUser, customState, err_3;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.oAuthFlowInProgress) {
                            logger.debug("Skipping URL " + URL + " current flow in progress");
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 8, 9]);
                        this.oAuthFlowInProgress = true;
                        if (!this._config.userPoolId) {
                            throw new Error("OAuth responses require a User Pool defined in config");
                        }
                        dispatchAuthEvent('parsingCallbackUrl', { url: URL }, "The callback url is being parsed");
                        currentUrl = URL || ((0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_14__.browserOrNode)().isBrowser ? window.location.href : '');
                        hasCodeOrError = !!((0,url__WEBPACK_IMPORTED_MODULE_2__.parse)(currentUrl).query || '')
                            .split('&')
                            .map(function (entry) { return entry.split('='); })
                            .find(function (_a) {
                            var _b = (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__read)(_a, 1), k = _b[0];
                            return k === 'code' || k === 'error';
                        });
                        hasTokenOrError = !!((0,url__WEBPACK_IMPORTED_MODULE_2__.parse)(currentUrl).hash || '#')
                            .substr(1)
                            .split('&')
                            .map(function (entry) { return entry.split('='); })
                            .find(function (_a) {
                            var _b = (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__read)(_a, 1), k = _b[0];
                            return k === 'access_token' || k === 'error';
                        });
                        if (!(hasCodeOrError || hasTokenOrError)) return [3 /*break*/, 7];
                        this._storage.setItem('amplify-redirected-from-hosted-ui', 'true');
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this._oAuthHandler.handleAuthResponse(currentUrl)];
                    case 3:
                        _a = _b.sent(), accessToken = _a.accessToken, idToken = _a.idToken, refreshToken = _a.refreshToken, state = _a.state;
                        session = new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUserSession({
                            IdToken: new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoIdToken({ IdToken: idToken }),
                            RefreshToken: new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoRefreshToken({
                                RefreshToken: refreshToken,
                            }),
                            AccessToken: new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoAccessToken({
                                AccessToken: accessToken,
                            }),
                        });
                        credentials = void 0;
                        if (!this._config.identityPoolId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.Credentials.set(session, 'session')];
                    case 4:
                        credentials = _b.sent();
                        logger.debug('AWS credentials', credentials);
                        _b.label = 5;
                    case 5:
                        isCustomStateIncluded = /-/.test(state);
                        currentUser = this.createCognitoUser(session.getIdToken().decodePayload()['cognito:username']);
                        // This calls cacheTokens() in Cognito SDK
                        currentUser.setSignInUserSession(session);
                        if (window && typeof window.history !== 'undefined') {
                            window.history.replaceState({}, null, this._config.oauth.redirectSignIn);
                        }
                        dispatchAuthEvent('signIn', currentUser, "A user " + currentUser.getUsername() + " has been signed in");
                        dispatchAuthEvent('cognitoHostedUI', currentUser, "A user " + currentUser.getUsername() + " has been signed in via Cognito Hosted UI");
                        if (isCustomStateIncluded) {
                            customState = state.split('-').splice(1).join('-');
                            dispatchAuthEvent('customOAuthState', (0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_15__.urlSafeDecode)(customState), "State for user " + currentUser.getUsername());
                        }
                        //#endregion
                        return [2 /*return*/, credentials];
                    case 6:
                        err_3 = _b.sent();
                        logger.debug('Error in cognito hosted auth response', err_3);
                        // Just like a successful handling of `?code`, replace the window history to "dispose" of the `code`.
                        // Otherwise, reloading the page will throw errors as the `code` has already been spent.
                        if (window && typeof window.history !== 'undefined') {
                            window.history.replaceState({}, null, this._config.oauth.redirectSignIn);
                        }
                        dispatchAuthEvent('signIn_failure', err_3, "The OAuth response flow failed");
                        dispatchAuthEvent('cognitoHostedUI_failure', err_3, "A failure occurred when returning to the Cognito Hosted UI");
                        dispatchAuthEvent('customState_failure', err_3, "A failure occurred when returning state");
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this.oAuthFlowInProgress = false;
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    AuthClass.prototype.essentialCredentials = function (credentials) {
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated,
        };
    };
    AuthClass.prototype.attributesToObject = function (attributes) {
        var _this = this;
        var obj = {};
        if (attributes) {
            attributes.map(function (attribute) {
                if (attribute.Name === 'email_verified' ||
                    attribute.Name === 'phone_number_verified') {
                    obj[attribute.Name] =
                        _this.isTruthyString(attribute.Value) || attribute.Value === true;
                }
                else {
                    obj[attribute.Name] = attribute.Value;
                }
            });
        }
        return obj;
    };
    AuthClass.prototype.isTruthyString = function (value) {
        return (typeof value.toLowerCase === 'function' && value.toLowerCase() === 'true');
    };
    AuthClass.prototype.createCognitoUser = function (username) {
        var userData = {
            Username: username,
            Pool: this.userPool,
        };
        userData.Storage = this._storage;
        var authenticationFlowType = this._config.authenticationFlowType;
        var user = new amazon_cognito_identity_js__WEBPACK_IMPORTED_MODULE_0__.CognitoUser(userData);
        if (authenticationFlowType) {
            user.setAuthenticationFlowType(authenticationFlowType);
        }
        return user;
    };
    AuthClass.prototype._isValidAuthStorage = function (obj) {
        // We need to check if the obj has the functions of Storage
        return (!!obj &&
            typeof obj.getItem === 'function' &&
            typeof obj.setItem === 'function' &&
            typeof obj.removeItem === 'function' &&
            typeof obj.clear === 'function');
    };
    AuthClass.prototype.noUserPoolErrorHandler = function (config) {
        if (config) {
            if (!config.userPoolId || !config.identityPoolId) {
                return _types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.MissingAuthConfig;
            }
        }
        return _types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.NoConfig;
    };
    AuthClass.prototype.rejectAuthError = function (type) {
        return Promise.reject(new _Errors__WEBPACK_IMPORTED_MODULE_16__.AuthError(type));
    };
    AuthClass.prototype.rejectNoUserPool = function () {
        var type = this.noUserPoolErrorHandler(this._config);
        return Promise.reject(new _Errors__WEBPACK_IMPORTED_MODULE_16__.NoUserPoolError(type));
    };
    AuthClass.prototype.rememberDevice = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var currUser, error_2;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.currentUserPoolUser()];
                    case 1:
                        currUser = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        logger.debug('The user is not authenticated by the error', error_2);
                        return [2 /*return*/, Promise.reject('The user is not authenticated')];
                    case 3:
                        currUser.getCachedDeviceKeyAndPassword();
                        return [2 /*return*/, new Promise(function (res, rej) {
                                currUser.setDeviceStatusRemembered({
                                    onSuccess: function (data) {
                                        res(data);
                                    },
                                    onFailure: function (err) {
                                        if (err.code === 'InvalidParameterException') {
                                            rej(new _Errors__WEBPACK_IMPORTED_MODULE_16__.AuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.DeviceConfig));
                                        }
                                        else if (err.code === 'NetworkError') {
                                            rej(new _Errors__WEBPACK_IMPORTED_MODULE_16__.AuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.NetworkError));
                                        }
                                        else {
                                            rej(err);
                                        }
                                    },
                                });
                            })];
                }
            });
        });
    };
    AuthClass.prototype.forgetDevice = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var currUser, error_3;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.currentUserPoolUser()];
                    case 1:
                        currUser = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger.debug('The user is not authenticated by the error', error_3);
                        return [2 /*return*/, Promise.reject('The user is not authenticated')];
                    case 3:
                        currUser.getCachedDeviceKeyAndPassword();
                        return [2 /*return*/, new Promise(function (res, rej) {
                                currUser.forgetDevice({
                                    onSuccess: function (data) {
                                        res(data);
                                    },
                                    onFailure: function (err) {
                                        if (err.code === 'InvalidParameterException') {
                                            rej(new _Errors__WEBPACK_IMPORTED_MODULE_16__.AuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.DeviceConfig));
                                        }
                                        else if (err.code === 'NetworkError') {
                                            rej(new _Errors__WEBPACK_IMPORTED_MODULE_16__.AuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.NetworkError));
                                        }
                                        else {
                                            rej(err);
                                        }
                                    },
                                });
                            })];
                }
            });
        });
    };
    AuthClass.prototype.fetchDevices = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__awaiter)(this, void 0, void 0, function () {
            var currUser, error_4;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_13__.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.currentUserPoolUser()];
                    case 1:
                        currUser = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger.debug('The user is not authenticated by the error', error_4);
                        throw new Error('The user is not authenticated');
                    case 3:
                        currUser.getCachedDeviceKeyAndPassword();
                        return [2 /*return*/, new Promise(function (res, rej) {
                                var cb = {
                                    onSuccess: function (data) {
                                        var deviceList = data.Devices.map(function (device) {
                                            var deviceName = device.DeviceAttributes.find(function (_a) {
                                                var Name = _a.Name;
                                                return Name === 'device_name';
                                            }) || {};
                                            var deviceInfo = {
                                                id: device.DeviceKey,
                                                name: deviceName.Value,
                                            };
                                            return deviceInfo;
                                        });
                                        res(deviceList);
                                    },
                                    onFailure: function (err) {
                                        if (err.code === 'InvalidParameterException') {
                                            rej(new _Errors__WEBPACK_IMPORTED_MODULE_16__.AuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.DeviceConfig));
                                        }
                                        else if (err.code === 'NetworkError') {
                                            rej(new _Errors__WEBPACK_IMPORTED_MODULE_16__.AuthError(_types__WEBPACK_IMPORTED_MODULE_10__.AuthErrorTypes.NetworkError));
                                        }
                                        else {
                                            rej(err);
                                        }
                                    },
                                };
                                currUser.listDevices(MAX_DEVICES, null, cb);
                            })];
                }
            });
        });
    };
    return AuthClass;
}());

var Auth = new AuthClass(null);
_aws_amplify_core__WEBPACK_IMPORTED_MODULE_17__.Amplify.register(Auth);
//# sourceMappingURL=Auth.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/lib-esm/Errors.js":
/*!**********************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/Errors.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthError: () => (/* binding */ AuthError),
/* harmony export */   NoUserPoolError: () => (/* binding */ NoUserPoolError),
/* harmony export */   authErrorMessages: () => (/* binding */ authErrorMessages)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/@aws-amplify/auth/node_modules/tslib/tslib.es6.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
/* harmony import */ var _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/AuthErrorStrings */ "./node_modules/@aws-amplify/auth/lib-esm/common/AuthErrorStrings.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0



var logger = new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('AuthError');
var AuthError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__extends)(AuthError, _super);
    function AuthError(type) {
        var _this = this;
        var _a = authErrorMessages[type], message = _a.message, log = _a.log;
        _this = _super.call(this, message) || this;
        // Hack for making the custom error class work when transpiled to es5
        // TODO: Delete the following 2 lines after we change the build target to >= es2015
        _this.constructor = AuthError;
        Object.setPrototypeOf(_this, AuthError.prototype);
        _this.name = 'AuthError';
        _this.log = log || message;
        logger.error(_this.log);
        return _this;
    }
    return AuthError;
}(Error));

var NoUserPoolError = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__extends)(NoUserPoolError, _super);
    function NoUserPoolError(type) {
        var _this = _super.call(this, type) || this;
        // Hack for making the custom error class work when transpiled to es5
        // TODO: Delete the following 2 lines after we change the build target to >= es2015
        _this.constructor = NoUserPoolError;
        Object.setPrototypeOf(_this, NoUserPoolError.prototype);
        _this.name = 'NoUserPoolError';
        return _this;
    }
    return NoUserPoolError;
}(AuthError));

var authErrorMessages = {
    noConfig: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.DEFAULT_MSG,
        log: "\n            Error: Amplify has not been configured correctly.\n            This error is typically caused by one of the following scenarios:\n\n            1. Make sure you're passing the awsconfig object to Amplify.configure() in your app's entry point\n                See https://aws-amplify.github.io/docs/js/authentication#configure-your-app for more information\n            \n            2. There might be multiple conflicting versions of amplify packages in your node_modules.\n\t\t\t\tRefer to our docs site for help upgrading Amplify packages (https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js)\n        ",
    },
    missingAuthConfig: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.DEFAULT_MSG,
        log: "\n            Error: Amplify has not been configured correctly. \n            The configuration object is missing required auth properties.\n            This error is typically caused by one of the following scenarios:\n\n            1. Did you run `amplify push` after adding auth via `amplify add auth`?\n                See https://aws-amplify.github.io/docs/js/authentication#amplify-project-setup for more information\n\n            2. This could also be caused by multiple conflicting versions of amplify packages, see (https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js) for help upgrading Amplify packages.\n        ",
    },
    emptyUsername: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.EMPTY_USERNAME,
    },
    // TODO: should include a list of valid sign-in types
    invalidUsername: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.INVALID_USERNAME,
    },
    emptyPassword: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.EMPTY_PASSWORD,
    },
    emptyCode: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.EMPTY_CODE,
    },
    signUpError: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.SIGN_UP_ERROR,
        log: 'The first parameter should either be non-null string or object',
    },
    noMFA: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.NO_MFA,
    },
    invalidMFA: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.INVALID_MFA,
    },
    emptyChallengeResponse: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.EMPTY_CHALLENGE,
    },
    noUserSession: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.NO_USER_SESSION,
    },
    deviceConfig: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.DEVICE_CONFIG,
    },
    networkError: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.NETWORK_ERROR,
    },
    autoSignInError: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.AUTOSIGNIN_ERROR,
    },
    default: {
        message: _common_AuthErrorStrings__WEBPACK_IMPORTED_MODULE_2__.AuthErrorStrings.DEFAULT_MSG,
    },
};
//# sourceMappingURL=Errors.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/lib-esm/OAuth/OAuth.js":
/*!***************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/OAuth/OAuth.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! tslib */ "./node_modules/@aws-amplify/auth/node_modules/tslib/tslib.es6.js");
/* harmony import */ var url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! url */ "./node_modules/@aws-amplify/auth/node_modules/url/url.js");
/* harmony import */ var _urlOpener__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./urlOpener */ "./node_modules/@aws-amplify/auth/lib-esm/OAuth/urlOpener.js");
/* harmony import */ var _oauthStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./oauthStorage */ "./node_modules/@aws-amplify/auth/lib-esm/OAuth/oauthStorage.js");
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! buffer */ "./node_modules/@aws-amplify/auth/node_modules/buffer/index.js");
/* harmony import */ var _types_Auth__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../types/Auth */ "./node_modules/@aws-amplify/auth/lib-esm/types/Auth.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Hub.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Util/StringUtils.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Platform/types.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/constants.js");
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/Platform/index.js");
/* harmony import */ var _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @aws-crypto/sha256-js */ "./node_modules/@aws-crypto/sha256-js/build/index.js");
/* harmony import */ var _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__);
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

 // Used for OAuth parsing of Cognito Hosted UI






var AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
    ? Symbol.for('amplify_default')
    : '@@amplify_default');
var dispatchAuthEvent = function (event, data, message) {
    _aws_amplify_core__WEBPACK_IMPORTED_MODULE_3__.Hub.dispatch('auth', { event: event, data: data, message: message }, 'Auth', AMPLIFY_SYMBOL);
};
var logger = new _aws_amplify_core__WEBPACK_IMPORTED_MODULE_4__.ConsoleLogger('OAuth');
var OAuth = /** @class */ (function () {
    function OAuth(_a) {
        var config = _a.config, cognitoClientId = _a.cognitoClientId, _b = _a.scopes, scopes = _b === void 0 ? [] : _b;
        this._urlOpener = config.urlOpener || _urlOpener__WEBPACK_IMPORTED_MODULE_5__.launchUri;
        this._config = config;
        this._cognitoClientId = cognitoClientId;
        if (!this.isValidScopes(scopes))
            throw Error('scopes must be a String Array');
        this._scopes = scopes;
    }
    OAuth.prototype.isValidScopes = function (scopes) {
        return (Array.isArray(scopes) && scopes.every(function (scope) { return typeof scope === 'string'; }));
    };
    OAuth.prototype.oauthSignIn = function (responseType, domain, redirectSignIn, clientId, provider, customState) {
        if (responseType === void 0) { responseType = 'code'; }
        if (provider === void 0) { provider = _types_Auth__WEBPACK_IMPORTED_MODULE_6__.CognitoHostedUIIdentityProvider.Cognito; }
        var generatedState = this._generateState(32);
        /* encodeURIComponent is not URL safe, use urlSafeEncode instead. Cognito
        single-encodes/decodes url on first sign in and double-encodes/decodes url
        when user already signed in. Using encodeURIComponent, Base32, Base64 add
        characters % or = which on further encoding becomes unsafe. '=' create issue
        for parsing query params.
        Refer: https://github.com/aws-amplify/amplify-js/issues/5218 */
        var state = customState
            ? generatedState + "-" + (0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_7__.urlSafeEncode)(customState)
            : generatedState;
        _oauthStorage__WEBPACK_IMPORTED_MODULE_8__.setState(state);
        var pkce_key = this._generateRandom(128);
        _oauthStorage__WEBPACK_IMPORTED_MODULE_8__.setPKCE(pkce_key);
        var code_challenge = this._generateChallenge(pkce_key);
        var code_challenge_method = 'S256';
        var scopesString = this._scopes.join(' ');
        var queryString = Object.entries((0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)({ redirect_uri: redirectSignIn, response_type: responseType, client_id: clientId, identity_provider: provider, scope: scopesString, state: state }, (responseType === 'code' ? { code_challenge: code_challenge } : {})), (responseType === 'code' ? { code_challenge_method: code_challenge_method } : {})))
            .map(function (_a) {
            var _b = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__read)(_a, 2), k = _b[0], v = _b[1];
            return encodeURIComponent(k) + "=" + encodeURIComponent(v);
        })
            .join('&');
        var URL = "https://" + domain + "/oauth2/authorize?" + queryString;
        logger.debug("Redirecting to " + URL);
        this._urlOpener(URL, redirectSignIn);
    };
    OAuth.prototype._handleCodeFlow = function (currentUrl) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__awaiter)(this, void 0, void 0, function () {
            var code, currentUrlPathname, redirectSignInPathname, oAuthTokenEndpoint, client_id, redirect_uri, code_verifier, oAuthTokenBody, body, customUserAgentDetails, _a, access_token, refresh_token, id_token, error;
            var _b;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__generator)(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        code = ((0,url__WEBPACK_IMPORTED_MODULE_0__.parse)(currentUrl).query || '')
                            .split('&')
                            .map(function (pairings) { return pairings.split('='); })
                            .reduce(function (accum, _a) {
                            var _b;
                            var _c = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__read)(_a, 2), k = _c[0], v = _c[1];
                            return ((0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)({}, accum), (_b = {}, _b[k] = v, _b)));
                        }, { code: undefined }).code;
                        currentUrlPathname = (0,url__WEBPACK_IMPORTED_MODULE_0__.parse)(currentUrl).pathname || '/';
                        redirectSignInPathname = (0,url__WEBPACK_IMPORTED_MODULE_0__.parse)(this._config.redirectSignIn).pathname || '/';
                        if (!code || currentUrlPathname !== redirectSignInPathname) {
                            return [2 /*return*/];
                        }
                        oAuthTokenEndpoint = 'https://' + this._config.domain + '/oauth2/token';
                        dispatchAuthEvent('codeFlow', {}, "Retrieving tokens from " + oAuthTokenEndpoint);
                        client_id = (0,_types_Auth__WEBPACK_IMPORTED_MODULE_6__.isCognitoHostedOpts)(this._config)
                            ? this._cognitoClientId
                            : this._config.clientID;
                        redirect_uri = (0,_types_Auth__WEBPACK_IMPORTED_MODULE_6__.isCognitoHostedOpts)(this._config)
                            ? this._config.redirectSignIn
                            : this._config.redirectUri;
                        code_verifier = _oauthStorage__WEBPACK_IMPORTED_MODULE_8__.getPKCE();
                        oAuthTokenBody = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)({ grant_type: 'authorization_code', code: code,
                            client_id: client_id,
                            redirect_uri: redirect_uri }, (code_verifier ? { code_verifier: code_verifier } : {}));
                        logger.debug("Calling token endpoint: " + oAuthTokenEndpoint + " with", oAuthTokenBody);
                        body = Object.entries(oAuthTokenBody)
                            .map(function (_a) {
                            var _b = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__read)(_a, 2), k = _b[0], v = _b[1];
                            return encodeURIComponent(k) + "=" + encodeURIComponent(v);
                        })
                            .join('&');
                        customUserAgentDetails = {
                            category: _aws_amplify_core__WEBPACK_IMPORTED_MODULE_10__.Category.Auth,
                            action: _aws_amplify_core__WEBPACK_IMPORTED_MODULE_10__.AuthAction.FederatedSignIn,
                        };
                        return [4 /*yield*/, fetch(oAuthTokenEndpoint, {
                                method: 'POST',
                                headers: (_b = {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    _b[_aws_amplify_core__WEBPACK_IMPORTED_MODULE_11__.USER_AGENT_HEADER] = (0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_12__.getAmplifyUserAgent)(customUserAgentDetails),
                                    _b),
                                body: body,
                            })];
                    case 1: return [4 /*yield*/, (_c.sent()).json()];
                    case 2:
                        _a = _c.sent(), access_token = _a.access_token, refresh_token = _a.refresh_token, id_token = _a.id_token, error = _a.error;
                        if (error) {
                            throw new Error(error);
                        }
                        return [2 /*return*/, {
                                accessToken: access_token,
                                refreshToken: refresh_token,
                                idToken: id_token,
                            }];
                }
            });
        });
    };
    OAuth.prototype._handleImplicitFlow = function (currentUrl) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__awaiter)(this, void 0, void 0, function () {
            var _a, id_token, access_token;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__generator)(this, function (_b) {
                _a = ((0,url__WEBPACK_IMPORTED_MODULE_0__.parse)(currentUrl).hash || '#')
                    .substr(1) // Remove # from returned code
                    .split('&')
                    .map(function (pairings) { return pairings.split('='); })
                    .reduce(function (accum, _a) {
                    var _b;
                    var _c = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__read)(_a, 2), k = _c[0], v = _c[1];
                    return ((0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)({}, accum), (_b = {}, _b[k] = v, _b)));
                }, {
                    id_token: undefined,
                    access_token: undefined,
                }), id_token = _a.id_token, access_token = _a.access_token;
                dispatchAuthEvent('implicitFlow', {}, "Got tokens from " + currentUrl);
                logger.debug("Retrieving implicit tokens from " + currentUrl + " with");
                return [2 /*return*/, {
                        accessToken: access_token,
                        idToken: id_token,
                        refreshToken: null,
                    }];
            });
        });
    };
    OAuth.prototype.handleAuthResponse = function (currentUrl) {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__awaiter)(this, void 0, void 0, function () {
            var urlParams, error, error_description, state, _a, _b, e_1;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__generator)(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        urlParams = currentUrl
                            ? (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_9__.__assign)({}, ((0,url__WEBPACK_IMPORTED_MODULE_0__.parse)(currentUrl).hash || '#')
                                .substr(1)
                                .split('&')
                                .map(function (entry) { return entry.split('='); })
                                .reduce(function (acc, _a) {
                                var _b = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__read)(_a, 2), k = _b[0], v = _b[1];
                                return ((acc[k] = v), acc);
                            }, {})), ((0,url__WEBPACK_IMPORTED_MODULE_0__.parse)(currentUrl).query || '')
                                .split('&')
                                .map(function (entry) { return entry.split('='); })
                                .reduce(function (acc, _a) {
                                var _b = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__read)(_a, 2), k = _b[0], v = _b[1];
                                return ((acc[k] = v), acc);
                            }, {}))
                            : {};
                        error = urlParams.error, error_description = urlParams.error_description;
                        if (error) {
                            throw new Error(error_description);
                        }
                        state = this._validateState(urlParams);
                        logger.debug("Starting " + this._config.responseType + " flow with " + currentUrl);
                        if (!(this._config.responseType === 'code')) return [3 /*break*/, 2];
                        _a = [{}];
                        return [4 /*yield*/, this._handleCodeFlow(currentUrl)];
                    case 1: return [2 /*return*/, tslib__WEBPACK_IMPORTED_MODULE_9__.__assign.apply(void 0, [tslib__WEBPACK_IMPORTED_MODULE_9__.__assign.apply(void 0, _a.concat([(_c.sent())])), { state: state }])];
                    case 2:
                        _b = [{}];
                        return [4 /*yield*/, this._handleImplicitFlow(currentUrl)];
                    case 3: return [2 /*return*/, tslib__WEBPACK_IMPORTED_MODULE_9__.__assign.apply(void 0, [tslib__WEBPACK_IMPORTED_MODULE_9__.__assign.apply(void 0, _b.concat([(_c.sent())])), { state: state }])];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_1 = _c.sent();
                        logger.debug("Error handling auth response.", e_1);
                        throw e_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    OAuth.prototype._validateState = function (urlParams) {
        if (!urlParams) {
            return;
        }
        var savedState = _oauthStorage__WEBPACK_IMPORTED_MODULE_8__.getState();
        var returnedState = urlParams.state;
        // This is because savedState only exists if the flow was initiated by Amplify
        if (savedState && savedState !== returnedState) {
            throw new Error('Invalid state in OAuth flow');
        }
        return returnedState;
    };
    OAuth.prototype.signOut = function () {
        return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__awaiter)(this, void 0, void 0, function () {
            var oAuthLogoutEndpoint, client_id, signout_uri;
            return (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__generator)(this, function (_a) {
                oAuthLogoutEndpoint = 'https://' + this._config.domain + '/logout?';
                client_id = (0,_types_Auth__WEBPACK_IMPORTED_MODULE_6__.isCognitoHostedOpts)(this._config)
                    ? this._cognitoClientId
                    : this._config.oauth.clientID;
                signout_uri = (0,_types_Auth__WEBPACK_IMPORTED_MODULE_6__.isCognitoHostedOpts)(this._config)
                    ? this._config.redirectSignOut
                    : this._config.returnTo;
                oAuthLogoutEndpoint += Object.entries({
                    client_id: client_id,
                    logout_uri: encodeURIComponent(signout_uri),
                })
                    .map(function (_a) {
                    var _b = (0,tslib__WEBPACK_IMPORTED_MODULE_9__.__read)(_a, 2), k = _b[0], v = _b[1];
                    return k + "=" + v;
                })
                    .join('&');
                dispatchAuthEvent('oAuthSignOut', { oAuth: 'signOut' }, "Signing out from " + oAuthLogoutEndpoint);
                logger.debug("Signing out from " + oAuthLogoutEndpoint);
                return [2 /*return*/, this._urlOpener(oAuthLogoutEndpoint, signout_uri)];
            });
        });
    };
    OAuth.prototype._generateState = function (length) {
        var result = '';
        var i = length;
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (; i > 0; --i)
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    };
    OAuth.prototype._generateChallenge = function (code) {
        var awsCryptoHash = new _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__.Sha256();
        awsCryptoHash.update(code);
        var resultFromAWSCrypto = awsCryptoHash.digestSync();
        var b64 = buffer__WEBPACK_IMPORTED_MODULE_1__.Buffer.from(resultFromAWSCrypto).toString('base64');
        var base64URLFromAWSCrypto = this._base64URL(b64);
        return base64URLFromAWSCrypto;
    };
    OAuth.prototype._base64URL = function (string) {
        return string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    };
    OAuth.prototype._generateRandom = function (size) {
        var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        var buffer = new Uint8Array(size);
        if (typeof window !== 'undefined' && !!window.crypto) {
            window.crypto.getRandomValues(buffer);
        }
        else {
            for (var i = 0; i < size; i += 1) {
                buffer[i] = (Math.random() * CHARSET.length) | 0;
            }
        }
        return this._bufferToString(buffer);
    };
    OAuth.prototype._bufferToString = function (buffer) {
        var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var state = [];
        for (var i = 0; i < buffer.byteLength; i += 1) {
            var index = buffer[i] % CHARSET.length;
            state.push(CHARSET[index]);
        }
        return state.join('');
    };
    return OAuth;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (OAuth);
//# sourceMappingURL=OAuth.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/lib-esm/OAuth/oauthStorage.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/OAuth/oauthStorage.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearAll: () => (/* binding */ clearAll),
/* harmony export */   getPKCE: () => (/* binding */ getPKCE),
/* harmony export */   getState: () => (/* binding */ getState),
/* harmony export */   setPKCE: () => (/* binding */ setPKCE),
/* harmony export */   setState: () => (/* binding */ setState)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var setState = function (state) {
    window.sessionStorage.setItem('oauth_state', state);
};
var getState = function () {
    var oauth_state = window.sessionStorage.getItem('oauth_state');
    window.sessionStorage.removeItem('oauth_state');
    return oauth_state;
};
var setPKCE = function (private_key) {
    window.sessionStorage.setItem('ouath_pkce_key', private_key);
};
var getPKCE = function () {
    var ouath_pkce_key = window.sessionStorage.getItem('ouath_pkce_key');
    window.sessionStorage.removeItem('ouath_pkce_key');
    return ouath_pkce_key;
};
var clearAll = function () {
    window.sessionStorage.removeItem('ouath_pkce_key');
    window.sessionStorage.removeItem('oauth_state');
};
//# sourceMappingURL=oauthStorage.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/lib-esm/OAuth/urlOpener.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/OAuth/urlOpener.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   launchUri: () => (/* binding */ launchUri)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var SELF = '_self';
var launchUri = function (url) {
    var windowProxy = window.open(url, SELF);
    if (windowProxy) {
        return Promise.resolve(windowProxy);
    }
    else {
        return Promise.reject();
    }
};
//# sourceMappingURL=urlOpener.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/lib-esm/common/AuthErrorStrings.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/common/AuthErrorStrings.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthErrorStrings: () => (/* binding */ AuthErrorStrings)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var AuthErrorStrings;
(function (AuthErrorStrings) {
    AuthErrorStrings["DEFAULT_MSG"] = "Authentication Error";
    AuthErrorStrings["EMPTY_EMAIL"] = "Email cannot be empty";
    AuthErrorStrings["EMPTY_PHONE"] = "Phone number cannot be empty";
    AuthErrorStrings["EMPTY_USERNAME"] = "Username cannot be empty";
    AuthErrorStrings["INVALID_USERNAME"] = "The username should either be a string or one of the sign in types";
    AuthErrorStrings["EMPTY_PASSWORD"] = "Password cannot be empty";
    AuthErrorStrings["EMPTY_CODE"] = "Confirmation code cannot be empty";
    AuthErrorStrings["SIGN_UP_ERROR"] = "Error creating account";
    AuthErrorStrings["NO_MFA"] = "No valid MFA method provided";
    AuthErrorStrings["INVALID_MFA"] = "Invalid MFA type";
    AuthErrorStrings["EMPTY_CHALLENGE"] = "Challenge response cannot be empty";
    AuthErrorStrings["NO_USER_SESSION"] = "Failed to get the session because the user is empty";
    AuthErrorStrings["NETWORK_ERROR"] = "Network Error";
    AuthErrorStrings["DEVICE_CONFIG"] = "Device tracking has not been configured in this User Pool";
    AuthErrorStrings["AUTOSIGNIN_ERROR"] = "Please use your credentials to sign in";
})(AuthErrorStrings || (AuthErrorStrings = {}));
//# sourceMappingURL=AuthErrorStrings.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/lib-esm/types/Auth.js":
/*!**************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/types/Auth.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthErrorTypes: () => (/* binding */ AuthErrorTypes),
/* harmony export */   CognitoHostedUIIdentityProvider: () => (/* binding */ CognitoHostedUIIdentityProvider),
/* harmony export */   GRAPHQL_AUTH_MODE: () => (/* binding */ GRAPHQL_AUTH_MODE),
/* harmony export */   hasCustomState: () => (/* binding */ hasCustomState),
/* harmony export */   isCognitoHostedOpts: () => (/* binding */ isCognitoHostedOpts),
/* harmony export */   isFederatedSignInOptions: () => (/* binding */ isFederatedSignInOptions),
/* harmony export */   isFederatedSignInOptionsCustom: () => (/* binding */ isFederatedSignInOptionsCustom),
/* harmony export */   isUsernamePasswordOpts: () => (/* binding */ isUsernamePasswordOpts)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var CognitoHostedUIIdentityProvider;
(function (CognitoHostedUIIdentityProvider) {
    CognitoHostedUIIdentityProvider["Cognito"] = "COGNITO";
    CognitoHostedUIIdentityProvider["Google"] = "Google";
    CognitoHostedUIIdentityProvider["Facebook"] = "Facebook";
    CognitoHostedUIIdentityProvider["Amazon"] = "LoginWithAmazon";
    CognitoHostedUIIdentityProvider["Apple"] = "SignInWithApple";
})(CognitoHostedUIIdentityProvider || (CognitoHostedUIIdentityProvider = {}));
function isFederatedSignInOptions(obj) {
    var keys = ['provider'];
    return obj && !!keys.find(function (k) { return obj.hasOwnProperty(k); });
}
function isFederatedSignInOptionsCustom(obj) {
    var keys = ['customProvider'];
    return obj && !!keys.find(function (k) { return obj.hasOwnProperty(k); });
}
function hasCustomState(obj) {
    var keys = ['customState'];
    return obj && !!keys.find(function (k) { return obj.hasOwnProperty(k); });
}
function isCognitoHostedOpts(oauth) {
    return oauth.redirectSignIn !== undefined;
}
var AuthErrorTypes;
(function (AuthErrorTypes) {
    AuthErrorTypes["NoConfig"] = "noConfig";
    AuthErrorTypes["MissingAuthConfig"] = "missingAuthConfig";
    AuthErrorTypes["EmptyUsername"] = "emptyUsername";
    AuthErrorTypes["InvalidUsername"] = "invalidUsername";
    AuthErrorTypes["EmptyPassword"] = "emptyPassword";
    AuthErrorTypes["EmptyCode"] = "emptyCode";
    AuthErrorTypes["SignUpError"] = "signUpError";
    AuthErrorTypes["NoMFA"] = "noMFA";
    AuthErrorTypes["InvalidMFA"] = "invalidMFA";
    AuthErrorTypes["EmptyChallengeResponse"] = "emptyChallengeResponse";
    AuthErrorTypes["NoUserSession"] = "noUserSession";
    AuthErrorTypes["Default"] = "default";
    AuthErrorTypes["DeviceConfig"] = "deviceConfig";
    AuthErrorTypes["NetworkError"] = "networkError";
    AuthErrorTypes["AutoSignInError"] = "autoSignInError";
})(AuthErrorTypes || (AuthErrorTypes = {}));
function isUsernamePasswordOpts(obj) {
    return !!obj.username;
}
var GRAPHQL_AUTH_MODE;
(function (GRAPHQL_AUTH_MODE) {
    GRAPHQL_AUTH_MODE["API_KEY"] = "API_KEY";
    GRAPHQL_AUTH_MODE["AWS_IAM"] = "AWS_IAM";
    GRAPHQL_AUTH_MODE["OPENID_CONNECT"] = "OPENID_CONNECT";
    GRAPHQL_AUTH_MODE["AMAZON_COGNITO_USER_POOLS"] = "AMAZON_COGNITO_USER_POOLS";
    GRAPHQL_AUTH_MODE["AWS_LAMBDA"] = "AWS_LAMBDA";
})(GRAPHQL_AUTH_MODE || (GRAPHQL_AUTH_MODE = {}));
//# sourceMappingURL=Auth.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/lib-esm/urlListener.js":
/*!***************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/lib-esm/urlListener.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @aws-amplify/core */ "./node_modules/@aws-amplify/core/lib-esm/JS.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (callback) {
    if ((0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__.browserOrNode)().isBrowser && window.location) {
        var url = window.location.href;
        callback({ url: url });
    }
    else if ((0,_aws_amplify_core__WEBPACK_IMPORTED_MODULE_0__.browserOrNode)().isNode) {
        // continue building on ssr
        (function () { }); // noop
    }
    else {
        throw new Error('Not supported');
    }
});
//# sourceMappingURL=urlListener.js.map

/***/ }),

/***/ "./node_modules/@aws-amplify/auth/node_modules/buffer/index.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/node_modules/buffer/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
var isArray = __webpack_require__(/*! isarray */ "./node_modules/isarray/index.js")

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = __webpack_require__.g.TYPED_ARRAY_SUPPORT !== undefined
  ? __webpack_require__.g.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


/***/ }),

/***/ "./node_modules/@aws-amplify/auth/node_modules/punycode/punycode.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/node_modules/punycode/punycode.js ***!
  \**************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.3.2 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports =  true && exports &&
		!exports.nodeType && exports;
	var freeModule =  true && module &&
		!module.nodeType && module;
	var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return punycode;
		}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(this));


/***/ }),

/***/ "./node_modules/@aws-amplify/auth/node_modules/tslib/tslib.es6.js":
/*!************************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/node_modules/tslib/tslib.es6.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __assign: () => (/* binding */ __assign),
/* harmony export */   __asyncDelegator: () => (/* binding */ __asyncDelegator),
/* harmony export */   __asyncGenerator: () => (/* binding */ __asyncGenerator),
/* harmony export */   __asyncValues: () => (/* binding */ __asyncValues),
/* harmony export */   __await: () => (/* binding */ __await),
/* harmony export */   __awaiter: () => (/* binding */ __awaiter),
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   __createBinding: () => (/* binding */ __createBinding),
/* harmony export */   __decorate: () => (/* binding */ __decorate),
/* harmony export */   __exportStar: () => (/* binding */ __exportStar),
/* harmony export */   __extends: () => (/* binding */ __extends),
/* harmony export */   __generator: () => (/* binding */ __generator),
/* harmony export */   __importDefault: () => (/* binding */ __importDefault),
/* harmony export */   __importStar: () => (/* binding */ __importStar),
/* harmony export */   __makeTemplateObject: () => (/* binding */ __makeTemplateObject),
/* harmony export */   __metadata: () => (/* binding */ __metadata),
/* harmony export */   __param: () => (/* binding */ __param),
/* harmony export */   __read: () => (/* binding */ __read),
/* harmony export */   __rest: () => (/* binding */ __rest),
/* harmony export */   __spread: () => (/* binding */ __spread),
/* harmony export */   __spreadArrays: () => (/* binding */ __spreadArrays),
/* harmony export */   __values: () => (/* binding */ __values)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),

/***/ "./node_modules/@aws-amplify/auth/node_modules/url/url.js":
/*!****************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/node_modules/url/url.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var punycode = __webpack_require__(/*! punycode */ "./node_modules/@aws-amplify/auth/node_modules/punycode/punycode.js");
var util = __webpack_require__(/*! ./util */ "./node_modules/@aws-amplify/auth/node_modules/url/util.js");

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = __webpack_require__(/*! querystring */ "./node_modules/querystring/index.js");

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};


/***/ }),

/***/ "./node_modules/@aws-amplify/auth/node_modules/url/util.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@aws-amplify/auth/node_modules/url/util.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Amplify.js":
/*!***********************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Amplify.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Amplify: () => (/* binding */ Amplify),
/* harmony export */   AmplifyClass: () => (/* binding */ AmplifyClass)
/* harmony export */ });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('Amplify');
var AmplifyClass = /** @class */ (function () {
    function AmplifyClass() {
        // Everything that is `register`ed is tracked here
        this._components = [];
        this._config = {};
        // All modules (with `getModuleName()`) are stored here for dependency injection
        this._modules = {};
        // for backward compatibility to avoid breaking change
        // if someone is using like Amplify.Auth
        this.Auth = null;
        this.Analytics = null;
        this.API = null;
        this.Credentials = null;
        this.Storage = null;
        this.I18n = null;
        this.Cache = null;
        this.PubSub = null;
        this.Interactions = null;
        this.Pushnotification = null;
        this.UI = null;
        this.XR = null;
        this.Predictions = null;
        this.DataStore = null;
        this.Geo = null;
        this.Notifications = null;
        this.Logger = _Logger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger;
        this.ServiceWorker = null;
    }
    AmplifyClass.prototype.register = function (comp) {
        logger.debug('component registered in amplify', comp);
        this._components.push(comp);
        if (typeof comp.getModuleName === 'function') {
            this._modules[comp.getModuleName()] = comp;
            this[comp.getModuleName()] = comp;
        }
        else {
            logger.debug('no getModuleName method for component', comp);
        }
        // Finally configure this new component(category) loaded
        // With the new modularization changes in Amplify V3, all the Amplify
        // component are not loaded/registered right away but when they are
        // imported (and hence instantiated) in the client's app. This ensures
        // that all new components imported get correctly configured with the
        // configuration that Amplify.configure() was called with.
        comp.configure(this._config);
    };
    AmplifyClass.prototype.configure = function (config) {
        var _this = this;
        if (!config)
            return this._config;
        this._config = Object.assign(this._config, config);
        logger.debug('amplify config', this._config);
        // Dependency Injection via property-setting.
        // This avoids introducing a public method/interface/setter that's difficult to remove later.
        // Plus, it reduces `if` statements within the `constructor` and `configure` of each module
        Object.entries(this._modules).forEach(function (_a) {
            var _b = __read(_a, 2), Name = _b[0], comp = _b[1];
            // e.g. Auth.*
            Object.keys(comp).forEach(function (property) {
                // e.g. Auth["Credentials"] = this._modules["Credentials"] when set
                if (_this._modules[property]) {
                    comp[property] = _this._modules[property];
                }
            });
        });
        this._components.map(function (comp) {
            comp.configure(_this._config);
        });
        return this._config;
    };
    AmplifyClass.prototype.addPluggable = function (pluggable) {
        if (pluggable &&
            pluggable['getCategory'] &&
            typeof pluggable['getCategory'] === 'function') {
            this._components.map(function (comp) {
                if (comp['addPluggable'] &&
                    typeof comp['addPluggable'] === 'function') {
                    comp.addPluggable(pluggable);
                }
            });
        }
    };
    return AmplifyClass;
}());

var Amplify = new AmplifyClass();


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/base.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/base.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildHttpRpcRequest: () => (/* binding */ buildHttpRpcRequest),
/* harmony export */   cognitoIdentityTransferHandler: () => (/* binding */ cognitoIdentityTransferHandler),
/* harmony export */   defaultConfig: () => (/* binding */ defaultConfig),
/* harmony export */   getSharedHeaders: () => (/* binding */ getSharedHeaders)
/* harmony export */ });
/* harmony import */ var _clients__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../clients */ "./node_modules/@aws-amplify/core/lib-esm/clients/endpoints/getDnsSuffix.js");
/* harmony import */ var _clients__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../clients */ "./node_modules/@aws-amplify/core/lib-esm/clients/handlers/unauthenticated.js");
/* harmony import */ var _clients__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../clients */ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/json.js");
/* harmony import */ var _clients_internal_composeTransferHandler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../clients/internal/composeTransferHandler */ "./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeTransferHandler.js");
/* harmony import */ var _clients_middleware_retry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../clients/middleware/retry */ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/defaultRetryDecider.js");
/* harmony import */ var _clients_middleware_retry__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../clients/middleware/retry */ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/jitteredBackoff.js");
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../Platform */ "./node_modules/@aws-amplify/core/lib-esm/Platform/index.js");
/* harmony import */ var _Platform_detectFramework__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../Platform/detectFramework */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detectFramework.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};





/**
 * The service name used to sign requests if the API requires authentication.
 */
var SERVICE_NAME = 'cognito-identity';
/**
 * The endpoint resolver function that returns the endpoint URL for a given region.
 */
var endpointResolver = function (_a) {
    var region = _a.region;
    return ({
        url: new URL("https://cognito-identity.".concat(region, ".").concat((0,_clients__WEBPACK_IMPORTED_MODULE_0__.getDnsSuffix)(region))),
    });
};
/**
 * A Cognito Identity-specific middleware that disables caching for all requests.
 */
var disableCacheMiddleware = function () { return function (next, context) {
    return function disableCacheMiddleware(request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                request.headers['cache-control'] = 'no-store';
                return [2 /*return*/, next(request)];
            });
        });
    };
}; };
/**
 * A Cognito Identity-specific transfer handler that does NOT sign requests, and
 * disables caching.
 *
 * @internal
 */
var cognitoIdentityTransferHandler = (0,_clients_internal_composeTransferHandler__WEBPACK_IMPORTED_MODULE_1__.composeTransferHandler)(_clients__WEBPACK_IMPORTED_MODULE_2__.unauthenticatedHandler, [disableCacheMiddleware]);
/**
 * @internal
 */
var defaultConfig = {
    service: SERVICE_NAME,
    endpointResolver: endpointResolver,
    retryDecider: (0,_clients_middleware_retry__WEBPACK_IMPORTED_MODULE_3__.getRetryDecider)(_clients__WEBPACK_IMPORTED_MODULE_4__.parseJsonError),
    computeDelay: _clients_middleware_retry__WEBPACK_IMPORTED_MODULE_5__.jitteredBackoff,
    userAgentValue: (0,_Platform__WEBPACK_IMPORTED_MODULE_6__.getAmplifyUserAgent)(),
};
(0,_Platform_detectFramework__WEBPACK_IMPORTED_MODULE_7__.observeFrameworkChanges)(function () {
    defaultConfig.userAgentValue = (0,_Platform__WEBPACK_IMPORTED_MODULE_6__.getAmplifyUserAgent)();
});
/**
 * @internal
 */
var getSharedHeaders = function (operation) { return ({
    'content-type': 'application/x-amz-json-1.1',
    'x-amz-target': "AWSCognitoIdentityService.".concat(operation),
}); };
/**
 * @internal
 */
var buildHttpRpcRequest = function (_a, headers, body) {
    var url = _a.url;
    return ({
        headers: headers,
        url: url,
        body: body,
        method: 'POST',
    });
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/getCredentialsForIdentity.js":
/*!********************************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/getCredentialsForIdentity.js ***!
  \********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCredentialsForIdentity: () => (/* binding */ getCredentialsForIdentity)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/base.js");
/* harmony import */ var _clients__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../clients */ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/json.js");
/* harmony import */ var _clients__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../clients */ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/responseInfo.js");
/* harmony import */ var _clients_internal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../clients/internal */ "./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeServiceApi.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};



var getCredentialsForIdentitySerializer = function (input, endpoint) {
    var headers = (0,_base__WEBPACK_IMPORTED_MODULE_0__.getSharedHeaders)('GetCredentialsForIdentity');
    var body = JSON.stringify(input);
    return (0,_base__WEBPACK_IMPORTED_MODULE_0__.buildHttpRpcRequest)(endpoint, headers, body);
};
var getCredentialsForIdentityDeserializer = function (response) { return __awaiter(void 0, void 0, void 0, function () {
    var error, body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(response.statusCode >= 300)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0,_clients__WEBPACK_IMPORTED_MODULE_1__.parseJsonError)(response)];
            case 1:
                error = _a.sent();
                throw error;
            case 2: return [4 /*yield*/, (0,_clients__WEBPACK_IMPORTED_MODULE_1__.parseJsonBody)(response)];
            case 3:
                body = _a.sent();
                return [2 /*return*/, {
                        IdentityId: body.IdentityId,
                        Credentials: deserializeCredentials(body.Credentials),
                        $metadata: (0,_clients__WEBPACK_IMPORTED_MODULE_2__.parseMetadata)(response),
                    }];
        }
    });
}); };
var deserializeCredentials = function (output) {
    if (output === void 0) { output = {}; }
    return ({
        AccessKeyId: output['AccessKeyId'],
        SecretKey: output['SecretKey'],
        SessionToken: output['SessionToken'],
        Expiration: new Date(output['Expiration'] * 1000),
    });
};
/**
 * @internal
 */
var getCredentialsForIdentity = (0,_clients_internal__WEBPACK_IMPORTED_MODULE_3__.composeServiceApi)(_base__WEBPACK_IMPORTED_MODULE_0__.cognitoIdentityTransferHandler, getCredentialsForIdentitySerializer, getCredentialsForIdentityDeserializer, _base__WEBPACK_IMPORTED_MODULE_0__.defaultConfig);


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/getId.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/getId.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getId: () => (/* binding */ getId)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/base.js");
/* harmony import */ var _clients__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../clients */ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/json.js");
/* harmony import */ var _clients__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../clients */ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/responseInfo.js");
/* harmony import */ var _clients_internal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../clients/internal */ "./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeServiceApi.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};



var getIdSerializer = function (input, endpoint) {
    var headers = (0,_base__WEBPACK_IMPORTED_MODULE_0__.getSharedHeaders)('GetId');
    var body = JSON.stringify(input);
    return (0,_base__WEBPACK_IMPORTED_MODULE_0__.buildHttpRpcRequest)(endpoint, headers, body);
};
var getIdDeserializer = function (response) { return __awaiter(void 0, void 0, void 0, function () {
    var error, body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(response.statusCode >= 300)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0,_clients__WEBPACK_IMPORTED_MODULE_1__.parseJsonError)(response)];
            case 1:
                error = _a.sent();
                throw error;
            case 2: return [4 /*yield*/, (0,_clients__WEBPACK_IMPORTED_MODULE_1__.parseJsonBody)(response)];
            case 3:
                body = _a.sent();
                return [2 /*return*/, {
                        IdentityId: body.IdentityId,
                        $metadata: (0,_clients__WEBPACK_IMPORTED_MODULE_2__.parseMetadata)(response),
                    }];
        }
    });
}); };
/**
 * @internal
 */
var getId = (0,_clients_internal__WEBPACK_IMPORTED_MODULE_3__.composeServiceApi)(_base__WEBPACK_IMPORTED_MODULE_0__.cognitoIdentityTransferHandler, getIdSerializer, getIdDeserializer, _base__WEBPACK_IMPORTED_MODULE_0__.defaultConfig);


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Credentials.js":
/*!***************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Credentials.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Credentials: () => (/* binding */ Credentials),
/* harmony export */   CredentialsClass: () => (/* binding */ CredentialsClass)
/* harmony export */ });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
/* harmony import */ var _StorageHelper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./StorageHelper */ "./node_modules/@aws-amplify/core/lib-esm/StorageHelper/index.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./JS */ "./node_modules/@aws-amplify/core/lib-esm/JS.js");
/* harmony import */ var _OAuthHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OAuthHelper */ "./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/index.js");
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Util */ "./node_modules/@aws-amplify/core/lib-esm/Util/Retry.js");
/* harmony import */ var _Amplify__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Amplify */ "./node_modules/@aws-amplify/core/lib-esm/Amplify.js");
/* harmony import */ var _AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./AwsClients/CognitoIdentity */ "./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/getId.js");
/* harmony import */ var _AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./AwsClients/CognitoIdentity */ "./node_modules/@aws-amplify/core/lib-esm/AwsClients/CognitoIdentity/getCredentialsForIdentity.js");
/* harmony import */ var _parseAWSExports__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./parseAWSExports */ "./node_modules/@aws-amplify/core/lib-esm/parseAWSExports.js");
/* harmony import */ var _Hub__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Hub */ "./node_modules/@aws-amplify/core/lib-esm/Hub.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0









var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('Credentials');
var CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future
var COGNITO_IDENTITY_KEY_PREFIX = 'CognitoIdentityId-';
var AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
    ? Symbol.for('amplify_default')
    : '@@amplify_default');
var dispatchCredentialsEvent = function (event, data, message) {
    _Hub__WEBPACK_IMPORTED_MODULE_1__.Hub.dispatch('core', { event: event, data: data, message: message }, 'Credentials', AMPLIFY_SYMBOL);
};
var CredentialsClass = /** @class */ (function () {
    function CredentialsClass(config) {
        this._gettingCredPromise = null;
        this._refreshHandlers = {};
        // Allow `Auth` to be injected for SSR, but Auth isn't a required dependency for Credentials
        this.Auth = undefined;
        this.configure(config);
        this._refreshHandlers['google'] = _OAuthHelper__WEBPACK_IMPORTED_MODULE_2__.GoogleOAuth.refreshGoogleToken;
        this._refreshHandlers['facebook'] = _OAuthHelper__WEBPACK_IMPORTED_MODULE_2__.FacebookOAuth.refreshFacebookToken;
    }
    CredentialsClass.prototype.getModuleName = function () {
        return 'Credentials';
    };
    CredentialsClass.prototype.getCredSource = function () {
        return this._credentials_source;
    };
    CredentialsClass.prototype.configure = function (config) {
        if (!config)
            return this._config || {};
        this._config = Object.assign({}, this._config, config);
        var refreshHandlers = this._config.refreshHandlers;
        // If the developer has provided an object of refresh handlers,
        // then we can merge the provided handlers with the current handlers.
        if (refreshHandlers) {
            this._refreshHandlers = __assign(__assign({}, this._refreshHandlers), refreshHandlers);
        }
        this._storage = this._config.storage;
        if (!this._storage) {
            this._storage = new _StorageHelper__WEBPACK_IMPORTED_MODULE_3__.StorageHelper().getStorage();
        }
        this._storageSync = Promise.resolve();
        if (typeof this._storage['sync'] === 'function') {
            this._storageSync = this._storage['sync']();
        }
        dispatchCredentialsEvent('credentials_configured', null, "Credentials has been configured successfully");
        return this._config;
    };
    CredentialsClass.prototype.get = function () {
        logger.debug('getting credentials');
        return this._pickupCredentials();
    };
    // currently we only store the guest identity in local storage
    CredentialsClass.prototype._getCognitoIdentityIdStorageKey = function (identityPoolId) {
        return "".concat(COGNITO_IDENTITY_KEY_PREFIX).concat(identityPoolId);
    };
    CredentialsClass.prototype._pickupCredentials = function () {
        logger.debug('picking up credentials');
        if (!this._gettingCredPromise || !this._gettingCredPromise.isPending()) {
            logger.debug('getting new cred promise');
            this._gettingCredPromise = (0,_JS__WEBPACK_IMPORTED_MODULE_4__.makeQuerablePromise)(this._keepAlive());
        }
        else {
            logger.debug('getting old cred promise');
        }
        return this._gettingCredPromise;
    };
    CredentialsClass.prototype._keepAlive = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cred, _a, Auth, user_1, session, refreshToken_1, refreshRequest, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger.debug('checking if credentials exists and not expired');
                        cred = this._credentials;
                        if (cred && !this._isExpired(cred) && !this._isPastTTL()) {
                            logger.debug('credentials not changed and not expired, directly return');
                            return [2 /*return*/, Promise.resolve(cred)];
                        }
                        logger.debug('need to get a new credential or refresh the existing one');
                        _a = this.Auth, Auth = _a === void 0 ? _Amplify__WEBPACK_IMPORTED_MODULE_5__.Amplify.Auth : _a;
                        if (!Auth || typeof Auth.currentUserCredentials !== 'function') {
                            // If Auth module is not imported, do a best effort to get guest credentials
                            return [2 /*return*/, this._setCredentialsForGuest()];
                        }
                        if (!(!this._isExpired(cred) && this._isPastTTL())) return [3 /*break*/, 6];
                        logger.debug('ttl has passed but token is not yet expired');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Auth.currentUserPoolUser()];
                    case 2:
                        user_1 = _b.sent();
                        return [4 /*yield*/, Auth.currentSession()];
                    case 3:
                        session = _b.sent();
                        refreshToken_1 = session.refreshToken;
                        refreshRequest = new Promise(function (res, rej) {
                            user_1.refreshSession(refreshToken_1, function (err, data) {
                                return err ? rej(err) : res(data);
                            });
                        });
                        return [4 /*yield*/, refreshRequest];
                    case 4:
                        _b.sent(); // note that rejections will be caught and handled in the catch block.
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _b.sent();
                        // should not throw because user might just be on guest access or is authenticated through federation
                        logger.debug('Error attempting to refreshing the session', err_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, Auth.currentUserCredentials()];
                }
            });
        });
    };
    CredentialsClass.prototype.refreshFederatedToken = function (federatedInfo) {
        logger.debug('Getting federated credentials');
        var provider = federatedInfo.provider, user = federatedInfo.user, token = federatedInfo.token, identity_id = federatedInfo.identity_id;
        var expires_at = federatedInfo.expires_at;
        // Make sure expires_at is in millis
        expires_at =
            new Date(expires_at).getFullYear() === 1970
                ? expires_at * 1000
                : expires_at;
        var that = this;
        logger.debug('checking if federated jwt token expired');
        if (expires_at > new Date().getTime()) {
            // if not expired
            logger.debug('token not expired');
            return this._setCredentialsFromFederation({
                provider: provider,
                token: token,
                user: user,
                identity_id: identity_id,
                expires_at: expires_at,
            });
        }
        else {
            // if refresh handler exists
            if (that._refreshHandlers[provider] &&
                typeof that._refreshHandlers[provider] === 'function') {
                logger.debug('getting refreshed jwt token from federation provider');
                return this._providerRefreshWithRetry({
                    refreshHandler: that._refreshHandlers[provider],
                    provider: provider,
                    user: user,
                });
            }
            else {
                logger.debug('no refresh handler for provider:', provider);
                this.clear();
                return Promise.reject('no refresh handler for provider');
            }
        }
    };
    CredentialsClass.prototype._providerRefreshWithRetry = function (_a) {
        var _this = this;
        var refreshHandler = _a.refreshHandler, provider = _a.provider, user = _a.user;
        var MAX_DELAY_MS = 10 * 1000;
        // refreshHandler will retry network errors, otherwise it will
        // return NonRetryableError to break out of jitteredExponentialRetry
        return (0,_Util__WEBPACK_IMPORTED_MODULE_6__.jitteredExponentialRetry)(refreshHandler, [], MAX_DELAY_MS)
            .then(function (data) {
            logger.debug('refresh federated token sucessfully', data);
            return _this._setCredentialsFromFederation({
                provider: provider,
                token: data.token,
                user: user,
                identity_id: data.identity_id,
                expires_at: data.expires_at,
            });
        })
            .catch(function (e) {
            var isNetworkError = typeof e === 'string' &&
                e.toLowerCase().lastIndexOf('network error', e.length) === 0;
            if (!isNetworkError) {
                _this.clear();
            }
            logger.debug('refresh federated token failed', e);
            return Promise.reject('refreshing federation token failed: ' + e);
        });
    };
    CredentialsClass.prototype._isExpired = function (credentials) {
        if (!credentials) {
            logger.debug('no credentials for expiration check');
            return true;
        }
        logger.debug('are these credentials expired?', credentials);
        var ts = Date.now();
        /* returns date object.
            https://github.com/aws/aws-sdk-js-v3/blob/v1.0.0-beta.1/packages/types/src/credentials.ts#L26
        */
        var expiration = credentials.expiration;
        return expiration.getTime() <= ts;
    };
    CredentialsClass.prototype._isPastTTL = function () {
        return this._nextCredentialsRefresh <= Date.now();
    };
    CredentialsClass.prototype._setCredentialsForGuest = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, identityPoolId, region, mandatorySignIn, identityPoolRegion, identityId, _c, cognitoConfig, guestCredentialsProvider, credentials;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        logger.debug('setting credentials for guest');
                        if (!((_a = this._config) === null || _a === void 0 ? void 0 : _a.identityPoolId)) {
                            // If Credentials are not configured thru Auth module,
                            // doing best effort to check if the library was configured
                            this._config = Object.assign({}, this._config, (0,_parseAWSExports__WEBPACK_IMPORTED_MODULE_7__.parseAWSExports)(this._config || {}).Auth);
                        }
                        _b = this._config, identityPoolId = _b.identityPoolId, region = _b.region, mandatorySignIn = _b.mandatorySignIn, identityPoolRegion = _b.identityPoolRegion;
                        if (mandatorySignIn) {
                            return [2 /*return*/, Promise.reject('cannot get guest credentials when mandatory signin enabled')];
                        }
                        if (!identityPoolId) {
                            logger.debug('No Cognito Identity pool provided for unauthenticated access');
                            return [2 /*return*/, Promise.reject('No Cognito Identity pool provided for unauthenticated access')];
                        }
                        if (!identityPoolRegion && !region) {
                            logger.debug('region is not configured for getting the credentials');
                            return [2 /*return*/, Promise.reject('region is not configured for getting the credentials')];
                        }
                        _c = this;
                        return [4 /*yield*/, this._getGuestIdentityId()];
                    case 1:
                        identityId = (_c._identityId = _d.sent());
                        cognitoConfig = { region: identityPoolRegion !== null && identityPoolRegion !== void 0 ? identityPoolRegion : region };
                        guestCredentialsProvider = function () { return __awaiter(_this, void 0, void 0, function () {
                            var IdentityId, Credentials;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!!identityId) return [3 /*break*/, 2];
                                        return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_8__.getId)(cognitoConfig, {
                                                IdentityPoolId: identityPoolId,
                                            })];
                                    case 1:
                                        IdentityId = (_a.sent()).IdentityId;
                                        this._identityId = IdentityId;
                                        _a.label = 2;
                                    case 2: return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_9__.getCredentialsForIdentity)(cognitoConfig, {
                                            IdentityId: this._identityId,
                                        })];
                                    case 3:
                                        Credentials = (_a.sent()).Credentials;
                                        return [2 /*return*/, {
                                                identityId: this._identityId,
                                                accessKeyId: Credentials.AccessKeyId,
                                                secretAccessKey: Credentials.SecretKey,
                                                sessionToken: Credentials.SessionToken,
                                                expiration: Credentials.Expiration,
                                            }];
                                }
                            });
                        }); };
                        credentials = guestCredentialsProvider().catch(function (err) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                throw err;
                            });
                        }); });
                        return [2 /*return*/, this._loadCredentials(credentials, 'guest', false, null)
                                .then(function (res) {
                                return res;
                            })
                                .catch(function (e) { return __awaiter(_this, void 0, void 0, function () {
                                var guestCredentialsProvider_1;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(e.name === 'ResourceNotFoundException' &&
                                                e.message === "Identity '".concat(identityId, "' not found."))) return [3 /*break*/, 2];
                                            logger.debug('Failed to load guest credentials');
                                            return [4 /*yield*/, this._removeGuestIdentityId()];
                                        case 1:
                                            _a.sent();
                                            guestCredentialsProvider_1 = function () { return __awaiter(_this, void 0, void 0, function () {
                                                var IdentityId, Credentials;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_8__.getId)(cognitoConfig, {
                                                                IdentityPoolId: identityPoolId,
                                                            })];
                                                        case 1:
                                                            IdentityId = (_a.sent()).IdentityId;
                                                            this._identityId = IdentityId;
                                                            return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_9__.getCredentialsForIdentity)(cognitoConfig, {
                                                                    IdentityId: IdentityId,
                                                                })];
                                                        case 2:
                                                            Credentials = (_a.sent()).Credentials;
                                                            return [2 /*return*/, {
                                                                    identityId: IdentityId,
                                                                    accessKeyId: Credentials.AccessKeyId,
                                                                    secretAccessKey: Credentials.SecretKey,
                                                                    sessionToken: Credentials.SessionToken,
                                                                    expiration: Credentials.Expiration,
                                                                }];
                                                    }
                                                });
                                            }); };
                                            credentials = guestCredentialsProvider_1().catch(function (err) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    throw err;
                                                });
                                            }); });
                                            return [2 /*return*/, this._loadCredentials(credentials, 'guest', false, null)];
                                        case 2: return [2 /*return*/, e];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    CredentialsClass.prototype._setCredentialsFromFederation = function (params) {
        var _this = this;
        var provider = params.provider, token = params.token;
        var identity_id = params.identity_id;
        var domains = {
            google: 'accounts.google.com',
            facebook: 'graph.facebook.com',
            amazon: 'www.amazon.com',
            developer: 'cognito-identity.amazonaws.com',
        };
        // Use custom provider url instead of the predefined ones
        var domain = domains[provider] || provider;
        if (!domain) {
            return Promise.reject('You must specify a federated provider');
        }
        var logins = {};
        logins[domain] = token;
        var _a = this._config, identityPoolId = _a.identityPoolId, region = _a.region, identityPoolRegion = _a.identityPoolRegion;
        if (!identityPoolId) {
            logger.debug('No Cognito Federated Identity pool provided');
            return Promise.reject('No Cognito Federated Identity pool provided');
        }
        if (!identityPoolRegion && !region) {
            logger.debug('region is not configured for getting the credentials');
            return Promise.reject('region is not configured for getting the credentials');
        }
        var cognitoConfig = { region: identityPoolRegion !== null && identityPoolRegion !== void 0 ? identityPoolRegion : region };
        var authenticatedCredentialsProvider = function () { return __awaiter(_this, void 0, void 0, function () {
            var IdentityId, Credentials;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!identity_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_8__.getId)(cognitoConfig, {
                                IdentityPoolId: identityPoolId,
                                Logins: logins,
                            })];
                    case 1:
                        IdentityId = (_a.sent()).IdentityId;
                        identity_id = IdentityId;
                        _a.label = 2;
                    case 2: return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_9__.getCredentialsForIdentity)(cognitoConfig, {
                            IdentityId: identity_id,
                            Logins: logins,
                        })];
                    case 3:
                        Credentials = (_a.sent()).Credentials;
                        return [2 /*return*/, {
                                identityId: identity_id,
                                accessKeyId: Credentials.AccessKeyId,
                                secretAccessKey: Credentials.SecretKey,
                                sessionToken: Credentials.SessionToken,
                                expiration: Credentials.Expiration,
                            }];
                }
            });
        }); };
        var credentials = authenticatedCredentialsProvider().catch(function (err) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw err;
            });
        }); });
        return this._loadCredentials(credentials, 'federated', true, params);
    };
    CredentialsClass.prototype._setCredentialsFromSession = function (session) {
        var _this = this;
        logger.debug('set credentials from session');
        var idToken = session.getIdToken().getJwtToken();
        var _a = this._config, region = _a.region, userPoolId = _a.userPoolId, identityPoolId = _a.identityPoolId, identityPoolRegion = _a.identityPoolRegion;
        if (!identityPoolId) {
            logger.debug('No Cognito Federated Identity pool provided');
            return Promise.reject('No Cognito Federated Identity pool provided');
        }
        if (!identityPoolRegion && !region) {
            logger.debug('region is not configured for getting the credentials');
            return Promise.reject('region is not configured for getting the credentials');
        }
        var key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
        var logins = {};
        logins[key] = idToken;
        var cognitoConfig = { region: identityPoolRegion !== null && identityPoolRegion !== void 0 ? identityPoolRegion : region };
        /*
            Retreiving identityId with GetIdCommand to mimic the behavior in the following code in aws-sdk-v3:
            https://git.io/JeDxU

            Note: Retreive identityId from CredentialsProvider once aws-sdk-js v3 supports this.
        */
        var credentialsProvider = function () { return __awaiter(_this, void 0, void 0, function () {
            var guestIdentityId, generatedOrRetrievedIdentityId, IdentityId, _a, _b, AccessKeyId, Expiration, SecretKey, SessionToken, primaryIdentityId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._getGuestIdentityId()];
                    case 1:
                        guestIdentityId = _c.sent();
                        if (!!guestIdentityId) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_8__.getId)(cognitoConfig, {
                                IdentityPoolId: identityPoolId,
                                Logins: logins,
                            })];
                    case 2:
                        IdentityId = (_c.sent()).IdentityId;
                        generatedOrRetrievedIdentityId = IdentityId;
                        _c.label = 3;
                    case 3: return [4 /*yield*/, (0,_AwsClients_CognitoIdentity__WEBPACK_IMPORTED_MODULE_9__.getCredentialsForIdentity)(cognitoConfig, {
                            IdentityId: guestIdentityId || generatedOrRetrievedIdentityId,
                            Logins: logins,
                        })];
                    case 4:
                        _a = _c.sent(), _b = _a.Credentials, AccessKeyId = _b.AccessKeyId, Expiration = _b.Expiration, SecretKey = _b.SecretKey, SessionToken = _b.SessionToken, primaryIdentityId = _a.IdentityId;
                        this._identityId = primaryIdentityId;
                        if (!guestIdentityId) return [3 /*break*/, 6];
                        // if guestIdentity is found and used by GetCredentialsForIdentity
                        // it will be linked to the logins provided, and disqualified as an unauth identity
                        logger.debug("The guest identity ".concat(guestIdentityId, " has been successfully linked to the logins"));
                        if (guestIdentityId === primaryIdentityId) {
                            logger.debug("The guest identity ".concat(guestIdentityId, " has become the primary identity"));
                        }
                        // remove it from local storage to avoid being used as a guest Identity by _setCredentialsForGuest
                        return [4 /*yield*/, this._removeGuestIdentityId()];
                    case 5:
                        // remove it from local storage to avoid being used as a guest Identity by _setCredentialsForGuest
                        _c.sent();
                        _c.label = 6;
                    case 6: 
                    // https://github.com/aws/aws-sdk-js-v3/blob/main/packages/credential-provider-cognito-identity/src/fromCognitoIdentity.ts#L40
                    return [2 /*return*/, {
                            accessKeyId: AccessKeyId,
                            secretAccessKey: SecretKey,
                            sessionToken: SessionToken,
                            expiration: Expiration,
                            identityId: primaryIdentityId,
                        }];
                }
            });
        }); };
        var credentials = credentialsProvider().catch(function (err) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw err;
            });
        }); });
        return this._loadCredentials(credentials, 'userPool', true, null);
    };
    CredentialsClass.prototype._loadCredentials = function (credentials, source, authenticated, info) {
        var _this = this;
        var that = this;
        return new Promise(function (res, rej) {
            credentials
                .then(function (credentials) { return __awaiter(_this, void 0, void 0, function () {
                var user, provider, token, expires_at, identity_id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            logger.debug('Load credentials successfully', credentials);
                            if (this._identityId && !credentials.identityId) {
                                credentials['identityId'] = this._identityId;
                            }
                            that._credentials = credentials;
                            that._credentials.authenticated = authenticated;
                            that._credentials_source = source;
                            that._nextCredentialsRefresh = new Date().getTime() + CREDENTIALS_TTL;
                            if (source === 'federated') {
                                user = Object.assign({ id: this._credentials.identityId }, info.user);
                                provider = info.provider, token = info.token, expires_at = info.expires_at, identity_id = info.identity_id;
                                try {
                                    this._storage.setItem('aws-amplify-federatedInfo', JSON.stringify({
                                        provider: provider,
                                        token: token,
                                        user: user,
                                        expires_at: expires_at,
                                        identity_id: identity_id,
                                    }));
                                }
                                catch (e) {
                                    logger.debug('Failed to put federated info into auth storage', e);
                                }
                            }
                            if (!(source === 'guest')) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._setGuestIdentityId(credentials.identityId)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            res(that._credentials);
                            return [2 /*return*/];
                    }
                });
            }); })
                .catch(function (err) {
                if (err) {
                    logger.debug('Failed to load credentials', credentials);
                    logger.debug('Error loading credentials', err);
                    rej(err);
                    return;
                }
            });
        });
    };
    CredentialsClass.prototype.set = function (params, source) {
        if (source === 'session') {
            return this._setCredentialsFromSession(params);
        }
        else if (source === 'federation') {
            return this._setCredentialsFromFederation(params);
        }
        else if (source === 'guest') {
            return this._setCredentialsForGuest();
        }
        else {
            logger.debug('no source specified for setting credentials');
            return Promise.reject('invalid source');
        }
    };
    CredentialsClass.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._credentials = null;
                this._credentials_source = null;
                logger.debug('removing aws-amplify-federatedInfo from storage');
                this._storage.removeItem('aws-amplify-federatedInfo');
                return [2 /*return*/];
            });
        });
    };
    /* operations on local stored guest identity */
    CredentialsClass.prototype._getGuestIdentityId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var identityPoolId, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        identityPoolId = this._config.identityPoolId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._storageSync];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this._storage.getItem(this._getCognitoIdentityIdStorageKey(identityPoolId))];
                    case 3:
                        e_1 = _a.sent();
                        logger.debug('Failed to get the cached guest identityId', e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CredentialsClass.prototype._setGuestIdentityId = function (identityId) {
        return __awaiter(this, void 0, void 0, function () {
            var identityPoolId, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        identityPoolId = this._config.identityPoolId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._storageSync];
                    case 2:
                        _a.sent();
                        this._storage.setItem(this._getCognitoIdentityIdStorageKey(identityPoolId), identityId);
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        logger.debug('Failed to cache guest identityId', e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CredentialsClass.prototype._removeGuestIdentityId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var identityPoolId;
            return __generator(this, function (_a) {
                identityPoolId = this._config.identityPoolId;
                logger.debug("removing ".concat(this._getCognitoIdentityIdStorageKey(identityPoolId), " from storage"));
                this._storage.removeItem(this._getCognitoIdentityIdStorageKey(identityPoolId));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Compact version of credentials
     * @param {Object} credentials
     * @return {Object} - Credentials
     */
    CredentialsClass.prototype.shear = function (credentials) {
        return {
            accessKeyId: credentials.accessKeyId,
            sessionToken: credentials.sessionToken,
            secretAccessKey: credentials.secretAccessKey,
            identityId: credentials.identityId,
            authenticated: credentials.authenticated,
        };
    };
    return CredentialsClass;
}());

var Credentials = new CredentialsClass(null);
_Amplify__WEBPACK_IMPORTED_MODULE_5__.Amplify.register(Credentials);


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Hub.js":
/*!*******************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Hub.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Hub: () => (/* binding */ Hub),
/* harmony export */   HubClass: () => (/* binding */ HubClass)
/* harmony export */ });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('Hub');
var AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
    ? Symbol.for('amplify_default')
    : '@@amplify_default');
function isLegacyCallback(callback) {
    return callback.onHubCapsule !== undefined;
}
var HubClass = /** @class */ (function () {
    function HubClass(name) {
        this.listeners = [];
        this.patterns = [];
        this.protectedChannels = [
            'core',
            'auth',
            'api',
            'analytics',
            'interactions',
            'pubsub',
            'storage',
            'ui',
            'xr',
        ];
        this.name = name;
    }
    /**
     * Used internally to remove a Hub listener.
     *
     * @remarks
     * This private method is for internal use only. Instead of calling Hub.remove, call the result of Hub.listen.
     */
    HubClass.prototype._remove = function (channel, listener) {
        if (channel instanceof RegExp) {
            var pattern_1 = this.patterns.find(function (_a) {
                var pattern = _a.pattern;
                return pattern.source === channel.source;
            });
            if (!pattern_1) {
                logger.warn("No listeners for ".concat(channel));
                return;
            }
            this.patterns = __spreadArray([], __read(this.patterns.filter(function (x) { return x !== pattern_1; })), false);
        }
        else {
            var holder = this.listeners[channel];
            if (!holder) {
                logger.warn("No listeners for ".concat(channel));
                return;
            }
            this.listeners[channel] = __spreadArray([], __read(holder.filter(function (_a) {
                var callback = _a.callback;
                return callback !== listener;
            })), false);
        }
    };
    /**
     * @deprecated Instead of calling Hub.remove, call the result of Hub.listen.
     */
    HubClass.prototype.remove = function (channel, listener) {
        this._remove(channel, listener);
    };
    /**
     * Used to send a Hub event.
     *
     * @param channel - The channel on which the event will be broadcast
     * @param payload - The HubPayload
     * @param source  - The source of the event; defaults to ''
     * @param ampSymbol - Symbol used to determine if the event is dispatched internally on a protected channel
     *
     */
    HubClass.prototype.dispatch = function (channel, payload, source, ampSymbol) {
        if (source === void 0) { source = ''; }
        if (this.protectedChannels.indexOf(channel) > -1) {
            var hasAccess = ampSymbol === AMPLIFY_SYMBOL;
            if (!hasAccess) {
                logger.warn("WARNING: ".concat(channel, " is protected and dispatching on it can have unintended consequences"));
            }
        }
        var capsule = {
            channel: channel,
            payload: __assign({}, payload),
            source: source,
            patternInfo: [],
        };
        try {
            this._toListeners(capsule);
        }
        catch (e) {
            logger.error(e);
        }
    };
    /**
     * Used to listen for Hub events.
     *
     * @param channel - The channel on which to listen
     * @param callback - The callback to execute when an event is received on the specified channel
     * @param listenerName - The name of the listener; defaults to 'noname'
     * @returns A function which can be called to cancel the listener.
     *
     */
    HubClass.prototype.listen = function (channel, callback, listenerName) {
        var _this = this;
        if (listenerName === void 0) { listenerName = 'noname'; }
        var cb;
        // Check for legacy onHubCapsule callback for backwards compatability
        if (isLegacyCallback(callback)) {
            logger.warn("WARNING onHubCapsule is Deprecated. Please pass in a callback.");
            cb = callback.onHubCapsule.bind(callback);
        }
        else if (typeof callback !== 'function') {
            throw new Error('No callback supplied to Hub');
        }
        else {
            cb = callback;
        }
        if (channel instanceof RegExp) {
            this.patterns.push({
                pattern: channel,
                callback: cb,
            });
        }
        else {
            var holder = this.listeners[channel];
            if (!holder) {
                holder = [];
                this.listeners[channel] = holder;
            }
            holder.push({
                name: listenerName,
                callback: cb,
            });
        }
        return function () {
            _this._remove(channel, cb);
        };
    };
    HubClass.prototype._toListeners = function (capsule) {
        var channel = capsule.channel, payload = capsule.payload;
        var holder = this.listeners[channel];
        if (holder) {
            holder.forEach(function (listener) {
                logger.debug("Dispatching to ".concat(channel, " with "), payload);
                try {
                    listener.callback(capsule);
                }
                catch (e) {
                    logger.error(e);
                }
            });
        }
        if (this.patterns.length > 0) {
            if (!payload.message) {
                logger.warn("Cannot perform pattern matching without a message key");
                return;
            }
            var payloadStr_1 = payload.message;
            this.patterns.forEach(function (pattern) {
                var match = payloadStr_1.match(pattern.pattern);
                if (match) {
                    var _a = __read(match), groups = _a.slice(1);
                    var dispatchingCapsule = __assign(__assign({}, capsule), { patternInfo: groups });
                    try {
                        pattern.callback(dispatchingCapsule);
                    }
                    catch (e) {
                        logger.error(e);
                    }
                }
            });
        }
    };
    return HubClass;
}());

/*We export a __default__ instance of HubClass to use it as a
pseudo Singleton for the main messaging bus, however you can still create
your own instance of HubClass() for a separate "private bus" of events.*/
var Hub = new HubClass('__default__');


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/JS.js":
/*!******************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/JS.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   browserOrNode: () => (/* binding */ browserOrNode),
/* harmony export */   filenameToContentType: () => (/* binding */ filenameToContentType),
/* harmony export */   generateRandomString: () => (/* binding */ generateRandomString),
/* harmony export */   isEmpty: () => (/* binding */ isEmpty),
/* harmony export */   isStrictObject: () => (/* binding */ isStrictObject),
/* harmony export */   isTextFile: () => (/* binding */ isTextFile),
/* harmony export */   isWebWorker: () => (/* binding */ isWebWorker),
/* harmony export */   makeQuerablePromise: () => (/* binding */ makeQuerablePromise),
/* harmony export */   objectLessAttributes: () => (/* binding */ objectLessAttributes),
/* harmony export */   sortByField: () => (/* binding */ sortByField),
/* harmony export */   transferKeyToLowerCase: () => (/* binding */ transferKeyToLowerCase),
/* harmony export */   transferKeyToUpperCase: () => (/* binding */ transferKeyToUpperCase)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var MIME_MAP = [
    { type: 'text/plain', ext: 'txt' },
    { type: 'text/html', ext: 'html' },
    { type: 'text/javascript', ext: 'js' },
    { type: 'text/css', ext: 'css' },
    { type: 'text/csv', ext: 'csv' },
    { type: 'text/yaml', ext: 'yml' },
    { type: 'text/yaml', ext: 'yaml' },
    { type: 'text/calendar', ext: 'ics' },
    { type: 'text/calendar', ext: 'ical' },
    { type: 'image/apng', ext: 'apng' },
    { type: 'image/bmp', ext: 'bmp' },
    { type: 'image/gif', ext: 'gif' },
    { type: 'image/x-icon', ext: 'ico' },
    { type: 'image/x-icon', ext: 'cur' },
    { type: 'image/jpeg', ext: 'jpg' },
    { type: 'image/jpeg', ext: 'jpeg' },
    { type: 'image/jpeg', ext: 'jfif' },
    { type: 'image/jpeg', ext: 'pjp' },
    { type: 'image/jpeg', ext: 'pjpeg' },
    { type: 'image/png', ext: 'png' },
    { type: 'image/svg+xml', ext: 'svg' },
    { type: 'image/tiff', ext: 'tif' },
    { type: 'image/tiff', ext: 'tiff' },
    { type: 'image/webp', ext: 'webp' },
    { type: 'application/json', ext: 'json' },
    { type: 'application/xml', ext: 'xml' },
    { type: 'application/x-sh', ext: 'sh' },
    { type: 'application/zip', ext: 'zip' },
    { type: 'application/x-rar-compressed', ext: 'rar' },
    { type: 'application/x-tar', ext: 'tar' },
    { type: 'application/x-bzip', ext: 'bz' },
    { type: 'application/x-bzip2', ext: 'bz2' },
    { type: 'application/pdf', ext: 'pdf' },
    { type: 'application/java-archive', ext: 'jar' },
    { type: 'application/msword', ext: 'doc' },
    { type: 'application/vnd.ms-excel', ext: 'xls' },
    { type: 'application/vnd.ms-excel', ext: 'xlsx' },
    { type: 'message/rfc822', ext: 'eml' },
];
var isEmpty = function (obj) {
    if (obj === void 0) { obj = {}; }
    return Object.keys(obj).length === 0;
};
var sortByField = function (list, field, dir) {
    if (!list || !list.sort) {
        return false;
    }
    var dirX = dir && dir === 'desc' ? -1 : 1;
    list.sort(function (a, b) {
        var a_val = a[field];
        var b_val = b[field];
        if (typeof b_val === 'undefined') {
            return typeof a_val === 'undefined' ? 0 : 1 * dirX;
        }
        if (typeof a_val === 'undefined') {
            return -1 * dirX;
        }
        if (a_val < b_val) {
            return -1 * dirX;
        }
        if (a_val > b_val) {
            return 1 * dirX;
        }
        return 0;
    });
    return true;
};
var objectLessAttributes = function (obj, less) {
    var ret = Object.assign({}, obj);
    if (less) {
        if (typeof less === 'string') {
            delete ret[less];
        }
        else {
            less.forEach(function (attr) {
                delete ret[attr];
            });
        }
    }
    return ret;
};
var filenameToContentType = function (filename, defVal) {
    if (defVal === void 0) { defVal = 'application/octet-stream'; }
    var name = filename.toLowerCase();
    var filtered = MIME_MAP.filter(function (mime) { return name.endsWith('.' + mime.ext); });
    return filtered.length > 0 ? filtered[0].type : defVal;
};
var isTextFile = function (contentType) {
    var type = contentType.toLowerCase();
    if (type.startsWith('text/')) {
        return true;
    }
    return ('application/json' === type ||
        'application/xml' === type ||
        'application/sh' === type);
};
var generateRandomString = function () {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 32; i > 0; i -= 1) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};
var makeQuerablePromise = function (promise) {
    if (promise.isResolved)
        return promise;
    var isPending = true;
    var isRejected = false;
    var isFullfilled = false;
    var result = promise.then(function (data) {
        isFullfilled = true;
        isPending = false;
        return data;
    }, function (e) {
        isRejected = true;
        isPending = false;
        throw e;
    });
    result.isFullfilled = function () { return isFullfilled; };
    result.isPending = function () { return isPending; };
    result.isRejected = function () { return isRejected; };
    return result;
};
var isWebWorker = function () {
    if (typeof self === 'undefined') {
        return false;
    }
    var selfContext = self;
    return (typeof selfContext.WorkerGlobalScope !== 'undefined' &&
        self instanceof selfContext.WorkerGlobalScope);
};
var browserOrNode = function () {
    var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    var isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
    return {
        isBrowser: isBrowser,
        isNode: isNode,
    };
};
/**
 * transfer the first letter of the keys to lowercase
 * @param {Object} obj - the object need to be transferred
 * @param {Array} whiteListForItself - whitelist itself from being transferred
 * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
 */
var transferKeyToLowerCase = function (obj, whiteListForItself, whiteListForChildren) {
    if (whiteListForItself === void 0) { whiteListForItself = []; }
    if (whiteListForChildren === void 0) { whiteListForChildren = []; }
    if (!isStrictObject(obj))
        return obj;
    var ret = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var transferedKey = whiteListForItself.includes(key)
                ? key
                : key[0].toLowerCase() + key.slice(1);
            ret[transferedKey] = whiteListForChildren.includes(key)
                ? obj[key]
                : transferKeyToLowerCase(obj[key], whiteListForItself, whiteListForChildren);
        }
    }
    return ret;
};
/**
 * transfer the first letter of the keys to lowercase
 * @param {Object} obj - the object need to be transferred
 * @param {Array} whiteListForItself - whitelist itself from being transferred
 * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
 */
var transferKeyToUpperCase = function (obj, whiteListForItself, whiteListForChildren) {
    if (whiteListForItself === void 0) { whiteListForItself = []; }
    if (whiteListForChildren === void 0) { whiteListForChildren = []; }
    if (!isStrictObject(obj))
        return obj;
    var ret = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var transferredKey = whiteListForItself.includes(key)
                ? key
                : key[0].toUpperCase() + key.slice(1);
            ret[transferredKey] = whiteListForChildren.includes(key)
                ? obj[key]
                : transferKeyToUpperCase(obj[key], whiteListForItself, whiteListForChildren);
        }
    }
    return ret;
};
/**
 * Return true if the object is a strict object
 * which means it's not Array, Function, Number, String, Boolean or Null
 * @param obj the Object
 */
var isStrictObject = function (obj) {
    return (obj instanceof Object &&
        !(obj instanceof Array) &&
        !(obj instanceof Function) &&
        !(obj instanceof Number) &&
        !(obj instanceof String) &&
        !(obj instanceof Boolean));
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js":
/*!************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConsoleLogger: () => (/* binding */ ConsoleLogger),
/* harmony export */   LOG_TYPE: () => (/* binding */ LOG_TYPE)
/* harmony export */ });
/* harmony import */ var _Util_Constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Util/Constants */ "./node_modules/@aws-amplify/core/lib-esm/Util/Constants.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __values = (undefined && undefined.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

var LOG_LEVELS = {
    VERBOSE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5,
};
var LOG_TYPE;
(function (LOG_TYPE) {
    LOG_TYPE["DEBUG"] = "DEBUG";
    LOG_TYPE["ERROR"] = "ERROR";
    LOG_TYPE["INFO"] = "INFO";
    LOG_TYPE["WARN"] = "WARN";
    LOG_TYPE["VERBOSE"] = "VERBOSE";
})(LOG_TYPE || (LOG_TYPE = {}));
/**
 * Write logs
 * @class Logger
 */
var ConsoleLogger = /** @class */ (function () {
    /**
     * @constructor
     * @param {string} name - Name of the logger
     */
    function ConsoleLogger(name, level) {
        if (level === void 0) { level = LOG_TYPE.WARN; }
        this.name = name;
        this.level = level;
        this._pluggables = [];
    }
    ConsoleLogger.prototype._padding = function (n) {
        return n < 10 ? '0' + n : '' + n;
    };
    ConsoleLogger.prototype._ts = function () {
        var dt = new Date();
        return ([this._padding(dt.getMinutes()), this._padding(dt.getSeconds())].join(':') +
            '.' +
            dt.getMilliseconds());
    };
    ConsoleLogger.prototype.configure = function (config) {
        if (!config)
            return this._config;
        this._config = config;
        return this._config;
    };
    /**
     * Write log
     * @method
     * @memeberof Logger
     * @param {LOG_TYPE|string} type - log type, default INFO
     * @param {string|object} msg - Logging message or object
     */
    ConsoleLogger.prototype._log = function (type) {
        var e_1, _a;
        var msg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            msg[_i - 1] = arguments[_i];
        }
        var logger_level_name = this.level;
        if (ConsoleLogger.LOG_LEVEL) {
            logger_level_name = ConsoleLogger.LOG_LEVEL;
        }
        if (typeof window !== 'undefined' && window.LOG_LEVEL) {
            logger_level_name = window.LOG_LEVEL;
        }
        var logger_level = LOG_LEVELS[logger_level_name];
        var type_level = LOG_LEVELS[type];
        if (!(type_level >= logger_level)) {
            // Do nothing if type is not greater than or equal to logger level (handle undefined)
            return;
        }
        var log = console.log.bind(console);
        if (type === LOG_TYPE.ERROR && console.error) {
            log = console.error.bind(console);
        }
        if (type === LOG_TYPE.WARN && console.warn) {
            log = console.warn.bind(console);
        }
        var prefix = "[".concat(type, "] ").concat(this._ts(), " ").concat(this.name);
        var message = '';
        if (msg.length === 1 && typeof msg[0] === 'string') {
            message = "".concat(prefix, " - ").concat(msg[0]);
            log(message);
        }
        else if (msg.length === 1) {
            message = "".concat(prefix, " ").concat(msg[0]);
            log(prefix, msg[0]);
        }
        else if (typeof msg[0] === 'string') {
            var obj = msg.slice(1);
            if (obj.length === 1) {
                obj = obj[0];
            }
            message = "".concat(prefix, " - ").concat(msg[0], " ").concat(obj);
            log("".concat(prefix, " - ").concat(msg[0]), obj);
        }
        else {
            message = "".concat(prefix, " ").concat(msg);
            log(prefix, msg);
        }
        try {
            for (var _b = __values(this._pluggables), _c = _b.next(); !_c.done; _c = _b.next()) {
                var plugin = _c.value;
                var logEvent = { message: message, timestamp: Date.now() };
                plugin.pushLogs([logEvent]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Write General log. Default to INFO
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    ConsoleLogger.prototype.log = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LOG_TYPE.INFO], __read(msg), false));
    };
    /**
     * Write INFO log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    ConsoleLogger.prototype.info = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LOG_TYPE.INFO], __read(msg), false));
    };
    /**
     * Write WARN log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    ConsoleLogger.prototype.warn = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LOG_TYPE.WARN], __read(msg), false));
    };
    /**
     * Write ERROR log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    ConsoleLogger.prototype.error = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LOG_TYPE.ERROR], __read(msg), false));
    };
    /**
     * Write DEBUG log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    ConsoleLogger.prototype.debug = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LOG_TYPE.DEBUG], __read(msg), false));
    };
    /**
     * Write VERBOSE log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    ConsoleLogger.prototype.verbose = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        this._log.apply(this, __spreadArray([LOG_TYPE.VERBOSE], __read(msg), false));
    };
    ConsoleLogger.prototype.addPluggable = function (pluggable) {
        if (pluggable && pluggable.getCategoryName() === _Util_Constants__WEBPACK_IMPORTED_MODULE_0__.AWS_CLOUDWATCH_CATEGORY) {
            this._pluggables.push(pluggable);
            pluggable.configure(this._config);
        }
    };
    ConsoleLogger.prototype.listPluggables = function () {
        return this._pluggables;
    };
    ConsoleLogger.LOG_LEVEL = null;
    return ConsoleLogger;
}());


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/FacebookOAuth.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/FacebookOAuth.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FacebookOAuth: () => (/* binding */ FacebookOAuth)
/* harmony export */ });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../JS */ "./node_modules/@aws-amplify/core/lib-esm/JS.js");
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Util */ "./node_modules/@aws-amplify/core/lib-esm/Util/Retry.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0



var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('CognitoCredentials');
var waitForInit = new Promise(function (res, rej) {
    if (!(0,_JS__WEBPACK_IMPORTED_MODULE_1__.browserOrNode)().isBrowser) {
        logger.debug('not in the browser, directly resolved');
        return res();
    }
    var fb = window['FB'];
    if (fb) {
        logger.debug('FB SDK already loaded');
        return res();
    }
    else {
        setTimeout(function () {
            return res();
        }, 2000);
    }
});
var FacebookOAuth = /** @class */ (function () {
    function FacebookOAuth() {
        this.initialized = false;
        this.refreshFacebookToken = this.refreshFacebookToken.bind(this);
        this._refreshFacebookTokenImpl = this._refreshFacebookTokenImpl.bind(this);
    }
    FacebookOAuth.prototype.refreshFacebookToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        logger.debug('need to wait for the Facebook SDK loaded');
                        return [4 /*yield*/, waitForInit];
                    case 1:
                        _a.sent();
                        this.initialized = true;
                        logger.debug('finish waiting');
                        _a.label = 2;
                    case 2: return [2 /*return*/, this._refreshFacebookTokenImpl()];
                }
            });
        });
    };
    FacebookOAuth.prototype._refreshFacebookTokenImpl = function () {
        var fb = null;
        if ((0,_JS__WEBPACK_IMPORTED_MODULE_1__.browserOrNode)().isBrowser)
            fb = window['FB'];
        if (!fb) {
            var errorMessage = 'no fb sdk available';
            logger.debug(errorMessage);
            return Promise.reject(new _Util__WEBPACK_IMPORTED_MODULE_2__.NonRetryableError(errorMessage));
        }
        return new Promise(function (res, rej) {
            fb.getLoginStatus(function (fbResponse) {
                if (!fbResponse || !fbResponse.authResponse) {
                    var errorMessage = 'no response from facebook when refreshing the jwt token';
                    logger.debug(errorMessage);
                    // There is no definitive indication for a network error in
                    // fbResponse, so we are treating it as an invalid token.
                    rej(new _Util__WEBPACK_IMPORTED_MODULE_2__.NonRetryableError(errorMessage));
                }
                else {
                    var response = fbResponse.authResponse;
                    var accessToken = response.accessToken, expiresIn = response.expiresIn;
                    var date = new Date();
                    var expires_at = expiresIn * 1000 + date.getTime();
                    if (!accessToken) {
                        var errorMessage = 'the jwtToken is undefined';
                        logger.debug(errorMessage);
                        rej(new _Util__WEBPACK_IMPORTED_MODULE_2__.NonRetryableError(errorMessage));
                    }
                    res({
                        token: accessToken,
                        expires_at: expires_at,
                    });
                }
            }, { scope: 'public_profile,email' });
        });
    };
    return FacebookOAuth;
}());



/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/GoogleOAuth.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/GoogleOAuth.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GoogleOAuth: () => (/* binding */ GoogleOAuth)
/* harmony export */ });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../JS */ "./node_modules/@aws-amplify/core/lib-esm/JS.js");
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Util */ "./node_modules/@aws-amplify/core/lib-esm/Util/Retry.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0



var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('CognitoCredentials');
var waitForInit = new Promise(function (res, rej) {
    if (!(0,_JS__WEBPACK_IMPORTED_MODULE_1__.browserOrNode)().isBrowser) {
        logger.debug('not in the browser, directly resolved');
        return res();
    }
    var ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;
    if (ga) {
        logger.debug('google api already loaded');
        return res();
    }
    else {
        setTimeout(function () {
            return res();
        }, 2000);
    }
});
var GoogleOAuth = /** @class */ (function () {
    function GoogleOAuth() {
        this.initialized = false;
        this.refreshGoogleToken = this.refreshGoogleToken.bind(this);
        this._refreshGoogleTokenImpl = this._refreshGoogleTokenImpl.bind(this);
    }
    GoogleOAuth.prototype.refreshGoogleToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        logger.debug('need to wait for the Google SDK loaded');
                        return [4 /*yield*/, waitForInit];
                    case 1:
                        _a.sent();
                        this.initialized = true;
                        logger.debug('finish waiting');
                        _a.label = 2;
                    case 2: return [2 /*return*/, this._refreshGoogleTokenImpl()];
                }
            });
        });
    };
    GoogleOAuth.prototype._refreshGoogleTokenImpl = function () {
        var ga = null;
        if ((0,_JS__WEBPACK_IMPORTED_MODULE_1__.browserOrNode)().isBrowser)
            ga = window['gapi'] && window['gapi'].auth2 ? window['gapi'].auth2 : null;
        if (!ga) {
            logger.debug('no gapi auth2 available');
            return Promise.reject('no gapi auth2 available');
        }
        return new Promise(function (res, rej) {
            ga.getAuthInstance()
                .then(function (googleAuth) {
                if (!googleAuth) {
                    logger.debug('google Auth undefined');
                    rej(new _Util__WEBPACK_IMPORTED_MODULE_2__.NonRetryableError('google Auth undefined'));
                }
                var googleUser = googleAuth.currentUser.get();
                // refresh the token
                if (googleUser.isSignedIn()) {
                    logger.debug('refreshing the google access token');
                    googleUser
                        .reloadAuthResponse()
                        .then(function (authResponse) {
                        var id_token = authResponse.id_token, expires_at = authResponse.expires_at;
                        res({ token: id_token, expires_at: expires_at });
                    })
                        .catch(function (err) {
                        if (err && err.error === 'network_error') {
                            // Not using NonRetryableError so handler will be retried
                            rej('Network error reloading google auth response');
                        }
                        else {
                            rej(new _Util__WEBPACK_IMPORTED_MODULE_2__.NonRetryableError('Failed to reload google auth response'));
                        }
                    });
                }
                else {
                    rej(new _Util__WEBPACK_IMPORTED_MODULE_2__.NonRetryableError('User is not signed in with Google'));
                }
            })
                .catch(function (err) {
                logger.debug('Failed to refresh google token', err);
                rej(new _Util__WEBPACK_IMPORTED_MODULE_2__.NonRetryableError('Failed to refresh google token'));
            });
        });
    };
    return GoogleOAuth;
}());



/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/index.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FacebookOAuth: () => (/* binding */ FacebookOAuth),
/* harmony export */   GoogleOAuth: () => (/* binding */ GoogleOAuth)
/* harmony export */ });
/* harmony import */ var _GoogleOAuth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GoogleOAuth */ "./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/GoogleOAuth.js");
/* harmony import */ var _FacebookOAuth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FacebookOAuth */ "./node_modules/@aws-amplify/core/lib-esm/OAuthHelper/FacebookOAuth.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


var GoogleOAuth = new _GoogleOAuth__WEBPACK_IMPORTED_MODULE_0__.GoogleOAuth();
var FacebookOAuth = new _FacebookOAuth__WEBPACK_IMPORTED_MODULE_1__.FacebookOAuth();


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detectFramework.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detectFramework.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearCache: () => (/* binding */ clearCache),
/* harmony export */   detectFramework: () => (/* binding */ detectFramework),
/* harmony export */   frameworkChangeObservers: () => (/* binding */ frameworkChangeObservers),
/* harmony export */   observeFrameworkChanges: () => (/* binding */ observeFrameworkChanges)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types */ "./node_modules/@aws-amplify/core/lib-esm/Platform/types.js");
/* harmony import */ var _detection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./detection */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/index.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


// We want to cache detection since the framework won't change
var frameworkCache;
var frameworkChangeObservers = [];
// Setup the detection reset tracking / timeout delays
var resetTriggered = false;
var SSR_RESET_TIMEOUT = 10; // ms
var WEB_RESET_TIMEOUT = 10; // ms
var PRIME_FRAMEWORK_DELAY = 1000; // ms
var detectFramework = function () {
    if (!frameworkCache) {
        frameworkCache = (0,_detection__WEBPACK_IMPORTED_MODULE_0__.detect)();
        if (resetTriggered) {
            // The final run of detectFramework:
            // Starting from this point, the `frameworkCache` becomes "final".
            // So we don't need to notify the observers again so the observer
            // can be removed after the final notice.
            while (frameworkChangeObservers.length) {
                frameworkChangeObservers.pop()();
            }
        }
        else {
            // The first run of detectFramework:
            // Every time we update the cache, call each observer function
            frameworkChangeObservers.forEach(function (fcn) { return fcn(); });
        }
        // Retry once for either Unknown type after a delay (explained below)
        resetTimeout(_types__WEBPACK_IMPORTED_MODULE_1__.Framework.ServerSideUnknown, SSR_RESET_TIMEOUT);
        resetTimeout(_types__WEBPACK_IMPORTED_MODULE_1__.Framework.WebUnknown, WEB_RESET_TIMEOUT);
    }
    return frameworkCache;
};
/**
 * @internal Setup observer callback that will be called everytime the framework changes
 */
var observeFrameworkChanges = function (fcn) {
    // When the `frameworkCache` won't be updated again, we ignore all incoming
    // observers.
    if (resetTriggered) {
        return;
    }
    frameworkChangeObservers.push(fcn);
};
function clearCache() {
    frameworkCache = undefined;
}
// For a framework type and a delay amount, setup the event to re-detect
//   During the runtime boot, it is possible that framework detection will
//   be triggered before the framework has made modifications to the
//   global/window/etc needed for detection. When no framework is detected
//   we will reset and try again to ensure we don't use a cached
//   non-framework detection result for all requests.
function resetTimeout(framework, delay) {
    if (frameworkCache === framework && !resetTriggered) {
        setTimeout(function () {
            clearCache();
            resetTriggered = true;
            setTimeout(detectFramework, PRIME_FRAMEWORK_DELAY);
        }, delay);
    }
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Angular.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Angular.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   angularSSRDetect: () => (/* binding */ angularSSRDetect),
/* harmony export */   angularWebDetect: () => (/* binding */ angularWebDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with @angular/core 16.0.0
function angularWebDetect() {
    var angularVersionSetInDocument = Boolean((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.documentExists)() && document.querySelector('[ng-version]'));
    var angularContentSetInWindow = Boolean(
    // @ts-ignore
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.windowExists)() && typeof window['ng'] !== 'undefined');
    return angularVersionSetInDocument || angularContentSetInWindow;
}
function angularSSRDetect() {
    var _a;
    return (((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.processExists)() &&
        typeof process.env === 'object' &&
        ((_a = process.env['npm_lifecycle_script']) === null || _a === void 0 ? void 0 : _a.startsWith('ng '))) ||
        false);
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Expo.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Expo.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   expoDetect: () => (/* binding */ expoDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with expo 48 / react-native 0.71.3
function expoDetect() {
    // @ts-ignore
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.globalExists)() && typeof __webpack_require__.g['expo'] !== 'undefined';
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Next.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Next.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   nextSSRDetect: () => (/* binding */ nextSSRDetect),
/* harmony export */   nextWebDetect: () => (/* binding */ nextWebDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with next 13.4 / react 18.2
function nextWebDetect() {
    // @ts-ignore
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.windowExists)() && window['next'] && typeof window['next'] === 'object';
}
function nextSSRDetect() {
    return ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.globalExists)() &&
        ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.keyPrefixMatch)(__webpack_require__.g, '__next') || (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.keyPrefixMatch)(__webpack_require__.g, '__NEXT')));
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Nuxt.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Nuxt.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   nuxtSSRDetect: () => (/* binding */ nuxtSSRDetect),
/* harmony export */   nuxtWebDetect: () => (/* binding */ nuxtWebDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with nuxt 2.15 / vue 2.7
function nuxtWebDetect() {
    return ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.windowExists)() &&
        // @ts-ignore
        (window['__NUXT__'] !== undefined || window['$nuxt'] !== undefined));
}
function nuxtSSRDetect() {
    // @ts-ignore
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.globalExists)() && typeof __webpack_require__.g['__NUXT_PATHS__'] !== 'undefined';
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/React.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/React.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   reactSSRDetect: () => (/* binding */ reactSSRDetect),
/* harmony export */   reactWebDetect: () => (/* binding */ reactWebDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with react 18.2 - built using Vite
function reactWebDetect() {
    var elementKeyPrefixedWithReact = function (key) {
        return key.startsWith('_react') || key.startsWith('__react');
    };
    var elementIsReactEnabled = function (element) {
        return Object.keys(element).find(elementKeyPrefixedWithReact);
    };
    var allElementsWithId = function () { return Array.from(document.querySelectorAll('[id]')); };
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.documentExists)() && allElementsWithId().some(elementIsReactEnabled);
}
function reactSSRDetect() {
    return ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.processExists)() &&
        typeof process.env !== 'undefined' &&
        !!Object.keys(process.env).find(function (key) { return key.includes('react'); }));
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/ReactNative.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/ReactNative.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   reactNativeDetect: () => (/* binding */ reactNativeDetect)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with react-native 0.17.7
function reactNativeDetect() {
    return (typeof navigator !== 'undefined' &&
        typeof navigator.product !== 'undefined' &&
        navigator.product === 'ReactNative');
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Svelte.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Svelte.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   svelteSSRDetect: () => (/* binding */ svelteSSRDetect),
/* harmony export */   svelteWebDetect: () => (/* binding */ svelteWebDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with svelte 3.59
function svelteWebDetect() {
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.windowExists)() && (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.keyPrefixMatch)(window, '__SVELTE');
}
function svelteSSRDetect() {
    return ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.processExists)() &&
        typeof process.env !== 'undefined' &&
        !!Object.keys(process.env).find(function (key) { return key.includes('svelte'); }));
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Vue.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Vue.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vueSSRDetect: () => (/* binding */ vueSSRDetect),
/* harmony export */   vueWebDetect: () => (/* binding */ vueWebDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with vue 3.3.2
function vueWebDetect() {
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.windowExists)() && (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.keyPrefixMatch)(window, '__VUE');
}
function vueSSRDetect() {
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.globalExists)() && (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.keyPrefixMatch)(__webpack_require__.g, '__VUE');
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Web.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Web.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   webDetect: () => (/* binding */ webDetect)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

function webDetect() {
    return (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.windowExists)();
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/helpers.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   documentExists: () => (/* binding */ documentExists),
/* harmony export */   globalExists: () => (/* binding */ globalExists),
/* harmony export */   globalThisExists: () => (/* binding */ globalThisExists),
/* harmony export */   keyPrefixMatch: () => (/* binding */ keyPrefixMatch),
/* harmony export */   processExists: () => (/* binding */ processExists),
/* harmony export */   windowExists: () => (/* binding */ windowExists)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var globalExists = function () {
    return typeof __webpack_require__.g !== 'undefined';
};
var globalThisExists = function () {
    return typeof globalThis !== 'undefined';
};
var windowExists = function () {
    return typeof window !== 'undefined';
};
var documentExists = function () {
    return typeof document !== 'undefined';
};
var processExists = function () {
    return typeof process !== 'undefined';
};
var keyPrefixMatch = function (object, prefix) {
    return !!Object.keys(object).find(function (key) { return key.startsWith(prefix); });
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/index.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/detection/index.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   detect: () => (/* binding */ detect)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types */ "./node_modules/@aws-amplify/core/lib-esm/Platform/types.js");
/* harmony import */ var _React__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./React */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/React.js");
/* harmony import */ var _Vue__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Vue */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Vue.js");
/* harmony import */ var _Svelte__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Svelte */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Svelte.js");
/* harmony import */ var _Next__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Next */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Next.js");
/* harmony import */ var _Nuxt__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Nuxt */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Nuxt.js");
/* harmony import */ var _Angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Angular */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Angular.js");
/* harmony import */ var _ReactNative__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ReactNative */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/ReactNative.js");
/* harmony import */ var _Expo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Expo */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Expo.js");
/* harmony import */ var _Web__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Web */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detection/Web.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0










// These are in the order of detection where when both are detectable, the early Framework will be reported
var detectionMap = [
    // First, detect mobile
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.Expo, detectionMethod: _Expo__WEBPACK_IMPORTED_MODULE_1__.expoDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.ReactNative, detectionMethod: _ReactNative__WEBPACK_IMPORTED_MODULE_2__.reactNativeDetect },
    // Next, detect web frameworks
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.NextJs, detectionMethod: _Next__WEBPACK_IMPORTED_MODULE_3__.nextWebDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.Nuxt, detectionMethod: _Nuxt__WEBPACK_IMPORTED_MODULE_4__.nuxtWebDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.Angular, detectionMethod: _Angular__WEBPACK_IMPORTED_MODULE_5__.angularWebDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.React, detectionMethod: _React__WEBPACK_IMPORTED_MODULE_6__.reactWebDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.VueJs, detectionMethod: _Vue__WEBPACK_IMPORTED_MODULE_7__.vueWebDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.Svelte, detectionMethod: _Svelte__WEBPACK_IMPORTED_MODULE_8__.svelteWebDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.WebUnknown, detectionMethod: _Web__WEBPACK_IMPORTED_MODULE_9__.webDetect },
    // Last, detect ssr frameworks
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.NextJsSSR, detectionMethod: _Next__WEBPACK_IMPORTED_MODULE_3__.nextSSRDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.NuxtSSR, detectionMethod: _Nuxt__WEBPACK_IMPORTED_MODULE_4__.nuxtSSRDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.ReactSSR, detectionMethod: _React__WEBPACK_IMPORTED_MODULE_6__.reactSSRDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.VueJsSSR, detectionMethod: _Vue__WEBPACK_IMPORTED_MODULE_7__.vueSSRDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.AngularSSR, detectionMethod: _Angular__WEBPACK_IMPORTED_MODULE_5__.angularSSRDetect },
    { platform: _types__WEBPACK_IMPORTED_MODULE_0__.Framework.SvelteSSR, detectionMethod: _Svelte__WEBPACK_IMPORTED_MODULE_8__.svelteSSRDetect },
];
function detect() {
    var _a;
    return (((_a = detectionMap.find(function (detectionEntry) { return detectionEntry.detectionMethod(); })) === null || _a === void 0 ? void 0 : _a.platform) || _types__WEBPACK_IMPORTED_MODULE_0__.Framework.ServerSideUnknown);
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Platform: () => (/* binding */ Platform),
/* harmony export */   getAmplifyUserAgent: () => (/* binding */ getAmplifyUserAgent),
/* harmony export */   getAmplifyUserAgentObject: () => (/* binding */ getAmplifyUserAgentObject)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types */ "./node_modules/@aws-amplify/core/lib-esm/Platform/types.js");
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./version */ "./node_modules/@aws-amplify/core/lib-esm/Platform/version.js");
/* harmony import */ var _detectFramework__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./detectFramework */ "./node_modules/@aws-amplify/core/lib-esm/Platform/detectFramework.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};



var BASE_USER_AGENT = "aws-amplify";
var PlatformBuilder = /** @class */ (function () {
    function PlatformBuilder() {
        this.userAgent = "".concat(BASE_USER_AGENT, "/").concat(_version__WEBPACK_IMPORTED_MODULE_0__.version);
    }
    Object.defineProperty(PlatformBuilder.prototype, "framework", {
        get: function () {
            return (0,_detectFramework__WEBPACK_IMPORTED_MODULE_1__.detectFramework)();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PlatformBuilder.prototype, "isReactNative", {
        get: function () {
            return (this.framework === _types__WEBPACK_IMPORTED_MODULE_2__.Framework.ReactNative ||
                this.framework === _types__WEBPACK_IMPORTED_MODULE_2__.Framework.Expo);
        },
        enumerable: false,
        configurable: true
    });
    PlatformBuilder.prototype.observeFrameworkChanges = function (fcn) {
        (0,_detectFramework__WEBPACK_IMPORTED_MODULE_1__.observeFrameworkChanges)(fcn);
    };
    return PlatformBuilder;
}());
var Platform = new PlatformBuilder();
var getAmplifyUserAgentObject = function (_a) {
    var _b = _a === void 0 ? {} : _a, category = _b.category, action = _b.action, framework = _b.framework;
    var userAgent = [[BASE_USER_AGENT, _version__WEBPACK_IMPORTED_MODULE_0__.version]];
    if (category) {
        userAgent.push([category, action]);
    }
    userAgent.push(['framework', (0,_detectFramework__WEBPACK_IMPORTED_MODULE_1__.detectFramework)()]);
    return userAgent;
};
var getAmplifyUserAgent = function (customUserAgentDetails) {
    var userAgent = getAmplifyUserAgentObject(customUserAgentDetails);
    var userAgentString = userAgent
        .map(function (_a) {
        var _b = __read(_a, 2), agentKey = _b[0], agentValue = _b[1];
        return "".concat(agentKey, "/").concat(agentValue);
    })
        .join(' ');
    return userAgentString;
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/types.js":
/*!******************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/types.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnalyticsAction: () => (/* binding */ AnalyticsAction),
/* harmony export */   ApiAction: () => (/* binding */ ApiAction),
/* harmony export */   AuthAction: () => (/* binding */ AuthAction),
/* harmony export */   Category: () => (/* binding */ Category),
/* harmony export */   DataStoreAction: () => (/* binding */ DataStoreAction),
/* harmony export */   Framework: () => (/* binding */ Framework),
/* harmony export */   GeoAction: () => (/* binding */ GeoAction),
/* harmony export */   InAppMessagingAction: () => (/* binding */ InAppMessagingAction),
/* harmony export */   InteractionsAction: () => (/* binding */ InteractionsAction),
/* harmony export */   PredictionsAction: () => (/* binding */ PredictionsAction),
/* harmony export */   PubSubAction: () => (/* binding */ PubSubAction),
/* harmony export */   PushNotificationAction: () => (/* binding */ PushNotificationAction),
/* harmony export */   StorageAction: () => (/* binding */ StorageAction)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var Framework;
(function (Framework) {
    // < 100 - Web frameworks
    Framework["WebUnknown"] = "0";
    Framework["React"] = "1";
    Framework["NextJs"] = "2";
    Framework["Angular"] = "3";
    Framework["VueJs"] = "4";
    Framework["Nuxt"] = "5";
    Framework["Svelte"] = "6";
    // 100s - Server side frameworks
    Framework["ServerSideUnknown"] = "100";
    Framework["ReactSSR"] = "101";
    Framework["NextJsSSR"] = "102";
    Framework["AngularSSR"] = "103";
    Framework["VueJsSSR"] = "104";
    Framework["NuxtSSR"] = "105";
    Framework["SvelteSSR"] = "106";
    // 200s - Mobile framework
    Framework["ReactNative"] = "201";
    Framework["Expo"] = "202";
})(Framework || (Framework = {}));
var Category;
(function (Category) {
    Category["API"] = "api";
    Category["Auth"] = "auth";
    Category["Analytics"] = "analytics";
    Category["DataStore"] = "datastore";
    Category["Geo"] = "geo";
    Category["InAppMessaging"] = "inappmessaging";
    Category["Interactions"] = "interactions";
    Category["Predictions"] = "predictions";
    Category["PubSub"] = "pubsub";
    Category["PushNotification"] = "pushnotification";
    Category["Storage"] = "storage";
})(Category || (Category = {}));
var AnalyticsAction;
(function (AnalyticsAction) {
    AnalyticsAction["Record"] = "1";
    AnalyticsAction["UpdateEndpoint"] = "2";
})(AnalyticsAction || (AnalyticsAction = {}));
var ApiAction;
(function (ApiAction) {
    ApiAction["GraphQl"] = "1";
    ApiAction["Get"] = "2";
    ApiAction["Post"] = "3";
    ApiAction["Put"] = "4";
    ApiAction["Patch"] = "5";
    ApiAction["Del"] = "6";
    ApiAction["Head"] = "7";
})(ApiAction || (ApiAction = {}));
var AuthAction;
(function (AuthAction) {
    // SignUp = '1',
    // ConfirmSignUp = '2',
    // ResendSignUp = '3',
    // SignIn = '4',
    // GetMFAOptions = '5',
    // GetPreferredMFA = '6',
    // SetPreferredMFA = '7',
    // DisableSMS = '8',
    // EnableSMS = '9',
    // SetupTOTP = '10',
    // VerifyTotpToken = '11',
    // ConfirmSignIn = '12',
    // CompleteNewPassword = '13',
    // SendCustomChallengeAnswer = '14',
    // DeleteUserAttributes = '15',
    // DeleteUser = '16',
    // UpdateUserAttributes = '17',
    // UserAttributes = '18',
    // CurrentUserPoolUser = '19',
    // CurrentAuthenticatedUser = '20',
    // CurrentSession = '21',
    // VerifyUserAttribute = '22',
    // VerifyUserAttributeSubmit = '23',
    // VerifyCurrentUserAttribute = '24',
    // VerifyCurrentUserAttributeSubmit = '25',
    // SignOut = '26',
    // ChangePassword = '27',
    // ForgotPassword = '28',
    // ForgotPasswordSubmit = '29',
    AuthAction["FederatedSignIn"] = "30";
    // CurrentUserInfo = '31',
    // RememberDevice = '32',
    // ForgetDevice = '33',
    // FetchDevices = '34',
})(AuthAction || (AuthAction = {}));
var DataStoreAction;
(function (DataStoreAction) {
    DataStoreAction["Subscribe"] = "1";
    DataStoreAction["GraphQl"] = "2";
})(DataStoreAction || (DataStoreAction = {}));
var GeoAction;
(function (GeoAction) {
    GeoAction["None"] = "0";
})(GeoAction || (GeoAction = {}));
var InAppMessagingAction;
(function (InAppMessagingAction) {
    InAppMessagingAction["None"] = "0";
})(InAppMessagingAction || (InAppMessagingAction = {}));
var InteractionsAction;
(function (InteractionsAction) {
    InteractionsAction["None"] = "0";
})(InteractionsAction || (InteractionsAction = {}));
var PredictionsAction;
(function (PredictionsAction) {
    PredictionsAction["Convert"] = "1";
    PredictionsAction["Identify"] = "2";
    PredictionsAction["Interpret"] = "3";
})(PredictionsAction || (PredictionsAction = {}));
var PubSubAction;
(function (PubSubAction) {
    PubSubAction["Subscribe"] = "1";
})(PubSubAction || (PubSubAction = {}));
var PushNotificationAction;
(function (PushNotificationAction) {
    PushNotificationAction["None"] = "0";
})(PushNotificationAction || (PushNotificationAction = {}));
var StorageAction;
(function (StorageAction) {
    StorageAction["Put"] = "1";
    StorageAction["Get"] = "2";
    StorageAction["List"] = "3";
    StorageAction["Copy"] = "4";
    StorageAction["Remove"] = "5";
    StorageAction["GetProperties"] = "6";
})(StorageAction || (StorageAction = {}));


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Platform/version.js":
/*!********************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Platform/version.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
// generated by genversion
var version = '5.3.11';


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/StorageHelper/index.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/StorageHelper/index.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MemoryStorage: () => (/* binding */ MemoryStorage),
/* harmony export */   StorageHelper: () => (/* binding */ StorageHelper)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var dataMemory = {};
/** @class */
var MemoryStorage = /** @class */ (function () {
    function MemoryStorage() {
    }
    /**
     * This is used to set a specific item in storage
     * @param {string} key - the key for the item
     * @param {object} value - the value
     * @returns {string} value that was set
     */
    MemoryStorage.setItem = function (key, value) {
        dataMemory[key] = value;
        return dataMemory[key];
    };
    /**
     * This is used to get a specific key from storage
     * @param {string} key - the key for the item
     * This is used to clear the storage
     * @returns {string} the data item
     */
    MemoryStorage.getItem = function (key) {
        return Object.prototype.hasOwnProperty.call(dataMemory, key)
            ? dataMemory[key]
            : undefined;
    };
    /**
     * This is used to remove an item from storage
     * @param {string} key - the key being set
     * @returns {string} value - value that was deleted
     */
    MemoryStorage.removeItem = function (key) {
        return delete dataMemory[key];
    };
    /**
     * This is used to clear the storage
     * @returns {string} nothing
     */
    MemoryStorage.clear = function () {
        dataMemory = {};
        return dataMemory;
    };
    return MemoryStorage;
}());

var StorageHelper = /** @class */ (function () {
    /**
     * This is used to get a storage object
     * @returns {object} the storage
     */
    function StorageHelper() {
        try {
            this.storageWindow = window.localStorage;
            this.storageWindow.setItem('aws.amplify.test-ls', 1);
            this.storageWindow.removeItem('aws.amplify.test-ls');
        }
        catch (exception) {
            this.storageWindow = MemoryStorage;
        }
    }
    /**
     * This is used to return the storage
     * @returns {object} the storage
     */
    StorageHelper.prototype.getStorage = function () {
        return this.storageWindow;
    };
    return StorageHelper;
}());



/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/UniversalStorage/index.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/UniversalStorage/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UniversalStorage: () => (/* binding */ UniversalStorage)
/* harmony export */ });
/* harmony import */ var universal_cookie__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! universal-cookie */ "./node_modules/universal-cookie/es6/index.js");
/* harmony import */ var _JS__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../JS */ "./node_modules/@aws-amplify/core/lib-esm/JS.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


var isBrowser = (0,_JS__WEBPACK_IMPORTED_MODULE_0__.browserOrNode)().isBrowser;
var ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;
var UniversalStorage = /** @class */ (function () {
    function UniversalStorage(context) {
        if (context === void 0) { context = {}; }
        this.cookies = new universal_cookie__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this.store = isBrowser ? window.localStorage : Object.create(null);
        this.cookies = context.req
            ? new universal_cookie__WEBPACK_IMPORTED_MODULE_1__["default"](decodeURIComponent(context.req.headers.cookie))
            : new universal_cookie__WEBPACK_IMPORTED_MODULE_1__["default"]();
        Object.assign(this.store, this.cookies.getAll());
    }
    Object.defineProperty(UniversalStorage.prototype, "length", {
        get: function () {
            return Object.entries(this.store).length;
        },
        enumerable: false,
        configurable: true
    });
    UniversalStorage.prototype.clear = function () {
        var _this = this;
        Array.from(new Array(this.length))
            .map(function (_, i) { return _this.key(i); })
            .forEach(function (key) { return _this.removeItem(key); });
    };
    UniversalStorage.prototype.getItem = function (key) {
        return this.getLocalItem(key);
    };
    UniversalStorage.prototype.getLocalItem = function (key) {
        return Object.prototype.hasOwnProperty.call(this.store, key)
            ? this.store[key]
            : null;
    };
    UniversalStorage.prototype.getUniversalItem = function (key) {
        return this.cookies.get(key);
    };
    UniversalStorage.prototype.key = function (index) {
        return Object.keys(this.store)[index];
    };
    UniversalStorage.prototype.removeItem = function (key) {
        this.removeLocalItem(key);
        this.removeUniversalItem(key);
    };
    UniversalStorage.prototype.removeLocalItem = function (key) {
        delete this.store[key];
    };
    UniversalStorage.prototype.removeUniversalItem = function (key) {
        this.cookies.remove(key, {
            path: '/',
        });
    };
    UniversalStorage.prototype.setItem = function (key, value) {
        this.setLocalItem(key, value);
        // keys take the shape:
        //  1. `${ProviderPrefix}.${userPoolClientId}.${username}.${tokenType}
        //  2. `${ProviderPrefix}.${userPoolClientId}.LastAuthUser
        var tokenType = key.split('.').pop();
        var sessionTokenTypes = [
            'LastAuthUser',
            'accessToken',
            // refreshToken originates on the client, but SSR pages won't fail when this expires
            // Note: the new `accessToken` will also be refreshed on the client (since Amplify doesn't set server-side cookies)
            'refreshToken',
            // Required for CognitoUserSession
            'idToken',
            // userData is used when `Auth.currentAuthenticatedUser({ bypassCache: false })`.
            // Can be persisted to speed up calls to `Auth.currentAuthenticatedUser()`
            // 'userData',
            // Ignoring clockDrift on the server for now, but needs testing
            // 'clockDrift',
        ];
        if (sessionTokenTypes.includes(tokenType !== null && tokenType !== void 0 ? tokenType : '')) {
            this.setUniversalItem(key, value, {
                expires: new Date(Date.now() + ONE_YEAR_IN_MS),
            });
        }
    };
    UniversalStorage.prototype.setLocalItem = function (key, value) {
        this.store[key] = value;
    };
    UniversalStorage.prototype.setUniversalItem = function (key, value, options) {
        if (options === void 0) { options = {}; }
        this.cookies.set(key, value, __assign(__assign({}, options), { path: '/', 
            // `httpOnly` cannot be set via JavaScript: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#JavaScript_access_using_Document.cookie
            sameSite: true, 
            // Allow unsecure requests to http://localhost:3000/ when in development.
            secure: isBrowser && window.location.hostname === 'localhost' ? false : true }));
    };
    return UniversalStorage;
}());



/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Util/Constants.js":
/*!******************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Util/Constants.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AWS_CLOUDWATCH_BASE_BUFFER_SIZE: () => (/* binding */ AWS_CLOUDWATCH_BASE_BUFFER_SIZE),
/* harmony export */   AWS_CLOUDWATCH_CATEGORY: () => (/* binding */ AWS_CLOUDWATCH_CATEGORY),
/* harmony export */   AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE: () => (/* binding */ AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE),
/* harmony export */   AWS_CLOUDWATCH_MAX_EVENT_SIZE: () => (/* binding */ AWS_CLOUDWATCH_MAX_EVENT_SIZE),
/* harmony export */   AWS_CLOUDWATCH_PROVIDER_NAME: () => (/* binding */ AWS_CLOUDWATCH_PROVIDER_NAME),
/* harmony export */   NO_CREDS_ERROR_STRING: () => (/* binding */ NO_CREDS_ERROR_STRING),
/* harmony export */   RETRY_ERROR_CODES: () => (/* binding */ RETRY_ERROR_CODES)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Logging constants
var AWS_CLOUDWATCH_BASE_BUFFER_SIZE = 26;
var AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE = 1048576;
var AWS_CLOUDWATCH_MAX_EVENT_SIZE = 256000;
var AWS_CLOUDWATCH_CATEGORY = 'Logging';
var AWS_CLOUDWATCH_PROVIDER_NAME = 'AWSCloudWatch';
var NO_CREDS_ERROR_STRING = 'No credentials';
var RETRY_ERROR_CODES = [
    'ResourceNotFoundException',
    'InvalidSequenceTokenException',
];



/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Util/Retry.js":
/*!**************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Util/Retry.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NonRetryableError: () => (/* binding */ NonRetryableError),
/* harmony export */   isNonRetryableError: () => (/* binding */ isNonRetryableError),
/* harmony export */   jitteredBackoff: () => (/* binding */ jitteredBackoff),
/* harmony export */   jitteredExponentialRetry: () => (/* binding */ jitteredExponentialRetry),
/* harmony export */   retry: () => (/* binding */ retry)
/* harmony export */ });
/* harmony import */ var _Logger_ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Logger/ConsoleLogger */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

var logger = new _Logger_ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('Util');
var NonRetryableError = /** @class */ (function (_super) {
    __extends(NonRetryableError, _super);
    function NonRetryableError(message) {
        var _this = _super.call(this, message) || this;
        _this.nonRetryable = true;
        return _this;
    }
    return NonRetryableError;
}(Error));

var isNonRetryableError = function (obj) {
    var key = 'nonRetryable';
    return obj && obj[key];
};
/**
 * @private
 * Internal use of Amplify only
 */
function retry(functionToRetry, args, delayFn, onTerminate) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            if (typeof functionToRetry !== 'function') {
                throw Error('functionToRetry must be a function');
            }
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var attempt, terminated, timeout, wakeUp, lastError, _loop_1, state_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                attempt = 0;
                                terminated = false;
                                wakeUp = function () { };
                                onTerminate &&
                                    onTerminate.then(function () {
                                        // signal not to try anymore.
                                        terminated = true;
                                        // stop sleeping if we're sleeping.
                                        clearTimeout(timeout);
                                        wakeUp();
                                    });
                                _loop_1 = function () {
                                    var _b, _c, err_1, retryIn_1;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                attempt++;
                                                logger.debug("".concat(functionToRetry.name, " attempt #").concat(attempt, " with this vars: ").concat(JSON.stringify(args)));
                                                _d.label = 1;
                                            case 1:
                                                _d.trys.push([1, 3, , 7]);
                                                _b = {};
                                                _c = resolve;
                                                return [4 /*yield*/, functionToRetry.apply(void 0, __spreadArray([], __read(args), false))];
                                            case 2: return [2 /*return*/, (_b.value = _c.apply(void 0, [_d.sent()]), _b)];
                                            case 3:
                                                err_1 = _d.sent();
                                                lastError = err_1;
                                                logger.debug("error on ".concat(functionToRetry.name), err_1);
                                                if (isNonRetryableError(err_1)) {
                                                    logger.debug("".concat(functionToRetry.name, " non retryable error"), err_1);
                                                    return [2 /*return*/, { value: reject(err_1) }];
                                                }
                                                retryIn_1 = delayFn(attempt, args, err_1);
                                                logger.debug("".concat(functionToRetry.name, " retrying in ").concat(retryIn_1, " ms"));
                                                if (!(retryIn_1 === false || terminated)) return [3 /*break*/, 4];
                                                return [2 /*return*/, { value: reject(err_1) }];
                                            case 4: return [4 /*yield*/, new Promise(function (r) {
                                                    wakeUp = r; // export wakeUp for onTerminate handling
                                                    timeout = setTimeout(wakeUp, retryIn_1);
                                                })];
                                            case 5:
                                                _d.sent();
                                                _d.label = 6;
                                            case 6: return [3 /*break*/, 7];
                                            case 7: return [2 /*return*/];
                                        }
                                    });
                                };
                                _a.label = 1;
                            case 1:
                                if (!!terminated) return [3 /*break*/, 3];
                                return [5 /*yield**/, _loop_1()];
                            case 2:
                                state_1 = _a.sent();
                                if (typeof state_1 === "object")
                                    return [2 /*return*/, state_1.value];
                                return [3 /*break*/, 1];
                            case 3:
                                // reached if terminated while waiting for a timer.
                                reject(lastError);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
var MAX_DELAY_MS = 5 * 60 * 1000;
/**
 * @private
 * Internal use of Amplify only
 */
function jitteredBackoff(maxDelayMs) {
    if (maxDelayMs === void 0) { maxDelayMs = MAX_DELAY_MS; }
    var BASE_TIME_MS = 100;
    var JITTER_FACTOR = 100;
    return function (attempt) {
        var delay = Math.pow(2, attempt) * BASE_TIME_MS + JITTER_FACTOR * Math.random();
        return delay > maxDelayMs ? false : delay;
    };
}
/**
 * @private
 * Internal use of Amplify only
 */
var jitteredExponentialRetry = function (functionToRetry, args, maxDelayMs, onTerminate) {
    if (maxDelayMs === void 0) { maxDelayMs = MAX_DELAY_MS; }
    return retry(functionToRetry, args, jitteredBackoff(maxDelayMs), onTerminate);
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/Util/StringUtils.js":
/*!********************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/Util/StringUtils.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   urlSafeDecode: () => (/* binding */ urlSafeDecode),
/* harmony export */   urlSafeEncode: () => (/* binding */ urlSafeEncode)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function urlSafeEncode(str) {
    return str
        .split('')
        .map(function (char) {
        return char
            .charCodeAt(0)
            .toString(16)
            .padStart(2, '0');
    })
        .join('');
}
function urlSafeDecode(hex) {
    return hex
        .match(/.{2}/g)
        .map(function (char) { return String.fromCharCode(parseInt(char, 16)); })
        .join('');
}


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/endpoints/getDnsSuffix.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/endpoints/getDnsSuffix.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDnsSuffix: () => (/* binding */ getDnsSuffix)
/* harmony export */ });
/* harmony import */ var _partitions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./partitions */ "./node_modules/@aws-amplify/core/lib-esm/clients/endpoints/partitions.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __values = (undefined && undefined.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};

/**
 * Get the AWS Services endpoint URL's DNS suffix for a given region. A typical AWS regional service endpoint URL will
 * follow this pattern: {endpointPrefix}.{region}.{dnsSuffix}. For example, the endpoint URL for Cognito Identity in
 * us-east-1 will be cognito-identity.us-east-1.amazonaws.com. Here the DnsSuffix is `amazonaws.com`.
 *
 * @param region
 * @returns The DNS suffix
 *
 * @internal
 */
var getDnsSuffix = function (region) {
    var e_1, _a;
    var partitions = _partitions__WEBPACK_IMPORTED_MODULE_0__.partitionsInfo.partitions;
    try {
        for (var partitions_1 = __values(partitions), partitions_1_1 = partitions_1.next(); !partitions_1_1.done; partitions_1_1 = partitions_1.next()) {
            var _b = partitions_1_1.value, regions = _b.regions, outputs = _b.outputs, regionRegex = _b.regionRegex;
            var regex = new RegExp(regionRegex);
            if (regions.includes(region) || regex.test(region)) {
                return outputs.dnsSuffix;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (partitions_1_1 && !partitions_1_1.done && (_a = partitions_1.return)) _a.call(partitions_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return _partitions__WEBPACK_IMPORTED_MODULE_0__.defaultPartition.outputs.dnsSuffix;
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/endpoints/partitions.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/endpoints/partitions.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultPartition: () => (/* binding */ defaultPartition),
/* harmony export */   partitionsInfo: () => (/* binding */ partitionsInfo)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Default partition for AWS services. This is used when the region is not provided or the region is not recognized.
 *
 * @internal
 */
var defaultPartition = {
    id: 'aws',
    outputs: {
        dnsSuffix: 'amazonaws.com',
    },
    regionRegex: '^(us|eu|ap|sa|ca|me|af)\\-\\w+\\-\\d+$',
    regions: ['aws-global'],
};
/**
 * This data is adapted from the partition file from AWS SDK shared utilities but remove some contents for bundle size
 * concern. Information removed are `dualStackDnsSuffix`, `supportDualStack`, `supportFIPS`, restricted partitions, and
 * list of regions for each partition other than global regions.
 *
 * * Ref: https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints
 * * Ref: https://github.com/aws/aws-sdk-js-v3/blob/0201baef03c2379f1f6f7150b9d401d4b230d488/packages/util-endpoints/src/lib/aws/partitions.json#L1
 *
 * @internal
 */
var partitionsInfo = {
    partitions: [
        defaultPartition,
        {
            id: 'aws-cn',
            outputs: {
                dnsSuffix: 'amazonaws.com.cn',
            },
            regionRegex: '^cn\\-\\w+\\-\\d+$',
            regions: ['aws-cn-global'],
        },
    ],
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/handlers/fetch.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/handlers/fetch.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchTransferHandler: () => (/* binding */ fetchTransferHandler)
/* harmony export */ });
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! isomorphic-unfetch */ "./node_modules/isomorphic-unfetch/browser.js");
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_memoization__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/memoization */ "./node_modules/@aws-amplify/core/lib-esm/clients/utils/memoization.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
 // TODO: remove this dependency in v6

var shouldSendBody = function (method) {
    return !['HEAD', 'GET', 'DELETE'].includes(method.toUpperCase());
};
var fetchTransferHandler = function (_a, _b) {
    var url = _a.url, method = _a.method, headers = _a.headers, body = _a.body;
    var abortSignal = _b.abortSignal;
    return __awaiter(void 0, void 0, void 0, function () {
        var resp, e_1, responseHeaders, httpResponse, bodyWithMixin;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: headers,
                            body: shouldSendBody(method) ? body : undefined,
                            signal: abortSignal,
                        })];
                case 1:
                    resp = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _e.sent();
                    // TODO: needs to revise error handling in v6
                    // For now this is a thin wrapper over original fetch error similar to cognito-identity-js package.
                    // Ref: https://github.com/aws-amplify/amplify-js/blob/4fbc8c0a2be7526aab723579b4c95b552195a80b/packages/amazon-cognito-identity-js/src/Client.js#L103-L108
                    if (e_1 instanceof TypeError) {
                        throw new Error('Network error');
                    }
                    throw e_1;
                case 3:
                    responseHeaders = {};
                    (_c = resp.headers) === null || _c === void 0 ? void 0 : _c.forEach(function (value, key) {
                        responseHeaders[key.toLowerCase()] = value;
                    });
                    httpResponse = {
                        statusCode: resp.status,
                        headers: responseHeaders,
                        body: null,
                    };
                    bodyWithMixin = Object.assign((_d = resp.body) !== null && _d !== void 0 ? _d : {}, {
                        text: (0,_utils_memoization__WEBPACK_IMPORTED_MODULE_1__.withMemoization)(function () { return resp.text(); }),
                        blob: (0,_utils_memoization__WEBPACK_IMPORTED_MODULE_1__.withMemoization)(function () { return resp.blob(); }),
                        json: (0,_utils_memoization__WEBPACK_IMPORTED_MODULE_1__.withMemoization)(function () { return resp.json(); }),
                    });
                    return [2 /*return*/, __assign(__assign({}, httpResponse), { body: bodyWithMixin })];
            }
        });
    });
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/handlers/unauthenticated.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/handlers/unauthenticated.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   unauthenticatedHandler: () => (/* binding */ unauthenticatedHandler)
/* harmony export */ });
/* harmony import */ var _middleware_retry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../middleware/retry */ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/middleware.js");
/* harmony import */ var _middleware_userAgent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../middleware/userAgent */ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/userAgent/middleware.js");
/* harmony import */ var _internal_composeTransferHandler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal/composeTransferHandler */ "./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeTransferHandler.js");
/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fetch */ "./node_modules/@aws-amplify/core/lib-esm/clients/handlers/fetch.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0




var unauthenticatedHandler = (0,_internal_composeTransferHandler__WEBPACK_IMPORTED_MODULE_0__.composeTransferHandler)(_fetch__WEBPACK_IMPORTED_MODULE_1__.fetchTransferHandler, [_middleware_userAgent__WEBPACK_IMPORTED_MODULE_2__.userAgentMiddleware, _middleware_retry__WEBPACK_IMPORTED_MODULE_3__.retryMiddleware]);


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeServiceApi.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeServiceApi.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeServiceApi: () => (/* binding */ composeServiceApi)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var composeServiceApi = function (transferHandler, serializer, deserializer, defaultConfig) {
    return function (config, input) { return __awaiter(void 0, void 0, void 0, function () {
        var resolvedConfig, endpoint, request, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resolvedConfig = __assign(__assign({}, defaultConfig), config);
                    return [4 /*yield*/, resolvedConfig.endpointResolver(resolvedConfig, input)];
                case 1:
                    endpoint = _a.sent();
                    return [4 /*yield*/, serializer(input, endpoint)];
                case 2:
                    request = _a.sent();
                    return [4 /*yield*/, transferHandler(request, __assign({}, resolvedConfig))];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, deserializer(response)];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeTransferHandler.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/internal/composeTransferHandler.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeTransferHandler: () => (/* binding */ composeTransferHandler)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Compose a transfer handler with a core transfer handler and a list of middleware.
 * @param coreHandler Core transfer handler
 * @param middleware	List of middleware
 * @returns A transfer handler whose option type is the union of the core
 * 	transfer handler's option type and the middleware's option type.
 * @internal
 */
var composeTransferHandler = function (coreHandler, middleware) {
    return function (request, options) {
        var context = {};
        var composedHandler = function (request) { return coreHandler(request, options); };
        for (var i = middleware.length - 1; i >= 0; i--) {
            var m = middleware[i];
            var resolvedMiddleware = m(options);
            composedHandler = resolvedMiddleware(composedHandler, context);
        }
        return composedHandler(request);
    };
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/defaultRetryDecider.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/defaultRetryDecider.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getRetryDecider: () => (/* binding */ getRetryDecider)
/* harmony export */ });
/* harmony import */ var _isClockSkewError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isClockSkewError */ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/isClockSkewError.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

/**
 * Get retry decider function
 * @param errorParser Function to load JavaScript error from HTTP response
 */
var getRetryDecider = function (errorParser) {
    return function (response, error) { return __awaiter(void 0, void 0, void 0, function () {
        var errorCode, _a, statusCode;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(error !== null && error !== void 0)) return [3 /*break*/, 1];
                    _a = error;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, errorParser(response)];
                case 2:
                    _a = (_c.sent());
                    _c.label = 3;
                case 3:
                    errorCode = ((_b = _a) !== null && _b !== void 0 ? _b : {}).name;
                    statusCode = response === null || response === void 0 ? void 0 : response.statusCode;
                    return [2 /*return*/, (isConnectionError(error) ||
                            isThrottlingError(statusCode, errorCode) ||
                            (0,_isClockSkewError__WEBPACK_IMPORTED_MODULE_0__.isClockSkewError)(errorCode) ||
                            isServerSideError(statusCode, errorCode))];
            }
        });
    }); };
};
// reference: https://github.com/aws/aws-sdk-js-v3/blob/ab0e7be36e7e7f8a0c04834357aaad643c7912c3/packages/service-error-classification/src/constants.ts#L22-L37
var THROTTLING_ERROR_CODES = [
    'BandwidthLimitExceeded',
    'EC2ThrottledException',
    'LimitExceededException',
    'PriorRequestNotComplete',
    'ProvisionedThroughputExceededException',
    'RequestLimitExceeded',
    'RequestThrottled',
    'RequestThrottledException',
    'SlowDown',
    'ThrottledException',
    'Throttling',
    'ThrottlingException',
    'TooManyRequestsException',
];
var TIMEOUT_ERROR_CODES = [
    'TimeoutError',
    'RequestTimeout',
    'RequestTimeoutException',
];
var isThrottlingError = function (statusCode, errorCode) {
    return statusCode === 429 || THROTTLING_ERROR_CODES.includes(errorCode);
};
var isConnectionError = function (error) { return (error === null || error === void 0 ? void 0 : error.name) === 'Network error'; };
var isServerSideError = function (statusCode, errorCode) {
    return [500, 502, 503, 504].includes(statusCode) ||
        TIMEOUT_ERROR_CODES.includes(errorCode);
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/isClockSkewError.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/isClockSkewError.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isClockSkewError: () => (/* binding */ isClockSkewError)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// via https://github.com/aws/aws-sdk-js-v3/blob/ab0e7be36e7e7f8a0c04834357aaad643c7912c3/packages/service-error-classification/src/constants.ts#L8
var CLOCK_SKEW_ERROR_CODES = [
    'AuthFailure',
    'InvalidSignatureException',
    'RequestExpired',
    'RequestInTheFuture',
    'RequestTimeTooSkewed',
    'SignatureDoesNotMatch',
    'BadRequestException', // API Gateway
];
/**
 * Given an error code, returns true if it is related to a clock skew error.
 *
 * @param errorCode String representation of some error.
 * @returns True if given error is present in `CLOCK_SKEW_ERROR_CODES`, false otherwise.
 *
 * @internal
 */
var isClockSkewError = function (errorCode) {
    return CLOCK_SKEW_ERROR_CODES.includes(errorCode);
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/jitteredBackoff.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/jitteredBackoff.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jitteredBackoff: () => (/* binding */ jitteredBackoff)
/* harmony export */ });
/* harmony import */ var _Util_Retry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../Util/Retry */ "./node_modules/@aws-amplify/core/lib-esm/Util/Retry.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// TODO: [v6] The separate retry utility is used by Data packages now and will replaced by retry middleware.

var DEFAULT_MAX_DELAY_MS = 5 * 60 * 1000;
var jitteredBackoff = function (attempt) {
    var delayFunction = (0,_Util_Retry__WEBPACK_IMPORTED_MODULE_0__.jitteredBackoff)(DEFAULT_MAX_DELAY_MS);
    var delay = delayFunction(attempt);
    // The delayFunction returns false when the delay is greater than the max delay(5 mins).
    // In this case, the retry middleware will delay 5 mins instead, as a ceiling of the delay.
    return delay === false ? DEFAULT_MAX_DELAY_MS : delay;
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/middleware.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/middleware/retry/middleware.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   retryMiddleware: () => (/* binding */ retryMiddleware)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var DEFAULT_RETRY_ATTEMPTS = 3;
/**
 * Retry middleware
 */
var retryMiddleware = function (_a) {
    var _b = _a.maxAttempts, maxAttempts = _b === void 0 ? DEFAULT_RETRY_ATTEMPTS : _b, retryDecider = _a.retryDecider, computeDelay = _a.computeDelay, abortSignal = _a.abortSignal;
    if (maxAttempts < 1) {
        throw new Error('maxAttempts must be greater than 0');
    }
    return function (next, context) {
        return function retryMiddleware(request) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var error, attemptsCount, response, handleTerminalErrorOrResponse, e_1, delay;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            attemptsCount = (_a = context.attemptsCount) !== null && _a !== void 0 ? _a : 0;
                            handleTerminalErrorOrResponse = function () {
                                if (response) {
                                    addOrIncrementMetadataAttempts(response, attemptsCount);
                                    return response;
                                }
                                else {
                                    addOrIncrementMetadataAttempts(error, attemptsCount);
                                    throw error;
                                }
                            };
                            _b.label = 1;
                        case 1:
                            if (!(!(abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) && attemptsCount < maxAttempts)) return [3 /*break*/, 11];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, next(request)];
                        case 3:
                            response = _b.sent();
                            error = undefined;
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _b.sent();
                            error = e_1;
                            response = undefined;
                            return [3 /*break*/, 5];
                        case 5:
                            // context.attemptsCount may be updated after calling next handler which may retry the request by itself.
                            attemptsCount =
                                context.attemptsCount > attemptsCount
                                    ? context.attemptsCount
                                    : attemptsCount + 1;
                            context.attemptsCount = attemptsCount;
                            return [4 /*yield*/, retryDecider(response, error)];
                        case 6:
                            if (!_b.sent()) return [3 /*break*/, 9];
                            if (!(!(abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) && attemptsCount < maxAttempts)) return [3 /*break*/, 8];
                            delay = computeDelay(attemptsCount);
                            return [4 /*yield*/, cancellableSleep(delay, abortSignal)];
                        case 7:
                            _b.sent();
                            _b.label = 8;
                        case 8: return [3 /*break*/, 1];
                        case 9: return [2 /*return*/, handleTerminalErrorOrResponse()];
                        case 10: return [3 /*break*/, 1];
                        case 11:
                            if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
                                throw new Error('Request aborted.');
                            }
                            else {
                                return [2 /*return*/, handleTerminalErrorOrResponse()];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
    };
};
var cancellableSleep = function (timeoutMs, abortSignal) {
    if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
        return Promise.resolve();
    }
    var timeoutId;
    var sleepPromiseResolveFn;
    var sleepPromise = new Promise(function (resolve) {
        sleepPromiseResolveFn = resolve;
        timeoutId = setTimeout(resolve, timeoutMs);
    });
    abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.addEventListener('abort', function cancelSleep(event) {
        clearTimeout(timeoutId);
        abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.removeEventListener('abort', cancelSleep);
        sleepPromiseResolveFn();
    });
    return sleepPromise;
};
var addOrIncrementMetadataAttempts = function (nextHandlerOutput, attempts) {
    var _a;
    if (Object.prototype.toString.call(nextHandlerOutput) !== '[object Object]') {
        return;
    }
    nextHandlerOutput['$metadata'] = __assign(__assign({}, ((_a = nextHandlerOutput['$metadata']) !== null && _a !== void 0 ? _a : {})), { attempts: attempts });
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/middleware/userAgent/middleware.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/middleware/userAgent/middleware.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   userAgentMiddleware: () => (/* binding */ userAgentMiddleware)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * Middleware injects user agent string to specified header(default to 'x-amz-user-agent'),
 * if the header is not set already.
 *
 * TODO: incorporate new user agent design
 */
var userAgentMiddleware = function (_a) {
    var _b = _a.userAgentHeader, userAgentHeader = _b === void 0 ? 'x-amz-user-agent' : _b, _c = _a.userAgentValue, userAgentValue = _c === void 0 ? '' : _c;
    return function (next) {
        return function userAgentMiddleware(request) {
            return __awaiter(this, void 0, void 0, function () {
                var result, headerName, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(userAgentValue.trim().length === 0)) return [3 /*break*/, 2];
                            return [4 /*yield*/, next(request)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result];
                        case 2:
                            headerName = userAgentHeader.toLowerCase();
                            request.headers[headerName] = request.headers[headerName]
                                ? "".concat(request.headers[headerName], " ").concat(userAgentValue)
                                : userAgentValue;
                            return [4 /*yield*/, next(request)];
                        case 3:
                            response = _a.sent();
                            return [2 /*return*/, response];
                    }
                });
            });
        };
    };
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/json.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/serde/json.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseJsonBody: () => (/* binding */ parseJsonBody),
/* harmony export */   parseJsonError: () => (/* binding */ parseJsonError)
/* harmony export */ });
/* harmony import */ var _responseInfo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./responseInfo */ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/responseInfo.js");
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};

/**
 * Utility functions for serializing and deserializing of JSON protocol in general(including: REST-JSON, JSON-RPC, etc.)
 */
/**
 * Error parser for AWS JSON protocol.
 */
var parseJsonError = function (response) { return __awaiter(void 0, void 0, void 0, function () {
    var body, sanitizeErrorCode, code, message, error;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                if (!response || response.statusCode < 300) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, parseJsonBody(response)];
            case 1:
                body = _f.sent();
                sanitizeErrorCode = function (rawValue) {
                    var _a = __read(rawValue.toString().split(/[\,\:]+/), 1), cleanValue = _a[0];
                    if (cleanValue.includes('#')) {
                        return cleanValue.split('#')[1];
                    }
                    return cleanValue;
                };
                code = sanitizeErrorCode((_c = (_b = (_a = response.headers['x-amzn-errortype']) !== null && _a !== void 0 ? _a : body.code) !== null && _b !== void 0 ? _b : body.__type) !== null && _c !== void 0 ? _c : 'UnknownError');
                message = (_e = (_d = body.message) !== null && _d !== void 0 ? _d : body.Message) !== null && _e !== void 0 ? _e : 'Unknown error';
                error = new Error(message);
                return [2 /*return*/, Object.assign(error, {
                        name: code,
                        $metadata: (0,_responseInfo__WEBPACK_IMPORTED_MODULE_0__.parseMetadata)(response),
                    })];
        }
    });
}); };
/**
 * Parse JSON response body to JavaScript object.
 */
var parseJsonBody = function (response) { return __awaiter(void 0, void 0, void 0, function () {
    var output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!response.body) {
                    throw new Error('Missing response payload');
                }
                return [4 /*yield*/, response.body.json()];
            case 1:
                output = _a.sent();
                return [2 /*return*/, Object.assign(output, {
                        $metadata: (0,_responseInfo__WEBPACK_IMPORTED_MODULE_0__.parseMetadata)(response),
                    })];
        }
    });
}); };


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/serde/responseInfo.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/serde/responseInfo.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseMetadata: () => (/* binding */ parseMetadata)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var parseMetadata = function (response) {
    var _a, _b;
    var headers = response.headers, statusCode = response.statusCode;
    return __assign(__assign({}, (isMetadataBearer(response) ? response.$metadata : {})), { httpStatusCode: statusCode, requestId: (_b = (_a = headers['x-amzn-requestid']) !== null && _a !== void 0 ? _a : headers['x-amzn-request-id']) !== null && _b !== void 0 ? _b : headers['x-amz-request-id'], extendedRequestId: headers['x-amz-id-2'], cfId: headers['x-amz-cf-id'] });
};
var isMetadataBearer = function (response) {
    return typeof (response === null || response === void 0 ? void 0 : response['$metadata']) === 'object';
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/clients/utils/memoization.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/clients/utils/memoization.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   withMemoization: () => (/* binding */ withMemoization)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Cache the payload of a response body. It allows multiple calls to the body,
 * for example, when reading the body in both retry decider and error deserializer.
 * Caching body is allowed here because we call the body accessor(blob(), json(),
 * etc.) when body is small or streaming implementation is not available(RN).
 *
 * @internal
 */
var withMemoization = function (payloadAccessor) {
    var cached;
    return function () {
        if (!cached) {
            // Explicitly not awaiting. Intermediate await would add overhead and
            // introduce a possible race in the event that this wrapper is called
            // again before the first `payloadAccessor` call resolves.
            cached = payloadAccessor();
        }
        return cached;
    };
};


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/constants.js":
/*!*************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/constants.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER: () => (/* binding */ INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER),
/* harmony export */   USER_AGENT_HEADER: () => (/* binding */ USER_AGENT_HEADER)
/* harmony export */ });
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * This Symbol is used to reference an internal-only PubSub provider that
 * is used for AppSync/GraphQL subscriptions in the API category.
 */
var hasSymbol = typeof Symbol !== 'undefined' && typeof Symbol.for === 'function';
var INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER = hasSymbol
    ? Symbol.for('INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER')
    : '@@INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER';
var USER_AGENT_HEADER = 'x-amz-user-agent';


/***/ }),

/***/ "./node_modules/@aws-amplify/core/lib-esm/parseAWSExports.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@aws-amplify/core/lib-esm/parseAWSExports.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseAWSExports: () => (/* binding */ parseAWSExports)
/* harmony export */ });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./node_modules/@aws-amplify/core/lib-esm/Logger/ConsoleLogger.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var logger = new _Logger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger('Parser');
var parseAWSExports = function (config) {
    var amplifyConfig = {};
    // Analytics
    if (config['aws_mobile_analytics_app_id']) {
        var Analytics = {
            AWSPinpoint: {
                appId: config['aws_mobile_analytics_app_id'],
                region: config['aws_mobile_analytics_app_region'],
            },
        };
        amplifyConfig.Analytics = Analytics;
    }
    // Auth
    if (config['aws_cognito_identity_pool_id'] || config['aws_user_pools_id']) {
        amplifyConfig.Auth = {
            userPoolId: config['aws_user_pools_id'],
            userPoolWebClientId: config['aws_user_pools_web_client_id'],
            region: config['aws_cognito_region'],
            identityPoolId: config['aws_cognito_identity_pool_id'],
            identityPoolRegion: config['aws_cognito_region'],
            mandatorySignIn: config['aws_mandatory_sign_in'] === 'enable',
            signUpVerificationMethod: config['aws_cognito_sign_up_verification_method'] || 'code',
        };
    }
    // Storage
    var storageConfig;
    if (config['aws_user_files_s3_bucket']) {
        storageConfig = {
            AWSS3: {
                bucket: config['aws_user_files_s3_bucket'],
                region: config['aws_user_files_s3_bucket_region'],
                dangerouslyConnectToHttpEndpointForTesting: config['aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing'],
            },
        };
    }
    else {
        storageConfig = config ? config.Storage || config : {};
    }
    // Logging
    if (config['Logging']) {
        amplifyConfig.Logging = __assign(__assign({}, config['Logging']), { region: config['aws_project_region'] });
    }
    // Geo
    if (config['geo']) {
        amplifyConfig.Geo = Object.assign({}, config.geo);
        if (config.geo['amazon_location_service']) {
            amplifyConfig.Geo = {
                AmazonLocationService: config.geo['amazon_location_service'],
            };
        }
    }
    amplifyConfig.Analytics = Object.assign({}, amplifyConfig.Analytics, config.Analytics);
    amplifyConfig.Auth = Object.assign({}, amplifyConfig.Auth, config.Auth);
    amplifyConfig.Storage = Object.assign({}, storageConfig);
    amplifyConfig.Logging = Object.assign({}, amplifyConfig.Logging, config.Logging);
    logger.debug('parse config', config, 'to amplifyconfig', amplifyConfig);
    return amplifyConfig;
};


/***/ }),

/***/ "./node_modules/@aws-crypto/sha256-js/build/RawSha256.js":
/*!***************************************************************!*\
  !*** ./node_modules/@aws-crypto/sha256-js/build/RawSha256.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RawSha256 = void 0;
var constants_1 = __webpack_require__(/*! ./constants */ "./node_modules/@aws-crypto/sha256-js/build/constants.js");
/**
 * @internal
 */
var RawSha256 = /** @class */ (function () {
    function RawSha256() {
        this.state = Int32Array.from(constants_1.INIT);
        this.temp = new Int32Array(64);
        this.buffer = new Uint8Array(64);
        this.bufferLength = 0;
        this.bytesHashed = 0;
        /**
         * @internal
         */
        this.finished = false;
    }
    RawSha256.prototype.update = function (data) {
        if (this.finished) {
            throw new Error("Attempted to update an already finished hash.");
        }
        var position = 0;
        var byteLength = data.byteLength;
        this.bytesHashed += byteLength;
        if (this.bytesHashed * 8 > constants_1.MAX_HASHABLE_LENGTH) {
            throw new Error("Cannot hash more than 2^53 - 1 bits");
        }
        while (byteLength > 0) {
            this.buffer[this.bufferLength++] = data[position++];
            byteLength--;
            if (this.bufferLength === constants_1.BLOCK_SIZE) {
                this.hashBuffer();
                this.bufferLength = 0;
            }
        }
    };
    RawSha256.prototype.digest = function () {
        if (!this.finished) {
            var bitsHashed = this.bytesHashed * 8;
            var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
            var undecoratedLength = this.bufferLength;
            bufferView.setUint8(this.bufferLength++, 0x80);
            // Ensure the final block has enough room for the hashed length
            if (undecoratedLength % constants_1.BLOCK_SIZE >= constants_1.BLOCK_SIZE - 8) {
                for (var i = this.bufferLength; i < constants_1.BLOCK_SIZE; i++) {
                    bufferView.setUint8(i, 0);
                }
                this.hashBuffer();
                this.bufferLength = 0;
            }
            for (var i = this.bufferLength; i < constants_1.BLOCK_SIZE - 8; i++) {
                bufferView.setUint8(i, 0);
            }
            bufferView.setUint32(constants_1.BLOCK_SIZE - 8, Math.floor(bitsHashed / 0x100000000), true);
            bufferView.setUint32(constants_1.BLOCK_SIZE - 4, bitsHashed);
            this.hashBuffer();
            this.finished = true;
        }
        // The value in state is little-endian rather than big-endian, so flip
        // each word into a new Uint8Array
        var out = new Uint8Array(constants_1.DIGEST_LENGTH);
        for (var i = 0; i < 8; i++) {
            out[i * 4] = (this.state[i] >>> 24) & 0xff;
            out[i * 4 + 1] = (this.state[i] >>> 16) & 0xff;
            out[i * 4 + 2] = (this.state[i] >>> 8) & 0xff;
            out[i * 4 + 3] = (this.state[i] >>> 0) & 0xff;
        }
        return out;
    };
    RawSha256.prototype.hashBuffer = function () {
        var _a = this, buffer = _a.buffer, state = _a.state;
        var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
        for (var i = 0; i < constants_1.BLOCK_SIZE; i++) {
            if (i < 16) {
                this.temp[i] =
                    ((buffer[i * 4] & 0xff) << 24) |
                        ((buffer[i * 4 + 1] & 0xff) << 16) |
                        ((buffer[i * 4 + 2] & 0xff) << 8) |
                        (buffer[i * 4 + 3] & 0xff);
            }
            else {
                var u = this.temp[i - 2];
                var t1_1 = ((u >>> 17) | (u << 15)) ^ ((u >>> 19) | (u << 13)) ^ (u >>> 10);
                u = this.temp[i - 15];
                var t2_1 = ((u >>> 7) | (u << 25)) ^ ((u >>> 18) | (u << 14)) ^ (u >>> 3);
                this.temp[i] =
                    ((t1_1 + this.temp[i - 7]) | 0) + ((t2_1 + this.temp[i - 16]) | 0);
            }
            var t1 = ((((((state4 >>> 6) | (state4 << 26)) ^
                ((state4 >>> 11) | (state4 << 21)) ^
                ((state4 >>> 25) | (state4 << 7))) +
                ((state4 & state5) ^ (~state4 & state6))) |
                0) +
                ((state7 + ((constants_1.KEY[i] + this.temp[i]) | 0)) | 0)) |
                0;
            var t2 = ((((state0 >>> 2) | (state0 << 30)) ^
                ((state0 >>> 13) | (state0 << 19)) ^
                ((state0 >>> 22) | (state0 << 10))) +
                ((state0 & state1) ^ (state0 & state2) ^ (state1 & state2))) |
                0;
            state7 = state6;
            state6 = state5;
            state5 = state4;
            state4 = (state3 + t1) | 0;
            state3 = state2;
            state2 = state1;
            state1 = state0;
            state0 = (t1 + t2) | 0;
        }
        state[0] += state0;
        state[1] += state1;
        state[2] += state2;
        state[3] += state3;
        state[4] += state4;
        state[5] += state5;
        state[6] += state6;
        state[7] += state7;
    };
    return RawSha256;
}());
exports.RawSha256 = RawSha256;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3U2hhMjU2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1Jhd1NoYTI1Ni50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx5Q0FNcUI7QUFFckI7O0dBRUc7QUFDSDtJQUFBO1FBQ1UsVUFBSyxHQUFlLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQUksQ0FBQyxDQUFDO1FBQzFDLFNBQUksR0FBZSxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxXQUFNLEdBQWUsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFFaEM7O1dBRUc7UUFDSCxhQUFRLEdBQVksS0FBSyxDQUFDO0lBOEk1QixDQUFDO0lBNUlDLDBCQUFNLEdBQU4sVUFBTyxJQUFnQjtRQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBQSxVQUFVLEdBQUssSUFBSSxXQUFULENBQVU7UUFDMUIsSUFBSSxDQUFDLFdBQVcsSUFBSSxVQUFVLENBQUM7UUFFL0IsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRywrQkFBbUIsRUFBRTtZQUM5QyxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7U0FDeEQ7UUFFRCxPQUFPLFVBQVUsR0FBRyxDQUFDLEVBQUU7WUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNwRCxVQUFVLEVBQUUsQ0FBQztZQUViLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxzQkFBVSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZCO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsMEJBQU0sR0FBTjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLElBQU0sVUFBVSxHQUFHLElBQUksUUFBUSxDQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUN2QixDQUFDO1lBRUYsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQzVDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRS9DLCtEQUErRDtZQUMvRCxJQUFJLGlCQUFpQixHQUFHLHNCQUFVLElBQUksc0JBQVUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3BELEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsc0JBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbkQsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzNCO2dCQUNELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7YUFDdkI7WUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLHNCQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2RCxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMzQjtZQUNELFVBQVUsQ0FBQyxTQUFTLENBQ2xCLHNCQUFVLEdBQUcsQ0FBQyxFQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxFQUNwQyxJQUFJLENBQ0wsQ0FBQztZQUNGLFVBQVUsQ0FBQyxTQUFTLENBQUMsc0JBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRWxCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ3RCO1FBRUQsc0VBQXNFO1FBQ3RFLGtDQUFrQztRQUNsQyxJQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBYSxDQUFDLENBQUM7UUFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDM0MsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMvQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzlDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDL0M7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFTyw4QkFBVSxHQUFsQjtRQUNRLElBQUEsS0FBb0IsSUFBSSxFQUF0QixNQUFNLFlBQUEsRUFBRSxLQUFLLFdBQVMsQ0FBQztRQUUvQixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ25CLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNCQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNWLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDOUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDbEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDakMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQzthQUM5QjtpQkFBTTtnQkFDTCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBTSxJQUFFLEdBQ04sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFFbkUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QixJQUFNLElBQUUsR0FDTixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUVqRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDVixDQUFDLENBQUMsSUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2xFO1lBRUQsSUFBTSxFQUFFLEdBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNsQyxDQUFDLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDLENBQUM7Z0JBQ0YsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsZUFBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDLENBQUM7WUFFSixJQUFNLEVBQUUsR0FDTixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDbEMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzlELENBQUMsQ0FBQztZQUVKLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDaEIsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNoQixNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ2hCLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNoQixNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ2hCLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDaEIsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QjtRQUVELEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDbkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUNuQixLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO1FBQ25CLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDbkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUNuQixLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO1FBQ25CLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDbkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBeEpELElBd0pDO0FBeEpZLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQkxPQ0tfU0laRSxcbiAgRElHRVNUX0xFTkdUSCxcbiAgSU5JVCxcbiAgS0VZLFxuICBNQVhfSEFTSEFCTEVfTEVOR1RIXG59IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY2xhc3MgUmF3U2hhMjU2IHtcbiAgcHJpdmF0ZSBzdGF0ZTogSW50MzJBcnJheSA9IEludDMyQXJyYXkuZnJvbShJTklUKTtcbiAgcHJpdmF0ZSB0ZW1wOiBJbnQzMkFycmF5ID0gbmV3IEludDMyQXJyYXkoNjQpO1xuICBwcml2YXRlIGJ1ZmZlcjogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KDY0KTtcbiAgcHJpdmF0ZSBidWZmZXJMZW5ndGg6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgYnl0ZXNIYXNoZWQ6IG51bWJlciA9IDA7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZmluaXNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICB1cGRhdGUoZGF0YTogVWludDhBcnJheSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmZpbmlzaGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdHRlbXB0ZWQgdG8gdXBkYXRlIGFuIGFscmVhZHkgZmluaXNoZWQgaGFzaC5cIik7XG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uID0gMDtcbiAgICBsZXQgeyBieXRlTGVuZ3RoIH0gPSBkYXRhO1xuICAgIHRoaXMuYnl0ZXNIYXNoZWQgKz0gYnl0ZUxlbmd0aDtcblxuICAgIGlmICh0aGlzLmJ5dGVzSGFzaGVkICogOCA+IE1BWF9IQVNIQUJMRV9MRU5HVEgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBoYXNoIG1vcmUgdGhhbiAyXjUzIC0gMSBiaXRzXCIpO1xuICAgIH1cblxuICAgIHdoaWxlIChieXRlTGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5idWZmZXJMZW5ndGgrK10gPSBkYXRhW3Bvc2l0aW9uKytdO1xuICAgICAgYnl0ZUxlbmd0aC0tO1xuXG4gICAgICBpZiAodGhpcy5idWZmZXJMZW5ndGggPT09IEJMT0NLX1NJWkUpIHtcbiAgICAgICAgdGhpcy5oYXNoQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuYnVmZmVyTGVuZ3RoID0gMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkaWdlc3QoKTogVWludDhBcnJheSB7XG4gICAgaWYgKCF0aGlzLmZpbmlzaGVkKSB7XG4gICAgICBjb25zdCBiaXRzSGFzaGVkID0gdGhpcy5ieXRlc0hhc2hlZCAqIDg7XG4gICAgICBjb25zdCBidWZmZXJWaWV3ID0gbmV3IERhdGFWaWV3KFxuICAgICAgICB0aGlzLmJ1ZmZlci5idWZmZXIsXG4gICAgICAgIHRoaXMuYnVmZmVyLmJ5dGVPZmZzZXQsXG4gICAgICAgIHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGhcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IHVuZGVjb3JhdGVkTGVuZ3RoID0gdGhpcy5idWZmZXJMZW5ndGg7XG4gICAgICBidWZmZXJWaWV3LnNldFVpbnQ4KHRoaXMuYnVmZmVyTGVuZ3RoKyssIDB4ODApO1xuXG4gICAgICAvLyBFbnN1cmUgdGhlIGZpbmFsIGJsb2NrIGhhcyBlbm91Z2ggcm9vbSBmb3IgdGhlIGhhc2hlZCBsZW5ndGhcbiAgICAgIGlmICh1bmRlY29yYXRlZExlbmd0aCAlIEJMT0NLX1NJWkUgPj0gQkxPQ0tfU0laRSAtIDgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuYnVmZmVyTGVuZ3RoOyBpIDwgQkxPQ0tfU0laRTsgaSsrKSB7XG4gICAgICAgICAgYnVmZmVyVmlldy5zZXRVaW50OChpLCAwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhc2hCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5idWZmZXJMZW5ndGggPSAwO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5idWZmZXJMZW5ndGg7IGkgPCBCTE9DS19TSVpFIC0gODsgaSsrKSB7XG4gICAgICAgIGJ1ZmZlclZpZXcuc2V0VWludDgoaSwgMCk7XG4gICAgICB9XG4gICAgICBidWZmZXJWaWV3LnNldFVpbnQzMihcbiAgICAgICAgQkxPQ0tfU0laRSAtIDgsXG4gICAgICAgIE1hdGguZmxvb3IoYml0c0hhc2hlZCAvIDB4MTAwMDAwMDAwKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKTtcbiAgICAgIGJ1ZmZlclZpZXcuc2V0VWludDMyKEJMT0NLX1NJWkUgLSA0LCBiaXRzSGFzaGVkKTtcblxuICAgICAgdGhpcy5oYXNoQnVmZmVyKCk7XG5cbiAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRoZSB2YWx1ZSBpbiBzdGF0ZSBpcyBsaXR0bGUtZW5kaWFuIHJhdGhlciB0aGFuIGJpZy1lbmRpYW4sIHNvIGZsaXBcbiAgICAvLyBlYWNoIHdvcmQgaW50byBhIG5ldyBVaW50OEFycmF5XG4gICAgY29uc3Qgb3V0ID0gbmV3IFVpbnQ4QXJyYXkoRElHRVNUX0xFTkdUSCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgIG91dFtpICogNF0gPSAodGhpcy5zdGF0ZVtpXSA+Pj4gMjQpICYgMHhmZjtcbiAgICAgIG91dFtpICogNCArIDFdID0gKHRoaXMuc3RhdGVbaV0gPj4+IDE2KSAmIDB4ZmY7XG4gICAgICBvdXRbaSAqIDQgKyAyXSA9ICh0aGlzLnN0YXRlW2ldID4+PiA4KSAmIDB4ZmY7XG4gICAgICBvdXRbaSAqIDQgKyAzXSA9ICh0aGlzLnN0YXRlW2ldID4+PiAwKSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIHByaXZhdGUgaGFzaEJ1ZmZlcigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGJ1ZmZlciwgc3RhdGUgfSA9IHRoaXM7XG5cbiAgICBsZXQgc3RhdGUwID0gc3RhdGVbMF0sXG4gICAgICBzdGF0ZTEgPSBzdGF0ZVsxXSxcbiAgICAgIHN0YXRlMiA9IHN0YXRlWzJdLFxuICAgICAgc3RhdGUzID0gc3RhdGVbM10sXG4gICAgICBzdGF0ZTQgPSBzdGF0ZVs0XSxcbiAgICAgIHN0YXRlNSA9IHN0YXRlWzVdLFxuICAgICAgc3RhdGU2ID0gc3RhdGVbNl0sXG4gICAgICBzdGF0ZTcgPSBzdGF0ZVs3XTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgQkxPQ0tfU0laRTsgaSsrKSB7XG4gICAgICBpZiAoaSA8IDE2KSB7XG4gICAgICAgIHRoaXMudGVtcFtpXSA9XG4gICAgICAgICAgKChidWZmZXJbaSAqIDRdICYgMHhmZikgPDwgMjQpIHxcbiAgICAgICAgICAoKGJ1ZmZlcltpICogNCArIDFdICYgMHhmZikgPDwgMTYpIHxcbiAgICAgICAgICAoKGJ1ZmZlcltpICogNCArIDJdICYgMHhmZikgPDwgOCkgfFxuICAgICAgICAgIChidWZmZXJbaSAqIDQgKyAzXSAmIDB4ZmYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHUgPSB0aGlzLnRlbXBbaSAtIDJdO1xuICAgICAgICBjb25zdCB0MSA9XG4gICAgICAgICAgKCh1ID4+PiAxNykgfCAodSA8PCAxNSkpIF4gKCh1ID4+PiAxOSkgfCAodSA8PCAxMykpIF4gKHUgPj4+IDEwKTtcblxuICAgICAgICB1ID0gdGhpcy50ZW1wW2kgLSAxNV07XG4gICAgICAgIGNvbnN0IHQyID1cbiAgICAgICAgICAoKHUgPj4+IDcpIHwgKHUgPDwgMjUpKSBeICgodSA+Pj4gMTgpIHwgKHUgPDwgMTQpKSBeICh1ID4+PiAzKTtcblxuICAgICAgICB0aGlzLnRlbXBbaV0gPVxuICAgICAgICAgICgodDEgKyB0aGlzLnRlbXBbaSAtIDddKSB8IDApICsgKCh0MiArIHRoaXMudGVtcFtpIC0gMTZdKSB8IDApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0MSA9XG4gICAgICAgICgoKCgoKHN0YXRlNCA+Pj4gNikgfCAoc3RhdGU0IDw8IDI2KSkgXlxuICAgICAgICAgICgoc3RhdGU0ID4+PiAxMSkgfCAoc3RhdGU0IDw8IDIxKSkgXlxuICAgICAgICAgICgoc3RhdGU0ID4+PiAyNSkgfCAoc3RhdGU0IDw8IDcpKSkgK1xuICAgICAgICAgICgoc3RhdGU0ICYgc3RhdGU1KSBeICh+c3RhdGU0ICYgc3RhdGU2KSkpIHxcbiAgICAgICAgICAwKSArXG4gICAgICAgICAgKChzdGF0ZTcgKyAoKEtFWVtpXSArIHRoaXMudGVtcFtpXSkgfCAwKSkgfCAwKSkgfFxuICAgICAgICAwO1xuXG4gICAgICBjb25zdCB0MiA9XG4gICAgICAgICgoKChzdGF0ZTAgPj4+IDIpIHwgKHN0YXRlMCA8PCAzMCkpIF5cbiAgICAgICAgICAoKHN0YXRlMCA+Pj4gMTMpIHwgKHN0YXRlMCA8PCAxOSkpIF5cbiAgICAgICAgICAoKHN0YXRlMCA+Pj4gMjIpIHwgKHN0YXRlMCA8PCAxMCkpKSArXG4gICAgICAgICAgKChzdGF0ZTAgJiBzdGF0ZTEpIF4gKHN0YXRlMCAmIHN0YXRlMikgXiAoc3RhdGUxICYgc3RhdGUyKSkpIHxcbiAgICAgICAgMDtcblxuICAgICAgc3RhdGU3ID0gc3RhdGU2O1xuICAgICAgc3RhdGU2ID0gc3RhdGU1O1xuICAgICAgc3RhdGU1ID0gc3RhdGU0O1xuICAgICAgc3RhdGU0ID0gKHN0YXRlMyArIHQxKSB8IDA7XG4gICAgICBzdGF0ZTMgPSBzdGF0ZTI7XG4gICAgICBzdGF0ZTIgPSBzdGF0ZTE7XG4gICAgICBzdGF0ZTEgPSBzdGF0ZTA7XG4gICAgICBzdGF0ZTAgPSAodDEgKyB0MikgfCAwO1xuICAgIH1cblxuICAgIHN0YXRlWzBdICs9IHN0YXRlMDtcbiAgICBzdGF0ZVsxXSArPSBzdGF0ZTE7XG4gICAgc3RhdGVbMl0gKz0gc3RhdGUyO1xuICAgIHN0YXRlWzNdICs9IHN0YXRlMztcbiAgICBzdGF0ZVs0XSArPSBzdGF0ZTQ7XG4gICAgc3RhdGVbNV0gKz0gc3RhdGU1O1xuICAgIHN0YXRlWzZdICs9IHN0YXRlNjtcbiAgICBzdGF0ZVs3XSArPSBzdGF0ZTc7XG4gIH1cbn1cbiJdfQ==

/***/ }),

/***/ "./node_modules/@aws-crypto/sha256-js/build/constants.js":
/*!***************************************************************!*\
  !*** ./node_modules/@aws-crypto/sha256-js/build/constants.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MAX_HASHABLE_LENGTH = exports.INIT = exports.KEY = exports.DIGEST_LENGTH = exports.BLOCK_SIZE = void 0;
/**
 * @internal
 */
exports.BLOCK_SIZE = 64;
/**
 * @internal
 */
exports.DIGEST_LENGTH = 32;
/**
 * @internal
 */
exports.KEY = new Uint32Array([
    0x428a2f98,
    0x71374491,
    0xb5c0fbcf,
    0xe9b5dba5,
    0x3956c25b,
    0x59f111f1,
    0x923f82a4,
    0xab1c5ed5,
    0xd807aa98,
    0x12835b01,
    0x243185be,
    0x550c7dc3,
    0x72be5d74,
    0x80deb1fe,
    0x9bdc06a7,
    0xc19bf174,
    0xe49b69c1,
    0xefbe4786,
    0x0fc19dc6,
    0x240ca1cc,
    0x2de92c6f,
    0x4a7484aa,
    0x5cb0a9dc,
    0x76f988da,
    0x983e5152,
    0xa831c66d,
    0xb00327c8,
    0xbf597fc7,
    0xc6e00bf3,
    0xd5a79147,
    0x06ca6351,
    0x14292967,
    0x27b70a85,
    0x2e1b2138,
    0x4d2c6dfc,
    0x53380d13,
    0x650a7354,
    0x766a0abb,
    0x81c2c92e,
    0x92722c85,
    0xa2bfe8a1,
    0xa81a664b,
    0xc24b8b70,
    0xc76c51a3,
    0xd192e819,
    0xd6990624,
    0xf40e3585,
    0x106aa070,
    0x19a4c116,
    0x1e376c08,
    0x2748774c,
    0x34b0bcb5,
    0x391c0cb3,
    0x4ed8aa4a,
    0x5b9cca4f,
    0x682e6ff3,
    0x748f82ee,
    0x78a5636f,
    0x84c87814,
    0x8cc70208,
    0x90befffa,
    0xa4506ceb,
    0xbef9a3f7,
    0xc67178f2
]);
/**
 * @internal
 */
exports.INIT = [
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19
];
/**
 * @internal
 */
exports.MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7R0FFRztBQUNVLFFBQUEsVUFBVSxHQUFXLEVBQUUsQ0FBQztBQUVyQzs7R0FFRztBQUNVLFFBQUEsYUFBYSxHQUFXLEVBQUUsQ0FBQztBQUV4Qzs7R0FFRztBQUNVLFFBQUEsR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDO0lBQ2pDLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7Q0FDWCxDQUFDLENBQUM7QUFFSDs7R0FFRztBQUNVLFFBQUEsSUFBSSxHQUFHO0lBQ2xCLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0lBQ1YsVUFBVTtJQUNWLFVBQVU7SUFDVixVQUFVO0NBQ1gsQ0FBQztBQUVGOztHQUVHO0FBQ1UsUUFBQSxtQkFBbUIsR0FBRyxTQUFBLENBQUMsRUFBSSxFQUFFLENBQUEsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY29uc3QgQkxPQ0tfU0laRTogbnVtYmVyID0gNjQ7XG5cbi8qKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBjb25zdCBESUdFU1RfTEVOR1RIOiBudW1iZXIgPSAzMjtcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNvbnN0IEtFWSA9IG5ldyBVaW50MzJBcnJheShbXG4gIDB4NDI4YTJmOTgsXG4gIDB4NzEzNzQ0OTEsXG4gIDB4YjVjMGZiY2YsXG4gIDB4ZTliNWRiYTUsXG4gIDB4Mzk1NmMyNWIsXG4gIDB4NTlmMTExZjEsXG4gIDB4OTIzZjgyYTQsXG4gIDB4YWIxYzVlZDUsXG4gIDB4ZDgwN2FhOTgsXG4gIDB4MTI4MzViMDEsXG4gIDB4MjQzMTg1YmUsXG4gIDB4NTUwYzdkYzMsXG4gIDB4NzJiZTVkNzQsXG4gIDB4ODBkZWIxZmUsXG4gIDB4OWJkYzA2YTcsXG4gIDB4YzE5YmYxNzQsXG4gIDB4ZTQ5YjY5YzEsXG4gIDB4ZWZiZTQ3ODYsXG4gIDB4MGZjMTlkYzYsXG4gIDB4MjQwY2ExY2MsXG4gIDB4MmRlOTJjNmYsXG4gIDB4NGE3NDg0YWEsXG4gIDB4NWNiMGE5ZGMsXG4gIDB4NzZmOTg4ZGEsXG4gIDB4OTgzZTUxNTIsXG4gIDB4YTgzMWM2NmQsXG4gIDB4YjAwMzI3YzgsXG4gIDB4YmY1OTdmYzcsXG4gIDB4YzZlMDBiZjMsXG4gIDB4ZDVhNzkxNDcsXG4gIDB4MDZjYTYzNTEsXG4gIDB4MTQyOTI5NjcsXG4gIDB4MjdiNzBhODUsXG4gIDB4MmUxYjIxMzgsXG4gIDB4NGQyYzZkZmMsXG4gIDB4NTMzODBkMTMsXG4gIDB4NjUwYTczNTQsXG4gIDB4NzY2YTBhYmIsXG4gIDB4ODFjMmM5MmUsXG4gIDB4OTI3MjJjODUsXG4gIDB4YTJiZmU4YTEsXG4gIDB4YTgxYTY2NGIsXG4gIDB4YzI0YjhiNzAsXG4gIDB4Yzc2YzUxYTMsXG4gIDB4ZDE5MmU4MTksXG4gIDB4ZDY5OTA2MjQsXG4gIDB4ZjQwZTM1ODUsXG4gIDB4MTA2YWEwNzAsXG4gIDB4MTlhNGMxMTYsXG4gIDB4MWUzNzZjMDgsXG4gIDB4Mjc0ODc3NGMsXG4gIDB4MzRiMGJjYjUsXG4gIDB4MzkxYzBjYjMsXG4gIDB4NGVkOGFhNGEsXG4gIDB4NWI5Y2NhNGYsXG4gIDB4NjgyZTZmZjMsXG4gIDB4NzQ4ZjgyZWUsXG4gIDB4NzhhNTYzNmYsXG4gIDB4ODRjODc4MTQsXG4gIDB4OGNjNzAyMDgsXG4gIDB4OTBiZWZmZmEsXG4gIDB4YTQ1MDZjZWIsXG4gIDB4YmVmOWEzZjcsXG4gIDB4YzY3MTc4ZjJcbl0pO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY29uc3QgSU5JVCA9IFtcbiAgMHg2YTA5ZTY2NyxcbiAgMHhiYjY3YWU4NSxcbiAgMHgzYzZlZjM3MixcbiAgMHhhNTRmZjUzYSxcbiAgMHg1MTBlNTI3ZixcbiAgMHg5YjA1Njg4YyxcbiAgMHgxZjgzZDlhYixcbiAgMHg1YmUwY2QxOVxuXTtcblxuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNvbnN0IE1BWF9IQVNIQUJMRV9MRU5HVEggPSAyICoqIDUzIC0gMTtcbiJdfQ==

/***/ }),

/***/ "./node_modules/@aws-crypto/sha256-js/build/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/@aws-crypto/sha256-js/build/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/@aws-crypto/sha256-js/node_modules/tslib/tslib.es6.js");
(0, tslib_1.__exportStar)(__webpack_require__(/*! ./jsSha256 */ "./node_modules/@aws-crypto/sha256-js/build/jsSha256.js"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMERBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0ICogZnJvbSBcIi4vanNTaGEyNTZcIjtcbiJdfQ==

/***/ }),

/***/ "./node_modules/@aws-crypto/sha256-js/build/jsSha256.js":
/*!**************************************************************!*\
  !*** ./node_modules/@aws-crypto/sha256-js/build/jsSha256.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sha256 = void 0;
var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/@aws-crypto/sha256-js/node_modules/tslib/tslib.es6.js");
var constants_1 = __webpack_require__(/*! ./constants */ "./node_modules/@aws-crypto/sha256-js/build/constants.js");
var RawSha256_1 = __webpack_require__(/*! ./RawSha256 */ "./node_modules/@aws-crypto/sha256-js/build/RawSha256.js");
var util_1 = __webpack_require__(/*! @aws-crypto/util */ "./node_modules/@aws-crypto/util/build/index.js");
var Sha256 = /** @class */ (function () {
    function Sha256(secret) {
        this.hash = new RawSha256_1.RawSha256();
        if (secret) {
            this.outer = new RawSha256_1.RawSha256();
            var inner = bufferFromSecret(secret);
            var outer = new Uint8Array(constants_1.BLOCK_SIZE);
            outer.set(inner);
            for (var i = 0; i < constants_1.BLOCK_SIZE; i++) {
                inner[i] ^= 0x36;
                outer[i] ^= 0x5c;
            }
            this.hash.update(inner);
            this.outer.update(outer);
            // overwrite the copied key in memory
            for (var i = 0; i < inner.byteLength; i++) {
                inner[i] = 0;
            }
        }
    }
    Sha256.prototype.update = function (toHash) {
        if ((0, util_1.isEmptyData)(toHash) || this.error) {
            return;
        }
        try {
            this.hash.update((0, util_1.convertToBuffer)(toHash));
        }
        catch (e) {
            this.error = e;
        }
    };
    /* This synchronous method keeps compatibility
     * with the v2 aws-sdk.
     */
    Sha256.prototype.digestSync = function () {
        if (this.error) {
            throw this.error;
        }
        if (this.outer) {
            if (!this.outer.finished) {
                this.outer.update(this.hash.digest());
            }
            return this.outer.digest();
        }
        return this.hash.digest();
    };
    /* The underlying digest method here is synchronous.
     * To keep the same interface with the other hash functions
     * the default is to expose this as an async method.
     * However, it can sometimes be useful to have a sync method.
     */
    Sha256.prototype.digest = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            return (0, tslib_1.__generator)(this, function (_a) {
                return [2 /*return*/, this.digestSync()];
            });
        });
    };
    return Sha256;
}());
exports.Sha256 = Sha256;
function bufferFromSecret(secret) {
    var input = (0, util_1.convertToBuffer)(secret);
    if (input.byteLength > constants_1.BLOCK_SIZE) {
        var bufferHash = new RawSha256_1.RawSha256();
        bufferHash.update(input);
        input = bufferHash.digest();
    }
    var buffer = new Uint8Array(constants_1.BLOCK_SIZE);
    buffer.set(input);
    return buffer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNTaGEyNTYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvanNTaGEyNTYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLHlDQUF5QztBQUN6Qyx5Q0FBd0M7QUFFeEMseUNBQWdFO0FBRWhFO0lBS0UsZ0JBQVksTUFBbUI7UUFKZCxTQUFJLEdBQUcsSUFBSSxxQkFBUyxFQUFFLENBQUM7UUFLdEMsSUFBSSxNQUFNLEVBQUU7WUFDVixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO1lBQzdCLElBQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLElBQU0sS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLHNCQUFVLENBQUMsQ0FBQztZQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWpCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxzQkFBVSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO2dCQUNqQixLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO2FBQ2xCO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekIscUNBQXFDO1lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2Q7U0FDRjtJQUNILENBQUM7SUFFRCx1QkFBTSxHQUFOLFVBQU8sTUFBa0I7UUFDdkIsSUFBSSxJQUFBLGtCQUFXLEVBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNyQyxPQUFPO1NBQ1I7UUFFRCxJQUFJO1lBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBQSxzQkFBZSxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDM0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsMkJBQVUsR0FBVjtRQUNFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNkLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNsQjtRQUVELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQzVCO1FBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0csdUJBQU0sR0FBWjs7O2dCQUNFLHNCQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQzs7O0tBQzFCO0lBQ0gsYUFBQztBQUFELENBQUMsQUFsRUQsSUFrRUM7QUFsRVksd0JBQU07QUFvRW5CLFNBQVMsZ0JBQWdCLENBQUMsTUFBa0I7SUFDMUMsSUFBSSxLQUFLLEdBQUcsSUFBQSxzQkFBZSxFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBDLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxzQkFBVSxFQUFFO1FBQ2pDLElBQU0sVUFBVSxHQUFHLElBQUkscUJBQVMsRUFBRSxDQUFDO1FBQ25DLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsS0FBSyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUM3QjtJQUVELElBQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLHNCQUFVLENBQUMsQ0FBQztJQUMxQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xCLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCTE9DS19TSVpFIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBSYXdTaGEyNTYgfSBmcm9tIFwiLi9SYXdTaGEyNTZcIjtcbmltcG9ydCB7IEhhc2gsIFNvdXJjZURhdGEgfSBmcm9tIFwiQGF3cy1zZGsvdHlwZXNcIjtcbmltcG9ydCB7IGlzRW1wdHlEYXRhLCBjb252ZXJ0VG9CdWZmZXIgfSBmcm9tIFwiQGF3cy1jcnlwdG8vdXRpbFwiO1xuXG5leHBvcnQgY2xhc3MgU2hhMjU2IGltcGxlbWVudHMgSGFzaCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgaGFzaCA9IG5ldyBSYXdTaGEyNTYoKTtcbiAgcHJpdmF0ZSByZWFkb25seSBvdXRlcj86IFJhd1NoYTI1NjtcbiAgcHJpdmF0ZSBlcnJvcjogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHNlY3JldD86IFNvdXJjZURhdGEpIHtcbiAgICBpZiAoc2VjcmV0KSB7XG4gICAgICB0aGlzLm91dGVyID0gbmV3IFJhd1NoYTI1NigpO1xuICAgICAgY29uc3QgaW5uZXIgPSBidWZmZXJGcm9tU2VjcmV0KHNlY3JldCk7XG4gICAgICBjb25zdCBvdXRlciA9IG5ldyBVaW50OEFycmF5KEJMT0NLX1NJWkUpO1xuICAgICAgb3V0ZXIuc2V0KGlubmVyKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBCTE9DS19TSVpFOyBpKyspIHtcbiAgICAgICAgaW5uZXJbaV0gXj0gMHgzNjtcbiAgICAgICAgb3V0ZXJbaV0gXj0gMHg1YztcbiAgICAgIH1cblxuICAgICAgdGhpcy5oYXNoLnVwZGF0ZShpbm5lcik7XG4gICAgICB0aGlzLm91dGVyLnVwZGF0ZShvdXRlcik7XG5cbiAgICAgIC8vIG92ZXJ3cml0ZSB0aGUgY29waWVkIGtleSBpbiBtZW1vcnlcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5uZXIuYnl0ZUxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlubmVyW2ldID0gMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGUodG9IYXNoOiBTb3VyY2VEYXRhKTogdm9pZCB7XG4gICAgaWYgKGlzRW1wdHlEYXRhKHRvSGFzaCkgfHwgdGhpcy5lcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICB0aGlzLmhhc2gudXBkYXRlKGNvbnZlcnRUb0J1ZmZlcih0b0hhc2gpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmVycm9yID0gZTtcbiAgICB9XG4gIH1cblxuICAvKiBUaGlzIHN5bmNocm9ub3VzIG1ldGhvZCBrZWVwcyBjb21wYXRpYmlsaXR5XG4gICAqIHdpdGggdGhlIHYyIGF3cy1zZGsuXG4gICAqL1xuICBkaWdlc3RTeW5jKCk6IFVpbnQ4QXJyYXkge1xuICAgIGlmICh0aGlzLmVycm9yKSB7XG4gICAgICB0aHJvdyB0aGlzLmVycm9yO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm91dGVyKSB7XG4gICAgICBpZiAoIXRoaXMub3V0ZXIuZmluaXNoZWQpIHtcbiAgICAgICAgdGhpcy5vdXRlci51cGRhdGUodGhpcy5oYXNoLmRpZ2VzdCgpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMub3V0ZXIuZGlnZXN0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaGFzaC5kaWdlc3QoKTtcbiAgfVxuXG4gIC8qIFRoZSB1bmRlcmx5aW5nIGRpZ2VzdCBtZXRob2QgaGVyZSBpcyBzeW5jaHJvbm91cy5cbiAgICogVG8ga2VlcCB0aGUgc2FtZSBpbnRlcmZhY2Ugd2l0aCB0aGUgb3RoZXIgaGFzaCBmdW5jdGlvbnNcbiAgICogdGhlIGRlZmF1bHQgaXMgdG8gZXhwb3NlIHRoaXMgYXMgYW4gYXN5bmMgbWV0aG9kLlxuICAgKiBIb3dldmVyLCBpdCBjYW4gc29tZXRpbWVzIGJlIHVzZWZ1bCB0byBoYXZlIGEgc3luYyBtZXRob2QuXG4gICAqL1xuICBhc3luYyBkaWdlc3QoKTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgcmV0dXJuIHRoaXMuZGlnZXN0U3luYygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJ1ZmZlckZyb21TZWNyZXQoc2VjcmV0OiBTb3VyY2VEYXRhKTogVWludDhBcnJheSB7XG4gIGxldCBpbnB1dCA9IGNvbnZlcnRUb0J1ZmZlcihzZWNyZXQpO1xuXG4gIGlmIChpbnB1dC5ieXRlTGVuZ3RoID4gQkxPQ0tfU0laRSkge1xuICAgIGNvbnN0IGJ1ZmZlckhhc2ggPSBuZXcgUmF3U2hhMjU2KCk7XG4gICAgYnVmZmVySGFzaC51cGRhdGUoaW5wdXQpO1xuICAgIGlucHV0ID0gYnVmZmVySGFzaC5kaWdlc3QoKTtcbiAgfVxuXG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KEJMT0NLX1NJWkUpO1xuICBidWZmZXIuc2V0KGlucHV0KTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cbiJdfQ==

/***/ }),

/***/ "./node_modules/@aws-crypto/sha256-js/node_modules/tslib/tslib.es6.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@aws-crypto/sha256-js/node_modules/tslib/tslib.es6.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __assign: () => (/* binding */ __assign),
/* harmony export */   __asyncDelegator: () => (/* binding */ __asyncDelegator),
/* harmony export */   __asyncGenerator: () => (/* binding */ __asyncGenerator),
/* harmony export */   __asyncValues: () => (/* binding */ __asyncValues),
/* harmony export */   __await: () => (/* binding */ __await),
/* harmony export */   __awaiter: () => (/* binding */ __awaiter),
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   __createBinding: () => (/* binding */ __createBinding),
/* harmony export */   __decorate: () => (/* binding */ __decorate),
/* harmony export */   __exportStar: () => (/* binding */ __exportStar),
/* harmony export */   __extends: () => (/* binding */ __extends),
/* harmony export */   __generator: () => (/* binding */ __generator),
/* harmony export */   __importDefault: () => (/* binding */ __importDefault),
/* harmony export */   __importStar: () => (/* binding */ __importStar),
/* harmony export */   __makeTemplateObject: () => (/* binding */ __makeTemplateObject),
/* harmony export */   __metadata: () => (/* binding */ __metadata),
/* harmony export */   __param: () => (/* binding */ __param),
/* harmony export */   __read: () => (/* binding */ __read),
/* harmony export */   __rest: () => (/* binding */ __rest),
/* harmony export */   __spread: () => (/* binding */ __spread),
/* harmony export */   __spreadArrays: () => (/* binding */ __spreadArrays),
/* harmony export */   __values: () => (/* binding */ __values)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),

/***/ "./node_modules/@aws-crypto/util/build/convertToBuffer.js":
/*!****************************************************************!*\
  !*** ./node_modules/@aws-crypto/util/build/convertToBuffer.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertToBuffer = void 0;
var util_utf8_browser_1 = __webpack_require__(/*! @aws-sdk/util-utf8-browser */ "./node_modules/@aws-sdk/util-utf8-browser/dist/es/index.js");
// Quick polyfill
var fromUtf8 = typeof Buffer !== "undefined" && Buffer.from
    ? function (input) { return Buffer.from(input, "utf8"); }
    : util_utf8_browser_1.fromUtf8;
function convertToBuffer(data) {
    // Already a Uint8, do nothing
    if (data instanceof Uint8Array)
        return data;
    if (typeof data === "string") {
        return fromUtf8(data);
    }
    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
}
exports.convertToBuffer = convertToBuffer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydFRvQnVmZmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnZlcnRUb0J1ZmZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0VBQW9FO0FBQ3BFLHNDQUFzQzs7O0FBR3RDLGdFQUF5RTtBQUV6RSxpQkFBaUI7QUFDakIsSUFBTSxRQUFRLEdBQ1osT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJO0lBQzFDLENBQUMsQ0FBQyxVQUFDLEtBQWEsSUFBSyxPQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUExQixDQUEwQjtJQUMvQyxDQUFDLENBQUMsNEJBQWUsQ0FBQztBQUV0QixTQUFnQixlQUFlLENBQUMsSUFBZ0I7SUFDOUMsOEJBQThCO0lBQzlCLElBQUksSUFBSSxZQUFZLFVBQVU7UUFBRSxPQUFPLElBQUksQ0FBQztJQUU1QyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUM1QixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN2QjtJQUVELElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM1QixPQUFPLElBQUksVUFBVSxDQUNuQixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQy9DLENBQUM7S0FDSDtJQUVELE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQWpCRCwwQ0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgQW1hem9uLmNvbSBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcblxuaW1wb3J0IHsgU291cmNlRGF0YSB9IGZyb20gXCJAYXdzLXNkay90eXBlc1wiO1xuaW1wb3J0IHsgZnJvbVV0ZjggYXMgZnJvbVV0ZjhCcm93c2VyIH0gZnJvbSBcIkBhd3Mtc2RrL3V0aWwtdXRmOC1icm93c2VyXCI7XG5cbi8vIFF1aWNrIHBvbHlmaWxsXG5jb25zdCBmcm9tVXRmOCA9XG4gIHR5cGVvZiBCdWZmZXIgIT09IFwidW5kZWZpbmVkXCIgJiYgQnVmZmVyLmZyb21cbiAgICA/IChpbnB1dDogc3RyaW5nKSA9PiBCdWZmZXIuZnJvbShpbnB1dCwgXCJ1dGY4XCIpXG4gICAgOiBmcm9tVXRmOEJyb3dzZXI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VG9CdWZmZXIoZGF0YTogU291cmNlRGF0YSk6IFVpbnQ4QXJyYXkge1xuICAvLyBBbHJlYWR5IGEgVWludDgsIGRvIG5vdGhpbmdcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBVaW50OEFycmF5KSByZXR1cm4gZGF0YTtcblxuICBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gZnJvbVV0ZjgoZGF0YSk7XG4gIH1cblxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGRhdGEpKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KFxuICAgICAgZGF0YS5idWZmZXIsXG4gICAgICBkYXRhLmJ5dGVPZmZzZXQsXG4gICAgICBkYXRhLmJ5dGVMZW5ndGggLyBVaW50OEFycmF5LkJZVEVTX1BFUl9FTEVNRU5UXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcbn1cbiJdfQ==

/***/ }),

/***/ "./node_modules/@aws-crypto/util/build/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@aws-crypto/util/build/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.uint32ArrayFrom = exports.numToUint8 = exports.isEmptyData = exports.convertToBuffer = void 0;
var convertToBuffer_1 = __webpack_require__(/*! ./convertToBuffer */ "./node_modules/@aws-crypto/util/build/convertToBuffer.js");
Object.defineProperty(exports, "convertToBuffer", ({ enumerable: true, get: function () { return convertToBuffer_1.convertToBuffer; } }));
var isEmptyData_1 = __webpack_require__(/*! ./isEmptyData */ "./node_modules/@aws-crypto/util/build/isEmptyData.js");
Object.defineProperty(exports, "isEmptyData", ({ enumerable: true, get: function () { return isEmptyData_1.isEmptyData; } }));
var numToUint8_1 = __webpack_require__(/*! ./numToUint8 */ "./node_modules/@aws-crypto/util/build/numToUint8.js");
Object.defineProperty(exports, "numToUint8", ({ enumerable: true, get: function () { return numToUint8_1.numToUint8; } }));
var uint32ArrayFrom_1 = __webpack_require__(/*! ./uint32ArrayFrom */ "./node_modules/@aws-crypto/util/build/uint32ArrayFrom.js");
Object.defineProperty(exports, "uint32ArrayFrom", ({ enumerable: true, get: function () { return uint32ArrayFrom_1.uint32ArrayFrom; } }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLG9FQUFvRTtBQUNwRSxzQ0FBc0M7OztBQUV0QyxxREFBb0Q7QUFBM0Msa0hBQUEsZUFBZSxPQUFBO0FBQ3hCLDZDQUE0QztBQUFuQywwR0FBQSxXQUFXLE9BQUE7QUFDcEIsMkNBQTBDO0FBQWpDLHdHQUFBLFVBQVUsT0FBQTtBQUNuQixxREFBa0Q7QUFBMUMsa0hBQUEsZUFBZSxPQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IEFtYXpvbi5jb20gSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG5cbmV4cG9ydCB7IGNvbnZlcnRUb0J1ZmZlciB9IGZyb20gXCIuL2NvbnZlcnRUb0J1ZmZlclwiO1xuZXhwb3J0IHsgaXNFbXB0eURhdGEgfSBmcm9tIFwiLi9pc0VtcHR5RGF0YVwiO1xuZXhwb3J0IHsgbnVtVG9VaW50OCB9IGZyb20gXCIuL251bVRvVWludDhcIjtcbmV4cG9ydCB7dWludDMyQXJyYXlGcm9tfSBmcm9tICcuL3VpbnQzMkFycmF5RnJvbSc7XG4iXX0=

/***/ }),

/***/ "./node_modules/@aws-crypto/util/build/isEmptyData.js":
/*!************************************************************!*\
  !*** ./node_modules/@aws-crypto/util/build/isEmptyData.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isEmptyData = void 0;
function isEmptyData(data) {
    if (typeof data === "string") {
        return data.length === 0;
    }
    return data.byteLength === 0;
}
exports.isEmptyData = isEmptyData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNFbXB0eURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaXNFbXB0eURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLG9FQUFvRTtBQUNwRSxzQ0FBc0M7OztBQUl0QyxTQUFnQixXQUFXLENBQUMsSUFBZ0I7SUFDMUMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztLQUMxQjtJQUVELE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQU5ELGtDQU1DIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IEFtYXpvbi5jb20gSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG5cbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tIFwiQGF3cy1zZGsvdHlwZXNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHlEYXRhKGRhdGE6IFNvdXJjZURhdGEpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIGRhdGEubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgcmV0dXJuIGRhdGEuYnl0ZUxlbmd0aCA9PT0gMDtcbn1cbiJdfQ==

/***/ }),

/***/ "./node_modules/@aws-crypto/util/build/numToUint8.js":
/*!***********************************************************!*\
  !*** ./node_modules/@aws-crypto/util/build/numToUint8.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.numToUint8 = void 0;
function numToUint8(num) {
    return new Uint8Array([
        (num & 0xff000000) >> 24,
        (num & 0x00ff0000) >> 16,
        (num & 0x0000ff00) >> 8,
        num & 0x000000ff,
    ]);
}
exports.numToUint8 = numToUint8;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtVG9VaW50OC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9udW1Ub1VpbnQ4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxvRUFBb0U7QUFDcEUsc0NBQXNDOzs7QUFFdEMsU0FBZ0IsVUFBVSxDQUFDLEdBQVc7SUFDcEMsT0FBTyxJQUFJLFVBQVUsQ0FBQztRQUNwQixDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFO1FBQ3hCLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUU7UUFDeEIsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUN2QixHQUFHLEdBQUcsVUFBVTtLQUNqQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBUEQsZ0NBT0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgQW1hem9uLmNvbSBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcblxuZXhwb3J0IGZ1bmN0aW9uIG51bVRvVWludDgobnVtOiBudW1iZXIpIHtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KFtcbiAgICAobnVtICYgMHhmZjAwMDAwMCkgPj4gMjQsXG4gICAgKG51bSAmIDB4MDBmZjAwMDApID4+IDE2LFxuICAgIChudW0gJiAweDAwMDBmZjAwKSA+PiA4LFxuICAgIG51bSAmIDB4MDAwMDAwZmYsXG4gIF0pO1xufVxuIl19

/***/ }),

/***/ "./node_modules/@aws-crypto/util/build/uint32ArrayFrom.js":
/*!****************************************************************!*\
  !*** ./node_modules/@aws-crypto/util/build/uint32ArrayFrom.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.uint32ArrayFrom = void 0;
// IE 11 does not support Array.from, so we do it manually
function uint32ArrayFrom(a_lookUpTable) {
    if (!Array.from) {
        var return_array = new Uint32Array(a_lookUpTable.length);
        var a_index = 0;
        while (a_index < a_lookUpTable.length) {
            return_array[a_index] = a_lookUpTable[a_index];
        }
        return return_array;
    }
    return Uint32Array.from(a_lookUpTable);
}
exports.uint32ArrayFrom = uint32ArrayFrom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWludDMyQXJyYXlGcm9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3VpbnQzMkFycmF5RnJvbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsb0VBQW9FO0FBQ3BFLHNDQUFzQzs7O0FBRXRDLDBEQUEwRDtBQUMxRCxTQUFnQixlQUFlLENBQUMsYUFBNEI7SUFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDZixJQUFNLFlBQVksR0FBRyxJQUFJLFdBQVcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDMUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFBO1FBQ2YsT0FBTyxPQUFPLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUNyQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQy9DO1FBQ0QsT0FBTyxZQUFZLENBQUE7S0FDcEI7SUFDRCxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDeEMsQ0FBQztBQVZELDBDQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IEFtYXpvbi5jb20gSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG5cbi8vIElFIDExIGRvZXMgbm90IHN1cHBvcnQgQXJyYXkuZnJvbSwgc28gd2UgZG8gaXQgbWFudWFsbHlcbmV4cG9ydCBmdW5jdGlvbiB1aW50MzJBcnJheUZyb20oYV9sb29rVXBUYWJsZTogQXJyYXk8bnVtYmVyPik6IFVpbnQzMkFycmF5IHtcbiAgaWYgKCFBcnJheS5mcm9tKSB7XG4gICAgY29uc3QgcmV0dXJuX2FycmF5ID0gbmV3IFVpbnQzMkFycmF5KGFfbG9va1VwVGFibGUubGVuZ3RoKVxuICAgIGxldCBhX2luZGV4ID0gMFxuICAgIHdoaWxlIChhX2luZGV4IDwgYV9sb29rVXBUYWJsZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybl9hcnJheVthX2luZGV4XSA9IGFfbG9va1VwVGFibGVbYV9pbmRleF1cbiAgICB9XG4gICAgcmV0dXJuIHJldHVybl9hcnJheVxuICB9XG4gIHJldHVybiBVaW50MzJBcnJheS5mcm9tKGFfbG9va1VwVGFibGUpXG59XG4iXX0=

/***/ }),

/***/ "./node_modules/@aws-sdk/util-utf8-browser/dist/es/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/@aws-sdk/util-utf8-browser/dist/es/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromUtf8: () => (/* binding */ fromUtf8),
/* harmony export */   toUtf8: () => (/* binding */ toUtf8)
/* harmony export */ });
/* harmony import */ var _pureJs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pureJs */ "./node_modules/@aws-sdk/util-utf8-browser/dist/es/pureJs.js");
/* harmony import */ var _whatwgEncodingApi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./whatwgEncodingApi */ "./node_modules/@aws-sdk/util-utf8-browser/dist/es/whatwgEncodingApi.js");


var fromUtf8 = function (input) {
    return typeof TextEncoder === "function" ? (0,_whatwgEncodingApi__WEBPACK_IMPORTED_MODULE_1__.fromUtf8)(input) : (0,_pureJs__WEBPACK_IMPORTED_MODULE_0__.fromUtf8)(input);
};
var toUtf8 = function (input) {
    return typeof TextDecoder === "function" ? (0,_whatwgEncodingApi__WEBPACK_IMPORTED_MODULE_1__.toUtf8)(input) : (0,_pureJs__WEBPACK_IMPORTED_MODULE_0__.toUtf8)(input);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsSUFBSSxVQUFVLEVBQUUsTUFBTSxJQUFJLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN0RSxPQUFPLEVBQUUsUUFBUSxJQUFJLG1CQUFtQixFQUFFLE1BQU0sSUFBSSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBS25HLE1BQU0sQ0FBQyxJQUFNLFFBQVEsR0FBRyxVQUFDLEtBQWE7SUFDcEMsT0FBQSxPQUFPLFdBQVcsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBQWxGLENBQWtGLENBQUM7QUFFckYsTUFBTSxDQUFDLElBQU0sTUFBTSxHQUFHLFVBQUMsS0FBaUI7SUFDdEMsT0FBQSxPQUFPLFdBQVcsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBQTlFLENBQThFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcm9tVXRmOCBhcyBqc0Zyb21VdGY4LCB0b1V0ZjggYXMganNUb1V0ZjggfSBmcm9tIFwiLi9wdXJlSnNcIjtcbmltcG9ydCB7IGZyb21VdGY4IGFzIHRleHRFbmNvZGVyRnJvbVV0ZjgsIHRvVXRmOCBhcyB0ZXh0RW5jb2RlclRvVXRmOCB9IGZyb20gXCIuL3doYXR3Z0VuY29kaW5nQXBpXCI7XG5cbmRlY2xhcmUgY29uc3QgVGV4dERlY29kZXI6IEZ1bmN0aW9uIHwgdW5kZWZpbmVkO1xuZGVjbGFyZSBjb25zdCBUZXh0RW5jb2RlcjogRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBjb25zdCBmcm9tVXRmOCA9IChpbnB1dDogc3RyaW5nKTogVWludDhBcnJheSA9PlxuICB0eXBlb2YgVGV4dEVuY29kZXIgPT09IFwiZnVuY3Rpb25cIiA/IHRleHRFbmNvZGVyRnJvbVV0ZjgoaW5wdXQpIDoganNGcm9tVXRmOChpbnB1dCk7XG5cbmV4cG9ydCBjb25zdCB0b1V0ZjggPSAoaW5wdXQ6IFVpbnQ4QXJyYXkpOiBzdHJpbmcgPT5cbiAgdHlwZW9mIFRleHREZWNvZGVyID09PSBcImZ1bmN0aW9uXCIgPyB0ZXh0RW5jb2RlclRvVXRmOChpbnB1dCkgOiBqc1RvVXRmOChpbnB1dCk7XG4iXX0=

/***/ }),

/***/ "./node_modules/@aws-sdk/util-utf8-browser/dist/es/pureJs.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@aws-sdk/util-utf8-browser/dist/es/pureJs.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromUtf8: () => (/* binding */ fromUtf8),
/* harmony export */   toUtf8: () => (/* binding */ toUtf8)
/* harmony export */ });
/**
 * Converts a JS string from its native UCS-2/UTF-16 representation into a
 * Uint8Array of the bytes used to represent the equivalent characters in UTF-8.
 *
 * Cribbed from the `goog.crypt.stringToUtf8ByteArray` function in the Google
 * Closure library, though updated to use typed arrays.
 */
var fromUtf8 = function (input) {
    var bytes = [];
    for (var i = 0, len = input.length; i < len; i++) {
        var value = input.charCodeAt(i);
        if (value < 0x80) {
            bytes.push(value);
        }
        else if (value < 0x800) {
            bytes.push((value >> 6) | 192, (value & 63) | 128);
        }
        else if (i + 1 < input.length && (value & 0xfc00) === 0xd800 && (input.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            var surrogatePair = 0x10000 + ((value & 1023) << 10) + (input.charCodeAt(++i) & 1023);
            bytes.push((surrogatePair >> 18) | 240, ((surrogatePair >> 12) & 63) | 128, ((surrogatePair >> 6) & 63) | 128, (surrogatePair & 63) | 128);
        }
        else {
            bytes.push((value >> 12) | 224, ((value >> 6) & 63) | 128, (value & 63) | 128);
        }
    }
    return Uint8Array.from(bytes);
};
/**
 * Converts a typed array of bytes containing UTF-8 data into a native JS
 * string.
 *
 * Partly cribbed from the `goog.crypt.utf8ByteArrayToString` function in the
 * Google Closure library, though updated to use typed arrays and to better
 * handle astral plane code points.
 */
var toUtf8 = function (input) {
    var decoded = "";
    for (var i = 0, len = input.length; i < len; i++) {
        var byte = input[i];
        if (byte < 0x80) {
            decoded += String.fromCharCode(byte);
        }
        else if (192 <= byte && byte < 224) {
            var nextByte = input[++i];
            decoded += String.fromCharCode(((byte & 31) << 6) | (nextByte & 63));
        }
        else if (240 <= byte && byte < 365) {
            var surrogatePair = [byte, input[++i], input[++i], input[++i]];
            var encoded = "%" + surrogatePair.map(function (byteValue) { return byteValue.toString(16); }).join("%");
            decoded += decodeURIComponent(encoded);
        }
        else {
            decoded += String.fromCharCode(((byte & 15) << 12) | ((input[++i] & 63) << 6) | (input[++i] & 63));
        }
    }
    return decoded;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyZUpzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3B1cmVKcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQUcsVUFBQyxLQUFhO0lBQ3BDLElBQU0sS0FBSyxHQUFrQixFQUFFLENBQUM7SUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNoRCxJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksS0FBSyxHQUFHLElBQUksRUFBRTtZQUNoQixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25CO2FBQU0sSUFBSSxLQUFLLEdBQUcsS0FBSyxFQUFFO1lBQ3hCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBVSxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQVEsQ0FBQyxHQUFHLEdBQVUsQ0FBQyxDQUFDO1NBQ3hFO2FBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssTUFBTSxFQUFFO1lBQy9HLElBQU0sYUFBYSxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQVksQ0FBQyxDQUFDO1lBQ3hHLEtBQUssQ0FBQyxJQUFJLENBQ1IsQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBVSxFQUNsQyxDQUFDLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQVEsQ0FBQyxHQUFHLEdBQVUsRUFDL0MsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFRLENBQUMsR0FBRyxHQUFVLEVBQzlDLENBQUMsYUFBYSxHQUFHLEVBQVEsQ0FBQyxHQUFHLEdBQVUsQ0FDeEMsQ0FBQztTQUNIO2FBQU07WUFDTCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQVEsQ0FBQyxHQUFHLEdBQVUsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFRLENBQUMsR0FBRyxHQUFVLENBQUMsQ0FBQztTQUNqSDtLQUNGO0lBRUQsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQztBQUVGOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLENBQUMsSUFBTSxNQUFNLEdBQUcsVUFBQyxLQUFpQjtJQUN0QyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNoRCxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxFQUFFO1lBQ2YsT0FBTyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEM7YUFBTSxJQUFJLEdBQVUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEdBQVUsRUFBRTtZQUNsRCxJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QixPQUFPLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQVEsQ0FBQyxDQUFDLENBQUM7U0FDakY7YUFBTSxJQUFJLEdBQVUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEdBQVcsRUFBRTtZQUNuRCxJQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQU0sT0FBTyxHQUFHLEdBQUcsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQUMsU0FBUyxJQUFLLE9BQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RixPQUFPLElBQUksa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEM7YUFBTTtZQUNMLE9BQU8sSUFBSSxNQUFNLENBQUMsWUFBWSxDQUM1QixDQUFDLENBQUMsSUFBSSxHQUFHLEVBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQVEsQ0FBQyxDQUNuRixDQUFDO1NBQ0g7S0FDRjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29udmVydHMgYSBKUyBzdHJpbmcgZnJvbSBpdHMgbmF0aXZlIFVDUy0yL1VURi0xNiByZXByZXNlbnRhdGlvbiBpbnRvIGFcbiAqIFVpbnQ4QXJyYXkgb2YgdGhlIGJ5dGVzIHVzZWQgdG8gcmVwcmVzZW50IHRoZSBlcXVpdmFsZW50IGNoYXJhY3RlcnMgaW4gVVRGLTguXG4gKlxuICogQ3JpYmJlZCBmcm9tIHRoZSBgZ29vZy5jcnlwdC5zdHJpbmdUb1V0ZjhCeXRlQXJyYXlgIGZ1bmN0aW9uIGluIHRoZSBHb29nbGVcbiAqIENsb3N1cmUgbGlicmFyeSwgdGhvdWdoIHVwZGF0ZWQgdG8gdXNlIHR5cGVkIGFycmF5cy5cbiAqL1xuZXhwb3J0IGNvbnN0IGZyb21VdGY4ID0gKGlucHV0OiBzdHJpbmcpOiBVaW50OEFycmF5ID0+IHtcbiAgY29uc3QgYnl0ZXM6IEFycmF5PG51bWJlcj4gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGlucHV0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgdmFsdWUgPSBpbnB1dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmICh2YWx1ZSA8IDB4ODApIHtcbiAgICAgIGJ5dGVzLnB1c2godmFsdWUpO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPCAweDgwMCkge1xuICAgICAgYnl0ZXMucHVzaCgodmFsdWUgPj4gNikgfCAwYjExMDAwMDAwLCAodmFsdWUgJiAwYjExMTExMSkgfCAwYjEwMDAwMDAwKTtcbiAgICB9IGVsc2UgaWYgKGkgKyAxIDwgaW5wdXQubGVuZ3RoICYmICh2YWx1ZSAmIDB4ZmMwMCkgPT09IDB4ZDgwMCAmJiAoaW5wdXQuY2hhckNvZGVBdChpICsgMSkgJiAweGZjMDApID09PSAweGRjMDApIHtcbiAgICAgIGNvbnN0IHN1cnJvZ2F0ZVBhaXIgPSAweDEwMDAwICsgKCh2YWx1ZSAmIDBiMTExMTExMTExMSkgPDwgMTApICsgKGlucHV0LmNoYXJDb2RlQXQoKytpKSAmIDBiMTExMTExMTExMSk7XG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICAoc3Vycm9nYXRlUGFpciA+PiAxOCkgfCAwYjExMTEwMDAwLFxuICAgICAgICAoKHN1cnJvZ2F0ZVBhaXIgPj4gMTIpICYgMGIxMTExMTEpIHwgMGIxMDAwMDAwMCxcbiAgICAgICAgKChzdXJyb2dhdGVQYWlyID4+IDYpICYgMGIxMTExMTEpIHwgMGIxMDAwMDAwMCxcbiAgICAgICAgKHN1cnJvZ2F0ZVBhaXIgJiAwYjExMTExMSkgfCAwYjEwMDAwMDAwXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBieXRlcy5wdXNoKCh2YWx1ZSA+PiAxMikgfCAwYjExMTAwMDAwLCAoKHZhbHVlID4+IDYpICYgMGIxMTExMTEpIHwgMGIxMDAwMDAwMCwgKHZhbHVlICYgMGIxMTExMTEpIHwgMGIxMDAwMDAwMCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShieXRlcyk7XG59O1xuXG4vKipcbiAqIENvbnZlcnRzIGEgdHlwZWQgYXJyYXkgb2YgYnl0ZXMgY29udGFpbmluZyBVVEYtOCBkYXRhIGludG8gYSBuYXRpdmUgSlNcbiAqIHN0cmluZy5cbiAqXG4gKiBQYXJ0bHkgY3JpYmJlZCBmcm9tIHRoZSBgZ29vZy5jcnlwdC51dGY4Qnl0ZUFycmF5VG9TdHJpbmdgIGZ1bmN0aW9uIGluIHRoZVxuICogR29vZ2xlIENsb3N1cmUgbGlicmFyeSwgdGhvdWdoIHVwZGF0ZWQgdG8gdXNlIHR5cGVkIGFycmF5cyBhbmQgdG8gYmV0dGVyXG4gKiBoYW5kbGUgYXN0cmFsIHBsYW5lIGNvZGUgcG9pbnRzLlxuICovXG5leHBvcnQgY29uc3QgdG9VdGY4ID0gKGlucHV0OiBVaW50OEFycmF5KTogc3RyaW5nID0+IHtcbiAgbGV0IGRlY29kZWQgPSBcIlwiO1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gaW5wdXQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjb25zdCBieXRlID0gaW5wdXRbaV07XG4gICAgaWYgKGJ5dGUgPCAweDgwKSB7XG4gICAgICBkZWNvZGVkICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZSk7XG4gICAgfSBlbHNlIGlmICgwYjExMDAwMDAwIDw9IGJ5dGUgJiYgYnl0ZSA8IDBiMTExMDAwMDApIHtcbiAgICAgIGNvbnN0IG5leHRCeXRlID0gaW5wdXRbKytpXTtcbiAgICAgIGRlY29kZWQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgoKGJ5dGUgJiAwYjExMTExKSA8PCA2KSB8IChuZXh0Qnl0ZSAmIDBiMTExMTExKSk7XG4gICAgfSBlbHNlIGlmICgwYjExMTEwMDAwIDw9IGJ5dGUgJiYgYnl0ZSA8IDBiMTAxMTAxMTAxKSB7XG4gICAgICBjb25zdCBzdXJyb2dhdGVQYWlyID0gW2J5dGUsIGlucHV0WysraV0sIGlucHV0WysraV0sIGlucHV0WysraV1dO1xuICAgICAgY29uc3QgZW5jb2RlZCA9IFwiJVwiICsgc3Vycm9nYXRlUGFpci5tYXAoKGJ5dGVWYWx1ZSkgPT4gYnl0ZVZhbHVlLnRvU3RyaW5nKDE2KSkuam9pbihcIiVcIik7XG4gICAgICBkZWNvZGVkICs9IGRlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVjb2RlZCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuICAgICAgICAoKGJ5dGUgJiAwYjExMTEpIDw8IDEyKSB8ICgoaW5wdXRbKytpXSAmIDBiMTExMTExKSA8PCA2KSB8IChpbnB1dFsrK2ldICYgMGIxMTExMTEpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZWNvZGVkO1xufTtcbiJdfQ==

/***/ }),

/***/ "./node_modules/@aws-sdk/util-utf8-browser/dist/es/whatwgEncodingApi.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@aws-sdk/util-utf8-browser/dist/es/whatwgEncodingApi.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fromUtf8: () => (/* binding */ fromUtf8),
/* harmony export */   toUtf8: () => (/* binding */ toUtf8)
/* harmony export */ });
function fromUtf8(input) {
    return new TextEncoder().encode(input);
}
function toUtf8(input) {
    return new TextDecoder("utf-8").decode(input);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hhdHdnRW5jb2RpbmdBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvd2hhdHdnRW5jb2RpbmdBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBeUNBLE1BQU0sVUFBVSxRQUFRLENBQUMsS0FBYTtJQUNwQyxPQUFPLElBQUksV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUFDLEtBQWlCO0lBQ3RDLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgZGVjbGFyYXRpb24gb2YgdGhlIGdsb2JhbCBUZXh0RW5jb2RlciBhbmQgVGV4dERlY29kZXIgY29uc3RydWN0b3JzLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG5uYW1lc3BhY2UgRW5jb2Rpbmcge1xuICBpbnRlcmZhY2UgVGV4dERlY29kZXJPcHRpb25zIHtcbiAgICBmYXRhbD86IGJvb2xlYW47XG4gICAgaWdub3JlQk9NPzogYm9vbGVhbjtcbiAgfVxuXG4gIGludGVyZmFjZSBUZXh0RGVjb2RlT3B0aW9ucyB7XG4gICAgc3RyZWFtPzogYm9vbGVhbjtcbiAgfVxuXG4gIGludGVyZmFjZSBUZXh0RGVjb2RlciB7XG4gICAgcmVhZG9ubHkgZW5jb2Rpbmc6IHN0cmluZztcbiAgICByZWFkb25seSBmYXRhbDogYm9vbGVhbjtcbiAgICByZWFkb25seSBpZ25vcmVCT006IGJvb2xlYW47XG4gICAgZGVjb2RlKGlucHV0PzogQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsIG9wdGlvbnM/OiBUZXh0RGVjb2RlT3B0aW9ucyk6IHN0cmluZztcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgVGV4dERlY29kZXJDb25zdHJ1Y3RvciB7XG4gICAgbmV3IChsYWJlbD86IHN0cmluZywgb3B0aW9ucz86IFRleHREZWNvZGVyT3B0aW9ucyk6IFRleHREZWNvZGVyO1xuICB9XG5cbiAgaW50ZXJmYWNlIFRleHRFbmNvZGVyIHtcbiAgICByZWFkb25seSBlbmNvZGluZzogXCJ1dGYtOFwiO1xuICAgIGVuY29kZShpbnB1dD86IHN0cmluZyk6IFVpbnQ4QXJyYXk7XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIFRleHRFbmNvZGVyQ29uc3RydWN0b3Ige1xuICAgIG5ldyAoKTogVGV4dEVuY29kZXI7XG4gIH1cbn1cblxuZGVjbGFyZSBjb25zdCBUZXh0RGVjb2RlcjogRW5jb2RpbmcuVGV4dERlY29kZXJDb25zdHJ1Y3RvcjtcblxuZGVjbGFyZSBjb25zdCBUZXh0RW5jb2RlcjogRW5jb2RpbmcuVGV4dEVuY29kZXJDb25zdHJ1Y3RvcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21VdGY4KGlucHV0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShpbnB1dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1V0ZjgoaW5wdXQ6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gbmV3IFRleHREZWNvZGVyKFwidXRmLThcIikuZGVjb2RlKGlucHV0KTtcbn1cbiJdfQ==

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/AuthenticationDetails.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/AuthenticationDetails.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AuthenticationDetails)
/* harmony export */ });
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/** @class */
var AuthenticationDetails = /*#__PURE__*/function () {
  /**
   * Constructs a new AuthenticationDetails object
   * @param {object=} data Creation options.
   * @param {string} data.Username User being authenticated.
   * @param {string} data.Password Plain-text password to authenticate with.
   * @param {(AttributeArg[])?} data.ValidationData Application extra metadata.
   * @param {(AttributeArg[])?} data.AuthParamaters Authentication paramaters for custom auth.
   */
  function AuthenticationDetails(data) {
    var _ref = data || {},
      ValidationData = _ref.ValidationData,
      Username = _ref.Username,
      Password = _ref.Password,
      AuthParameters = _ref.AuthParameters,
      ClientMetadata = _ref.ClientMetadata;
    this.validationData = ValidationData || {};
    this.authParameters = AuthParameters || {};
    this.clientMetadata = ClientMetadata || {};
    this.username = Username;
    this.password = Password;
  }

  /**
   * @returns {string} the record's username
   */
  var _proto = AuthenticationDetails.prototype;
  _proto.getUsername = function getUsername() {
    return this.username;
  }

  /**
   * @returns {string} the record's password
   */;
  _proto.getPassword = function getPassword() {
    return this.password;
  }

  /**
   * @returns {Array} the record's validationData
   */;
  _proto.getValidationData = function getValidationData() {
    return this.validationData;
  }

  /**
   * @returns {Array} the record's authParameters
   */;
  _proto.getAuthParameters = function getAuthParameters() {
    return this.authParameters;
  }

  /**
   * @returns {ClientMetadata} the clientMetadata for a Lambda trigger
   */;
  _proto.getClientMetadata = function getClientMetadata() {
    return this.clientMetadata;
  };
  return AuthenticationDetails;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/AuthenticationHelper.js":
/*!****************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/AuthenticationHelper.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AuthenticationHelper)
/* harmony export */ });
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! buffer */ "./node_modules/amazon-cognito-identity-js/node_modules/buffer/index.js");
/* harmony import */ var _utils_WordArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/WordArray */ "./node_modules/amazon-cognito-identity-js/es/utils/WordArray.js");
/* harmony import */ var _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @aws-crypto/sha256-js */ "./node_modules/@aws-crypto/sha256-js/build/index.js");
/* harmony import */ var _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _BigInteger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./BigInteger */ "./node_modules/amazon-cognito-identity-js/es/BigInteger.js");
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */





/**
 * Returns a Buffer with a sequence of random nBytes
 *
 * @param {number} nBytes
 * @returns {Buffer} fixed-length sequence of random bytes
 */

function randomBytes(nBytes) {
  return buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(new _utils_WordArray__WEBPACK_IMPORTED_MODULE_1__["default"]().random(nBytes).toString(), 'hex');
}


/**
 * Tests if a hex string has it most significant bit set (case-insensitive regex)
 */
var HEX_MSB_REGEX = /^[89a-f]/i;
var initN = 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' + '29024E088A67CC74020BBEA63B139B22514A08798E3404DD' + 'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' + 'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' + 'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' + 'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' + '83655D23DCA3AD961C62F356208552BB9ED529077096966D' + '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' + 'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' + 'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' + '15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' + 'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' + 'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' + 'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' + 'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' + '43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';
var newPasswordRequiredChallengeUserAttributePrefix = 'userAttributes.';

/** @class */
var AuthenticationHelper = /*#__PURE__*/function () {
  /**
   * Constructs a new AuthenticationHelper object
   * @param {string} PoolName Cognito user pool name.
   */
  function AuthenticationHelper(PoolName) {
    this.N = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](initN, 16);
    this.g = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"]('2', 16);
    this.k = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](this.hexHash("" + this.padHex(this.N) + this.padHex(this.g)), 16);
    this.smallAValue = this.generateRandomSmallA();
    this.getLargeAValue(function () {});
    this.infoBits = buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from('Caldera Derived Key', 'utf8');
    this.poolName = PoolName;
  }

  /**
   * @returns {BigInteger} small A, a random number
   */
  var _proto = AuthenticationHelper.prototype;
  _proto.getSmallAValue = function getSmallAValue() {
    return this.smallAValue;
  }

  /**
   * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
   * @returns {void}
   */;
  _proto.getLargeAValue = function getLargeAValue(callback) {
    var _this = this;
    if (this.largeAValue) {
      callback(null, this.largeAValue);
    } else {
      this.calculateA(this.smallAValue, function (err, largeAValue) {
        if (err) {
          callback(err, null);
        }
        _this.largeAValue = largeAValue;
        callback(null, _this.largeAValue);
      });
    }
  }

  /**
   * helper function to generate a random big integer
   * @returns {BigInteger} a random value.
   * @private
   */;
  _proto.generateRandomSmallA = function generateRandomSmallA() {
    // This will be interpreted as a postive 128-bit integer
    var hexRandom = randomBytes(128).toString('hex');
    var randomBigInt = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](hexRandom, 16);

    // There is no need to do randomBigInt.mod(this.N - 1) as N (3072-bit) is > 128 bytes (1024-bit)

    return randomBigInt;
  }

  /**
   * helper function to generate a random string
   * @returns {string} a random value.
   * @private
   */;
  _proto.generateRandomString = function generateRandomString() {
    return randomBytes(40).toString('base64');
  }

  /**
   * @returns {string} Generated random value included in password hash.
   */;
  _proto.getRandomPassword = function getRandomPassword() {
    return this.randomPassword;
  }

  /**
   * @returns {string} Generated random value included in devices hash.
   */;
  _proto.getSaltDevices = function getSaltDevices() {
    return this.SaltToHashDevices;
  }

  /**
   * @returns {string} Value used to verify devices.
   */;
  _proto.getVerifierDevices = function getVerifierDevices() {
    return this.verifierDevices;
  }

  /**
   * Generate salts and compute verifier.
   * @param {string} deviceGroupKey Devices to generate verifier for.
   * @param {string} username User to generate verifier for.
   * @param {nodeCallback<null>} callback Called with (err, null)
   * @returns {void}
   */;
  _proto.generateHashDevice = function generateHashDevice(deviceGroupKey, username, callback) {
    var _this2 = this;
    this.randomPassword = this.generateRandomString();
    var combinedString = "" + deviceGroupKey + username + ":" + this.randomPassword;
    var hashedString = this.hash(combinedString);
    var hexRandom = randomBytes(16).toString('hex');

    // The random hex will be unambiguously represented as a postive integer
    this.SaltToHashDevices = this.padHex(new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](hexRandom, 16));
    this.g.modPow(new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](this.hexHash(this.SaltToHashDevices + hashedString), 16), this.N, function (err, verifierDevicesNotPadded) {
      if (err) {
        callback(err, null);
      }
      _this2.verifierDevices = _this2.padHex(verifierDevicesNotPadded);
      callback(null, null);
    });
  }

  /**
   * Calculate the client's public value A = g^a%N
   * with the generated random number a
   * @param {BigInteger} a Randomly generated small A.
   * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
   * @returns {void}
   * @private
   */;
  _proto.calculateA = function calculateA(a, callback) {
    var _this3 = this;
    this.g.modPow(a, this.N, function (err, A) {
      if (err) {
        callback(err, null);
      }
      if (A.mod(_this3.N).equals(_BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"].ZERO)) {
        callback(new Error('Illegal paramater. A mod N cannot be 0.'), null);
      }
      callback(null, A);
    });
  }

  /**
   * Calculate the client's value U which is the hash of A and B
   * @param {BigInteger} A Large A value.
   * @param {BigInteger} B Server B value.
   * @returns {BigInteger} Computed U value.
   * @private
   */;
  _proto.calculateU = function calculateU(A, B) {
    this.UHexHash = this.hexHash(this.padHex(A) + this.padHex(B));
    var finalU = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](this.UHexHash, 16);
    return finalU;
  }

  /**
   * Calculate a hash from a bitArray
   * @param {Buffer} buf Value to hash.
   * @returns {String} Hex-encoded hash.
   * @private
   */;
  _proto.hash = function hash(buf) {
    var awsCryptoHash = new _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__.Sha256();
    awsCryptoHash.update(buf);
    var resultFromAWSCrypto = awsCryptoHash.digestSync();
    var hashHex = buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(resultFromAWSCrypto).toString('hex');
    return new Array(64 - hashHex.length).join('0') + hashHex;
  }

  /**
   * Calculate a hash from a hex string
   * @param {String} hexStr Value to hash.
   * @returns {String} Hex-encoded hash.
   * @private
   */;
  _proto.hexHash = function hexHash(hexStr) {
    return this.hash(buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(hexStr, 'hex'));
  }

  /**
   * Standard hkdf algorithm
   * @param {Buffer} ikm Input key material.
   * @param {Buffer} salt Salt value.
   * @returns {Buffer} Strong key material.
   * @private
   */;
  _proto.computehkdf = function computehkdf(ikm, salt) {
    var infoBitsBuffer = buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.concat([this.infoBits, buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(String.fromCharCode(1), 'utf8')]);
    var awsCryptoHash = new _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__.Sha256(salt);
    awsCryptoHash.update(ikm);
    var resultFromAWSCryptoPrk = awsCryptoHash.digestSync();
    var awsCryptoHashHmac = new _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_2__.Sha256(resultFromAWSCryptoPrk);
    awsCryptoHashHmac.update(infoBitsBuffer);
    var resultFromAWSCryptoHmac = awsCryptoHashHmac.digestSync();
    var hashHexFromAWSCrypto = resultFromAWSCryptoHmac;
    var currentHex = hashHexFromAWSCrypto.slice(0, 16);
    return currentHex;
  }

  /**
   * Calculates the final hkdf based on computed S value, and computed U value and the key
   * @param {String} username Username.
   * @param {String} password Password.
   * @param {BigInteger} serverBValue Server B value.
   * @param {BigInteger} salt Generated salt.
   * @param {nodeCallback<Buffer>} callback Called with (err, hkdfValue)
   * @returns {void}
   */;
  _proto.getPasswordAuthenticationKey = function getPasswordAuthenticationKey(username, password, serverBValue, salt, callback) {
    var _this4 = this;
    if (serverBValue.mod(this.N).equals(_BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"].ZERO)) {
      throw new Error('B cannot be zero.');
    }
    this.UValue = this.calculateU(this.largeAValue, serverBValue);
    if (this.UValue.equals(_BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"].ZERO)) {
      throw new Error('U cannot be zero.');
    }
    var usernamePassword = "" + this.poolName + username + ":" + password;
    var usernamePasswordHash = this.hash(usernamePassword);
    var xValue = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](this.hexHash(this.padHex(salt) + usernamePasswordHash), 16);
    this.calculateS(xValue, serverBValue, function (err, sValue) {
      if (err) {
        callback(err, null);
      }
      var hkdf = _this4.computehkdf(buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(_this4.padHex(sValue), 'hex'), buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(_this4.padHex(_this4.UValue), 'hex'));
      callback(null, hkdf);
    });
  }

  /**
   * Calculates the S value used in getPasswordAuthenticationKey
   * @param {BigInteger} xValue Salted password hash value.
   * @param {BigInteger} serverBValue Server B value.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.calculateS = function calculateS(xValue, serverBValue, callback) {
    var _this5 = this;
    this.g.modPow(xValue, this.N, function (err, gModPowXN) {
      if (err) {
        callback(err, null);
      }
      var intValue2 = serverBValue.subtract(_this5.k.multiply(gModPowXN));
      intValue2.modPow(_this5.smallAValue.add(_this5.UValue.multiply(xValue)), _this5.N, function (err2, result) {
        if (err2) {
          callback(err2, null);
        }
        callback(null, result.mod(_this5.N));
      });
    });
  }

  /**
   * Return constant newPasswordRequiredChallengeUserAttributePrefix
   * @return {newPasswordRequiredChallengeUserAttributePrefix} constant prefix value
   */;
  _proto.getNewPasswordRequiredChallengeUserAttributePrefix = function getNewPasswordRequiredChallengeUserAttributePrefix() {
    return newPasswordRequiredChallengeUserAttributePrefix;
  }

  /**
   * Returns an unambiguous, even-length hex string of the two's complement encoding of an integer.
   *
   * It is compatible with the hex encoding of Java's BigInteger's toByteArray(), wich returns a
   * byte array containing the two's-complement representation of a BigInteger. The array contains
   * the minimum number of bytes required to represent the BigInteger, including at least one sign bit.
   *
   * Examples showing how ambiguity is avoided by left padding with:
   * 	"00" (for positive values where the most-significant-bit is set)
   *  "FF" (for negative values where the most-significant-bit is set)
   *
   * padHex(bigInteger.fromInt(-236))  === "FF14"
   * padHex(bigInteger.fromInt(20))    === "14"
   *
   * padHex(bigInteger.fromInt(-200))  === "FF38"
   * padHex(bigInteger.fromInt(56))    === "38"
   *
   * padHex(bigInteger.fromInt(-20))   === "EC"
   * padHex(bigInteger.fromInt(236))   === "00EC"
   *
   * padHex(bigInteger.fromInt(-56))   === "C8"
   * padHex(bigInteger.fromInt(200))   === "00C8"
   *
   * @param {BigInteger} bigInt Number to encode.
   * @returns {String} even-length hex string of the two's complement encoding.
   */;
  _proto.padHex = function padHex(bigInt) {
    if (!(bigInt instanceof _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"])) {
      throw new Error('Not a BigInteger');
    }
    var isNegative = bigInt.compareTo(_BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"].ZERO) < 0;

    /* Get a hex string for abs(bigInt) */
    var hexStr = bigInt.abs().toString(16);

    /* Pad hex to even length if needed */
    hexStr = hexStr.length % 2 !== 0 ? "0" + hexStr : hexStr;

    /* Prepend "00" if the most significant bit is set */
    hexStr = HEX_MSB_REGEX.test(hexStr) ? "00" + hexStr : hexStr;
    if (isNegative) {
      /* Flip the bits of the representation */
      var invertedNibbles = hexStr.split('').map(function (x) {
        var invertedNibble = ~parseInt(x, 16) & 0xf;
        return '0123456789ABCDEF'.charAt(invertedNibble);
      }).join('');

      /* After flipping the bits, add one to get the 2's complement representation */
      var flippedBitsBI = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](invertedNibbles, 16).add(_BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"].ONE);
      hexStr = flippedBitsBI.toString(16);

      /*
      For hex strings starting with 'FF8', 'FF' can be dropped, e.g. 0xFFFF80=0xFF80=0x80=-128
      		Any sequence of '1' bits on the left can always be substituted with a single '1' bit
      without changing the represented value.
      		This only happens in the case when the input is 80...00
      */
      if (hexStr.toUpperCase().startsWith('FF8')) {
        hexStr = hexStr.substring(2);
      }
    }
    return hexStr;
  };
  return AuthenticationHelper;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/BigInteger.js":
/*!******************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/BigInteger.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// A small implementation of BigInteger based on http://www-cs-students.stanford.edu/~tjw/jsbn/
//
// All public methods have been removed except the following:
//   new BigInteger(a, b) (only radix 2, 4, 8, 16 and 32 supported)
//   toString (only radix 2, 4, 8, 16 and 32 supported)
//   negate
//   abs
//   compareTo
//   bitLength
//   mod
//   equals
//   add
//   subtract
//   multiply
//   divide
//   modPow

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BigInteger);

/*
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */

// (public) Constructor
function BigInteger(a, b) {
  if (a != null) this.fromString(a, b);
}

// return new, unset BigInteger
function nbi() {
  return new BigInteger(null);
}

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = (canary & 0xffffff) == 0xefcafe;

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i, x, w, j, c, n) {
  while (--n >= 0) {
    var v = x * this[i++] + w[j] + c;
    c = Math.floor(v / 0x4000000);
    w[j++] = v & 0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i, x, w, j, c, n) {
  var xl = x & 0x7fff,
    xh = x >> 15;
  while (--n >= 0) {
    var l = this[i] & 0x7fff;
    var h = this[i++] >> 15;
    var m = xh * l + h * xl;
    l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
    c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
    w[j++] = l & 0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i, x, w, j, c, n) {
  var xl = x & 0x3fff,
    xh = x >> 14;
  while (--n >= 0) {
    var l = this[i] & 0x3fff;
    var h = this[i++] >> 14;
    var m = xh * l + h * xl;
    l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
    c = (l >> 28) + (m >> 14) + xh * h;
    w[j++] = l & 0xfffffff;
  }
  return c;
}
var inBrowser = typeof navigator !== 'undefined';
if (inBrowser && j_lm && navigator.appName == 'Microsoft Internet Explorer') {
  BigInteger.prototype.am = am2;
  dbits = 30;
} else if (inBrowser && j_lm && navigator.appName != 'Netscape') {
  BigInteger.prototype.am = am1;
  dbits = 26;
} else {
  // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}
BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = (1 << dbits) - 1;
BigInteger.prototype.DV = 1 << dbits;
var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP);
BigInteger.prototype.F1 = BI_FP - dbits;
BigInteger.prototype.F2 = 2 * dbits - BI_FP;

// Digit conversions
var BI_RM = '0123456789abcdefghijklmnopqrstuvwxyz';
var BI_RC = new Array();
var rr, vv;
rr = '0'.charCodeAt(0);
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = 'a'.charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = 'A'.charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
function int2char(n) {
  return BI_RM.charAt(n);
}
function intAt(s, i) {
  var c = BI_RC[s.charCodeAt(i)];
  return c == null ? -1 : c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = x < 0 ? -1 : 0;
  if (x > 0) this[0] = x;else if (x < -1) this[0] = x + this.DV;else this.t = 0;
}

// return bigint initialized to value
function nbv(i) {
  var r = nbi();
  r.fromInt(i);
  return r;
}

// (protected) set from string and radix
function bnpFromString(s, b) {
  var k;
  if (b == 16) k = 4;else if (b == 8) k = 3;else if (b == 2) k = 1;else if (b == 32) k = 5;else if (b == 4) k = 2;else throw new Error('Only radix 2, 4, 8, 16, 32 are supported');
  this.t = 0;
  this.s = 0;
  var i = s.length,
    mi = false,
    sh = 0;
  while (--i >= 0) {
    var x = intAt(s, i);
    if (x < 0) {
      if (s.charAt(i) == '-') mi = true;
      continue;
    }
    mi = false;
    if (sh == 0) this[this.t++] = x;else if (sh + k > this.DB) {
      this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
      this[this.t++] = x >> this.DB - sh;
    } else this[this.t - 1] |= x << sh;
    sh += k;
    if (sh >= this.DB) sh -= this.DB;
  }
  this.clamp();
  if (mi) BigInteger.ZERO.subTo(this, this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s & this.DM;
  while (this.t > 0 && this[this.t - 1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if (this.s < 0) return '-' + this.negate().toString(b);
  var k;
  if (b == 16) k = 4;else if (b == 8) k = 3;else if (b == 2) k = 1;else if (b == 32) k = 5;else if (b == 4) k = 2;else throw new Error('Only radix 2, 4, 8, 16, 32 are supported');
  var km = (1 << k) - 1,
    d,
    m = false,
    r = '',
    i = this.t;
  var p = this.DB - i * this.DB % k;
  if (i-- > 0) {
    if (p < this.DB && (d = this[i] >> p) > 0) {
      m = true;
      r = int2char(d);
    }
    while (i >= 0) {
      if (p < k) {
        d = (this[i] & (1 << p) - 1) << k - p;
        d |= this[--i] >> (p += this.DB - k);
      } else {
        d = this[i] >> (p -= k) & km;
        if (p <= 0) {
          p += this.DB;
          --i;
        }
      }
      if (d > 0) m = true;
      if (m) r += int2char(d);
    }
  }
  return m ? r : '0';
}

// (public) -this
function bnNegate() {
  var r = nbi();
  BigInteger.ZERO.subTo(this, r);
  return r;
}

// (public) |this|
function bnAbs() {
  return this.s < 0 ? this.negate() : this;
}

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s - a.s;
  if (r != 0) return r;
  var i = this.t;
  r = i - a.t;
  if (r != 0) return this.s < 0 ? -r : r;
  while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1,
    t;
  if ((t = x >>> 16) != 0) {
    x = t;
    r += 16;
  }
  if ((t = x >> 8) != 0) {
    x = t;
    r += 8;
  }
  if ((t = x >> 4) != 0) {
    x = t;
    r += 4;
  }
  if ((t = x >> 2) != 0) {
    x = t;
    r += 2;
  }
  if ((t = x >> 1) != 0) {
    x = t;
    r += 1;
  }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if (this.t <= 0) return 0;
  return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n, r) {
  var i;
  for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
  for (i = n - 1; i >= 0; --i) r[i] = 0;
  r.t = this.t + n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n, r) {
  for (var i = n; i < this.t; ++i) r[i - n] = this[i];
  r.t = Math.max(this.t - n, 0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n, r) {
  var bs = n % this.DB;
  var cbs = this.DB - bs;
  var bm = (1 << cbs) - 1;
  var ds = Math.floor(n / this.DB),
    c = this.s << bs & this.DM,
    i;
  for (i = this.t - 1; i >= 0; --i) {
    r[i + ds + 1] = this[i] >> cbs | c;
    c = (this[i] & bm) << bs;
  }
  for (i = ds - 1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t + ds + 1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n, r) {
  r.s = this.s;
  var ds = Math.floor(n / this.DB);
  if (ds >= this.t) {
    r.t = 0;
    return;
  }
  var bs = n % this.DB;
  var cbs = this.DB - bs;
  var bm = (1 << bs) - 1;
  r[0] = this[ds] >> bs;
  for (var i = ds + 1; i < this.t; ++i) {
    r[i - ds - 1] |= (this[i] & bm) << cbs;
    r[i - ds] = this[i] >> bs;
  }
  if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
  r.t = this.t - ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a, r) {
  var i = 0,
    c = 0,
    m = Math.min(a.t, this.t);
  while (i < m) {
    c += this[i] - a[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
  }
  if (a.t < this.t) {
    c -= a.s;
    while (i < this.t) {
      c += this[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c += this.s;
  } else {
    c += this.s;
    while (i < a.t) {
      c -= a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = c < 0 ? -1 : 0;
  if (c < -1) r[i++] = this.DV + c;else if (c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a, r) {
  var x = this.abs(),
    y = a.abs();
  var i = x.t;
  r.t = i + y.t;
  while (--i >= 0) r[i] = 0;
  for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
  r.s = 0;
  r.clamp();
  if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2 * x.t;
  while (--i >= 0) r[i] = 0;
  for (i = 0; i < x.t - 1; ++i) {
    var c = x.am(i, x[i], r, 2 * i, 0, 1);
    if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
      r[i + x.t] -= x.DV;
      r[i + x.t + 1] = 1;
    }
  }
  if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m, q, r) {
  var pm = m.abs();
  if (pm.t <= 0) return;
  var pt = this.abs();
  if (pt.t < pm.t) {
    if (q != null) q.fromInt(0);
    if (r != null) this.copyTo(r);
    return;
  }
  if (r == null) r = nbi();
  var y = nbi(),
    ts = this.s,
    ms = m.s;
  var nsh = this.DB - nbits(pm[pm.t - 1]);
  // normalize modulus
  if (nsh > 0) {
    pm.lShiftTo(nsh, y);
    pt.lShiftTo(nsh, r);
  } else {
    pm.copyTo(y);
    pt.copyTo(r);
  }
  var ys = y.t;
  var y0 = y[ys - 1];
  if (y0 == 0) return;
  var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
  var d1 = this.FV / yt,
    d2 = (1 << this.F1) / yt,
    e = 1 << this.F2;
  var i = r.t,
    j = i - ys,
    t = q == null ? nbi() : q;
  y.dlShiftTo(j, t);
  if (r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t, r);
  }
  BigInteger.ONE.dlShiftTo(ys, t);
  t.subTo(y, y);
  // "negative" y so we can replace sub with am later
  while (y.t < ys) y[y.t++] = 0;
  while (--j >= 0) {
    // Estimate quotient digit
    var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
    if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
      // Try it out
      y.dlShiftTo(j, t);
      r.subTo(t, r);
      while (r[i] < --qd) r.subTo(t, r);
    }
  }
  if (q != null) {
    r.drShiftTo(ys, q);
    if (ts != ms) BigInteger.ZERO.subTo(q, q);
  }
  r.t = ys;
  r.clamp();
  if (nsh > 0) r.rShiftTo(nsh, r);
  // Denormalize remainder
  if (ts < 0) BigInteger.ZERO.subTo(r, r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a, null, r);
  if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
  return r;
}

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if (this.t < 1) return 0;
  var x = this[0];
  if ((x & 1) == 0) return 0;
  var y = x & 3;
  // y == 1/x mod 2^2
  y = y * (2 - (x & 0xf) * y) & 0xf;
  // y == 1/x mod 2^4
  y = y * (2 - (x & 0xff) * y) & 0xff;
  // y == 1/x mod 2^8
  y = y * (2 - ((x & 0xffff) * y & 0xffff)) & 0xffff;
  // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = y * (2 - x * y % this.DV) % this.DV;
  // y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return y > 0 ? this.DV - y : -y;
}
function bnEquals(a) {
  return this.compareTo(a) == 0;
}

// (protected) r = this + a
function bnpAddTo(a, r) {
  var i = 0,
    c = 0,
    m = Math.min(a.t, this.t);
  while (i < m) {
    c += this[i] + a[i];
    r[i++] = c & this.DM;
    c >>= this.DB;
  }
  if (a.t < this.t) {
    c += a.s;
    while (i < this.t) {
      c += this[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c += this.s;
  } else {
    c += this.s;
    while (i < a.t) {
      c += a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = c < 0 ? -1 : 0;
  if (c > 0) r[i++] = c;else if (c < -1) r[i++] = this.DV + c;
  r.t = i;
  r.clamp();
}

// (public) this + a
function bnAdd(a) {
  var r = nbi();
  this.addTo(a, r);
  return r;
}

// (public) this - a
function bnSubtract(a) {
  var r = nbi();
  this.subTo(a, r);
  return r;
}

// (public) this * a
function bnMultiply(a) {
  var r = nbi();
  this.multiplyTo(a, r);
  return r;
}

// (public) this / a
function bnDivide(a) {
  var r = nbi();
  this.divRemTo(a, r, null);
  return r;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp & 0x7fff;
  this.mph = this.mp >> 15;
  this.um = (1 << m.DB - 15) - 1;
  this.mt2 = 2 * m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t, r);
  r.divRemTo(this.m, null, r);
  if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while (x.t <= this.mt2)
  // pad x so am has enough room later
  x[x.t++] = 0;
  for (var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i] & 0x7fff;
    var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i + this.m.t;
    x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
    // propagate carry
    while (x[j] >= x.DV) {
      x[j] -= x.DV;
      x[++j]++;
    }
  }
  x.clamp();
  x.drShiftTo(this.m.t, x);
  if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x, r) {
  x.squareTo(r);
  this.reduce(r);
}

// r = "xy/R mod m"; x,y != r
function montMulTo(x, y, r) {
  x.multiplyTo(y, r);
  this.reduce(r);
}
Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (public) this^e % m (HAC 14.85)
function bnModPow(e, m, callback) {
  var i = e.bitLength(),
    k,
    r = nbv(1),
    z = new Montgomery(m);
  if (i <= 0) return r;else if (i < 18) k = 1;else if (i < 48) k = 3;else if (i < 144) k = 4;else if (i < 768) k = 5;else k = 6;

  // precomputation
  var g = new Array(),
    n = 3,
    k1 = k - 1,
    km = (1 << k) - 1;
  g[1] = z.convert(this);
  if (k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1], g2);
    while (n <= km) {
      g[n] = nbi();
      z.mulTo(g2, g[n - 2], g[n]);
      n += 2;
    }
  }
  var j = e.t - 1,
    w,
    is1 = true,
    r2 = nbi(),
    t;
  i = nbits(e[j]) - 1;
  while (j >= 0) {
    if (i >= k1) w = e[j] >> i - k1 & km;else {
      w = (e[j] & (1 << i + 1) - 1) << k1 - i;
      if (j > 0) w |= e[j - 1] >> this.DB + i - k1;
    }
    n = k;
    while ((w & 1) == 0) {
      w >>= 1;
      --n;
    }
    if ((i -= n) < 0) {
      i += this.DB;
      --j;
    }
    if (is1) {
      // ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r);
      is1 = false;
    } else {
      while (n > 1) {
        z.sqrTo(r, r2);
        z.sqrTo(r2, r);
        n -= 2;
      }
      if (n > 0) z.sqrTo(r, r2);else {
        t = r;
        r = r2;
        r2 = t;
      }
      z.mulTo(r2, g[w], r);
    }
    while (j >= 0 && (e[j] & 1 << i) == 0) {
      z.sqrTo(r, r2);
      t = r;
      r = r2;
      r2 = t;
      if (--i < 0) {
        i = this.DB - 1;
        --j;
      }
    }
  }
  var result = z.revert(r);
  callback(null, result);
  return result;
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.addTo = bnpAddTo;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.modPow = bnModPow;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/Client.js":
/*!**************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/Client.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Client)
/* harmony export */ });
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! isomorphic-unfetch */ "./node_modules/isomorphic-unfetch/browser.js");
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _UserAgent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UserAgent */ "./node_modules/amazon-cognito-identity-js/es/UserAgent.js");
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }


var CognitoError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(CognitoError, _Error);
  function CognitoError(message, code, name, statusCode) {
    var _this;
    _this = _Error.call(this, message) || this;
    _this.code = code;
    _this.name = name;
    _this.statusCode = statusCode;
    return _this;
  }
  return CognitoError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
/** @class */
var Client = /*#__PURE__*/function () {
  /**
   * Constructs a new AWS Cognito Identity Provider client object
   * @param {string} region AWS region
   * @param {string} endpoint endpoint
   * @param {object} fetchOptions options for fetch API (only credentials is supported)
   */
  function Client(region, endpoint, fetchOptions) {
    this.endpoint = endpoint || "https://cognito-idp." + region + ".amazonaws.com/";
    var _ref = fetchOptions || {},
      credentials = _ref.credentials;
    this.fetchOptions = credentials ? {
      credentials: credentials
    } : {};
  }

  /**
   * Makes an unauthenticated request on AWS Cognito Identity Provider API
   * using fetch
   * @param {string} operation API operation
   * @param {object} params Input parameters
   * @returns Promise<object>
   */
  var _proto = Client.prototype;
  _proto.promisifyRequest = function promisifyRequest(operation, params) {
    var _this2 = this;
    return new Promise(function (resolve, reject) {
      _this2.request(operation, params, function (err, data) {
        if (err) {
          reject(new CognitoError(err.message, err.code, err.name, err.statusCode));
        } else {
          resolve(data);
        }
      });
    });
  };
  _proto.requestWithRetry = function requestWithRetry(operation, params, callback) {
    var _this3 = this;
    var MAX_DELAY_IN_MILLIS = 5 * 1000;
    jitteredExponentialRetry(function (p) {
      return new Promise(function (res, rej) {
        _this3.request(operation, p, function (error, result) {
          if (error) {
            rej(error);
          } else {
            res(result);
          }
        });
      });
    }, [params], MAX_DELAY_IN_MILLIS).then(function (result) {
      return callback(null, result);
    })["catch"](function (error) {
      return callback(error);
    });
  }

  /**
   * Makes an unauthenticated request on AWS Cognito Identity Provider API
   * using fetch
   * @param {string} operation API operation
   * @param {object} params Input parameters
   * @param {function} callback Callback called when a response is returned
   * @returns {void}
   */;
  _proto.request = function request(operation, params, callback) {
    var headers = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': "AWSCognitoIdentityProviderService." + operation,
      'X-Amz-User-Agent': (0,_UserAgent__WEBPACK_IMPORTED_MODULE_1__.getAmplifyUserAgent)(),
      'Cache-Control': 'no-store'
    };
    var options = Object.assign({}, this.fetchOptions, {
      headers: headers,
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(params)
    });
    var response;
    var responseJsonData;
    fetch(this.endpoint, options).then(function (resp) {
      response = resp;
      return resp;
    }, function (err) {
      // If error happens here, the request failed
      // if it is TypeError throw network error
      if (err instanceof TypeError) {
        throw new Error('Network error');
      }
      throw err;
    }).then(function (resp) {
      return resp.json()["catch"](function () {
        return {};
      });
    }).then(function (data) {
      // return parsed body stream
      if (response.ok) return callback(null, data);
      responseJsonData = data;

      // Taken from aws-sdk-js/lib/protocol/json.js
      // eslint-disable-next-line no-underscore-dangle
      var code = (data.__type || data.code).split('#').pop();
      var error = new Error(data.message || data.Message || null);
      error.name = code;
      error.code = code;
      return callback(error);
    })["catch"](function (err) {
      // first check if we have a service error
      if (response && response.headers && response.headers.get('x-amzn-errortype')) {
        try {
          var code = response.headers.get('x-amzn-errortype').split(':')[0];
          var error = new Error(response.status ? response.status.toString() : null);
          error.code = code;
          error.name = code;
          error.statusCode = response.status;
          return callback(error);
        } catch (ex) {
          return callback(err);
        }
        // otherwise check if error is Network error
      } else if (err instanceof Error && err.message === 'Network error') {
        err.code = 'NetworkError';
      }
      return callback(err);
    });
  };
  return Client;
}();

var logger = {
  debug: function debug() {
    // Intentionally blank. This package doesn't have logging
  }
};

/**
 * For now, all errors are retryable.
 */
var NonRetryableError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(NonRetryableError, _Error2);
  function NonRetryableError(message) {
    var _this4;
    _this4 = _Error2.call(this, message) || this;
    _this4.nonRetryable = true;
    return _this4;
  }
  return NonRetryableError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var isNonRetryableError = function isNonRetryableError(obj) {
  var key = 'nonRetryable';
  return obj && obj[key];
};
function retry(functionToRetry, args, delayFn, attempt) {
  if (attempt === void 0) {
    attempt = 1;
  }
  if (typeof functionToRetry !== 'function') {
    throw Error('functionToRetry must be a function');
  }
  logger.debug(functionToRetry.name + " attempt #" + attempt + " with args: " + JSON.stringify(args));
  return functionToRetry.apply(void 0, args)["catch"](function (err) {
    logger.debug("error on " + functionToRetry.name, err);
    if (isNonRetryableError(err)) {
      logger.debug(functionToRetry.name + " non retryable error", err);
      throw err;
    }
    var retryIn = delayFn(attempt, args, err);
    logger.debug(functionToRetry.name + " retrying in " + retryIn + " ms");
    if (retryIn !== false) {
      return new Promise(function (res) {
        return setTimeout(res, retryIn);
      }).then(function () {
        return retry(functionToRetry, args, delayFn, attempt + 1);
      });
    } else {
      throw err;
    }
  });
}
function jitteredBackoff(maxDelayMs) {
  var BASE_TIME_MS = 100;
  var JITTER_FACTOR = 100;
  return function (attempt) {
    var delay = Math.pow(2, attempt) * BASE_TIME_MS + JITTER_FACTOR * Math.random();
    return delay > maxDelayMs ? false : delay;
  };
}
var MAX_DELAY_MS = 5 * 60 * 1000;
function jitteredExponentialRetry(functionToRetry, args, maxDelayMs) {
  if (maxDelayMs === void 0) {
    maxDelayMs = MAX_DELAY_MS;
  }
  return retry(functionToRetry, args, jitteredBackoff(maxDelayMs));
}

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoAccessToken.js":
/*!**************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoAccessToken.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoAccessToken)
/* harmony export */ });
/* harmony import */ var _CognitoJwtToken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CognitoJwtToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoJwtToken.js");
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */



/** @class */
var CognitoAccessToken = /*#__PURE__*/function (_CognitoJwtToken) {
  _inheritsLoose(CognitoAccessToken, _CognitoJwtToken);
  /**
   * Constructs a new CognitoAccessToken object
   * @param {string=} AccessToken The JWT access token.
   */
  function CognitoAccessToken(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      AccessToken = _ref.AccessToken;
    return _CognitoJwtToken.call(this, AccessToken || '') || this;
  }
  return CognitoAccessToken;
}(_CognitoJwtToken__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoIdToken.js":
/*!**********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoIdToken.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoIdToken)
/* harmony export */ });
/* harmony import */ var _CognitoJwtToken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CognitoJwtToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoJwtToken.js");
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */



/** @class */
var CognitoIdToken = /*#__PURE__*/function (_CognitoJwtToken) {
  _inheritsLoose(CognitoIdToken, _CognitoJwtToken);
  /**
   * Constructs a new CognitoIdToken object
   * @param {string=} IdToken The JWT Id token
   */
  function CognitoIdToken(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      IdToken = _ref.IdToken;
    return _CognitoJwtToken.call(this, IdToken || '') || this;
  }
  return CognitoIdToken;
}(_CognitoJwtToken__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoJwtToken.js":
/*!***********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoJwtToken.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoJwtToken)
/* harmony export */ });
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! buffer */ "./node_modules/amazon-cognito-identity-js/node_modules/buffer/index.js");
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */



/** @class */
var CognitoJwtToken = /*#__PURE__*/function () {
  /**
   * Constructs a new CognitoJwtToken object
   * @param {string=} token The JWT token.
   */
  function CognitoJwtToken(token) {
    // Assign object
    this.jwtToken = token || '';
    this.payload = this.decodePayload();
  }

  /**
   * @returns {string} the record's token.
   */
  var _proto = CognitoJwtToken.prototype;
  _proto.getJwtToken = function getJwtToken() {
    return this.jwtToken;
  }

  /**
   * @returns {int} the token's expiration (exp member).
   */;
  _proto.getExpiration = function getExpiration() {
    return this.payload.exp;
  }

  /**
   * @returns {int} the token's "issued at" (iat member).
   */;
  _proto.getIssuedAt = function getIssuedAt() {
    return this.payload.iat;
  }

  /**
   * @returns {object} the token's payload.
   */;
  _proto.decodePayload = function decodePayload() {
    var payload = this.jwtToken.split('.')[1];
    try {
      return JSON.parse(buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(payload, 'base64').toString('utf8'));
    } catch (err) {
      return {};
    }
  };
  return CognitoJwtToken;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoRefreshToken.js":
/*!***************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoRefreshToken.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoRefreshToken)
/* harmony export */ });
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/** @class */
var CognitoRefreshToken = /*#__PURE__*/function () {
  /**
   * Constructs a new CognitoRefreshToken object
   * @param {string=} RefreshToken The JWT refresh token.
   */
  function CognitoRefreshToken(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      RefreshToken = _ref.RefreshToken;
    // Assign object
    this.token = RefreshToken || '';
  }

  /**
   * @returns {string} the record's token.
   */
  var _proto = CognitoRefreshToken.prototype;
  _proto.getToken = function getToken() {
    return this.token;
  };
  return CognitoRefreshToken;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoUser.js":
/*!*******************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoUser.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoUser)
/* harmony export */ });
/* harmony import */ var buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! buffer */ "./node_modules/amazon-cognito-identity-js/node_modules/buffer/index.js");
/* harmony import */ var _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @aws-crypto/sha256-js */ "./node_modules/@aws-crypto/sha256-js/build/index.js");
/* harmony import */ var _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Platform */ "./node_modules/amazon-cognito-identity-js/es/Platform/index.js");
/* harmony import */ var _BigInteger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./BigInteger */ "./node_modules/amazon-cognito-identity-js/es/BigInteger.js");
/* harmony import */ var _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./AuthenticationHelper */ "./node_modules/amazon-cognito-identity-js/es/AuthenticationHelper.js");
/* harmony import */ var _CognitoAccessToken__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./CognitoAccessToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoAccessToken.js");
/* harmony import */ var _CognitoIdToken__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./CognitoIdToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoIdToken.js");
/* harmony import */ var _CognitoRefreshToken__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./CognitoRefreshToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoRefreshToken.js");
/* harmony import */ var _CognitoUserSession__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./CognitoUserSession */ "./node_modules/amazon-cognito-identity-js/es/CognitoUserSession.js");
/* harmony import */ var _DateHelper__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./DateHelper */ "./node_modules/amazon-cognito-identity-js/es/DateHelper.js");
/* harmony import */ var _CognitoUserAttribute__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./CognitoUserAttribute */ "./node_modules/amazon-cognito-identity-js/es/CognitoUserAttribute.js");
/* harmony import */ var _StorageHelper__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./StorageHelper */ "./node_modules/amazon-cognito-identity-js/es/StorageHelper.js");
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */














/**
 * @callback nodeCallback
 * @template T result
 * @param {*} err The operation failure reason, or null.
 * @param {T} result The operation result.
 */

/**
 * @callback onFailure
 * @param {*} err Failure reason.
 */

/**
 * @callback onSuccess
 * @template T result
 * @param {T} result The operation result.
 */

/**
 * @callback mfaRequired
 * @param {*} details MFA challenge details.
 */

/**
 * @callback customChallenge
 * @param {*} details Custom challenge details.
 */

/**
 * @callback inputVerificationCode
 * @param {*} data Server response.
 */

/**
 * @callback authSuccess
 * @param {CognitoUserSession} session The new session.
 * @param {bool=} userConfirmationNecessary User must be confirmed.
 */

var isNavigatorAvailable = typeof navigator !== 'undefined';
var userAgent = isNavigatorAvailable ? _Platform__WEBPACK_IMPORTED_MODULE_2__.Platform.isReactNative ? 'react-native' : navigator.userAgent : 'nodejs';

/** @class */
var CognitoUser = /*#__PURE__*/function () {
  /**
   * Constructs a new CognitoUser object
   * @param {object} data Creation options
   * @param {string} data.Username The user's username.
   * @param {CognitoUserPool} data.Pool Pool containing the user.
   * @param {object} data.Storage Optional storage object.
   */
  function CognitoUser(data) {
    if (data == null || data.Username == null || data.Pool == null) {
      throw new Error('Username and Pool information are required.');
    }
    this.username = data.Username || '';
    this.pool = data.Pool;
    this.Session = null;
    this.client = data.Pool.client;
    this.signInUserSession = null;
    this.authenticationFlowType = 'USER_SRP_AUTH';
    this.storage = data.Storage || new _StorageHelper__WEBPACK_IMPORTED_MODULE_11__["default"]().getStorage();
    this.keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId();
    this.userDataKey = this.keyPrefix + "." + this.username + ".userData";
  }

  /**
   * Sets the session for this user
   * @param {CognitoUserSession} signInUserSession the session
   * @returns {void}
   */
  var _proto = CognitoUser.prototype;
  _proto.setSignInUserSession = function setSignInUserSession(signInUserSession) {
    this.clearCachedUserData();
    this.signInUserSession = signInUserSession;
    this.cacheTokens();
  }

  /**
   * @returns {CognitoUserSession} the current session for this user
   */;
  _proto.getSignInUserSession = function getSignInUserSession() {
    return this.signInUserSession;
  }

  /**
   * @returns {string} the user's username
   */;
  _proto.getUsername = function getUsername() {
    return this.username;
  }

  /**
   * @returns {String} the authentication flow type
   */;
  _proto.getAuthenticationFlowType = function getAuthenticationFlowType() {
    return this.authenticationFlowType;
  }

  /**
   * sets authentication flow type
   * @param {string} authenticationFlowType New value.
   * @returns {void}
   */;
  _proto.setAuthenticationFlowType = function setAuthenticationFlowType(authenticationFlowType) {
    this.authenticationFlowType = authenticationFlowType;
  }

  /**
   * This is used for authenticating the user through the custom authentication flow.
   * @param {AuthenticationDetails} authDetails Contains the authentication data
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {customChallenge} callback.customChallenge Custom challenge
   *        response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */;
  _proto.initiateAuth = function initiateAuth(authDetails, callback) {
    var _this = this;
    var authParameters = authDetails.getAuthParameters();
    authParameters.USERNAME = this.username;
    var clientMetaData = Object.keys(authDetails.getValidationData()).length !== 0 ? authDetails.getValidationData() : authDetails.getClientMetadata();
    var jsonReq = {
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: this.pool.getClientId(),
      AuthParameters: authParameters,
      ClientMetadata: clientMetaData
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('InitiateAuth', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      var challengeName = data.ChallengeName;
      var challengeParameters = data.ChallengeParameters;
      if (challengeName === 'CUSTOM_CHALLENGE') {
        _this.Session = data.Session;
        return callback.customChallenge(challengeParameters);
      }
      _this.signInUserSession = _this.getCognitoUserSession(data.AuthenticationResult);
      _this.cacheTokens();
      return callback.onSuccess(_this.signInUserSession);
    });
  }

  /**
   * This is used for authenticating the user.
   * stuff
   * @param {AuthenticationDetails} authDetails Contains the authentication data
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {newPasswordRequired} callback.newPasswordRequired new
   *        password and any required attributes are required to continue
   * @param {mfaRequired} callback.mfaRequired MFA code
   *        required to continue.
   * @param {customChallenge} callback.customChallenge Custom challenge
   *        response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */;
  _proto.authenticateUser = function authenticateUser(authDetails, callback) {
    if (this.authenticationFlowType === 'USER_PASSWORD_AUTH') {
      return this.authenticateUserPlainUsernamePassword(authDetails, callback);
    } else if (this.authenticationFlowType === 'USER_SRP_AUTH' || this.authenticationFlowType === 'CUSTOM_AUTH') {
      return this.authenticateUserDefaultAuth(authDetails, callback);
    }
    return callback.onFailure(new Error('Authentication flow type is invalid.'));
  }

  /**
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   * It calls the AuthenticationHelper for SRP related
   * stuff
   * @param {AuthenticationDetails} authDetails Contains the authentication data
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {newPasswordRequired} callback.newPasswordRequired new
   *        password and any required attributes are required to continue
   * @param {mfaRequired} callback.mfaRequired MFA code
   *        required to continue.
   * @param {customChallenge} callback.customChallenge Custom challenge
   *        response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */;
  _proto.authenticateUserDefaultAuth = function authenticateUserDefaultAuth(authDetails, callback) {
    var _this2 = this;
    var authenticationHelper = new _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_4__["default"](this.pool.getUserPoolName());
    var dateHelper = new _DateHelper__WEBPACK_IMPORTED_MODULE_9__["default"]();
    var serverBValue;
    var salt;
    var authParameters = {};
    if (this.deviceKey != null) {
      authParameters.DEVICE_KEY = this.deviceKey;
    }
    authParameters.USERNAME = this.username;
    authenticationHelper.getLargeAValue(function (errOnAValue, aValue) {
      // getLargeAValue callback start
      if (errOnAValue) {
        callback.onFailure(errOnAValue);
      }
      authParameters.SRP_A = aValue.toString(16);
      if (_this2.authenticationFlowType === 'CUSTOM_AUTH') {
        authParameters.CHALLENGE_NAME = 'SRP_A';
      }
      var clientMetaData = Object.keys(authDetails.getValidationData()).length !== 0 ? authDetails.getValidationData() : authDetails.getClientMetadata();
      var jsonReq = {
        AuthFlow: _this2.authenticationFlowType,
        ClientId: _this2.pool.getClientId(),
        AuthParameters: authParameters,
        ClientMetadata: clientMetaData
      };
      if (_this2.getUserContextData(_this2.username)) {
        jsonReq.UserContextData = _this2.getUserContextData(_this2.username);
      }
      _this2.client.request('InitiateAuth', jsonReq, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        var challengeParameters = data.ChallengeParameters;
        _this2.username = challengeParameters.USER_ID_FOR_SRP;
        _this2.userDataKey = _this2.keyPrefix + "." + _this2.username + ".userData";
        serverBValue = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](challengeParameters.SRP_B, 16);
        salt = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](challengeParameters.SALT, 16);
        _this2.getCachedDeviceKeyAndPassword();
        authenticationHelper.getPasswordAuthenticationKey(_this2.username, authDetails.getPassword(), serverBValue, salt, function (errOnHkdf, hkdf) {
          // getPasswordAuthenticationKey callback start
          if (errOnHkdf) {
            callback.onFailure(errOnHkdf);
          }
          var dateNow = dateHelper.getNowString();
          var concatBuffer = buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.concat([buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(_this2.pool.getUserPoolName(), 'utf8'), buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(_this2.username, 'utf8'), buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(dateNow, 'utf8')]);
          var awsCryptoHash = new _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_1__.Sha256(hkdf);
          awsCryptoHash.update(concatBuffer);
          var resultFromAWSCrypto = awsCryptoHash.digestSync();
          var signatureString = buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(resultFromAWSCrypto).toString('base64');
          var challengeResponses = {};
          challengeResponses.USERNAME = _this2.username;
          challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
          challengeResponses.TIMESTAMP = dateNow;
          challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;
          if (_this2.deviceKey != null) {
            challengeResponses.DEVICE_KEY = _this2.deviceKey;
          }
          var respondToAuthChallenge = function respondToAuthChallenge(challenge, challengeCallback) {
            return _this2.client.request('RespondToAuthChallenge', challenge, function (errChallenge, dataChallenge) {
              if (errChallenge && errChallenge.code === 'ResourceNotFoundException' && errChallenge.message.toLowerCase().indexOf('device') !== -1) {
                challengeResponses.DEVICE_KEY = null;
                _this2.deviceKey = null;
                _this2.randomPassword = null;
                _this2.deviceGroupKey = null;
                _this2.clearCachedDeviceKeyAndPassword();
                return respondToAuthChallenge(challenge, challengeCallback);
              }
              return challengeCallback(errChallenge, dataChallenge);
            });
          };
          var jsonReqResp = {
            ChallengeName: 'PASSWORD_VERIFIER',
            ClientId: _this2.pool.getClientId(),
            ChallengeResponses: challengeResponses,
            Session: data.Session,
            ClientMetadata: clientMetaData
          };
          if (_this2.getUserContextData()) {
            jsonReqResp.UserContextData = _this2.getUserContextData();
          }
          respondToAuthChallenge(jsonReqResp, function (errAuthenticate, dataAuthenticate) {
            if (errAuthenticate) {
              return callback.onFailure(errAuthenticate);
            }
            return _this2.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
          });
          return undefined;
          // getPasswordAuthenticationKey callback end
        });

        return undefined;
      });
      // getLargeAValue callback end
    });
  }

  /**
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   * @param {AuthenticationDetails} authDetails Contains the authentication data.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {mfaRequired} callback.mfaRequired MFA code
   *        required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @returns {void}
   */;
  _proto.authenticateUserPlainUsernamePassword = function authenticateUserPlainUsernamePassword(authDetails, callback) {
    var _this3 = this;
    var authParameters = {};
    authParameters.USERNAME = this.username;
    authParameters.PASSWORD = authDetails.getPassword();
    if (!authParameters.PASSWORD) {
      callback.onFailure(new Error('PASSWORD parameter is required'));
      return;
    }
    var authenticationHelper = new _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_4__["default"](this.pool.getUserPoolName());
    this.getCachedDeviceKeyAndPassword();
    if (this.deviceKey != null) {
      authParameters.DEVICE_KEY = this.deviceKey;
    }
    var clientMetaData = Object.keys(authDetails.getValidationData()).length !== 0 ? authDetails.getValidationData() : authDetails.getClientMetadata();
    var jsonReq = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.pool.getClientId(),
      AuthParameters: authParameters,
      ClientMetadata: clientMetaData
    };
    if (this.getUserContextData(this.username)) {
      jsonReq.UserContextData = this.getUserContextData(this.username);
    }
    // USER_PASSWORD_AUTH happens in a single round-trip: client sends userName and password,
    // Cognito UserPools verifies password and returns tokens.
    this.client.request('InitiateAuth', jsonReq, function (err, authResult) {
      if (err) {
        return callback.onFailure(err);
      }
      return _this3.authenticateUserInternal(authResult, authenticationHelper, callback);
    });
  }

  /**
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   * @param {object} dataAuthenticate authentication data
   * @param {object} authenticationHelper helper created
   * @param {callback} callback passed on from caller
   * @returns {void}
   */;
  _proto.authenticateUserInternal = function authenticateUserInternal(dataAuthenticate, authenticationHelper, callback) {
    var _this4 = this;
    var challengeName = dataAuthenticate.ChallengeName;
    var challengeParameters = dataAuthenticate.ChallengeParameters;
    if (challengeName === 'SMS_MFA') {
      this.Session = dataAuthenticate.Session;
      return callback.mfaRequired(challengeName, challengeParameters);
    }
    if (challengeName === 'SELECT_MFA_TYPE') {
      this.Session = dataAuthenticate.Session;
      return callback.selectMFAType(challengeName, challengeParameters);
    }
    if (challengeName === 'MFA_SETUP') {
      this.Session = dataAuthenticate.Session;
      return callback.mfaSetup(challengeName, challengeParameters);
    }
    if (challengeName === 'SOFTWARE_TOKEN_MFA') {
      this.Session = dataAuthenticate.Session;
      return callback.totpRequired(challengeName, challengeParameters);
    }
    if (challengeName === 'CUSTOM_CHALLENGE') {
      this.Session = dataAuthenticate.Session;
      return callback.customChallenge(challengeParameters);
    }
    if (challengeName === 'NEW_PASSWORD_REQUIRED') {
      this.Session = dataAuthenticate.Session;
      var userAttributes = null;
      var rawRequiredAttributes = null;
      var requiredAttributes = [];
      var userAttributesPrefix = authenticationHelper.getNewPasswordRequiredChallengeUserAttributePrefix();
      if (challengeParameters) {
        userAttributes = JSON.parse(dataAuthenticate.ChallengeParameters.userAttributes);
        rawRequiredAttributes = JSON.parse(dataAuthenticate.ChallengeParameters.requiredAttributes);
      }
      if (rawRequiredAttributes) {
        for (var i = 0; i < rawRequiredAttributes.length; i++) {
          requiredAttributes[i] = rawRequiredAttributes[i].substr(userAttributesPrefix.length);
        }
      }
      return callback.newPasswordRequired(userAttributes, requiredAttributes);
    }
    if (challengeName === 'DEVICE_SRP_AUTH') {
      this.Session = dataAuthenticate.Session;
      this.getDeviceResponse(callback);
      return undefined;
    }
    this.signInUserSession = this.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
    this.challengeName = challengeName;
    this.cacheTokens();
    var newDeviceMetadata = dataAuthenticate.AuthenticationResult.NewDeviceMetadata;
    if (newDeviceMetadata == null) {
      return callback.onSuccess(this.signInUserSession);
    }
    authenticationHelper.generateHashDevice(dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey, dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey, function (errGenHash) {
      if (errGenHash) {
        return callback.onFailure(errGenHash);
      }
      var deviceSecretVerifierConfig = {
        Salt: buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(authenticationHelper.getSaltDevices(), 'hex').toString('base64'),
        PasswordVerifier: buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(authenticationHelper.getVerifierDevices(), 'hex').toString('base64')
      };
      _this4.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
      _this4.deviceGroupKey = newDeviceMetadata.DeviceGroupKey;
      _this4.randomPassword = authenticationHelper.getRandomPassword();
      _this4.client.request('ConfirmDevice', {
        DeviceKey: newDeviceMetadata.DeviceKey,
        AccessToken: _this4.signInUserSession.getAccessToken().getJwtToken(),
        DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
        DeviceName: userAgent
      }, function (errConfirm, dataConfirm) {
        if (errConfirm) {
          return callback.onFailure(errConfirm);
        }
        _this4.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
        _this4.cacheDeviceKeyAndPassword();
        if (dataConfirm.UserConfirmationNecessary === true) {
          return callback.onSuccess(_this4.signInUserSession, dataConfirm.UserConfirmationNecessary);
        }
        return callback.onSuccess(_this4.signInUserSession);
      });
      return undefined;
    });
    return undefined;
  }

  /**
   * This method is user to complete the NEW_PASSWORD_REQUIRED challenge.
   * Pass the new password with any new user attributes to be updated.
   * User attribute keys must be of format userAttributes.<attribute_name>.
   * @param {string} newPassword new password for this user
   * @param {object} requiredAttributeData map with values for all required attributes
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {mfaRequired} callback.mfaRequired MFA code required to continue.
   * @param {customChallenge} callback.customChallenge Custom challenge
   *         response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.completeNewPasswordChallenge = function completeNewPasswordChallenge(newPassword, requiredAttributeData, callback, clientMetadata) {
    var _this5 = this;
    if (!newPassword) {
      return callback.onFailure(new Error('New password is required.'));
    }
    var authenticationHelper = new _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_4__["default"](this.pool.getUserPoolName());
    var userAttributesPrefix = authenticationHelper.getNewPasswordRequiredChallengeUserAttributePrefix();
    var finalUserAttributes = {};
    if (requiredAttributeData) {
      Object.keys(requiredAttributeData).forEach(function (key) {
        finalUserAttributes[userAttributesPrefix + key] = requiredAttributeData[key];
      });
    }
    finalUserAttributes.NEW_PASSWORD = newPassword;
    finalUserAttributes.USERNAME = this.username;
    var jsonReq = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: this.pool.getClientId(),
      ChallengeResponses: finalUserAttributes,
      Session: this.Session,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('RespondToAuthChallenge', jsonReq, function (errAuthenticate, dataAuthenticate) {
      if (errAuthenticate) {
        return callback.onFailure(errAuthenticate);
      }
      return _this5.authenticateUserInternal(dataAuthenticate, authenticationHelper, callback);
    });
    return undefined;
  }

  /**
   * This is used to get a session using device authentication. It is called at the end of user
   * authentication
   *
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   * @private
   */;
  _proto.getDeviceResponse = function getDeviceResponse(callback, clientMetadata) {
    var _this6 = this;
    var authenticationHelper = new _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_4__["default"](this.deviceGroupKey);
    var dateHelper = new _DateHelper__WEBPACK_IMPORTED_MODULE_9__["default"]();
    var authParameters = {};
    authParameters.USERNAME = this.username;
    authParameters.DEVICE_KEY = this.deviceKey;
    authenticationHelper.getLargeAValue(function (errAValue, aValue) {
      // getLargeAValue callback start
      if (errAValue) {
        callback.onFailure(errAValue);
      }
      authParameters.SRP_A = aValue.toString(16);
      var jsonReq = {
        ChallengeName: 'DEVICE_SRP_AUTH',
        ClientId: _this6.pool.getClientId(),
        ChallengeResponses: authParameters,
        ClientMetadata: clientMetadata,
        Session: _this6.Session
      };
      if (_this6.getUserContextData()) {
        jsonReq.UserContextData = _this6.getUserContextData();
      }
      _this6.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        var challengeParameters = data.ChallengeParameters;
        var serverBValue = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](challengeParameters.SRP_B, 16);
        var salt = new _BigInteger__WEBPACK_IMPORTED_MODULE_3__["default"](challengeParameters.SALT, 16);
        authenticationHelper.getPasswordAuthenticationKey(_this6.deviceKey, _this6.randomPassword, serverBValue, salt, function (errHkdf, hkdf) {
          // getPasswordAuthenticationKey callback start
          if (errHkdf) {
            return callback.onFailure(errHkdf);
          }
          var dateNow = dateHelper.getNowString();
          var concatBuffer = buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.concat([buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(_this6.deviceGroupKey, 'utf8'), buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(_this6.deviceKey, 'utf8'), buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(challengeParameters.SECRET_BLOCK, 'base64'), buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(dateNow, 'utf8')]);
          var awsCryptoHash = new _aws_crypto_sha256_js__WEBPACK_IMPORTED_MODULE_1__.Sha256(hkdf);
          awsCryptoHash.update(concatBuffer);
          var resultFromAWSCrypto = awsCryptoHash.digestSync();
          var signatureString = buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(resultFromAWSCrypto).toString('base64');
          var challengeResponses = {};
          challengeResponses.USERNAME = _this6.username;
          challengeResponses.PASSWORD_CLAIM_SECRET_BLOCK = challengeParameters.SECRET_BLOCK;
          challengeResponses.TIMESTAMP = dateNow;
          challengeResponses.PASSWORD_CLAIM_SIGNATURE = signatureString;
          challengeResponses.DEVICE_KEY = _this6.deviceKey;
          var jsonReqResp = {
            ChallengeName: 'DEVICE_PASSWORD_VERIFIER',
            ClientId: _this6.pool.getClientId(),
            ChallengeResponses: challengeResponses,
            Session: data.Session
          };
          if (_this6.getUserContextData()) {
            jsonReqResp.UserContextData = _this6.getUserContextData();
          }
          _this6.client.request('RespondToAuthChallenge', jsonReqResp, function (errAuthenticate, dataAuthenticate) {
            if (errAuthenticate) {
              return callback.onFailure(errAuthenticate);
            }
            _this6.signInUserSession = _this6.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
            _this6.cacheTokens();
            return callback.onSuccess(_this6.signInUserSession);
          });
          return undefined;
          // getPasswordAuthenticationKey callback end
        });

        return undefined;
      });
      // getLargeAValue callback end
    });
  }

  /**
   * This is used for a certain user to confirm the registration by using a confirmation code
   * @param {string} confirmationCode Code entered by user.
   * @param {bool} forceAliasCreation Allow migrating from an existing email / phone number.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.confirmRegistration = function confirmRegistration(confirmationCode, forceAliasCreation, callback, clientMetadata) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      ConfirmationCode: confirmationCode,
      Username: this.username,
      ForceAliasCreation: forceAliasCreation,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('ConfirmSignUp', jsonReq, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
  }

  /**
   * This is used by the user once he has the responses to a custom challenge
   * @param {string} answerChallenge The custom challenge answer.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {customChallenge} callback.customChallenge
   *    Custom challenge response required to continue.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.sendCustomChallengeAnswer = function sendCustomChallengeAnswer(answerChallenge, callback, clientMetadata) {
    var _this7 = this;
    var challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.ANSWER = answerChallenge;
    var authenticationHelper = new _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_4__["default"](this.pool.getUserPoolName());
    this.getCachedDeviceKeyAndPassword();
    if (this.deviceKey != null) {
      challengeResponses.DEVICE_KEY = this.deviceKey;
    }
    var jsonReq = {
      ChallengeName: 'CUSTOM_CHALLENGE',
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      return _this7.authenticateUserInternal(data, authenticationHelper, callback);
    });
  }

  /**
   * This is used by the user once he has an MFA code
   * @param {string} confirmationCode The MFA code entered by the user.
   * @param {object} callback Result callback map.
   * @param {string} mfaType The mfa we are replying to.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {authSuccess} callback.onSuccess Called on success with the new session.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.sendMFACode = function sendMFACode(confirmationCode, callback, mfaType, clientMetadata) {
    var _this8 = this;
    var challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.SMS_MFA_CODE = confirmationCode;
    var mfaTypeSelection = mfaType || 'SMS_MFA';
    if (mfaTypeSelection === 'SOFTWARE_TOKEN_MFA') {
      challengeResponses.SOFTWARE_TOKEN_MFA_CODE = confirmationCode;
    }
    if (this.deviceKey != null) {
      challengeResponses.DEVICE_KEY = this.deviceKey;
    }
    var jsonReq = {
      ChallengeName: mfaTypeSelection,
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('RespondToAuthChallenge', jsonReq, function (err, dataAuthenticate) {
      if (err) {
        return callback.onFailure(err);
      }
      var challengeName = dataAuthenticate.ChallengeName;
      if (challengeName === 'DEVICE_SRP_AUTH') {
        _this8.getDeviceResponse(callback);
        return undefined;
      }
      _this8.signInUserSession = _this8.getCognitoUserSession(dataAuthenticate.AuthenticationResult);
      _this8.cacheTokens();
      if (dataAuthenticate.AuthenticationResult.NewDeviceMetadata == null) {
        return callback.onSuccess(_this8.signInUserSession);
      }
      var authenticationHelper = new _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_4__["default"](_this8.pool.getUserPoolName());
      authenticationHelper.generateHashDevice(dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey, dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey, function (errGenHash) {
        if (errGenHash) {
          return callback.onFailure(errGenHash);
        }
        var deviceSecretVerifierConfig = {
          Salt: buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(authenticationHelper.getSaltDevices(), 'hex').toString('base64'),
          PasswordVerifier: buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.from(authenticationHelper.getVerifierDevices(), 'hex').toString('base64')
        };
        _this8.verifierDevices = deviceSecretVerifierConfig.PasswordVerifier;
        _this8.deviceGroupKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceGroupKey;
        _this8.randomPassword = authenticationHelper.getRandomPassword();
        _this8.client.request('ConfirmDevice', {
          DeviceKey: dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey,
          AccessToken: _this8.signInUserSession.getAccessToken().getJwtToken(),
          DeviceSecretVerifierConfig: deviceSecretVerifierConfig,
          DeviceName: userAgent
        }, function (errConfirm, dataConfirm) {
          if (errConfirm) {
            return callback.onFailure(errConfirm);
          }
          _this8.deviceKey = dataAuthenticate.AuthenticationResult.NewDeviceMetadata.DeviceKey;
          _this8.cacheDeviceKeyAndPassword();
          if (dataConfirm.UserConfirmationNecessary === true) {
            return callback.onSuccess(_this8.signInUserSession, dataConfirm.UserConfirmationNecessary);
          }
          return callback.onSuccess(_this8.signInUserSession);
        });
        return undefined;
      });
      return undefined;
    });
  }

  /**
   * This is used by an authenticated user to change the current password
   * @param {string} oldUserPassword The current password.
   * @param {string} newUserPassword The requested new password.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.changePassword = function changePassword(oldUserPassword, newUserPassword, callback, clientMetadata) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }
    this.client.request('ChangePassword', {
      PreviousPassword: oldUserPassword,
      ProposedPassword: newUserPassword,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      ClientMetadata: clientMetadata
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to enable MFA for itself
   * @deprecated
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.enableMFA = function enableMFA(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }
    var mfaOptions = [];
    var mfaEnabled = {
      DeliveryMedium: 'SMS',
      AttributeName: 'phone_number'
    };
    mfaOptions.push(mfaEnabled);
    this.client.request('SetUserSettings', {
      MFAOptions: mfaOptions,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to enable MFA for itself
   * @param {IMfaSettings} smsMfaSettings the sms mfa settings
   * @param {IMFASettings} softwareTokenMfaSettings the software token mfa settings
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.setUserMfaPreference = function setUserMfaPreference(smsMfaSettings, softwareTokenMfaSettings, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }
    this.client.request('SetUserMFAPreference', {
      SMSMfaSettings: smsMfaSettings,
      SoftwareTokenMfaSettings: softwareTokenMfaSettings,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to disable MFA for itself
   * @deprecated
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.disableMFA = function disableMFA(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }
    var mfaOptions = [];
    this.client.request('SetUserSettings', {
      MFAOptions: mfaOptions,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to delete itself
   * @param {nodeCallback<string>} callback Called on success or error.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.deleteUser = function deleteUser(callback, clientMetadata) {
    var _this9 = this;
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }
    this.client.request('DeleteUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      ClientMetadata: clientMetadata
    }, function (err) {
      if (err) {
        return callback(err, null);
      }
      _this9.clearCachedUser();
      return callback(null, 'SUCCESS');
    });
    return undefined;
  }

  /**
   * @typedef {CognitoUserAttribute | { Name:string, Value:string }} AttributeArg
   */
  /**
   * This is used by an authenticated user to change a list of attributes
   * @param {AttributeArg[]} attributes A list of the new user attributes.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.updateAttributes = function updateAttributes(attributes, callback, clientMetadata) {
    var _this10 = this;
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback(new Error('User is not authenticated'), null);
    }
    this.client.request('UpdateUserAttributes', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      UserAttributes: attributes,
      ClientMetadata: clientMetadata
    }, function (err, result) {
      if (err) {
        return callback(err, null);
      }

      // update cached user
      return _this10.getUserData(function () {
        return callback(null, 'SUCCESS', result);
      }, {
        bypassCache: true
      });
    });
    return undefined;
  }

  /**
   * This is used by an authenticated user to get a list of attributes
   * @param {nodeCallback<CognitoUserAttribute[]>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.getUserAttributes = function getUserAttributes(callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }
    this.client.request('GetUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err, userData) {
      if (err) {
        return callback(err, null);
      }
      var attributeList = [];
      for (var i = 0; i < userData.UserAttributes.length; i++) {
        var attribute = {
          Name: userData.UserAttributes[i].Name,
          Value: userData.UserAttributes[i].Value
        };
        var userAttribute = new _CognitoUserAttribute__WEBPACK_IMPORTED_MODULE_10__["default"](attribute);
        attributeList.push(userAttribute);
      }
      return callback(null, attributeList);
    });
    return undefined;
  }

  /**
   * This was previously used by an authenticated user to get MFAOptions,
   * but no longer returns a meaningful response. Refer to the documentation for
   * how to setup and use MFA: https://docs.amplify.aws/lib/auth/mfa/q/platform/js
   * @deprecated
   * @param {nodeCallback<MFAOptions>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.getMFAOptions = function getMFAOptions(callback) {
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }
    this.client.request('GetUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err, userData) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, userData.MFAOptions);
    });
    return undefined;
  }

  /**
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   */;
  _proto.createGetUserRequest = function createGetUserRequest() {
    return this.client.promisifyRequest('GetUser', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    });
  }

  /**
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   */;
  _proto.refreshSessionIfPossible = function refreshSessionIfPossible(options) {
    var _this11 = this;
    if (options === void 0) {
      options = {};
    }
    // best effort, if not possible
    return new Promise(function (resolve) {
      var refresh = _this11.signInUserSession.getRefreshToken();
      if (refresh && refresh.getToken()) {
        _this11.refreshSession(refresh, resolve, options.clientMetadata);
      } else {
        resolve();
      }
    });
  }

  /**
   * @typedef {Object} GetUserDataOptions
   * @property {boolean} bypassCache - force getting data from Cognito service
   * @property {Record<string, string>} clientMetadata - clientMetadata for getSession
   */

  /**
   * This is used by an authenticated users to get the userData
   * @param {nodeCallback<UserData>} callback Called on success or error.
   * @param {GetUserDataOptions} params
   * @returns {void}
   */;
  _proto.getUserData = function getUserData(callback, params) {
    var _this12 = this;
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      this.clearCachedUserData();
      return callback(new Error('User is not authenticated'), null);
    }
    var userData = this.getUserDataFromCache();
    if (!userData) {
      this.fetchUserData().then(function (data) {
        callback(null, data);
      })["catch"](callback);
      return;
    }
    if (this.isFetchUserDataAndTokenRequired(params)) {
      this.fetchUserData().then(function (data) {
        return _this12.refreshSessionIfPossible(params).then(function () {
          return data;
        });
      }).then(function (data) {
        return callback(null, data);
      })["catch"](callback);
      return;
    }
    try {
      callback(null, JSON.parse(userData));
      return;
    } catch (err) {
      this.clearCachedUserData();
      callback(err, null);
      return;
    }
  }

  /**
   *
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   */;
  _proto.getUserDataFromCache = function getUserDataFromCache() {
    var userData = this.storage.getItem(this.userDataKey);
    return userData;
  }

  /**
   *
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   */;
  _proto.isFetchUserDataAndTokenRequired = function isFetchUserDataAndTokenRequired(params) {
    var _ref = params || {},
      _ref$bypassCache = _ref.bypassCache,
      bypassCache = _ref$bypassCache === void 0 ? false : _ref$bypassCache;
    return bypassCache;
  }
  /**
   *
   * PRIVATE ONLY: This is an internal only method and should not
   * be directly called by the consumers.
   */;
  _proto.fetchUserData = function fetchUserData() {
    var _this13 = this;
    return this.createGetUserRequest().then(function (data) {
      _this13.cacheUserData(data);
      return data;
    });
  }

  /**
   * This is used by an authenticated user to delete a list of attributes
   * @param {string[]} attributeList Names of the attributes to delete.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.deleteAttributes = function deleteAttributes(attributeList, callback) {
    var _this14 = this;
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      return callback(new Error('User is not authenticated'), null);
    }
    this.client.request('DeleteUserAttributes', {
      UserAttributeNames: attributeList,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback(err, null);
      }

      // update cached user
      return _this14.getUserData(function () {
        return callback(null, 'SUCCESS');
      }, {
        bypassCache: true
      });
    });
    return undefined;
  }

  /**
   * This is used by a user to resend a confirmation code
   * @param {nodeCallback<string>} callback Called on success or error.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.resendConfirmationCode = function resendConfirmationCode(callback, clientMetadata) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      Username: this.username,
      ClientMetadata: clientMetadata
    };
    this.client.request('ResendConfirmationCode', jsonReq, function (err, result) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, result);
    });
  }

  /**
   * @typedef {Object} GetSessionOptions
   * @property {Record<string, string>} clientMetadata - clientMetadata for getSession
   */

  /**
   * This is used to get a session, either from the session object
   * or from  the local storage, or by using a refresh token
   *
   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
   * @param {GetSessionOptions} options
   * @returns {void}
   */;
  _proto.getSession = function getSession(callback, options) {
    if (options === void 0) {
      options = {};
    }
    if (this.username == null) {
      return callback(new Error('Username is null. Cannot retrieve a new session'), null);
    }
    if (this.signInUserSession != null && this.signInUserSession.isValid()) {
      return callback(null, this.signInUserSession);
    }
    var keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId() + "." + this.username;
    var idTokenKey = keyPrefix + ".idToken";
    var accessTokenKey = keyPrefix + ".accessToken";
    var refreshTokenKey = keyPrefix + ".refreshToken";
    var clockDriftKey = keyPrefix + ".clockDrift";
    if (this.storage.getItem(idTokenKey)) {
      var idToken = new _CognitoIdToken__WEBPACK_IMPORTED_MODULE_6__["default"]({
        IdToken: this.storage.getItem(idTokenKey)
      });
      var accessToken = new _CognitoAccessToken__WEBPACK_IMPORTED_MODULE_5__["default"]({
        AccessToken: this.storage.getItem(accessTokenKey)
      });
      var refreshToken = new _CognitoRefreshToken__WEBPACK_IMPORTED_MODULE_7__["default"]({
        RefreshToken: this.storage.getItem(refreshTokenKey)
      });
      var clockDrift = parseInt(this.storage.getItem(clockDriftKey), 0) || 0;
      var sessionData = {
        IdToken: idToken,
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        ClockDrift: clockDrift
      };
      var cachedSession = new _CognitoUserSession__WEBPACK_IMPORTED_MODULE_8__["default"](sessionData);
      if (cachedSession.isValid()) {
        this.signInUserSession = cachedSession;
        return callback(null, this.signInUserSession);
      }
      if (!refreshToken.getToken()) {
        return callback(new Error('Cannot retrieve a new session. Please authenticate.'), null);
      }
      this.refreshSession(refreshToken, callback, options.clientMetadata);
    } else {
      callback(new Error('Local storage is missing an ID Token, Please authenticate'), null);
    }
    return undefined;
  }

  /**
   * This uses the refreshToken to retrieve a new session
   * @param {CognitoRefreshToken} refreshToken A previous session's refresh token.
   * @param {nodeCallback<CognitoUserSession>} callback Called on success or error.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.refreshSession = function refreshSession(refreshToken, callback, clientMetadata) {
    var _this15 = this;
    var wrappedCallback = this.pool.wrapRefreshSessionCallback ? this.pool.wrapRefreshSessionCallback(callback) : callback;
    var authParameters = {};
    authParameters.REFRESH_TOKEN = refreshToken.getToken();
    var keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId();
    var lastUserKey = keyPrefix + ".LastAuthUser";
    if (this.storage.getItem(lastUserKey)) {
      this.username = this.storage.getItem(lastUserKey);
      var deviceKeyKey = keyPrefix + "." + this.username + ".deviceKey";
      this.deviceKey = this.storage.getItem(deviceKeyKey);
      authParameters.DEVICE_KEY = this.deviceKey;
    }
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: authParameters,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('InitiateAuth', jsonReq, function (err, authResult) {
      if (err) {
        if (err.code === 'NotAuthorizedException') {
          _this15.clearCachedUser();
        }
        return wrappedCallback(err, null);
      }
      if (authResult) {
        var authenticationResult = authResult.AuthenticationResult;
        if (!Object.prototype.hasOwnProperty.call(authenticationResult, 'RefreshToken')) {
          authenticationResult.RefreshToken = refreshToken.getToken();
        }
        _this15.signInUserSession = _this15.getCognitoUserSession(authenticationResult);
        _this15.cacheTokens();
        return wrappedCallback(null, _this15.signInUserSession);
      }
      return undefined;
    });
  }

  /**
   * This is used to save the session tokens to local storage
   * @returns {void}
   */;
  _proto.cacheTokens = function cacheTokens() {
    var keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId();
    var idTokenKey = keyPrefix + "." + this.username + ".idToken";
    var accessTokenKey = keyPrefix + "." + this.username + ".accessToken";
    var refreshTokenKey = keyPrefix + "." + this.username + ".refreshToken";
    var clockDriftKey = keyPrefix + "." + this.username + ".clockDrift";
    var lastUserKey = keyPrefix + ".LastAuthUser";
    this.storage.setItem(idTokenKey, this.signInUserSession.getIdToken().getJwtToken());
    this.storage.setItem(accessTokenKey, this.signInUserSession.getAccessToken().getJwtToken());
    this.storage.setItem(refreshTokenKey, this.signInUserSession.getRefreshToken().getToken());
    this.storage.setItem(clockDriftKey, "" + this.signInUserSession.getClockDrift());
    this.storage.setItem(lastUserKey, this.username);
  }

  /**
   * This is to cache user data
   */;
  _proto.cacheUserData = function cacheUserData(userData) {
    this.storage.setItem(this.userDataKey, JSON.stringify(userData));
  }

  /**
   * This is to remove cached user data
   */;
  _proto.clearCachedUserData = function clearCachedUserData() {
    this.storage.removeItem(this.userDataKey);
  };
  _proto.clearCachedUser = function clearCachedUser() {
    this.clearCachedTokens();
    this.clearCachedUserData();
  }

  /**
   * This is used to cache the device key and device group and device password
   * @returns {void}
   */;
  _proto.cacheDeviceKeyAndPassword = function cacheDeviceKeyAndPassword() {
    var keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId() + "." + this.username;
    var deviceKeyKey = keyPrefix + ".deviceKey";
    var randomPasswordKey = keyPrefix + ".randomPasswordKey";
    var deviceGroupKeyKey = keyPrefix + ".deviceGroupKey";
    this.storage.setItem(deviceKeyKey, this.deviceKey);
    this.storage.setItem(randomPasswordKey, this.randomPassword);
    this.storage.setItem(deviceGroupKeyKey, this.deviceGroupKey);
  }

  /**
   * This is used to get current device key and device group and device password
   * @returns {void}
   */;
  _proto.getCachedDeviceKeyAndPassword = function getCachedDeviceKeyAndPassword() {
    var keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId() + "." + this.username;
    var deviceKeyKey = keyPrefix + ".deviceKey";
    var randomPasswordKey = keyPrefix + ".randomPasswordKey";
    var deviceGroupKeyKey = keyPrefix + ".deviceGroupKey";
    if (this.storage.getItem(deviceKeyKey)) {
      this.deviceKey = this.storage.getItem(deviceKeyKey);
      this.randomPassword = this.storage.getItem(randomPasswordKey);
      this.deviceGroupKey = this.storage.getItem(deviceGroupKeyKey);
    }
  }

  /**
   * This is used to clear the device key info from local storage
   * @returns {void}
   */;
  _proto.clearCachedDeviceKeyAndPassword = function clearCachedDeviceKeyAndPassword() {
    var keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId() + "." + this.username;
    var deviceKeyKey = keyPrefix + ".deviceKey";
    var randomPasswordKey = keyPrefix + ".randomPasswordKey";
    var deviceGroupKeyKey = keyPrefix + ".deviceGroupKey";
    this.storage.removeItem(deviceKeyKey);
    this.storage.removeItem(randomPasswordKey);
    this.storage.removeItem(deviceGroupKeyKey);
  }

  /**
   * This is used to clear the session tokens from local storage
   * @returns {void}
   */;
  _proto.clearCachedTokens = function clearCachedTokens() {
    var keyPrefix = "CognitoIdentityServiceProvider." + this.pool.getClientId();
    var idTokenKey = keyPrefix + "." + this.username + ".idToken";
    var accessTokenKey = keyPrefix + "." + this.username + ".accessToken";
    var refreshTokenKey = keyPrefix + "." + this.username + ".refreshToken";
    var lastUserKey = keyPrefix + ".LastAuthUser";
    var clockDriftKey = keyPrefix + "." + this.username + ".clockDrift";
    this.storage.removeItem(idTokenKey);
    this.storage.removeItem(accessTokenKey);
    this.storage.removeItem(refreshTokenKey);
    this.storage.removeItem(lastUserKey);
    this.storage.removeItem(clockDriftKey);
  }

  /**
   * This is used to build a user session from tokens retrieved in the authentication result
   * @param {object} authResult Successful auth response from server.
   * @returns {CognitoUserSession} The new user session.
   * @private
   */;
  _proto.getCognitoUserSession = function getCognitoUserSession(authResult) {
    var idToken = new _CognitoIdToken__WEBPACK_IMPORTED_MODULE_6__["default"](authResult);
    var accessToken = new _CognitoAccessToken__WEBPACK_IMPORTED_MODULE_5__["default"](authResult);
    var refreshToken = new _CognitoRefreshToken__WEBPACK_IMPORTED_MODULE_7__["default"](authResult);
    var sessionData = {
      IdToken: idToken,
      AccessToken: accessToken,
      RefreshToken: refreshToken
    };
    return new _CognitoUserSession__WEBPACK_IMPORTED_MODULE_8__["default"](sessionData);
  }

  /**
   * This is used to initiate a forgot password request
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {inputVerificationCode?} callback.inputVerificationCode
   *    Optional callback raised instead of onSuccess with response data.
   * @param {onSuccess} callback.onSuccess Called on success.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.forgotPassword = function forgotPassword(callback, clientMetadata) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      Username: this.username,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('ForgotPassword', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      if (typeof callback.inputVerificationCode === 'function') {
        return callback.inputVerificationCode(data);
      }
      return callback.onSuccess(data);
    });
  }

  /**
   * This is used to confirm a new password using a confirmationCode
   * @param {string} confirmationCode Code entered by user.
   * @param {string} newPassword Confirm new password.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<void>} callback.onSuccess Called on success.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.confirmPassword = function confirmPassword(confirmationCode, newPassword, callback, clientMetadata) {
    var jsonReq = {
      ClientId: this.pool.getClientId(),
      Username: this.username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('ConfirmForgotPassword', jsonReq, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
  }

  /**
   * This is used to initiate an attribute confirmation request
   * @param {string} attributeName User attribute that needs confirmation.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {inputVerificationCode} callback.inputVerificationCode Called on success.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.getAttributeVerificationCode = function getAttributeVerificationCode(attributeName, callback, clientMetadata) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    this.client.request('GetUserAttributeVerificationCode', {
      AttributeName: attributeName,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      ClientMetadata: clientMetadata
    }, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      if (typeof callback.inputVerificationCode === 'function') {
        return callback.inputVerificationCode(data);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to confirm an attribute using a confirmation code
   * @param {string} attributeName Attribute being confirmed.
   * @param {string} confirmationCode Code entered by user.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */;
  _proto.verifyAttribute = function verifyAttribute(attributeName, confirmationCode, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    this.client.request('VerifyUserAttribute', {
      AttributeName: attributeName,
      Code: confirmationCode,
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to get the device information using the current device key
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<*>} callback.onSuccess Called on success with device data.
   * @returns {void}
   */;
  _proto.getDevice = function getDevice(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    this.client.request('GetDevice', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey
    }, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess(data);
    });
    return undefined;
  }

  /**
   * This is used to forget a specific device
   * @param {string} deviceKey Device key.
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */;
  _proto.forgetSpecificDevice = function forgetSpecificDevice(deviceKey, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    this.client.request('ForgetDevice', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: deviceKey
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to forget the current device
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */;
  _proto.forgetDevice = function forgetDevice(callback) {
    var _this16 = this;
    this.forgetSpecificDevice(this.deviceKey, {
      onFailure: callback.onFailure,
      onSuccess: function onSuccess(result) {
        _this16.deviceKey = null;
        _this16.deviceGroupKey = null;
        _this16.randomPassword = null;
        _this16.clearCachedDeviceKeyAndPassword();
        return callback.onSuccess(result);
      }
    });
  }

  /**
   * This is used to set the device status as remembered
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */;
  _proto.setDeviceStatusRemembered = function setDeviceStatusRemembered(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    this.client.request('UpdateDeviceStatus', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey,
      DeviceRememberedStatus: 'remembered'
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to set the device status as not remembered
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */;
  _proto.setDeviceStatusNotRemembered = function setDeviceStatusNotRemembered(callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    this.client.request('UpdateDeviceStatus', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      DeviceKey: this.deviceKey,
      DeviceRememberedStatus: 'not_remembered'
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used to list all devices for a user
   *
   * @param {int} limit the number of devices returned in a call
   * @param {string | null} paginationToken the pagination token in case any was returned before
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<*>} callback.onSuccess Called on success with device list.
   * @returns {void}
   */;
  _proto.listDevices = function listDevices(limit, paginationToken, callback) {
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    var requestParams = {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
      Limit: limit
    };
    if (paginationToken) {
      requestParams.PaginationToken = paginationToken;
    }
    this.client.request('ListDevices', requestParams, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      return callback.onSuccess(data);
    });
    return undefined;
  }

  /**
   * This is used to globally revoke all tokens issued to a user
   * @param {object} callback Result callback map.
   * @param {onFailure} callback.onFailure Called on any error.
   * @param {onSuccess<string>} callback.onSuccess Called on success.
   * @returns {void}
   */;
  _proto.globalSignOut = function globalSignOut(callback) {
    var _this17 = this;
    if (this.signInUserSession == null || !this.signInUserSession.isValid()) {
      return callback.onFailure(new Error('User is not authenticated'));
    }
    this.client.request('GlobalSignOut', {
      AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
    }, function (err) {
      if (err) {
        return callback.onFailure(err);
      }
      _this17.clearCachedUser();
      return callback.onSuccess('SUCCESS');
    });
    return undefined;
  }

  /**
   * This is used for the user to signOut of the application and clear the cached tokens.
   * @returns {void}
   */;
  _proto.signOut = function signOut(revokeTokenCallback) {
    var _this18 = this;
    // If tokens won't be revoked, we just clean the client data.
    if (!revokeTokenCallback || typeof revokeTokenCallback !== 'function') {
      this.cleanClientData();
      return;
    }
    this.getSession(function (error, _session) {
      if (error) {
        return revokeTokenCallback(error);
      }
      _this18.revokeTokens(function (err) {
        _this18.cleanClientData();
        revokeTokenCallback(err);
      });
    });
  };
  _proto.revokeTokens = function revokeTokens(revokeTokenCallback) {
    if (revokeTokenCallback === void 0) {
      revokeTokenCallback = function revokeTokenCallback() {};
    }
    if (typeof revokeTokenCallback !== 'function') {
      throw new Error('Invalid revokeTokenCallback. It should be a function.');
    }
    var tokensToBeRevoked = [];
    if (!this.signInUserSession) {
      var error = new Error('User is not authenticated');
      return revokeTokenCallback(error);
    }
    if (!this.signInUserSession.getAccessToken()) {
      var _error = new Error('No Access token available');
      return revokeTokenCallback(_error);
    }
    var refreshToken = this.signInUserSession.getRefreshToken().getToken();
    var accessToken = this.signInUserSession.getAccessToken();
    if (this.isSessionRevocable(accessToken)) {
      if (refreshToken) {
        return this.revokeToken({
          token: refreshToken,
          callback: revokeTokenCallback
        });
      }
    }
    revokeTokenCallback();
  };
  _proto.isSessionRevocable = function isSessionRevocable(token) {
    if (token && typeof token.decodePayload === 'function') {
      try {
        var _token$decodePayload = token.decodePayload(),
          origin_jti = _token$decodePayload.origin_jti;
        return !!origin_jti;
      } catch (err) {
        // Nothing to do, token doesnt have origin_jti claim
      }
    }
    return false;
  };
  _proto.cleanClientData = function cleanClientData() {
    this.signInUserSession = null;
    this.clearCachedUser();
  };
  _proto.revokeToken = function revokeToken(_ref2) {
    var token = _ref2.token,
      callback = _ref2.callback;
    this.client.requestWithRetry('RevokeToken', {
      Token: token,
      ClientId: this.pool.getClientId()
    }, function (err) {
      if (err) {
        return callback(err);
      }
      callback();
    });
  }

  /**
   * This is used by a user trying to select a given MFA
   * @param {string} answerChallenge the mfa the user wants
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.sendMFASelectionAnswer = function sendMFASelectionAnswer(answerChallenge, callback) {
    var _this19 = this;
    var challengeResponses = {};
    challengeResponses.USERNAME = this.username;
    challengeResponses.ANSWER = answerChallenge;
    var jsonReq = {
      ChallengeName: 'SELECT_MFA_TYPE',
      ChallengeResponses: challengeResponses,
      ClientId: this.pool.getClientId(),
      Session: this.Session
    };
    if (this.getUserContextData()) {
      jsonReq.UserContextData = this.getUserContextData();
    }
    this.client.request('RespondToAuthChallenge', jsonReq, function (err, data) {
      if (err) {
        return callback.onFailure(err);
      }
      _this19.Session = data.Session;
      if (answerChallenge === 'SMS_MFA') {
        return callback.mfaRequired(data.ChallengeName, data.ChallengeParameters);
      }
      if (answerChallenge === 'SOFTWARE_TOKEN_MFA') {
        return callback.totpRequired(data.ChallengeName, data.ChallengeParameters);
      }
      return undefined;
    });
  }

  /**
   * This returns the user context data for advanced security feature.
   * @returns {string} the user context data from CognitoUserPool
   */;
  _proto.getUserContextData = function getUserContextData() {
    var pool = this.pool;
    return pool.getUserContextData(this.username);
  }

  /**
   * This is used by an authenticated or a user trying to authenticate to associate a TOTP MFA
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.associateSoftwareToken = function associateSoftwareToken(callback) {
    var _this20 = this;
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      this.client.request('AssociateSoftwareToken', {
        Session: this.Session
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        _this20.Session = data.Session;
        return callback.associateSecretCode(data.SecretCode);
      });
    } else {
      this.client.request('AssociateSoftwareToken', {
        AccessToken: this.signInUserSession.getAccessToken().getJwtToken()
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        return callback.associateSecretCode(data.SecretCode);
      });
    }
  }

  /**
   * This is used by an authenticated or a user trying to authenticate to verify a TOTP MFA
   * @param {string} totpCode The MFA code entered by the user.
   * @param {string} friendlyDeviceName The device name we are assigning to the device.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */;
  _proto.verifySoftwareToken = function verifySoftwareToken(totpCode, friendlyDeviceName, callback) {
    var _this21 = this;
    if (!(this.signInUserSession != null && this.signInUserSession.isValid())) {
      this.client.request('VerifySoftwareToken', {
        Session: this.Session,
        UserCode: totpCode,
        FriendlyDeviceName: friendlyDeviceName
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        _this21.Session = data.Session;
        var challengeResponses = {};
        challengeResponses.USERNAME = _this21.username;
        var jsonReq = {
          ChallengeName: 'MFA_SETUP',
          ClientId: _this21.pool.getClientId(),
          ChallengeResponses: challengeResponses,
          Session: _this21.Session
        };
        if (_this21.getUserContextData()) {
          jsonReq.UserContextData = _this21.getUserContextData();
        }
        _this21.client.request('RespondToAuthChallenge', jsonReq, function (errRespond, dataRespond) {
          if (errRespond) {
            return callback.onFailure(errRespond);
          }
          _this21.signInUserSession = _this21.getCognitoUserSession(dataRespond.AuthenticationResult);
          _this21.cacheTokens();
          return callback.onSuccess(_this21.signInUserSession);
        });
        return undefined;
      });
    } else {
      this.client.request('VerifySoftwareToken', {
        AccessToken: this.signInUserSession.getAccessToken().getJwtToken(),
        UserCode: totpCode,
        FriendlyDeviceName: friendlyDeviceName
      }, function (err, data) {
        if (err) {
          return callback.onFailure(err);
        }
        return callback.onSuccess(data);
      });
    }
  };
  return CognitoUser;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoUserAttribute.js":
/*!****************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoUserAttribute.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoUserAttribute)
/* harmony export */ });
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/** @class */
var CognitoUserAttribute = /*#__PURE__*/function () {
  /**
   * Constructs a new CognitoUserAttribute object
   * @param {string=} Name The record's name
   * @param {string=} Value The record's value
   */
  function CognitoUserAttribute(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      Name = _ref.Name,
      Value = _ref.Value;
    this.Name = Name || '';
    this.Value = Value || '';
  }

  /**
   * @returns {string} the record's value.
   */
  var _proto = CognitoUserAttribute.prototype;
  _proto.getValue = function getValue() {
    return this.Value;
  }

  /**
   * Sets the record's value.
   * @param {string} value The new value.
   * @returns {CognitoUserAttribute} The record for method chaining.
   */;
  _proto.setValue = function setValue(value) {
    this.Value = value;
    return this;
  }

  /**
   * @returns {string} the record's name.
   */;
  _proto.getName = function getName() {
    return this.Name;
  }

  /**
   * Sets the record's name
   * @param {string} name The new name.
   * @returns {CognitoUserAttribute} The record for method chaining.
   */;
  _proto.setName = function setName(name) {
    this.Name = name;
    return this;
  }

  /**
   * @returns {string} a string representation of the record.
   */;
  _proto.toString = function toString() {
    return JSON.stringify(this);
  }

  /**
   * @returns {object} a flat object representing the record.
   */;
  _proto.toJSON = function toJSON() {
    return {
      Name: this.Name,
      Value: this.Value
    };
  };
  return CognitoUserAttribute;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoUserPool.js":
/*!***********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoUserPool.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoUserPool)
/* harmony export */ });
/* harmony import */ var _Client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Client */ "./node_modules/amazon-cognito-identity-js/es/Client.js");
/* harmony import */ var _CognitoUser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CognitoUser */ "./node_modules/amazon-cognito-identity-js/es/CognitoUser.js");
/* harmony import */ var _StorageHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./StorageHelper */ "./node_modules/amazon-cognito-identity-js/es/StorageHelper.js");
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */




var USER_POOL_ID_MAX_LENGTH = 55;

/** @class */
var CognitoUserPool = /*#__PURE__*/function () {
  /**
   * Constructs a new CognitoUserPool object
   * @param {object} data Creation options.
   * @param {string} data.UserPoolId Cognito user pool id.
   * @param {string} data.ClientId User pool application client id.
   * @param {string} data.endpoint Optional custom service endpoint.
   * @param {object} data.fetchOptions Optional options for fetch API.
   *        (only credentials option is supported)
   * @param {object} data.Storage Optional storage object.
   * @param {boolean} data.AdvancedSecurityDataCollectionFlag Optional:
   *        boolean flag indicating if the data collection is enabled
   *        to support cognito advanced security features. By default, this
   *        flag is set to true.
   */
  function CognitoUserPool(data, wrapRefreshSessionCallback) {
    var _ref = data || {},
      UserPoolId = _ref.UserPoolId,
      ClientId = _ref.ClientId,
      endpoint = _ref.endpoint,
      fetchOptions = _ref.fetchOptions,
      AdvancedSecurityDataCollectionFlag = _ref.AdvancedSecurityDataCollectionFlag;
    if (!UserPoolId || !ClientId) {
      throw new Error('Both UserPoolId and ClientId are required.');
    }
    if (UserPoolId.length > USER_POOL_ID_MAX_LENGTH || !/^[\w-]+_[0-9a-zA-Z]+$/.test(UserPoolId)) {
      throw new Error('Invalid UserPoolId format.');
    }
    var region = UserPoolId.split('_')[0];
    this.userPoolId = UserPoolId;
    this.clientId = ClientId;
    this.client = new _Client__WEBPACK_IMPORTED_MODULE_0__["default"](region, endpoint, fetchOptions);

    /**
     * By default, AdvancedSecurityDataCollectionFlag is set to true,
     * if no input value is provided.
     */
    this.advancedSecurityDataCollectionFlag = AdvancedSecurityDataCollectionFlag !== false;
    this.storage = data.Storage || new _StorageHelper__WEBPACK_IMPORTED_MODULE_2__["default"]().getStorage();
    if (wrapRefreshSessionCallback) {
      this.wrapRefreshSessionCallback = wrapRefreshSessionCallback;
    }
  }

  /**
   * @returns {string} the user pool id
   */
  var _proto = CognitoUserPool.prototype;
  _proto.getUserPoolId = function getUserPoolId() {
    return this.userPoolId;
  }

  /**
   * @returns {string} the user pool name
   */;
  _proto.getUserPoolName = function getUserPoolName() {
    return this.getUserPoolId().split('_')[1];
  }

  /**
   * @returns {string} the client id
   */;
  _proto.getClientId = function getClientId() {
    return this.clientId;
  }

  /**
   * @typedef {object} SignUpResult
   * @property {CognitoUser} user New user.
   * @property {bool} userConfirmed If the user is already confirmed.
   */
  /**
   * method for signing up a user
   * @param {string} username User's username.
   * @param {string} password Plain-text initial password entered by user.
   * @param {(AttributeArg[])=} userAttributes New user attributes.
   * @param {(AttributeArg[])=} validationData Application metadata.
   * @param {(AttributeArg[])=} clientMetadata Client metadata.
   * @param {nodeCallback<SignUpResult>} callback Called on error or with the new user.
   * @param {ClientMetadata} clientMetadata object which is passed from client to Cognito Lambda trigger
   * @returns {void}
   */;
  _proto.signUp = function signUp(username, password, userAttributes, validationData, callback, clientMetadata) {
    var _this = this;
    var jsonReq = {
      ClientId: this.clientId,
      Username: username,
      Password: password,
      UserAttributes: userAttributes,
      ValidationData: validationData,
      ClientMetadata: clientMetadata
    };
    if (this.getUserContextData(username)) {
      jsonReq.UserContextData = this.getUserContextData(username);
    }
    this.client.request('SignUp', jsonReq, function (err, data) {
      if (err) {
        return callback(err, null);
      }
      var cognitoUser = {
        Username: username,
        Pool: _this,
        Storage: _this.storage
      };
      var returnData = {
        user: new _CognitoUser__WEBPACK_IMPORTED_MODULE_1__["default"](cognitoUser),
        userConfirmed: data.UserConfirmed,
        userSub: data.UserSub,
        codeDeliveryDetails: data.CodeDeliveryDetails
      };
      return callback(null, returnData);
    });
  }

  /**
   * method for getting the current user of the application from the local storage
   *
   * @returns {CognitoUser} the user retrieved from storage
   */;
  _proto.getCurrentUser = function getCurrentUser() {
    var lastUserKey = "CognitoIdentityServiceProvider." + this.clientId + ".LastAuthUser";
    var lastAuthUser = this.storage.getItem(lastUserKey);
    if (lastAuthUser) {
      var cognitoUser = {
        Username: lastAuthUser,
        Pool: this,
        Storage: this.storage
      };
      return new _CognitoUser__WEBPACK_IMPORTED_MODULE_1__["default"](cognitoUser);
    }
    return null;
  }

  /**
   * This method returns the encoded data string used for cognito advanced security feature.
   * This would be generated only when developer has included the JS used for collecting the
   * data on their client. Please refer to documentation to know more about using AdvancedSecurity
   * features
   * @param {string} username the username for the context data
   * @returns {string} the user context data
   **/;
  _proto.getUserContextData = function getUserContextData(username) {
    if (typeof AmazonCognitoAdvancedSecurityData === 'undefined') {
      return undefined;
    }
    /* eslint-disable */
    var amazonCognitoAdvancedSecurityDataConst = AmazonCognitoAdvancedSecurityData;
    /* eslint-enable */

    if (this.advancedSecurityDataCollectionFlag) {
      var advancedSecurityData = amazonCognitoAdvancedSecurityDataConst.getData(username, this.userPoolId, this.clientId);
      if (advancedSecurityData) {
        var userContextData = {
          EncodedData: advancedSecurityData
        };
        return userContextData;
      }
    }
    return {};
  };
  return CognitoUserPool;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CognitoUserSession.js":
/*!**************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CognitoUserSession.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CognitoUserSession)
/* harmony export */ });
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/** @class */
var CognitoUserSession = /*#__PURE__*/function () {
  /**
   * Constructs a new CognitoUserSession object
   * @param {CognitoIdToken} IdToken The session's Id token.
   * @param {CognitoRefreshToken=} RefreshToken The session's refresh token.
   * @param {CognitoAccessToken} AccessToken The session's access token.
   * @param {int} ClockDrift The saved computer's clock drift or undefined to force calculation.
   */
  function CognitoUserSession(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      IdToken = _ref.IdToken,
      RefreshToken = _ref.RefreshToken,
      AccessToken = _ref.AccessToken,
      ClockDrift = _ref.ClockDrift;
    if (AccessToken == null || IdToken == null) {
      throw new Error('Id token and Access Token must be present.');
    }
    this.idToken = IdToken;
    this.refreshToken = RefreshToken;
    this.accessToken = AccessToken;
    this.clockDrift = ClockDrift === undefined ? this.calculateClockDrift() : ClockDrift;
  }

  /**
   * @returns {CognitoIdToken} the session's Id token
   */
  var _proto = CognitoUserSession.prototype;
  _proto.getIdToken = function getIdToken() {
    return this.idToken;
  }

  /**
   * @returns {CognitoRefreshToken} the session's refresh token
   */;
  _proto.getRefreshToken = function getRefreshToken() {
    return this.refreshToken;
  }

  /**
   * @returns {CognitoAccessToken} the session's access token
   */;
  _proto.getAccessToken = function getAccessToken() {
    return this.accessToken;
  }

  /**
   * @returns {int} the session's clock drift
   */;
  _proto.getClockDrift = function getClockDrift() {
    return this.clockDrift;
  }

  /**
   * @returns {int} the computer's clock drift
   */;
  _proto.calculateClockDrift = function calculateClockDrift() {
    var now = Math.floor(new Date() / 1000);
    var iat = Math.min(this.accessToken.getIssuedAt(), this.idToken.getIssuedAt());
    return now - iat;
  }

  /**
   * Checks to see if the session is still valid based on session expiry information found
   * in tokens and the current time (adjusted with clock drift)
   * @returns {boolean} if the session is still valid
   */;
  _proto.isValid = function isValid() {
    var now = Math.floor(new Date() / 1000);
    var adjusted = now - this.clockDrift;
    return adjusted < this.accessToken.getExpiration() && adjusted < this.idToken.getExpiration();
  };
  return CognitoUserSession;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/CookieStorage.js":
/*!*********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/CookieStorage.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CookieStorage)
/* harmony export */ });
/* harmony import */ var js_cookie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! js-cookie */ "./node_modules/js-cookie/src/js.cookie.js");
/* harmony import */ var js_cookie__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(js_cookie__WEBPACK_IMPORTED_MODULE_0__);


/** @class */
var CookieStorage = /*#__PURE__*/function () {
  /**
   * Constructs a new CookieStorage object
   * @param {object} data Creation options.
   * @param {string} data.domain Cookies domain (default: domain of the page
   * 				where the cookie was created, excluding subdomains)
   * @param {string} data.path Cookies path (default: '/')
   * @param {integer} data.expires Cookie expiration (in days, default: 365)
   * @param {boolean} data.secure Cookie secure flag (default: true)
   * @param {string} data.sameSite Cookie request behavior (default: null)
   */
  function CookieStorage(data) {
    if (data === void 0) {
      data = {};
    }
    if (data.domain) {
      this.domain = data.domain;
    }
    if (data.path) {
      this.path = data.path;
    } else {
      this.path = '/';
    }
    if (Object.prototype.hasOwnProperty.call(data, 'expires')) {
      this.expires = data.expires;
    } else {
      this.expires = 365;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'secure')) {
      this.secure = data.secure;
    } else {
      this.secure = true;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'sameSite')) {
      if (!['strict', 'lax', 'none'].includes(data.sameSite)) {
        throw new Error('The sameSite value of cookieStorage must be "lax", "strict" or "none".');
      }
      if (data.sameSite === 'none' && !this.secure) {
        throw new Error('sameSite = None requires the Secure attribute in latest browser versions.');
      }
      this.sameSite = data.sameSite;
    } else {
      this.sameSite = null;
    }
  }

  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  var _proto = CookieStorage.prototype;
  _proto.setItem = function setItem(key, value) {
    var options = {
      path: this.path,
      expires: this.expires,
      domain: this.domain,
      secure: this.secure
    };
    if (this.sameSite) {
      options.sameSite = this.sameSite;
    }
    js_cookie__WEBPACK_IMPORTED_MODULE_0__.set(key, value, options);
    return js_cookie__WEBPACK_IMPORTED_MODULE_0__.get(key);
  }

  /**
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */;
  _proto.getItem = function getItem(key) {
    return js_cookie__WEBPACK_IMPORTED_MODULE_0__.get(key);
  }

  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */;
  _proto.removeItem = function removeItem(key) {
    var options = {
      path: this.path,
      expires: this.expires,
      domain: this.domain,
      secure: this.secure
    };
    if (this.sameSite) {
      options.sameSite = this.sameSite;
    }
    return js_cookie__WEBPACK_IMPORTED_MODULE_0__.remove(key, options);
  }

  /**
   * This is used to clear the storage of optional
   * items that were previously set
   * @returns {} an empty object
   */;
  _proto.clear = function clear() {
    var cookies = js_cookie__WEBPACK_IMPORTED_MODULE_0__.get();
    var numKeys = Object.keys(cookies).length;
    for (var index = 0; index < numKeys; ++index) {
      this.removeItem(Object.keys(cookies)[index]);
    }
    return {};
  };
  return CookieStorage;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/DateHelper.js":
/*!******************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/DateHelper.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DateHelper)
/* harmony export */ });
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** @class */
var DateHelper = /*#__PURE__*/function () {
  function DateHelper() {}
  var _proto = DateHelper.prototype;
  /**
   * @returns {string} The current time in "ddd MMM D HH:mm:ss UTC YYYY" format.
   */
  _proto.getNowString = function getNowString() {
    var now = new Date();
    var weekDay = weekNames[now.getUTCDay()];
    var month = monthNames[now.getUTCMonth()];
    var day = now.getUTCDate();
    var hours = now.getUTCHours();
    if (hours < 10) {
      hours = "0" + hours;
    }
    var minutes = now.getUTCMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    var seconds = now.getUTCSeconds();
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var year = now.getUTCFullYear();

    // ddd MMM D HH:mm:ss UTC YYYY
    var dateNow = weekDay + " " + month + " " + day + " " + hours + ":" + minutes + ":" + seconds + " UTC " + year;
    return dateNow;
  };
  return DateHelper;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/Platform/constants.js":
/*!**************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/Platform/constants.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AUTH_CATEGORY: () => (/* binding */ AUTH_CATEGORY),
/* harmony export */   FRAMEWORK: () => (/* binding */ FRAMEWORK)
/* harmony export */ });
var FRAMEWORK = {
  None: '0',
  ReactNative: '1'
};
var AUTH_CATEGORY = 'auth';

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/Platform/index.js":
/*!**********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/Platform/index.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Platform: () => (/* binding */ Platform),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getUserAgent: () => (/* binding */ getUserAgent)
/* harmony export */ });
/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./version */ "./node_modules/amazon-cognito-identity-js/es/Platform/version.js");
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

var BASE_USER_AGENT = "aws-amplify/" + _version__WEBPACK_IMPORTED_MODULE_0__.version;
var Platform = {
  userAgent: BASE_USER_AGENT,
  isReactNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
};
var getUserAgent = function getUserAgent() {
  return Platform.userAgent;
};

/**
 * @deprecated use named import
 */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Platform);

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/Platform/version.js":
/*!************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/Platform/version.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
// generated by genversion
var version = '5.0.4';

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/StorageHelper.js":
/*!*********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/StorageHelper.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MemoryStorage: () => (/* binding */ MemoryStorage),
/* harmony export */   "default": () => (/* binding */ StorageHelper)
/* harmony export */ });
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

var dataMemory = {};

/** @class */
var MemoryStorage = /*#__PURE__*/function () {
  function MemoryStorage() {}
  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  MemoryStorage.setItem = function setItem(key, value) {
    dataMemory[key] = value;
    return dataMemory[key];
  }

  /**
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */;
  MemoryStorage.getItem = function getItem(key) {
    return Object.prototype.hasOwnProperty.call(dataMemory, key) ? dataMemory[key] : undefined;
  }

  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {boolean} return true
   */;
  MemoryStorage.removeItem = function removeItem(key) {
    return delete dataMemory[key];
  }

  /**
   * This is used to clear the storage
   * @returns {string} nothing
   */;
  MemoryStorage.clear = function clear() {
    dataMemory = {};
    return dataMemory;
  };
  return MemoryStorage;
}();

/** @class */
var StorageHelper = /*#__PURE__*/function () {
  /**
   * This is used to get a storage object
   * @returns {object} the storage
   */
  function StorageHelper() {
    try {
      this.storageWindow = window.localStorage;
      this.storageWindow.setItem('aws.cognito.test-ls', 1);
      this.storageWindow.removeItem('aws.cognito.test-ls');
    } catch (exception) {
      this.storageWindow = MemoryStorage;
    }
  }

  /**
   * This is used to return the storage
   * @returns {object} the storage
   */
  var _proto = StorageHelper.prototype;
  _proto.getStorage = function getStorage() {
    return this.storageWindow;
  };
  return StorageHelper;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/UserAgent.js":
/*!*****************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/UserAgent.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAuthCategoryToCognitoUserAgent: () => (/* binding */ addAuthCategoryToCognitoUserAgent),
/* harmony export */   addFrameworkToCognitoUserAgent: () => (/* binding */ addFrameworkToCognitoUserAgent),
/* harmony export */   appendToCognitoUserAgent: () => (/* binding */ appendToCognitoUserAgent),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getAmplifyUserAgent: () => (/* binding */ getAmplifyUserAgent)
/* harmony export */ });
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Platform */ "./node_modules/amazon-cognito-identity-js/es/Platform/index.js");
/* harmony import */ var _Platform_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Platform/constants */ "./node_modules/amazon-cognito-identity-js/es/Platform/constants.js");



// constructor
function UserAgent() {}
// public
UserAgent.prototype.userAgent = (0,_Platform__WEBPACK_IMPORTED_MODULE_0__.getUserAgent)();
var appendToCognitoUserAgent = function appendToCognitoUserAgent(content) {
  if (!content) {
    return;
  }
  if (UserAgent.prototype.userAgent && !UserAgent.prototype.userAgent.includes(content)) {
    UserAgent.prototype.userAgent = UserAgent.prototype.userAgent.concat(' ', content);
  }
  if (!UserAgent.prototype.userAgent || UserAgent.prototype.userAgent === '') {
    UserAgent.prototype.userAgent = content;
  }
};
var addAuthCategoryToCognitoUserAgent = function addAuthCategoryToCognitoUserAgent() {
  UserAgent.category = _Platform_constants__WEBPACK_IMPORTED_MODULE_1__.AUTH_CATEGORY;
};
var addFrameworkToCognitoUserAgent = function addFrameworkToCognitoUserAgent(framework) {
  UserAgent.framework = framework;
};
var getAmplifyUserAgent = function getAmplifyUserAgent(action) {
  var uaCategoryAction = UserAgent.category ? " " + UserAgent.category : '';
  var uaFramework = UserAgent.framework ? " framework/" + UserAgent.framework : '';
  var userAgent = "" + UserAgent.prototype.userAgent + uaCategoryAction + uaFramework;
  return userAgent;
};

// class for defining the amzn user-agent
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UserAgent);

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/index.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthenticationDetails: () => (/* reexport safe */ _AuthenticationDetails__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   AuthenticationHelper: () => (/* reexport safe */ _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   CognitoAccessToken: () => (/* reexport safe */ _CognitoAccessToken__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   CognitoIdToken: () => (/* reexport safe */ _CognitoIdToken__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   CognitoRefreshToken: () => (/* reexport safe */ _CognitoRefreshToken__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   CognitoUser: () => (/* reexport safe */ _CognitoUser__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   CognitoUserAttribute: () => (/* reexport safe */ _CognitoUserAttribute__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   CognitoUserPool: () => (/* reexport safe */ _CognitoUserPool__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   CognitoUserSession: () => (/* reexport safe */ _CognitoUserSession__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   CookieStorage: () => (/* reexport safe */ _CookieStorage__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   DateHelper: () => (/* reexport safe */ _DateHelper__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   WordArray: () => (/* reexport safe */ _utils_WordArray__WEBPACK_IMPORTED_MODULE_12__["default"]),
/* harmony export */   appendToCognitoUserAgent: () => (/* reexport safe */ _UserAgent__WEBPACK_IMPORTED_MODULE_11__.appendToCognitoUserAgent)
/* harmony export */ });
/* harmony import */ var _AuthenticationDetails__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AuthenticationDetails */ "./node_modules/amazon-cognito-identity-js/es/AuthenticationDetails.js");
/* harmony import */ var _AuthenticationHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AuthenticationHelper */ "./node_modules/amazon-cognito-identity-js/es/AuthenticationHelper.js");
/* harmony import */ var _CognitoAccessToken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CognitoAccessToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoAccessToken.js");
/* harmony import */ var _CognitoIdToken__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CognitoIdToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoIdToken.js");
/* harmony import */ var _CognitoRefreshToken__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CognitoRefreshToken */ "./node_modules/amazon-cognito-identity-js/es/CognitoRefreshToken.js");
/* harmony import */ var _CognitoUser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./CognitoUser */ "./node_modules/amazon-cognito-identity-js/es/CognitoUser.js");
/* harmony import */ var _CognitoUserAttribute__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./CognitoUserAttribute */ "./node_modules/amazon-cognito-identity-js/es/CognitoUserAttribute.js");
/* harmony import */ var _CognitoUserPool__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./CognitoUserPool */ "./node_modules/amazon-cognito-identity-js/es/CognitoUserPool.js");
/* harmony import */ var _CognitoUserSession__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./CognitoUserSession */ "./node_modules/amazon-cognito-identity-js/es/CognitoUserSession.js");
/* harmony import */ var _CookieStorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./CookieStorage */ "./node_modules/amazon-cognito-identity-js/es/CookieStorage.js");
/* harmony import */ var _DateHelper__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./DateHelper */ "./node_modules/amazon-cognito-identity-js/es/DateHelper.js");
/* harmony import */ var _UserAgent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./UserAgent */ "./node_modules/amazon-cognito-identity-js/es/UserAgent.js");
/* harmony import */ var _utils_WordArray__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./utils/WordArray */ "./node_modules/amazon-cognito-identity-js/es/utils/WordArray.js");
/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */















/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/internals/index.js":
/*!***********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/internals/index.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAuthCategoryToCognitoUserAgent: () => (/* reexport safe */ _UserAgent__WEBPACK_IMPORTED_MODULE_0__.addAuthCategoryToCognitoUserAgent),
/* harmony export */   addFrameworkToCognitoUserAgent: () => (/* reexport safe */ _UserAgent__WEBPACK_IMPORTED_MODULE_0__.addFrameworkToCognitoUserAgent)
/* harmony export */ });
/* harmony import */ var _UserAgent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../UserAgent */ "./node_modules/amazon-cognito-identity-js/es/UserAgent.js");


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/utils/WordArray.js":
/*!***********************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/utils/WordArray.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WordArray)
/* harmony export */ });
/* harmony import */ var _cryptoSecureRandomInt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cryptoSecureRandomInt */ "./node_modules/amazon-cognito-identity-js/es/utils/cryptoSecureRandomInt.js");


/**
 * Hex encoding strategy.
 * Converts a word array to a hex string.
 * @param {WordArray} wordArray The word array.
 * @return {string} The hex string.
 * @static
 */
function hexStringify(wordArray) {
  // Shortcuts
  var words = wordArray.words;
  var sigBytes = wordArray.sigBytes;

  // Convert
  var hexChars = [];
  for (var i = 0; i < sigBytes; i++) {
    var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
    hexChars.push((bite >>> 4).toString(16));
    hexChars.push((bite & 0x0f).toString(16));
  }
  return hexChars.join('');
}
var WordArray = /*#__PURE__*/function () {
  function WordArray(words, sigBytes) {
    words = this.words = words || [];
    if (sigBytes != undefined) {
      this.sigBytes = sigBytes;
    } else {
      this.sigBytes = words.length * 4;
    }
  }
  var _proto = WordArray.prototype;
  _proto.random = function random(nBytes) {
    var words = [];
    for (var i = 0; i < nBytes; i += 4) {
      words.push((0,_cryptoSecureRandomInt__WEBPACK_IMPORTED_MODULE_0__["default"])());
    }
    return new WordArray(words, nBytes);
  };
  _proto.toString = function toString() {
    return hexStringify(this);
  };
  return WordArray;
}();


/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/es/utils/cryptoSecureRandomInt.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/es/utils/cryptoSecureRandomInt.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ cryptoSecureRandomInt)
/* harmony export */ });
var crypto;

// Native crypto from window (Browser)
if (typeof window !== 'undefined' && window.crypto) {
  crypto = window.crypto;
}

// Native (experimental IE 11) crypto from window (Browser)
if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
  crypto = window.msCrypto;
}

// Native crypto from global (NodeJS)
if (!crypto && typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g.crypto) {
  crypto = __webpack_require__.g.crypto;
}

// Native crypto import via require (NodeJS)
if (!crypto && "function" === 'function') {
  try {
    crypto = __webpack_require__(/*! crypto */ "?4501");
  } catch (err) {}
}

/*
 * Cryptographically secure pseudorandom number generator
 * As Math.random() is cryptographically not safe to use
 */
function cryptoSecureRandomInt() {
  if (crypto) {
    // Use getRandomValues method (Browser)
    if (typeof crypto.getRandomValues === 'function') {
      try {
        return crypto.getRandomValues(new Uint32Array(1))[0];
      } catch (err) {}
    }

    // Use randomBytes method (NodeJS)
    if (typeof crypto.randomBytes === 'function') {
      try {
        return crypto.randomBytes(4).readInt32LE();
      } catch (err) {}
    }
  }
  throw new Error('Native crypto module could not be used to get secure random number.');
}

/***/ }),

/***/ "./node_modules/amazon-cognito-identity-js/node_modules/buffer/index.js":
/*!******************************************************************************!*\
  !*** ./node_modules/amazon-cognito-identity-js/node_modules/buffer/index.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
var isArray = __webpack_require__(/*! isarray */ "./node_modules/isarray/index.js")

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = __webpack_require__.g.TYPED_ARRAY_SUPPORT !== undefined
  ? __webpack_require__.g.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/styles/auth.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/styles/auth.css ***!
  \*******************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/* authStyles.css */\n\nbody {\n    font-family: 'Arial', sans-serif;\n    background-color: #f4f4f4;\n    margin: 0;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    height: 100vh;\n}\n\n#welcome-text {\n    font-size: 24px;\n    text-align: center;\n    margin-bottom: 20px;\n}\n\n#auth-container {\n    background: #fff;\n    padding: 20px 60px 15px 30px;\n    border-radius: 5px;\n    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\n    width: 300px;\n    text-align: center;\n}\n\ninput[type=\"text\"],\ninput[type=\"password\"],\ninput[type=\"email\"] {\n    width: 100%;\n    padding: 10px;\n    margin: 10px 0;\n    border: 1px solid #ddd;\n    border-radius: 4px;\n    font-size: 16px;\n    outline: none;\n}\n\nbutton {\n    width: 100%;\n    padding: 10px;\n    margin: 10px 0;\n    background-color: #007BFF;\n    color: #fff;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 16px;\n    transition: background-color 0.3s;\n}\n\nbutton:hover {\n    background-color: #0056b3;\n}\n\n\n#facebookSignInButton {\n    background-color: #1877F2;\n    color: white;\n    border: none;\n    padding: 10px 20px;\n    border-radius: 4px;\n    cursor: pointer;\n}\n\n#facebookSignInButton:hover {\n    background-color: #1664D1;\n}", "",{"version":3,"sources":["webpack://./src/styles/auth.css"],"names":[],"mappings":"AAAA,mBAAmB;;AAEnB;IACI,gCAAgC;IAChC,yBAAyB;IACzB,SAAS;IACT,UAAU;IACV,aAAa;IACb,mBAAmB;IACnB,uBAAuB;IACvB,aAAa;AACjB;;AAEA;IACI,eAAe;IACf,kBAAkB;IAClB,mBAAmB;AACvB;;AAEA;IACI,gBAAgB;IAChB,4BAA4B;IAC5B,kBAAkB;IAClB,uCAAuC;IACvC,YAAY;IACZ,kBAAkB;AACtB;;AAEA;;;IAGI,WAAW;IACX,aAAa;IACb,cAAc;IACd,sBAAsB;IACtB,kBAAkB;IAClB,eAAe;IACf,aAAa;AACjB;;AAEA;IACI,WAAW;IACX,aAAa;IACb,cAAc;IACd,yBAAyB;IACzB,WAAW;IACX,YAAY;IACZ,kBAAkB;IAClB,eAAe;IACf,eAAe;IACf,iCAAiC;AACrC;;AAEA;IACI,yBAAyB;AAC7B;;;AAGA;IACI,yBAAyB;IACzB,YAAY;IACZ,YAAY;IACZ,kBAAkB;IAClB,kBAAkB;IAClB,eAAe;AACnB;;AAEA;IACI,yBAAyB;AAC7B","sourcesContent":["/* authStyles.css */\n\nbody {\n    font-family: 'Arial', sans-serif;\n    background-color: #f4f4f4;\n    margin: 0;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    height: 100vh;\n}\n\n#welcome-text {\n    font-size: 24px;\n    text-align: center;\n    margin-bottom: 20px;\n}\n\n#auth-container {\n    background: #fff;\n    padding: 20px 60px 15px 30px;\n    border-radius: 5px;\n    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\n    width: 300px;\n    text-align: center;\n}\n\ninput[type=\"text\"],\ninput[type=\"password\"],\ninput[type=\"email\"] {\n    width: 100%;\n    padding: 10px;\n    margin: 10px 0;\n    border: 1px solid #ddd;\n    border-radius: 4px;\n    font-size: 16px;\n    outline: none;\n}\n\nbutton {\n    width: 100%;\n    padding: 10px;\n    margin: 10px 0;\n    background-color: #007BFF;\n    color: #fff;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 16px;\n    transition: background-color 0.3s;\n}\n\nbutton:hover {\n    background-color: #0056b3;\n}\n\n\n#facebookSignInButton {\n    background-color: #1877F2;\n    color: white;\n    border: none;\n    padding: 10px 20px;\n    border-radius: 4px;\n    cursor: pointer;\n}\n\n#facebookSignInButton:hover {\n    background-color: #1664D1;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/cssWithMappingToString.js ***!
  \************************************************************************/
/***/ ((module) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ "./node_modules/isarray/index.js":
/*!***************************************!*\
  !*** ./node_modules/isarray/index.js ***!
  \***************************************/
/***/ ((module) => {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/isomorphic-unfetch/browser.js":
/*!****************************************************!*\
  !*** ./node_modules/isomorphic-unfetch/browser.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = self.fetch || (self.fetch = (__webpack_require__(/*! unfetch */ "./node_modules/unfetch/dist/unfetch.module.js")["default"]) || __webpack_require__(/*! unfetch */ "./node_modules/unfetch/dist/unfetch.module.js"));


/***/ }),

/***/ "./node_modules/js-cookie/src/js.cookie.js":
/*!*************************************************!*\
  !*** ./node_modules/js-cookie/src/js.cookie.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.2.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader;
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		registeredInModuleLoader = true;
	}
	if (true) {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function decode (s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	function init (converter) {
		function api() {}

		function set (key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({
				path: '/'
			}, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			value = converter.write ?
				converter.write(value, key) :
				encodeURIComponent(String(value))
					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key))
				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
				.replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		function get (key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		api.get = function (key) {
			return get(key, false /* read as raw */);
		};
		api.getJSON = function (key) {
			return get(key, true /* read as json */);
		};
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),

/***/ "./node_modules/querystring/decode.js":
/*!********************************************!*\
  !*** ./node_modules/querystring/decode.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};


/***/ }),

/***/ "./node_modules/querystring/encode.js":
/*!********************************************!*\
  !*** ./node_modules/querystring/encode.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};


/***/ }),

/***/ "./node_modules/querystring/index.js":
/*!*******************************************!*\
  !*** ./node_modules/querystring/index.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.decode = exports.parse = __webpack_require__(/*! ./decode */ "./node_modules/querystring/decode.js");
exports.encode = exports.stringify = __webpack_require__(/*! ./encode */ "./node_modules/querystring/encode.js");


/***/ }),

/***/ "./src/styles/auth.css":
/*!*****************************!*\
  !*** ./src/styles/auth.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_auth_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./auth.css */ "./node_modules/css-loader/dist/cjs.js!./src/styles/auth.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_auth_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_auth_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/unfetch/dist/unfetch.module.js":
/*!*****************************************************!*\
  !*** ./node_modules/unfetch/dist/unfetch.module.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(e,n){return n=n||{},new Promise(function(t,r){var s=new XMLHttpRequest,o=[],u=[],i={},a=function(){return{ok:2==(s.status/100|0),statusText:s.statusText,status:s.status,url:s.responseURL,text:function(){return Promise.resolve(s.responseText)},json:function(){return Promise.resolve(s.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([s.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var l in s.open(n.method||"get",e,!0),s.onload=function(){s.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t}),t(a())},s.onerror=r,s.withCredentials="include"==n.credentials,n.headers)s.setRequestHeader(l,n.headers[l]);s.send(n.body||null)})}
//# sourceMappingURL=unfetch.module.js.map


/***/ }),

/***/ "./node_modules/universal-cookie/es6/Cookies.js":
/*!******************************************************!*\
  !*** ./node_modules/universal-cookie/es6/Cookies.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var cookie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cookie */ "./node_modules/universal-cookie/node_modules/cookie/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./node_modules/universal-cookie/es6/utils.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


var Cookies = /** @class */ (function () {
    function Cookies(cookies, options) {
        var _this = this;
        this.changeListeners = [];
        this.HAS_DOCUMENT_COOKIE = false;
        this.cookies = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.parseCookies)(cookies, options);
        new Promise(function () {
            _this.HAS_DOCUMENT_COOKIE = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.hasDocumentCookie)();
        }).catch(function () { });
    }
    Cookies.prototype._updateBrowserValues = function (parseOptions) {
        if (!this.HAS_DOCUMENT_COOKIE) {
            return;
        }
        this.cookies = cookie__WEBPACK_IMPORTED_MODULE_0__.parse(document.cookie, parseOptions);
    };
    Cookies.prototype._emitChange = function (params) {
        for (var i = 0; i < this.changeListeners.length; ++i) {
            this.changeListeners[i](params);
        }
    };
    Cookies.prototype.get = function (name, options, parseOptions) {
        if (options === void 0) { options = {}; }
        this._updateBrowserValues(parseOptions);
        return (0,_utils__WEBPACK_IMPORTED_MODULE_1__.readCookie)(this.cookies[name], options);
    };
    Cookies.prototype.getAll = function (options, parseOptions) {
        if (options === void 0) { options = {}; }
        this._updateBrowserValues(parseOptions);
        var result = {};
        for (var name_1 in this.cookies) {
            result[name_1] = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.readCookie)(this.cookies[name_1], options);
        }
        return result;
    };
    Cookies.prototype.set = function (name, value, options) {
        var _a;
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        this.cookies = __assign(__assign({}, this.cookies), (_a = {}, _a[name] = value, _a));
        if (this.HAS_DOCUMENT_COOKIE) {
            document.cookie = cookie__WEBPACK_IMPORTED_MODULE_0__.serialize(name, value, options);
        }
        this._emitChange({ name: name, value: value, options: options });
    };
    Cookies.prototype.remove = function (name, options) {
        var finalOptions = (options = __assign(__assign({}, options), { expires: new Date(1970, 1, 1, 0, 0, 1), maxAge: 0 }));
        this.cookies = __assign({}, this.cookies);
        delete this.cookies[name];
        if (this.HAS_DOCUMENT_COOKIE) {
            document.cookie = cookie__WEBPACK_IMPORTED_MODULE_0__.serialize(name, '', finalOptions);
        }
        this._emitChange({ name: name, value: undefined, options: options });
    };
    Cookies.prototype.addChangeListener = function (callback) {
        this.changeListeners.push(callback);
    };
    Cookies.prototype.removeChangeListener = function (callback) {
        var idx = this.changeListeners.indexOf(callback);
        if (idx >= 0) {
            this.changeListeners.splice(idx, 1);
        }
    };
    return Cookies;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Cookies);


/***/ }),

/***/ "./node_modules/universal-cookie/es6/index.js":
/*!****************************************************!*\
  !*** ./node_modules/universal-cookie/es6/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Cookies__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Cookies */ "./node_modules/universal-cookie/es6/Cookies.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_Cookies__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./node_modules/universal-cookie/es6/utils.js":
/*!****************************************************!*\
  !*** ./node_modules/universal-cookie/es6/utils.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cleanCookies: () => (/* binding */ cleanCookies),
/* harmony export */   hasDocumentCookie: () => (/* binding */ hasDocumentCookie),
/* harmony export */   isParsingCookie: () => (/* binding */ isParsingCookie),
/* harmony export */   parseCookies: () => (/* binding */ parseCookies),
/* harmony export */   readCookie: () => (/* binding */ readCookie)
/* harmony export */ });
/* harmony import */ var cookie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cookie */ "./node_modules/universal-cookie/node_modules/cookie/index.js");

function hasDocumentCookie() {
    // Can we get/set cookies on document.cookie?
    return typeof document === 'object' && typeof document.cookie === 'string';
}
function cleanCookies() {
    document.cookie.split(';').forEach(function (c) {
        document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
}
function parseCookies(cookies, options) {
    if (typeof cookies === 'string') {
        return cookie__WEBPACK_IMPORTED_MODULE_0__.parse(cookies, options);
    }
    else if (typeof cookies === 'object' && cookies !== null) {
        return cookies;
    }
    else {
        return {};
    }
}
function isParsingCookie(value, doNotParse) {
    if (typeof doNotParse === 'undefined') {
        // We guess if the cookie start with { or [, it has been serialized
        doNotParse =
            !value || (value[0] !== '{' && value[0] !== '[' && value[0] !== '"');
    }
    return !doNotParse;
}
function readCookie(value, options) {
    if (options === void 0) { options = {}; }
    var cleanValue = cleanupCookieValue(value);
    if (isParsingCookie(cleanValue, options.doNotParse)) {
        try {
            return JSON.parse(cleanValue);
        }
        catch (e) {
            // At least we tried
        }
    }
    // Ignore clean value if we failed the deserialization
    // It is not relevant anymore to trim those values
    return value;
}
function cleanupCookieValue(value) {
    // express prepend j: before serializing a cookie
    if (value && value[0] === 'j' && value[1] === ':') {
        return value.substr(2);
    }
    return value;
}


/***/ }),

/***/ "./node_modules/universal-cookie/node_modules/cookie/index.js":
/*!********************************************************************!*\
  !*** ./node_modules/universal-cookie/node_modules/cookie/index.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module exports.
 * @public
 */

exports.parse = parse;
exports.serialize = serialize;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var encode = encodeURIComponent;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {}
  var opt = options || {};
  var pairs = str.split(';')
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var index = pair.indexOf('=')

    // skip things that don't look like key=value
    if (index < 0) {
      continue;
    }

    var key = pair.substring(0, index).trim()

    // only assign once
    if (undefined == obj[key]) {
      var val = pair.substring(index + 1, pair.length).trim()

      // quoted values
      if (val[0] === '"') {
        val = val.slice(1, -1)
      }

      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;

    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError('option maxAge is invalid')
    }

    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}


/***/ }),

/***/ "./src/amplifyconfigure.js":
/*!*********************************!*\
  !*** ./src/amplifyconfigure.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const amplifyConfig = {
  Auth: {
    // REQUIRED - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:066342bc-b010-4d0a-b5db-32dcfba97a96',
    
    // REQUIRED - Amazon Cognito Region
    region: 'US-EAST-1',
    
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_PFnBz6vVg',

    userPoolWebClientId: '4jcmhmdd6leuq5r9gt0rkpemmc',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,
  }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (amplifyConfig);

/***/ }),

/***/ "?4501":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./src/auth.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var aws_amplify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! aws-amplify */ "./node_modules/@aws-amplify/auth/lib-esm/Auth.js");
/* harmony import */ var _amplifyconfigure__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./amplifyconfigure */ "./src/amplifyconfigure.js");
/* harmony import */ var _styles_auth_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./styles/auth.css */ "./src/styles/auth.css");




// Configure Amplify
aws_amplify__WEBPACK_IMPORTED_MODULE_2__.Auth.configure(_amplifyconfigure__WEBPACK_IMPORTED_MODULE_0__["default"]);

const handleSignUp = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value; // If using email

    try {
        const { user } = await aws_amplify__WEBPACK_IMPORTED_MODULE_2__.Auth.signUp({
            username,
            password,
            attributes: {
                email // If using email
            }
        });
        console.log('Sign up success!', user);
        // Handle successful sign-up logic here
    } catch (error) {
        console.error('Error signing up:', error);
        // Handle errors or show messages to user
    }
};

const handleSignIn = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const user = await aws_amplify__WEBPACK_IMPORTED_MODULE_2__.Auth.signIn(username, password);
        console.log('Sign in success!', user);
        // Handle successful sign-in logic here
        console.log('about to redirect');
        window.location.href = "main.html";
    } catch (error) {
        console.error('Error signing in:', error);
        // Handle errors or show messages to user
    }
};

// Attach event listeners
document.getElementById('signUpButton').addEventListener('click', handleSignUp);
document.getElementById('signInButton').addEventListener('click', handleSignIn);
})();

/******/ })()
;
//# sourceMappingURL=auth.bundle.js.map