/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
/// <reference path="./image-capture.d.ts" />
/// <reference path="./image-capture.d.ts" />
import { BrowserMultiFormatReader, ChecksumException, FormatException, NotFoundException } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
/**
 * Based on zxing-typescript BrowserCodeReader
 */
var /**
 * Based on zxing-typescript BrowserCodeReader
 */
BrowserMultiFormatContinuousReader = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserMultiFormatContinuousReader, _super);
    function BrowserMultiFormatContinuousReader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Says if there's a torch available for the current device.
         */
        _this._isTorchAvailable = new BehaviorSubject(undefined);
        return _this;
    }
    Object.defineProperty(BrowserMultiFormatContinuousReader.prototype, "isTorchAvailable", {
        /**
         * Exposes _tochAvailable .
         */
        get: /**
         * Exposes _tochAvailable .
         * @return {?}
         */
        function () {
            return this._isTorchAvailable.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts the decoding from the current or a new video element.
     *
     * @param callbackFn The callback to be executed after every scan attempt
     * @param deviceId The device's to be used Id
     * @param videoSource A new video element
     */
    /**
     * Starts the decoding from the current or a new video element.
     *
     * @param {?=} deviceId The device's to be used Id
     * @param {?=} videoSource A new video element
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.continuousDecodeFromInputVideoDevice = /**
     * Starts the decoding from the current or a new video element.
     *
     * @param {?=} deviceId The device's to be used Id
     * @param {?=} videoSource A new video element
     * @return {?}
     */
    function (deviceId, videoSource) {
        var _this = this;
        this.reset();
        // Keeps the deviceId between scanner resets.
        if (typeof deviceId !== 'undefined') {
            this.deviceId = deviceId;
        }
        if (typeof navigator === 'undefined') {
            return;
        }
        /** @type {?} */
        var scan$ = new BehaviorSubject({});
        try {
            // this.decodeFromInputVideoDeviceContinuously(deviceId, videoSource, (result, error) => scan$.next({ result, error }));
            this.getStreamForDevice({ deviceId: deviceId })
                .then((/**
             * @param {?} stream
             * @return {?}
             */
            function (stream) { return _this.attachStreamToVideoAndCheckTorch(stream, videoSource); }))
                .then((/**
             * @param {?} videoElement
             * @return {?}
             */
            function (videoElement) { return _this.decodeOnSubject(scan$, videoElement, _this.timeBetweenScansMillis); }));
        }
        catch (e) {
            scan$.error(e);
        }
        this._setScanStream(scan$);
        // @todo Find a way to emit a complete event on the scan stream once it's finished.
        return scan$.asObservable();
    };
    /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     */
    /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     * @param {?} __0
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.getStreamForDevice = /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     * @param {?} __0
     * @return {?}
     */
    function (_a) {
        var deviceId = _a.deviceId;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var constraints, stream;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        constraints = this.getUserMediaConstraints(deviceId);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                    case 1:
                        stream = _b.sent();
                        return [2 /*return*/, stream];
                }
            });
        });
    };
    /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     */
    /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     * @param {?} deviceId
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.getUserMediaConstraints = /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     * @param {?} deviceId
     * @return {?}
     */
    function (deviceId) {
        /** @type {?} */
        var video = typeof deviceId === 'undefined'
            ? { facingMode: { exact: 'environment' } }
            : { deviceId: { exact: deviceId } };
        /** @type {?} */
        var constraints = { video: video };
        return constraints;
    };
    /**
     * Enables and disables the device torch.
     */
    /**
     * Enables and disables the device torch.
     * @param {?} on
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.setTorch = /**
     * Enables and disables the device torch.
     * @param {?} on
     * @return {?}
     */
    function (on) {
        if (!this._isTorchAvailable.value) {
            // compatibility not checked yet
            return;
        }
        /** @type {?} */
        var tracks = this.getVideoTracks(this.stream);
        if (on) {
            this.applyTorchOnTracks(tracks, true);
        }
        else {
            this.applyTorchOnTracks(tracks, false);
            // @todo check possibility to disable torch without restart
            this.restart();
        }
    };
    /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     */
    /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     * @private
     * @param {?} stream
     * @param {?} videoSource
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.attachStreamToVideoAndCheckTorch = /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     * @private
     * @param {?} stream
     * @param {?} videoSource
     * @return {?}
     */
    function (stream, videoSource) {
        this.updateTorchCompatibility(stream);
        return this.attachStreamToVideo(stream, videoSource);
    };
    /**
     * Checks if the stream supports torch control.
     *
     * @param stream The media stream used to check.
     */
    /**
     * Checks if the stream supports torch control.
     *
     * @private
     * @param {?} stream The media stream used to check.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.updateTorchCompatibility = /**
     * Checks if the stream supports torch control.
     *
     * @private
     * @param {?} stream The media stream used to check.
     * @return {?}
     */
    function (stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1, _a, tracks, tracks_1, tracks_1_1, track, e_1_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tracks = this.getVideoTracks(stream);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        tracks_1 = tslib_1.__values(tracks), tracks_1_1 = tracks_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!tracks_1_1.done) return [3 /*break*/, 5];
                        track = tracks_1_1.value;
                        return [4 /*yield*/, this.isTorchCompatible(track)];
                    case 3:
                        if (_b.sent()) {
                            this._isTorchAvailable.next(true);
                            return [3 /*break*/, 5];
                        }
                        _b.label = 4;
                    case 4:
                        tracks_1_1 = tracks_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (tracks_1_1 && !tracks_1_1.done && (_a = tracks_1.return)) _a.call(tracks_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param stream The video stream where the tracks gonna be extracted from.
     */
    /**
     *
     * @private
     * @param {?} stream The video stream where the tracks gonna be extracted from.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.getVideoTracks = /**
     *
     * @private
     * @param {?} stream The video stream where the tracks gonna be extracted from.
     * @return {?}
     */
    function (stream) {
        /** @type {?} */
        var tracks = [];
        try {
            tracks = stream.getVideoTracks();
        }
        finally {
            return tracks || [];
        }
    };
    /**
     *
     * @param track The media stream track that will be checked for compatibility.
     */
    /**
     *
     * @private
     * @param {?} track The media stream track that will be checked for compatibility.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.isTorchCompatible = /**
     *
     * @private
     * @param {?} track The media stream track that will be checked for compatibility.
     * @return {?}
     */
    function (track) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var compatible, imageCapture, capabilities;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        compatible = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        imageCapture = new ImageCapture(track);
                        return [4 /*yield*/, imageCapture.getPhotoCapabilities()];
                    case 2:
                        capabilities = _a.sent();
                        compatible = !!capabilities['torch'] || ('fillLightMode' in capabilities && capabilities.fillLightMode.length !== 0);
                        return [3 /*break*/, 4];
                    case 3: return [2 /*return*/, compatible];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply the torch setting in all received tracks.
     */
    /**
     * Apply the torch setting in all received tracks.
     * @private
     * @param {?} tracks
     * @param {?} state
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.applyTorchOnTracks = /**
     * Apply the torch setting in all received tracks.
     * @private
     * @param {?} tracks
     * @param {?} state
     * @return {?}
     */
    function (tracks, state) {
        tracks.forEach((/**
         * @param {?} track
         * @return {?}
         */
        function (track) { return track.applyConstraints({
            advanced: [(/** @type {?} */ ({ torch: state, fillLightMode: state ? 'torch' : 'none' }))]
        }); }));
    };
    /**
     * Correctly sets a new scanStream value.
     */
    /**
     * Correctly sets a new scanStream value.
     * @private
     * @param {?} scan$
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype._setScanStream = /**
     * Correctly sets a new scanStream value.
     * @private
     * @param {?} scan$
     * @return {?}
     */
    function (scan$) {
        // cleans old stream
        this._cleanScanStream();
        // sets new stream
        this.scanStream = scan$;
    };
    /**
     * Cleans any old scan stream value.
     */
    /**
     * Cleans any old scan stream value.
     * @private
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype._cleanScanStream = /**
     * Cleans any old scan stream value.
     * @private
     * @return {?}
     */
    function () {
        if (this.scanStream && !this.scanStream.isStopped) {
            this.scanStream.complete();
        }
        this.scanStream = null;
    };
    /**
     * Decodes values in a stream with delays between scans.
     *
     * @param scan$ The subject to receive the values.
     * @param videoElement The video element the decode will be applied.
     * @param delay The delay between decode results.
     */
    /**
     * Decodes values in a stream with delays between scans.
     *
     * @private
     * @param {?} scan$ The subject to receive the values.
     * @param {?} videoElement The video element the decode will be applied.
     * @param {?} delay The delay between decode results.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.decodeOnSubject = /**
     * Decodes values in a stream with delays between scans.
     *
     * @private
     * @param {?} scan$ The subject to receive the values.
     * @param {?} videoElement The video element the decode will be applied.
     * @param {?} delay The delay between decode results.
     * @return {?}
     */
    function (scan$, videoElement, delay) {
        var _this = this;
        // stops loop
        if (scan$.isStopped) {
            return;
        }
        /** @type {?} */
        var result;
        try {
            result = this.decode(videoElement);
            scan$.next({ result: result });
        }
        catch (error) {
            // stream cannot stop on fails.
            if (!error ||
                // scan Failure - found nothing, no error
                error instanceof NotFoundException ||
                // scan Error - found the QR but got error on decoding
                error instanceof ChecksumException ||
                error instanceof FormatException) {
                scan$.next({ error: error });
            }
            else {
                scan$.error(error);
            }
        }
        finally {
            /** @type {?} */
            var timeout = !result ? 0 : delay;
            setTimeout((/**
             * @return {?}
             */
            function () { return _this.decodeOnSubject(scan$, videoElement, delay); }), timeout);
        }
    };
    /**
     * Restarts the scanner.
     */
    /**
     * Restarts the scanner.
     * @private
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.restart = /**
     * Restarts the scanner.
     * @private
     * @return {?}
     */
    function () {
        // reset
        // start
        return this.continuousDecodeFromInputVideoDevice(this.deviceId, this.videoElement);
    };
    return BrowserMultiFormatContinuousReader;
}(BrowserMultiFormatReader));
/**
 * Based on zxing-typescript BrowserCodeReader
 */
export { BrowserMultiFormatContinuousReader };
if (false) {
    /**
     * Says if there's a torch available for the current device.
     * @type {?}
     * @private
     */
    BrowserMultiFormatContinuousReader.prototype._isTorchAvailable;
    /**
     * The device id of the current media device.
     * @type {?}
     * @private
     */
    BrowserMultiFormatContinuousReader.prototype.deviceId;
    /**
     * If there's some scan stream open, it shal be here.
     * @type {?}
     * @private
     */
    BrowserMultiFormatContinuousReader.prototype.scanStream;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBNkM7O0FBRTdDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQVUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6SCxPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDOzs7O0FBTW5EOzs7O0lBQXdELDhEQUF3QjtJQUFoRjtRQUFBLHFFQXVQQzs7OztRQTNPUyx1QkFBaUIsR0FBRyxJQUFJLGVBQWUsQ0FBVSxTQUFTLENBQUMsQ0FBQzs7SUEyT3RFLENBQUM7SUFsUEMsc0JBQVcsZ0VBQWdCO1FBSDNCOztXQUVHOzs7OztRQUNIO1lBQ0UsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0MsQ0FBQzs7O09BQUE7SUFpQkQ7Ozs7OztPQU1HOzs7Ozs7OztJQUNJLGlGQUFvQzs7Ozs7OztJQUEzQyxVQUNFLFFBQWlCLEVBQ2pCLFdBQThCO1FBRmhDLGlCQWdDQztRQTNCQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFYiw2Q0FBNkM7UUFDN0MsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7U0FDMUI7UUFFRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxPQUFPO1NBQ1I7O1lBRUssS0FBSyxHQUFHLElBQUksZUFBZSxDQUFpQixFQUFFLENBQUM7UUFFckQsSUFBSTtZQUNGLHdIQUF3SDtZQUN4SCxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxRQUFRLFVBQUEs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QUFDLEtBQUs7WUFDbkMsVUFBVTs7O1lBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBaEQsQ0FBZ0QsR0FBRSxPQUFPLENBQUMsQ0FBQztTQUM3RTtJQUNILENBQUM7SUFFRDs7T0FFRzs7Ozs7O0lBQ0ssb0RBQU87Ozs7O0lBQWY7UUFDRSxRQUFRO1FBQ1IsUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFSCx5Q0FBQztBQUFELENBQUMsQUF2UEQsQ0FBd0Qsd0JBQXdCLEdBdVAvRTs7Ozs7Ozs7Ozs7SUEzT0MsK0RBQW9FOzs7Ozs7SUFLcEUsc0RBQXlCOzs7Ozs7SUFLekIsd0RBQW9EIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vaW1hZ2UtY2FwdHVyZS5kLnRzXCIgLz5cblxuaW1wb3J0IHsgQnJvd3Nlck11bHRpRm9ybWF0UmVhZGVyLCBDaGVja3N1bUV4Y2VwdGlvbiwgRm9ybWF0RXhjZXB0aW9uLCBOb3RGb3VuZEV4Y2VwdGlvbiwgUmVzdWx0IH0gZnJvbSAnQHp4aW5nL2xpYnJhcnknO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBSZXN1bHRBbmRFcnJvciB9IGZyb20gJy4vUmVzdWx0QW5kRXJyb3InO1xuXG4vKipcbiAqIEJhc2VkIG9uIHp4aW5nLXR5cGVzY3JpcHQgQnJvd3NlckNvZGVSZWFkZXJcbiAqL1xuZXhwb3J0IGNsYXNzIEJyb3dzZXJNdWx0aUZvcm1hdENvbnRpbnVvdXNSZWFkZXIgZXh0ZW5kcyBCcm93c2VyTXVsdGlGb3JtYXRSZWFkZXIge1xuXG4gIC8qKlxuICAgKiBFeHBvc2VzIF90b2NoQXZhaWxhYmxlIC5cbiAgICovXG4gIHB1YmxpYyBnZXQgaXNUb3JjaEF2YWlsYWJsZSgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5faXNUb3JjaEF2YWlsYWJsZS5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXlzIGlmIHRoZXJlJ3MgYSB0b3JjaCBhdmFpbGFibGUgZm9yIHRoZSBjdXJyZW50IGRldmljZS5cbiAgICovXG4gIHByaXZhdGUgX2lzVG9yY2hBdmFpbGFibGUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KHVuZGVmaW5lZCk7XG5cbiAgLyoqXG4gICAqIFRoZSBkZXZpY2UgaWQgb2YgdGhlIGN1cnJlbnQgbWVkaWEgZGV2aWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBkZXZpY2VJZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJZiB0aGVyZSdzIHNvbWUgc2NhbiBzdHJlYW0gb3BlbiwgaXQgc2hhbCBiZSBoZXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBzY2FuU3RyZWFtOiBCZWhhdmlvclN1YmplY3Q8UmVzdWx0QW5kRXJyb3I+O1xuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIGRlY29kaW5nIGZyb20gdGhlIGN1cnJlbnQgb3IgYSBuZXcgdmlkZW8gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIGNhbGxiYWNrRm4gVGhlIGNhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIGV2ZXJ5IHNjYW4gYXR0ZW1wdFxuICAgKiBAcGFyYW0gZGV2aWNlSWQgVGhlIGRldmljZSdzIHRvIGJlIHVzZWQgSWRcbiAgICogQHBhcmFtIHZpZGVvU291cmNlIEEgbmV3IHZpZGVvIGVsZW1lbnRcbiAgICovXG4gIHB1YmxpYyBjb250aW51b3VzRGVjb2RlRnJvbUlucHV0VmlkZW9EZXZpY2UoXG4gICAgZGV2aWNlSWQ/OiBzdHJpbmcsXG4gICAgdmlkZW9Tb3VyY2U/OiBIVE1MVmlkZW9FbGVtZW50XG4gICk6IE9ic2VydmFibGU8UmVzdWx0QW5kRXJyb3I+IHtcblxuICAgIHRoaXMucmVzZXQoKTtcblxuICAgIC8vIEtlZXBzIHRoZSBkZXZpY2VJZCBiZXR3ZWVuIHNjYW5uZXIgcmVzZXRzLlxuICAgIGlmICh0eXBlb2YgZGV2aWNlSWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmRldmljZUlkID0gZGV2aWNlSWQ7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2NhbiQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFJlc3VsdEFuZEVycm9yPih7fSk7XG5cbiAgICB0cnkge1xuICAgICAgLy8gdGhpcy5kZWNvZGVGcm9tSW5wdXRWaWRlb0RldmljZUNvbnRpbnVvdXNseShkZXZpY2VJZCwgdmlkZW9Tb3VyY2UsIChyZXN1bHQsIGVycm9yKSA9PiBzY2FuJC5uZXh0KHsgcmVzdWx0LCBlcnJvciB9KSk7XG4gICAgICB0aGlzLmdldFN0cmVhbUZvckRldmljZSh7IGRldmljZUlkIH0pXG4gICAgICAgIC50aGVuKHN0cmVhbSA9PiB0aGlzLmF0dGFjaFN0cmVhbVRvVmlkZW9BbmRDaGVja1RvcmNoKHN0cmVhbSwgdmlkZW9Tb3VyY2UpKVxuICAgICAgICAudGhlbih2aWRlb0VsZW1lbnQgPT4gdGhpcy5kZWNvZGVPblN1YmplY3Qoc2NhbiQsIHZpZGVvRWxlbWVudCwgdGhpcy50aW1lQmV0d2VlblNjYW5zTWlsbGlzKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2NhbiQuZXJyb3IoZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2V0U2NhblN0cmVhbShzY2FuJCk7XG5cbiAgICAvLyBAdG9kbyBGaW5kIGEgd2F5IHRvIGVtaXQgYSBjb21wbGV0ZSBldmVudCBvbiB0aGUgc2NhbiBzdHJlYW0gb25jZSBpdCdzIGZpbmlzaGVkLlxuXG4gICAgcmV0dXJuIHNjYW4kLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHN0cmVhbSBmb3IgY2VydGFpbiBkZXZpY2UuXG4gICAqIEZhbGxzIGJhY2sgdG8gYW55IGF2YWlsYWJsZSBkZXZpY2UgaWYgbm8gYGRldmljZUlkYCBpcyBkZWZpbmVkLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldFN0cmVhbUZvckRldmljZSh7IGRldmljZUlkIH06IFBhcnRpYWw8TWVkaWFEZXZpY2VJbmZvPik6IFByb21pc2U8TWVkaWFTdHJlYW0+IHtcbiAgICBjb25zdCBjb25zdHJhaW50cyA9IHRoaXMuZ2V0VXNlck1lZGlhQ29uc3RyYWludHMoZGV2aWNlSWQpO1xuICAgIGNvbnN0IHN0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKTtcbiAgICByZXR1cm4gc3RyZWFtO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbWVkaWEgc3RlcmFtIGNvbnN0cmFpbnRzIGZvciBjZXJ0YWluIGBkZXZpY2VJZGAuXG4gICAqIEZhbGxzIGJhY2sgdG8gYW55IGVudmlyb25tZW50IGF2YWlsYWJsZSBkZXZpY2UgaWYgbm8gYGRldmljZUlkYCBpcyBkZWZpbmVkLlxuICAgKi9cbiAgcHVibGljIGdldFVzZXJNZWRpYUNvbnN0cmFpbnRzKGRldmljZUlkOiBzdHJpbmcpOiBNZWRpYVN0cmVhbUNvbnN0cmFpbnRzIHtcblxuICAgIGNvbnN0IHZpZGVvID0gdHlwZW9mIGRldmljZUlkID09PSAndW5kZWZpbmVkJ1xuICAgICAgPyB7IGZhY2luZ01vZGU6IHsgZXhhY3Q6ICdlbnZpcm9ubWVudCcgfSB9XG4gICAgICA6IHsgZGV2aWNlSWQ6IHsgZXhhY3Q6IGRldmljZUlkIH0gfTtcblxuICAgIGNvbnN0IGNvbnN0cmFpbnRzOiBNZWRpYVN0cmVhbUNvbnN0cmFpbnRzID0geyB2aWRlbyB9O1xuXG4gICAgcmV0dXJuIGNvbnN0cmFpbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZXMgYW5kIGRpc2FibGVzIHRoZSBkZXZpY2UgdG9yY2guXG4gICAqL1xuICBwdWJsaWMgc2V0VG9yY2gob246IGJvb2xlYW4pOiB2b2lkIHtcblxuICAgIGlmICghdGhpcy5faXNUb3JjaEF2YWlsYWJsZS52YWx1ZSkge1xuICAgICAgLy8gY29tcGF0aWJpbGl0eSBub3QgY2hlY2tlZCB5ZXRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB0cmFja3MgPSB0aGlzLmdldFZpZGVvVHJhY2tzKHRoaXMuc3RyZWFtKTtcblxuICAgIGlmIChvbikge1xuICAgICAgdGhpcy5hcHBseVRvcmNoT25UcmFja3ModHJhY2tzLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcHBseVRvcmNoT25UcmFja3ModHJhY2tzLCBmYWxzZSk7XG4gICAgICAvLyBAdG9kbyBjaGVjayBwb3NzaWJpbGl0eSB0byBkaXNhYmxlIHRvcmNoIHdpdGhvdXQgcmVzdGFydFxuICAgICAgdGhpcy5yZXN0YXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgdG9yY2ggY29tcGF0aWJpbGl0eSBzdGF0ZSBhbmQgYXR0YWNocyB0aGUgc3RyZWFtIHRvIHRoZSBwcmV2aWV3IGVsZW1lbnQuXG4gICAqL1xuICBwcml2YXRlIGF0dGFjaFN0cmVhbVRvVmlkZW9BbmRDaGVja1RvcmNoKHN0cmVhbTogTWVkaWFTdHJlYW0sIHZpZGVvU291cmNlOiBIVE1MVmlkZW9FbGVtZW50KTogUHJvbWlzZTxIVE1MVmlkZW9FbGVtZW50PiB7XG4gICAgdGhpcy51cGRhdGVUb3JjaENvbXBhdGliaWxpdHkoc3RyZWFtKTtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2hTdHJlYW1Ub1ZpZGVvKHN0cmVhbSwgdmlkZW9Tb3VyY2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc3RyZWFtIHN1cHBvcnRzIHRvcmNoIGNvbnRyb2wuXG4gICAqXG4gICAqIEBwYXJhbSBzdHJlYW0gVGhlIG1lZGlhIHN0cmVhbSB1c2VkIHRvIGNoZWNrLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB1cGRhdGVUb3JjaENvbXBhdGliaWxpdHkoc3RyZWFtOiBNZWRpYVN0cmVhbSk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgY29uc3QgdHJhY2tzID0gdGhpcy5nZXRWaWRlb1RyYWNrcyhzdHJlYW0pO1xuXG4gICAgZm9yIChjb25zdCB0cmFjayBvZiB0cmFja3MpIHtcbiAgICAgIGlmIChhd2FpdCB0aGlzLmlzVG9yY2hDb21wYXRpYmxlKHRyYWNrKSkge1xuICAgICAgICB0aGlzLl9pc1RvcmNoQXZhaWxhYmxlLm5leHQodHJ1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gc3RyZWFtIFRoZSB2aWRlbyBzdHJlYW0gd2hlcmUgdGhlIHRyYWNrcyBnb25uYSBiZSBleHRyYWN0ZWQgZnJvbS5cbiAgICovXG4gIHByaXZhdGUgZ2V0VmlkZW9UcmFja3Moc3RyZWFtOiBNZWRpYVN0cmVhbSkge1xuICAgIGxldCB0cmFja3MgPSBbXTtcbiAgICB0cnkge1xuICAgICAgdHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgcmV0dXJuIHRyYWNrcyB8fCBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHRyYWNrIFRoZSBtZWRpYSBzdHJlYW0gdHJhY2sgdGhhdCB3aWxsIGJlIGNoZWNrZWQgZm9yIGNvbXBhdGliaWxpdHkuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGlzVG9yY2hDb21wYXRpYmxlKHRyYWNrOiBNZWRpYVN0cmVhbVRyYWNrKSB7XG5cbiAgICBsZXQgY29tcGF0aWJsZSA9IGZhbHNlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGltYWdlQ2FwdHVyZSA9IG5ldyBJbWFnZUNhcHR1cmUodHJhY2spO1xuICAgICAgY29uc3QgY2FwYWJpbGl0aWVzID0gYXdhaXQgaW1hZ2VDYXB0dXJlLmdldFBob3RvQ2FwYWJpbGl0aWVzKCk7XG4gICAgICBjb21wYXRpYmxlID0gISFjYXBhYmlsaXRpZXNbJ3RvcmNoJ10gfHwgKCdmaWxsTGlnaHRNb2RlJyBpbiBjYXBhYmlsaXRpZXMgJiYgY2FwYWJpbGl0aWVzLmZpbGxMaWdodE1vZGUubGVuZ3RoICE9PSAwKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICByZXR1cm4gY29tcGF0aWJsZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgdGhlIHRvcmNoIHNldHRpbmcgaW4gYWxsIHJlY2VpdmVkIHRyYWNrcy5cbiAgICovXG4gIHByaXZhdGUgYXBwbHlUb3JjaE9uVHJhY2tzKHRyYWNrczogTWVkaWFTdHJlYW1UcmFja1tdLCBzdGF0ZTogYm9vbGVhbikge1xuICAgIHRyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHRyYWNrLmFwcGx5Q29uc3RyYWludHMoe1xuICAgICAgYWR2YW5jZWQ6IFs8YW55PnsgdG9yY2g6IHN0YXRlLCBmaWxsTGlnaHRNb2RlOiBzdGF0ZSA/ICd0b3JjaCcgOiAnbm9uZScgfV1cbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogQ29ycmVjdGx5IHNldHMgYSBuZXcgc2NhblN0cmVhbSB2YWx1ZS5cbiAgICovXG4gIHByaXZhdGUgX3NldFNjYW5TdHJlYW0oc2NhbiQ6IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4pOiB2b2lkIHtcbiAgICAvLyBjbGVhbnMgb2xkIHN0cmVhbVxuICAgIHRoaXMuX2NsZWFuU2NhblN0cmVhbSgpO1xuICAgIC8vIHNldHMgbmV3IHN0cmVhbVxuICAgIHRoaXMuc2NhblN0cmVhbSA9IHNjYW4kO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFucyBhbnkgb2xkIHNjYW4gc3RyZWFtIHZhbHVlLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2xlYW5TY2FuU3RyZWFtKCk6IHZvaWQge1xuXG4gICAgaWYgKHRoaXMuc2NhblN0cmVhbSAmJiAhdGhpcy5zY2FuU3RyZWFtLmlzU3RvcHBlZCkge1xuICAgICAgdGhpcy5zY2FuU3RyZWFtLmNvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zY2FuU3RyZWFtID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvZGVzIHZhbHVlcyBpbiBhIHN0cmVhbSB3aXRoIGRlbGF5cyBiZXR3ZWVuIHNjYW5zLlxuICAgKlxuICAgKiBAcGFyYW0gc2NhbiQgVGhlIHN1YmplY3QgdG8gcmVjZWl2ZSB0aGUgdmFsdWVzLlxuICAgKiBAcGFyYW0gdmlkZW9FbGVtZW50IFRoZSB2aWRlbyBlbGVtZW50IHRoZSBkZWNvZGUgd2lsbCBiZSBhcHBsaWVkLlxuICAgKiBAcGFyYW0gZGVsYXkgVGhlIGRlbGF5IGJldHdlZW4gZGVjb2RlIHJlc3VsdHMuXG4gICAqL1xuICBwcml2YXRlIGRlY29kZU9uU3ViamVjdChzY2FuJDogQmVoYXZpb3JTdWJqZWN0PFJlc3VsdEFuZEVycm9yPiwgdmlkZW9FbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50LCBkZWxheTogbnVtYmVyKTogdm9pZCB7XG5cbiAgICAvLyBzdG9wcyBsb29wXG4gICAgaWYgKHNjYW4kLmlzU3RvcHBlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQ6IFJlc3VsdDtcblxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmRlY29kZSh2aWRlb0VsZW1lbnQpO1xuICAgICAgc2NhbiQubmV4dCh7IHJlc3VsdCB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgLy8gc3RyZWFtIGNhbm5vdCBzdG9wIG9uIGZhaWxzLlxuICAgICAgaWYgKFxuICAgICAgICAhZXJyb3IgfHxcbiAgICAgICAgLy8gc2NhbiBGYWlsdXJlIC0gZm91bmQgbm90aGluZywgbm8gZXJyb3JcbiAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBOb3RGb3VuZEV4Y2VwdGlvbiB8fFxuICAgICAgICAvLyBzY2FuIEVycm9yIC0gZm91bmQgdGhlIFFSIGJ1dCBnb3QgZXJyb3Igb24gZGVjb2RpbmdcbiAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBDaGVja3N1bUV4Y2VwdGlvbiB8fFxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEZvcm1hdEV4Y2VwdGlvblxuICAgICAgKSB7XG4gICAgICAgIHNjYW4kLm5leHQoeyBlcnJvciB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjYW4kLmVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgY29uc3QgdGltZW91dCA9ICFyZXN1bHQgPyAwIDogZGVsYXk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZGVjb2RlT25TdWJqZWN0KHNjYW4kLCB2aWRlb0VsZW1lbnQsIGRlbGF5KSwgdGltZW91dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RhcnRzIHRoZSBzY2FubmVyLlxuICAgKi9cbiAgcHJpdmF0ZSByZXN0YXJ0KCk6IE9ic2VydmFibGU8UmVzdWx0QW5kRXJyb3I+IHtcbiAgICAvLyByZXNldFxuICAgIC8vIHN0YXJ0XG4gICAgcmV0dXJuIHRoaXMuY29udGludW91c0RlY29kZUZyb21JbnB1dFZpZGVvRGV2aWNlKHRoaXMuZGV2aWNlSWQsIHRoaXMudmlkZW9FbGVtZW50KTtcbiAgfVxuXG59XG4iXX0=