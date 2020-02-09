/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ArgumentException, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { BrowserMultiFormatContinuousReader } from './browser-multi-format-continuous-reader';
export class ZXingScannerComponent {
    /**
     * Constructor to build the object and do some DI.
     */
    constructor() {
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
    /**
     * Exposes the current code reader, so the user can use it's APIs.
     * @return {?}
     */
    get codeReader() {
        return this._codeReader;
    }
    /**
     * User device input
     * @param {?} device
     * @return {?}
     */
    set device(device) {
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
    }
    /**
     * User device acessor.
     * @return {?}
     */
    get device() {
        return this._device;
    }
    /**
     * Returns all the registered formats.
     * @return {?}
     */
    get formats() {
        return this.hints.get(DecodeHintType.POSSIBLE_FORMATS);
    }
    /**
     * Registers formats the scanner should support.
     *
     * @param {?} input BarcodeFormat or case-insensitive string array.
     * @return {?}
     */
    set formats(input) {
        if (typeof input === 'string') {
            throw new Error('Invalid formats, make sure the [formats] input is a binding.');
        }
        // formats may be set from html template as BarcodeFormat or string array
        /** @type {?} */
        const formats = input.map((/**
         * @param {?} f
         * @return {?}
         */
        f => this.getBarcodeFormatOrFail(f)));
        /** @type {?} */
        const hints = this.hints;
        // updates the hints
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        this.hints = hints;
    }
    /**
     * Returns all the registered hints.
     * @return {?}
     */
    get hints() {
        return this._hints;
    }
    /**
     * Does what it takes to set the hints.
     * @param {?} hints
     * @return {?}
     */
    set hints(hints) {
        this._hints = hints;
        // @note avoid restarting the code reader when possible
        // new instance with new hints.
        this.restart();
    }
    /**
     *
     * @param {?} state
     * @return {?}
     */
    set isAutostarting(state) {
        this._isAutostarting = state;
        this.autostarting.next(state);
    }
    /**
     *
     * @return {?}
     */
    get isAutstarting() {
        return this._isAutostarting;
    }
    /**
     * Allow start scan or not.
     * @param {?} on
     * @return {?}
     */
    set torch(on) {
        this.getCodeReader().setTorch(on);
    }
    /**
     * Allow start scan or not.
     * @param {?} enabled
     * @return {?}
     */
    set enable(enabled) {
        this._enabled = Boolean(enabled);
        if (!this._enabled) {
            this.reset();
        }
        else if (this.device) {
            this.scanFromDevice(this.device.deviceId);
        }
    }
    /**
     * Tells if the scanner is enabled or not.
     * @return {?}
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * If is `tryHarder` enabled.
     * @return {?}
     */
    get tryHarder() {
        return this.hints.get(DecodeHintType.TRY_HARDER);
    }
    /**
     * Enable/disable tryHarder hint.
     * @param {?} enable
     * @return {?}
     */
    set tryHarder(enable) {
        /** @type {?} */
        const hints = this.hints;
        if (enable) {
            hints.set(DecodeHintType.TRY_HARDER, true);
        }
        else {
            hints.delete(DecodeHintType.TRY_HARDER);
        }
        this.hints = hints;
    }
    /**
     * Gets and registers all cammeras.
     * @return {?}
     */
    askForPermission() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.hasNavigator) {
                console.error('@zxing/ngx-scanner', 'Can\'t ask permission, navigator is not present.');
                this.setPermission(null);
                return this.hasPermission;
            }
            if (!this.isMediaDevicesSuported) {
                console.error('@zxing/ngx-scanner', 'Can\'t get user media, this is not supported.');
                this.setPermission(null);
                return this.hasPermission;
            }
            /** @type {?} */
            let stream;
            /** @type {?} */
            let permission;
            try {
                // Will try to ask for permission
                stream = yield this.getAnyVideoDevice();
                permission = !!stream;
            }
            catch (err) {
                return this.handlePermissionException(err);
            }
            finally {
                this.terminateStream(stream);
            }
            this.setPermission(permission);
            // Returns the permission
            return permission;
        });
    }
    /**
     *
     * @return {?}
     */
    getAnyVideoDevice() {
        return navigator.mediaDevices.getUserMedia({ video: true });
    }
    /**
     * Terminates a stream and it's tracks.
     * @private
     * @param {?} stream
     * @return {?}
     */
    terminateStream(stream) {
        if (stream) {
            stream.getTracks().forEach((/**
             * @param {?} t
             * @return {?}
             */
            t => t.stop()));
        }
        stream = undefined;
    }
    /**
     * Initializes the component without starting the scanner.
     * @private
     * @return {?}
     */
    initAutostartOff() {
        // do not ask for permission when autostart is off
        this.isAutostarting = null;
        // just update devices information
        this.updateVideoInputDevices();
    }
    /**
     * Initializes the component and starts the scanner.
     * Permissions are asked to accomplish that.
     * @private
     * @return {?}
     */
    initAutostartOn() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.isAutostarting = true;
            /** @type {?} */
            let hasPermission;
            try {
                // Asks for permission before enumerating devices so it can get all the device's info
                hasPermission = yield this.askForPermission();
            }
            catch (e) {
                console.error('Exception occurred while asking for permission:', e);
                return;
            }
            // from this point, things gonna need permissions
            if (hasPermission) {
                /** @type {?} */
                const devices = yield this.updateVideoInputDevices();
                this.autostartScanner([...devices]);
            }
        });
    }
    /**
     * Checks if the given device is the current defined one.
     * @param {?} device
     * @return {?}
     */
    isCurrentDevice(device) {
        return this.device && device && device.deviceId === this.device.deviceId;
    }
    /**
     * Executed after the view initialization.
     * @return {?}
     */
    ngAfterViewInit() {
        // makes torch availability information available to user
        this.getCodeReader().isTorchAvailable.subscribe((/**
         * @param {?} x
         * @return {?}
         */
        x => this.torchCompatible.emit(x)));
        if (!this.autostart) {
            console.warn('New feature \'autostart\' disabled, be careful. Permissions and devices recovery has to be run manually.');
            // does the necessary configuration without autostarting
            this.initAutostartOff();
            return;
        }
        // configurates the component and starts the scanner
        this.initAutostartOn();
    }
    /**
     * Executes some actions before destroy the component.
     * @return {?}
     */
    ngOnDestroy() {
        this.reset();
    }
    /**
     * Stops old `codeReader` and starts scanning in a new one.
     * @return {?}
     */
    restart() {
        /** @type {?} */
        const prevDevice = this._reset();
        if (!prevDevice) {
            return;
        }
        // @note apenas necessario por enquanto causa da Torch
        this._codeReader = undefined;
        this.device = prevDevice;
    }
    /**
     * Discovers and updates known video input devices.
     * @return {?}
     */
    updateVideoInputDevices() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // permissions aren't needed to get devices, but to access them and their info
            /** @type {?} */
            const devices = (yield this.getCodeReader().listVideoInputDevices()) || [];
            /** @type {?} */
            const hasDevices = devices && devices.length > 0;
            // stores discovered devices and updates information
            this.hasDevices.next(hasDevices);
            this.camerasFound.next([...devices]);
            if (!hasDevices) {
                this.camerasNotFound.next();
            }
            return devices;
        });
    }
    /**
     * Starts the scanner with the back camera otherwise take the last
     * available device.
     * @private
     * @param {?} devices
     * @return {?}
     */
    autostartScanner(devices) {
        /** @type {?} */
        const matcher = (/**
         * @param {?} __0
         * @return {?}
         */
        ({ label }) => /back|trás|rear|traseira|environment|ambiente/gi.test(label));
        // select the rear camera by default, otherwise take the last camera.
        /** @type {?} */
        const device = devices.find(matcher) || devices.pop();
        if (!device) {
            throw new Error('Impossible to autostart, no input devices available.');
        }
        this.device = device;
        // @note when listening to this change, callback code will sometimes run before the previous line.
        this.deviceChange.emit(device);
        this.isAutostarting = false;
        this.autostarted.next();
    }
    /**
     * Dispatches the scan success event.
     *
     * @private
     * @param {?} result the scan result.
     * @return {?}
     */
    dispatchScanSuccess(result) {
        this.scanSuccess.next(result.getText());
    }
    /**
     * Dispatches the scan failure event.
     * @private
     * @param {?=} reason
     * @return {?}
     */
    dispatchScanFailure(reason) {
        this.scanFailure.next(reason);
    }
    /**
     * Dispatches the scan error event.
     *
     * @private
     * @param {?} error the error thing.
     * @return {?}
     */
    dispatchScanError(error) {
        this.scanError.next(error);
    }
    /**
     * Dispatches the scan event.
     *
     * @private
     * @param {?} result the scan result.
     * @return {?}
     */
    dispatchScanComplete(result) {
        this.scanComplete.next(result);
    }
    /**
     * Returns the filtered permission.
     * @private
     * @param {?} err
     * @return {?}
     */
    handlePermissionException(err) {
        // failed to grant permission to video input
        console.error('@zxing/ngx-scanner', 'Error when asking for permission.', err);
        /** @type {?} */
        let permission;
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
    }
    /**
     * Returns a valid BarcodeFormat or fails.
     * @private
     * @param {?} format
     * @return {?}
     */
    getBarcodeFormatOrFail(format) {
        return typeof format === 'string'
            ? BarcodeFormat[format.trim().toUpperCase()]
            : format;
    }
    /**
     * Retorna um code reader, cria um se nenhume existe.
     * @private
     * @return {?}
     */
    getCodeReader() {
        if (!this._codeReader) {
            this._codeReader = new BrowserMultiFormatContinuousReader(this.hints);
        }
        return this._codeReader;
    }
    /**
     * Starts the continuous scanning for the given device.
     *
     * @private
     * @param {?} deviceId The deviceId from the device.
     * @return {?}
     */
    scanFromDevice(deviceId) {
        /** @type {?} */
        const videoElement = this.previewElemRef.nativeElement;
        /** @type {?} */
        const codeReader = this.getCodeReader();
        /** @type {?} */
        const decodingStream = codeReader.continuousDecodeFromInputVideoDevice(deviceId, videoElement);
        if (!decodingStream) {
            throw new Error('Undefined decoding stream, aborting.');
        }
        /** @type {?} */
        const next = (/**
         * @param {?} x
         * @return {?}
         */
        (x) => this._onDecodeResult(x.result, x.error));
        /** @type {?} */
        const error = (/**
         * @param {?} err
         * @return {?}
         */
        (err) => this._onDecodeError(err));
        /** @type {?} */
        const complete = (/**
         * @return {?}
         */
        () => { this.reset(); console.log('completed'); });
        decodingStream.subscribe(next, error, complete);
    }
    /**
     * Handles decode errors.
     * @private
     * @param {?} err
     * @return {?}
     */
    _onDecodeError(err) {
        this.dispatchScanError(err);
        this.reset();
    }
    /**
     * Handles decode results.
     * @private
     * @param {?} result
     * @param {?} error
     * @return {?}
     */
    _onDecodeResult(result, error) {
        if (result) {
            this.dispatchScanSuccess(result);
        }
        else {
            this.dispatchScanFailure(error);
        }
        this.dispatchScanComplete(result);
    }
    /**
     * Stops the code reader and returns the previous selected device.
     * @private
     * @return {?}
     */
    _reset() {
        if (!this._codeReader) {
            return;
        }
        /** @type {?} */
        const device = this.device;
        // do not set this.device inside this method, it would create a recursive loop
        this._device = null;
        this._codeReader.reset();
        return device;
    }
    /**
     * Resets the scanner and emits device change.
     * @return {?}
     */
    reset() {
        this._reset();
        this.deviceChange.emit(null);
    }
    /**
     * Sets the permission value and emmits the event.
     * @private
     * @param {?} hasPermission
     * @return {?}
     */
    setPermission(hasPermission) {
        this.hasPermission = hasPermission;
        this.permissionResponse.next(hasPermission);
    }
}
ZXingScannerComponent.decorators = [
    { type: Component, args: [{
                selector: 'zxing-scanner',
                template: "<video #preview [style.object-fit]=\"previewFitMode\">\n  <p>\n    Your browser does not support this feature, please try to upgrade it.\n  </p>\n  <p>\n    Seu navegador n\u00E3o suporta este recurso, por favor tente atualiz\u00E1-lo.\n  </p>\n</video>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [":host{display:block}video{width:100%;height:auto;-o-object-fit:contain;object-fit:contain}"]
            }] }
];
/** @nocollapse */
ZXingScannerComponent.ctorParameters = () => [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoienhpbmctc2Nhbm5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvenhpbmctc2Nhbm5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEVBQ04sU0FBUyxFQUVWLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsYUFBYSxFQUNiLGNBQWMsRUFHZixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBRSxrQ0FBa0MsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBUzlGLE1BQU0sT0FBTyxxQkFBcUI7Ozs7SUE2VGhDOzs7O1FBalBBLG1CQUFjLEdBQXlELE9BQU8sQ0FBQztRQWtQN0UsMEJBQTBCO1FBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJ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QTZCTCxLQUFLOzs7Ozs7OztJQXZTTix1Q0FBZ0Q7Ozs7OztJQUtoRCw0Q0FBd0Q7Ozs7OztJQUt4RCx3Q0FBaUM7Ozs7OztJQUtqQyx5Q0FBMEI7Ozs7OztJQUsxQixnREFBaUM7Ozs7OztJQUtqQyw2Q0FBOEI7Ozs7OztJQUs5Qix1REFBd0M7Ozs7OztJQUt4Qyw4Q0FBc0M7Ozs7O0lBS3RDLCtDQUM2Qzs7Ozs7SUFLN0MsaURBQzBCOzs7OztJQUsxQiw0Q0FDZ0M7Ozs7O0lBS2hDLDZDQUMyQzs7Ozs7SUFLM0MsMENBQ21COzs7OztJQUtuQiwrQ0FDK0U7Ozs7O0lBSy9FLGdEQUN1Qzs7Ozs7SUFLdkMsNENBQ2tDOzs7OztJQUtsQyw0Q0FDaUQ7Ozs7O0lBS2pELDBDQUMrQjs7Ozs7SUFLL0IsNkNBQ21DOzs7OztJQUtuQyw2Q0FDOEM7Ozs7O0lBSzlDLGdEQUNtQzs7Ozs7SUFLbkMsbURBQzBDOzs7OztJQUsxQywyQ0FDa0M7Ozs7O0lBdURsQyw2Q0FDNEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgVmlld0NoaWxkLFxuICBOZ1pvbmVcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIEFyZ3VtZW50RXhjZXB0aW9uLFxuICBCYXJjb2RlRm9ybWF0LFxuICBEZWNvZGVIaW50VHlwZSxcbiAgRXhjZXB0aW9uLFxuICBSZXN1bHRcbn0gZnJvbSAnQHp4aW5nL2xpYnJhcnknO1xuXG5pbXBvcnQgeyBCcm93c2VyTXVsdGlGb3JtYXRDb250aW51b3VzUmVhZGVyIH0gZnJvbSAnLi9icm93c2VyLW11bHRpLWZvcm1hdC1jb250aW51b3VzLXJlYWRlcic7XG5pbXBvcnQgeyBSZXN1bHRBbmRFcnJvciB9IGZyb20gJy4vUmVzdWx0QW5kRXJyb3InO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd6eGluZy1zY2FubmVyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3p4aW5nLXNjYW5uZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi96eGluZy1zY2FubmVyLmNvbXBvbmVudC5zY3NzJ10sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIFpYaW5nU2Nhbm5lckNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgLyoqXG4gICAqIFN1cHBvcnRlZCBIaW50cyBtYXAuXG4gICAqL1xuICBwcml2YXRlIF9oaW50czogTWFwPERlY29kZUhpbnRUeXBlLCBhbnk+IHwgbnVsbDtcblxuICAvKipcbiAgICogVGhlIFpYaW5nIGNvZGUgcmVhZGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfY29kZVJlYWRlcjogQnJvd3Nlck11bHRpRm9ybWF0Q29udGludW91c1JlYWRlcjtcblxuICAvKipcbiAgICogVGhlIGRldmljZSB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHNjYW4gdGhpbmdzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZGV2aWNlOiBNZWRpYURldmljZUluZm87XG5cbiAgLyoqXG4gICAqIFRoZSBkZXZpY2UgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBzY2FuIHRoaW5ncy5cbiAgICovXG4gIHByaXZhdGUgX2VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBwcml2YXRlIF9pc0F1dG9zdGFydGluZzogYm9vbGVhbjtcblxuICAvKipcbiAgICogSGFzIGBuYXZpZ2F0b3JgIGFjY2Vzcy5cbiAgICovXG4gIHByaXZhdGUgaGFzTmF2aWdhdG9yOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTYXlzIGlmIHNvbWUgbmF0aXZlIEFQSSBpcyBzdXBwb3J0ZWQuXG4gICAqL1xuICBwcml2YXRlIGlzTWVkaWFEZXZpY2VzU3Vwb3J0ZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIElmIHRoZSB1c2VyLWFnZW50IGFsbG93ZWQgdGhlIHVzZSBvZiB0aGUgY2FtZXJhIG9yIG5vdC5cbiAgICovXG4gIHByaXZhdGUgaGFzUGVybWlzc2lvbjogYm9vbGVhbiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgcHJldmlldyBlbGVtZW50LCBzaG91bGQgYmUgdGhlIGB2aWRlb2AgdGFnLlxuICAgKi9cbiAgQFZpZXdDaGlsZCgncHJldmlldycsIHsgc3RhdGljOiB0cnVlIH0pXG4gIHByZXZpZXdFbGVtUmVmOiBFbGVtZW50UmVmPEhUTUxWaWRlb0VsZW1lbnQ+O1xuXG4gIC8qKlxuICAgKiBFbmFibGUgb3IgZGlzYWJsZSBhdXRvZm9jdXMgb2YgdGhlIGNhbWVyYSAobWlnaHQgaGF2ZSBhbiBpbXBhY3Qgb24gcGVyZm9ybWFuY2UpXG4gICAqL1xuICBASW5wdXQoKVxuICBhdXRvZm9jdXNFbmFibGVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB3aGVuIGFuZCBpZiB0aGUgc2Nhbm5lciBpcyBhdXRvc3RhcnRlZC5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBhdXRvc3RhcnRlZDogRXZlbnRFbWl0dGVyPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBUcnVlIGR1cmluZyBhdXRvc3RhcnQgYW5kIGZhbHNlIGFmdGVyLiBJdCB3aWxsIGJlIG51bGwgaWYgd29uJ3QgYXV0b3N0YXJ0IGF0IGFsbC5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBhdXRvc3RhcnRpbmc6IEV2ZW50RW1pdHRlcjxib29sZWFuIHwgbnVsbD47XG5cbiAgLyoqXG4gICAqIElmIHRoZSBzY2FubmVyIHNob3VsZCBhdXRvc3RhcnQgd2l0aCB0aGUgZmlyc3QgYXZhaWxhYmxlIGRldmljZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGF1dG9zdGFydDogYm9vbGVhbjtcblxuICAvKipcbiAgICogSG93IHRoZSBwcmV2aWV3IGVsZW1lbnQgc2hvdWQgYmUgZml0IGluc2lkZSB0aGUgOmhvc3QgY29udGFpbmVyLlxuICAgKi9cbiAgQElucHV0KClcbiAgcHJldmlld0ZpdE1vZGU6ICdmaWxsJyB8ICdjb250YWluJyB8ICdjb3ZlcicgfCAnc2NhbGUtZG93bicgfCAnbm9uZScgPSAnY292ZXInO1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gdGhlIHRvcmNoIGNvbXBhdGliaWxpdHkgaXMgY2hhbmdlZC5cbiAgICovXG4gIEBPdXRwdXQoKVxuICB0b3JjaENvbXBhdGlibGU6IEV2ZW50RW1pdHRlcjxib29sZWFuPjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIGEgc2NhbiBpcyBzdWNjZXNzZnVsIHBlcmZvcm1lZCwgd2lsbCBpbmplY3QgdGhlIHN0cmluZyB2YWx1ZSBvZiB0aGUgUVItY29kZSB0byB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBAT3V0cHV0KClcbiAgc2NhblN1Y2Nlc3M6IEV2ZW50RW1pdHRlcjxzdHJpbmc+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gYSBzY2FuIGZhaWxzIHdpdGhvdXQgZXJyb3JzLCB1c2VmdWxsIHRvIGtub3cgaG93IG11Y2ggc2NhbiB0cmllcyB3aGVyZSBtYWRlLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHNjYW5GYWlsdXJlOiBFdmVudEVtaXR0ZXI8RXhjZXB0aW9uIHwgdW5kZWZpbmVkPjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIGEgc2NhbiB0aHJvd3Mgc29tZSBlcnJvciwgd2lsbCBpbmplY3QgdGhlIGVycm9yIHRvIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBzY2FuRXJyb3I6IEV2ZW50RW1pdHRlcjxFcnJvcj47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiBhIHNjYW4gaXMgcGVyZm9ybWVkLCB3aWxsIGluamVjdCB0aGUgUmVzdWx0IHZhbHVlIG9mIHRoZSBRUi1jb2RlIHNjYW4gKGlmIGF2YWlsYWJsZSkgdG8gdGhlIGNhbGxiYWNrLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHNjYW5Db21wbGV0ZTogRXZlbnRFbWl0dGVyPFJlc3VsdD47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiBubyBjYW1lcmFzIGFyZSBmb3VuZCwgd2lsbCBpbmplY3QgYW4gZXhjZXB0aW9uIChpZiBhdmFpbGFibGUpIHRvIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBjYW1lcmFzRm91bmQ6IEV2ZW50RW1pdHRlcjxNZWRpYURldmljZUluZm9bXT47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiBubyBjYW1lcmFzIGFyZSBmb3VuZCwgd2lsbCBpbmplY3QgYW4gZXhjZXB0aW9uIChpZiBhdmFpbGFibGUpIHRvIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBjYW1lcmFzTm90Rm91bmQ6IEV2ZW50RW1pdHRlcjxhbnk+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gdGhlIHVzZXJzIGFuc3dlcnMgZm9yIHBlcm1pc3Npb24uXG4gICAqL1xuICBAT3V0cHV0KClcbiAgcGVybWlzc2lvblJlc3BvbnNlOiBFdmVudEVtaXR0ZXI8Ym9vbGVhbj47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiBoYXMgZGV2aWNlcyBzdGF0dXMgaXMgdXBkYXRlLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGhhc0RldmljZXM6IEV2ZW50RW1pdHRlcjxib29sZWFuPjtcblxuICAvKipcbiAgICogRXhwb3NlcyB0aGUgY3VycmVudCBjb2RlIHJlYWRlciwgc28gdGhlIHVzZXIgY2FuIHVzZSBpdCdzIEFQSXMuXG4gICAqL1xuICBnZXQgY29kZVJlYWRlcigpOiBCcm93c2VyTXVsdGlGb3JtYXRDb250aW51b3VzUmVhZGVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29kZVJlYWRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VyIGRldmljZSBpbnB1dFxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGRldmljZShkZXZpY2U6IE1lZGlhRGV2aWNlSW5mbyB8IG51bGwpIHtcblxuICAgIGlmICghZGV2aWNlICYmIGRldmljZSAhPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXhjZXB0aW9uKCdUaGUgYGRldmljZWAgbXVzdCBiZSBhIHZhbGlkIE1lZGlhRGV2aWNlSW5mbyBvciBudWxsLicpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQ3VycmVudERldmljZShkZXZpY2UpKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1NldHRpbmcgdGhlIHNhbWUgZGV2aWNlIGlzIG5vdCBhbGxvd2VkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQXV0b3N0YXJ0aW5nKSB7XG4gICAgICAvLyBkbyBub3QgYWxsb3cgc2V0dGluZyBkZXZpY2VzIGR1cmluZyBhdXRvLXN0YXJ0LCBzaW5jZSBpdCB3aWxsIHNldCBvbmUgYW5kIGVtaXQgaXQuXG4gICAgICBjb25zb2xlLndhcm4oJ0F2b2lkIHNldHRpbmcgYSBkZXZpY2UgZHVyaW5nIGF1dG8tc3RhcnQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmhhc1Blcm1pc3Npb24pIHtcbiAgICAgIGNvbnNvbGUud2FybignUGVybWlzc2lvbnMgbm90IHNldCB5ZXQsIHdhaXRpbmcgZm9yIHRoZW0gdG8gYmUgc2V0IHRvIGFwcGx5IGRldmljZSBjaGFuZ2UuJyk7XG4gICAgICAvLyB0aGlzLnBlcm1pc3Npb25SZXNwb25zZVxuICAgICAgLy8gICAucGlwZShcbiAgICAgIC8vICAgICB0YWtlKDEpLFxuICAgICAgLy8gICAgIHRhcCgoKSA9PiBjb25zb2xlLmxvZyhgUGVybWlzc2lvbnMgc2V0LCBhcHBseWluZyBkZXZpY2UgY2hhbmdlJHtkZXZpY2UgPyBgICgke2RldmljZS5kZXZpY2VJZH0pYCA6ICcnfS5gKSlcbiAgICAgIC8vICAgKVxuICAgICAgLy8gICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuZGV2aWNlID0gZGV2aWNlKTtcbiAgICAgIC8vIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBpbiBvcmRlciB0byBjaGFuZ2UgdGhlIGRldmljZSB0aGUgY29kZVJlYWRlciBnb3R0YSBiZSByZXNldGVkXG4gICAgdGhpcy5fcmVzZXQoKTtcblxuICAgIHRoaXMuX2RldmljZSA9IGRldmljZTtcblxuICAgIC8vIGlmIGVuYWJsZWQsIHN0YXJ0cyBzY2FubmluZ1xuICAgIGlmICh0aGlzLl9lbmFibGVkICYmIGRldmljZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zY2FuRnJvbURldmljZShkZXZpY2UuZGV2aWNlSWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyB3aGVuIHRoZSBjdXJyZW50IGRldmljZSBpcyBjaGFuZ2VkLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGRldmljZUNoYW5nZTogRXZlbnRFbWl0dGVyPE1lZGlhRGV2aWNlSW5mbz47XG5cbiAgLyoqXG4gICAqIFVzZXIgZGV2aWNlIGFjZXNzb3IuXG4gICAqL1xuICBnZXQgZGV2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLl9kZXZpY2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgdGhlIHJlZ2lzdGVyZWQgZm9ybWF0cy5cbiAgICovXG4gIGdldCBmb3JtYXRzKCk6IEJhcmNvZGVGb3JtYXRbXSB7XG4gICAgcmV0dXJuIHRoaXMuaGludHMuZ2V0KERlY29kZUhpbnRUeXBlLlBPU1NJQkxFX0ZPUk1BVFMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBmb3JtYXRzIHRoZSBzY2FubmVyIHNob3VsZCBzdXBwb3J0LlxuICAgKlxuICAgKiBAcGFyYW0gaW5wdXQgQmFyY29kZUZvcm1hdCBvciBjYXNlLWluc2Vuc2l0aXZlIHN0cmluZyBhcnJheS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBmb3JtYXRzKGlucHV0OiBCYXJjb2RlRm9ybWF0W10pIHtcblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZm9ybWF0cywgbWFrZSBzdXJlIHRoZSBbZm9ybWF0c10gaW5wdXQgaXMgYSBiaW5kaW5nLicpO1xuICAgIH1cblxuICAgIC8vIGZvcm1hdHMgbWF5IGJlIHNldCBmcm9tIGh0bWwgdGVtcGxhdGUgYXMgQmFyY29kZUZvcm1hdCBvciBzdHJpbmcgYXJyYXlcbiAgICBjb25zdCBmb3JtYXRzID0gaW5wdXQubWFwKGYgPT4gdGhpcy5nZXRCYXJjb2RlRm9ybWF0T3JGYWlsKGYpKTtcblxuICAgIGNvbnN0IGhpbnRzID0gdGhpcy5oaW50cztcblxuICAgIC8vIHVwZGF0ZXMgdGhlIGhpbnRzXG4gICAgaGludHMuc2V0KERlY29kZUhpbnRUeXBlLlBPU1NJQkxFX0ZPUk1BVFMsIGZvcm1hdHMpO1xuXG4gICAgdGhpcy5oaW50cyA9IGhpbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIHRoZSByZWdpc3RlcmVkIGhpbnRzLlxuICAgKi9cbiAgZ2V0IGhpbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9oaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBEb2VzIHdoYXQgaXQgdGFrZXMgdG8gc2V0IHRoZSBoaW50cy5cbiAgICovXG4gIHNldCBoaW50cyhoaW50czogTWFwPERlY29kZUhpbnRUeXBlLCBhbnk+KSB7XG5cbiAgICB0aGlzLl9oaW50cyA9IGhpbnRzO1xuXG4gICAgLy8gQG5vdGUgYXZvaWQgcmVzdGFydGluZyB0aGUgY29kZSByZWFkZXIgd2hlbiBwb3NzaWJsZVxuXG4gICAgLy8gbmV3IGluc3RhbmNlIHdpdGggbmV3IGhpbnRzLlxuICAgIHRoaXMucmVzdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBzZXQgaXNBdXRvc3RhcnRpbmcoc3RhdGU6IGJvb2xlYW4gfCBudWxsKSB7XG4gICAgdGhpcy5faXNBdXRvc3RhcnRpbmcgPSBzdGF0ZTtcbiAgICB0aGlzLmF1dG9zdGFydGluZy5uZXh0KHN0YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgZ2V0IGlzQXV0c3RhcnRpbmcoKTogYm9vbGVhbiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9pc0F1dG9zdGFydGluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvdyBzdGFydCBzY2FuIG9yIG5vdC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCB0b3JjaChvbjogYm9vbGVhbikge1xuICAgIHRoaXMuZ2V0Q29kZVJlYWRlcigpLnNldFRvcmNoKG9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvdyBzdGFydCBzY2FuIG9yIG5vdC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCBlbmFibGUoZW5hYmxlZDogYm9vbGVhbikge1xuXG4gICAgdGhpcy5fZW5hYmxlZCA9IEJvb2xlYW4oZW5hYmxlZCk7XG5cbiAgICBpZiAoIXRoaXMuX2VuYWJsZWQpIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGV2aWNlKSB7XG4gICAgICB0aGlzLnNjYW5Gcm9tRGV2aWNlKHRoaXMuZGV2aWNlLmRldmljZUlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGVsbHMgaWYgdGhlIHNjYW5uZXIgaXMgZW5hYmxlZCBvciBub3QuXG4gICAqL1xuICBnZXQgZW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBpcyBgdHJ5SGFyZGVyYCBlbmFibGVkLlxuICAgKi9cbiAgZ2V0IHRyeUhhcmRlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5oaW50cy5nZXQoRGVjb2RlSGludFR5cGUuVFJZX0hBUkRFUik7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlL2Rpc2FibGUgdHJ5SGFyZGVyIGhpbnQuXG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgdHJ5SGFyZGVyKGVuYWJsZTogYm9vbGVhbikge1xuXG4gICAgY29uc3QgaGludHMgPSB0aGlzLmhpbnRzO1xuXG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgaGludHMuc2V0KERlY29kZUhpbnRUeXBlLlRSWV9IQVJERVIsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaW50cy5kZWxldGUoRGVjb2RlSGludFR5cGUuVFJZX0hBUkRFUik7XG4gICAgfVxuXG4gICAgdGhpcy5oaW50cyA9IGhpbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIHRvIGJ1aWxkIHRoZSBvYmplY3QgYW5kIGRvIHNvbWUgREkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvLyBpbnN0YW5jZSBiYXNlZCBlbWl0dGVyc1xuICAgIHRoaXMuYXV0b3N0YXJ0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5hdXRvc3RhcnRpbmcgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy50b3JjaENvbXBhdGlibGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5zY2FuU3VjY2VzcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLnNjYW5GYWlsdXJlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuc2NhbkVycm9yID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuc2NhbkNvbXBsZXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuY2FtZXJhc0ZvdW5kID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuY2FtZXJhc05vdEZvdW5kID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMucGVybWlzc2lvblJlc3BvbnNlID0gbmV3IEV2ZW50RW1pdHRlcih0cnVlKTtcbiAgICB0aGlzLmhhc0RldmljZXMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5kZXZpY2VDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICB0aGlzLl9kZXZpY2UgPSBudWxsO1xuICAgIHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMuX2hpbnRzID0gbmV3IE1hcDxEZWNvZGVIaW50VHlwZSwgYW55PigpO1xuICAgIHRoaXMuYXV0b2ZvY3VzRW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5hdXRvc3RhcnQgPSB0cnVlO1xuICAgIHRoaXMuZm9ybWF0cyA9IFtCYXJjb2RlRm9ybWF0LlFSX0NPREVdO1xuXG4gICAgLy8gY29tcHV0ZWQgZGF0YVxuICAgIHRoaXMuaGFzTmF2aWdhdG9yID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgdGhpcy5pc01lZGlhRGV2aWNlc1N1cG9ydGVkID0gdGhpcy5oYXNOYXZpZ2F0b3IgJiYgISFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW5kIHJlZ2lzdGVycyBhbGwgY2FtbWVyYXMuXG4gICAqL1xuICBhc3luYyBhc2tGb3JQZXJtaXNzaW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXG4gICAgaWYgKCF0aGlzLmhhc05hdmlnYXRvcikge1xuICAgICAgY29uc29sZS5lcnJvcignQHp4aW5nL25neC1zY2FubmVyJywgJ0NhblxcJ3QgYXNrIHBlcm1pc3Npb24sIG5hdmlnYXRvciBpcyBub3QgcHJlc2VudC4nKTtcbiAgICAgIHRoaXMuc2V0UGVybWlzc2lvbihudWxsKTtcbiAgICAgIHJldHVybiB0aGlzLmhhc1Blcm1pc3Npb247XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzTWVkaWFEZXZpY2VzU3Vwb3J0ZWQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0B6eGluZy9uZ3gtc2Nhbm5lcicsICdDYW5cXCd0IGdldCB1c2VyIG1lZGlhLCB0aGlzIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICB0aGlzLnNldFBlcm1pc3Npb24obnVsbCk7XG4gICAgICByZXR1cm4gdGhpcy5oYXNQZXJtaXNzaW9uO1xuICAgIH1cblxuICAgIGxldCBzdHJlYW06IE1lZGlhU3RyZWFtO1xuICAgIGxldCBwZXJtaXNzaW9uOiBib29sZWFuO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFdpbGwgdHJ5IHRvIGFzayBmb3IgcGVybWlzc2lvblxuICAgICAgc3RyZWFtID0gYXdhaXQgdGhpcy5nZXRBbnlWaWRlb0RldmljZSgpO1xuICAgICAgcGVybWlzc2lvbiA9ICEhc3RyZWFtO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlUGVybWlzc2lvbkV4Y2VwdGlvbihlcnIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLnRlcm1pbmF0ZVN0cmVhbShzdHJlYW0pO1xuICAgIH1cblxuICAgIHRoaXMuc2V0UGVybWlzc2lvbihwZXJtaXNzaW9uKTtcblxuICAgIC8vIFJldHVybnMgdGhlIHBlcm1pc3Npb25cbiAgICByZXR1cm4gcGVybWlzc2lvbjtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgZ2V0QW55VmlkZW9EZXZpY2UoKTogUHJvbWlzZTxNZWRpYVN0cmVhbT4ge1xuICAgIHJldHVybiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7IHZpZGVvOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlcm1pbmF0ZXMgYSBzdHJlYW0gYW5kIGl0J3MgdHJhY2tzLlxuICAgKi9cbiAgcHJpdmF0ZSB0ZXJtaW5hdGVTdHJlYW0oc3RyZWFtOiBNZWRpYVN0cmVhbSkge1xuXG4gICAgaWYgKHN0cmVhbSkge1xuICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB0LnN0b3AoKSk7XG4gICAgfVxuXG4gICAgc3RyZWFtID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBjb21wb25lbnQgd2l0aG91dCBzdGFydGluZyB0aGUgc2Nhbm5lci5cbiAgICovXG4gIHByaXZhdGUgaW5pdEF1dG9zdGFydE9mZigpOiB2b2lkIHtcblxuICAgIC8vIGRvIG5vdCBhc2sgZm9yIHBlcm1pc3Npb24gd2hlbiBhdXRvc3RhcnQgaXMgb2ZmXG4gICAgdGhpcy5pc0F1dG9zdGFydGluZyA9IG51bGw7XG5cbiAgICAvLyBqdXN0IHVwZGF0ZSBkZXZpY2VzIGluZm9ybWF0aW9uXG4gICAgdGhpcy51cGRhdGVWaWRlb0lucHV0RGV2aWNlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBjb21wb25lbnQgYW5kIHN0YXJ0cyB0aGUgc2Nhbm5lci5cbiAgICogUGVybWlzc2lvbnMgYXJlIGFza2VkIHRvIGFjY29tcGxpc2ggdGhhdC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaW5pdEF1dG9zdGFydE9uKCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgdGhpcy5pc0F1dG9zdGFydGluZyA9IHRydWU7XG5cbiAgICBsZXQgaGFzUGVybWlzc2lvbjogYm9vbGVhbjtcblxuICAgIHRyeSB7XG4gICAgICAvLyBBc2tzIGZvciBwZXJtaXNzaW9uIGJlZm9yZSBlbnVtZXJhdGluZyBkZXZpY2VzIHNvIGl0IGNhbiBnZXQgYWxsIHRoZSBkZXZpY2UncyBpbmZvXG4gICAgICBoYXNQZXJtaXNzaW9uID0gYXdhaXQgdGhpcy5hc2tGb3JQZXJtaXNzaW9uKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcignRXhjZXB0aW9uIG9jY3VycmVkIHdoaWxlIGFza2luZyBmb3IgcGVybWlzc2lvbjonLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmcm9tIHRoaXMgcG9pbnQsIHRoaW5ncyBnb25uYSBuZWVkIHBlcm1pc3Npb25zXG4gICAgaWYgKGhhc1Blcm1pc3Npb24pIHtcbiAgICAgIGNvbnN0IGRldmljZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZVZpZGVvSW5wdXREZXZpY2VzKCk7XG4gICAgICB0aGlzLmF1dG9zdGFydFNjYW5uZXIoWy4uLmRldmljZXNdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBkZXZpY2UgaXMgdGhlIGN1cnJlbnQgZGVmaW5lZCBvbmUuXG4gICAqL1xuICBpc0N1cnJlbnREZXZpY2UoZGV2aWNlOiBNZWRpYURldmljZUluZm8pIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2UgJiYgZGV2aWNlICYmIGRldmljZS5kZXZpY2VJZCA9PT0gdGhpcy5kZXZpY2UuZGV2aWNlSWQ7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZWQgYWZ0ZXIgdGhlIHZpZXcgaW5pdGlhbGl6YXRpb24uXG4gICAqL1xuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG5cbiAgICAvLyBtYWtlcyB0b3JjaCBhdmFpbGFiaWxpdHkgaW5mb3JtYXRpb24gYXZhaWxhYmxlIHRvIHVzZXJcbiAgICB0aGlzLmdldENvZGVSZWFkZXIoKS5pc1RvcmNoQXZhaWxhYmxlLnN1YnNjcmliZSh4ID0+IHRoaXMudG9yY2hDb21wYXRpYmxlLmVtaXQoeCkpO1xuXG4gICAgaWYgKCF0aGlzLmF1dG9zdGFydCkge1xuICAgICAgY29uc29sZS53YXJuKCdOZXcgZmVhdHVyZSBcXCdhdXRvc3RhcnRcXCcgZGlzYWJsZWQsIGJlIGNhcmVmdWwuIFBlcm1pc3Npb25zIGFuZCBkZXZpY2VzIHJlY292ZXJ5IGhhcyB0byBiZSBydW4gbWFudWFsbHkuJyk7XG5cbiAgICAgIC8vIGRvZXMgdGhlIG5lY2Vzc2FyeSBjb25maWd1cmF0aW9uIHdpdGhvdXQgYXV0b3N0YXJ0aW5nXG4gICAgICB0aGlzLmluaXRBdXRvc3RhcnRPZmYoKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGNvbmZpZ3VyYXRlcyB0aGUgY29tcG9uZW50IGFuZCBzdGFydHMgdGhlIHNjYW5uZXJcbiAgICB0aGlzLmluaXRBdXRvc3RhcnRPbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHNvbWUgYWN0aW9ucyBiZWZvcmUgZGVzdHJveSB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIG9sZCBgY29kZVJlYWRlcmAgYW5kIHN0YXJ0cyBzY2FubmluZyBpbiBhIG5ldyBvbmUuXG4gICAqL1xuICByZXN0YXJ0KCk6IHZvaWQge1xuXG4gICAgY29uc3QgcHJldkRldmljZSA9IHRoaXMuX3Jlc2V0KCk7XG5cbiAgICBpZiAoIXByZXZEZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBAbm90ZSBhcGVuYXMgbmVjZXNzYXJpbyBwb3IgZW5xdWFudG8gY2F1c2EgZGEgVG9yY2hcbiAgICB0aGlzLl9jb2RlUmVhZGVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGV2aWNlID0gcHJldkRldmljZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb3ZlcnMgYW5kIHVwZGF0ZXMga25vd24gdmlkZW8gaW5wdXQgZGV2aWNlcy5cbiAgICovXG4gIGFzeW5jIHVwZGF0ZVZpZGVvSW5wdXREZXZpY2VzKCk6IFByb21pc2U8TWVkaWFEZXZpY2VJbmZvW10+IHtcblxuICAgIC8vIHBlcm1pc3Npb25zIGFyZW4ndCBuZWVkZWQgdG8gZ2V0IGRldmljZXMsIGJ1dCB0byBhY2Nlc3MgdGhlbSBhbmQgdGhlaXIgaW5mb1xuICAgIGNvbnN0IGRldmljZXMgPSBhd2FpdCB0aGlzLmdldENvZGVSZWFkZXIoKS5saXN0VmlkZW9JbnB1dERldmljZXMoKSB8fCBbXTtcbiAgICBjb25zdCBoYXNEZXZpY2VzID0gZGV2aWNlcyAmJiBkZXZpY2VzLmxlbmd0aCA+IDA7XG5cbiAgICAvLyBzdG9yZXMgZGlzY292ZXJlZCBkZXZpY2VzIGFuZCB1cGRhdGVzIGluZm9ybWF0aW9uXG4gICAgdGhpcy5oYXNEZXZpY2VzLm5leHQoaGFzRGV2aWNlcyk7XG4gICAgdGhpcy5jYW1lcmFzRm91bmQubmV4dChbLi4uZGV2aWNlc10pO1xuXG4gICAgaWYgKCFoYXNEZXZpY2VzKSB7XG4gICAgICB0aGlzLmNhbWVyYXNOb3RGb3VuZC5uZXh0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRldmljZXM7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBzY2FubmVyIHdpdGggdGhlIGJhY2sgY2FtZXJhIG90aGVyd2lzZSB0YWtlIHRoZSBsYXN0XG4gICAqIGF2YWlsYWJsZSBkZXZpY2UuXG4gICAqL1xuICBwcml2YXRlIGF1dG9zdGFydFNjYW5uZXIoZGV2aWNlczogTWVkaWFEZXZpY2VJbmZvW10pIHtcblxuICAgIGNvbnN0IG1hdGNoZXIgPSAoeyBsYWJlbCB9KSA9PiAvYmFja3x0csOhc3xyZWFyfHRyYXNlaXJhfGVudmlyb25tZW50fGFtYmllbnRlL2dpLnRlc3QobGFiZWwpO1xuXG4gICAgLy8gc2VsZWN0IHRoZSByZWFyIGNhbWVyYSBieSBkZWZhdWx0LCBvdGhlcndpc2UgdGFrZSB0aGUgbGFzdCBjYW1lcmEuXG4gICAgY29uc3QgZGV2aWNlID0gZGV2aWNlcy5maW5kKG1hdGNoZXIpIHx8IGRldmljZXMucG9wKCk7XG5cbiAgICBpZiAoIWRldmljZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbXBvc3NpYmxlIHRvIGF1dG9zdGFydCwgbm8gaW5wdXQgZGV2aWNlcyBhdmFpbGFibGUuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgLy8gQG5vdGUgd2hlbiBsaXN0ZW5pbmcgdG8gdGhpcyBjaGFuZ2UsIGNhbGxiYWNrIGNvZGUgd2lsbCBzb21ldGltZXMgcnVuIGJlZm9yZSB0aGUgcHJldmlvdXMgbGluZS5cbiAgICB0aGlzLmRldmljZUNoYW5nZS5lbWl0KGRldmljZSk7XG5cbiAgICB0aGlzLmlzQXV0b3N0YXJ0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5hdXRvc3RhcnRlZC5uZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyB0aGUgc2NhbiBzdWNjZXNzIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gcmVzdWx0IHRoZSBzY2FuIHJlc3VsdC5cbiAgICovXG4gIHByaXZhdGUgZGlzcGF0Y2hTY2FuU3VjY2VzcyhyZXN1bHQ6IFJlc3VsdCk6IHZvaWQge1xuICAgIHRoaXMuc2NhblN1Y2Nlc3MubmV4dChyZXN1bHQuZ2V0VGV4dCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIHRoZSBzY2FuIGZhaWx1cmUgZXZlbnQuXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoU2NhbkZhaWx1cmUocmVhc29uPzogRXhjZXB0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5zY2FuRmFpbHVyZS5uZXh0KHJlYXNvbik7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyB0aGUgc2NhbiBlcnJvciBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIGVycm9yIHRoZSBlcnJvciB0aGluZy5cbiAgICovXG4gIHByaXZhdGUgZGlzcGF0Y2hTY2FuRXJyb3IoZXJyb3I6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuc2NhbkVycm9yLm5leHQoZXJyb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgdGhlIHNjYW4gZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSByZXN1bHQgdGhlIHNjYW4gcmVzdWx0LlxuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaFNjYW5Db21wbGV0ZShyZXN1bHQ6IFJlc3VsdCk6IHZvaWQge1xuICAgIHRoaXMuc2NhbkNvbXBsZXRlLm5leHQocmVzdWx0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBmaWx0ZXJlZCBwZXJtaXNzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVQZXJtaXNzaW9uRXhjZXB0aW9uKGVycjogRE9NRXhjZXB0aW9uKTogYm9vbGVhbiB7XG5cbiAgICAvLyBmYWlsZWQgdG8gZ3JhbnQgcGVybWlzc2lvbiB0byB2aWRlbyBpbnB1dFxuICAgIGNvbnNvbGUuZXJyb3IoJ0B6eGluZy9uZ3gtc2Nhbm5lcicsICdFcnJvciB3aGVuIGFza2luZyBmb3IgcGVybWlzc2lvbi4nLCBlcnIpO1xuXG4gICAgbGV0IHBlcm1pc3Npb246IGJvb2xlYW47XG5cbiAgICBzd2l0Y2ggKGVyci5uYW1lKSB7XG5cbiAgICAgIC8vIHVzdWFsbHkgY2F1c2VkIGJ5IG5vdCBzZWN1cmUgb3JpZ2luc1xuICAgICAgY2FzZSAnTm90U3VwcG9ydGVkRXJyb3InOlxuICAgICAgICBjb25zb2xlLndhcm4oJ0B6eGluZy9uZ3gtc2Nhbm5lcicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgLy8gY291bGQgbm90IGNsYWltXG4gICAgICAgIHBlcm1pc3Npb24gPSBudWxsO1xuICAgICAgICAvLyBjYW4ndCBjaGVjayBkZXZpY2VzXG4gICAgICAgIHRoaXMuaGFzRGV2aWNlcy5uZXh0KG51bGwpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gdXNlciBkZW5pZWQgcGVybWlzc2lvblxuICAgICAgY2FzZSAnTm90QWxsb3dlZEVycm9yJzpcbiAgICAgICAgY29uc29sZS53YXJuKCdAenhpbmcvbmd4LXNjYW5uZXInLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIC8vIGNsYWltZWQgYW5kIGRlbmllZCBwZXJtaXNzaW9uXG4gICAgICAgIHBlcm1pc3Npb24gPSBmYWxzZTtcbiAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IGlucHV0IGRldmljZXMgZXhpc3RzXG4gICAgICAgIHRoaXMuaGFzRGV2aWNlcy5uZXh0KHRydWUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gdGhlIGRldmljZSBoYXMgbm8gYXR0YWNoZWQgaW5wdXQgZGV2aWNlc1xuICAgICAgY2FzZSAnTm90Rm91bmRFcnJvcic6XG4gICAgICAgIGNvbnNvbGUud2FybignQHp4aW5nL25neC1zY2FubmVyJywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAvLyBubyBwZXJtaXNzaW9ucyBjbGFpbWVkXG4gICAgICAgIHBlcm1pc3Npb24gPSBudWxsO1xuICAgICAgICAvLyBiZWNhdXNlIHRoZXJlIHdhcyBubyBkZXZpY2VzXG4gICAgICAgIHRoaXMuaGFzRGV2aWNlcy5uZXh0KGZhbHNlKTtcbiAgICAgICAgLy8gdGVsbHMgdGhlIGxpc3RlbmVyIGFib3V0IHRoZSBlcnJvclxuICAgICAgICB0aGlzLmNhbWVyYXNOb3RGb3VuZC5uZXh0KGVycik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdOb3RSZWFkYWJsZUVycm9yJzpcbiAgICAgICAgY29uc29sZS53YXJuKCdAenhpbmcvbmd4LXNjYW5uZXInLCAnQ291bGRuXFwndCByZWFkIHRoZSBkZXZpY2UocylcXCdzIHN0cmVhbSwgaXRcXCdzIHByb2JhYmx5IGluIHVzZSBieSBhbm90aGVyIGFwcC4nKTtcbiAgICAgICAgLy8gbm8gcGVybWlzc2lvbnMgY2xhaW1lZFxuICAgICAgICBwZXJtaXNzaW9uID0gbnVsbDtcbiAgICAgICAgLy8gdGhlcmUgYXJlIGRldmljZXMsIHdoaWNoIEkgY291bGRuJ3QgdXNlXG4gICAgICAgIHRoaXMuaGFzRGV2aWNlcy5uZXh0KGZhbHNlKTtcbiAgICAgICAgLy8gdGVsbHMgdGhlIGxpc3RlbmVyIGFib3V0IHRoZSBlcnJvclxuICAgICAgICB0aGlzLmNhbWVyYXNOb3RGb3VuZC5uZXh0KGVycik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLndhcm4oJ0B6eGluZy9uZ3gtc2Nhbm5lcicsICdJIHdhcyBub3QgYWJsZSB0byBkZWZpbmUgaWYgSSBoYXZlIHBlcm1pc3Npb25zIGZvciBjYW1lcmEgb3Igbm90LicsIGVycik7XG4gICAgICAgIC8vIHVua25vd25cbiAgICAgICAgcGVybWlzc2lvbiA9IG51bGw7XG4gICAgICAgIC8vIHRoaXMuaGFzRGV2aWNlcy5uZXh0KHVuZGVmaW5lZDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICB9XG5cbiAgICB0aGlzLnNldFBlcm1pc3Npb24ocGVybWlzc2lvbik7XG5cbiAgICAvLyB0ZWxscyB0aGUgbGlzdGVuZXIgYWJvdXQgdGhlIGVycm9yXG4gICAgdGhpcy5wZXJtaXNzaW9uUmVzcG9uc2UuZXJyb3IoZXJyKTtcblxuICAgIHJldHVybiBwZXJtaXNzaW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2YWxpZCBCYXJjb2RlRm9ybWF0IG9yIGZhaWxzLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRCYXJjb2RlRm9ybWF0T3JGYWlsKGZvcm1hdDogc3RyaW5nIHwgQmFyY29kZUZvcm1hdCk6IEJhcmNvZGVGb3JtYXQge1xuICAgIHJldHVybiB0eXBlb2YgZm9ybWF0ID09PSAnc3RyaW5nJ1xuICAgICAgPyBCYXJjb2RlRm9ybWF0W2Zvcm1hdC50cmltKCkudG9VcHBlckNhc2UoKV1cbiAgICAgIDogZm9ybWF0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldG9ybmEgdW0gY29kZSByZWFkZXIsIGNyaWEgdW0gc2UgbmVuaHVtZSBleGlzdGUuXG4gICAqL1xuICBwcml2YXRlIGdldENvZGVSZWFkZXIoKTogQnJvd3Nlck11bHRpRm9ybWF0Q29udGludW91c1JlYWRlciB7XG5cbiAgICBpZiAoIXRoaXMuX2NvZGVSZWFkZXIpIHtcbiAgICAgIHRoaXMuX2NvZGVSZWFkZXIgPSBuZXcgQnJvd3Nlck11bHRpRm9ybWF0Q29udGludW91c1JlYWRlcih0aGlzLmhpbnRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29kZVJlYWRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIGNvbnRpbnVvdXMgc2Nhbm5pbmcgZm9yIHRoZSBnaXZlbiBkZXZpY2UuXG4gICAqXG4gICAqIEBwYXJhbSBkZXZpY2VJZCBUaGUgZGV2aWNlSWQgZnJvbSB0aGUgZGV2aWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBzY2FuRnJvbURldmljZShkZXZpY2VJZDogc3RyaW5nKTogdm9pZCB7XG5cbiAgICBjb25zdCB2aWRlb0VsZW1lbnQgPSB0aGlzLnByZXZpZXdFbGVtUmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICBjb25zdCBjb2RlUmVhZGVyID0gdGhpcy5nZXRDb2RlUmVhZGVyKCk7XG5cbiAgICBjb25zdCBkZWNvZGluZ1N0cmVhbSA9IGNvZGVSZWFkZXIuY29udGludW91c0RlY29kZUZyb21JbnB1dFZpZGVvRGV2aWNlKGRldmljZUlkLCB2aWRlb0VsZW1lbnQpO1xuXG4gICAgaWYgKCFkZWNvZGluZ1N0cmVhbSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmRlZmluZWQgZGVjb2Rpbmcgc3RyZWFtLCBhYm9ydGluZy4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBuZXh0ID0gKHg6IFJlc3VsdEFuZEVycm9yKSA9PiB0aGlzLl9vbkRlY29kZVJlc3VsdCh4LnJlc3VsdCwgeC5lcnJvcik7XG4gICAgY29uc3QgZXJyb3IgPSAoZXJyOiBhbnkpID0+IHRoaXMuX29uRGVjb2RlRXJyb3IoZXJyKTtcbiAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHsgdGhpcy5yZXNldCgpOyBjb25zb2xlLmxvZygnY29tcGxldGVkJyk7IH07XG5cbiAgICBkZWNvZGluZ1N0cmVhbS5zdWJzY3JpYmUobmV4dCwgZXJyb3IsIGNvbXBsZXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGRlY29kZSBlcnJvcnMuXG4gICAqL1xuICBwcml2YXRlIF9vbkRlY29kZUVycm9yKGVycjogYW55KSB7XG4gICAgdGhpcy5kaXNwYXRjaFNjYW5FcnJvcihlcnIpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGRlY29kZSByZXN1bHRzLlxuICAgKi9cbiAgcHJpdmF0ZSBfb25EZWNvZGVSZXN1bHQocmVzdWx0OiBSZXN1bHQsIGVycm9yOiBFeGNlcHRpb24pOiB2b2lkIHtcblxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hTY2FuU3VjY2VzcyhyZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpc3BhdGNoU2NhbkZhaWx1cmUoZXJyb3IpO1xuICAgIH1cblxuICAgIHRoaXMuZGlzcGF0Y2hTY2FuQ29tcGxldGUocmVzdWx0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgY29kZSByZWFkZXIgYW5kIHJldHVybnMgdGhlIHByZXZpb3VzIHNlbGVjdGVkIGRldmljZS5cbiAgICovXG4gIHByaXZhdGUgX3Jlc2V0KCk6IE1lZGlhRGV2aWNlSW5mbyB7XG5cbiAgICBpZiAoIXRoaXMuX2NvZGVSZWFkZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkZXZpY2UgPSB0aGlzLmRldmljZTtcbiAgICAvLyBkbyBub3Qgc2V0IHRoaXMuZGV2aWNlIGluc2lkZSB0aGlzIG1ldGhvZCwgaXQgd291bGQgY3JlYXRlIGEgcmVjdXJzaXZlIGxvb3BcbiAgICB0aGlzLl9kZXZpY2UgPSBudWxsO1xuXG4gICAgdGhpcy5fY29kZVJlYWRlci5yZXNldCgpO1xuXG4gICAgcmV0dXJuIGRldmljZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIHNjYW5uZXIgYW5kIGVtaXRzIGRldmljZSBjaGFuZ2UuXG4gICAqL1xuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVzZXQoKTtcbiAgICB0aGlzLmRldmljZUNoYW5nZS5lbWl0KG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBlcm1pc3Npb24gdmFsdWUgYW5kIGVtbWl0cyB0aGUgZXZlbnQuXG4gICAqL1xuICBwcml2YXRlIHNldFBlcm1pc3Npb24oaGFzUGVybWlzc2lvbjogYm9vbGVhbiB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLmhhc1Blcm1pc3Npb24gPSBoYXNQZXJtaXNzaW9uO1xuICAgIHRoaXMucGVybWlzc2lvblJlc3BvbnNlLm5leHQoaGFzUGVybWlzc2lvbik7XG4gIH1cblxufVxuIl19