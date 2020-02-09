/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ArgumentException, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { BrowserMultiFormatContinuousReader } from './browser-multi-format-continuous-reader';
var ZXingScannerComponent = /** @class */ (function () {
    /**
     * Constructor to build the object and do some DI.
     */
    function ZXingScannerComponent() {
        /**
         * How the preview element shoud be fit inside the :host container.
         */
        this.previewFitMode = 'cover';
        // instance based emitters
        this.autostarted = new EventEmitter();
        this.autostarting = new EventEmitter();
        this.torchCompatible = new EventEmitter();
        this.scanSuccess = new EventEmitter();
        this.scanFailure = new EventEmitter();
        this.scanError = new EventEmitter();
        this.scanComplete = new EventEmitter();
        this.camerasFound = new EventEmitter();
        this.camerasNotFound = new EventEmitter();
        this.permissionResponse = new EventEmitter(true);
        this.hasDevices = new EventEmitter();
        this.deviceChange = new EventEmitter();
        this._device = null;
        this._enabled = true;
        this._hints = new Map();
        this.autofocusEnabled = true;
        this.autostart = true;
        this.formats = [BarcodeFormat.QR_CODE];
        // computed data
        this.hasNavigator = typeof navigator !== 'undefined';
        this.isMediaDevicesSuported = this.hasNavigator && !!navigator.mediaDevices;
    }
    Object.defineProperty(ZXingScannerComponent.prototype, "codeReader", {
        /**
         * Exposes the current code reader, so the user can use it's APIs.
         */
        get: /**
         * Exposes the current code reader, so the user can use it's APIs.
         * @return {?}
         */
        function () {
            return this._codeReader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "device", {
        /**
         * User device acessor.
         */
        get: /**
         * User device acessor.
         * @return {?}
         */
        function () {
            return this._device;
        },
        /**
         * User device input
         */
        set: /**
         * User device input
         * @param {?} device
         * @return {?}
         */
        function (device) {
            if (!device && device !== null) {
                throw new ArgumentException('The `device` must be a valid MediaDeviceInfo or null.');
            }
            if (this.isCurrentDevice(device)) {
                console.warn('Setting the same device is not allowed.');
                return;
            }
            if (this.isAutostarting) {
                // do not allow setting devices during auto-start, since it will set one and emit it.
                console.warn('Avoid setting a device during auto-start.');
                return;
            }
            if (!this.hasPermission) {
                console.warn('Permissions not set yet, waiting for them to be set to apply device change.');
                // this.permissionResponse
                //   .pipe(
                //     take(1),
                //     tap(() => console.log(`Permissions set, applying device change${device ? ` (${device.deviceId})` : ''}.`))
                //   )
                //   .subscribe(() => this.device = device);
                // return;
            }
            // in order to change the device the codeReader gotta be reseted
            this._reset();
            this._device = device;
            // if enabled, starts scanning
            if (this._enabled && device !== null) {
                this.scanFromDevice(device.deviceId);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "formats", {
        /**
         * Returns all the registered formats.
         */
        get: /**
         * Returns all the registered formats.
         * @return {?}
         */
        function () {
            return this.hints.get(DecodeHintType.POSSIBLE_FORMATS);
        },
        /**
         * Registers formats the scanner should support.
         *
         * @param input BarcodeFormat or case-insensitive string array.
         */
        set: /**
         * Registers formats the scanner should support.
         *
         * @param {?} input BarcodeFormat or case-insensitive string array.
         * @return {?}
         */
        function (input) {
            var _this = this;
            if (typeof input === 'string') {
                throw new Error('Invalid formats, make sure the [formats] input is a binding.');
            }
            // formats may be set from html template as BarcodeFormat or string array
            /** @type {?} */
            var formats = input.map((/**
             * @param {?} f
             * @return {?}
             */
            function (f) { return _this.getBarcodeFormatOrFail(f); }));
            /** @type {?} */
            var hints = this.hints;
            // updates the hints
            hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
            this.hints = hints;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "hints", {
        /**
         * Returns all the registered hints.
         */
        get: /**
         * Returns all the registered hints.
         * @return {?}
         */
        function () {
            return this._hints;
        },
        /**
         * Does what it takes to set the hints.
         */
        set: /**
         * Does what it takes to set the hints.
         * @param {?} hints
         * @return {?}
         */
        function (hints) {
            this._hints = hints;
            // @note avoid restarting the code reader when possible
            // new instance with new hints.
            this.restart();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "isAutostarting", {
        /**
         *
         */
        set: /**
         *
         * @param {?} state
         * @return {?}
         */
        function (state) {
            this._isAutostarting = state;
            this.autostarting.next(state);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "isAutstarting", {
        /**
         *
         */
        get: /**
         *
         * @return {?}
         */
        function () {
            return this._isAutostarting;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "torch", {
        /**
         * Allow start scan or not.
         */
        set: /**
         * Allow start scan or not.
         * @param {?} on
         * @return {?}
         */
        function (on) {
            this.getCodeReader().setTorch(on);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "enable", {
        /**
         * Allow start scan or not.
         */
        set: /**
         * Allow start scan or not.
         * @param {?} enabled
         * @return {?}
         */
        function (enabled) {
            this._enabled = Boolean(enabled);
            if (!this._enabled) {
                this.reset();
            }
            else if (this.device) {
                this.scanFromDevice(this.device.deviceId);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "enabled", {
        /**
         * Tells if the scanner is enabled or not.
         */
        get: /**
         * Tells if the scanner is enabled or not.
         * @return {?}
         */
        function () {
            return this._enabled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZXingScannerComponent.prototype, "tryHarder", {
        /**
         * If is `tryHarder` enabled.
         */
        get: /**
         * If is `tryHarder` enabled.
         * @return {?}
         */
        function () {
            return this.hints.get(DecodeHintType.TRY_HARDER);
        },
        /**
         * Enable/disable tryHarder hint.
         */
        set: /**
         * Enable/disable tryHarder hint.
         * @param {?} enable
         * @return {?}
         */
        function (enable) {
            /** @type {?} */
            var hints = this.hints;
            if (enable) {
                hints.set(DecodeHintType.TRY_HARDER, true);
            }
            else {
                hints.delete(DecodeHintType.TRY_HARDER);
            }
            this.hints = hints;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets and registers all cammeras.
     */
    /**
     * Gets and registers all cammeras.
     * @return {?}
     */
    ZXingScannerComponent.prototype.askForPermission = /**
     * Gets and registers all cammeras.
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var stream, permission, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasNavigator) {
                            console.error('@zxing/ngx-scanner', 'Can\'t ask permission, navigator is not present.');
                            this.setPermission(null);
                            return [2 /*return*/, this.hasPermission];
                        }
                        if (!this.isMediaDevicesSuported) {
                            console.error('@zxing/ngx-scanner', 'Can\'t get user media, this is not supported.');
                            this.setPermission(null);
                            return [2 /*return*/, this.hasPermission];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.getAnyVideoDevice()];
                    case 2:
                        // Will try to ask for permission
                        stream = _a.sent();
                        permission = !!stream;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        return [2 /*return*/, this.handlePermissionException(err_1)];
                    case 4:
                        this.terminateStream(stream);
                        return [7 /*endfinally*/];
                    case 5:
                        this.setPermission(permission);
                        // Returns the permission
                        return [2 /*return*/, permission];
                }
            });
        });
    };
    /**
     *
     */
    /**
     *
     * @return {?}
     */
    ZXingScannerComponent.prototype.getAnyVideoDevice = /**
     *
     * @return {?}
     */
    function () {
        return navigator.mediaDevices.getUserMedia({ video: true });
    };
    /**
     * Terminates a stream and it's tracks.
     */
    /**
     * Terminates a stream and it's tracks.
     * @private
     * @param {?} stream
     * @return {?}
     */
    ZXingScannerComponent.prototype.terminateStream = /**
     * Terminates a stream and it's tracks.
     * @private
     * @param {?} stream
     * @return {?}
     */
    function (stream) {
        if (stream) {
            stream.getTracks().forEach((/**
             * @param {?} t
             * @return {?}
             */
            function (t) { return t.stop(); }));
        }
        stream = undefined;
    };
    /**
     * Initializes the component without starting the scanner.
     */
    /**
     * Initializes the component without starting the scanner.
     * @private
     * @return {?}
     */
    ZXingScannerComponent.prototype.initAutostartOff = /**
     * Initializes the component without starting the scanner.
     * @private
     * @return {?}
     */
    function () {
        // do not ask for permission when autostart is off
        this.isAutostarting = null;
        // just update devices information
        this.updateVideoInputDevices();
    };
    /**
     * Initializes the component and starts the scanner.
     * Permissions are asked to accomplish that.
     */
    /**
     * Initializes the component and starts the scanner.
     * Permissions are asked to accomplish that.
     * @private
     * @return {?}
     */
    ZXingScannerComponent.prototype.initAutostartOn = /**
     * Initializes the component and starts the scanner.
     * Permissions are asked to accomplish that.
     * @private
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var hasPermission, e_1, devices;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isAutostarting = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.askForPermission()];
                    case 2:
                        // Asks for permission before enumerating devices so it can get all the device's info
                        hasPermission = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error('Exception occurred while asking for permission:', e_1);
                        return [2 /*return*/];
                    case 4:
                        if (!hasPermission) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.updateVideoInputDevices()];
                    case 5:
                        devices = _a.sent();
                        this.autostartScanner(tslib_1.__spread(devices));
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if the given device is the current defined one.
     */
    /**
     * Checks if the given device is the current defined one.
     * @param {?} device
     * @return {?}
     */
    ZXingScannerComponent.prototype.isCurrentDevice = /**
     * Checks if the given device is the current defined one.
     * @param {?} device
     * @return {?}
     */
    function (device) {
        return this.device && device && device.deviceId === this.device.deviceId;
    };
    /**
     * Executed after the view initialization.
     */
    /**
     * Executed after the view initialization.
     * @return {?}
     */
    ZXingScannerComponent.prototype.ngAfterViewInit = /**
     * Executed after the view initialization.
     * @return {?}
     */
    function () {
        var _this = this;
        // makes torch availability information available to user
        this.getCodeReader().isTorchAvailable.subscribe((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return _this.torchCompatible.emit(x); }));
        if (!this.autostart) {
            console.warn('New feature \'autostart\' disabled, be careful. Permissions and devices recovery has to be run manually.');
            // does the necessary configuration without autostarting
            this.initAutostartOff();
            return;
        }
        // configurates the component and starts the scanner
        this.initAutostartOn();
    };
    /**
     * Executes some actions before destroy the component.
     */
    /**
     * Executes some actions before destroy the component.
     * @return {?}
     */
    ZXingScannerComponent.prototype.ngOnDestroy = /**
     * Executes some actions before destroy the component.
     * @return {?}
     */
    function () {
        this.reset();
    };
    /**
     * Stops old `codeReader` and starts scanning in a new one.
     */
    /**
     * Stops old `codeReader` and starts scanning in a new one.
     * @return {?}
     */
    ZXingScannerComponent.prototype.restart = /**
     * Stops old `codeReader` and starts scanning in a new one.
     * @return {?}
     */
    function () {
        /** @type {?} */
        var prevDevice = this._reset();
        if (!prevDevice) {
            return;
        }
        // @note apenas necessario por enquanto causa da Torch
        this._codeReader = undefined;
        this.device = prevDevice;
    };
    /**
     * Discovers and updates known video input devices.
     */
    /**
     * Discovers and updates known video input devices.
     * @return {?}
     */
    ZXingScannerComponent.prototype.updateVideoInputDevices = /**
     * Discovers and updates known video input devices.
     * @return {?}
     */
    function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var devices, hasDevices;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // permissions aren't needed to get devices, but to access them and their info
                        return [4 /*yield*/, this.getCodeReader().listVideoInputDevices()];
                    case 1:
                        devices = (_a.sent()) || [];
                        hasDevices = devices && devices.length > 0;
                        // stores discovered devices and updates information
                        this.hasDevices.next(hasDevices);
                        this.camerasFound.next(tslib_1.__spread(devices));
                        if (!hasDevices) {
                            this.camerasNotFound.next();
                        }
                        return [2 /*return*/, devices];
                }
            });
        });
    };
    /**
     * Starts the scanner with the back camera otherwise take the last
     * available device.
     */
    /**
     * Starts the scanner with the back camera otherwise take the last
     * available device.
     * @private
     * @param {?} devices
     * @return {?}
     */
    ZXingScannerComponent.prototype.autostartScanner = /**
     * Starts the scanner with the back camera otherwise take the last
     * available device.
     * @private
     * @param {?} devices
     * @return {?}
     */
    function (devices) {
        /** @type {?} */
        var matcher = (/**
         * @param {?} __0
         * @return {?}
         */
        function (_a) {
            var label = _a.label;
            return /back|trás|rear|traseira|environment|ambiente/gi.test(label);
        });
        // select the rear camera by default, otherwise take the last camera.
        /** @type {?} */
        var device = devices.find(matcher) || devices.pop();
        if (!device) {
            throw new Error('Impossible to autostart, no input devices available.');
        }
        this.device = device;
        // @note when listening to this change, callback code will sometimes run before the previous line.
        this.deviceChange.emit(device);
        this.isAutostarting = false;
        this.autostarted.next();
    };
    /**
     * Dispatches the scan success event.
     *
     * @param result the scan result.
     */
    /**
     * Dispatches the scan success event.
     *
     * @private
     * @param {?} result the scan result.
     * @return {?}
     */
    ZXingScannerComponent.prototype.dispatchScanSuccess = /**
     * Dispatches the scan success event.
     *
     * @private
     * @param {?} result the scan result.
     * @return {?}
     */
    function (result) {
        this.scanSuccess.next(result.getText());
    };
    /**
     * Dispatches the scan failure event.
     */
    /**
     * Dispatches the scan failure event.
     * @private
     * @param {?=} reason
     * @return {?}
     */
    ZXingScannerComponent.prototype.dispatchScanFailure = /**
     * Dispatches the scan failure event.
     * @private
     * @param {?=} reason
     * @return {?}
     */
    function (reason) {
        this.scanFailure.next(reason);
    };
    /**
     * Dispatches the scan error event.
     *
     * @param error the error thing.
     */
    /**
     * Dispatches the scan error event.
     *
     * @private
     * @param {?} error the error thing.
     * @return {?}
     */
    ZXingScannerComponent.prototype.dispatchScanError = /**
     * Dispatches the scan error event.
     *
     * @private
     * @param {?} error the error thing.
     * @return {?}
     */
    function (error) {
        this.scanError.next(error);
    };
    /**
     * Dispatches the scan event.
     *
     * @param result the scan result.
     */
    /**
     * Dispatches the scan event.
     *
     * @private
     * @param {?} result the scan result.
     * @return {?}
     */
    ZXingScannerComponent.prototype.dispatchScanComplete = /**
     * Dispatches the scan event.
     *
     * @private
     * @param {?} result the scan result.
     * @return {?}
     */
    function (result) {
        this.scanComplete.next(result);
    };
    /**
     * Returns the filtered permission.
     */
    /**
     * Returns the filtered permission.
     * @private
     * @param {?} err
     * @return {?}
     */
    ZXingScannerComponent.prototype.handlePermissionException = /**
     * Returns the filtered permission.
     * @private
     * @param {?} err
     * @return {?}
     */
    function (err) {
        // failed to grant permission to video input
        console.error('@zxing/ngx-scanner', 'Error when asking for permission.', err);
        /** @type {?} */
        var permission;
        switch (err.name) {
            // usually caused by not secure origins
            case 'NotSupportedError':
                console.warn('@zxing/ngx-scanner', err.message);
                // could not claim
                permission = null;
                // can't check devices
                this.hasDevices.next(null);
                break;
            // user denied permission
            case 'NotAllowedError':
                console.warn('@zxing/ngx-scanner', err.message);
                // claimed and denied permission
                permission = false;
                // this means that input devices exists
                this.hasDevices.next(true);
                break;
            // the device has no attached input devices
            case 'NotFoundError':
                console.warn('@zxing/ngx-scanner', err.message);
                // no permissions claimed
                permission = null;
                // because there was no devices
                this.hasDevices.next(false);
                // tells the listener about the error
                this.camerasNotFound.next(err);
                break;
            case 'NotReadableError':
                console.warn('@zxing/ngx-scanner', 'Couldn\'t read the device(s)\'s stream, it\'s probably in use by another app.');
                // no permissions claimed
                permission = null;
                // there are devices, which I couldn't use
                this.hasDevices.next(false);
                // tells the listener about the error
                this.camerasNotFound.next(err);
                break;
            default:
                console.warn('@zxing/ngx-scanner', 'I was not able to define if I have permissions for camera or not.', err);
                // unknown
                permission = null;
                // this.hasDevices.next(undefined;
                break;
        }
        this.setPermission(permission);
        // tells the listener about the error
        this.permissionResponse.error(err);
        return permission;
    };
    /**
     * Returns a valid BarcodeFormat or fails.
     */
    /**
     * Returns a valid BarcodeFormat or fails.
     * @private
     * @param {?} format
     * @return {?}
     */
    ZXingScannerComponent.prototype.getBarcodeFormatOrFail = /**
     * Returns a valid BarcodeFormat or fails.
     * @private
     * @param {?} format
     * @return {?}
     */
    function (format) {
        return typeof format === 'string'
            ? BarcodeFormat[format.trim().toUpperCase()]
            : format;
    };
    /**
     * Retorna um code reader, cria um se nenhume existe.
     */
    /**
     * Retorna um code reader, cria um se nenhume existe.
     * @private
     * @return {?}
     */
    ZXingScannerComponent.prototype.getCodeReader = /**
     * Retorna um code reader, cria um se nenhume existe.
     * @private
     * @return {?}
     */
    function () {
        if (!this._codeReader) {
            this._codeReader = new BrowserMultiFormatContinuousReader(this.hints);
        }
        return this._codeReader;
    };
    /**
     * Starts the continuous scanning for the given device.
     *
     * @param deviceId The deviceId from the device.
     */
    /**
     * Starts the continuous scanning for the given device.
     *
     * @private
     * @param {?} deviceId The deviceId from the device.
     * @return {?}
     */
    ZXingScannerComponent.prototype.scanFromDevice = /**
     * Starts the continuous scanning for the given device.
     *
     * @private
     * @param {?} deviceId The deviceId from the device.
     * @return {?}
     */
    function (deviceId) {
        var _this = this;
        /** @type {?} */
        var videoElement = this.previewElemRef.nativeElement;
        /** @type {?} */
        var codeReader = this.getCodeReader();
        /** @type {?} */
        var decodingStream = codeReader.continuousDecodeFromInputVideoDevice(deviceId, videoElement);
        if (!decodingStream) {
            throw new Error('Undefined decoding stream, aborting.');
        }
        /** @type {?} */
        var next = (/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return _this._onDecodeResult(x.result, x.error); });
        /** @type {?} */
        var error = (/**
         * @param {?} err
         * @return {?}
         */
        function (err) { return _this._onDecodeError(err); });
        /** @type {?} */
        var complete = (/**
         * @return {?}
         */
        function () { _this.reset(); console.log('completed'); });
        decodingStream.subscribe(next, error, complete);
    };
    /**
     * Handles decode errors.
     */
    /**
     * Handles decode errors.
     * @private
     * @param {?} err
     * @return {?}
     */
    ZXingScannerComponent.prototype._onDecodeError = /**
     * Handles decode errors.
     * @private
     * @param {?} err
     * @return {?}
     */
    function (err) {
        this.dispatchScanError(err);
        this.reset();
    };
    /**
     * Handles decode results.
     */
    /**
     * Handles decode results.
     * @private
     * @param {?} result
     * @param {?} error
     * @return {?}
     */
    ZXingScannerComponent.prototype._onDecodeResult = /**
     * Handles decode results.
     * @private
     * @param {?} result
     * @param {?} error
     * @return {?}
     */
    function (result, error) {
        if (result) {
            this.dispatchScanSuccess(result);
        }
        else {
            this.dispatchScanFailure(error);
        }
        this.dispatchScanComplete(result);
    };
    /**
     * Stops the code reader and returns the previous selected device.
     */
    /**
     * Stops the code reader and returns the previous selected device.
     * @private
     * @return {?}
     */
    ZXingScannerComponent.prototype._reset = /**
     * Stops the code reader and returns the previous selected device.
     * @private
     * @return {?}
     */
    function () {
        if (!this._codeReader) {
            return;
        }
        /** @type {?} */
        var device = this.device;
        // do not set this.device inside this method, it would create a recursive loop
        this._device = null;
        this._codeReader.reset();
        return device;
    };
    /**
     * Resets the scanner and emits device change.
     */
    /**
     * Resets the scanner and emits device change.
     * @return {?}
     */
    ZXingScannerComponent.prototype.reset = /**
     * Resets the scanner and emits device change.
     * @return {?}
     */
    function () {
        this._reset();
        this.deviceChange.emit(null);
    };
    /**
     * Sets the permission value and emmits the event.
     */
    /**
     * Sets the permission value and emmits the event.
     * @private
     * @param {?} hasPermission
     * @return {?}
     */
    ZXingScannerComponent.prototype.setPermission = /**
     * Sets the permission value and emmits the event.
     * @private
     * @param {?} hasPermission
     * @return {?}
     */
    function (hasPermission) {
        this.hasPermission = hasPermission;
        this.permissionResponse.next(hasPermission);
    };
    ZXingScannerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'zxing-scanner',
                    template: "<video #preview [style.object-fit]=\"previewFitMode\">\n  <p>\n    Your browser does not support this feature, please try to upgrade it.\n  </p>\n  <p>\n    Seu navegador n\u00E3o suporta este recurso, por favor tente atualiz\u00E1-lo.\n  </p>\n</video>\n",
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    styles: [":host{display:block}video{width:100%;height:auto;-o-object-fit:contain;object-fit:contain}"]
                }] }
    ];
    /** @nocollapse */
    ZXingScannerComponent.ctorParameters = function () { return []; };
    ZXingScannerComponent.propDecorators = {
        previewElemRef: [{ type: ViewChild, args: ['preview', { static: true },] }],
        autofocusEnabled: [{ type: Input }],
        autostarted: [{ type: Output }],
        autostarting: [{ type: Output }],
        autostart: [{ type: Input }],
        previewFitMode: [{ type: Input }],
        torchCompatible: [{ type: Output }],
        scanSuccess: [{ type: Output }],
        scanFailure: [{ type: Output }],
        scanError: [{ type: Output }],
        scanComplete: [{ type: Output }],
        camerasFound: [{ type: Output }],
        camerasNotFound: [{ type: Output }],
        permissionResponse: [{ type: Output }],
        hasDevices: [{ type: Output }],
        device: [{ type: Input }],
        deviceChange: [{ type: Output }],
        formats: [{ type: Input }],
        torch: [{ type: Input }],
        enable: [{ type: Input }],
        tryHarder: [{ type: Input }]
    };
    return ZXingScannerComponent;
}());
export { ZXingScannerComponent };
if (false) {
    /**
     * Supported Hints map.
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype._hints;
    /**
     * The ZXing code reader.
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype._codeReader;
    /**
     * The device that should be used to scan things.
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype._device;
    /**
     * The device that should be used to scan things.
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype._enabled;
    /**
     *
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype._isAutostarting;
    /**
     * Has `navigator` access.
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype.hasNavigator;
    /**
     * Says if some native API is supported.
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype.isMediaDevicesSuported;
    /**
     * If the user-agent allowed the use of the camera or not.
     * @type {?}
     * @private
     */
    ZXingScannerComponent.prototype.hasPermission;
    /**
     * Reference to the preview element, should be the `video` tag.
     * @type {?}
     */
    ZXingScannerComponent.prototype.previewElemRef;
    /**
     * Enable or disable autofocus of the camera (might have an impact on performance)
     * @type {?}
     */
    ZXingScannerComponent.prototype.autofocusEnabled;
    /**
     * Emits when and if the scanner is autostarted.
     * @type {?}
     */
    ZXingScannerComponent.prototype.autostarted;
    /**
     * True during autostart and false after. It will be null if won't autostart at all.
     * @type {?}
     */
    ZXingScannerComponent.prototype.autostarting;
    /**
     * If the scanner should autostart with the first available device.
     * @type {?}
     */
    ZXingScannerComponent.prototype.autostart;
    /**
     * How the preview element shoud be fit inside the :host container.
     * @type {?}
     */
    ZXingScannerComponent.prototype.previewFitMode;
    /**
     * Emitts events when the torch compatibility is changed.
     * @type {?}
     */
    ZXingScannerComponent.prototype.torchCompatible;
    /**
     * Emitts events when a scan is successful performed, will inject the string value of the QR-code to the callback.
     * @type {?}
     */
    ZXingScannerComponent.prototype.scanSuccess;
    /**
     * Emitts events when a scan fails without errors, usefull to know how much scan tries where made.
     * @type {?}
     */
    ZXingScannerComponent.prototype.scanFailure;
    /**
     * Emitts events when a scan throws some error, will inject the error to the callback.
     * @type {?}
     */
    ZXingScannerComponent.prototype.scanError;
    /**
     * Emitts events when a scan is performed, will inject the Result value of the QR-code scan (if available) to the callback.
     * @type {?}
     */
    ZXingScannerComponent.prototype.scanComplete;
    /**
     * Emitts events when no cameras are found, will inject an exception (if available) to the callback.
     * @type {?}
     */
    ZXingScannerComponent.prototype.camerasFound;
    /**
     * Emitts events when no cameras are found, will inject an exception (if available) to the callback.
     * @type {?}
     */
    ZXingScannerComponent.prototype.camerasNotFound;
    /**
     * Emitts events when the users answers for permission.
     * @type {?}
     */
    ZXingScannerComponent.prototype.permissionResponse;
    /**
     * Emitts events when has devices status is update.
     * @type {?}
     */
    ZXingScannerComponent.prototype.hasDevices;
    /**
     * Emits when the current device is changed.
     * @type {?}
     */
    ZXingScannerComponent.prototype.deviceChange;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoienhpbmctc2Nhbm5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvenhpbmctc2Nhbm5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxFQUVWLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsYUFBYSxFQUNiLGNBQWMsRUFHZixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBRSxrQ0FBa0MsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRzlGO0lBZ1VFOztPQUVHO0lBQ0g7Ozs7UUFqUEEsbUJBQWMsR0FBeUQsT0FBTyxDQUFDO1FBa1A3RSwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksWUFBWSxDQUFD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aEMsdUNBQWdEOzs7Ozs7SUFLaEQsNENBQXdEOzs7Ozs7SUFLeEQsd0NBQWlDOzs7Ozs7SUFLakMseUNBQTBCOzs7Ozs7SUFLMUIsZ0RBQWlDOzs7Ozs7SUFLakMsNkNBQThCOzs7Ozs7SUFLOUIsdURBQXdDOzs7Ozs7SUFLeEMsOENBQXNDOzs7OztJQUt0QywrQ0FDNkM7Ozs7O0lBSzdDLGlEQUMwQjs7Ozs7SUFLMUIsNENBQ2dDOzs7OztJQUtoQyw2Q0FDMkM7Ozs7O0lBSzNDLDBDQUNtQjs7Ozs7SUFLbkIsK0NBQytFOzs7OztJQUsvRSxnREFDdUM7Ozs7O0lBS3ZDLDRDQUNrQzs7Ozs7SUFLbEMsNENBQ2lEOzs7OztJQUtqRCwwQ0FDK0I7Ozs7O0lBSy9CLDZDQUNtQzs7Ozs7SUFLbkMsNkNBQzhDOzs7OztJQUs5QyxnREFDbUM7Ozs7O0lBS25DLG1EQUMwQzs7Ozs7SUFLMUMsMkNBQ2tDOzs7OztJQXVEbEMsNkNBQzRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFZpZXdDaGlsZCxcbiAgTmdab25lXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBBcmd1bWVudEV4Y2VwdGlvbixcbiAgQmFyY29kZUZvcm1hdCxcbiAgRGVjb2RlSGludFR5cGUsXG4gIEV4Y2VwdGlvbixcbiAgUmVzdWx0XG59IGZyb20gJ0B6eGluZy9saWJyYXJ5JztcblxuaW1wb3J0IHsgQnJvd3Nlck11bHRpRm9ybWF0Q29udGludW91c1JlYWRlciB9IGZyb20gJy4vYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXInO1xuaW1wb3J0IHsgUmVzdWx0QW5kRXJyb3IgfSBmcm9tICcuL1Jlc3VsdEFuZEVycm9yJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnenhpbmctc2Nhbm5lcicsXG4gIHRlbXBsYXRlVXJsOiAnLi96eGluZy1zY2FubmVyLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4venhpbmctc2Nhbm5lci5jb21wb25lbnQuc2NzcyddLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBaWGluZ1NjYW5uZXJDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuXG4gIC8qKlxuICAgKiBTdXBwb3J0ZWQgSGludHMgbWFwLlxuICAgKi9cbiAgcHJpdmF0ZSBfaGludHM6IE1hcDxEZWNvZGVIaW50VHlwZSwgYW55PiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBaWGluZyBjb2RlIHJlYWRlci5cbiAgICovXG4gIHByaXZhdGUgX2NvZGVSZWFkZXI6IEJyb3dzZXJNdWx0aUZvcm1hdENvbnRpbnVvdXNSZWFkZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBkZXZpY2UgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBzY2FuIHRoaW5ncy5cbiAgICovXG4gIHByaXZhdGUgX2RldmljZTogTWVkaWFEZXZpY2VJbmZvO1xuXG4gIC8qKlxuICAgKiBUaGUgZGV2aWNlIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gc2NhbiB0aGluZ3MuXG4gICAqL1xuICBwcml2YXRlIF9lbmFibGVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNBdXRvc3RhcnRpbmc6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEhhcyBgbmF2aWdhdG9yYCBhY2Nlc3MuXG4gICAqL1xuICBwcml2YXRlIGhhc05hdmlnYXRvcjogYm9vbGVhbjtcblxuICAvKipcbiAgICogU2F5cyBpZiBzb21lIG5hdGl2ZSBBUEkgaXMgc3VwcG9ydGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBpc01lZGlhRGV2aWNlc1N1cG9ydGVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBJZiB0aGUgdXNlci1hZ2VudCBhbGxvd2VkIHRoZSB1c2Ugb2YgdGhlIGNhbWVyYSBvciBub3QuXG4gICAqL1xuICBwcml2YXRlIGhhc1Blcm1pc3Npb246IGJvb2xlYW4gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIHByZXZpZXcgZWxlbWVudCwgc2hvdWxkIGJlIHRoZSBgdmlkZW9gIHRhZy5cbiAgICovXG4gIEBWaWV3Q2hpbGQoJ3ByZXZpZXcnLCB7IHN0YXRpYzogdHJ1ZSB9KVxuICBwcmV2aWV3RWxlbVJlZjogRWxlbWVudFJlZjxIVE1MVmlkZW9FbGVtZW50PjtcblxuICAvKipcbiAgICogRW5hYmxlIG9yIGRpc2FibGUgYXV0b2ZvY3VzIG9mIHRoZSBjYW1lcmEgKG1pZ2h0IGhhdmUgYW4gaW1wYWN0IG9uIHBlcmZvcm1hbmNlKVxuICAgKi9cbiAgQElucHV0KClcbiAgYXV0b2ZvY3VzRW5hYmxlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbiBhbmQgaWYgdGhlIHNjYW5uZXIgaXMgYXV0b3N0YXJ0ZWQuXG4gICAqL1xuICBAT3V0cHV0KClcbiAgYXV0b3N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjx2b2lkPjtcblxuICAvKipcbiAgICogVHJ1ZSBkdXJpbmcgYXV0b3N0YXJ0IGFuZCBmYWxzZSBhZnRlci4gSXQgd2lsbCBiZSBudWxsIGlmIHdvbid0IGF1dG9zdGFydCBhdCBhbGwuXG4gICAqL1xuICBAT3V0cHV0KClcbiAgYXV0b3N0YXJ0aW5nOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbiB8IG51bGw+O1xuXG4gIC8qKlxuICAgKiBJZiB0aGUgc2Nhbm5lciBzaG91bGQgYXV0b3N0YXJ0IHdpdGggdGhlIGZpcnN0IGF2YWlsYWJsZSBkZXZpY2UuXG4gICAqL1xuICBASW5wdXQoKVxuICBhdXRvc3RhcnQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEhvdyB0aGUgcHJldmlldyBlbGVtZW50IHNob3VkIGJlIGZpdCBpbnNpZGUgdGhlIDpob3N0IGNvbnRhaW5lci5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHByZXZpZXdGaXRNb2RlOiAnZmlsbCcgfCAnY29udGFpbicgfCAnY292ZXInIHwgJ3NjYWxlLWRvd24nIHwgJ25vbmUnID0gJ2NvdmVyJztcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIHRoZSB0b3JjaCBjb21wYXRpYmlsaXR5IGlzIGNoYW5nZWQuXG4gICAqL1xuICBAT3V0cHV0KClcbiAgdG9yY2hDb21wYXRpYmxlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiBhIHNjYW4gaXMgc3VjY2Vzc2Z1bCBwZXJmb3JtZWQsIHdpbGwgaW5qZWN0IHRoZSBzdHJpbmcgdmFsdWUgb2YgdGhlIFFSLWNvZGUgdG8gdGhlIGNhbGxiYWNrLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHNjYW5TdWNjZXNzOiBFdmVudEVtaXR0ZXI8c3RyaW5nPjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIGEgc2NhbiBmYWlscyB3aXRob3V0IGVycm9ycywgdXNlZnVsbCB0byBrbm93IGhvdyBtdWNoIHNjYW4gdHJpZXMgd2hlcmUgbWFkZS5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBzY2FuRmFpbHVyZTogRXZlbnRFbWl0dGVyPEV4Y2VwdGlvbiB8IHVuZGVmaW5lZD47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiBhIHNjYW4gdGhyb3dzIHNvbWUgZXJyb3IsIHdpbGwgaW5qZWN0IHRoZSBlcnJvciB0byB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBAT3V0cHV0KClcbiAgc2NhbkVycm9yOiBFdmVudEVtaXR0ZXI8RXJyb3I+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gYSBzY2FuIGlzIHBlcmZvcm1lZCwgd2lsbCBpbmplY3QgdGhlIFJlc3VsdCB2YWx1ZSBvZiB0aGUgUVItY29kZSBzY2FuIChpZiBhdmFpbGFibGUpIHRvIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBzY2FuQ29tcGxldGU6IEV2ZW50RW1pdHRlcjxSZXN1bHQ+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gbm8gY2FtZXJhcyBhcmUgZm91bmQsIHdpbGwgaW5qZWN0IGFuIGV4Y2VwdGlvbiAoaWYgYXZhaWxhYmxlKSB0byB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBAT3V0cHV0KClcbiAgY2FtZXJhc0ZvdW5kOiBFdmVudEVtaXR0ZXI8TWVkaWFEZXZpY2VJbmZvW10+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gbm8gY2FtZXJhcyBhcmUgZm91bmQsIHdpbGwgaW5qZWN0IGFuIGV4Y2VwdGlvbiAoaWYgYXZhaWxhYmxlKSB0byB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBAT3V0cHV0KClcbiAgY2FtZXJhc05vdEZvdW5kOiBFdmVudEVtaXR0ZXI8YW55PjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIHRoZSB1c2VycyBhbnN3ZXJzIGZvciBwZXJtaXNzaW9uLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHBlcm1pc3Npb25SZXNwb25zZTogRXZlbnRFbWl0dGVyPGJvb2xlYW4+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gaGFzIGRldmljZXMgc3RhdHVzIGlzIHVwZGF0ZS5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBoYXNEZXZpY2VzOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj47XG5cbiAgLyoqXG4gICAqIEV4cG9zZXMgdGhlIGN1cnJlbnQgY29kZSByZWFkZXIsIHNvIHRoZSB1c2VyIGNhbiB1c2UgaXQncyBBUElzLlxuICAgKi9cbiAgZ2V0IGNvZGVSZWFkZXIoKTogQnJvd3Nlck11bHRpRm9ybWF0Q29udGludW91c1JlYWRlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvZGVSZWFkZXI7XG4gIH1cblxuICAvKipcbiAgICogVXNlciBkZXZpY2UgaW5wdXRcbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBkZXZpY2UoZGV2aWNlOiBNZWRpYURldmljZUluZm8gfCBudWxsKSB7XG5cbiAgICBpZiAoIWRldmljZSAmJiBkZXZpY2UgIT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBBcmd1bWVudEV4Y2VwdGlvbignVGhlIGBkZXZpY2VgIG11c3QgYmUgYSB2YWxpZCBNZWRpYURldmljZUluZm8gb3IgbnVsbC4nKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0N1cnJlbnREZXZpY2UoZGV2aWNlKSkge1xuICAgICAgY29uc29sZS53YXJuKCdTZXR0aW5nIHRoZSBzYW1lIGRldmljZSBpcyBub3QgYWxsb3dlZC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0F1dG9zdGFydGluZykge1xuICAgICAgLy8gZG8gbm90IGFsbG93IHNldHRpbmcgZGV2aWNlcyBkdXJpbmcgYXV0by1zdGFydCwgc2luY2UgaXQgd2lsbCBzZXQgb25lIGFuZCBlbWl0IGl0LlxuICAgICAgY29uc29sZS53YXJuKCdBdm9pZCBzZXR0aW5nIGEgZGV2aWNlIGR1cmluZyBhdXRvLXN0YXJ0LicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5oYXNQZXJtaXNzaW9uKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Blcm1pc3Npb25zIG5vdCBzZXQgeWV0LCB3YWl0aW5nIGZvciB0aGVtIHRvIGJlIHNldCB0byBhcHBseSBkZXZpY2UgY2hhbmdlLicpO1xuICAgICAgLy8gdGhpcy5wZXJtaXNzaW9uUmVzcG9uc2VcbiAgICAgIC8vICAgLnBpcGUoXG4gICAgICAvLyAgICAgdGFrZSgxKSxcbiAgICAgIC8vICAgICB0YXAoKCkgPT4gY29uc29sZS5sb2coYFBlcm1pc3Npb25zIHNldCwgYXBwbHlpbmcgZGV2aWNlIGNoYW5nZSR7ZGV2aWNlID8gYCAoJHtkZXZpY2UuZGV2aWNlSWR9KWAgOiAnJ30uYCkpXG4gICAgICAvLyAgIClcbiAgICAgIC8vICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLmRldmljZSA9IGRldmljZSk7XG4gICAgICAvLyByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaW4gb3JkZXIgdG8gY2hhbmdlIHRoZSBkZXZpY2UgdGhlIGNvZGVSZWFkZXIgZ290dGEgYmUgcmVzZXRlZFxuICAgIHRoaXMuX3Jlc2V0KCk7XG5cbiAgICB0aGlzLl9kZXZpY2UgPSBkZXZpY2U7XG5cbiAgICAvLyBpZiBlbmFibGVkLCBzdGFydHMgc2Nhbm5pbmdcbiAgICBpZiAodGhpcy5fZW5hYmxlZCAmJiBkZXZpY2UgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuc2NhbkZyb21EZXZpY2UoZGV2aWNlLmRldmljZUlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgd2hlbiB0aGUgY3VycmVudCBkZXZpY2UgaXMgY2hhbmdlZC5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBkZXZpY2VDaGFuZ2U6IEV2ZW50RW1pdHRlcjxNZWRpYURldmljZUluZm8+O1xuXG4gIC8qKlxuICAgKiBVc2VyIGRldmljZSBhY2Vzc29yLlxuICAgKi9cbiAgZ2V0IGRldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGV2aWNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIHRoZSByZWdpc3RlcmVkIGZvcm1hdHMuXG4gICAqL1xuICBnZXQgZm9ybWF0cygpOiBCYXJjb2RlRm9ybWF0W10ge1xuICAgIHJldHVybiB0aGlzLmhpbnRzLmdldChEZWNvZGVIaW50VHlwZS5QT1NTSUJMRV9GT1JNQVRTKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgZm9ybWF0cyB0aGUgc2Nhbm5lciBzaG91bGQgc3VwcG9ydC5cbiAgICpcbiAgICogQHBhcmFtIGlucHV0IEJhcmNvZGVGb3JtYXQgb3IgY2FzZS1pbnNlbnNpdGl2ZSBzdHJpbmcgYXJyYXkuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgZm9ybWF0cyhpbnB1dDogQmFyY29kZUZvcm1hdFtdKSB7XG5cbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZvcm1hdHMsIG1ha2Ugc3VyZSB0aGUgW2Zvcm1hdHNdIGlucHV0IGlzIGEgYmluZGluZy4nKTtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXRzIG1heSBiZSBzZXQgZnJvbSBodG1sIHRlbXBsYXRlIGFzIEJhcmNvZGVGb3JtYXQgb3Igc3RyaW5nIGFycmF5XG4gICAgY29uc3QgZm9ybWF0cyA9IGlucHV0Lm1hcChmID0+IHRoaXMuZ2V0QmFyY29kZUZvcm1hdE9yRmFpbChmKSk7XG5cbiAgICBjb25zdCBoaW50cyA9IHRoaXMuaGludHM7XG5cbiAgICAvLyB1cGRhdGVzIHRoZSBoaW50c1xuICAgIGhpbnRzLnNldChEZWNvZGVIaW50VHlwZS5QT1NTSUJMRV9GT1JNQVRTLCBmb3JtYXRzKTtcblxuICAgIHRoaXMuaGludHMgPSBoaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCB0aGUgcmVnaXN0ZXJlZCBoaW50cy5cbiAgICovXG4gIGdldCBoaW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5faGludHM7XG4gIH1cblxuICAvKipcbiAgICogRG9lcyB3aGF0IGl0IHRha2VzIHRvIHNldCB0aGUgaGludHMuXG4gICAqL1xuICBzZXQgaGludHMoaGludHM6IE1hcDxEZWNvZGVIaW50VHlwZSwgYW55Pikge1xuXG4gICAgdGhpcy5faGludHMgPSBoaW50cztcblxuICAgIC8vIEBub3RlIGF2b2lkIHJlc3RhcnRpbmcgdGhlIGNvZGUgcmVhZGVyIHdoZW4gcG9zc2libGVcblxuICAgIC8vIG5ldyBpbnN0YW5jZSB3aXRoIG5ldyBoaW50cy5cbiAgICB0aGlzLnJlc3RhcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgc2V0IGlzQXV0b3N0YXJ0aW5nKHN0YXRlOiBib29sZWFuIHwgbnVsbCkge1xuICAgIHRoaXMuX2lzQXV0b3N0YXJ0aW5nID0gc3RhdGU7XG4gICAgdGhpcy5hdXRvc3RhcnRpbmcubmV4dChzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGdldCBpc0F1dHN0YXJ0aW5nKCk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5faXNBdXRvc3RhcnRpbmc7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3cgc3RhcnQgc2NhbiBvciBub3QuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgdG9yY2gob246IGJvb2xlYW4pIHtcbiAgICB0aGlzLmdldENvZGVSZWFkZXIoKS5zZXRUb3JjaChvbik7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3cgc3RhcnQgc2NhbiBvciBub3QuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgZW5hYmxlKGVuYWJsZWQ6IGJvb2xlYW4pIHtcblxuICAgIHRoaXMuX2VuYWJsZWQgPSBCb29sZWFuKGVuYWJsZWQpO1xuXG4gICAgaWYgKCF0aGlzLl9lbmFibGVkKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmRldmljZSkge1xuICAgICAgdGhpcy5zY2FuRnJvbURldmljZSh0aGlzLmRldmljZS5kZXZpY2VJZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlbGxzIGlmIHRoZSBzY2FubmVyIGlzIGVuYWJsZWQgb3Igbm90LlxuICAgKi9cbiAgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7XG4gIH1cblxuICAvKipcbiAgICogSWYgaXMgYHRyeUhhcmRlcmAgZW5hYmxlZC5cbiAgICovXG4gIGdldCB0cnlIYXJkZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaGludHMuZ2V0KERlY29kZUhpbnRUeXBlLlRSWV9IQVJERVIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZS9kaXNhYmxlIHRyeUhhcmRlciBoaW50LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHRyeUhhcmRlcihlbmFibGU6IGJvb2xlYW4pIHtcblxuICAgIGNvbnN0IGhpbnRzID0gdGhpcy5oaW50cztcblxuICAgIGlmIChlbmFibGUpIHtcbiAgICAgIGhpbnRzLnNldChEZWNvZGVIaW50VHlwZS5UUllfSEFSREVSLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGludHMuZGVsZXRlKERlY29kZUhpbnRUeXBlLlRSWV9IQVJERVIpO1xuICAgIH1cblxuICAgIHRoaXMuaGludHMgPSBoaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvciB0byBidWlsZCB0aGUgb2JqZWN0IGFuZCBkbyBzb21lIERJLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gaW5zdGFuY2UgYmFzZWQgZW1pdHRlcnNcbiAgICB0aGlzLmF1dG9zdGFydGVkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuYXV0b3N0YXJ0aW5nID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMudG9yY2hDb21wYXRpYmxlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuc2NhblN1Y2Nlc3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5zY2FuRmFpbHVyZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLnNjYW5FcnJvciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLnNjYW5Db21wbGV0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmNhbWVyYXNGb3VuZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmNhbWVyYXNOb3RGb3VuZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLnBlcm1pc3Npb25SZXNwb25zZSA9IG5ldyBFdmVudEVtaXR0ZXIodHJ1ZSk7XG4gICAgdGhpcy5oYXNEZXZpY2VzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuZGV2aWNlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgdGhpcy5fZGV2aWNlID0gbnVsbDtcbiAgICB0aGlzLl9lbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9oaW50cyA9IG5ldyBNYXA8RGVjb2RlSGludFR5cGUsIGFueT4oKTtcbiAgICB0aGlzLmF1dG9mb2N1c0VuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMuYXV0b3N0YXJ0ID0gdHJ1ZTtcbiAgICB0aGlzLmZvcm1hdHMgPSBbQmFyY29kZUZvcm1hdC5RUl9DT0RFXTtcblxuICAgIC8vIGNvbXB1dGVkIGRhdGFcbiAgICB0aGlzLmhhc05hdmlnYXRvciA9IHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnO1xuICAgIHRoaXMuaXNNZWRpYURldmljZXNTdXBvcnRlZCA9IHRoaXMuaGFzTmF2aWdhdG9yICYmICEhbmF2aWdhdG9yLm1lZGlhRGV2aWNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuZCByZWdpc3RlcnMgYWxsIGNhbW1lcmFzLlxuICAgKi9cbiAgYXN5bmMgYXNrRm9yUGVybWlzc2lvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcblxuICAgIGlmICghdGhpcy5oYXNOYXZpZ2F0b3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0B6eGluZy9uZ3gtc2Nhbm5lcicsICdDYW5cXCd0IGFzayBwZXJtaXNzaW9uLCBuYXZpZ2F0b3IgaXMgbm90IHByZXNlbnQuJyk7XG4gICAgICB0aGlzLnNldFBlcm1pc3Npb24obnVsbCk7XG4gICAgICByZXR1cm4gdGhpcy5oYXNQZXJtaXNzaW9uO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc01lZGlhRGV2aWNlc1N1cG9ydGVkKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdAenhpbmcvbmd4LXNjYW5uZXInLCAnQ2FuXFwndCBnZXQgdXNlciBtZWRpYSwgdGhpcyBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgdGhpcy5zZXRQZXJtaXNzaW9uKG51bGwpO1xuICAgICAgcmV0dXJuIHRoaXMuaGFzUGVybWlzc2lvbjtcbiAgICB9XG5cbiAgICBsZXQgc3RyZWFtOiBNZWRpYVN0cmVhbTtcbiAgICBsZXQgcGVybWlzc2lvbjogYm9vbGVhbjtcblxuICAgIHRyeSB7XG4gICAgICAvLyBXaWxsIHRyeSB0byBhc2sgZm9yIHBlcm1pc3Npb25cbiAgICAgIHN0cmVhbSA9IGF3YWl0IHRoaXMuZ2V0QW55VmlkZW9EZXZpY2UoKTtcbiAgICAgIHBlcm1pc3Npb24gPSAhIXN0cmVhbTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZVBlcm1pc3Npb25FeGNlcHRpb24oZXJyKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy50ZXJtaW5hdGVTdHJlYW0oc3RyZWFtKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFBlcm1pc3Npb24ocGVybWlzc2lvbik7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBwZXJtaXNzaW9uXG4gICAgcmV0dXJuIHBlcm1pc3Npb247XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIGdldEFueVZpZGVvRGV2aWNlKCk6IFByb21pc2U8TWVkaWFTdHJlYW0+IHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoeyB2aWRlbzogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXJtaW5hdGVzIGEgc3RyZWFtIGFuZCBpdCdzIHRyYWNrcy5cbiAgICovXG4gIHByaXZhdGUgdGVybWluYXRlU3RyZWFtKHN0cmVhbTogTWVkaWFTdHJlYW0pIHtcblxuICAgIGlmIChzdHJlYW0pIHtcbiAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHQgPT4gdC5zdG9wKCkpO1xuICAgIH1cblxuICAgIHN0cmVhbSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgY29tcG9uZW50IHdpdGhvdXQgc3RhcnRpbmcgdGhlIHNjYW5uZXIuXG4gICAqL1xuICBwcml2YXRlIGluaXRBdXRvc3RhcnRPZmYoKTogdm9pZCB7XG5cbiAgICAvLyBkbyBub3QgYXNrIGZvciBwZXJtaXNzaW9uIHdoZW4gYXV0b3N0YXJ0IGlzIG9mZlxuICAgIHRoaXMuaXNBdXRvc3RhcnRpbmcgPSBudWxsO1xuXG4gICAgLy8ganVzdCB1cGRhdGUgZGV2aWNlcyBpbmZvcm1hdGlvblxuICAgIHRoaXMudXBkYXRlVmlkZW9JbnB1dERldmljZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgY29tcG9uZW50IGFuZCBzdGFydHMgdGhlIHNjYW5uZXIuXG4gICAqIFBlcm1pc3Npb25zIGFyZSBhc2tlZCB0byBhY2NvbXBsaXNoIHRoYXQuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGluaXRBdXRvc3RhcnRPbigpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIHRoaXMuaXNBdXRvc3RhcnRpbmcgPSB0cnVlO1xuXG4gICAgbGV0IGhhc1Blcm1pc3Npb246IGJvb2xlYW47XG5cbiAgICB0cnkge1xuICAgICAgLy8gQXNrcyBmb3IgcGVybWlzc2lvbiBiZWZvcmUgZW51bWVyYXRpbmcgZGV2aWNlcyBzbyBpdCBjYW4gZ2V0IGFsbCB0aGUgZGV2aWNlJ3MgaW5mb1xuICAgICAgaGFzUGVybWlzc2lvbiA9IGF3YWl0IHRoaXMuYXNrRm9yUGVybWlzc2lvbigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4Y2VwdGlvbiBvY2N1cnJlZCB3aGlsZSBhc2tpbmcgZm9yIHBlcm1pc3Npb246JywgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZnJvbSB0aGlzIHBvaW50LCB0aGluZ3MgZ29ubmEgbmVlZCBwZXJtaXNzaW9uc1xuICAgIGlmIChoYXNQZXJtaXNzaW9uKSB7XG4gICAgICBjb25zdCBkZXZpY2VzID0gYXdhaXQgdGhpcy51cGRhdGVWaWRlb0lucHV0RGV2aWNlcygpO1xuICAgICAgdGhpcy5hdXRvc3RhcnRTY2FubmVyKFsuLi5kZXZpY2VzXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gZGV2aWNlIGlzIHRoZSBjdXJyZW50IGRlZmluZWQgb25lLlxuICAgKi9cbiAgaXNDdXJyZW50RGV2aWNlKGRldmljZTogTWVkaWFEZXZpY2VJbmZvKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlICYmIGRldmljZSAmJiBkZXZpY2UuZGV2aWNlSWQgPT09IHRoaXMuZGV2aWNlLmRldmljZUlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVkIGFmdGVyIHRoZSB2aWV3IGluaXRpYWxpemF0aW9uLlxuICAgKi9cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuXG4gICAgLy8gbWFrZXMgdG9yY2ggYXZhaWxhYmlsaXR5IGluZm9ybWF0aW9uIGF2YWlsYWJsZSB0byB1c2VyXG4gICAgdGhpcy5nZXRDb2RlUmVhZGVyKCkuaXNUb3JjaEF2YWlsYWJsZS5zdWJzY3JpYmUoeCA9PiB0aGlzLnRvcmNoQ29tcGF0aWJsZS5lbWl0KHgpKTtcblxuICAgIGlmICghdGhpcy5hdXRvc3RhcnQpIHtcbiAgICAgIGNvbnNvbGUud2FybignTmV3IGZlYXR1cmUgXFwnYXV0b3N0YXJ0XFwnIGRpc2FibGVkLCBiZSBjYXJlZnVsLiBQZXJtaXNzaW9ucyBhbmQgZGV2aWNlcyByZWNvdmVyeSBoYXMgdG8gYmUgcnVuIG1hbnVhbGx5LicpO1xuXG4gICAgICAvLyBkb2VzIHRoZSBuZWNlc3NhcnkgY29uZmlndXJhdGlvbiB3aXRob3V0IGF1dG9zdGFydGluZ1xuICAgICAgdGhpcy5pbml0QXV0b3N0YXJ0T2ZmKCk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBjb25maWd1cmF0ZXMgdGhlIGNvbXBvbmVudCBhbmQgc3RhcnRzIHRoZSBzY2FubmVyXG4gICAgdGhpcy5pbml0QXV0b3N0YXJ0T24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBzb21lIGFjdGlvbnMgYmVmb3JlIGRlc3Ryb3kgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBvbGQgYGNvZGVSZWFkZXJgIGFuZCBzdGFydHMgc2Nhbm5pbmcgaW4gYSBuZXcgb25lLlxuICAgKi9cbiAgcmVzdGFydCgpOiB2b2lkIHtcblxuICAgIGNvbnN0IHByZXZEZXZpY2UgPSB0aGlzLl9yZXNldCgpO1xuXG4gICAgaWYgKCFwcmV2RGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQG5vdGUgYXBlbmFzIG5lY2Vzc2FyaW8gcG9yIGVucXVhbnRvIGNhdXNhIGRhIFRvcmNoXG4gICAgdGhpcy5fY29kZVJlYWRlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRldmljZSA9IHByZXZEZXZpY2U7XG4gIH1cblxuICAvKipcbiAgICogRGlzY292ZXJzIGFuZCB1cGRhdGVzIGtub3duIHZpZGVvIGlucHV0IGRldmljZXMuXG4gICAqL1xuICBhc3luYyB1cGRhdGVWaWRlb0lucHV0RGV2aWNlcygpOiBQcm9taXNlPE1lZGlhRGV2aWNlSW5mb1tdPiB7XG5cbiAgICAvLyBwZXJtaXNzaW9ucyBhcmVuJ3QgbmVlZGVkIHRvIGdldCBkZXZpY2VzLCBidXQgdG8gYWNjZXNzIHRoZW0gYW5kIHRoZWlyIGluZm9cbiAgICBjb25zdCBkZXZpY2VzID0gYXdhaXQgdGhpcy5nZXRDb2RlUmVhZGVyKCkubGlzdFZpZGVvSW5wdXREZXZpY2VzKCkgfHwgW107XG4gICAgY29uc3QgaGFzRGV2aWNlcyA9IGRldmljZXMgJiYgZGV2aWNlcy5sZW5ndGggPiAwO1xuXG4gICAgLy8gc3RvcmVzIGRpc2NvdmVyZWQgZGV2aWNlcyBhbmQgdXBkYXRlcyBpbmZvcm1hdGlvblxuICAgIHRoaXMuaGFzRGV2aWNlcy5uZXh0KGhhc0RldmljZXMpO1xuICAgIHRoaXMuY2FtZXJhc0ZvdW5kLm5leHQoWy4uLmRldmljZXNdKTtcblxuICAgIGlmICghaGFzRGV2aWNlcykge1xuICAgICAgdGhpcy5jYW1lcmFzTm90Rm91bmQubmV4dCgpO1xuICAgIH1cblxuICAgIHJldHVybiBkZXZpY2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgc2Nhbm5lciB3aXRoIHRoZSBiYWNrIGNhbWVyYSBvdGhlcndpc2UgdGFrZSB0aGUgbGFzdFxuICAgKiBhdmFpbGFibGUgZGV2aWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBhdXRvc3RhcnRTY2FubmVyKGRldmljZXM6IE1lZGlhRGV2aWNlSW5mb1tdKSB7XG5cbiAgICBjb25zdCBtYXRjaGVyID0gKHsgbGFiZWwgfSkgPT4gL2JhY2t8dHLDoXN8cmVhcnx0cmFzZWlyYXxlbnZpcm9ubWVudHxhbWJpZW50ZS9naS50ZXN0KGxhYmVsKTtcblxuICAgIC8vIHNlbGVjdCB0aGUgcmVhciBjYW1lcmEgYnkgZGVmYXVsdCwgb3RoZXJ3aXNlIHRha2UgdGhlIGxhc3QgY2FtZXJhLlxuICAgIGNvbnN0IGRldmljZSA9IGRldmljZXMuZmluZChtYXRjaGVyKSB8fCBkZXZpY2VzLnBvcCgpO1xuXG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW1wb3NzaWJsZSB0byBhdXRvc3RhcnQsIG5vIGlucHV0IGRldmljZXMgYXZhaWxhYmxlLicpO1xuICAgIH1cblxuICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgIC8vIEBub3RlIHdoZW4gbGlzdGVuaW5nIHRvIHRoaXMgY2hhbmdlLCBjYWxsYmFjayBjb2RlIHdpbGwgc29tZXRpbWVzIHJ1biBiZWZvcmUgdGhlIHByZXZpb3VzIGxpbmUuXG4gICAgdGhpcy5kZXZpY2VDaGFuZ2UuZW1pdChkZXZpY2UpO1xuXG4gICAgdGhpcy5pc0F1dG9zdGFydGluZyA9IGZhbHNlO1xuICAgIHRoaXMuYXV0b3N0YXJ0ZWQubmV4dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgdGhlIHNjYW4gc3VjY2VzcyBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIHJlc3VsdCB0aGUgc2NhbiByZXN1bHQuXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoU2NhblN1Y2Nlc3MocmVzdWx0OiBSZXN1bHQpOiB2b2lkIHtcbiAgICB0aGlzLnNjYW5TdWNjZXNzLm5leHQocmVzdWx0LmdldFRleHQoKSk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyB0aGUgc2NhbiBmYWlsdXJlIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaFNjYW5GYWlsdXJlKHJlYXNvbj86IEV4Y2VwdGlvbik6IHZvaWQge1xuICAgIHRoaXMuc2NhbkZhaWx1cmUubmV4dChyZWFzb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgdGhlIHNjYW4gZXJyb3IgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSBlcnJvciB0aGUgZXJyb3IgdGhpbmcuXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoU2NhbkVycm9yKGVycm9yOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnNjYW5FcnJvci5uZXh0KGVycm9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIHRoZSBzY2FuIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gcmVzdWx0IHRoZSBzY2FuIHJlc3VsdC5cbiAgICovXG4gIHByaXZhdGUgZGlzcGF0Y2hTY2FuQ29tcGxldGUocmVzdWx0OiBSZXN1bHQpOiB2b2lkIHtcbiAgICB0aGlzLnNjYW5Db21wbGV0ZS5uZXh0KHJlc3VsdCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZmlsdGVyZWQgcGVybWlzc2lvbi5cbiAgICovXG4gIHByaXZhdGUgaGFuZGxlUGVybWlzc2lvbkV4Y2VwdGlvbihlcnI6IERPTUV4Y2VwdGlvbik6IGJvb2xlYW4ge1xuXG4gICAgLy8gZmFpbGVkIHRvIGdyYW50IHBlcm1pc3Npb24gdG8gdmlkZW8gaW5wdXRcbiAgICBjb25zb2xlLmVycm9yKCdAenhpbmcvbmd4LXNjYW5uZXInLCAnRXJyb3Igd2hlbiBhc2tpbmcgZm9yIHBlcm1pc3Npb24uJywgZXJyKTtcblxuICAgIGxldCBwZXJtaXNzaW9uOiBib29sZWFuO1xuXG4gICAgc3dpdGNoIChlcnIubmFtZSkge1xuXG4gICAgICAvLyB1c3VhbGx5IGNhdXNlZCBieSBub3Qgc2VjdXJlIG9yaWdpbnNcbiAgICAgIGNhc2UgJ05vdFN1cHBvcnRlZEVycm9yJzpcbiAgICAgICAgY29uc29sZS53YXJuKCdAenhpbmcvbmd4LXNjYW5uZXInLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIC8vIGNvdWxkIG5vdCBjbGFpbVxuICAgICAgICBwZXJtaXNzaW9uID0gbnVsbDtcbiAgICAgICAgLy8gY2FuJ3QgY2hlY2sgZGV2aWNlc1xuICAgICAgICB0aGlzLmhhc0RldmljZXMubmV4dChudWxsKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIHVzZXIgZGVuaWVkIHBlcm1pc3Npb25cbiAgICAgIGNhc2UgJ05vdEFsbG93ZWRFcnJvcic6XG4gICAgICAgIGNvbnNvbGUud2FybignQHp4aW5nL25neC1zY2FubmVyJywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAvLyBjbGFpbWVkIGFuZCBkZW5pZWQgcGVybWlzc2lvblxuICAgICAgICBwZXJtaXNzaW9uID0gZmFsc2U7XG4gICAgICAgIC8vIHRoaXMgbWVhbnMgdGhhdCBpbnB1dCBkZXZpY2VzIGV4aXN0c1xuICAgICAgICB0aGlzLmhhc0RldmljZXMubmV4dCh0cnVlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIHRoZSBkZXZpY2UgaGFzIG5vIGF0dGFjaGVkIGlucHV0IGRldmljZXNcbiAgICAgIGNhc2UgJ05vdEZvdW5kRXJyb3InOlxuICAgICAgICBjb25zb2xlLndhcm4oJ0B6eGluZy9uZ3gtc2Nhbm5lcicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgLy8gbm8gcGVybWlzc2lvbnMgY2xhaW1lZFxuICAgICAgICBwZXJtaXNzaW9uID0gbnVsbDtcbiAgICAgICAgLy8gYmVjYXVzZSB0aGVyZSB3YXMgbm8gZGV2aWNlc1xuICAgICAgICB0aGlzLmhhc0RldmljZXMubmV4dChmYWxzZSk7XG4gICAgICAgIC8vIHRlbGxzIHRoZSBsaXN0ZW5lciBhYm91dCB0aGUgZXJyb3JcbiAgICAgICAgdGhpcy5jYW1lcmFzTm90Rm91bmQubmV4dChlcnIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnTm90UmVhZGFibGVFcnJvcic6XG4gICAgICAgIGNvbnNvbGUud2FybignQHp4aW5nL25neC1zY2FubmVyJywgJ0NvdWxkblxcJ3QgcmVhZCB0aGUgZGV2aWNlKHMpXFwncyBzdHJlYW0sIGl0XFwncyBwcm9iYWJseSBpbiB1c2UgYnkgYW5vdGhlciBhcHAuJyk7XG4gICAgICAgIC8vIG5vIHBlcm1pc3Npb25zIGNsYWltZWRcbiAgICAgICAgcGVybWlzc2lvbiA9IG51bGw7XG4gICAgICAgIC8vIHRoZXJlIGFyZSBkZXZpY2VzLCB3aGljaCBJIGNvdWxkbid0IHVzZVxuICAgICAgICB0aGlzLmhhc0RldmljZXMubmV4dChmYWxzZSk7XG4gICAgICAgIC8vIHRlbGxzIHRoZSBsaXN0ZW5lciBhYm91dCB0aGUgZXJyb3JcbiAgICAgICAgdGhpcy5jYW1lcmFzTm90Rm91bmQubmV4dChlcnIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS53YXJuKCdAenhpbmcvbmd4LXNjYW5uZXInLCAnSSB3YXMgbm90IGFibGUgdG8gZGVmaW5lIGlmIEkgaGF2ZSBwZXJtaXNzaW9ucyBmb3IgY2FtZXJhIG9yIG5vdC4nLCBlcnIpO1xuICAgICAgICAvLyB1bmtub3duXG4gICAgICAgIHBlcm1pc3Npb24gPSBudWxsO1xuICAgICAgICAvLyB0aGlzLmhhc0RldmljZXMubmV4dCh1bmRlZmluZWQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgfVxuXG4gICAgdGhpcy5zZXRQZXJtaXNzaW9uKHBlcm1pc3Npb24pO1xuXG4gICAgLy8gdGVsbHMgdGhlIGxpc3RlbmVyIGFib3V0IHRoZSBlcnJvclxuICAgIHRoaXMucGVybWlzc2lvblJlc3BvbnNlLmVycm9yKGVycik7XG5cbiAgICByZXR1cm4gcGVybWlzc2lvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsaWQgQmFyY29kZUZvcm1hdCBvciBmYWlscy5cbiAgICovXG4gIHByaXZhdGUgZ2V0QmFyY29kZUZvcm1hdE9yRmFpbChmb3JtYXQ6IHN0cmluZyB8IEJhcmNvZGVGb3JtYXQpOiBCYXJjb2RlRm9ybWF0IHtcbiAgICByZXR1cm4gdHlwZW9mIGZvcm1hdCA9PT0gJ3N0cmluZydcbiAgICAgID8gQmFyY29kZUZvcm1hdFtmb3JtYXQudHJpbSgpLnRvVXBwZXJDYXNlKCldXG4gICAgICA6IGZvcm1hdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRvcm5hIHVtIGNvZGUgcmVhZGVyLCBjcmlhIHVtIHNlIG5lbmh1bWUgZXhpc3RlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRDb2RlUmVhZGVyKCk6IEJyb3dzZXJNdWx0aUZvcm1hdENvbnRpbnVvdXNSZWFkZXIge1xuXG4gICAgaWYgKCF0aGlzLl9jb2RlUmVhZGVyKSB7XG4gICAgICB0aGlzLl9jb2RlUmVhZGVyID0gbmV3IEJyb3dzZXJNdWx0aUZvcm1hdENvbnRpbnVvdXNSZWFkZXIodGhpcy5oaW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvZGVSZWFkZXI7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBjb250aW51b3VzIHNjYW5uaW5nIGZvciB0aGUgZ2l2ZW4gZGV2aWNlLlxuICAgKlxuICAgKiBAcGFyYW0gZGV2aWNlSWQgVGhlIGRldmljZUlkIGZyb20gdGhlIGRldmljZS5cbiAgICovXG4gIHByaXZhdGUgc2NhbkZyb21EZXZpY2UoZGV2aWNlSWQ6IHN0cmluZyk6IHZvaWQge1xuXG4gICAgY29uc3QgdmlkZW9FbGVtZW50ID0gdGhpcy5wcmV2aWV3RWxlbVJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgY29uc3QgY29kZVJlYWRlciA9IHRoaXMuZ2V0Q29kZVJlYWRlcigpO1xuXG4gICAgY29uc3QgZGVjb2RpbmdTdHJlYW0gPSBjb2RlUmVhZGVyLmNvbnRpbnVvdXNEZWNvZGVGcm9tSW5wdXRWaWRlb0RldmljZShkZXZpY2VJZCwgdmlkZW9FbGVtZW50KTtcblxuICAgIGlmICghZGVjb2RpbmdTdHJlYW0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5kZWZpbmVkIGRlY29kaW5nIHN0cmVhbSwgYWJvcnRpbmcuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV4dCA9ICh4OiBSZXN1bHRBbmRFcnJvcikgPT4gdGhpcy5fb25EZWNvZGVSZXN1bHQoeC5yZXN1bHQsIHguZXJyb3IpO1xuICAgIGNvbnN0IGVycm9yID0gKGVycjogYW55KSA9PiB0aGlzLl9vbkRlY29kZUVycm9yKGVycik7XG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7IHRoaXMucmVzZXQoKTsgY29uc29sZS5sb2coJ2NvbXBsZXRlZCcpOyB9O1xuXG4gICAgZGVjb2RpbmdTdHJlYW0uc3Vic2NyaWJlKG5leHQsIGVycm9yLCBjb21wbGV0ZSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBkZWNvZGUgZXJyb3JzLlxuICAgKi9cbiAgcHJpdmF0ZSBfb25EZWNvZGVFcnJvcihlcnI6IGFueSkge1xuICAgIHRoaXMuZGlzcGF0Y2hTY2FuRXJyb3IoZXJyKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBkZWNvZGUgcmVzdWx0cy5cbiAgICovXG4gIHByaXZhdGUgX29uRGVjb2RlUmVzdWx0KHJlc3VsdDogUmVzdWx0LCBlcnJvcjogRXhjZXB0aW9uKTogdm9pZCB7XG5cbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoU2NhblN1Y2Nlc3MocmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXNwYXRjaFNjYW5GYWlsdXJlKGVycm9yKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3BhdGNoU2NhbkNvbXBsZXRlKHJlc3VsdCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgdGhlIGNvZGUgcmVhZGVyIGFuZCByZXR1cm5zIHRoZSBwcmV2aW91cyBzZWxlY3RlZCBkZXZpY2UuXG4gICAqL1xuICBwcml2YXRlIF9yZXNldCgpOiBNZWRpYURldmljZUluZm8ge1xuXG4gICAgaWYgKCF0aGlzLl9jb2RlUmVhZGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGV2aWNlID0gdGhpcy5kZXZpY2U7XG4gICAgLy8gZG8gbm90IHNldCB0aGlzLmRldmljZSBpbnNpZGUgdGhpcyBtZXRob2QsIGl0IHdvdWxkIGNyZWF0ZSBhIHJlY3Vyc2l2ZSBsb29wXG4gICAgdGhpcy5fZGV2aWNlID0gbnVsbDtcblxuICAgIHRoaXMuX2NvZGVSZWFkZXIucmVzZXQoKTtcblxuICAgIHJldHVybiBkZXZpY2U7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBzY2FubmVyIGFuZCBlbWl0cyBkZXZpY2UgY2hhbmdlLlxuICAgKi9cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgdGhpcy5kZXZpY2VDaGFuZ2UuZW1pdChudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwZXJtaXNzaW9uIHZhbHVlIGFuZCBlbW1pdHMgdGhlIGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBzZXRQZXJtaXNzaW9uKGhhc1Blcm1pc3Npb246IGJvb2xlYW4gfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5oYXNQZXJtaXNzaW9uID0gaGFzUGVybWlzc2lvbjtcbiAgICB0aGlzLnBlcm1pc3Npb25SZXNwb25zZS5uZXh0KGhhc1Blcm1pc3Npb24pO1xuICB9XG5cbn1cbiJdfQ==