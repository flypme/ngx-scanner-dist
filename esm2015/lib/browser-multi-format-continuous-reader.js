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
export class BrowserMultiFormatContinuousReader extends BrowserMultiFormatReader {
    constructor() {
        super(...arguments);
        /**
         * Says if there's a torch available for the current device.
         */
        this._isTorchAvailable = new BehaviorSubject(undefined);
    }
    /**
     * Exposes _tochAvailable .
     * @return {?}
     */
    get isTorchAvailable() {
        return this._isTorchAvailable.asObservable();
    }
    /**
     * Starts the decoding from the current or a new video element.
     *
     * @param {?=} deviceId The device's to be used Id
     * @param {?=} videoSource A new video element
     * @return {?}
     */
    continuousDecodeFromInputVideoDevice(deviceId, videoSource) {
        this.reset();
        // Keeps the deviceId between scanner resets.
        if (typeof deviceId !== 'undefined') {
            this.deviceId = deviceId;
        }
        if (typeof navigator === 'undefined') {
            return;
        }
        /** @type {?} */
        const scan$ = new BehaviorSubject({});
        try {
            // this.decodeFromInputVideoDeviceContinuously(deviceId, videoSource, (result, error) => scan$.next({ result, error }));
            this.getStreamForDevice({ deviceId })
                .then((/**
             * @param {?} stream
             * @return {?}
             */
            stream => this.attachStreamToVideoAndCheckTorch(stream, videoSource)))
                .then((/**
             * @param {?} videoElement
             * @return {?}
             */
            videoElement => this.decodeOnSubject(scan$, videoElement, this.timeBetweenScansMillis)));
        }
        catch (e) {
            scan$.error(e);
        }
        this._setScanStream(scan$);
        // @todo Find a way to emit a complete event on the scan stream once it's finished.
        return scan$.asObservable();
    }
    /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     * @param {?} __0
     * @return {?}
     */
    getStreamForDevice({ deviceId }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {?} */
            const constraints = this.getUserMediaConstraints(deviceId);
            /** @type {?} */
            const stream = yield navigator.mediaDevices.getUserMedia(constraints);
            return stream;
        });
    }
    /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     * @param {?} deviceId
     * @return {?}
     */
    getUserMediaConstraints(deviceId) {
        /** @type {?} */
        const video = typeof deviceId === 'undefined'
            ? { facingMode: { exact: 'environment' } }
            : { deviceId: { exact: deviceId } };
        /** @type {?} */
        const constraints = { video };
        return constraints;
    }
    /**
     * Enables and disables the device torch.
     * @param {?} on
     * @return {?}
     */
    setTorch(on) {
        if (!this._isTorchAvailable.value) {
            // compatibility not checked yet
            return;
        }
        /** @type {?} */
        const tracks = this.getVideoTracks(this.stream);
        if (on) {
            this.applyTorchOnTracks(tracks, true);
        }
        else {
            this.applyTorchOnTracks(tracks, false);
            // @todo check possibility to disable torch without restart
            this.restart();
        }
    }
    /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     * @private
     * @param {?} stream
     * @param {?} videoSource
     * @return {?}
     */
    attachStreamToVideoAndCheckTorch(stream, videoSource) {
        this.updateTorchCompatibility(stream);
        return this.attachStreamToVideo(stream, videoSource);
    }
    /**
     * Checks if the stream supports torch control.
     *
     * @private
     * @param {?} stream The media stream used to check.
     * @return {?}
     */
    updateTorchCompatibility(stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {?} */
            const tracks = this.getVideoTracks(stream);
            for (const track of tracks) {
                if (yield this.isTorchCompatible(track)) {
                    this._isTorchAvailable.next(true);
                    break;
                }
            }
        });
    }
    /**
     *
     * @private
     * @param {?} stream The video stream where the tracks gonna be extracted from.
     * @return {?}
     */
    getVideoTracks(stream) {
        /** @type {?} */
        let tracks = [];
        try {
            tracks = stream.getVideoTracks();
        }
        finally {
            return tracks || [];
        }
    }
    /**
     *
     * @private
     * @param {?} track The media stream track that will be checked for compatibility.
     * @return {?}
     */
    isTorchCompatible(track) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {?} */
            let compatible = false;
            try {
                /** @type {?} */
                const imageCapture = new ImageCapture(track);
                /** @type {?} */
                const capabilities = yield imageCapture.getPhotoCapabilities();
                compatible = !!capabilities['torch'] || ('fillLightMode' in capabilities && capabilities.fillLightMode.length !== 0);
            }
            finally {
                return compatible;
            }
        });
    }
    /**
     * Apply the torch setting in all received tracks.
     * @private
     * @param {?} tracks
     * @param {?} state
     * @return {?}
     */
    applyTorchOnTracks(tracks, state) {
        tracks.forEach((/**
         * @param {?} track
         * @return {?}
         */
        track => track.applyConstraints({
            advanced: [(/** @type {?} */ ({ torch: state, fillLightMode: state ? 'torch' : 'none' }))]
        })));
    }
    /**
     * Correctly sets a new scanStream value.
     * @private
     * @param {?} scan$
     * @return {?}
     */
    _setScanStream(scan$) {
        // cleans old stream
        this._cleanScanStream();
        // sets new stream
        this.scanStream = scan$;
    }
    /**
     * Cleans any old scan stream value.
     * @private
     * @return {?}
     */
    _cleanScanStream() {
        if (this.scanStream && !this.scanStream.isStopped) {
            this.scanStream.complete();
        }
        this.scanStream = null;
    }
    /**
     * Decodes values in a stream with delays between scans.
     *
     * @private
     * @param {?} scan$ The subject to receive the values.
     * @param {?} videoElement The video element the decode will be applied.
     * @param {?} delay The delay between decode results.
     * @return {?}
     */
    decodeOnSubject(scan$, videoElement, delay) {
        // stops loop
        if (scan$.isStopped) {
            return;
        }
        /** @type {?} */
        let result;
        try {
            result = this.decode(videoElement);
            scan$.next({ result });
        }
        catch (error) {
            // stream cannot stop on fails.
            if (!error ||
                // scan Failure - found nothing, no error
                error instanceof NotFoundException ||
                // scan Error - found the QR but got error on decoding
                error instanceof ChecksumException ||
                error instanceof FormatException) {
                scan$.next({ error });
            }
            else {
                scan$.error(error);
            }
        }
        finally {
            /** @type {?} */
            const timeout = !result ? 0 : delay;
            setTimeout((/**
             * @return {?}
             */
            () => this.decodeOnSubject(scan$, videoElement, delay)), timeout);
        }
    }
    /**
     * Restarts the scanner.
     * @private
     * @return {?}
     */
    restart() {
        // reset
        // start
        return this.continuousDecodeFromInputVideoDevice(this.deviceId, this.videoElement);
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBNkM7O0FBRTdDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQVUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6SCxPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDOzs7O0FBTW5ELE1BQU0sT0FBTyxrQ0FBbUMsU0FBUSx3QkFBd0I7SUFBaEY7Ozs7O1FBWVUsc0JBQWlCLEdBQUcsSUFBSSxlQUFlLENBQVUsU0FBUyxDQUFDLENBQUM7SUEyT3RFLENBQUM7Ozs7O0lBbFBDLElBQVcsZ0JBQWdCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQy9DLENBQUM7Ozs7Ozs7O0lBd0JNLG9DQUFvQyxDQUN6QyxRQUFpQixFQUNqQixXQUE4QjtRQUc5QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFYiw2Q0FBNkM7UUFDN0MsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7U0FDMUI7UUFFRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxPQUFPO1NBQ1I7O2NBRUssS0FBSyxHQUFHLElBQUksZUFBZSxDQUFpQixFQUFFLENBQUM7UUFFckQsSUFBSTtZQUNGLHdIQUF3SDtZQUN4SCxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQztpQkFDbEMsSUFBSTs7OztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxD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UUFFbEIsSUFBSTtZQUNGLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ25DLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCwrQkFBK0I7WUFDL0IsSUFDRSxDQUFDLEtBQUs7Z0JBQ04seUNBQXlDO2dCQUN6QyxLQUFLLFlBQVksaUJBQWlCO2dCQUNsQyxzREFBc0Q7Z0JBQ3RELEtBQUssWUFBWSxpQkFBaUI7Z0JBQ2xDLEtBQUssWUFBWSxlQUFlLEVBQ2hDO2dCQUNBLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEI7U0FDRjtnQkFBUzs7a0JBQ0YsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDbkMsVUFBVTs7O1lBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxHQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzdFO0lBQ0gsQ0FBQzs7Ozs7O0lBS08sT0FBTztRQUNiLFFBQVE7UUFDUixRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsb0NBQW9DLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDckYsQ0FBQztDQUVGOzs7Ozs7O0lBM09DLCtEQUFvRTs7Ozs7O0lBS3BFLHNEQUF5Qjs7Ozs7O0lBS3pCLHdEQUFvRCIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2ltYWdlLWNhcHR1cmUuZC50c1wiIC8+XG5cbmltcG9ydCB7IEJyb3dzZXJNdWx0aUZvcm1hdFJlYWRlciwgQ2hlY2tzdW1FeGNlcHRpb24sIEZvcm1hdEV4Y2VwdGlvbiwgTm90Rm91bmRFeGNlcHRpb24sIFJlc3VsdCB9IGZyb20gJ0B6eGluZy9saWJyYXJ5JztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgUmVzdWx0QW5kRXJyb3IgfSBmcm9tICcuL1Jlc3VsdEFuZEVycm9yJztcblxuLyoqXG4gKiBCYXNlZCBvbiB6eGluZy10eXBlc2NyaXB0IEJyb3dzZXJDb2RlUmVhZGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyTXVsdGlGb3JtYXRDb250aW51b3VzUmVhZGVyIGV4dGVuZHMgQnJvd3Nlck11bHRpRm9ybWF0UmVhZGVyIHtcblxuICAvKipcbiAgICogRXhwb3NlcyBfdG9jaEF2YWlsYWJsZSAuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzVG9yY2hBdmFpbGFibGUoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzVG9yY2hBdmFpbGFibGUuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2F5cyBpZiB0aGVyZSdzIGEgdG9yY2ggYXZhaWxhYmxlIGZvciB0aGUgY3VycmVudCBkZXZpY2UuXG4gICAqL1xuICBwcml2YXRlIF9pc1RvcmNoQXZhaWxhYmxlID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPih1bmRlZmluZWQpO1xuXG4gIC8qKlxuICAgKiBUaGUgZGV2aWNlIGlkIG9mIHRoZSBjdXJyZW50IG1lZGlhIGRldmljZS5cbiAgICovXG4gIHByaXZhdGUgZGV2aWNlSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogSWYgdGhlcmUncyBzb21lIHNjYW4gc3RyZWFtIG9wZW4sIGl0IHNoYWwgYmUgaGVyZS5cbiAgICovXG4gIHByaXZhdGUgc2NhblN0cmVhbTogQmVoYXZpb3JTdWJqZWN0PFJlc3VsdEFuZEVycm9yPjtcblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBkZWNvZGluZyBmcm9tIHRoZSBjdXJyZW50IG9yIGEgbmV3IHZpZGVvIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSBjYWxsYmFja0ZuIFRoZSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCBhZnRlciBldmVyeSBzY2FuIGF0dGVtcHRcbiAgICogQHBhcmFtIGRldmljZUlkIFRoZSBkZXZpY2UncyB0byBiZSB1c2VkIElkXG4gICAqIEBwYXJhbSB2aWRlb1NvdXJjZSBBIG5ldyB2aWRlbyBlbGVtZW50XG4gICAqL1xuICBwdWJsaWMgY29udGludW91c0RlY29kZUZyb21JbnB1dFZpZGVvRGV2aWNlKFxuICAgIGRldmljZUlkPzogc3RyaW5nLFxuICAgIHZpZGVvU291cmNlPzogSFRNTFZpZGVvRWxlbWVudFxuICApOiBPYnNlcnZhYmxlPFJlc3VsdEFuZEVycm9yPiB7XG5cbiAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICAvLyBLZWVwcyB0aGUgZGV2aWNlSWQgYmV0d2VlbiBzY2FubmVyIHJlc2V0cy5cbiAgICBpZiAodHlwZW9mIGRldmljZUlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5kZXZpY2VJZCA9IGRldmljZUlkO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNjYW4kID0gbmV3IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4oe30pO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIHRoaXMuZGVjb2RlRnJvbUlucHV0VmlkZW9EZXZpY2VDb250aW51b3VzbHkoZGV2aWNlSWQsIHZpZGVvU291cmNlLCAocmVzdWx0LCBlcnJvcikgPT4gc2NhbiQubmV4dCh7IHJlc3VsdCwgZXJyb3IgfSkpO1xuICAgICAgdGhpcy5nZXRTdHJlYW1Gb3JEZXZpY2UoeyBkZXZpY2VJZCB9KVxuICAgICAgICAudGhlbihzdHJlYW0gPT4gdGhpcy5hdHRhY2hTdHJlYW1Ub1ZpZGVvQW5kQ2hlY2tUb3JjaChzdHJlYW0sIHZpZGVvU291cmNlKSlcbiAgICAgICAgLnRoZW4odmlkZW9FbGVtZW50ID0+IHRoaXMuZGVjb2RlT25TdWJqZWN0KHNjYW4kLCB2aWRlb0VsZW1lbnQsIHRoaXMudGltZUJldHdlZW5TY2Fuc01pbGxpcykpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNjYW4kLmVycm9yKGUpO1xuICAgIH1cblxuICAgIHRoaXMuX3NldFNjYW5TdHJlYW0oc2NhbiQpO1xuXG4gICAgLy8gQHRvZG8gRmluZCBhIHdheSB0byBlbWl0IGEgY29tcGxldGUgZXZlbnQgb24gdGhlIHNjYW4gc3RyZWFtIG9uY2UgaXQncyBmaW5pc2hlZC5cblxuICAgIHJldHVybiBzY2FuJC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBzdHJlYW0gZm9yIGNlcnRhaW4gZGV2aWNlLlxuICAgKiBGYWxscyBiYWNrIHRvIGFueSBhdmFpbGFibGUgZGV2aWNlIGlmIG5vIGBkZXZpY2VJZGAgaXMgZGVmaW5lZC5cbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRTdHJlYW1Gb3JEZXZpY2UoeyBkZXZpY2VJZCB9OiBQYXJ0aWFsPE1lZGlhRGV2aWNlSW5mbz4pOiBQcm9taXNlPE1lZGlhU3RyZWFtPiB7XG4gICAgY29uc3QgY29uc3RyYWludHMgPSB0aGlzLmdldFVzZXJNZWRpYUNvbnN0cmFpbnRzKGRldmljZUlkKTtcbiAgICBjb25zdCBzdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cyk7XG4gICAgcmV0dXJuIHN0cmVhbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG1lZGlhIHN0ZXJhbSBjb25zdHJhaW50cyBmb3IgY2VydGFpbiBgZGV2aWNlSWRgLlxuICAgKiBGYWxscyBiYWNrIHRvIGFueSBlbnZpcm9ubWVudCBhdmFpbGFibGUgZGV2aWNlIGlmIG5vIGBkZXZpY2VJZGAgaXMgZGVmaW5lZC5cbiAgICovXG4gIHB1YmxpYyBnZXRVc2VyTWVkaWFDb25zdHJhaW50cyhkZXZpY2VJZDogc3RyaW5nKTogTWVkaWFTdHJlYW1Db25zdHJhaW50cyB7XG5cbiAgICBjb25zdCB2aWRlbyA9IHR5cGVvZiBkZXZpY2VJZCA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgID8geyBmYWNpbmdNb2RlOiB7IGV4YWN0OiAnZW52aXJvbm1lbnQnIH0gfVxuICAgICAgOiB7IGRldmljZUlkOiB7IGV4YWN0OiBkZXZpY2VJZCB9IH07XG5cbiAgICBjb25zdCBjb25zdHJhaW50czogTWVkaWFTdHJlYW1Db25zdHJhaW50cyA9IHsgdmlkZW8gfTtcblxuICAgIHJldHVybiBjb25zdHJhaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGVzIGFuZCBkaXNhYmxlcyB0aGUgZGV2aWNlIHRvcmNoLlxuICAgKi9cbiAgcHVibGljIHNldFRvcmNoKG9uOiBib29sZWFuKTogdm9pZCB7XG5cbiAgICBpZiAoIXRoaXMuX2lzVG9yY2hBdmFpbGFibGUudmFsdWUpIHtcbiAgICAgIC8vIGNvbXBhdGliaWxpdHkgbm90IGNoZWNrZWQgeWV0XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJhY2tzID0gdGhpcy5nZXRWaWRlb1RyYWNrcyh0aGlzLnN0cmVhbSk7XG5cbiAgICBpZiAob24pIHtcbiAgICAgIHRoaXMuYXBwbHlUb3JjaE9uVHJhY2tzKHRyYWNrcywgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwbHlUb3JjaE9uVHJhY2tzKHRyYWNrcywgZmFsc2UpO1xuICAgICAgLy8gQHRvZG8gY2hlY2sgcG9zc2liaWxpdHkgdG8gZGlzYWJsZSB0b3JjaCB3aXRob3V0IHJlc3RhcnRcbiAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHRvcmNoIGNvbXBhdGliaWxpdHkgc3RhdGUgYW5kIGF0dGFjaHMgdGhlIHN0cmVhbSB0byB0aGUgcHJldmlldyBlbGVtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBhdHRhY2hTdHJlYW1Ub1ZpZGVvQW5kQ2hlY2tUb3JjaChzdHJlYW06IE1lZGlhU3RyZWFtLCB2aWRlb1NvdXJjZTogSFRNTFZpZGVvRWxlbWVudCk6IFByb21pc2U8SFRNTFZpZGVvRWxlbWVudD4ge1xuICAgIHRoaXMudXBkYXRlVG9yY2hDb21wYXRpYmlsaXR5KHN0cmVhbSk7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNoU3RyZWFtVG9WaWRlbyhzdHJlYW0sIHZpZGVvU291cmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHN0cmVhbSBzdXBwb3J0cyB0b3JjaCBjb250cm9sLlxuICAgKlxuICAgKiBAcGFyYW0gc3RyZWFtIFRoZSBtZWRpYSBzdHJlYW0gdXNlZCB0byBjaGVjay5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdXBkYXRlVG9yY2hDb21wYXRpYmlsaXR5KHN0cmVhbTogTWVkaWFTdHJlYW0pOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIGNvbnN0IHRyYWNrcyA9IHRoaXMuZ2V0VmlkZW9UcmFja3Moc3RyZWFtKTtcblxuICAgIGZvciAoY29uc3QgdHJhY2sgb2YgdHJhY2tzKSB7XG4gICAgICBpZiAoYXdhaXQgdGhpcy5pc1RvcmNoQ29tcGF0aWJsZSh0cmFjaykpIHtcbiAgICAgICAgdGhpcy5faXNUb3JjaEF2YWlsYWJsZS5uZXh0KHRydWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHN0cmVhbSBUaGUgdmlkZW8gc3RyZWFtIHdoZXJlIHRoZSB0cmFja3MgZ29ubmEgYmUgZXh0cmFjdGVkIGZyb20uXG4gICAqL1xuICBwcml2YXRlIGdldFZpZGVvVHJhY2tzKHN0cmVhbTogTWVkaWFTdHJlYW0pIHtcbiAgICBsZXQgdHJhY2tzID0gW107XG4gICAgdHJ5IHtcbiAgICAgIHRyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgIHJldHVybiB0cmFja3MgfHwgW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB0cmFjayBUaGUgbWVkaWEgc3RyZWFtIHRyYWNrIHRoYXQgd2lsbCBiZSBjaGVja2VkIGZvciBjb21wYXRpYmlsaXR5LlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBpc1RvcmNoQ29tcGF0aWJsZSh0cmFjazogTWVkaWFTdHJlYW1UcmFjaykge1xuXG4gICAgbGV0IGNvbXBhdGlibGUgPSBmYWxzZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbWFnZUNhcHR1cmUgPSBuZXcgSW1hZ2VDYXB0dXJlKHRyYWNrKTtcbiAgICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IGF3YWl0IGltYWdlQ2FwdHVyZS5nZXRQaG90b0NhcGFiaWxpdGllcygpO1xuICAgICAgY29tcGF0aWJsZSA9ICEhY2FwYWJpbGl0aWVzWyd0b3JjaCddIHx8ICgnZmlsbExpZ2h0TW9kZScgaW4gY2FwYWJpbGl0aWVzICYmIGNhcGFiaWxpdGllcy5maWxsTGlnaHRNb2RlLmxlbmd0aCAhPT0gMCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgcmV0dXJuIGNvbXBhdGlibGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IHRoZSB0b3JjaCBzZXR0aW5nIGluIGFsbCByZWNlaXZlZCB0cmFja3MuXG4gICAqL1xuICBwcml2YXRlIGFwcGx5VG9yY2hPblRyYWNrcyh0cmFja3M6IE1lZGlhU3RyZWFtVHJhY2tbXSwgc3RhdGU6IGJvb2xlYW4pIHtcbiAgICB0cmFja3MuZm9yRWFjaCh0cmFjayA9PiB0cmFjay5hcHBseUNvbnN0cmFpbnRzKHtcbiAgICAgIGFkdmFuY2VkOiBbPGFueT57IHRvcmNoOiBzdGF0ZSwgZmlsbExpZ2h0TW9kZTogc3RhdGUgPyAndG9yY2gnIDogJ25vbmUnIH1dXG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcnJlY3RseSBzZXRzIGEgbmV3IHNjYW5TdHJlYW0gdmFsdWUuXG4gICAqL1xuICBwcml2YXRlIF9zZXRTY2FuU3RyZWFtKHNjYW4kOiBCZWhhdmlvclN1YmplY3Q8UmVzdWx0QW5kRXJyb3I+KTogdm9pZCB7XG4gICAgLy8gY2xlYW5zIG9sZCBzdHJlYW1cbiAgICB0aGlzLl9jbGVhblNjYW5TdHJlYW0oKTtcbiAgICAvLyBzZXRzIG5ldyBzdHJlYW1cbiAgICB0aGlzLnNjYW5TdHJlYW0gPSBzY2FuJDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgYW55IG9sZCBzY2FuIHN0cmVhbSB2YWx1ZS5cbiAgICovXG4gIHByaXZhdGUgX2NsZWFuU2NhblN0cmVhbSgpOiB2b2lkIHtcblxuICAgIGlmICh0aGlzLnNjYW5TdHJlYW0gJiYgIXRoaXMuc2NhblN0cmVhbS5pc1N0b3BwZWQpIHtcbiAgICAgIHRoaXMuc2NhblN0cmVhbS5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2NhblN0cmVhbSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlcyB2YWx1ZXMgaW4gYSBzdHJlYW0gd2l0aCBkZWxheXMgYmV0d2VlbiBzY2Fucy5cbiAgICpcbiAgICogQHBhcmFtIHNjYW4kIFRoZSBzdWJqZWN0IHRvIHJlY2VpdmUgdGhlIHZhbHVlcy5cbiAgICogQHBhcmFtIHZpZGVvRWxlbWVudCBUaGUgdmlkZW8gZWxlbWVudCB0aGUgZGVjb2RlIHdpbGwgYmUgYXBwbGllZC5cbiAgICogQHBhcmFtIGRlbGF5IFRoZSBkZWxheSBiZXR3ZWVuIGRlY29kZSByZXN1bHRzLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWNvZGVPblN1YmplY3Qoc2NhbiQ6IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4sIHZpZGVvRWxlbWVudDogSFRNTFZpZGVvRWxlbWVudCwgZGVsYXk6IG51bWJlcik6IHZvaWQge1xuXG4gICAgLy8gc3RvcHMgbG9vcFxuICAgIGlmIChzY2FuJC5pc1N0b3BwZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0OiBSZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5kZWNvZGUodmlkZW9FbGVtZW50KTtcbiAgICAgIHNjYW4kLm5leHQoeyByZXN1bHQgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIHN0cmVhbSBjYW5ub3Qgc3RvcCBvbiBmYWlscy5cbiAgICAgIGlmIChcbiAgICAgICAgIWVycm9yIHx8XG4gICAgICAgIC8vIHNjYW4gRmFpbHVyZSAtIGZvdW5kIG5vdGhpbmcsIG5vIGVycm9yXG4gICAgICAgIGVycm9yIGluc3RhbmNlb2YgTm90Rm91bmRFeGNlcHRpb24gfHxcbiAgICAgICAgLy8gc2NhbiBFcnJvciAtIGZvdW5kIHRoZSBRUiBidXQgZ290IGVycm9yIG9uIGRlY29kaW5nXG4gICAgICAgIGVycm9yIGluc3RhbmNlb2YgQ2hlY2tzdW1FeGNlcHRpb24gfHxcbiAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBGb3JtYXRFeGNlcHRpb25cbiAgICAgICkge1xuICAgICAgICBzY2FuJC5uZXh0KHsgZXJyb3IgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY2FuJC5lcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSAhcmVzdWx0ID8gMCA6IGRlbGF5O1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmRlY29kZU9uU3ViamVjdChzY2FuJCwgdmlkZW9FbGVtZW50LCBkZWxheSksIHRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0YXJ0cyB0aGUgc2Nhbm5lci5cbiAgICovXG4gIHByaXZhdGUgcmVzdGFydCgpOiBPYnNlcnZhYmxlPFJlc3VsdEFuZEVycm9yPiB7XG4gICAgLy8gcmVzZXRcbiAgICAvLyBzdGFydFxuICAgIHJldHVybiB0aGlzLmNvbnRpbnVvdXNEZWNvZGVGcm9tSW5wdXRWaWRlb0RldmljZSh0aGlzLmRldmljZUlkLCB0aGlzLnZpZGVvRWxlbWVudCk7XG4gIH1cblxufVxuIl19