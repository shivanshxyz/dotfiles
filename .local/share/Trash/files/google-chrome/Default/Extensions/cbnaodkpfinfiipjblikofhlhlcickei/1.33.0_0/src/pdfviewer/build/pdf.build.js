!(function (root, factory) {
  "use strict";
  "function" == typeof define && define.amd
    ? define("pdfjs-dist/build/pdf", ["exports"], factory)
    : factory("undefined" != typeof exports ? exports : (root.pdfjsDistBuildPdf = {}));
})(this, function (exports) {
  "use strict";
  var pdfjsFilePath = "undefined" != typeof document && document.currentScript ? document.currentScript.src : null,
    pdfjsLibs = {};
  (function () {
    !(function (root, factory) {
      !(function (exports) {
        function setVerbosityLevel(level) {
          verbosity = level;
        }
        function getVerbosityLevel() {
          return verbosity;
        }
        function info(msg) {
          verbosity >= VERBOSITY_LEVELS.infos && console.log("Info: " + msg);
        }
        function warn(msg) {
          verbosity >= VERBOSITY_LEVELS.warnings && console.log("Warning: " + msg);
        }
        function deprecated(details) {
          console.log("Deprecated API usage: " + details);
        }
        function error(msg) {
          throw (
            (verbosity >= VERBOSITY_LEVELS.errors && (console.log("Error: " + msg), console.log(backtrace())),
            new Error(msg))
          );
        }
        function backtrace() {
          try {
            throw new Error();
          } catch (e) {
            return e.stack ? e.stack.split("\n").slice(2).join("\n") : "";
          }
        }
        function assert(cond, msg) {
          cond || error(msg);
        }
        function isSameOrigin(baseUrl, otherUrl) {
          try {
            var base = new URL(baseUrl);
            if (!base.origin || "null" === base.origin) return !1;
          } catch (e) {
            return !1;
          }
          var other = new URL(otherUrl, base);
          return base.origin === other.origin;
        }
        function isValidUrl(url, allowRelative) {
          if (!url || "string" != typeof url) return !1;
          var protocol = /^[a-z][a-z0-9+\-.]*(?=:)/i.exec(url);
          if (!protocol) return allowRelative;
          switch ((protocol = protocol[0].toLowerCase())) {
            case "http":
            case "https":
            case "ftp":
            case "mailto":
            case "tel":
              return !0;
            default:
              return !1;
          }
        }
        function shadow(obj, prop, value) {
          return (
            Object.defineProperty(obj, prop, { value: value, enumerable: !0, configurable: !0, writable: !1 }), value
          );
        }
        function getLookupTableFactory(initializer) {
          var lookup;
          return function () {
            return initializer && ((lookup = Object.create(null)), initializer(lookup), (initializer = null)), lookup;
          };
        }
        function removeNullCharacters(str) {
          return "string" != typeof str
            ? (warn("The argument for removeNullCharacters must be a string."), str)
            : str.replace(NullCharactersRegExp, "");
        }
        function bytesToString(bytes) {
          assert(
            null !== bytes && "object" == typeof bytes && void 0 !== bytes.length,
            "Invalid argument for bytesToString"
          );
          var length = bytes.length;
          if (length < 8192) return String.fromCharCode.apply(null, bytes);
          for (var strBuf = [], i = 0; i < length; i += 8192) {
            var chunkEnd = Math.min(i + 8192, length),
              chunk = bytes.subarray(i, chunkEnd);
            strBuf.push(String.fromCharCode.apply(null, chunk));
          }
          return strBuf.join("");
        }
        function stringToBytes(str) {
          assert("string" == typeof str, "Invalid argument for stringToBytes");
          for (var length = str.length, bytes = new Uint8Array(length), i = 0; i < length; ++i)
            bytes[i] = 255 & str.charCodeAt(i);
          return bytes;
        }
        function arrayByteLength(arr) {
          return void 0 !== arr.length ? arr.length : (assert(void 0 !== arr.byteLength), arr.byteLength);
        }
        function arraysToBytes(arr) {
          if (1 === arr.length && arr[0] instanceof Uint8Array) return arr[0];
          var i,
            item,
            itemLength,
            resultLength = 0,
            ii = arr.length;
          for (i = 0; i < ii; i++) (item = arr[i]), (itemLength = arrayByteLength(item)), (resultLength += itemLength);
          var pos = 0,
            data = new Uint8Array(resultLength);
          for (i = 0; i < ii; i++)
            (item = arr[i]),
              item instanceof Uint8Array ||
                (item = "string" == typeof item ? stringToBytes(item) : new Uint8Array(item)),
              (itemLength = item.byteLength),
              data.set(item, pos),
              (pos += itemLength);
          return data;
        }
        function string32(value) {
          return String.fromCharCode((value >> 24) & 255, (value >> 16) & 255, (value >> 8) & 255, 255 & value);
        }
        function log2(x) {
          for (var n = 1, i = 0; x > n; ) (n <<= 1), i++;
          return i;
        }
        function readInt8(data, start) {
          return (data[start] << 24) >> 24;
        }
        function readUint16(data, offset) {
          return (data[offset] << 8) | data[offset + 1];
        }
        function readUint32(data, offset) {
          return ((data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
        }
        function isLittleEndian() {
          var buffer8 = new Uint8Array(2);
          return (buffer8[0] = 1), 1 === new Uint16Array(buffer8.buffer)[0];
        }
        function isEvalSupported() {
          try {
            return new Function(""), !0;
          } catch (e) {
            return !1;
          }
        }
        function stringToPDFString(str) {
          var i,
            n = str.length,
            strBuf = [];
          if ("??" === str[0] && "??" === str[1])
            for (i = 2; i < n; i += 2)
              strBuf.push(String.fromCharCode((str.charCodeAt(i) << 8) | str.charCodeAt(i + 1)));
          else
            for (i = 0; i < n; ++i) {
              var code = PDFStringTranslateTable[str.charCodeAt(i)];
              strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
            }
          return strBuf.join("");
        }
        function stringToUTF8String(str) {
          return decodeURIComponent(escape(str));
        }
        function utf8StringToString(str) {
          return unescape(encodeURIComponent(str));
        }
        function isEmptyObj(obj) {
          for (var key in obj) return !1;
          return !0;
        }
        function isBool(v) {
          return "boolean" == typeof v;
        }
        function isInt(v) {
          return "number" == typeof v && (0 | v) === v;
        }
        function isNum(v) {
          return "number" == typeof v;
        }
        function isString(v) {
          return "string" == typeof v;
        }
        function isArray(v) {
          return v instanceof Array;
        }
        function isArrayBuffer(v) {
          return "object" == typeof v && null !== v && void 0 !== v.byteLength;
        }
        function isSpace(ch) {
          return 32 === ch || 9 === ch || 13 === ch || 10 === ch;
        }
        function createPromiseCapability() {
          var capability = {};
          return (
            (capability.promise = new Promise(function (resolve, reject) {
              (capability.resolve = resolve), (capability.reject = reject);
            })),
            capability
          );
        }
        function MessageHandler(sourceName, targetName, comObj) {
          (this.sourceName = sourceName),
            (this.targetName = targetName),
            (this.comObj = comObj),
            (this.callbackIndex = 1),
            (this.postMessageTransfers = !0);
          var callbacksCapabilities = (this.callbacksCapabilities = Object.create(null)),
            ah = (this.actionHandler = Object.create(null));
          (this._onComObjOnMessage = function (event) {
            var data = event.data;
            if (data.targetName === this.sourceName)
              if (data.isReply) {
                var callbackId = data.callbackId;
                if (data.callbackId in callbacksCapabilities) {
                  var callback = callbacksCapabilities[callbackId];
                  delete callbacksCapabilities[callbackId],
                    "error" in data ? callback.reject(data.error) : callback.resolve(data.data);
                } else error("Cannot resolve callback " + callbackId);
              } else if (data.action in ah) {
                var action = ah[data.action];
                if (data.callbackId) {
                  var sourceName = this.sourceName,
                    targetName = data.sourceName;
                  Promise.resolve()
                    .then(function () {
                      return action[0].call(action[1], data.data);
                    })
                    .then(
                      function (result) {
                        comObj.postMessage({
                          sourceName: sourceName,
                          targetName: targetName,
                          isReply: !0,
                          callbackId: data.callbackId,
                          data: result,
                        });
                      },
                      function (reason) {
                        reason instanceof Error && (reason += ""),
                          comObj.postMessage({
                            sourceName: sourceName,
                            targetName: targetName,
                            isReply: !0,
                            callbackId: data.callbackId,
                            error: reason,
                          });
                      }
                    );
                } else action[0].call(action[1], data.data);
              } else error("Unknown action from worker: " + data.action);
          }.bind(this)),
            comObj.addEventListener("message", this._onComObjOnMessage);
        }
        function loadJpegStream(id, imageUrl, objs) {
          var img = new Image();
          (img.onload = function () {
            objs.resolve(id, img);
          }),
            (img.onerror = function () {
              objs.resolve(id, null), warn("Error during JPEG image loading");
            }),
            (img.src = imageUrl);
        }
        var globalScope =
            "undefined" != typeof window
              ? window
              : "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : this,
          FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0],
          TextRenderingMode = {
            FILL: 0,
            STROKE: 1,
            FILL_STROKE: 2,
            INVISIBLE: 3,
            FILL_ADD_TO_PATH: 4,
            STROKE_ADD_TO_PATH: 5,
            FILL_STROKE_ADD_TO_PATH: 6,
            ADD_TO_PATH: 7,
            FILL_STROKE_MASK: 3,
            ADD_TO_PATH_FLAG: 4,
          },
          ImageKind = { GRAYSCALE_1BPP: 1, RGB_24BPP: 2, RGBA_32BPP: 3 },
          AnnotationType = {
            TEXT: 1,
            LINK: 2,
            FREETEXT: 3,
            LINE: 4,
            SQUARE: 5,
            CIRCLE: 6,
            POLYGON: 7,
            POLYLINE: 8,
            HIGHLIGHT: 9,
            UNDERLINE: 10,
            SQUIGGLY: 11,
            STRIKEOUT: 12,
            STAMP: 13,
            CARET: 14,
            INK: 15,
            POPUP: 16,
            FILEATTACHMENT: 17,
            SOUND: 18,
            MOVIE: 19,
            WIDGET: 20,
            SCREEN: 21,
            PRINTERMARK: 22,
            TRAPNET: 23,
            WATERMARK: 24,
            THREED: 25,
            REDACT: 26,
          },
          AnnotationFlag = {
            INVISIBLE: 1,
            HIDDEN: 2,
            PRINT: 4,
            NOZOOM: 8,
            NOROTATE: 16,
            NOVIEW: 32,
            READONLY: 64,
            LOCKED: 128,
            TOGGLENOVIEW: 256,
            LOCKEDCONTENTS: 512,
          },
          AnnotationFieldFlag = {
            READONLY: 1,
            REQUIRED: 2,
            NOEXPORT: 4,
            MULTILINE: 4096,
            PASSWORD: 8192,
            NOTOGGLETOOFF: 16384,
            RADIO: 32768,
            PUSHBUTTON: 65536,
            COMBO: 131072,
            EDIT: 262144,
            SORT: 524288,
            FILESELECT: 1048576,
            MULTISELECT: 2097152,
            DONOTSPELLCHECK: 4194304,
            DONOTSCROLL: 8388608,
            COMB: 16777216,
            RICHTEXT: 33554432,
            RADIOSINUNISON: 33554432,
            COMMITONSELCHANGE: 67108864,
          },
          AnnotationBorderStyleType = { SOLID: 1, DASHED: 2, BEVELED: 3, INSET: 4, UNDERLINE: 5 },
          StreamType = { UNKNOWN: 0, FLATE: 1, LZW: 2, DCT: 3, JPX: 4, JBIG: 5, A85: 6, AHX: 7, CCF: 8, RL: 9 },
          FontType = {
            UNKNOWN: 0,
            TYPE1: 1,
            TYPE1C: 2,
            CIDFONTTYPE0: 3,
            CIDFONTTYPE0C: 4,
            TRUETYPE: 5,
            CIDFONTTYPE2: 6,
            TYPE3: 7,
            OPENTYPE: 8,
            TYPE0: 9,
            MMTYPE1: 10,
          },
          VERBOSITY_LEVELS = { errors: 0, warnings: 1, infos: 5 },
          OPS = {
            dependency: 1,
            setLineWidth: 2,
            setLineCap: 3,
            setLineJoin: 4,
            setMiterLimit: 5,
            setDash: 6,
            setRenderingIntent: 7,
            setFlatness: 8,
            setGState: 9,
            save: 10,
            restore: 11,
            transform: 12,
            moveTo: 13,
            lineTo: 14,
            curveTo: 15,
            curveTo2: 16,
            curveTo3: 17,
            closePath: 18,
            rectangle: 19,
            stroke: 20,
            closeStroke: 21,
            fill: 22,
            eoFill: 23,
            fillStroke: 24,
            eoFillStroke: 25,
            closeFillStroke: 26,
            closeEOFillStroke: 27,
            endPath: 28,
            clip: 29,
            eoClip: 30,
            beginText: 31,
            endText: 32,
            setCharSpacing: 33,
            setWordSpacing: 34,
            setHScale: 35,
            setLeading: 36,
            setFont: 37,
            setTextRenderingMode: 38,
            setTextRise: 39,
            moveText: 40,
            setLeadingMoveText: 41,
            setTextMatrix: 42,
            nextLine: 43,
            showText: 44,
            showSpacedText: 45,
            nextLineShowText: 46,
            nextLineSetSpacingShowText: 47,
            setCharWidth: 48,
            setCharWidthAndBounds: 49,
            setStrokeColorSpace: 50,
            setFillColorSpace: 51,
            setStrokeColor: 52,
            setStrokeColorN: 53,
            setFillColor: 54,
            setFillColorN: 55,
            setStrokeGray: 56,
            setFillGray: 57,
            setStrokeRGBColor: 58,
            setFillRGBColor: 59,
            setStrokeCMYKColor: 60,
            setFillCMYKColor: 61,
            shadingFill: 62,
            beginInlineImage: 63,
            beginImageData: 64,
            endInlineImage: 65,
            paintXObject: 66,
            markPoint: 67,
            markPointProps: 68,
            beginMarkedContent: 69,
            beginMarkedContentProps: 70,
            endMarkedContent: 71,
            beginCompat: 72,
            endCompat: 73,
            paintFormXObjectBegin: 74,
            paintFormXObjectEnd: 75,
            beginGroup: 76,
            endGroup: 77,
            beginAnnotations: 78,
            endAnnotations: 79,
            beginAnnotation: 80,
            endAnnotation: 81,
            paintJpegXObject: 82,
            paintImageMaskXObject: 83,
            paintImageMaskXObjectGroup: 84,
            paintImageXObject: 85,
            paintInlineImageXObject: 86,
            paintInlineImageXObjectGroup: 87,
            paintImageXObjectRepeat: 88,
            paintImageMaskXObjectRepeat: 89,
            paintSolidColorImageMask: 90,
            constructPath: 91,
          },
          verbosity = VERBOSITY_LEVELS.warnings,
          UNSUPPORTED_FEATURES = {
            unknown: "unknown",
            forms: "forms",
            javaScript: "javaScript",
            smask: "smask",
            shadingPattern: "shadingPattern",
            font: "font",
          },
          PasswordResponses = { NEED_PASSWORD: 1, INCORRECT_PASSWORD: 2 },
          PasswordException = (function () {
            function PasswordException(msg, code) {
              (this.name = "PasswordException"), (this.message = msg), (this.code = code);
            }
            return (
              (PasswordException.prototype = new Error()),
              (PasswordException.constructor = PasswordException),
              PasswordException
            );
          })(),
          UnknownErrorException = (function () {
            function UnknownErrorException(msg, details) {
              (this.name = "UnknownErrorException"), (this.message = msg), (this.details = details);
            }
            return (
              (UnknownErrorException.prototype = new Error()),
              (UnknownErrorException.constructor = UnknownErrorException),
              UnknownErrorException
            );
          })(),
          InvalidPDFException = (function () {
            function InvalidPDFException(msg) {
              (this.name = "InvalidPDFException"), (this.message = msg);
            }
            return (
              (InvalidPDFException.prototype = new Error()),
              (InvalidPDFException.constructor = InvalidPDFException),
              InvalidPDFException
            );
          })(),
          MissingPDFException = (function () {
            function MissingPDFException(msg) {
              (this.name = "MissingPDFException"), (this.message = msg);
            }
            return (
              (MissingPDFException.prototype = new Error()),
              (MissingPDFException.constructor = MissingPDFException),
              MissingPDFException
            );
          })(),
          UnexpectedResponseException = (function () {
            function UnexpectedResponseException(msg, status) {
              (this.name = "UnexpectedResponseException"), (this.message = msg), (this.status = status);
            }
            return (
              (UnexpectedResponseException.prototype = new Error()),
              (UnexpectedResponseException.constructor = UnexpectedResponseException),
              UnexpectedResponseException
            );
          })(),
          NotImplementedException = (function () {
            function NotImplementedException(msg) {
              this.message = msg;
            }
            return (
              (NotImplementedException.prototype = new Error()),
              (NotImplementedException.prototype.name = "NotImplementedException"),
              (NotImplementedException.constructor = NotImplementedException),
              NotImplementedException
            );
          })(),
          MissingDataException = (function () {
            function MissingDataException(begin, end) {
              (this.begin = begin), (this.end = end), (this.message = "Missing data [" + begin + ", " + end + ")");
            }
            return (
              (MissingDataException.prototype = new Error()),
              (MissingDataException.prototype.name = "MissingDataException"),
              (MissingDataException.constructor = MissingDataException),
              MissingDataException
            );
          })(),
          XRefParseException = (function () {
            function XRefParseException(msg) {
              this.message = msg;
            }
            return (
              (XRefParseException.prototype = new Error()),
              (XRefParseException.prototype.name = "XRefParseException"),
              (XRefParseException.constructor = XRefParseException),
              XRefParseException
            );
          })(),
          NullCharactersRegExp = /\x00/g,
          Uint32ArrayView = (function () {
            function Uint32ArrayView(buffer, length) {
              (this.buffer = buffer),
                (this.byteLength = buffer.length),
                (this.length = void 0 === length ? this.byteLength >> 2 : length),
                ensureUint32ArrayViewProps(this.length);
            }
            function createUint32ArrayProp(index) {
              return {
                get: function () {
                  var buffer = this.buffer,
                    offset = index << 2;
                  return (
                    (buffer[offset] |
                      (buffer[offset + 1] << 8) |
                      (buffer[offset + 2] << 16) |
                      (buffer[offset + 3] << 24)) >>>
                    0
                  );
                },
                set: function (value) {
                  var buffer = this.buffer,
                    offset = index << 2;
                  (buffer[offset] = 255 & value),
                    (buffer[offset + 1] = (value >> 8) & 255),
                    (buffer[offset + 2] = (value >> 16) & 255),
                    (buffer[offset + 3] = (value >>> 24) & 255);
                },
              };
            }
            function ensureUint32ArrayViewProps(length) {
              for (; uint32ArrayViewSetters < length; )
                Object.defineProperty(
                  Uint32ArrayView.prototype,
                  uint32ArrayViewSetters,
                  createUint32ArrayProp(uint32ArrayViewSetters)
                ),
                  uint32ArrayViewSetters++;
            }
            Uint32ArrayView.prototype = Object.create(null);
            var uint32ArrayViewSetters = 0;
            return Uint32ArrayView;
          })();
        exports.Uint32ArrayView = Uint32ArrayView;
        var IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0],
          Util = (function () {
            function Util() {}
            var rgbBuf = ["rgb(", 0, ",", 0, ",", 0, ")"];
            (Util.makeCssRgb = function (r, g, b) {
              return (rgbBuf[1] = r), (rgbBuf[3] = g), (rgbBuf[5] = b), rgbBuf.join("");
            }),
              (Util.transform = function (m1, m2) {
                return [
                  m1[0] * m2[0] + m1[2] * m2[1],
                  m1[1] * m2[0] + m1[3] * m2[1],
                  m1[0] * m2[2] + m1[2] * m2[3],
                  m1[1] * m2[2] + m1[3] * m2[3],
                  m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
                  m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
                ];
              }),
              (Util.applyTransform = function (p, m) {
                return [p[0] * m[0] + p[1] * m[2] + m[4], p[0] * m[1] + p[1] * m[3] + m[5]];
              }),
              (Util.applyInverseTransform = function (p, m) {
                var d = m[0] * m[3] - m[1] * m[2];
                return [
                  (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d,
                  (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d,
                ];
              }),
              (Util.getAxialAlignedBoundingBox = function (r, m) {
                var p1 = Util.applyTransform(r, m),
                  p2 = Util.applyTransform(r.slice(2, 4), m),
                  p3 = Util.applyTransform([r[0], r[3]], m),
                  p4 = Util.applyTransform([r[2], r[1]], m);
                return [
                  Math.min(p1[0], p2[0], p3[0], p4[0]),
                  Math.min(p1[1], p2[1], p3[1], p4[1]),
                  Math.max(p1[0], p2[0], p3[0], p4[0]),
                  Math.max(p1[1], p2[1], p3[1], p4[1]),
                ];
              }),
              (Util.inverseTransform = function (m) {
                var d = m[0] * m[3] - m[1] * m[2];
                return [
                  m[3] / d,
                  -m[1] / d,
                  -m[2] / d,
                  m[0] / d,
                  (m[2] * m[5] - m[4] * m[3]) / d,
                  (m[4] * m[1] - m[5] * m[0]) / d,
                ];
              }),
              (Util.apply3dTransform = function (m, v) {
                return [
                  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
                  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
                  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
                ];
              }),
              (Util.singularValueDecompose2dScale = function (m) {
                var transpose = [m[0], m[2], m[1], m[3]],
                  a = m[0] * transpose[0] + m[1] * transpose[2],
                  b = m[0] * transpose[1] + m[1] * transpose[3],
                  c = m[2] * transpose[0] + m[3] * transpose[2],
                  d = m[2] * transpose[1] + m[3] * transpose[3],
                  first = (a + d) / 2,
                  second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2,
                  sx = first + second || 1,
                  sy = first - second || 1;
                return [Math.sqrt(sx), Math.sqrt(sy)];
              }),
              (Util.normalizeRect = function (rect) {
                var r = rect.slice(0);
                return (
                  rect[0] > rect[2] && ((r[0] = rect[2]), (r[2] = rect[0])),
                  rect[1] > rect[3] && ((r[1] = rect[3]), (r[3] = rect[1])),
                  r
                );
              }),
              (Util.intersect = function (rect1, rect2) {
                function compare(a, b) {
                  return a - b;
                }
                var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare),
                  orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare),
                  result = [];
                return (
                  (rect1 = Util.normalizeRect(rect1)),
                  (rect2 = Util.normalizeRect(rect2)),
                  ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||
                    (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) &&
                    ((result[0] = orderedX[1]),
                    (result[2] = orderedX[2]),
                    ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||
                      (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) &&
                      ((result[1] = orderedY[1]), (result[3] = orderedY[2]), result))
                );
              }),
              (Util.sign = function (num) {
                return num < 0 ? -1 : 1;
              });
            var ROMAN_NUMBER_MAP = [
              "",
              "C",
              "CC",
              "CCC",
              "CD",
              "D",
              "DC",
              "DCC",
              "DCCC",
              "CM",
              "",
              "X",
              "XX",
              "XXX",
              "XL",
              "L",
              "LX",
              "LXX",
              "LXXX",
              "XC",
              "",
              "I",
              "II",
              "III",
              "IV",
              "V",
              "VI",
              "VII",
              "VIII",
              "IX",
            ];
            return (
              (Util.toRoman = function (number, lowerCase) {
                assert(isInt(number) && number > 0, "The number should be a positive integer.");
                for (var pos, romanBuf = []; number >= 1e3; ) (number -= 1e3), romanBuf.push("M");
                (pos = (number / 100) | 0),
                  (number %= 100),
                  romanBuf.push(ROMAN_NUMBER_MAP[pos]),
                  (pos = (number / 10) | 0),
                  (number %= 10),
                  romanBuf.push(ROMAN_NUMBER_MAP[10 + pos]),
                  romanBuf.push(ROMAN_NUMBER_MAP[20 + number]);
                var romanStr = romanBuf.join("");
                return lowerCase ? romanStr.toLowerCase() : romanStr;
              }),
              (Util.appendToArray = function (arr1, arr2) {
                Array.prototype.push.apply(arr1, arr2);
              }),
              (Util.prependToArray = function (arr1, arr2) {
                Array.prototype.unshift.apply(arr1, arr2);
              }),
              (Util.extendObj = function (obj1, obj2) {
                for (var key in obj2) obj1[key] = obj2[key];
              }),
              (Util.getInheritableProperty = function (dict, name) {
                for (; dict && !dict.has(name); ) dict = dict.get("Parent");
                return dict ? dict.get(name) : null;
              }),
              (Util.inherit = function (sub, base, prototype) {
                (sub.prototype = Object.create(base.prototype)), (sub.prototype.constructor = sub);
                for (var prop in prototype) sub.prototype[prop] = prototype[prop];
              }),
              (Util.loadScript = function (src, callback) {
                var script = document.createElement("script"),
                  loaded = !1;
                script.setAttribute("src", src),
                  callback &&
                    (script.onload = function () {
                      loaded || callback(), (loaded = !0);
                    }),
                  document.getElementsByTagName("head")[0].appendChild(script);
              }),
              Util
            );
          })(),
          PageViewport = (function () {
            function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {
              (this.viewBox = viewBox),
                (this.scale = scale),
                (this.rotation = rotation),
                (this.offsetX = offsetX),
                (this.offsetY = offsetY);
              var rotateA,
                rotateB,
                rotateC,
                rotateD,
                centerX = (viewBox[2] + viewBox[0]) / 2,
                centerY = (viewBox[3] + viewBox[1]) / 2;
              switch (((rotation %= 360), (rotation = rotation < 0 ? rotation + 360 : rotation))) {
                case 180:
                  (rotateA = -1), (rotateB = 0), (rotateC = 0), (rotateD = 1);
                  break;
                case 90:
                  (rotateA = 0), (rotateB = 1), (rotateC = 1), (rotateD = 0);
                  break;
                case 270:
                  (rotateA = 0), (rotateB = -1), (rotateC = -1), (rotateD = 0);
                  break;
                default:
                  (rotateA = 1), (rotateB = 0), (rotateC = 0), (rotateD = -1);
              }
              dontFlip && ((rotateC = -rotateC), (rotateD = -rotateD));
              var offsetCanvasX, offsetCanvasY, width, height;
              0 === rotateA
                ? ((offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX),
                  (offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY),
                  (width = Math.abs(viewBox[3] - viewBox[1]) * scale),
                  (height = Math.abs(viewBox[2] - viewBox[0]) * scale))
                : ((offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX),
                  (offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY),
                  (width = Math.abs(viewBox[2] - viewBox[0]) * scale),
                  (height = Math.abs(viewBox[3] - viewBox[1]) * scale)),
                (this.transform = [
                  rotateA * scale,
                  rotateB * scale,
                  rotateC * scale,
                  rotateD * scale,
                  offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
                  offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY,
                ]),
                (this.width = width),
                (this.height = height),
                (this.fontScale = scale);
            }
            return (
              (PageViewport.prototype = {
                clone: function (args) {
                  args = args || {};
                  var scale = "scale" in args ? args.scale : this.scale,
                    rotation = "rotation" in args ? args.rotation : this.rotation;
                  return new PageViewport(
                    this.viewBox.slice(),
                    scale,
                    rotation,
                    this.offsetX,
                    this.offsetY,
                    args.dontFlip
                  );
                },
                convertToViewportPoint: function (x, y) {
                  return Util.applyTransform([x, y], this.transform);
                },
                convertToViewportRectangle: function (rect) {
                  var tl = Util.applyTransform([rect[0], rect[1]], this.transform),
                    br = Util.applyTransform([rect[2], rect[3]], this.transform);
                  return [tl[0], tl[1], br[0], br[1]];
                },
                convertToPdfPoint: function (x, y) {
                  return Util.applyInverseTransform([x, y], this.transform);
                },
              }),
              PageViewport
            );
          })(),
          PDFStringTranslateTable = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            728,
            711,
            710,
            729,
            733,
            731,
            730,
            732,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            8226,
            8224,
            8225,
            8230,
            8212,
            8211,
            402,
            8260,
            8249,
            8250,
            8722,
            8240,
            8222,
            8220,
            8221,
            8216,
            8217,
            8218,
            8482,
            64257,
            64258,
            321,
            338,
            352,
            376,
            381,
            305,
            322,
            339,
            353,
            382,
            0,
            8364,
          ];
        !(function () {
          function Promise(resolver) {
            (this._status = STATUS_PENDING), (this._handlers = []);
            try {
              resolver.call(this, this._resolve.bind(this), this._reject.bind(this));
            } catch (e) {
              this._reject(e);
            }
          }
          if (globalScope.Promise)
            return (
              "function" != typeof globalScope.Promise.all &&
                (globalScope.Promise.all = function (iterable) {
                  var resolve,
                    reject,
                    count = 0,
                    results = [],
                    promise = new globalScope.Promise(function (resolve_, reject_) {
                      (resolve = resolve_), (reject = reject_);
                    });
                  return (
                    iterable.forEach(function (p, i) {
                      count++,
                        p.then(function (result) {
                          (results[i] = result), 0 === --count && resolve(results);
                        }, reject);
                    }),
                    0 === count && resolve(results),
                    promise
                  );
                }),
              "function" != typeof globalScope.Promise.resolve &&
                (globalScope.Promise.resolve = function (value) {
                  return new globalScope.Promise(function (resolve) {
                    resolve(value);
                  });
                }),
              "function" != typeof globalScope.Promise.reject &&
                (globalScope.Promise.reject = function (reason) {
                  return new globalScope.Promise(function (resolve, reject) {
                    reject(reason);
                  });
                }),
              void (
                "function" != typeof globalScope.Promise.prototype.catch &&
                (globalScope.Promise.prototype.catch = function (onReject) {
                  return globalScope.Promise.prototype.then(void 0, onReject);
                })
              )
            );
          var STATUS_PENDING = 0,
            STATUS_REJECTED = 2,
            HandlerManager = {
              handlers: [],
              running: !1,
              unhandledRejections: [],
              pendingRejectionCheck: !1,
              scheduleHandlers: function (promise) {
                promise._status !== STATUS_PENDING &&
                  ((this.handlers = this.handlers.concat(promise._handlers)),
                  (promise._handlers = []),
                  this.running || ((this.running = !0), setTimeout(this.runHandlers.bind(this), 0)));
              },
              runHandlers: function () {
                for (var timeoutAt = Date.now() + 1; this.handlers.length > 0; ) {
                  var handler = this.handlers.shift(),
                    nextStatus = handler.thisPromise._status,
                    nextValue = handler.thisPromise._value;
                  try {
                    1 === nextStatus
                      ? "function" == typeof handler.onResolve && (nextValue = handler.onResolve(nextValue))
                      : "function" == typeof handler.onReject &&
                        ((nextValue = handler.onReject(nextValue)),
                        (nextStatus = 1),
                        handler.thisPromise._unhandledRejection && this.removeUnhandeledRejection(handler.thisPromise));
                  } catch (ex) {
                    (nextStatus = STATUS_REJECTED), (nextValue = ex);
                  }
                  if ((handler.nextPromise._updateStatus(nextStatus, nextValue), Date.now() >= timeoutAt)) break;
                }
                if (this.handlers.length > 0) return void setTimeout(this.runHandlers.bind(this), 0);
                this.running = !1;
              },
              addUnhandledRejection: function (promise) {
                this.unhandledRejections.push({ promise: promise, time: Date.now() }), this.scheduleRejectionCheck();
              },
              removeUnhandeledRejection: function (promise) {
                promise._unhandledRejection = !1;
                for (var i = 0; i < this.unhandledRejections.length; i++)
                  this.unhandledRejections[i].promise === promise && (this.unhandledRejections.splice(i), i--);
              },
              scheduleRejectionCheck: function () {
                this.pendingRejectionCheck ||
                  ((this.pendingRejectionCheck = !0),
                  setTimeout(
                    function () {
                      this.pendingRejectionCheck = !1;
                      for (var now = Date.now(), i = 0; i < this.unhandledRejections.length; i++)
                        if (now - this.unhandledRejections[i].time > 500) {
                          var unhandled = this.unhandledRejections[i].promise._value,
                            msg = "Unhandled rejection: " + unhandled;
                          unhandled.stack && (msg += "\n" + unhandled.stack),
                            warn(msg),
                            this.unhandledRejections.splice(i),
                            i--;
                        }
                      this.unhandledRejections.length && this.scheduleRejectionCheck();
                    }.bind(this),
                    500
                  ));
              },
            };
          (Promise.all = function (promises) {
            function reject(reason) {
              deferred._status !== STATUS_REJECTED && ((results = []), rejectAll(reason));
            }
            var resolveAll,
              rejectAll,
              deferred = new Promise(function (resolve, reject) {
                (resolveAll = resolve), (rejectAll = reject);
              }),
              unresolved = promises.length,
              results = [];
            if (0 === unresolved) return resolveAll(results), deferred;
            for (var i = 0, ii = promises.length; i < ii; ++i) {
              var promise = promises[i],
                resolve = (function (i) {
                  return function (value) {
                    deferred._status !== STATUS_REJECTED &&
                      ((results[i] = value), 0 === --unresolved && resolveAll(results));
                  };
                })(i);
              Promise.isPromise(promise) ? promise.then(resolve, reject) : resolve(promise);
            }
            return deferred;
          }),
            (Promise.isPromise = function (value) {
              return value && "function" == typeof value.then;
            }),
            (Promise.resolve = function (value) {
              return new Promise(function (resolve) {
                resolve(value);
              });
            }),
            (Promise.reject = function (reason) {
              return new Promise(function (resolve, reject) {
                reject(reason);
              });
            }),
            (Promise.prototype = {
              _status: null,
              _value: null,
              _handlers: null,
              _unhandledRejection: null,
              _updateStatus: function (status, value) {
                if (1 !== this._status && this._status !== STATUS_REJECTED) {
                  if (1 === status && Promise.isPromise(value))
                    return void value.then(
                      this._updateStatus.bind(this, 1),
                      this._updateStatus.bind(this, STATUS_REJECTED)
                    );
                  (this._status = status),
                    (this._value = value),
                    status === STATUS_REJECTED &&
                      0 === this._handlers.length &&
                      ((this._unhandledRejection = !0), HandlerManager.addUnhandledRejection(this)),
                    HandlerManager.scheduleHandlers(this);
                }
              },
              _resolve: function (value) {
                this._updateStatus(1, value);
              },
              _reject: function (reason) {
                this._updateStatus(STATUS_REJECTED, reason);
              },
              then: function (onResolve, onReject) {
                var nextPromise = new Promise(function (resolve, reject) {
                  (this.resolve = resolve), (this.reject = reject);
                });
                return (
                  this._handlers.push({
                    thisPromise: this,
                    onResolve: onResolve,
                    onReject: onReject,
                    nextPromise: nextPromise,
                  }),
                  HandlerManager.scheduleHandlers(this),
                  nextPromise
                );
              },
              catch: function (onReject) {
                return this.then(void 0, onReject);
              },
            }),
            (globalScope.Promise = Promise);
        })(),
          (function () {
            function WeakMap() {
              this.id = "$weakmap" + id++;
            }
            if (!globalScope.WeakMap) {
              var id = 0;
              (WeakMap.prototype = {
                has: function (obj) {
                  return !!Object.getOwnPropertyDescriptor(obj, this.id);
                },
                get: function (obj, defaultValue) {
                  return this.has(obj) ? obj[this.id] : defaultValue;
                },
                set: function (obj, value) {
                  Object.defineProperty(obj, this.id, { value: value, enumerable: !1, configurable: !0 });
                },
                delete: function (obj) {
                  delete obj[this.id];
                },
              }),
                (globalScope.WeakMap = WeakMap);
            }
          })();
        var StatTimer = (function () {
            function rpad(str, pad, length) {
              for (; str.length < length; ) str += pad;
              return str;
            }
            function StatTimer() {
              (this.started = Object.create(null)), (this.times = []), (this.enabled = !0);
            }
            return (
              (StatTimer.prototype = {
                time: function (name) {
                  this.enabled &&
                    (name in this.started && warn("Timer is already running for " + name),
                    (this.started[name] = Date.now()));
                },
                timeEnd: function (name) {
                  this.enabled &&
                    (name in this.started || warn("Timer has not been started for " + name),
                    this.times.push({ name: name, start: this.started[name], end: Date.now() }),
                    delete this.started[name]);
                },
                toString: function () {
                  var i,
                    ii,
                    times = this.times,
                    out = "",
                    longest = 0;
                  for (i = 0, ii = times.length; i < ii; ++i) {
                    var name = times[i].name;
                    name.length > longest && (longest = name.length);
                  }
                  for (i = 0, ii = times.length; i < ii; ++i) {
                    var span = times[i],
                      duration = span.end - span.start;
                    out += rpad(span.name, " ", longest) + " " + duration + "ms\n";
                  }
                  return out;
                },
              }),
              StatTimer
            );
          })(),
          createBlob = function (data, contentType) {
            if ("undefined" != typeof Blob) return new Blob([data], { type: contentType });
            warn('The "Blob" constructor is not supported.');
          },
          createObjectURL = (function () {
            var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            return function (data, contentType, forceDataSchema) {
              if (!forceDataSchema && "undefined" != typeof URL && URL.createObjectURL) {
                var blob = createBlob(data, contentType);
                return URL.createObjectURL(blob);
              }
              for (var buffer = "data:" + contentType + ";base64,", i = 0, ii = data.length; i < ii; i += 3) {
                var b1 = 255 & data[i],
                  b2 = 255 & data[i + 1],
                  b3 = 255 & data[i + 2];
                buffer +=
                  digits[b1 >> 2] +
                  digits[((3 & b1) << 4) | (b2 >> 4)] +
                  digits[i + 1 < ii ? ((15 & b2) << 2) | (b3 >> 6) : 64] +
                  digits[i + 2 < ii ? 63 & b3 : 64];
              }
              return buffer;
            };
          })();
        (MessageHandler.prototype = {
          on: function (actionName, handler, scope) {
            var ah = this.actionHandler;
            ah[actionName] && error('There is already an actionName called "' + actionName + '"'),
              (ah[actionName] = [handler, scope]);
          },
          send: function (actionName, data, transfers) {
            var message = { sourceName: this.sourceName, targetName: this.targetName, action: actionName, data: data };
            this.postMessage(message, transfers);
          },
          sendWithPromise: function (actionName, data, transfers) {
            var callbackId = this.callbackIndex++,
              message = {
                sourceName: this.sourceName,
                targetName: this.targetName,
                action: actionName,
                data: data,
                callbackId: callbackId,
              },
              capability = createPromiseCapability();
            this.callbacksCapabilities[callbackId] = capability;
            try {
              this.postMessage(message, transfers);
            } catch (e) {
              capability.reject(e);
            }
            return capability.promise;
          },
          postMessage: function (message, transfers) {
            transfers && this.postMessageTransfers
              ? this.comObj.postMessage(message, transfers)
              : this.comObj.postMessage(message);
          },
          destroy: function () {
            this.comObj.removeEventListener("message", this._onComObjOnMessage);
          },
        }),
          (function (scope) {
            function isRelativeScheme(scheme) {
              return void 0 !== relative[scheme];
            }
            function invalid() {
              clear.call(this), (this._isInvalid = !0);
            }
            function IDNAToASCII(h) {
              return "" === h && invalid.call(this), h.toLowerCase();
            }
            function percentEscape(c) {
              var unicode = c.charCodeAt(0);
              return unicode > 32 && unicode < 127 && -1 === [34, 35, 60, 62, 63, 96].indexOf(unicode)
                ? c
                : encodeURIComponent(c);
            }
            function percentEscapeQuery(c) {
              var unicode = c.charCodeAt(0);
              return unicode > 32 && unicode < 127 && -1 === [34, 35, 60, 62, 96].indexOf(unicode)
                ? c
                : encodeURIComponent(c);
            }
            function parse(input, stateOverride, base) {
              function err(message) {
                errors.push(message);
              }
              var state = stateOverride || "scheme start",
                cursor = 0,
                buffer = "",
                seenAt = !1,
                seenBracket = !1,
                errors = [];
              loop: for (; (input[cursor - 1] !== EOF || 0 === cursor) && !this._isInvalid; ) {
                var c = input[cursor];
                switch (state) {
                  case "scheme start":
                    if (!c || !ALPHA.test(c)) {
                      if (stateOverride) {
                        err("Invalid scheme.");
                        break loop;
                      }
                      (buffer = ""), (state = "no scheme");
                      continue;
                    }
                    (buffer += c.toLowerCase()), (state = "scheme");
                    break;
                  case "scheme":
                    if (c && ALPHANUMERIC.test(c)) buffer += c.toLowerCase();
                    else {
                      if (":" !== c) {
                        if (stateOverride) {
                          if (EOF === c) break loop;
                          err("Code point not allowed in scheme: " + c);
                          break loop;
                        }
                        (buffer = ""), (cursor = 0), (state = "no scheme");
                        continue;
                      }
                      if (((this._scheme = buffer), (buffer = ""), stateOverride)) break loop;
                      isRelativeScheme(this._scheme) && (this._isRelative = !0),
                        (state =
                          "file" === this._scheme
                            ? "relative"
                            : this._isRelative && base && base._scheme === this._scheme
                            ? "relative or authority"
                            : this._isRelative
                            ? "authority first slash"
                            : "scheme data");
                    }
                    break;
                  case "scheme data":
                    "?" === c
                      ? ((this._query = "?"), (state = "query"))
                      : "#" === c
                      ? ((this._fragment = "#"), (state = "fragment"))
                      : EOF !== c && "\t" !== c && "\n" !== c && "\r" !== c && (this._schemeData += percentEscape(c));
                    break;
                  case "no scheme":
                    if (base && isRelativeScheme(base._scheme)) {
                      state = "relative";
                      continue;
                    }
                    err("Missing scheme."), invalid.call(this);
                    break;
                  case "relative or authority":
                    if ("/" !== c || "/" !== input[cursor + 1]) {
                      err("Expected /, got: " + c), (state = "relative");
                      continue;
                    }
                    state = "authority ignore slashes";
                    break;
                  case "relative":
                    if (
                      ((this._isRelative = !0), "file" !== this._scheme && (this._scheme = base._scheme), EOF === c)
                    ) {
                      (this._host = base._host),
                        (this._port = base._port),
                        (this._path = base._path.slice()),
                        (this._query = base._query),
                        (this._username = base._username),
                        (this._password = base._password);
                      break loop;
                    }
                    if ("/" === c || "\\" === c)
                      "\\" === c && err("\\ is an invalid code point."), (state = "relative slash");
                    else if ("?" === c)
                      (this._host = base._host),
                        (this._port = base._port),
                        (this._path = base._path.slice()),
                        (this._query = "?"),
                        (this._username = base._username),
                        (this._password = base._password),
                        (state = "query");
                    else {
                      if ("#" !== c) {
                        var nextC = input[cursor + 1],
                          nextNextC = input[cursor + 2];
                        ("file" !== this._scheme ||
                          !ALPHA.test(c) ||
                          (":" !== nextC && "|" !== nextC) ||
                          (EOF !== nextNextC &&
                            "/" !== nextNextC &&
                            "\\" !== nextNextC &&
                            "?" !== nextNextC &&
                            "#" !== nextNextC)) &&
                          ((this._host = base._host),
                          (this._port = base._port),
                          (this._username = base._username),
                          (this._password = base._password),
                          (this._path = base._path.slice()),
                          this._path.pop()),
                          (state = "relative path");
                        continue;
                      }
                      (this._host = base._host),
                        (this._port = base._port),
                        (this._path = base._path.slice()),
                        (this._query = base._query),
                        (this._fragment = "#"),
                        (this._username = base._username),
                        (this._password = base._password),
                        (state = "fragment");
                    }
                    break;
                  case "relative slash":
                    if ("/" !== c && "\\" !== c) {
                      "file" !== this._scheme &&
                        ((this._host = base._host),
                        (this._port = base._port),
                        (this._username = base._username),
                        (this._password = base._password)),
                        (state = "relative path");
                      continue;
                    }
                    "\\" === c && err("\\ is an invalid code point."),
                      (state = "file" === this._scheme ? "file host" : "authority ignore slashes");
                    break;
                  case "authority first slash":
                    if ("/" !== c) {
                      err("Expected '/', got: " + c), (state = "authority ignore slashes");
                      continue;
                    }
                    state = "authority second slash";
                    break;
                  case "authority second slash":
                    if (((state = "authority ignore slashes"), "/" !== c)) {
                      err("Expected '/', got: " + c);
                      continue;
                    }
                    break;
                  case "authority ignore slashes":
                    if ("/" !== c && "\\" !== c) {
                      state = "authority";
                      continue;
                    }
                    err("Expected authority, got: " + c);
                    break;
                  case "authority":
                    if ("@" === c) {
                      seenAt && (err("@ already seen."), (buffer += "%40")), (seenAt = !0);
                      for (var i = 0; i < buffer.length; i++) {
                        var cp = buffer[i];
                        if ("\t" !== cp && "\n" !== cp && "\r" !== cp)
                          if (":" !== cp || null !== this._password) {
                            var tempC = percentEscape(cp);
                            null !== this._password ? (this._password += tempC) : (this._username += tempC);
                          } else this._password = "";
                        else err("Invalid whitespace in authority.");
                      }
                      buffer = "";
                    } else {
                      if (EOF === c || "/" === c || "\\" === c || "?" === c || "#" === c) {
                        (cursor -= buffer.length), (buffer = ""), (state = "host");
                        continue;
                      }
                      buffer += c;
                    }
                    break;
                  case "file host":
                    if (EOF === c || "/" === c || "\\" === c || "?" === c || "#" === c) {
                      2 !== buffer.length || !ALPHA.test(buffer[0]) || (":" !== buffer[1] && "|" !== buffer[1])
                        ? 0 === buffer.length
                          ? (state = "relative path start")
                          : ((this._host = IDNAToASCII.call(this, buffer)),
                            (buffer = ""),
                            (state = "relative path start"))
                        : (state = "relative path");
                      continue;
                    }
                    "\t" === c || "\n" === c || "\r" === c ? err("Invalid whitespace in file host.") : (buffer += c);
                    break;
                  case "host":
                  case "hostname":
                    if (":" !== c || seenBracket) {
                      if (EOF === c || "/" === c || "\\" === c || "?" === c || "#" === c) {
                        if (
                          ((this._host = IDNAToASCII.call(this, buffer)),
                          (buffer = ""),
                          (state = "relative path start"),
                          stateOverride)
                        )
                          break loop;
                        continue;
                      }
                      "\t" !== c && "\n" !== c && "\r" !== c
                        ? ("[" === c ? (seenBracket = !0) : "]" === c && (seenBracket = !1), (buffer += c))
                        : err("Invalid code point in host/hostname: " + c);
                    } else if (
                      ((this._host = IDNAToASCII.call(this, buffer)),
                      (buffer = ""),
                      (state = "port"),
                      "hostname" === stateOverride)
                    )
                      break loop;
                    break;
                  case "port":
                    if (/[0-9]/.test(c)) buffer += c;
                    else {
                      if (EOF === c || "/" === c || "\\" === c || "?" === c || "#" === c || stateOverride) {
                        if ("" !== buffer) {
                          var temp = parseInt(buffer, 10);
                          temp !== relative[this._scheme] && (this._port = temp + ""), (buffer = "");
                        }
                        if (stateOverride) break loop;
                        state = "relative path start";
                        continue;
                      }
                      "\t" === c || "\n" === c || "\r" === c
                        ? err("Invalid code point in port: " + c)
                        : invalid.call(this);
                    }
                    break;
                  case "relative path start":
                    if (
                      ("\\" === c && err("'\\' not allowed in path."),
                      (state = "relative path"),
                      "/" !== c && "\\" !== c)
                    )
                      continue;
                    break;
                  case "relative path":
                    if (EOF !== c && "/" !== c && "\\" !== c && (stateOverride || ("?" !== c && "#" !== c)))
                      "\t" !== c && "\n" !== c && "\r" !== c && (buffer += percentEscape(c));
                    else {
                      "\\" === c && err("\\ not allowed in relative path.");
                      var tmp;
                      (tmp = relativePathDotMapping[buffer.toLowerCase()]) && (buffer = tmp),
                        ".." === buffer
                          ? (this._path.pop(), "/" !== c && "\\" !== c && this._path.push(""))
                          : "." === buffer && "/" !== c && "\\" !== c
                          ? this._path.push("")
                          : "." !== buffer &&
                            ("file" === this._scheme &&
                              0 === this._path.length &&
                              2 === buffer.length &&
                              ALPHA.test(buffer[0]) &&
                              "|" === buffer[1] &&
                              (buffer = buffer[0] + ":"),
                            this._path.push(buffer)),
                        (buffer = ""),
                        "?" === c
                          ? ((this._query = "?"), (state = "query"))
                          : "#" === c && ((this._fragment = "#"), (state = "fragment"));
                    }
                    break;
                  case "query":
                    stateOverride || "#" !== c
                      ? EOF !== c && "\t" !== c && "\n" !== c && "\r" !== c && (this._query += percentEscapeQuery(c))
                      : ((this._fragment = "#"), (state = "fragment"));
                    break;
                  case "fragment":
                    EOF !== c && "\t" !== c && "\n" !== c && "\r" !== c && (this._fragment += c);
                }
                cursor++;
              }
            }
            function clear() {
              (this._scheme = ""),
                (this._schemeData = ""),
                (this._username = ""),
                (this._password = null),
                (this._host = ""),
                (this._port = ""),
                (this._path = []),
                (this._query = ""),
                (this._fragment = ""),
                (this._isInvalid = !1),
                (this._isRelative = !1);
            }
            function JURL(url, base) {
              void 0 === base || base instanceof JURL || (base = new JURL(String(base))),
                (this._url = url),
                clear.call(this);
              var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, "");
              parse.call(this, input, null, base);
            }
            var hasWorkingUrl = !1;
            try {
              if ("function" == typeof URL && "object" == typeof URL.prototype && "origin" in URL.prototype) {
                var u = new URL("b", "http://a");
                (u.pathname = "c%20d"), (hasWorkingUrl = "http://a/c%20d" === u.href);
              }
            } catch (e) {}
            if (!hasWorkingUrl) {
              var relative = Object.create(null);
              (relative.ftp = 21),
                (relative.file = 0),
                (relative.gopher = 70),
                (relative.http = 80),
                (relative.https = 443),
                (relative.ws = 80),
                (relative.wss = 443);
              var relativePathDotMapping = Object.create(null);
              (relativePathDotMapping["%2e"] = "."),
                (relativePathDotMapping[".%2e"] = ".."),
                (relativePathDotMapping["%2e."] = ".."),
                (relativePathDotMapping["%2e%2e"] = "..");
              var EOF,
                ALPHA = /[a-zA-Z]/,
                ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;
              JURL.prototype = {
                toString: function () {
                  return this.href;
                },
                get href() {
                  if (this._isInvalid) return this._url;
                  var authority = "";
                  return (
                    ("" === this._username && null === this._password) ||
                      (authority = this._username + (null !== this._password ? ":" + this._password : "") + "@"),
                    this.protocol +
                      (this._isRelative ? "//" + authority + this.host : "") +
                      this.pathname +
                      this._query +
                      this._fragment
                  );
                },
                set href(href) {
                  clear.call(this), parse.call(this, href);
                },
                get protocol() {
                  return this._scheme + ":";
                },
                set protocol(protocol) {
                  this._isInvalid || parse.call(this, protocol + ":", "scheme start");
                },
                get host() {
                  return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host;
                },
                set host(host) {
                  !this._isInvalid && this._isRelative && parse.call(this, host, "host");
                },
                get hostname() {
                  return this._host;
                },
                set hostname(hostname) {
                  !this._isInvalid && this._isRelative && parse.call(this, hostname, "hostname");
                },
                get port() {
                  return this._port;
                },
                set port(port) {
                  !this._isInvalid && this._isRelative && parse.call(this, port, "port");
                },
                get pathname() {
                  return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData;
                },
                set pathname(pathname) {
                  !this._isInvalid &&
                    this._isRelative &&
                    ((this._path = []), parse.call(this, pathname, "relative path start"));
                },
                get search() {
                  return this._isInvalid || !this._query || "?" === this._query ? "" : this._query;
                },
                set search(search) {
                  !this._isInvalid &&
                    this._isRelative &&
                    ((this._query = "?"),
                    "?" === search[0] && (search = search.slice(1)),
                    parse.call(this, search, "query"));
                },
                get hash() {
                  return this._isInvalid || !this._fragment || "#" === this._fragment ? "" : this._fragment;
                },
                set hash(hash) {
                  this._isInvalid ||
                    ((this._fragment = "#"),
                    "#" === hash[0] && (hash = hash.slice(1)),
                    parse.call(this, hash, "fragment"));
                },
                get origin() {
                  var host;
                  if (this._isInvalid || !this._scheme) return "";
                  switch (this._scheme) {
                    case "data":
                    case "file":
                    case "javascript":
                    case "mailto":
                      return "null";
                  }
                  return (host = this.host), host ? this._scheme + "://" + host : "";
                },
              };
              var OriginalURL = scope.URL;
              OriginalURL &&
                ((JURL.createObjectURL = function (blob) {
                  return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
                }),
                (JURL.revokeObjectURL = function (url) {
                  OriginalURL.revokeObjectURL(url);
                })),
                (scope.URL = JURL);
            }
          })(globalScope),
          (exports.FONT_IDENTITY_MATRIX = FONT_IDENTITY_MATRIX),
          (exports.IDENTITY_MATRIX = IDENTITY_MATRIX),
          (exports.OPS = OPS),
          (exports.VERBOSITY_LEVELS = VERBOSITY_LEVELS),
          (exports.UNSUPPORTED_FEATURES = UNSUPPORTED_FEATURES),
          (exports.AnnotationBorderStyleType = AnnotationBorderStyleType),
          (exports.AnnotationFieldFlag = AnnotationFieldFlag),
          (exports.AnnotationFlag = AnnotationFlag),
          (exports.AnnotationType = AnnotationType),
          (exports.FontType = FontType),
          (exports.ImageKind = ImageKind),
          (exports.InvalidPDFException = InvalidPDFException),
          (exports.MessageHandler = MessageHandler),
          (exports.MissingDataException = MissingDataException),
          (exports.MissingPDFException = MissingPDFException),
          (exports.NotImplementedException = NotImplementedException),
          (exports.PageViewport = PageViewport),
          (exports.PasswordException = PasswordException),
          (exports.PasswordResponses = PasswordResponses),
          (exports.StatTimer = StatTimer),
          (exports.StreamType = StreamType),
          (exports.TextRenderingMode = TextRenderingMode),
          (exports.UnexpectedResponseException = UnexpectedResponseException),
          (exports.UnknownErrorException = UnknownErrorException),
          (exports.Util = Util),
          (exports.XRefParseException = XRefParseException),
          (exports.arrayByteLength = arrayByteLength),
          (exports.arraysToBytes = arraysToBytes),
          (exports.assert = assert),
          (exports.bytesToString = bytesToString),
          (exports.createBlob = createBlob),
          (exports.createPromiseCapability = createPromiseCapability),
          (exports.createObjectURL = createObjectURL),
          (exports.deprecated = deprecated),
          (exports.error = error),
          (exports.getLookupTableFactory = getLookupTableFactory),
          (exports.getVerbosityLevel = getVerbosityLevel),
          (exports.globalScope = globalScope),
          (exports.info = info),
          (exports.isArray = isArray),
          (exports.isArrayBuffer = isArrayBuffer),
          (exports.isBool = isBool),
          (exports.isEmptyObj = isEmptyObj),
          (exports.isInt = isInt),
          (exports.isNum = isNum),
          (exports.isString = isString),
          (exports.isSpace = isSpace),
          (exports.isSameOrigin = isSameOrigin),
          (exports.isValidUrl = isValidUrl),
          (exports.isLittleEndian = isLittleEndian),
          (exports.isEvalSupported = isEvalSupported),
          (exports.loadJpegStream = loadJpegStream),
          (exports.log2 = log2),
          (exports.readInt8 = readInt8),
          (exports.readUint16 = readUint16),
          (exports.readUint32 = readUint32),
          (exports.removeNullCharacters = removeNullCharacters),
          (exports.setVerbosityLevel = setVerbosityLevel),
          (exports.shadow = shadow),
          (exports.string32 = string32),
          (exports.stringToBytes = stringToBytes),
          (exports.stringToPDFString = stringToPDFString),
          (exports.stringToUTF8String = stringToUTF8String),
          (exports.utf8StringToString = utf8StringToString),
          (exports.warn = warn);
      })((root.pdfjsSharedUtil = {}));
    })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil) {
          function hasCanvasTypedArrays() {
            var canvas = document.createElement("canvas");
            return (
              (canvas.width = canvas.height = 1), void 0 !== canvas.getContext("2d").createImageData(1, 1).data.buffer
            );
          }
          function addLinkAttributes(link, params) {
            var url = params && params.url;
            if (((link.href = link.title = url ? removeNullCharacters(url) : ""), url)) {
              var target = params.target;
              void 0 === target && (target = getDefaultSetting("externalLinkTarget")),
                (link.target = LinkTargetStringMap[target]);
              var rel = params.rel;
              void 0 === rel && (rel = getDefaultSetting("externalLinkRel")), (link.rel = rel);
            }
          }
          function getFilenameFromUrl(url) {
            var anchor = url.indexOf("#"),
              query = url.indexOf("?"),
              end = Math.min(anchor > 0 ? anchor : url.length, query > 0 ? query : url.length);
            return url.substring(url.lastIndexOf("/", end) + 1, end);
          }
          function getDefaultSetting(id) {
            var globalSettings = sharedUtil.globalScope.PDFJS;
            switch (id) {
              case "pdfBug":
                return !!globalSettings && globalSettings.pdfBug;
              case "disableAutoFetch":
                return !!globalSettings && globalSettings.disableAutoFetch;
              case "disableStream":
                return !!globalSettings && globalSettings.disableStream;
              case "disableRange":
                return !!globalSettings && globalSettings.disableRange;
              case "disableFontFace":
                return !!globalSettings && globalSettings.disableFontFace;
              case "disableCreateObjectURL":
                return !!globalSettings && globalSettings.disableCreateObjectURL;
              case "disableWebGL":
                return !globalSettings || globalSettings.disableWebGL;
              case "cMapUrl":
                return globalSettings ? globalSettings.cMapUrl : null;
              case "cMapPacked":
                return !!globalSettings && globalSettings.cMapPacked;
              case "postMessageTransfers":
                return !globalSettings || globalSettings.postMessageTransfers;
              case "workerSrc":
                return globalSettings ? globalSettings.workerSrc : null;
              case "disableWorker":
                return !!globalSettings && globalSettings.disableWorker;
              case "maxImageSize":
                return globalSettings ? globalSettings.maxImageSize : -1;
              case "imageResourcesPath":
                return globalSettings ? globalSettings.imageResourcesPath : "";
              case "isEvalSupported":
                return !globalSettings || globalSettings.isEvalSupported;
              case "externalLinkTarget":
                if (!globalSettings) return LinkTarget.NONE;
                switch (globalSettings.externalLinkTarget) {
                  case LinkTarget.NONE:
                  case LinkTarget.SELF:
                  case LinkTarget.BLANK:
                  case LinkTarget.PARENT:
                  case LinkTarget.TOP:
                    return globalSettings.externalLinkTarget;
                }
                return (
                  warn("PDFJS.externalLinkTarget is invalid: " + globalSettings.externalLinkTarget),
                  (globalSettings.externalLinkTarget = LinkTarget.NONE),
                  LinkTarget.NONE
                );
              case "externalLinkRel":
                return globalSettings ? globalSettings.externalLinkRel : "noreferrer";
              case "enableStats":
                return !(!globalSettings || !globalSettings.enableStats);
              default:
                throw new Error("Unknown default setting: " + id);
            }
          }
          function isExternalLinkTargetSet() {
            switch (getDefaultSetting("externalLinkTarget")) {
              case LinkTarget.NONE:
                return !1;
              case LinkTarget.SELF:
              case LinkTarget.BLANK:
              case LinkTarget.PARENT:
              case LinkTarget.TOP:
                return !0;
            }
          }
          var removeNullCharacters = sharedUtil.removeNullCharacters,
            warn = sharedUtil.warn,
            CustomStyle = (function () {
              function CustomStyle() {}
              var prefixes = ["ms", "Moz", "Webkit", "O"],
                _cache = Object.create(null);
              return (
                (CustomStyle.getProp = function (propName, element) {
                  if (1 === arguments.length && "string" == typeof _cache[propName]) return _cache[propName];
                  element = element || document.documentElement;
                  var prefixed,
                    uPropName,
                    style = element.style;
                  if ("string" == typeof style[propName]) return (_cache[propName] = propName);
                  uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);
                  for (var i = 0, l = prefixes.length; i < l; i++)
                    if (((prefixed = prefixes[i] + uPropName), "string" == typeof style[prefixed]))
                      return (_cache[propName] = prefixed);
                  return (_cache[propName] = "undefined");
                }),
                (CustomStyle.setProp = function (propName, element, str) {
                  var prop = this.getProp(propName);
                  "undefined" !== prop && (element.style[prop] = str);
                }),
                CustomStyle
              );
            })(),
            LinkTarget = { NONE: 0, SELF: 1, BLANK: 2, PARENT: 3, TOP: 4 },
            LinkTargetStringMap = ["", "_self", "_blank", "_parent", "_top"];
          (exports.CustomStyle = CustomStyle),
            (exports.addLinkAttributes = addLinkAttributes),
            (exports.isExternalLinkTargetSet = isExternalLinkTargetSet),
            (exports.getFilenameFromUrl = getFilenameFromUrl),
            (exports.LinkTarget = LinkTarget),
            (exports.hasCanvasTypedArrays = hasCanvasTypedArrays),
            (exports.getDefaultSetting = getDefaultSetting);
        })((root.pdfjsDisplayDOMUtils = {}), root.pdfjsSharedUtil);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil) {
          function FontLoader(docId) {
            (this.docId = docId),
              (this.styleElement = null),
              (this.nativeFontFaces = []),
              (this.loadTestFontId = 0),
              (this.loadingContext = { requests: [], nextRequestId: 0 });
          }
          var assert = sharedUtil.assert,
            bytesToString = sharedUtil.bytesToString,
            string32 = sharedUtil.string32,
            shadow = sharedUtil.shadow,
            warn = sharedUtil.warn;
          (FontLoader.prototype = {
            insertRule: function (rule) {
              var styleElement = this.styleElement;
              styleElement ||
                ((styleElement = this.styleElement = document.createElement("style")),
                (styleElement.id = "PDFJS_FONT_STYLE_TAG_" + this.docId),
                document.documentElement.getElementsByTagName("head")[0].appendChild(styleElement));
              var styleSheet = styleElement.sheet;
              styleSheet.insertRule(rule, styleSheet.cssRules.length);
            },
            clear: function () {
              var styleElement = this.styleElement;
              styleElement &&
                (styleElement.parentNode.removeChild(styleElement), (styleElement = this.styleElement = null)),
                this.nativeFontFaces.forEach(function (nativeFontFace) {
                  document.fonts.delete(nativeFontFace);
                }),
                (this.nativeFontFaces.length = 0);
            },
            get loadTestFont() {
              return shadow(
                this,
                "loadTestFont",
                atob(
                  "T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQAABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwAAAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbmFtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAAAADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6AABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAAMQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAAAAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAAAAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQAAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMAAQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAAEAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgcA/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQAAAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAgABAAAAAAAAAAAD6AAAAAAAAA=="
                )
              );
            },
            addNativeFontFace: function (nativeFontFace) {
              this.nativeFontFaces.push(nativeFontFace), document.fonts.add(nativeFontFace);
            },
            bind: function (fonts, callback) {
              for (var rules = [], fontsToLoad = [], fontLoadPromises = [], i = 0, ii = fonts.length; i < ii; i++) {
                var font = fonts[i];
                if (!font.attached && !1 !== font.loading)
                  if (((font.attached = !0), FontLoader.isFontLoadingAPISupported)) {
                    var nativeFontFace = font.createNativeFontFace();
                    nativeFontFace &&
                      (this.addNativeFontFace(nativeFontFace),
                      fontLoadPromises.push(
                        (function (nativeFontFace) {
                          return nativeFontFace.loaded.catch(function (e) {
                            warn('Failed to load font "' + nativeFontFace.family + '": ' + e);
                          });
                        })(nativeFontFace)
                      ));
                  } else {
                    var rule = font.createFontFaceRule();
                    rule && (this.insertRule(rule), rules.push(rule), fontsToLoad.push(font));
                  }
              }
              var request = this.queueLoadingCallback(callback);
              FontLoader.isFontLoadingAPISupported
                ? Promise.all(fontLoadPromises).then(function () {
                    request.complete();
                  })
                : rules.length > 0 && !FontLoader.isSyncFontLoadingSupported
                ? this.prepareFontLoadEvent(rules, fontsToLoad, request)
                : request.complete();
            },
            queueLoadingCallback: function (callback) {
              function LoadLoader_completeRequest() {
                for (
                  assert(!request.end, "completeRequest() cannot be called twice"), request.end = Date.now();
                  context.requests.length > 0 && context.requests[0].end;

                ) {
                  var otherRequest = context.requests.shift();
                  setTimeout(otherRequest.callback, 0);
                }
              }
              var context = this.loadingContext,
                requestId = "pdfjs-font-loading-" + context.nextRequestId++,
                request = {
                  id: requestId,
                  complete: LoadLoader_completeRequest,
                  callback: callback,
                  started: Date.now(),
                };
              return context.requests.push(request), request;
            },
            prepareFontLoadEvent: function (rules, fonts, request) {
              function int32(data, offset) {
                return (
                  (data.charCodeAt(offset) << 24) |
                  (data.charCodeAt(offset + 1) << 16) |
                  (data.charCodeAt(offset + 2) << 8) |
                  (255 & data.charCodeAt(offset + 3))
                );
              }
              function spliceString(s, offset, remove, insert) {
                return s.substr(0, offset) + insert + s.substr(offset + remove);
              }
              function isFontReady(name, callback) {
                return ++called > 30
                  ? (warn("Load test font never loaded."), void callback())
                  : ((ctx.font = "30px " + name),
                    ctx.fillText(".", 0, 20),
                    ctx.getImageData(0, 0, 1, 1).data[3] > 0
                      ? void callback()
                      : void setTimeout(isFontReady.bind(null, name, callback)));
              }
              var i,
                ii,
                canvas = document.createElement("canvas");
              (canvas.width = 1), (canvas.height = 1);
              var ctx = canvas.getContext("2d"),
                called = 0,
                loadTestFontId = "lt" + Date.now() + this.loadTestFontId++,
                data = this.loadTestFont;
              data = spliceString(data, 976, loadTestFontId.length, loadTestFontId);
              var checksum = int32(data, 16);
              for (i = 0, ii = loadTestFontId.length - 3; i < ii; i += 4)
                checksum = (checksum - 1482184792 + int32(loadTestFontId, i)) | 0;
              i < loadTestFontId.length && (checksum = (checksum - 1482184792 + int32(loadTestFontId + "XXX", i)) | 0),
                (data = spliceString(data, 16, 4, string32(checksum)));
              var url = "url(data:font/opentype;base64," + btoa(data) + ");",
                rule = '@font-face { font-family:"' + loadTestFontId + '";src:' + url + "}";
              this.insertRule(rule);
              var names = [];
              for (i = 0, ii = fonts.length; i < ii; i++) names.push(fonts[i].loadedName);
              names.push(loadTestFontId);
              var div = document.createElement("div");
              for (
                div.setAttribute(
                  "style",
                  "visibility: hidden;width: 10px; height: 10px;position: absolute; top: 0px; left: 0px;"
                ),
                  i = 0,
                  ii = names.length;
                i < ii;
                ++i
              ) {
                var span = document.createElement("span");
                (span.textContent = "Hi"), (span.style.fontFamily = names[i]), div.appendChild(span);
              }
              document.body.appendChild(div),
                isFontReady(loadTestFontId, function () {
                  document.body.removeChild(div), request.complete();
                });
            },
          }),
            (FontLoader.isFontLoadingAPISupported = "undefined" != typeof document && !!document.fonts),
            Object.defineProperty(FontLoader, "isSyncFontLoadingSupported", {
              get: function () {
                if ("undefined" == typeof navigator) return shadow(FontLoader, "isSyncFontLoadingSupported", !0);
                var supported = !1,
                  m = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(navigator.userAgent);
                return m && m[1] >= 14 && (supported = !0), shadow(FontLoader, "isSyncFontLoadingSupported", supported);
              },
              enumerable: !0,
              configurable: !0,
            });
          var IsEvalSupportedCached = {
              get value() {
                return shadow(this, "value", sharedUtil.isEvalSupported());
              },
            },
            FontFaceObject = (function () {
              function FontFaceObject(translatedData, options) {
                this.compiledGlyphs = Object.create(null);
                for (var i in translatedData) this[i] = translatedData[i];
                this.options = options;
              }
              return (
                (FontFaceObject.prototype = {
                  createNativeFontFace: function () {
                    if (!this.data) return null;
                    if (this.options.disableFontFace) return (this.disableFontFace = !0), null;
                    var nativeFontFace = new FontFace(this.loadedName, this.data, {});
                    return this.options.fontRegistry && this.options.fontRegistry.registerFont(this), nativeFontFace;
                  },
                  createFontFaceRule: function () {
                    if (!this.data) return null;
                    if (this.options.disableFontFace) return (this.disableFontFace = !0), null;
                    var data = bytesToString(new Uint8Array(this.data)),
                      fontName = this.loadedName,
                      url = "url(data:" + this.mimetype + ";base64," + btoa(data) + ");",
                      rule = '@font-face { font-family:"' + fontName + '";src:' + url + "}";
                    return this.options.fontRegistry && this.options.fontRegistry.registerFont(this, url), rule;
                  },
                  getPathGenerator: function (objs, character) {
                    if (!(character in this.compiledGlyphs)) {
                      var current,
                        i,
                        len,
                        cmds = objs.get(this.loadedName + "_path_" + character);
                      if (this.options.isEvalSupported && IsEvalSupportedCached.value) {
                        var args,
                          js = "";
                        for (i = 0, len = cmds.length; i < len; i++)
                          (current = cmds[i]),
                            (args = void 0 !== current.args ? current.args.join(",") : ""),
                            (js += "c." + current.cmd + "(" + args + ");\n");
                        this.compiledGlyphs[character] = new Function("c", "size", js);
                      } else
                        this.compiledGlyphs[character] = function (c, size) {
                          for (i = 0, len = cmds.length; i < len; i++)
                            (current = cmds[i]),
                              "scale" === current.cmd && (current.args = [size, -size]),
                              c[current.cmd].apply(c, current.args);
                        };
                    }
                    return this.compiledGlyphs[character];
                  },
                }),
                FontFaceObject
              );
            })();
          (exports.FontFaceObject = FontFaceObject), (exports.FontLoader = FontLoader);
        })((root.pdfjsDisplayFontLoader = {}), root.pdfjsSharedUtil);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil) {
          function fixMetadata(meta) {
            return meta.replace(/>\\376\\377([^<]+)/g, function (all, codes) {
              for (
                var bytes = codes.replace(/\\([0-3])([0-7])([0-7])/g, function (code, d1, d2, d3) {
                    return String.fromCharCode(64 * d1 + 8 * d2 + 1 * d3);
                  }),
                  chars = "",
                  i = 0;
                i < bytes.length;
                i += 2
              ) {
                var code = 256 * bytes.charCodeAt(i) + bytes.charCodeAt(i + 1);
                chars += "&#x" + (65536 + code).toString(16).substring(1) + ";";
              }
              return ">" + chars;
            });
          }
          function Metadata(meta) {
            if ("string" == typeof meta) {
              meta = fixMetadata(meta);
              meta = new DOMParser().parseFromString(meta, "application/xml");
            } else meta instanceof Document || error("Metadata: Invalid metadata object");
            (this.metaDocument = meta), (this.metadata = Object.create(null)), this.parse();
          }
          var error = sharedUtil.error;
          (Metadata.prototype = {
            parse: function () {
              var doc = this.metaDocument,
                rdf = doc.documentElement;
              if ("rdf:rdf" !== rdf.nodeName.toLowerCase())
                for (rdf = rdf.firstChild; rdf && "rdf:rdf" !== rdf.nodeName.toLowerCase(); ) rdf = rdf.nextSibling;
              var nodeName = rdf ? rdf.nodeName.toLowerCase() : null;
              if (rdf && "rdf:rdf" === nodeName && rdf.hasChildNodes()) {
                var desc,
                  entry,
                  name,
                  i,
                  ii,
                  length,
                  iLength,
                  children = rdf.childNodes;
                for (i = 0, length = children.length; i < length; i++)
                  if (((desc = children[i]), "rdf:description" === desc.nodeName.toLowerCase()))
                    for (ii = 0, iLength = desc.childNodes.length; ii < iLength; ii++)
                      "#text" !== desc.childNodes[ii].nodeName.toLowerCase() &&
                        ((entry = desc.childNodes[ii]),
                        (name = entry.nodeName.toLowerCase()),
                        (this.metadata[name] = entry.textContent.trim()));
              }
            },
            get: function (name) {
              return this.metadata[name] || null;
            },
            has: function (name) {
              return void 0 !== this.metadata[name];
            },
          }),
            (exports.Metadata = Metadata);
        })((root.pdfjsDisplayMetadata = {}), root.pdfjsSharedUtil);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil) {
          var FONT_IDENTITY_MATRIX = sharedUtil.FONT_IDENTITY_MATRIX,
            IDENTITY_MATRIX = sharedUtil.IDENTITY_MATRIX,
            ImageKind = sharedUtil.ImageKind,
            OPS = sharedUtil.OPS,
            Util = sharedUtil.Util,
            isNum = sharedUtil.isNum,
            isArray = sharedUtil.isArray,
            warn = sharedUtil.warn,
            createObjectURL = sharedUtil.createObjectURL,
            SVG_DEFAULTS = { fontStyle: "normal", fontWeight: "normal", fillColor: "#000000" },
            convertImgDataToPng = (function () {
              function crc32(data, start, end) {
                for (var crc = -1, i = start; i < end; i++) {
                  var a = 255 & (crc ^ data[i]);
                  crc = (crc >>> 8) ^ crcTable[a];
                }
                return -1 ^ crc;
              }
              function writePngChunk(type, body, data, offset) {
                var p = offset,
                  len = body.length;
                (data[p] = (len >> 24) & 255),
                  (data[p + 1] = (len >> 16) & 255),
                  (data[p + 2] = (len >> 8) & 255),
                  (data[p + 3] = 255 & len),
                  (p += 4),
                  (data[p] = 255 & type.charCodeAt(0)),
                  (data[p + 1] = 255 & type.charCodeAt(1)),
                  (data[p + 2] = 255 & type.charCodeAt(2)),
                  (data[p + 3] = 255 & type.charCodeAt(3)),
                  (p += 4),
                  data.set(body, p),
                  (p += body.length);
                var crc = crc32(data, offset + 4, p);
                (data[p] = (crc >> 24) & 255),
                  (data[p + 1] = (crc >> 16) & 255),
                  (data[p + 2] = (crc >> 8) & 255),
                  (data[p + 3] = 255 & crc);
              }
              function adler32(data, start, end) {
                for (var a = 1, b = 0, i = start; i < end; ++i)
                  (a = (a + (255 & data[i])) % 65521), (b = (b + a) % 65521);
                return (b << 16) | a;
              }
              function encode(imgData, kind, forceDataSchema) {
                var bitDepth,
                  colorType,
                  lineSize,
                  width = imgData.width,
                  height = imgData.height,
                  bytes = imgData.data;
                switch (kind) {
                  case ImageKind.GRAYSCALE_1BPP:
                    (colorType = 0), (bitDepth = 1), (lineSize = (width + 7) >> 3);
                    break;
                  case ImageKind.RGB_24BPP:
                    (colorType = 2), (bitDepth = 8), (lineSize = 3 * width);
                    break;
                  case ImageKind.RGBA_32BPP:
                    (colorType = 6), (bitDepth = 8), (lineSize = 4 * width);
                    break;
                  default:
                    throw new Error("invalid format");
                }
                var y,
                  i,
                  literals = new Uint8Array((1 + lineSize) * height),
                  offsetLiterals = 0,
                  offsetBytes = 0;
                for (y = 0; y < height; ++y)
                  (literals[offsetLiterals++] = 0),
                    literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize), offsetLiterals),
                    (offsetBytes += lineSize),
                    (offsetLiterals += lineSize);
                if (kind === ImageKind.GRAYSCALE_1BPP)
                  for (offsetLiterals = 0, y = 0; y < height; y++)
                    for (offsetLiterals++, i = 0; i < lineSize; i++) literals[offsetLiterals++] ^= 255;
                var ihdr = new Uint8Array([
                    (width >> 24) & 255,
                    (width >> 16) & 255,
                    (width >> 8) & 255,
                    255 & width,
                    (height >> 24) & 255,
                    (height >> 16) & 255,
                    (height >> 8) & 255,
                    255 & height,
                    bitDepth,
                    colorType,
                    0,
                    0,
                    0,
                  ]),
                  len = literals.length,
                  deflateBlocks = Math.ceil(len / 65535),
                  idat = new Uint8Array(2 + len + 5 * deflateBlocks + 4),
                  pi = 0;
                (idat[pi++] = 120), (idat[pi++] = 156);
                for (var pos = 0; len > 65535; )
                  (idat[pi++] = 0),
                    (idat[pi++] = 255),
                    (idat[pi++] = 255),
                    (idat[pi++] = 0),
                    (idat[pi++] = 0),
                    idat.set(literals.subarray(pos, pos + 65535), pi),
                    (pi += 65535),
                    (pos += 65535),
                    (len -= 65535);
                (idat[pi++] = 1),
                  (idat[pi++] = 255 & len),
                  (idat[pi++] = (len >> 8) & 255),
                  (idat[pi++] = 255 & ~len),
                  (idat[pi++] = ((65535 & ~len) >> 8) & 255),
                  idat.set(literals.subarray(pos), pi),
                  (pi += literals.length - pos);
                var adler = adler32(literals, 0, literals.length);
                (idat[pi++] = (adler >> 24) & 255),
                  (idat[pi++] = (adler >> 16) & 255),
                  (idat[pi++] = (adler >> 8) & 255),
                  (idat[pi++] = 255 & adler);
                var pngLength = PNG_HEADER.length + 3 * CHUNK_WRAPPER_SIZE + ihdr.length + idat.length,
                  data = new Uint8Array(pngLength),
                  offset = 0;
                return (
                  data.set(PNG_HEADER, offset),
                  (offset += PNG_HEADER.length),
                  writePngChunk("IHDR", ihdr, data, offset),
                  (offset += CHUNK_WRAPPER_SIZE + ihdr.length),
                  writePngChunk("IDATA", idat, data, offset),
                  (offset += CHUNK_WRAPPER_SIZE + idat.length),
                  writePngChunk("IEND", new Uint8Array(0), data, offset),
                  createObjectURL(data, "image/png", forceDataSchema)
                );
              }
              for (
                var PNG_HEADER = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
                  CHUNK_WRAPPER_SIZE = 12,
                  crcTable = new Int32Array(256),
                  i = 0;
                i < 256;
                i++
              ) {
                for (var c = i, h = 0; h < 8; h++)
                  c = 1 & c ? 3988292384 ^ ((c >> 1) & 2147483647) : (c >> 1) & 2147483647;
                crcTable[i] = c;
              }
              return function (imgData, forceDataSchema) {
                return encode(
                  imgData,
                  void 0 === imgData.kind ? ImageKind.GRAYSCALE_1BPP : imgData.kind,
                  forceDataSchema
                );
              };
            })(),
            SVGExtraState = (function () {
              function SVGExtraState() {
                (this.fontSizeScale = 1),
                  (this.fontWeight = SVG_DEFAULTS.fontWeight),
                  (this.fontSize = 0),
                  (this.textMatrix = IDENTITY_MATRIX),
                  (this.fontMatrix = FONT_IDENTITY_MATRIX),
                  (this.leading = 0),
                  (this.x = 0),
                  (this.y = 0),
                  (this.lineX = 0),
                  (this.lineY = 0),
                  (this.charSpacing = 0),
                  (this.wordSpacing = 0),
                  (this.textHScale = 1),
                  (this.textRise = 0),
                  (this.fillColor = SVG_DEFAULTS.fillColor),
                  (this.strokeColor = "#000000"),
                  (this.fillAlpha = 1),
                  (this.strokeAlpha = 1),
                  (this.lineWidth = 1),
                  (this.lineJoin = ""),
                  (this.lineCap = ""),
                  (this.miterLimit = 0),
                  (this.dashArray = []),
                  (this.dashPhase = 0),
                  (this.dependencies = []),
                  (this.clipId = ""),
                  (this.pendingClip = !1),
                  (this.maskId = "");
              }
              return (
                (SVGExtraState.prototype = {
                  clone: function () {
                    return Object.create(this);
                  },
                  setCurrentPoint: function (x, y) {
                    (this.x = x), (this.y = y);
                  },
                }),
                SVGExtraState
              );
            })(),
            SVGGraphics = (function () {
              function createScratchSVG(width, height) {
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg:svg");
                return (
                  svg.setAttributeNS(null, "version", "1.1"),
                  svg.setAttributeNS(null, "width", width + "px"),
                  svg.setAttributeNS(null, "height", height + "px"),
                  svg.setAttributeNS(null, "viewBox", "0 0 " + width + " " + height),
                  svg
                );
              }
              function opListToTree(opList) {
                for (var opTree = [], tmp = [], opListLen = opList.length, x = 0; x < opListLen; x++)
                  "save" !== opList[x].fn
                    ? "restore" === opList[x].fn
                      ? (opTree = tmp.pop())
                      : opTree.push(opList[x])
                    : (opTree.push({ fnId: 92, fn: "group", items: [] }),
                      tmp.push(opTree),
                      (opTree = opTree[opTree.length - 1].items));
                return opTree;
              }
              function pf(value) {
                if (value === (0 | value)) return value.toString();
                var s = value.toFixed(10),
                  i = s.length - 1;
                if ("0" !== s[i]) return s;
                do {
                  i--;
                } while ("0" === s[i]);
                return s.substr(0, "." === s[i] ? i : i + 1);
              }
              function pm(m) {
                if (0 === m[4] && 0 === m[5]) {
                  if (0 === m[1] && 0 === m[2])
                    return 1 === m[0] && 1 === m[3] ? "" : "scale(" + pf(m[0]) + " " + pf(m[3]) + ")";
                  if (m[0] === m[3] && m[1] === -m[2]) {
                    return "rotate(" + pf((180 * Math.acos(m[0])) / Math.PI) + ")";
                  }
                } else if (1 === m[0] && 0 === m[1] && 0 === m[2] && 1 === m[3])
                  return "translate(" + pf(m[4]) + " " + pf(m[5]) + ")";
                return (
                  "matrix(" +
                  pf(m[0]) +
                  " " +
                  pf(m[1]) +
                  " " +
                  pf(m[2]) +
                  " " +
                  pf(m[3]) +
                  " " +
                  pf(m[4]) +
                  " " +
                  pf(m[5]) +
                  ")"
                );
              }
              function SVGGraphics(commonObjs, objs, forceDataSchema) {
                (this.current = new SVGExtraState()),
                  (this.transformMatrix = IDENTITY_MATRIX),
                  (this.transformStack = []),
                  (this.extraStack = []),
                  (this.commonObjs = commonObjs),
                  (this.objs = objs),
                  (this.pendingEOFill = !1),
                  (this.embedFonts = !1),
                  (this.embeddedFonts = Object.create(null)),
                  (this.cssStyle = null),
                  (this.forceDataSchema = !!forceDataSchema);
              }
              var NS = "http://www.w3.org/2000/svg",
                XLINK_NS = "http://www.w3.org/1999/xlink",
                LINE_CAP_STYLES = ["butt", "round", "square"],
                LINE_JOIN_STYLES = ["miter", "round", "bevel"],
                clipCount = 0,
                maskCount = 0;
              return (
                (SVGGraphics.prototype = {
                  save: function () {
                    this.transformStack.push(this.transformMatrix);
                    var old = this.current;
                    this.extraStack.push(old), (this.current = old.clone());
                  },
                  restore: function () {
                    (this.transformMatrix = this.transformStack.pop()),
                      (this.current = this.extraStack.pop()),
                      (this.tgrp = document.createElementNS(NS, "svg:g")),
                      this.tgrp.setAttributeNS(null, "transform", pm(this.transformMatrix)),
                      this.pgrp.appendChild(this.tgrp);
                  },
                  group: function (items) {
                    this.save(), this.executeOpTree(items), this.restore();
                  },
                  loadDependencies: function (operatorList) {
                    for (
                      var fnArray = operatorList.fnArray,
                        fnArrayLen = fnArray.length,
                        argsArray = operatorList.argsArray,
                        self = this,
                        i = 0;
                      i < fnArrayLen;
                      i++
                    )
                      if (OPS.dependency === fnArray[i])
                        for (var deps = argsArray[i], n = 0, nn = deps.length; n < nn; n++) {
                          var promise,
                            obj = deps[n],
                            common = "g_" === obj.substring(0, 2);
                          (promise = common
                            ? new Promise(function (resolve) {
                                self.commonObjs.get(obj, resolve);
                              })
                            : new Promise(function (resolve) {
                                self.objs.get(obj, resolve);
                              })),
                            this.current.dependencies.push(promise);
                        }
                    return Promise.all(this.current.dependencies);
                  },
                  transform: function (a, b, c, d, e, f) {
                    var transformMatrix = [a, b, c, d, e, f];
                    (this.transformMatrix = Util.transform(this.transformMatrix, transformMatrix)),
                      (this.tgrp = document.createElementNS(NS, "svg:g")),
                      this.tgrp.setAttributeNS(null, "transform", pm(this.transformMatrix));
                  },
                  getSVG: function (operatorList, viewport) {
                    return (
                      (this.svg = createScratchSVG(viewport.width, viewport.height)),
                      (this.viewport = viewport),
                      this.loadDependencies(operatorList).then(
                        function () {
                          (this.transformMatrix = IDENTITY_MATRIX),
                            (this.pgrp = document.createElementNS(NS, "svg:g")),
                            this.pgrp.setAttributeNS(null, "transform", pm(viewport.transform)),
                            (this.tgrp = document.createElementNS(NS, "svg:g")),
                            this.tgrp.setAttributeNS(null, "transform", pm(this.transformMatrix)),
                            (this.defs = document.createElementNS(NS, "svg:defs")),
                            this.pgrp.appendChild(this.defs),
                            this.pgrp.appendChild(this.tgrp),
                            this.svg.appendChild(this.pgrp);
                          var opTree = this.convertOpList(operatorList);
                          return this.executeOpTree(opTree), this.svg;
                        }.bind(this)
                      )
                    );
                  },
                  convertOpList: function (operatorList) {
                    var argsArray = operatorList.argsArray,
                      fnArray = operatorList.fnArray,
                      fnArrayLen = fnArray.length,
                      REVOPS = [],
                      opList = [];
                    for (var op in OPS) REVOPS[OPS[op]] = op;
                    for (var x = 0; x < fnArrayLen; x++) {
                      var fnId = fnArray[x];
                      opList.push({ fnId: fnId, fn: REVOPS[fnId], args: argsArray[x] });
                    }
                    return opListToTree(opList);
                  },
                  executeOpTree: function (opTree) {
                    for (var opTreeLen = opTree.length, x = 0; x < opTreeLen; x++) {
                      var fn = opTree[x].fn,
                        fnId = opTree[x].fnId,
                        args = opTree[x].args;
                      switch (0 | fnId) {
                        case OPS.beginText:
                          this.beginText();
                          break;
                        case OPS.setLeading:
                          this.setLeading(args);
                          break;
                        case OPS.setLeadingMoveText:
                          this.setLeadingMoveText(args[0], args[1]);
                          break;
                        case OPS.setFont:
                          this.setFont(args);
                          break;
                        case OPS.showText:
                        case OPS.showSpacedText:
                          this.showText(args[0]);
                          break;
                        case OPS.endText:
                          this.endText();
                          break;
                        case OPS.moveText:
                          this.moveText(args[0], args[1]);
                          break;
                        case OPS.setCharSpacing:
                          this.setCharSpacing(args[0]);
                          break;
                        case OPS.setWordSpacing:
                          this.setWordSpacing(args[0]);
                          break;
                        case OPS.setHScale:
                          this.setHScale(args[0]);
                          break;
                        case OPS.setTextMatrix:
                          this.setTextMatrix(args[0], args[1], args[2], args[3], args[4], args[5]);
                          break;
                        case OPS.setLineWidth:
                          this.setLineWidth(args[0]);
                          break;
                        case OPS.setLineJoin:
                          this.setLineJoin(args[0]);
                          break;
                        case OPS.setLineCap:
                          this.setLineCap(args[0]);
                          break;
                        case OPS.setMiterLimit:
                          this.setMiterLimit(args[0]);
                          break;
                        case OPS.setFillRGBColor:
                          this.setFillRGBColor(args[0], args[1], args[2]);
                          break;
                        case OPS.setStrokeRGBColor:
                          this.setStrokeRGBColor(args[0], args[1], args[2]);
                          break;
                        case OPS.setDash:
                          this.setDash(args[0], args[1]);
                          break;
                        case OPS.setGState:
                          this.setGState(args[0]);
                          break;
                        case OPS.fill:
                          this.fill();
                          break;
                        case OPS.eoFill:
                          this.eoFill();
                          break;
                        case OPS.stroke:
                          this.stroke();
                          break;
                        case OPS.fillStroke:
                          this.fillStroke();
                          break;
                        case OPS.eoFillStroke:
                          this.eoFillStroke();
                          break;
                        case OPS.clip:
                          this.clip("nonzero");
                          break;
                        case OPS.eoClip:
                          this.clip("evenodd");
                          break;
                        case OPS.paintSolidColorImageMask:
                          this.paintSolidColorImageMask();
                          break;
                        case OPS.paintJpegXObject:
                          this.paintJpegXObject(args[0], args[1], args[2]);
                          break;
                        case OPS.paintImageXObject:
                          this.paintImageXObject(args[0]);
                          break;
                        case OPS.paintInlineImageXObject:
                          this.paintInlineImageXObject(args[0]);
                          break;
                        case OPS.paintImageMaskXObject:
                          this.paintImageMaskXObject(args[0]);
                          break;
                        case OPS.paintFormXObjectBegin:
                          this.paintFormXObjectBegin(args[0], args[1]);
                          break;
                        case OPS.paintFormXObjectEnd:
                          this.paintFormXObjectEnd();
                          break;
                        case OPS.closePath:
                          this.closePath();
                          break;
                        case OPS.closeStroke:
                          this.closeStroke();
                          break;
                        case OPS.closeFillStroke:
                          this.closeFillStroke();
                          break;
                        case OPS.nextLine:
                          this.nextLine();
                          break;
                        case OPS.transform:
                          this.transform(args[0], args[1], args[2], args[3], args[4], args[5]);
                          break;
                        case OPS.constructPath:
                          this.constructPath(args[0], args[1]);
                          break;
                        case OPS.endPath:
                          this.endPath();
                          break;
                        case 92:
                          this.group(opTree[x].items);
                          break;
                        default:
                          warn("Unimplemented method " + fn);
                      }
                    }
                  },
                  setWordSpacing: function (wordSpacing) {
                    this.current.wordSpacing = wordSpacing;
                  },
                  setCharSpacing: function (charSpacing) {
                    this.current.charSpacing = charSpacing;
                  },
                  nextLine: function () {
                    this.moveText(0, this.current.leading);
                  },
                  setTextMatrix: function (a, b, c, d, e, f) {
                    var current = this.current;
                    (this.current.textMatrix = this.current.lineMatrix = [a, b, c, d, e, f]),
                      (this.current.x = this.current.lineX = 0),
                      (this.current.y = this.current.lineY = 0),
                      (current.xcoords = []),
                      (current.tspan = document.createElementNS(NS, "svg:tspan")),
                      current.tspan.setAttributeNS(null, "font-family", current.fontFamily),
                      current.tspan.setAttributeNS(null, "font-size", pf(current.fontSize) + "px"),
                      current.tspan.setAttributeNS(null, "y", pf(-current.y)),
                      (current.txtElement = document.createElementNS(NS, "svg:text")),
                      current.txtElement.appendChild(current.tspan);
                  },
                  beginText: function () {
                    (this.current.x = this.current.lineX = 0),
                      (this.current.y = this.current.lineY = 0),
                      (this.current.textMatrix = IDENTITY_MATRIX),
                      (this.current.lineMatrix = IDENTITY_MATRIX),
                      (this.current.tspan = document.createElementNS(NS, "svg:tspan")),
                      (this.current.txtElement = document.createElementNS(NS, "svg:text")),
                      (this.current.txtgrp = document.createElementNS(NS, "svg:g")),
                      (this.current.xcoords = []);
                  },
                  moveText: function (x, y) {
                    var current = this.current;
                    (this.current.x = this.current.lineX += x),
                      (this.current.y = this.current.lineY += y),
                      (current.xcoords = []),
                      (current.tspan = document.createElementNS(NS, "svg:tspan")),
                      current.tspan.setAttributeNS(null, "font-family", current.fontFamily),
                      current.tspan.setAttributeNS(null, "font-size", pf(current.fontSize) + "px"),
                      current.tspan.setAttributeNS(null, "y", pf(-current.y));
                  },
                  showText: function (glyphs) {
                    var current = this.current,
                      font = current.font,
                      fontSize = current.fontSize;
                    if (0 !== fontSize) {
                      var i,
                        charSpacing = current.charSpacing,
                        wordSpacing = current.wordSpacing,
                        fontDirection = current.fontDirection,
                        textHScale = current.textHScale * fontDirection,
                        glyphsLength = glyphs.length,
                        vertical = font.vertical,
                        widthAdvanceScale = fontSize * current.fontMatrix[0],
                        x = 0;
                      for (i = 0; i < glyphsLength; ++i) {
                        var glyph = glyphs[i];
                        if (null !== glyph)
                          if (isNum(glyph)) x += -glyph * fontSize * 0.001;
                          else {
                            current.xcoords.push(current.x + x * textHScale);
                            var width = glyph.width,
                              character = glyph.fontChar,
                              charWidth = width * widthAdvanceScale + charSpacing * fontDirection;
                            (x += charWidth), (current.tspan.textContent += character);
                          }
                        else x += fontDirection * wordSpacing;
                      }
                      vertical ? (current.y -= x * textHScale) : (current.x += x * textHScale),
                        current.tspan.setAttributeNS(null, "x", current.xcoords.map(pf).join(" ")),
                        current.tspan.setAttributeNS(null, "y", pf(-current.y)),
                        current.tspan.setAttributeNS(null, "font-family", current.fontFamily),
                        current.tspan.setAttributeNS(null, "font-size", pf(current.fontSize) + "px"),
                        current.fontStyle !== SVG_DEFAULTS.fontStyle &&
                          current.tspan.setAttributeNS(null, "font-style", current.fontStyle),
                        current.fontWeight !== SVG_DEFAULTS.fontWeight &&
                          current.tspan.setAttributeNS(null, "font-weight", current.fontWeight),
                        current.fillColor !== SVG_DEFAULTS.fillColor &&
                          current.tspan.setAttributeNS(null, "fill", current.fillColor),
                        current.txtElement.setAttributeNS(null, "transform", pm(current.textMatrix) + " scale(1, -1)"),
                        current.txtElement.setAttributeNS(
                          "http://www.w3.org/XML/1998/namespace",
                          "xml:space",
                          "preserve"
                        ),
                        current.txtElement.appendChild(current.tspan),
                        current.txtgrp.appendChild(current.txtElement),
                        this.tgrp.appendChild(current.txtElement);
                    }
                  },
                  setLeadingMoveText: function (x, y) {
                    this.setLeading(-y), this.moveText(x, y);
                  },
                  addFontStyle: function (fontObj) {
                    this.cssStyle ||
                      ((this.cssStyle = document.createElementNS(NS, "svg:style")),
                      this.cssStyle.setAttributeNS(null, "type", "text/css"),
                      this.defs.appendChild(this.cssStyle));
                    var url = createObjectURL(fontObj.data, fontObj.mimetype, this.forceDataSchema);
                    this.cssStyle.textContent +=
                      '@font-face { font-family: "' + fontObj.loadedName + '"; src: url(' + url + "); }\n";
                  },
                  setFont: function (details) {
                    var current = this.current,
                      fontObj = this.commonObjs.get(details[0]),
                      size = details[1];
                    (this.current.font = fontObj),
                      this.embedFonts &&
                        fontObj.data &&
                        !this.embeddedFonts[fontObj.loadedName] &&
                        (this.addFontStyle(fontObj), (this.embeddedFonts[fontObj.loadedName] = fontObj)),
                      (current.fontMatrix = fontObj.fontMatrix ? fontObj.fontMatrix : FONT_IDENTITY_MATRIX);
                    var bold = fontObj.black ? (fontObj.bold ? "bolder" : "bold") : fontObj.bold ? "bold" : "normal",
                      italic = fontObj.italic ? "italic" : "normal";
                    size < 0 ? ((size = -size), (current.fontDirection = -1)) : (current.fontDirection = 1),
                      (current.fontSize = size),
                      (current.fontFamily = fontObj.loadedName),
                      (current.fontWeight = bold),
                      (current.fontStyle = italic),
                      (current.tspan = document.createElementNS(NS, "svg:tspan")),
                      current.tspan.setAttributeNS(null, "y", pf(-current.y)),
                      (current.xcoords = []);
                  },
                  endText: function () {
                    this.current.pendingClip
                      ? (this.cgrp.appendChild(this.tgrp), this.pgrp.appendChild(this.cgrp))
                      : this.pgrp.appendChild(this.tgrp),
                      (this.tgrp = document.createElementNS(NS, "svg:g")),
                      this.tgrp.setAttributeNS(null, "transform", pm(this.transformMatrix));
                  },
                  setLineWidth: function (width) {
                    this.current.lineWidth = width;
                  },
                  setLineCap: function (style) {
                    this.current.lineCap = LINE_CAP_STYLES[style];
                  },
                  setLineJoin: function (style) {
                    this.current.lineJoin = LINE_JOIN_STYLES[style];
                  },
                  setMiterLimit: function (limit) {
                    this.current.miterLimit = limit;
                  },
                  setStrokeRGBColor: function (r, g, b) {
                    var color = Util.makeCssRgb(r, g, b);
                    this.current.strokeColor = color;
                  },
                  setFillRGBColor: function (r, g, b) {
                    var color = Util.makeCssRgb(r, g, b);
                    (this.current.fillColor = color),
                      (this.current.tspan = document.createElementNS(NS, "svg:tspan")),
                      (this.current.xcoords = []);
                  },
                  setDash: function (dashArray, dashPhase) {
                    (this.current.dashArray = dashArray), (this.current.dashPhase = dashPhase);
                  },
                  constructPath: function (ops, args) {
                    var current = this.current,
                      x = current.x,
                      y = current.y;
                    current.path = document.createElementNS(NS, "svg:path");
                    for (var d = [], opLength = ops.length, i = 0, j = 0; i < opLength; i++)
                      switch (0 | ops[i]) {
                        case OPS.rectangle:
                          (x = args[j++]), (y = args[j++]);
                          var width = args[j++],
                            height = args[j++],
                            xw = x + width,
                            yh = y + height;
                          d.push("M", pf(x), pf(y), "L", pf(xw), pf(y), "L", pf(xw), pf(yh), "L", pf(x), pf(yh), "Z");
                          break;
                        case OPS.moveTo:
                          (x = args[j++]), (y = args[j++]), d.push("M", pf(x), pf(y));
                          break;
                        case OPS.lineTo:
                          (x = args[j++]), (y = args[j++]), d.push("L", pf(x), pf(y));
                          break;
                        case OPS.curveTo:
                          (x = args[j + 4]),
                            (y = args[j + 5]),
                            d.push("C", pf(args[j]), pf(args[j + 1]), pf(args[j + 2]), pf(args[j + 3]), pf(x), pf(y)),
                            (j += 6);
                          break;
                        case OPS.curveTo2:
                          (x = args[j + 2]),
                            (y = args[j + 3]),
                            d.push("C", pf(x), pf(y), pf(args[j]), pf(args[j + 1]), pf(args[j + 2]), pf(args[j + 3])),
                            (j += 4);
                          break;
                        case OPS.curveTo3:
                          (x = args[j + 2]),
                            (y = args[j + 3]),
                            d.push("C", pf(args[j]), pf(args[j + 1]), pf(x), pf(y), pf(x), pf(y)),
                            (j += 4);
                          break;
                        case OPS.closePath:
                          d.push("Z");
                      }
                    current.path.setAttributeNS(null, "d", d.join(" ")),
                      current.path.setAttributeNS(null, "stroke-miterlimit", pf(current.miterLimit)),
                      current.path.setAttributeNS(null, "stroke-linecap", current.lineCap),
                      current.path.setAttributeNS(null, "stroke-linejoin", current.lineJoin),
                      current.path.setAttributeNS(null, "stroke-width", pf(current.lineWidth) + "px"),
                      current.path.setAttributeNS(null, "stroke-dasharray", current.dashArray.map(pf).join(" ")),
                      current.path.setAttributeNS(null, "stroke-dashoffset", pf(current.dashPhase) + "px"),
                      current.path.setAttributeNS(null, "fill", "none"),
                      this.tgrp.appendChild(current.path),
                      current.pendingClip
                        ? (this.cgrp.appendChild(this.tgrp), this.pgrp.appendChild(this.cgrp))
                        : this.pgrp.appendChild(this.tgrp),
                      (current.element = current.path),
                      current.setCurrentPoint(x, y);
                  },
                  endPath: function () {
                    this.current.pendingClip
                      ? (this.cgrp.appendChild(this.tgrp), this.pgrp.appendChild(this.cgrp))
                      : this.pgrp.appendChild(this.tgrp),
                      (this.tgrp = document.createElementNS(NS, "svg:g")),
                      this.tgrp.setAttributeNS(null, "transform", pm(this.transformMatrix));
                  },
                  clip: function (type) {
                    var current = this.current;
                    (current.clipId = "clippath" + clipCount),
                      clipCount++,
                      (this.clippath = document.createElementNS(NS, "svg:clipPath")),
                      this.clippath.setAttributeNS(null, "id", current.clipId);
                    var clipElement = current.element.cloneNode();
                    "evenodd" === type
                      ? clipElement.setAttributeNS(null, "clip-rule", "evenodd")
                      : clipElement.setAttributeNS(null, "clip-rule", "nonzero"),
                      this.clippath.setAttributeNS(null, "transform", pm(this.transformMatrix)),
                      this.clippath.appendChild(clipElement),
                      this.defs.appendChild(this.clippath),
                      (current.pendingClip = !0),
                      (this.cgrp = document.createElementNS(NS, "svg:g")),
                      this.cgrp.setAttributeNS(null, "clip-path", "url(#" + current.clipId + ")"),
                      this.pgrp.appendChild(this.cgrp);
                  },
                  closePath: function () {
                    var current = this.current,
                      d = current.path.getAttributeNS(null, "d");
                    (d += "Z"), current.path.setAttributeNS(null, "d", d);
                  },
                  setLeading: function (leading) {
                    this.current.leading = -leading;
                  },
                  setTextRise: function (textRise) {
                    this.current.textRise = textRise;
                  },
                  setHScale: function (scale) {
                    this.current.textHScale = scale / 100;
                  },
                  setGState: function (states) {
                    for (var i = 0, ii = states.length; i < ii; i++) {
                      var state = states[i],
                        key = state[0],
                        value = state[1];
                      switch (key) {
                        case "LW":
                          this.setLineWidth(value);
                          break;
                        case "LC":
                          this.setLineCap(value);
                          break;
                        case "LJ":
                          this.setLineJoin(value);
                          break;
                        case "ML":
                          this.setMiterLimit(value);
                          break;
                        case "D":
                          this.setDash(value[0], value[1]);
                          break;
                        case "RI":
                        case "FL":
                          break;
                        case "Font":
                          this.setFont(value);
                      }
                    }
                  },
                  fill: function () {
                    var current = this.current;
                    current.element.setAttributeNS(null, "fill", current.fillColor);
                  },
                  stroke: function () {
                    var current = this.current;
                    current.element.setAttributeNS(null, "stroke", current.strokeColor),
                      current.element.setAttributeNS(null, "fill", "none");
                  },
                  eoFill: function () {
                    var current = this.current;
                    current.element.setAttributeNS(null, "fill", current.fillColor),
                      current.element.setAttributeNS(null, "fill-rule", "evenodd");
                  },
                  fillStroke: function () {
                    this.stroke(), this.fill();
                  },
                  eoFillStroke: function () {
                    this.current.element.setAttributeNS(null, "fill-rule", "evenodd"), this.fillStroke();
                  },
                  closeStroke: function () {
                    this.closePath(), this.stroke();
                  },
                  closeFillStroke: function () {
                    this.closePath(), this.fillStroke();
                  },
                  paintSolidColorImageMask: function () {
                    var current = this.current,
                      rect = document.createElementNS(NS, "svg:rect");
                    rect.setAttributeNS(null, "x", "0"),
                      rect.setAttributeNS(null, "y", "0"),
                      rect.setAttributeNS(null, "width", "1px"),
                      rect.setAttributeNS(null, "height", "1px"),
                      rect.setAttributeNS(null, "fill", current.fillColor),
                      this.tgrp.appendChild(rect);
                  },
                  paintJpegXObject: function (objId, w, h) {
                    var current = this.current,
                      imgObj = this.objs.get(objId),
                      imgEl = document.createElementNS(NS, "svg:image");
                    imgEl.setAttributeNS(XLINK_NS, "xlink:href", imgObj.src),
                      imgEl.setAttributeNS(null, "width", imgObj.width + "px"),
                      imgEl.setAttributeNS(null, "height", imgObj.height + "px"),
                      imgEl.setAttributeNS(null, "x", "0"),
                      imgEl.setAttributeNS(null, "y", pf(-h)),
                      imgEl.setAttributeNS(null, "transform", "scale(" + pf(1 / w) + " " + pf(-1 / h) + ")"),
                      this.tgrp.appendChild(imgEl),
                      current.pendingClip
                        ? (this.cgrp.appendChild(this.tgrp), this.pgrp.appendChild(this.cgrp))
                        : this.pgrp.appendChild(this.tgrp);
                  },
                  paintImageXObject: function (objId) {
                    var imgData = this.objs.get(objId);
                    if (!imgData) return void warn("Dependent image isn't ready yet");
                    this.paintInlineImageXObject(imgData);
                  },
                  paintInlineImageXObject: function (imgData, mask) {
                    var current = this.current,
                      width = imgData.width,
                      height = imgData.height,
                      imgSrc = convertImgDataToPng(imgData, this.forceDataSchema),
                      cliprect = document.createElementNS(NS, "svg:rect");
                    cliprect.setAttributeNS(null, "x", "0"),
                      cliprect.setAttributeNS(null, "y", "0"),
                      cliprect.setAttributeNS(null, "width", pf(width)),
                      cliprect.setAttributeNS(null, "height", pf(height)),
                      (current.element = cliprect),
                      this.clip("nonzero");
                    var imgEl = document.createElementNS(NS, "svg:image");
                    imgEl.setAttributeNS(XLINK_NS, "xlink:href", imgSrc),
                      imgEl.setAttributeNS(null, "x", "0"),
                      imgEl.setAttributeNS(null, "y", pf(-height)),
                      imgEl.setAttributeNS(null, "width", pf(width) + "px"),
                      imgEl.setAttributeNS(null, "height", pf(height) + "px"),
                      imgEl.setAttributeNS(null, "transform", "scale(" + pf(1 / width) + " " + pf(-1 / height) + ")"),
                      mask ? mask.appendChild(imgEl) : this.tgrp.appendChild(imgEl),
                      current.pendingClip
                        ? (this.cgrp.appendChild(this.tgrp), this.pgrp.appendChild(this.cgrp))
                        : this.pgrp.appendChild(this.tgrp);
                  },
                  paintImageMaskXObject: function (imgData) {
                    var current = this.current,
                      width = imgData.width,
                      height = imgData.height,
                      fillColor = current.fillColor;
                    current.maskId = "mask" + maskCount++;
                    var mask = document.createElementNS(NS, "svg:mask");
                    mask.setAttributeNS(null, "id", current.maskId);
                    var rect = document.createElementNS(NS, "svg:rect");
                    rect.setAttributeNS(null, "x", "0"),
                      rect.setAttributeNS(null, "y", "0"),
                      rect.setAttributeNS(null, "width", pf(width)),
                      rect.setAttributeNS(null, "height", pf(height)),
                      rect.setAttributeNS(null, "fill", fillColor),
                      rect.setAttributeNS(null, "mask", "url(#" + current.maskId + ")"),
                      this.defs.appendChild(mask),
                      this.tgrp.appendChild(rect),
                      this.paintInlineImageXObject(imgData, mask);
                  },
                  paintFormXObjectBegin: function (matrix, bbox) {
                    if (
                      (this.save(),
                      isArray(matrix) &&
                        6 === matrix.length &&
                        this.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]),
                      isArray(bbox) && 4 === bbox.length)
                    ) {
                      var width = bbox[2] - bbox[0],
                        height = bbox[3] - bbox[1],
                        cliprect = document.createElementNS(NS, "svg:rect");
                      cliprect.setAttributeNS(null, "x", bbox[0]),
                        cliprect.setAttributeNS(null, "y", bbox[1]),
                        cliprect.setAttributeNS(null, "width", pf(width)),
                        cliprect.setAttributeNS(null, "height", pf(height)),
                        (this.current.element = cliprect),
                        this.clip("nonzero"),
                        this.endPath();
                    }
                  },
                  paintFormXObjectEnd: function () {
                    this.restore();
                  },
                }),
                SVGGraphics
              );
            })();
          exports.SVGGraphics = SVGGraphics;
        })((root.pdfjsDisplaySVG = {}), root.pdfjsSharedUtil);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil, displayDOMUtils) {
          function AnnotationElementFactory() {}
          var AnnotationBorderStyleType = sharedUtil.AnnotationBorderStyleType,
            AnnotationType = sharedUtil.AnnotationType,
            Util = sharedUtil.Util,
            addLinkAttributes = displayDOMUtils.addLinkAttributes,
            LinkTarget = displayDOMUtils.LinkTarget,
            getFilenameFromUrl = displayDOMUtils.getFilenameFromUrl,
            warn = sharedUtil.warn,
            CustomStyle = displayDOMUtils.CustomStyle,
            getDefaultSetting = displayDOMUtils.getDefaultSetting;
          AnnotationElementFactory.prototype = {
            create: function (parameters) {
              switch (parameters.data.annotationType) {
                case AnnotationType.LINK:
                  return new LinkAnnotationElement(parameters);
                case AnnotationType.TEXT:
                  return new TextAnnotationElement(parameters);
                case AnnotationType.WIDGET:
                  switch (parameters.data.fieldType) {
                    case "Tx":
                      return new TextWidgetAnnotationElement(parameters);
                  }
                  return new WidgetAnnotationElement(parameters);
                case AnnotationType.POPUP:
                  return new PopupAnnotationElement(parameters);
                case AnnotationType.HIGHLIGHT:
                  return new HighlightAnnotationElement(parameters);
                case AnnotationType.UNDERLINE:
                  return new UnderlineAnnotationElement(parameters);
                case AnnotationType.SQUIGGLY:
                  return new SquigglyAnnotationElement(parameters);
                case AnnotationType.STRIKEOUT:
                  return new StrikeOutAnnotationElement(parameters);
                case AnnotationType.FILEATTACHMENT:
                  return new FileAttachmentAnnotationElement(parameters);
                default:
                  return new AnnotationElement(parameters);
              }
            },
          };
          var AnnotationElement = (function () {
              function AnnotationElement(parameters, isRenderable) {
                (this.isRenderable = isRenderable || !1),
                  (this.data = parameters.data),
                  (this.layer = parameters.layer),
                  (this.page = parameters.page),
                  (this.viewport = parameters.viewport),
                  (this.linkService = parameters.linkService),
                  (this.downloadManager = parameters.downloadManager),
                  (this.imageResourcesPath = parameters.imageResourcesPath),
                  (this.renderInteractiveForms = parameters.renderInteractiveForms),
                  isRenderable && (this.container = this._createContainer());
              }
              return (
                (AnnotationElement.prototype = {
                  _createContainer: function () {
                    var data = this.data,
                      page = this.page,
                      viewport = this.viewport,
                      container = document.createElement("section"),
                      width = data.rect[2] - data.rect[0],
                      height = data.rect[3] - data.rect[1];
                    container.setAttribute("data-annotation-id", data.id);
                    var rect = Util.normalizeRect([
                      data.rect[0],
                      page.view[3] - data.rect[1] + page.view[1],
                      data.rect[2],
                      page.view[3] - data.rect[3] + page.view[1],
                    ]);
                    if (
                      (CustomStyle.setProp("transform", container, "matrix(" + viewport.transform.join(",") + ")"),
                      CustomStyle.setProp("transformOrigin", container, -rect[0] + "px " + -rect[1] + "px"),
                      data.borderStyle.width > 0)
                    ) {
                      (container.style.borderWidth = data.borderStyle.width + "px"),
                        data.borderStyle.style !== AnnotationBorderStyleType.UNDERLINE &&
                          ((width -= 2 * data.borderStyle.width), (height -= 2 * data.borderStyle.width));
                      var horizontalRadius = data.borderStyle.horizontalCornerRadius,
                        verticalRadius = data.borderStyle.verticalCornerRadius;
                      if (horizontalRadius > 0 || verticalRadius > 0) {
                        var radius = horizontalRadius + "px / " + verticalRadius + "px";
                        CustomStyle.setProp("borderRadius", container, radius);
                      }
                      switch (data.borderStyle.style) {
                        case AnnotationBorderStyleType.SOLID:
                          container.style.borderStyle = "solid";
                          break;
                        case AnnotationBorderStyleType.DASHED:
                          container.style.borderStyle = "dashed";
                          break;
                        case AnnotationBorderStyleType.BEVELED:
                          warn("Unimplemented border style: beveled");
                          break;
                        case AnnotationBorderStyleType.INSET:
                          warn("Unimplemented border style: inset");
                          break;
                        case AnnotationBorderStyleType.UNDERLINE:
                          container.style.borderBottomStyle = "solid";
                      }
                      data.color
                        ? (container.style.borderColor = Util.makeCssRgb(
                            0 | data.color[0],
                            0 | data.color[1],
                            0 | data.color[2]
                          ))
                        : (container.style.borderWidth = 0);
                    }
                    return (
                      (container.style.left = rect[0] + "px"),
                      (container.style.top = rect[1] + "px"),
                      (container.style.width = width + "px"),
                      (container.style.height = height + "px"),
                      container
                    );
                  },
                  _createPopup: function (container, trigger, data) {
                    trigger ||
                      ((trigger = document.createElement("div")),
                      (trigger.style.height = container.style.height),
                      (trigger.style.width = container.style.width),
                      container.appendChild(trigger));
                    var popupElement = new PopupElement({
                        container: container,
                        trigger: trigger,
                        color: data.color,
                        title: data.title,
                        contents: data.contents,
                        hideWrapper: !0,
                      }),
                      popup = popupElement.render();
                    (popup.style.left = container.style.width), container.appendChild(popup);
                  },
                  render: function () {
                    throw new Error("Abstract method AnnotationElement.render called");
                  },
                }),
                AnnotationElement
              );
            })(),
            LinkAnnotationElement = (function () {
              function LinkAnnotationElement(parameters) {
                AnnotationElement.call(this, parameters, !0);
              }
              return (
                Util.inherit(LinkAnnotationElement, AnnotationElement, {
                  render: function () {
                    this.container.className = "linkAnnotation";
                    var link = document.createElement("a");
                    return (
                      addLinkAttributes(link, {
                        url: this.data.url,
                        target: this.data.newWindow ? LinkTarget.BLANK : void 0,
                      }),
                      this.data.url ||
                        (this.data.action
                          ? this._bindNamedAction(link, this.data.action)
                          : this._bindLink(link, this.data.dest || null)),
                      this.container.appendChild(link),
                      this.container
                    );
                  },
                  _bindLink: function (link, destination) {
                    var self = this;
                    (link.href = this.linkService.getDestinationHash(destination)),
                      (link.onclick = function () {
                        return destination && self.linkService.navigateTo(destination), !1;
                      }),
                      destination && (link.className = "internalLink");
                  },
                  _bindNamedAction: function (link, action) {
                    var self = this;
                    (link.href = this.linkService.getAnchorUrl("")),
                      (link.onclick = function () {
                        return self.linkService.executeNamedAction(action), !1;
                      }),
                      (link.className = "internalLink");
                  },
                }),
                LinkAnnotationElement
              );
            })(),
            TextAnnotationElement = (function () {
              function TextAnnotationElement(parameters) {
                var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
                AnnotationElement.call(this, parameters, isRenderable);
              }
              return (
                Util.inherit(TextAnnotationElement, AnnotationElement, {
                  render: function () {
                    this.container.className = "textAnnotation";
                    var image = document.createElement("img");
                    return (
                      (image.style.height = this.container.style.height),
                      (image.style.width = this.container.style.width),
                      (image.src = this.imageResourcesPath + "annotation-" + this.data.name.toLowerCase() + ".svg"),
                      (image.alt = "[{{type}} Annotation]"),
                      (image.dataset.l10nId = "text_annotation_type"),
                      (image.dataset.l10nArgs = JSON.stringify({ type: this.data.name })),
                      this.data.hasPopup || this._createPopup(this.container, image, this.data),
                      this.container.appendChild(image),
                      this.container
                    );
                  },
                }),
                TextAnnotationElement
              );
            })(),
            WidgetAnnotationElement = (function () {
              function WidgetAnnotationElement(parameters) {
                var isRenderable =
                  parameters.renderInteractiveForms || (!parameters.data.hasAppearance && !!parameters.data.fieldValue);
                AnnotationElement.call(this, parameters, isRenderable);
              }
              return (
                Util.inherit(WidgetAnnotationElement, AnnotationElement, {
                  render: function () {
                    return this.container;
                  },
                }),
                WidgetAnnotationElement
              );
            })(),
            TextWidgetAnnotationElement = (function () {
              function TextWidgetAnnotationElement(parameters) {
                WidgetAnnotationElement.call(this, parameters);
              }
              var TEXT_ALIGNMENT = ["left", "center", "right"];
              return (
                Util.inherit(TextWidgetAnnotationElement, WidgetAnnotationElement, {
                  render: function () {
                    this.container.className = "textWidgetAnnotation";
                    var element = null;
                    if (this.renderInteractiveForms) {
                      if (
                        (this.data.multiLine
                          ? ((element = document.createElement("textarea")),
                            (element.textContent = this.data.fieldValue))
                          : ((element = document.createElement("input")),
                            (element.type = "text"),
                            element.setAttribute("value", this.data.fieldValue)),
                        (element.disabled = this.data.readOnly),
                        null !== this.data.maxLen && (element.maxLength = this.data.maxLen),
                        this.data.comb)
                      ) {
                        var fieldWidth = this.data.rect[2] - this.data.rect[0],
                          combWidth = fieldWidth / this.data.maxLen;
                        element.classList.add("comb"),
                          (element.style.letterSpacing = "calc(" + combWidth + "px - 1ch)");
                      }
                    } else {
                      (element = document.createElement("div")),
                        (element.textContent = this.data.fieldValue),
                        (element.style.verticalAlign = "middle"),
                        (element.style.display = "table-cell");
                      var font = null;
                      this.data.fontRefName && (font = this.page.commonObjs.getData(this.data.fontRefName)),
                        this._setTextStyle(element, font);
                    }
                    return (
                      null !== this.data.textAlignment &&
                        (element.style.textAlign = TEXT_ALIGNMENT[this.data.textAlignment]),
                      this.container.appendChild(element),
                      this.container
                    );
                  },
                  _setTextStyle: function (element, font) {
                    var style = element.style;
                    if (
                      ((style.fontSize = this.data.fontSize + "px"),
                      (style.direction = this.data.fontDirection < 0 ? "rtl" : "ltr"),
                      font)
                    ) {
                      (style.fontWeight = font.black ? (font.bold ? "900" : "bold") : font.bold ? "bold" : "normal"),
                        (style.fontStyle = font.italic ? "italic" : "normal");
                      var fontFamily = font.loadedName ? '"' + font.loadedName + '", ' : "",
                        fallbackName = font.fallbackName || "Helvetica, sans-serif";
                      style.fontFamily = fontFamily + fallbackName;
                    }
                  },
                }),
                TextWidgetAnnotationElement
              );
            })(),
            PopupAnnotationElement = (function () {
              function PopupAnnotationElement(parameters) {
                var isRenderable = !(!parameters.data.title && !parameters.data.contents);
                AnnotationElement.call(this, parameters, isRenderable);
              }
              return (
                Util.inherit(PopupAnnotationElement, AnnotationElement, {
                  render: function () {
                    this.container.className = "popupAnnotation";
                    var selector = '[data-annotation-id="' + this.data.parentId + '"]',
                      parentElement = this.layer.querySelector(selector);
                    if (!parentElement) return this.container;
                    var popup = new PopupElement({
                        container: this.container,
                        trigger: parentElement,
                        color: this.data.color,
                        title: this.data.title,
                        contents: this.data.contents,
                      }),
                      parentLeft = parseFloat(parentElement.style.left),
                      parentWidth = parseFloat(parentElement.style.width);
                    return (
                      CustomStyle.setProp(
                        "transformOrigin",
                        this.container,
                        -(parentLeft + parentWidth) + "px -" + parentElement.style.top
                      ),
                      (this.container.style.left = parentLeft + parentWidth + "px"),
                      this.container.appendChild(popup.render()),
                      this.container
                    );
                  },
                }),
                PopupAnnotationElement
              );
            })(),
            PopupElement = (function () {
              function PopupElement(parameters) {
                (this.container = parameters.container),
                  (this.trigger = parameters.trigger),
                  (this.color = parameters.color),
                  (this.title = parameters.title),
                  (this.contents = parameters.contents),
                  (this.hideWrapper = parameters.hideWrapper || !1),
                  (this.pinned = !1);
              }
              return (
                (PopupElement.prototype = {
                  render: function () {
                    var wrapper = document.createElement("div");
                    (wrapper.className = "popupWrapper"),
                      (this.hideElement = this.hideWrapper ? wrapper : this.container),
                      this.hideElement.setAttribute("hidden", !0);
                    var popup = document.createElement("div");
                    popup.className = "popup";
                    var color = this.color;
                    if (color) {
                      var r = 0.7 * (255 - color[0]) + color[0],
                        g = 0.7 * (255 - color[1]) + color[1],
                        b = 0.7 * (255 - color[2]) + color[2];
                      popup.style.backgroundColor = Util.makeCssRgb(0 | r, 0 | g, 0 | b);
                    }
                    var contents = this._formatContents(this.contents),
                      title = document.createElement("h1");
                    return (
                      (title.textContent = this.title),
                      this.trigger.addEventListener("click", this._toggle.bind(this)),
                      this.trigger.addEventListener("mouseover", this._show.bind(this, !1)),
                      this.trigger.addEventListener("mouseout", this._hide.bind(this, !1)),
                      popup.addEventListener("click", this._hide.bind(this, !0)),
                      popup.appendChild(title),
                      popup.appendChild(contents),
                      wrapper.appendChild(popup),
                      wrapper
                    );
                  },
                  _formatContents: function (contents) {
                    for (
                      var p = document.createElement("p"),
                        lines = contents.split(/(?:\r\n?|\n)/),
                        i = 0,
                        ii = lines.length;
                      i < ii;
                      ++i
                    ) {
                      var line = lines[i];
                      p.appendChild(document.createTextNode(line)),
                        i < ii - 1 && p.appendChild(document.createElement("br"));
                    }
                    return p;
                  },
                  _toggle: function () {
                    this.pinned ? this._hide(!0) : this._show(!0);
                  },
                  _show: function (pin) {
                    pin && (this.pinned = !0),
                      this.hideElement.hasAttribute("hidden") &&
                        (this.hideElement.removeAttribute("hidden"), (this.container.style.zIndex += 1));
                  },
                  _hide: function (unpin) {
                    unpin && (this.pinned = !1),
                      this.hideElement.hasAttribute("hidden") ||
                        this.pinned ||
                        (this.hideElement.setAttribute("hidden", !0), (this.container.style.zIndex -= 1));
                  },
                }),
                PopupElement
              );
            })(),
            HighlightAnnotationElement = (function () {
              function HighlightAnnotationElement(parameters) {
                var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
                AnnotationElement.call(this, parameters, isRenderable);
              }
              return (
                Util.inherit(HighlightAnnotationElement, AnnotationElement, {
                  render: function () {
                    return (
                      (this.container.className = "highlightAnnotation"),
                      this.data.hasPopup || this._createPopup(this.container, null, this.data),
                      this.container
                    );
                  },
                }),
                HighlightAnnotationElement
              );
            })(),
            UnderlineAnnotationElement = (function () {
              function UnderlineAnnotationElement(parameters) {
                var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
                AnnotationElement.call(this, parameters, isRenderable);
              }
              return (
                Util.inherit(UnderlineAnnotationElement, AnnotationElement, {
                  render: function () {
                    return (
                      (this.container.className = "underlineAnnotation"),
                      this.data.hasPopup || this._createPopup(this.container, null, this.data),
                      this.container
                    );
                  },
                }),
                UnderlineAnnotationElement
              );
            })(),
            SquigglyAnnotationElement = (function () {
              function SquigglyAnnotationElement(parameters) {
                var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
                AnnotationElement.call(this, parameters, isRenderable);
              }
              return (
                Util.inherit(SquigglyAnnotationElement, AnnotationElement, {
                  render: function () {
                    return (
                      (this.container.className = "squigglyAnnotation"),
                      this.data.hasPopup || this._createPopup(this.container, null, this.data),
                      this.container
                    );
                  },
                }),
                SquigglyAnnotationElement
              );
            })(),
            StrikeOutAnnotationElement = (function () {
              function StrikeOutAnnotationElement(parameters) {
                var isRenderable = !!(parameters.data.hasPopup || parameters.data.title || parameters.data.contents);
                AnnotationElement.call(this, parameters, isRenderable);
              }
              return (
                Util.inherit(StrikeOutAnnotationElement, AnnotationElement, {
                  render: function () {
                    return (
                      (this.container.className = "strikeoutAnnotation"),
                      this.data.hasPopup || this._createPopup(this.container, null, this.data),
                      this.container
                    );
                  },
                }),
                StrikeOutAnnotationElement
              );
            })(),
            FileAttachmentAnnotationElement = (function () {
              function FileAttachmentAnnotationElement(parameters) {
                AnnotationElement.call(this, parameters, !0),
                  (this.filename = getFilenameFromUrl(parameters.data.file.filename)),
                  (this.content = parameters.data.file.content);
              }
              return (
                Util.inherit(FileAttachmentAnnotationElement, AnnotationElement, {
                  render: function () {
                    this.container.className = "fileAttachmentAnnotation";
                    var trigger = document.createElement("div");
                    return (
                      (trigger.style.height = this.container.style.height),
                      (trigger.style.width = this.container.style.width),
                      trigger.addEventListener("dblclick", this._download.bind(this)),
                      this.data.hasPopup ||
                        (!this.data.title && !this.data.contents) ||
                        this._createPopup(this.container, trigger, this.data),
                      this.container.appendChild(trigger),
                      this.container
                    );
                  },
                  _download: function () {
                    if (!this.downloadManager)
                      return void warn("Download cannot be started due to unavailable download manager");
                    this.downloadManager.downloadData(this.content, this.filename, "");
                  },
                }),
                FileAttachmentAnnotationElement
              );
            })(),
            AnnotationLayer = (function () {
              return {
                render: function (parameters) {
                  for (
                    var annotationElementFactory = new AnnotationElementFactory(),
                      i = 0,
                      ii = parameters.annotations.length;
                    i < ii;
                    i++
                  ) {
                    var data = parameters.annotations[i];
                    if (data) {
                      var properties = {
                          data: data,
                          layer: parameters.div,
                          page: parameters.page,
                          viewport: parameters.viewport,
                          linkService: parameters.linkService,
                          downloadManager: parameters.downloadManager,
                          imageResourcesPath: parameters.imageResourcesPath || getDefaultSetting("imageResourcesPath"),
                          renderInteractiveForms: parameters.renderInteractiveForms || !1,
                        },
                        element = annotationElementFactory.create(properties);
                      element.isRenderable && parameters.div.appendChild(element.render());
                    }
                  }
                },
                update: function (parameters) {
                  for (var i = 0, ii = parameters.annotations.length; i < ii; i++) {
                    var data = parameters.annotations[i],
                      element = parameters.div.querySelector('[data-annotation-id="' + data.id + '"]');
                    element &&
                      CustomStyle.setProp(
                        "transform",
                        element,
                        "matrix(" + parameters.viewport.transform.join(",") + ")"
                      );
                  }
                  parameters.div.removeAttribute("hidden");
                },
              };
            })();
          exports.AnnotationLayer = AnnotationLayer;
        })((root.pdfjsDisplayAnnotationLayer = {}), root.pdfjsSharedUtil, root.pdfjsDisplayDOMUtils);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil, displayDOMUtils) {
          var Util = sharedUtil.Util,
            createPromiseCapability = sharedUtil.createPromiseCapability,
            CustomStyle = displayDOMUtils.CustomStyle,
            getDefaultSetting = displayDOMUtils.getDefaultSetting,
            renderTextLayer = (function () {
              function isAllWhitespace(str) {
                return !NonWhitespaceRegexp.test(str);
              }
              function appendText(task, geom, styles) {
                var textDiv = document.createElement("div"),
                  textDivProperties = {
                    style: null,
                    angle: 0,
                    canvasWidth: 0,
                    isWhitespace: !1,
                    originalTransform: null,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    scale: 1,
                  };
                if ((task._textDivs.push(textDiv), isAllWhitespace(geom.str)))
                  return (
                    (textDivProperties.isWhitespace = !0), void task._textDivProperties.set(textDiv, textDivProperties)
                  );
                var tx = Util.transform(task._viewport.transform, geom.transform),
                  angle = Math.atan2(tx[1], tx[0]),
                  style = styles[geom.fontName];
                style.vertical && (angle += Math.PI / 2);
                var fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]),
                  fontAscent = fontHeight;
                style.ascent
                  ? (fontAscent = style.ascent * fontAscent)
                  : style.descent && (fontAscent = (1 + style.descent) * fontAscent);
                var left, top;
                if (
                  (0 === angle
                    ? ((left = tx[4]), (top = tx[5] - fontAscent))
                    : ((left = tx[4] + fontAscent * Math.sin(angle)), (top = tx[5] - fontAscent * Math.cos(angle))),
                  (styleBuf[1] = left),
                  (styleBuf[3] = top),
                  (styleBuf[5] = fontHeight),
                  (styleBuf[7] = style.fontFamily),
                  (textDivProperties.style = styleBuf.join("")),
                  textDiv.setAttribute("style", textDivProperties.style),
                  (textDiv.textContent = geom.str),
                  getDefaultSetting("pdfBug") && (textDiv.dataset.fontName = geom.fontName),
                  0 !== angle && (textDivProperties.angle = angle * (180 / Math.PI)),
                  geom.str.length > 1 &&
                    (style.vertical
                      ? (textDivProperties.canvasWidth = geom.height * task._viewport.scale)
                      : (textDivProperties.canvasWidth = geom.width * task._viewport.scale)),
                  task._textDivProperties.set(textDiv, textDivProperties),
                  task._enhanceTextSelection)
                ) {
                  var angleCos = 1,
                    angleSin = 0;
                  0 !== angle && ((angleCos = Math.cos(angle)), (angleSin = Math.sin(angle)));
                  var m,
                    b,
                    divWidth = (style.vertical ? geom.height : geom.width) * task._viewport.scale,
                    divHeight = fontHeight;
                  0 !== angle
                    ? ((m = [angleCos, angleSin, -angleSin, angleCos, left, top]),
                      (b = Util.getAxialAlignedBoundingBox([0, 0, divWidth, divHeight], m)))
                    : (b = [left, top, left + divWidth, top + divHeight]),
                    task._bounds.push({
                      left: b[0],
                      top: b[1],
                      right: b[2],
                      bottom: b[3],
                      div: textDiv,
                      size: [divWidth, divHeight],
                      m: m,
                    });
                }
              }
              function render(task) {
                if (!task._canceled) {
                  var textLayerFrag = task._container,
                    textDivs = task._textDivs,
                    capability = task._capability,
                    textDivsLength = textDivs.length;
                  if (textDivsLength > MAX_TEXT_DIVS_TO_RENDER)
                    return (task._renderingDone = !0), void capability.resolve();
                  var canvas = document.createElement("canvas");
                  canvas.mozOpaque = !0;
                  for (
                    var lastFontSize, lastFontFamily, ctx = canvas.getContext("2d", { alpha: !1 }), i = 0;
                    i < textDivsLength;
                    i++
                  ) {
                    var textDiv = textDivs[i],
                      textDivProperties = task._textDivProperties.get(textDiv);
                    if (!textDivProperties.isWhitespace) {
                      var fontSize = textDiv.style.fontSize,
                        fontFamily = textDiv.style.fontFamily;
                      (fontSize === lastFontSize && fontFamily === lastFontFamily) ||
                        ((ctx.font = fontSize + " " + fontFamily),
                        (lastFontSize = fontSize),
                        (lastFontFamily = fontFamily));
                      var width = ctx.measureText(textDiv.textContent).width;
                      textLayerFrag.appendChild(textDiv);
                      var transform = "";
                      0 !== textDivProperties.canvasWidth &&
                        width > 0 &&
                        ((textDivProperties.scale = textDivProperties.canvasWidth / width),
                        (transform = "scaleX(" + textDivProperties.scale + ")")),
                        0 !== textDivProperties.angle &&
                          (transform = "rotate(" + textDivProperties.angle + "deg) " + transform),
                        "" !== transform &&
                          ((textDivProperties.originalTransform = transform),
                          CustomStyle.setProp("transform", textDiv, transform)),
                        task._textDivProperties.set(textDiv, textDivProperties);
                    }
                  }
                  (task._renderingDone = !0), capability.resolve();
                }
              }
              function expand(task) {
                for (
                  var bounds = task._bounds,
                    viewport = task._viewport,
                    expanded = expandBounds(viewport.width, viewport.height, bounds),
                    i = 0;
                  i < expanded.length;
                  i++
                ) {
                  var div = bounds[i].div,
                    divProperties = task._textDivProperties.get(div);
                  if (0 !== divProperties.angle) {
                    var e = expanded[i],
                      b = bounds[i],
                      m = b.m,
                      c = m[0],
                      s = m[1],
                      points = [[0, 0], [0, b.size[1]], [b.size[0], 0], b.size],
                      ts = new Float64Array(64);
                    points.forEach(function (p, i) {
                      var t = Util.applyTransform(p, m);
                      (ts[i + 0] = c && (e.left - t[0]) / c),
                        (ts[i + 4] = s && (e.top - t[1]) / s),
                        (ts[i + 8] = c && (e.right - t[0]) / c),
                        (ts[i + 12] = s && (e.bottom - t[1]) / s),
                        (ts[i + 16] = s && (e.left - t[0]) / -s),
                        (ts[i + 20] = c && (e.top - t[1]) / c),
                        (ts[i + 24] = s && (e.right - t[0]) / -s),
                        (ts[i + 28] = c && (e.bottom - t[1]) / c),
                        (ts[i + 32] = c && (e.left - t[0]) / -c),
                        (ts[i + 36] = s && (e.top - t[1]) / -s),
                        (ts[i + 40] = c && (e.right - t[0]) / -c),
                        (ts[i + 44] = s && (e.bottom - t[1]) / -s),
                        (ts[i + 48] = s && (e.left - t[0]) / s),
                        (ts[i + 52] = c && (e.top - t[1]) / -c),
                        (ts[i + 56] = s && (e.right - t[0]) / s),
                        (ts[i + 60] = c && (e.bottom - t[1]) / -c);
                    });
                    var findPositiveMin = function (ts, offset, count) {
                        for (var result = 0, i = 0; i < count; i++) {
                          var t = ts[offset++];
                          t > 0 && (result = result ? Math.min(t, result) : t);
                        }
                        return result;
                      },
                      boxScale = 1 + Math.min(Math.abs(c), Math.abs(s));
                    (divProperties.paddingLeft = findPositiveMin(ts, 32, 16) / boxScale),
                      (divProperties.paddingTop = findPositiveMin(ts, 48, 16) / boxScale),
                      (divProperties.paddingRight = findPositiveMin(ts, 0, 16) / boxScale),
                      (divProperties.paddingBottom = findPositiveMin(ts, 16, 16) / boxScale),
                      task._textDivProperties.set(div, divProperties);
                  } else
                    (divProperties.paddingLeft = bounds[i].left - expanded[i].left),
                      (divProperties.paddingTop = bounds[i].top - expanded[i].top),
                      (divProperties.paddingRight = expanded[i].right - bounds[i].right),
                      (divProperties.paddingBottom = expanded[i].bottom - bounds[i].bottom),
                      task._textDivProperties.set(div, divProperties);
                }
              }
              function expandBounds(width, height, boxes) {
                var bounds = boxes.map(function (box, i) {
                  return {
                    x1: box.left,
                    y1: box.top,
                    x2: box.right,
                    y2: box.bottom,
                    index: i,
                    x1New: void 0,
                    x2New: void 0,
                  };
                });
                expandBoundsLTR(width, bounds);
                var expanded = new Array(boxes.length);
                return (
                  bounds.forEach(function (b) {
                    var i = b.index;
                    expanded[i] = { left: b.x1New, top: 0, right: b.x2New, bottom: 0 };
                  }),
                  boxes.map(function (box, i) {
                    var e = expanded[i],
                      b = bounds[i];
                    (b.x1 = box.top),
                      (b.y1 = width - e.right),
                      (b.x2 = box.bottom),
                      (b.y2 = width - e.left),
                      (b.index = i),
                      (b.x1New = void 0),
                      (b.x2New = void 0);
                  }),
                  expandBoundsLTR(height, bounds),
                  bounds.forEach(function (b) {
                    var i = b.index;
                    (expanded[i].top = b.x1New), (expanded[i].bottom = b.x2New);
                  }),
                  expanded
                );
              }
              function expandBoundsLTR(width, bounds) {
                bounds.sort(function (a, b) {
                  return a.x1 - b.x1 || a.index - b.index;
                });
                var fakeBoundary = { x1: -1 / 0, y1: -1 / 0, x2: 0, y2: 1 / 0, index: -1, x1New: 0, x2New: 0 },
                  horizon = [{ start: -1 / 0, end: 1 / 0, boundary: fakeBoundary }];
                bounds.forEach(function (boundary) {
                  for (var i = 0; i < horizon.length && horizon[i].end <= boundary.y1; ) i++;
                  for (var j = horizon.length - 1; j >= 0 && horizon[j].start >= boundary.y2; ) j--;
                  var horizonPart,
                    affectedBoundary,
                    q,
                    k,
                    maxXNew = -1 / 0;
                  for (q = i; q <= j; q++) {
                    (horizonPart = horizon[q]), (affectedBoundary = horizonPart.boundary);
                    var xNew;
                    (xNew =
                      affectedBoundary.x2 > boundary.x1
                        ? affectedBoundary.index > boundary.index
                          ? affectedBoundary.x1New
                          : boundary.x1
                        : void 0 === affectedBoundary.x2New
                        ? (affectedBoundary.x2 + boundary.x1) / 2
                        : affectedBoundary.x2New),
                      xNew > maxXNew && (maxXNew = xNew);
                  }
                  for (boundary.x1New = maxXNew, q = i; q <= j; q++)
                    (horizonPart = horizon[q]),
                      (affectedBoundary = horizonPart.boundary),
                      void 0 === affectedBoundary.x2New
                        ? affectedBoundary.x2 > boundary.x1
                          ? affectedBoundary.index > boundary.index && (affectedBoundary.x2New = affectedBoundary.x2)
                          : (affectedBoundary.x2New = maxXNew)
                        : affectedBoundary.x2New > maxXNew &&
                          (affectedBoundary.x2New = Math.max(maxXNew, affectedBoundary.x2));
                  var changedHorizon = [],
                    lastBoundary = null;
                  for (q = i; q <= j; q++) {
                    (horizonPart = horizon[q]), (affectedBoundary = horizonPart.boundary);
                    var useBoundary = affectedBoundary.x2 > boundary.x2 ? affectedBoundary : boundary;
                    lastBoundary === useBoundary
                      ? (changedHorizon[changedHorizon.length - 1].end = horizonPart.end)
                      : (changedHorizon.push({ start: horizonPart.start, end: horizonPart.end, boundary: useBoundary }),
                        (lastBoundary = useBoundary));
                  }
                  for (
                    horizon[i].start < boundary.y1 &&
                      ((changedHorizon[0].start = boundary.y1),
                      changedHorizon.unshift({
                        start: horizon[i].start,
                        end: boundary.y1,
                        boundary: horizon[i].boundary,
                      })),
                      boundary.y2 < horizon[j].end &&
                        ((changedHorizon[changedHorizon.length - 1].end = boundary.y2),
                        changedHorizon.push({
                          start: boundary.y2,
                          end: horizon[j].end,
                          boundary: horizon[j].boundary,
                        })),
                      q = i;
                    q <= j;
                    q++
                  )
                    if (
                      ((horizonPart = horizon[q]),
                      (affectedBoundary = horizonPart.boundary),
                      void 0 === affectedBoundary.x2New)
                    ) {
                      var used = !1;
                      for (k = i - 1; !used && k >= 0 && horizon[k].start >= affectedBoundary.y1; k--)
                        used = horizon[k].boundary === affectedBoundary;
                      for (k = j + 1; !used && k < horizon.length && horizon[k].end <= affectedBoundary.y2; k++)
                        used = horizon[k].boundary === affectedBoundary;
                      for (k = 0; !used && k < changedHorizon.length; k++)
                        used = changedHorizon[k].boundary === affectedBoundary;
                      used || (affectedBoundary.x2New = maxXNew);
                    }
                  Array.prototype.splice.apply(horizon, [i, j - i + 1].concat(changedHorizon));
                }),
                  horizon.forEach(function (horizonPart) {
                    var affectedBoundary = horizonPart.boundary;
                    void 0 === affectedBoundary.x2New &&
                      (affectedBoundary.x2New = Math.max(width, affectedBoundary.x2));
                  });
              }
              function TextLayerRenderTask(textContent, container, viewport, textDivs, enhanceTextSelection) {
                (this._textContent = textContent),
                  (this._container = container),
                  (this._viewport = viewport),
                  (this._textDivs = textDivs || []),
                  (this._textDivProperties = new WeakMap()),
                  (this._renderingDone = !1),
                  (this._canceled = !1),
                  (this._capability = createPromiseCapability()),
                  (this._renderTimer = null),
                  (this._bounds = []),
                  (this._enhanceTextSelection = !!enhanceTextSelection);
              }
              function renderTextLayer(renderParameters) {
                var task = new TextLayerRenderTask(
                  renderParameters.textContent,
                  renderParameters.container,
                  renderParameters.viewport,
                  renderParameters.textDivs,
                  renderParameters.enhanceTextSelection
                );
                return task._render(renderParameters.timeout), task;
              }
              var MAX_TEXT_DIVS_TO_RENDER = 1e5,
                NonWhitespaceRegexp = /\S/,
                styleBuf = ["left: ", 0, "px; top: ", 0, "px; font-size: ", 0, "px; font-family: ", "", ";"];
              return (
                (TextLayerRenderTask.prototype = {
                  get promise() {
                    return this._capability.promise;
                  },
                  cancel: function () {
                    (this._canceled = !0),
                      null !== this._renderTimer && (clearTimeout(this._renderTimer), (this._renderTimer = null)),
                      this._capability.reject("canceled");
                  },
                  _render: function (timeout) {
                    for (
                      var textItems = this._textContent.items,
                        textStyles = this._textContent.styles,
                        i = 0,
                        len = textItems.length;
                      i < len;
                      i++
                    )
                      appendText(this, textItems[i], textStyles);
                    if (timeout) {
                      var self = this;
                      this._renderTimer = setTimeout(function () {
                        render(self), (self._renderTimer = null);
                      }, timeout);
                    } else render(this);
                  },
                  expandTextDivs: function (expandDivs) {
                    if (this._enhanceTextSelection && this._renderingDone) {
                      null !== this._bounds && (expand(this), (this._bounds = null));
                      for (var i = 0, ii = this._textDivs.length; i < ii; i++) {
                        var div = this._textDivs[i],
                          divProperties = this._textDivProperties.get(div);
                        if (!divProperties.isWhitespace)
                          if (expandDivs) {
                            var transform = "",
                              padding = "";
                            1 !== divProperties.scale && (transform = "scaleX(" + divProperties.scale + ")"),
                              0 !== divProperties.angle &&
                                (transform = "rotate(" + divProperties.angle + "deg) " + transform),
                              0 !== divProperties.paddingLeft &&
                                ((padding +=
                                  " padding-left: " + divProperties.paddingLeft / divProperties.scale + "px;"),
                                (transform +=
                                  " translateX(" + -divProperties.paddingLeft / divProperties.scale + "px)")),
                              0 !== divProperties.paddingTop &&
                                ((padding += " padding-top: " + divProperties.paddingTop + "px;"),
                                (transform += " translateY(" + -divProperties.paddingTop + "px)")),
                              0 !== divProperties.paddingRight &&
                                (padding +=
                                  " padding-right: " + divProperties.paddingRight / divProperties.scale + "px;"),
                              0 !== divProperties.paddingBottom &&
                                (padding += " padding-bottom: " + divProperties.paddingBottom + "px;"),
                              "" !== padding && div.setAttribute("style", divProperties.style + padding),
                              "" !== transform && CustomStyle.setProp("transform", div, transform);
                          } else
                            (div.style.padding = 0),
                              CustomStyle.setProp("transform", div, divProperties.originalTransform || "");
                      }
                    }
                  },
                }),
                renderTextLayer
              );
            })();
          exports.renderTextLayer = renderTextLayer;
        })((root.pdfjsDisplayTextLayer = {}), root.pdfjsSharedUtil, root.pdfjsDisplayDOMUtils);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil, displayDOMUtils) {
          var shadow = sharedUtil.shadow,
            getDefaultSetting = displayDOMUtils.getDefaultSetting,
            WebGLUtils = (function () {
              function loadShader(gl, code, shaderType) {
                var shader = gl.createShader(shaderType);
                if (
                  (gl.shaderSource(shader, code),
                  gl.compileShader(shader),
                  !gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                ) {
                  var errorMsg = gl.getShaderInfoLog(shader);
                  throw new Error("Error during shader compilation: " + errorMsg);
                }
                return shader;
              }
              function createVertexShader(gl, code) {
                return loadShader(gl, code, gl.VERTEX_SHADER);
              }
              function createFragmentShader(gl, code) {
                return loadShader(gl, code, gl.FRAGMENT_SHADER);
              }
              function createProgram(gl, shaders) {
                for (var program = gl.createProgram(), i = 0, ii = shaders.length; i < ii; ++i)
                  gl.attachShader(program, shaders[i]);
                if ((gl.linkProgram(program), !gl.getProgramParameter(program, gl.LINK_STATUS))) {
                  var errorMsg = gl.getProgramInfoLog(program);
                  throw new Error("Error during program linking: " + errorMsg);
                }
                return program;
              }
              function createTexture(gl, image, textureId) {
                gl.activeTexture(textureId);
                var texture = gl.createTexture();
                return (
                  gl.bindTexture(gl.TEXTURE_2D, texture),
                  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
                  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
                  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST),
                  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST),
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image),
                  texture
                );
              }
              function generateGL() {
                currentGL ||
                  ((currentCanvas = document.createElement("canvas")),
                  (currentGL = currentCanvas.getContext("webgl", { premultipliedalpha: !1 })));
              }
              function initSmaskGL() {
                var canvas, gl;
                generateGL(), (canvas = currentCanvas), (currentCanvas = null), (gl = currentGL), (currentGL = null);
                var vertexShader = createVertexShader(gl, smaskVertexShaderCode),
                  fragmentShader = createFragmentShader(gl, smaskFragmentShaderCode),
                  program = createProgram(gl, [vertexShader, fragmentShader]);
                gl.useProgram(program);
                var cache = {};
                (cache.gl = gl),
                  (cache.canvas = canvas),
                  (cache.resolutionLocation = gl.getUniformLocation(program, "u_resolution")),
                  (cache.positionLocation = gl.getAttribLocation(program, "a_position")),
                  (cache.backdropLocation = gl.getUniformLocation(program, "u_backdrop")),
                  (cache.subtypeLocation = gl.getUniformLocation(program, "u_subtype"));
                var texCoordLocation = gl.getAttribLocation(program, "a_texCoord"),
                  texLayerLocation = gl.getUniformLocation(program, "u_image"),
                  texMaskLocation = gl.getUniformLocation(program, "u_mask"),
                  texCoordBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer),
                  gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
                    gl.STATIC_DRAW
                  ),
                  gl.enableVertexAttribArray(texCoordLocation),
                  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, !1, 0, 0),
                  gl.uniform1i(texLayerLocation, 0),
                  gl.uniform1i(texMaskLocation, 1),
                  (smaskCache = cache);
              }
              function composeSMask(layer, mask, properties) {
                var width = layer.width,
                  height = layer.height;
                smaskCache || initSmaskGL();
                var cache = smaskCache,
                  canvas = cache.canvas,
                  gl = cache.gl;
                (canvas.width = width),
                  (canvas.height = height),
                  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight),
                  gl.uniform2f(cache.resolutionLocation, width, height),
                  properties.backdrop
                    ? gl.uniform4f(
                        cache.resolutionLocation,
                        properties.backdrop[0],
                        properties.backdrop[1],
                        properties.backdrop[2],
                        1
                      )
                    : gl.uniform4f(cache.resolutionLocation, 0, 0, 0, 0),
                  gl.uniform1i(cache.subtypeLocation, "Luminosity" === properties.subtype ? 1 : 0);
                var texture = createTexture(gl, layer, gl.TEXTURE0),
                  maskTexture = createTexture(gl, mask, gl.TEXTURE1),
                  buffer = gl.createBuffer();
                return (
                  gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
                  gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([0, 0, width, 0, 0, height, 0, height, width, 0, width, height]),
                    gl.STATIC_DRAW
                  ),
                  gl.enableVertexAttribArray(cache.positionLocation),
                  gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, !1, 0, 0),
                  gl.clearColor(0, 0, 0, 0),
                  gl.enable(gl.BLEND),
                  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA),
                  gl.clear(gl.COLOR_BUFFER_BIT),
                  gl.drawArrays(gl.TRIANGLES, 0, 6),
                  gl.flush(),
                  gl.deleteTexture(texture),
                  gl.deleteTexture(maskTexture),
                  gl.deleteBuffer(buffer),
                  canvas
                );
              }
              function initFiguresGL() {
                var canvas, gl;
                generateGL(), (canvas = currentCanvas), (currentCanvas = null), (gl = currentGL), (currentGL = null);
                var vertexShader = createVertexShader(gl, figuresVertexShaderCode),
                  fragmentShader = createFragmentShader(gl, figuresFragmentShaderCode),
                  program = createProgram(gl, [vertexShader, fragmentShader]);
                gl.useProgram(program);
                var cache = {};
                (cache.gl = gl),
                  (cache.canvas = canvas),
                  (cache.resolutionLocation = gl.getUniformLocation(program, "u_resolution")),
                  (cache.scaleLocation = gl.getUniformLocation(program, "u_scale")),
                  (cache.offsetLocation = gl.getUniformLocation(program, "u_offset")),
                  (cache.positionLocation = gl.getAttribLocation(program, "a_position")),
                  (cache.colorLocation = gl.getAttribLocation(program, "a_color")),
                  (figuresCache = cache);
              }
              function drawFigures(width, height, backgroundColor, figures, context) {
                figuresCache || initFiguresGL();
                var cache = figuresCache,
                  canvas = cache.canvas,
                  gl = cache.gl;
                (canvas.width = width),
                  (canvas.height = height),
                  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight),
                  gl.uniform2f(cache.resolutionLocation, width, height);
                var i,
                  ii,
                  rows,
                  count = 0;
                for (i = 0, ii = figures.length; i < ii; i++)
                  switch (figures[i].type) {
                    case "lattice":
                      (rows = (figures[i].coords.length / figures[i].verticesPerRow) | 0),
                        (count += (rows - 1) * (figures[i].verticesPerRow - 1) * 6);
                      break;
                    case "triangles":
                      count += figures[i].coords.length;
                  }
                var coords = new Float32Array(2 * count),
                  colors = new Uint8Array(3 * count),
                  coordsMap = context.coords,
                  colorsMap = context.colors,
                  pIndex = 0,
                  cIndex = 0;
                for (i = 0, ii = figures.length; i < ii; i++) {
                  var figure = figures[i],
                    ps = figure.coords,
                    cs = figure.colors;
                  switch (figure.type) {
                    case "lattice":
                      var cols = figure.verticesPerRow;
                      rows = (ps.length / cols) | 0;
                      for (var row = 1; row < rows; row++)
                        for (var offset = row * cols + 1, col = 1; col < cols; col++, offset++)
                          (coords[pIndex] = coordsMap[ps[offset - cols - 1]]),
                            (coords[pIndex + 1] = coordsMap[ps[offset - cols - 1] + 1]),
                            (coords[pIndex + 2] = coordsMap[ps[offset - cols]]),
                            (coords[pIndex + 3] = coordsMap[ps[offset - cols] + 1]),
                            (coords[pIndex + 4] = coordsMap[ps[offset - 1]]),
                            (coords[pIndex + 5] = coordsMap[ps[offset - 1] + 1]),
                            (colors[cIndex] = colorsMap[cs[offset - cols - 1]]),
                            (colors[cIndex + 1] = colorsMap[cs[offset - cols - 1] + 1]),
                            (colors[cIndex + 2] = colorsMap[cs[offset - cols - 1] + 2]),
                            (colors[cIndex + 3] = colorsMap[cs[offset - cols]]),
                            (colors[cIndex + 4] = colorsMap[cs[offset - cols] + 1]),
                            (colors[cIndex + 5] = colorsMap[cs[offset - cols] + 2]),
                            (colors[cIndex + 6] = colorsMap[cs[offset - 1]]),
                            (colors[cIndex + 7] = colorsMap[cs[offset - 1] + 1]),
                            (colors[cIndex + 8] = colorsMap[cs[offset - 1] + 2]),
                            (coords[pIndex + 6] = coords[pIndex + 2]),
                            (coords[pIndex + 7] = coords[pIndex + 3]),
                            (coords[pIndex + 8] = coords[pIndex + 4]),
                            (coords[pIndex + 9] = coords[pIndex + 5]),
                            (coords[pIndex + 10] = coordsMap[ps[offset]]),
                            (coords[pIndex + 11] = coordsMap[ps[offset] + 1]),
                            (colors[cIndex + 9] = colors[cIndex + 3]),
                            (colors[cIndex + 10] = colors[cIndex + 4]),
                            (colors[cIndex + 11] = colors[cIndex + 5]),
                            (colors[cIndex + 12] = colors[cIndex + 6]),
                            (colors[cIndex + 13] = colors[cIndex + 7]),
                            (colors[cIndex + 14] = colors[cIndex + 8]),
                            (colors[cIndex + 15] = colorsMap[cs[offset]]),
                            (colors[cIndex + 16] = colorsMap[cs[offset] + 1]),
                            (colors[cIndex + 17] = colorsMap[cs[offset] + 2]),
                            (pIndex += 12),
                            (cIndex += 18);
                      break;
                    case "triangles":
                      for (var j = 0, jj = ps.length; j < jj; j++)
                        (coords[pIndex] = coordsMap[ps[j]]),
                          (coords[pIndex + 1] = coordsMap[ps[j] + 1]),
                          (colors[cIndex] = colorsMap[cs[j]]),
                          (colors[cIndex + 1] = colorsMap[cs[j] + 1]),
                          (colors[cIndex + 2] = colorsMap[cs[j] + 2]),
                          (pIndex += 2),
                          (cIndex += 3);
                  }
                }
                backgroundColor
                  ? gl.clearColor(backgroundColor[0] / 255, backgroundColor[1] / 255, backgroundColor[2] / 255, 1)
                  : gl.clearColor(0, 0, 0, 0),
                  gl.clear(gl.COLOR_BUFFER_BIT);
                var coordsBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer),
                  gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW),
                  gl.enableVertexAttribArray(cache.positionLocation),
                  gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, !1, 0, 0);
                var colorsBuffer = gl.createBuffer();
                return (
                  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer),
                  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW),
                  gl.enableVertexAttribArray(cache.colorLocation),
                  gl.vertexAttribPointer(cache.colorLocation, 3, gl.UNSIGNED_BYTE, !1, 0, 0),
                  gl.uniform2f(cache.scaleLocation, context.scaleX, context.scaleY),
                  gl.uniform2f(cache.offsetLocation, context.offsetX, context.offsetY),
                  gl.drawArrays(gl.TRIANGLES, 0, count),
                  gl.flush(),
                  gl.deleteBuffer(coordsBuffer),
                  gl.deleteBuffer(colorsBuffer),
                  canvas
                );
              }
              function cleanup() {
                smaskCache && smaskCache.canvas && ((smaskCache.canvas.width = 0), (smaskCache.canvas.height = 0)),
                  figuresCache &&
                    figuresCache.canvas &&
                    ((figuresCache.canvas.width = 0), (figuresCache.canvas.height = 0)),
                  (smaskCache = null),
                  (figuresCache = null);
              }
              var currentGL,
                currentCanvas,
                smaskVertexShaderCode =
                  "  attribute vec2 a_position;                                      attribute vec2 a_texCoord;                                                                                                      uniform vec2 u_resolution;                                                                                                      varying vec2 v_texCoord;                                                                                                        void main() {                                                     vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;       gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);                                                                              v_texCoord = a_texCoord;                                      }                                                             ",
                smaskFragmentShaderCode =
                  "  precision mediump float;                                                                                                        uniform vec4 u_backdrop;                                        uniform int u_subtype;                                          uniform sampler2D u_image;                                      uniform sampler2D u_mask;                                                                                                       varying vec2 v_texCoord;                                                                                                        void main() {                                                     vec4 imageColor = texture2D(u_image, v_texCoord);               vec4 maskColor = texture2D(u_mask, v_texCoord);                 if (u_backdrop.a > 0.0) {                                         maskColor.rgb = maskColor.rgb * maskColor.a +                                   u_backdrop.rgb * (1.0 - maskColor.a);         }                                                               float lum;                                                      if (u_subtype == 0) {                                             lum = maskColor.a;                                            } else {                                                          lum = maskColor.r * 0.3 + maskColor.g * 0.59 +                        maskColor.b * 0.11;                                     }                                                               imageColor.a *= lum;                                            imageColor.rgb *= imageColor.a;                                 gl_FragColor = imageColor;                                    }                                                             ",
                smaskCache = null,
                figuresVertexShaderCode =
                  "  attribute vec2 a_position;                                      attribute vec3 a_color;                                                                                                         uniform vec2 u_resolution;                                      uniform vec2 u_scale;                                           uniform vec2 u_offset;                                                                                                          varying vec4 v_color;                                                                                                           void main() {                                                     vec2 position = (a_position + u_offset) * u_scale;              vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;         gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);                                                                              v_color = vec4(a_color / 255.0, 1.0);                         }                                                             ",
                figuresFragmentShaderCode =
                  "  precision mediump float;                                                                                                        varying vec4 v_color;                                                                                                           void main() {                                                     gl_FragColor = v_color;                                       }                                                             ",
                figuresCache = null;
              return {
                get isEnabled() {
                  if (getDefaultSetting("disableWebGL")) return !1;
                  var enabled = !1;
                  try {
                    generateGL(), (enabled = !!currentGL);
                  } catch (e) {}
                  return shadow(this, "isEnabled", enabled);
                },
                composeSMask: composeSMask,
                drawFigures: drawFigures,
                clear: cleanup,
              };
            })();
          exports.WebGLUtils = WebGLUtils;
        })((root.pdfjsDisplayWebGL = {}), root.pdfjsSharedUtil, root.pdfjsDisplayDOMUtils);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil, displayWebGL) {
          function getShadingPatternFromIR(raw) {
            var shadingIR = ShadingIRs[raw[0]];
            return shadingIR || error("Unknown IR type: " + raw[0]), shadingIR.fromIR(raw);
          }
          var Util = sharedUtil.Util,
            info = sharedUtil.info,
            isArray = sharedUtil.isArray,
            error = sharedUtil.error,
            WebGLUtils = displayWebGL.WebGLUtils,
            ShadingIRs = {};
          ShadingIRs.RadialAxial = {
            fromIR: function (raw) {
              var type = raw[1],
                colorStops = raw[2],
                p0 = raw[3],
                p1 = raw[4],
                r0 = raw[5],
                r1 = raw[6];
              return {
                type: "Pattern",
                getPattern: function (ctx) {
                  var grad;
                  "axial" === type
                    ? (grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]))
                    : "radial" === type && (grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1));
                  for (var i = 0, ii = colorStops.length; i < ii; ++i) {
                    var c = colorStops[i];
                    grad.addColorStop(c[0], c[1]);
                  }
                  return grad;
                },
              };
            },
          };
          var createMeshCanvas = (function () {
            function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {
              var tmp,
                coords = context.coords,
                colors = context.colors,
                bytes = data.data,
                rowSize = 4 * data.width;
              coords[p1 + 1] > coords[p2 + 1] && ((tmp = p1), (p1 = p2), (p2 = tmp), (tmp = c1), (c1 = c2), (c2 = tmp)),
                coords[p2 + 1] > coords[p3 + 1] &&
                  ((tmp = p2), (p2 = p3), (p3 = tmp), (tmp = c2), (c2 = c3), (c3 = tmp)),
                coords[p1 + 1] > coords[p2 + 1] &&
                  ((tmp = p1), (p1 = p2), (p2 = tmp), (tmp = c1), (c1 = c2), (c2 = tmp));
              var x1 = (coords[p1] + context.offsetX) * context.scaleX,
                y1 = (coords[p1 + 1] + context.offsetY) * context.scaleY,
                x2 = (coords[p2] + context.offsetX) * context.scaleX,
                y2 = (coords[p2 + 1] + context.offsetY) * context.scaleY,
                x3 = (coords[p3] + context.offsetX) * context.scaleX,
                y3 = (coords[p3 + 1] + context.offsetY) * context.scaleY;
              if (!(y1 >= y3))
                for (
                  var xa,
                    car,
                    cag,
                    cab,
                    xb,
                    cbr,
                    cbg,
                    cbb,
                    k,
                    c1r = colors[c1],
                    c1g = colors[c1 + 1],
                    c1b = colors[c1 + 2],
                    c2r = colors[c2],
                    c2g = colors[c2 + 1],
                    c2b = colors[c2 + 2],
                    c3r = colors[c3],
                    c3g = colors[c3 + 1],
                    c3b = colors[c3 + 2],
                    minY = Math.round(y1),
                    maxY = Math.round(y3),
                    y = minY;
                  y <= maxY;
                  y++
                ) {
                  y < y2
                    ? ((k = y < y1 ? 0 : y1 === y2 ? 1 : (y1 - y) / (y1 - y2)),
                      (xa = x1 - (x1 - x2) * k),
                      (car = c1r - (c1r - c2r) * k),
                      (cag = c1g - (c1g - c2g) * k),
                      (cab = c1b - (c1b - c2b) * k))
                    : ((k = y > y3 ? 1 : y2 === y3 ? 0 : (y2 - y) / (y2 - y3)),
                      (xa = x2 - (x2 - x3) * k),
                      (car = c2r - (c2r - c3r) * k),
                      (cag = c2g - (c2g - c3g) * k),
                      (cab = c2b - (c2b - c3b) * k)),
                    (k = y < y1 ? 0 : y > y3 ? 1 : (y1 - y) / (y1 - y3)),
                    (xb = x1 - (x1 - x3) * k),
                    (cbr = c1r - (c1r - c3r) * k),
                    (cbg = c1g - (c1g - c3g) * k),
                    (cbb = c1b - (c1b - c3b) * k);
                  for (
                    var x1_ = Math.round(Math.min(xa, xb)),
                      x2_ = Math.round(Math.max(xa, xb)),
                      j = rowSize * y + 4 * x1_,
                      x = x1_;
                    x <= x2_;
                    x++
                  )
                    (k = (xa - x) / (xa - xb)),
                      (k = k < 0 ? 0 : k > 1 ? 1 : k),
                      (bytes[j++] = (car - (car - cbr) * k) | 0),
                      (bytes[j++] = (cag - (cag - cbg) * k) | 0),
                      (bytes[j++] = (cab - (cab - cbb) * k) | 0),
                      (bytes[j++] = 255);
                }
            }
            function drawFigure(data, figure, context) {
              var i,
                ii,
                ps = figure.coords,
                cs = figure.colors;
              switch (figure.type) {
                case "lattice":
                  var verticesPerRow = figure.verticesPerRow,
                    rows = Math.floor(ps.length / verticesPerRow) - 1,
                    cols = verticesPerRow - 1;
                  for (i = 0; i < rows; i++)
                    for (var q = i * verticesPerRow, j = 0; j < cols; j++, q++)
                      drawTriangle(
                        data,
                        context,
                        ps[q],
                        ps[q + 1],
                        ps[q + verticesPerRow],
                        cs[q],
                        cs[q + 1],
                        cs[q + verticesPerRow]
                      ),
                        drawTriangle(
                          data,
                          context,
                          ps[q + verticesPerRow + 1],
                          ps[q + 1],
                          ps[q + verticesPerRow],
                          cs[q + verticesPerRow + 1],
                          cs[q + 1],
                          cs[q + verticesPerRow]
                        );
                  break;
                case "triangles":
                  for (i = 0, ii = ps.length; i < ii; i += 3)
                    drawTriangle(data, context, ps[i], ps[i + 1], ps[i + 2], cs[i], cs[i + 1], cs[i + 2]);
                  break;
                default:
                  error("illigal figure");
              }
            }
            function createMeshCanvas(bounds, combinesScale, coords, colors, figures, backgroundColor, cachedCanvases) {
              var canvas,
                tmpCanvas,
                i,
                ii,
                offsetX = Math.floor(bounds[0]),
                offsetY = Math.floor(bounds[1]),
                boundsWidth = Math.ceil(bounds[2]) - offsetX,
                boundsHeight = Math.ceil(bounds[3]) - offsetY,
                width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] * 1.1)), 3e3),
                height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] * 1.1)), 3e3),
                scaleX = boundsWidth / width,
                scaleY = boundsHeight / height,
                context = {
                  coords: coords,
                  colors: colors,
                  offsetX: -offsetX,
                  offsetY: -offsetY,
                  scaleX: 1 / scaleX,
                  scaleY: 1 / scaleY,
                },
                paddedWidth = width + 4,
                paddedHeight = height + 4;
              if (WebGLUtils.isEnabled)
                (canvas = WebGLUtils.drawFigures(width, height, backgroundColor, figures, context)),
                  (tmpCanvas = cachedCanvases.getCanvas("mesh", paddedWidth, paddedHeight, !1)),
                  tmpCanvas.context.drawImage(canvas, 2, 2),
                  (canvas = tmpCanvas.canvas);
              else {
                tmpCanvas = cachedCanvases.getCanvas("mesh", paddedWidth, paddedHeight, !1);
                var tmpCtx = tmpCanvas.context,
                  data = tmpCtx.createImageData(width, height);
                if (backgroundColor) {
                  var bytes = data.data;
                  for (i = 0, ii = bytes.length; i < ii; i += 4)
                    (bytes[i] = backgroundColor[0]),
                      (bytes[i + 1] = backgroundColor[1]),
                      (bytes[i + 2] = backgroundColor[2]),
                      (bytes[i + 3] = 255);
                }
                for (i = 0; i < figures.length; i++) drawFigure(data, figures[i], context);
                tmpCtx.putImageData(data, 2, 2), (canvas = tmpCanvas.canvas);
              }
              return {
                canvas: canvas,
                offsetX: offsetX - 2 * scaleX,
                offsetY: offsetY - 2 * scaleY,
                scaleX: scaleX,
                scaleY: scaleY,
              };
            }
            return createMeshCanvas;
          })();
          (ShadingIRs.Mesh = {
            fromIR: function (raw) {
              var coords = raw[2],
                colors = raw[3],
                figures = raw[4],
                bounds = raw[5],
                matrix = raw[6],
                background = raw[8];
              return {
                type: "Pattern",
                getPattern: function (ctx, owner, shadingFill) {
                  var scale;
                  if (shadingFill) scale = Util.singularValueDecompose2dScale(ctx.mozCurrentTransform);
                  else if (((scale = Util.singularValueDecompose2dScale(owner.baseTransform)), matrix)) {
                    var matrixScale = Util.singularValueDecompose2dScale(matrix);
                    scale = [scale[0] * matrixScale[0], scale[1] * matrixScale[1]];
                  }
                  var temporaryPatternCanvas = createMeshCanvas(
                    bounds,
                    scale,
                    coords,
                    colors,
                    figures,
                    shadingFill ? null : background,
                    owner.cachedCanvases
                  );
                  return (
                    shadingFill ||
                      (ctx.setTransform.apply(ctx, owner.baseTransform), matrix && ctx.transform.apply(ctx, matrix)),
                    ctx.translate(temporaryPatternCanvas.offsetX, temporaryPatternCanvas.offsetY),
                    ctx.scale(temporaryPatternCanvas.scaleX, temporaryPatternCanvas.scaleY),
                    ctx.createPattern(temporaryPatternCanvas.canvas, "no-repeat")
                  );
                },
              };
            },
          }),
            (ShadingIRs.Dummy = {
              fromIR: function () {
                return {
                  type: "Pattern",
                  getPattern: function () {
                    return "hotpink";
                  },
                };
              },
            });
          var TilingPattern = (function () {
            function TilingPattern(IR, color, ctx, canvasGraphicsFactory, baseTransform) {
              (this.operatorList = IR[2]),
                (this.matrix = IR[3] || [1, 0, 0, 1, 0, 0]),
                (this.bbox = IR[4]),
                (this.xstep = IR[5]),
                (this.ystep = IR[6]),
                (this.paintType = IR[7]),
                (this.tilingType = IR[8]),
                (this.color = color),
                (this.canvasGraphicsFactory = canvasGraphicsFactory),
                (this.baseTransform = baseTransform),
                (this.type = "Pattern"),
                (this.ctx = ctx);
            }
            var PaintType = { COLORED: 1, UNCOLORED: 2 };
            return (
              (TilingPattern.prototype = {
                createPatternCanvas: function (owner) {
                  var operatorList = this.operatorList,
                    bbox = this.bbox,
                    xstep = this.xstep,
                    ystep = this.ystep,
                    paintType = this.paintType,
                    tilingType = this.tilingType,
                    color = this.color,
                    canvasGraphicsFactory = this.canvasGraphicsFactory;
                  info("TilingType: " + tilingType);
                  var x0 = bbox[0],
                    y0 = bbox[1],
                    x1 = bbox[2],
                    y1 = bbox[3],
                    topLeft = [x0, y0],
                    botRight = [x0 + xstep, y0 + ystep],
                    width = botRight[0] - topLeft[0],
                    height = botRight[1] - topLeft[1],
                    matrixScale = Util.singularValueDecompose2dScale(this.matrix),
                    curMatrixScale = Util.singularValueDecompose2dScale(this.baseTransform),
                    combinedScale = [matrixScale[0] * curMatrixScale[0], matrixScale[1] * curMatrixScale[1]];
                  (width = Math.min(Math.ceil(Math.abs(width * combinedScale[0])), 3e3)),
                    (height = Math.min(Math.ceil(Math.abs(height * combinedScale[1])), 3e3));
                  var tmpCanvas = owner.cachedCanvases.getCanvas("pattern", width, height, !0),
                    tmpCtx = tmpCanvas.context,
                    graphics = canvasGraphicsFactory.createCanvasGraphics(tmpCtx);
                  (graphics.groupLevel = owner.groupLevel),
                    this.setFillAndStrokeStyleToContext(tmpCtx, paintType, color),
                    this.setScale(width, height, xstep, ystep),
                    this.transformToScale(graphics);
                  var tmpTranslate = [1, 0, 0, 1, -topLeft[0], -topLeft[1]];
                  return (
                    graphics.transform.apply(graphics, tmpTranslate),
                    this.clipBbox(graphics, bbox, x0, y0, x1, y1),
                    graphics.executeOperatorList(operatorList),
                    tmpCanvas.canvas
                  );
                },
                setScale: function (width, height, xstep, ystep) {
                  this.scale = [width / xstep, height / ystep];
                },
                transformToScale: function (graphics) {
                  var scale = this.scale,
                    tmpScale = [scale[0], 0, 0, scale[1], 0, 0];
                  graphics.transform.apply(graphics, tmpScale);
                },
                scaleToContext: function () {
                  var scale = this.scale;
                  this.ctx.scale(1 / scale[0], 1 / scale[1]);
                },
                clipBbox: function (graphics, bbox, x0, y0, x1, y1) {
                  if (bbox && isArray(bbox) && 4 === bbox.length) {
                    var bboxWidth = x1 - x0,
                      bboxHeight = y1 - y0;
                    graphics.ctx.rect(x0, y0, bboxWidth, bboxHeight), graphics.clip(), graphics.endPath();
                  }
                },
                setFillAndStrokeStyleToContext: function (context, paintType, color) {
                  switch (paintType) {
                    case PaintType.COLORED:
                      var ctx = this.ctx;
                      (context.fillStyle = ctx.fillStyle), (context.strokeStyle = ctx.strokeStyle);
                      break;
                    case PaintType.UNCOLORED:
                      var cssColor = Util.makeCssRgb(color[0], color[1], color[2]);
                      (context.fillStyle = cssColor), (context.strokeStyle = cssColor);
                      break;
                    default:
                      error("Unsupported paint type: " + paintType);
                  }
                },
                getPattern: function (ctx, owner) {
                  var temporaryPatternCanvas = this.createPatternCanvas(owner);
                  return (
                    (ctx = this.ctx),
                    ctx.setTransform.apply(ctx, this.baseTransform),
                    ctx.transform.apply(ctx, this.matrix),
                    this.scaleToContext(),
                    ctx.createPattern(temporaryPatternCanvas, "repeat")
                  );
                },
              }),
              TilingPattern
            );
          })();
          (exports.getShadingPatternFromIR = getShadingPatternFromIR), (exports.TilingPattern = TilingPattern);
        })((root.pdfjsDisplayPatternHelper = {}), root.pdfjsSharedUtil, root.pdfjsDisplayWebGL);
      })(this),
      (function (root, factory) {
        !(function (exports, sharedUtil, displayDOMUtils, displayPatternHelper, displayWebGL) {
          function createScratchCanvas(width, height) {
            var canvas = document.createElement("canvas");
            return (canvas.width = width), (canvas.height = height), canvas;
          }
          function addContextCurrentTransform(ctx) {
            ctx.mozCurrentTransform ||
              ((ctx._originalSave = ctx.save),
              (ctx._originalRestore = ctx.restore),
              (ctx._originalRotate = ctx.rotate),
              (ctx._originalScale = ctx.scale),
              (ctx._originalTranslate = ctx.translate),
              (ctx._originalTransform = ctx.transform),
              (ctx._originalSetTransform = ctx.setTransform),
              (ctx._transformMatrix = ctx._transformMatrix || [1, 0, 0, 1, 0, 0]),
              (ctx._transformStack = []),
              Object.defineProperty(ctx, "mozCurrentTransform", {
                get: function () {
                  return this._transformMatrix;
                },
              }),
              Object.defineProperty(ctx, "mozCurrentTransformInverse", {
                get: function () {
                  var m = this._transformMatrix,
                    a = m[0],
                    b = m[1],
                    c = m[2],
                    d = m[3],
                    e = m[4],
                    f = m[5],
                    ad_bc = a * d - b * c,
                    bc_ad = b * c - a * d;
                  return [d / ad_bc, b / bc_ad, c / bc_ad, a / ad_bc, (d * e - c * f) / bc_ad, (b * e - a * f) / ad_bc];
                },
              }),
              (ctx.save = function () {
                var old = this._transformMatrix;
                this._transformStack.push(old), (this._transformMatrix = old.slice(0, 6)), this._originalSave();
              }),
              (ctx.restore = function () {
                var prev = this._transformStack.pop();
                prev && ((this._transformMatrix = prev), this._originalRestore());
              }),
              (ctx.translate = function (x, y) {
                var m = this._transformMatrix;
                (m[4] = m[0] * x + m[2] * y + m[4]), (m[5] = m[1] * x + m[3] * y + m[5]), this._originalTranslate(x, y);
              }),
              (ctx.scale = function (x, y) {
                var m = this._transformMatrix;
                (m[0] = m[0] * x), (m[1] = m[1] * x), (m[2] = m[2] * y), (m[3] = m[3] * y), this._originalScale(x, y);
              }),
              (ctx.transform = function (a, b, c, d, e, f) {
                var m = this._transformMatrix;
                (this._transformMatrix = [
                  m[0] * a + m[2] * b,
                  m[1] * a + m[3] * b,
                  m[0] * c + m[2] * d,
                  m[1] * c + m[3] * d,
                  m[0] * e + m[2] * f + m[4],
                  m[1] * e + m[3] * f + m[5],
                ]),
                  ctx._originalTransform(a, b, c, d, e, f);
              }),
              (ctx.setTransform = function (a, b, c, d, e, f) {
                (this._transformMatrix = [a, b, c, d, e, f]), ctx._originalSetTransform(a, b, c, d, e, f);
              }),
              (ctx.rotate = function (angle) {
                var cosValue = Math.cos(angle),
                  sinValue = Math.sin(angle),
                  m = this._transformMatrix;
                (this._transformMatrix = [
                  m[0] * cosValue + m[2] * sinValue,
                  m[1] * cosValue + m[3] * sinValue,
                  m[0] * -sinValue + m[2] * cosValue,
                  m[1] * -sinValue + m[3] * cosValue,
                  m[4],
                  m[5],
                ]),
                  this._originalRotate(angle);
              }));
          }
          function compileType3Glyph(imgData) {
            var i,
              j,
              j0,
              ii,
              width = imgData.width,
              height = imgData.height,
              width1 = width + 1,
              points = new Uint8Array(width1 * (height + 1)),
              POINT_TYPES = new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]),
              lineSize = (width + 7) & -8,
              data0 = imgData.data,
              data = new Uint8Array(lineSize * height),
              pos = 0;
            for (i = 0, ii = data0.length; i < ii; i++)
              for (var mask = 128, elem = data0[i]; mask > 0; ) (data[pos++] = elem & mask ? 0 : 255), (mask >>= 1);
            var count = 0;
            for (pos = 0, 0 !== data[pos] && ((points[0] = 1), ++count), j = 1; j < width; j++)
              data[pos] !== data[pos + 1] && ((points[j] = data[pos] ? 2 : 1), ++count), pos++;
            for (0 !== data[pos] && ((points[j] = 2), ++count), i = 1; i < height; i++) {
              (pos = i * lineSize),
                (j0 = i * width1),
                data[pos - lineSize] !== data[pos] && ((points[j0] = data[pos] ? 1 : 8), ++count);
              var sum = (data[pos] ? 4 : 0) + (data[pos - lineSize] ? 8 : 0);
              for (j = 1; j < width; j++)
                (sum = (sum >> 2) + (data[pos + 1] ? 4 : 0) + (data[pos - lineSize + 1] ? 8 : 0)),
                  POINT_TYPES[sum] && ((points[j0 + j] = POINT_TYPES[sum]), ++count),
                  pos++;
              if ((data[pos - lineSize] !== data[pos] && ((points[j0 + j] = data[pos] ? 2 : 4), ++count), count > 1e3))
                return null;
            }
            for (
              pos = lineSize * (height - 1), j0 = i * width1, 0 !== data[pos] && ((points[j0] = 8), ++count), j = 1;
              j < width;
              j++
            )
              data[pos] !== data[pos + 1] && ((points[j0 + j] = data[pos] ? 4 : 8), ++count), pos++;
            if ((0 !== data[pos] && ((points[j0 + j] = 4), ++count), count > 1e3)) return null;
            var steps = new Int32Array([0, width1, -1, 0, -width1, 0, 0, 0, 1]),
              outlines = [];
            for (i = 0; count && i <= height; i++) {
              for (var p = i * width1, end = p + width; p < end && !points[p]; ) p++;
              if (p !== end) {
                var pp,
                  coords = [p % width1, i],
                  type = points[p],
                  p0 = p;
                do {
                  var step = steps[type];
                  do {
                    p += step;
                  } while (!points[p]);
                  (pp = points[p]),
                    5 !== pp && 10 !== pp
                      ? ((type = pp), (points[p] = 0))
                      : ((type = pp & ((51 * type) >> 4)), (points[p] &= (type >> 2) | (type << 2))),
                    coords.push(p % width1),
                    coords.push((p / width1) | 0),
                    --count;
                } while (p0 !== p);
                outlines.push(coords), --i;
              }
            }
            return function (c) {
              c.save(), c.scale(1 / width, -1 / height), c.translate(0, -height), c.beginPath();
              for (var i = 0, ii = outlines.length; i < ii; i++) {
                var o = outlines[i];
                c.moveTo(o[0], o[1]);
                for (var j = 2, jj = o.length; j < jj; j += 2) c.lineTo(o[j], o[j + 1]);
              }
              c.fill(), c.beginPath(), c.restore();
            };
          }
          var FONT_IDENTITY_MATRIX = sharedUtil.FONT_IDENTITY_MATRIX,
            IDENTITY_MATRIX = sharedUtil.IDENTITY_MATRIX,
            ImageKind = sharedUtil.ImageKind,
            OPS = sharedUtil.OPS,
            TextRenderingMode = sharedUtil.TextRenderingMode,
            Uint32ArrayView = sharedUtil.Uint32ArrayView,
            Util = sharedUtil.Util,
            assert = sharedUtil.assert,
            info = sharedUtil.info,
            isNum = sharedUtil.isNum,
            isArray = sharedUtil.isArray,
            isLittleEndian = sharedUtil.isLittleEndian,
            error = sharedUtil.error,
            shadow = sharedUtil.shadow,
            warn = sharedUtil.warn,
            TilingPattern = displayPatternHelper.TilingPattern,
            getShadingPatternFromIR = displayPatternHelper.getShadingPatternFromIR,
            WebGLUtils = displayWebGL.WebGLUtils,
            hasCanvasTypedArrays = displayDOMUtils.hasCanvasTypedArrays,
            FULL_CHUNK_HEIGHT = 16,
            HasCanvasTypedArraysCached = {
              get value() {
                return shadow(HasCanvasTypedArraysCached, "value", hasCanvasTypedArrays());
              },
            },
            IsLittleEndianCached = {
              get value() {
                return shadow(IsLittleEndianCached, "value", isLittleEndian());
              },
            },
            CachedCanvases = (function () {
              function CachedCanvases() {
                this.cache = Object.create(null);
              }
              return (
                (CachedCanvases.prototype = {
                  getCanvas: function (id, width, height, trackTransform) {
                    var canvasEntry;
                    if (void 0 !== this.cache[id])
                      (canvasEntry = this.cache[id]),
                        (canvasEntry.canvas.width = width),
                        (canvasEntry.canvas.height = height),
                        canvasEntry.context.setTransform(1, 0, 0, 1, 0, 0);
                    else {
                      var canvas = createScratchCanvas(width, height),
                        ctx = canvas.getContext("2d");
                      trackTransform && addContextCurrentTransform(ctx),
                        (this.cache[id] = canvasEntry = { canvas: canvas, context: ctx });
                    }
                    return canvasEntry;
                  },
                  clear: function () {
                    for (var id in this.cache) {
                      var canvasEntry = this.cache[id];
                      (canvasEntry.canvas.width = 0), (canvasEntry.canvas.height = 0), delete this.cache[id];
                    }
                  },
                }),
                CachedCanvases
              );
            })(),
            CanvasExtraState = (function () {
              function CanvasExtraState(old) {
                (this.alphaIsShape = !1),
                  (this.fontSize = 0),
                  (this.fontSizeScale = 1),
                  (this.textMatrix = IDENTITY_MATRIX),
                  (this.textMatrixScale = 1),
                  (this.fontMatrix = FONT_IDENTITY_MATRIX),
                  (this.leading = 0),
                  (this.x = 0),
                  (this.y = 0),
                  (this.lineX = 0),
                  (this.lineY = 0),
                  (this.charSpacing = 0),
                  (this.wordSpacing = 0),
                  (this.textHScale = 1),
                  (this.textRenderingMode = TextRenderingMode.FILL),
                  (this.textRise = 0),
                  (this.fillColor = "#000000"),
                  (this.strokeColor = "#000000"),
                  (this.patternFill = !1),
                  (this.fillAlpha = 1),
                  (this.strokeAlpha = 1),
                  (this.lineWidth = 1),
                  (this.activeSMask = null),
                  (this.resumeSMaskCtx = null),
                  (this.old = old);
              }
              return (
                (CanvasExtraState.prototype = {
                  clone: function () {
                    return Object.create(this);
                  },
                  setCurrentPoint: function (x, y) {
                    (this.x = x), (this.y = y);
                  },
                }),
                CanvasExtraState
              );
            })(),
            CanvasGraphics = (function () {
              function CanvasGraphics(canvasCtx, commonObjs, objs, imageLayer) {
                (this.ctx = canvasCtx),
                  (this.current = new CanvasExtraState()),
                  (this.stateStack = []),
                  (this.pendingClip = null),
                  (this.pendingEOFill = !1),
                  (this.res = null),
                  (this.xobjs = null),
                  (this.commonObjs = commonObjs),
                  (this.objs = objs),
                  (this.imageLayer = imageLayer),
                  (this.groupStack = []),
                  (this.processingType3 = null),
                  (this.baseTransform = null),
                  (this.baseTransformStack = []),
                  (this.groupLevel = 0),
                  (this.smaskStack = []),
                  (this.smaskCounter = 0),
                  (this.tempSMask = null),
                  (this.cachedCanvases = new CachedCanvases()),
                  canvasCtx && addContextCurrentTransform(canvasCtx),
                  (this.cachedGetSinglePixelWidth = null);
              }
              function putBinaryImageData(ctx, imgData) {
                if ("undefined" != typeof ImageData && imgData instanceof ImageData)
                  return void ctx.putImageData(imgData, 0, 0);
                var destPos,
                  i,
                  j,
                  thisChunkHeight,
                  elemsInThisChunk,
                  height = imgData.height,
                  width = imgData.width,
                  partialChunkHeight = height % FULL_CHUNK_HEIGHT,
                  fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT,
                  totalChunks = 0 === partialChunkHeight ? fullChunks : fullChunks + 1,
                  chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT),
                  srcPos = 0,
                  src = imgData.data,
                  dest = chunkImgData.data;
                if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {
                  var srcLength = src.byteLength,
                    dest32 = HasCanvasTypedArraysCached.value
                      ? new Uint32Array(dest.buffer)
                      : new Uint32ArrayView(dest),
                    dest32DataLength = dest32.length,
                    fullSrcDiff = (width + 7) >> 3,
                    white = 4294967295,
                    black = IsLittleEndianCached.value || !HasCanvasTypedArraysCached.value ? 4278190080 : 255;
                  for (i = 0; i < totalChunks; i++) {
                    for (
                      thisChunkHeight = i < fullChunks ? FULL_CHUNK_HEIGHT : partialChunkHeight, destPos = 0, j = 0;
                      j < thisChunkHeight;
                      j++
                    ) {
                      for (
                        var srcDiff = srcLength - srcPos,
                          k = 0,
                          kEnd = srcDiff > fullSrcDiff ? width : 8 * srcDiff - 7,
                          kEndUnrolled = -8 & kEnd,
                          mask = 0,
                          srcByte = 0;
                        k < kEndUnrolled;
                        k += 8
                      )
                        (srcByte = src[srcPos++]),
                          (dest32[destPos++] = 128 & srcByte ? white : black),
                          (dest32[destPos++] = 64 & srcByte ? white : black),
                          (dest32[destPos++] = 32 & srcByte ? white : black),
                          (dest32[destPos++] = 16 & srcByte ? white : black),
                          (dest32[destPos++] = 8 & srcByte ? white : black),
                          (dest32[destPos++] = 4 & srcByte ? white : black),
                          (dest32[destPos++] = 2 & srcByte ? white : black),
                          (dest32[destPos++] = 1 & srcByte ? white : black);
                      for (; k < kEnd; k++)
                        0 === mask && ((srcByte = src[srcPos++]), (mask = 128)),
                          (dest32[destPos++] = srcByte & mask ? white : black),
                          (mask >>= 1);
                    }
                    for (; destPos < dest32DataLength; ) dest32[destPos++] = 0;
                    ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
                  }
                } else if (imgData.kind === ImageKind.RGBA_32BPP) {
                  for (j = 0, elemsInThisChunk = width * FULL_CHUNK_HEIGHT * 4, i = 0; i < fullChunks; i++)
                    dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk)),
                      (srcPos += elemsInThisChunk),
                      ctx.putImageData(chunkImgData, 0, j),
                      (j += FULL_CHUNK_HEIGHT);
                  i < totalChunks &&
                    ((elemsInThisChunk = width * partialChunkHeight * 4),
                    dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk)),
                    ctx.putImageData(chunkImgData, 0, j));
                } else if (imgData.kind === ImageKind.RGB_24BPP)
                  for (
                    thisChunkHeight = FULL_CHUNK_HEIGHT, elemsInThisChunk = width * thisChunkHeight, i = 0;
                    i < totalChunks;
                    i++
                  ) {
                    for (
                      i >= fullChunks &&
                        ((thisChunkHeight = partialChunkHeight), (elemsInThisChunk = width * thisChunkHeight)),
                        destPos = 0,
                        j = elemsInThisChunk;
                      j--;

                    )
                      (dest[destPos++] = src[srcPos++]),
                        (dest[destPos++] = src[srcPos++]),
                        (dest[destPos++] = src[srcPos++]),
                        (dest[destPos++] = 255);
                    ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
                  }
                else error("bad image kind: " + imgData.kind);
              }
              function putBinaryImageMask(ctx, imgData) {
                for (
                  var height = imgData.height,
                    width = imgData.width,
                    partialChunkHeight = height % FULL_CHUNK_HEIGHT,
                    fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT,
                    totalChunks = 0 === partialChunkHeight ? fullChunks : fullChunks + 1,
                    chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT),
                    srcPos = 0,
                    src = imgData.data,
                    dest = chunkImgData.data,
                    i = 0;
                  i < totalChunks;
                  i++
                ) {
                  for (
                    var thisChunkHeight = i < fullChunks ? FULL_CHUNK_HEIGHT : partialChunkHeight, destPos = 3, j = 0;
                    j < thisChunkHeight;
                    j++
                  )
                    for (var mask = 0, k = 0; k < width; k++) {
                      if (!mask) {
                        var elem = src[srcPos++];
                        mask = 128;
                      }
                      (dest[destPos] = elem & mask ? 0 : 255), (destPos += 4), (mask >>= 1);
                    }
                  ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
                }
              }
              function copyCtxState(sourceCtx, destCtx) {
                for (
                  var properties = [
                      "strokeStyle",
                      "fillStyle",
                      "fillRule",
                      "globalAlpha",
                      "lineWidth",
                      "lineCap",
                      "lineJoin",
                      "miterLimit",
                      "globalCompositeOperation",
                      "font",
                    ],
                    i = 0,
                    ii = properties.length;
                  i < ii;
                  i++
                ) {
                  var property = properties[i];
                  void 0 !== sourceCtx[property] && (destCtx[property] = sourceCtx[property]);
                }
                void 0 !== sourceCtx.setLineDash &&
                  (destCtx.setLineDash(sourceCtx.getLineDash()), (destCtx.lineDashOffset = sourceCtx.lineDashOffset));
              }
              function composeSMaskBackdrop(bytes, r0, g0, b0) {
                for (var length = bytes.length, i = 3; i < length; i += 4) {
                  var alpha = bytes[i];
                  if (0 === alpha) (bytes[i - 3] = r0), (bytes[i - 2] = g0), (bytes[i - 1] = b0);
                  else if (alpha < 255) {
                    var alpha_ = 255 - alpha;
                    (bytes[i - 3] = (bytes[i - 3] * alpha + r0 * alpha_) >> 8),
                      (bytes[i - 2] = (bytes[i - 2] * alpha + g0 * alpha_) >> 8),
                      (bytes[i - 1] = (bytes[i - 1] * alpha + b0 * alpha_) >> 8);
                  }
                }
              }
              function composeSMaskAlpha(maskData, layerData, transferMap) {
                for (var length = maskData.length, i = 3; i < length; i += 4) {
                  var alpha = transferMap ? transferMap[maskData[i]] : maskData[i];
                  layerData[i] = (layerData[i] * alpha * (1 / 255)) | 0;
                }
              }
              function composeSMaskLuminosity(maskData, layerData, transferMap) {
                for (var length = maskData.length, i = 3; i < length; i += 4) {
                  var y = 77 * maskData[i - 3] + 152 * maskData[i - 2] + 28 * maskData[i - 1];
                  layerData[i] = transferMap ? (layerData[i] * transferMap[y >> 8]) >> 8 : (layerData[i] * y) >> 16;
                }
              }
              function genericComposeSMask(maskCtx, layerCtx, width, height, subtype, backdrop, transferMap) {
                var composeFn,
                  hasBackdrop = !!backdrop,
                  r0 = hasBackdrop ? backdrop[0] : 0,
                  g0 = hasBackdrop ? backdrop[1] : 0,
                  b0 = hasBackdrop ? backdrop[2] : 0;
                composeFn = "Luminosity" === subtype ? composeSMaskLuminosity : composeSMaskAlpha;
                for (
                  var chunkSize = Math.min(height, Math.ceil(1048576 / width)), row = 0;
                  row < height;
                  row += chunkSize
                ) {
                  var chunkHeight = Math.min(chunkSize, height - row),
                    maskData = maskCtx.getImageData(0, row, width, chunkHeight),
                    layerData = layerCtx.getImageData(0, row, width, chunkHeight);
                  hasBackdrop && composeSMaskBackdrop(maskData.data, r0, g0, b0),
                    composeFn(maskData.data, layerData.data, transferMap),
                    maskCtx.putImageData(layerData, 0, row);
                }
              }
              function composeSMask(ctx, smask, layerCtx) {
                var mask = smask.canvas,
                  maskCtx = smask.context;
                ctx.setTransform(smask.scaleX, 0, 0, smask.scaleY, smask.offsetX, smask.offsetY);
                var backdrop = smask.backdrop || null;
                if (!smask.transferMap && WebGLUtils.isEnabled) {
                  var composed = WebGLUtils.composeSMask(layerCtx.canvas, mask, {
                    subtype: smask.subtype,
                    backdrop: backdrop,
                  });
                  return ctx.setTransform(1, 0, 0, 1, 0, 0), void ctx.drawImage(composed, smask.offsetX, smask.offsetY);
                }
                genericComposeSMask(
                  maskCtx,
                  layerCtx,
                  mask.width,
                  mask.height,
                  smask.subtype,
                  backdrop,
                  smask.transferMap
                ),
                  ctx.drawImage(mask, 0, 0);
              }
              var LINE_CAP_STYLES = ["butt", "round", "square"],
                LINE_JOIN_STYLES = ["miter", "round", "bevel"],
                NORMAL_CLIP = {},
                EO_CLIP = {};
              CanvasGraphics.prototype = {
                beginDrawing: function (transform, viewport, transparency) {
                  var width = this.ctx.canvas.width,
                    height = this.ctx.canvas.height;
                  if (
                    (this.ctx.save(),
                    (this.ctx.fillStyle = "rgb(255, 255, 255)"),
                    this.ctx.fillRect(0, 0, width, height),
                    this.ctx.restore(),
                    transparency)
                  ) {
                    var transparentCanvas = this.cachedCanvases.getCanvas("transparent", width, height, !0);
                    (this.compositeCtx = this.ctx),
                      (this.transparentCanvas = transparentCanvas.canvas),
                      (this.ctx = transparentCanvas.context),
                      this.ctx.save(),
                      this.ctx.transform.apply(this.ctx, this.compositeCtx.mozCurrentTransform);
                  }
                  this.ctx.save(),
                    transform && this.ctx.transform.apply(this.ctx, transform),
                    this.ctx.transform.apply(this.ctx, viewport.transform),
                    (this.baseTransform = this.ctx.mozCurrentTransform.slice()),
                    this.imageLayer && this.imageLayer.beginLayout();
                },
                executeOperatorList: function (operatorList, executionStartIdx, continueCallback, stepper) {
                  var argsArray = operatorList.argsArray,
                    fnArray = operatorList.fnArray,
                    i = executionStartIdx || 0,
                    argsArrayLen = argsArray.length;
                  if (argsArrayLen === i) return i;
                  for (
                    var fnId,
                      chunkOperations = argsArrayLen - i > 10 && "function" == typeof continueCallback,
                      endTime = chunkOperations ? Date.now() + 15 : 0,
                      steps = 0,
                      commonObjs = this.commonObjs,
                      objs = this.objs;
                    ;

                  ) {
                    if (void 0 !== stepper && i === stepper.nextBreakPoint)
                      return stepper.breakIt(i, continueCallback), i;
                    if ((fnId = fnArray[i]) !== OPS.dependency) this[fnId].apply(this, argsArray[i]);
                    else
                      for (var deps = argsArray[i], n = 0, nn = deps.length; n < nn; n++) {
                        var depObjId = deps[n],
                          common = "g" === depObjId[0] && "_" === depObjId[1],
                          objsPool = common ? commonObjs : objs;
                        if (!objsPool.isResolved(depObjId)) return objsPool.get(depObjId, continueCallback), i;
                      }
                    if (++i === argsArrayLen) return i;
                    if (chunkOperations && ++steps > 10) {
                      if (Date.now() > endTime) return continueCallback(), i;
                      steps = 0;
                    }
                  }
                },
                endDrawing: function () {
                  null !== this.current.activeSMask && this.endSMaskGroup(),
                    this.ctx.restore(),
                    this.transparentCanvas &&
                      ((this.ctx = this.compositeCtx),
                      this.ctx.save(),
                      this.ctx.setTransform(1, 0, 0, 1, 0, 0),
                      this.ctx.drawImage(this.transparentCanvas, 0, 0),
                      this.ctx.restore(),
                      (this.transparentCanvas = null)),
                    this.cachedCanvases.clear(),
                    WebGLUtils.clear(),
                    this.imageLayer && this.imageLayer.endLayout();
                },
                setLineWidth: function (width) {
                  (this.current.lineWidth = width), (this.ctx.lineWidth = width);
                },
                setLineCap: function (style) {
                  this.ctx.lineCap = LINE_CAP_STYLES[style];
                },
                setLineJoin: function (style) {
                  this.ctx.lineJoin = LINE_JOIN_STYLES[style];
                },
                setMiterLimit: function (limit) {
                  this.ctx.miterLimit = limit;
                },
                setDash: function (dashArray, dashPhase) {
                  var ctx = this.ctx;
                  void 0 !== ctx.setLineDash && (ctx.setLineDash(dashArray), (ctx.lineDashOffset = dashPhase));
                },
                setRenderingIntent: function (intent) {},
                setFlatness: function (flatness) {},
                setGState: function (states) {
                  for (var i = 0, ii = states.length; i < ii; i++) {
                    var state = states[i],
                      key = state[0],
                      value = state[1];
                    switch (key) {
                      case "LW":
                        this.setLineWidth(value);
                        break;
                      case "LC":
                        this.setLineCap(value);
                        break;
                      case "LJ":
                        this.setLineJoin(value);
                        break;
                      case "ML":
                        this.setMiterLimit(value);
                        break;
                      case "D":
                        this.setDash(value[0], value[1]);
                        break;
                      case "RI":
                        this.setRenderingIntent(value);
                        break;
                      case "FL":
                        this.setFlatness(value);
                        break;
                      case "Font":
                        this.setFont(value[0], value[1]);
                        break;
                      case "CA":
                        this.current.strokeAlpha = state[1];
                        break;
                      case "ca":
                        (this.current.fillAlpha = state[1]), (this.ctx.globalAlpha = state[1]);
                        break;
                      case "BM":
                        if (value && value.name && "Normal" !== value.name) {
                          var mode = value.name
                            .replace(/([A-Z])/g, function (c) {
                              return "-" + c.toLowerCase();
                            })
                            .substring(1);
                          (this.ctx.globalCompositeOperation = mode),
                            this.ctx.globalCompositeOperation !== mode &&
                              warn('globalCompositeOperation "' + mode + '" is not supported');
                        } else this.ctx.globalCompositeOperation = "source-over";
                        break;
                      case "SMask":
                        this.current.activeSMask &&
                          (this.stateStack.length > 0 &&
                          this.stateStack[this.stateStack.length - 1].activeSMask === this.current.activeSMask
                            ? this.suspendSMaskGroup()
                            : this.endSMaskGroup()),
                          (this.current.activeSMask = value ? this.tempSMask : null),
                          this.current.activeSMask && this.beginSMaskGroup(),
                          (this.tempSMask = null);
                    }
                  }
                },
                beginSMaskGroup: function () {
                  var activeSMask = this.current.activeSMask,
                    drawnWidth = activeSMask.canvas.width,
                    drawnHeight = activeSMask.canvas.height,
                    cacheId = "smaskGroupAt" + this.groupLevel,
                    scratchCanvas = this.cachedCanvases.getCanvas(cacheId, drawnWidth, drawnHeight, !0),
                    currentCtx = this.ctx,
                    currentTransform = currentCtx.mozCurrentTransform;
                  this.ctx.save();
                  var groupCtx = scratchCanvas.context;
                  groupCtx.scale(1 / activeSMask.scaleX, 1 / activeSMask.scaleY),
                    groupCtx.translate(-activeSMask.offsetX, -activeSMask.offsetY),
                    groupCtx.transform.apply(groupCtx, currentTransform),
                    (activeSMask.startTransformInverse = groupCtx.mozCurrentTransformInverse),
                    copyCtxState(currentCtx, groupCtx),
                    (this.ctx = groupCtx),
                    this.setGState([
                      ["BM", "Normal"],
                      ["ca", 1],
                      ["CA", 1],
                    ]),
                    this.groupStack.push(currentCtx),
                    this.groupLevel++;
                },
                suspendSMaskGroup: function () {
                  var groupCtx = this.ctx;
                  this.groupLevel--,
                    (this.ctx = this.groupStack.pop()),
                    composeSMask(this.ctx, this.current.activeSMask, groupCtx),
                    this.ctx.restore(),
                    this.ctx.save(),
                    copyCtxState(groupCtx, this.ctx),
                    (this.current.resumeSMaskCtx = groupCtx);
                  var deltaTransform = Util.transform(
                    this.current.activeSMask.startTransformInverse,
                    groupCtx.mozCurrentTransform
                  );
                  this.ctx.transform.apply(this.ctx, deltaTransform),
                    groupCtx.save(),
                    groupCtx.setTransform(1, 0, 0, 1, 0, 0),
                    groupCtx.clearRect(0, 0, groupCtx.canvas.width, groupCtx.canvas.height),
                    groupCtx.restore();
                },
                resumeSMaskGroup: function () {
                  var groupCtx = this.current.resumeSMaskCtx,
                    currentCtx = this.ctx;
                  (this.ctx = groupCtx), this.groupStack.push(currentCtx), this.groupLevel++;
                },
                endSMaskGroup: function () {
                  var groupCtx = this.ctx;
                  this.groupLevel--,
                    (this.ctx = this.groupStack.pop()),
                    composeSMask(this.ctx, this.current.activeSMask, groupCtx),
                    this.ctx.restore(),
                    copyCtxState(groupCtx, this.ctx);
                  var deltaTransform = Util.transform(
                    this.current.activeSMask.startTransformInverse,
                    groupCtx.mozCurrentTransform
                  );
                  this.ctx.transform.apply(this.ctx, deltaTransform);
                },
                save: function () {
                  this.ctx.save();
                  var old = this.current;
                  this.stateStack.push(old), (this.current = old.clone()), (this.current.resumeSMaskCtx = null);
                },
                restore: function () {
                  this.current.resumeSMaskCtx && this.resumeSMaskGroup(),
                    null === this.current.activeSMask ||
                      (0 !== this.stateStack.length &&
                        this.stateStack[this.stateStack.length - 1].activeSMask === this.current.activeSMask) ||
                      this.endSMaskGroup(),
                    0 !== this.stateStack.length &&
                      ((this.current = this.stateStack.pop()),
                      this.ctx.restore(),
                      (this.pendingClip = null),
                      (this.cachedGetSinglePixelWidth = null));
                },
                transform: function (a, b, c, d, e, f) {
                  this.ctx.transform(a, b, c, d, e, f), (this.cachedGetSinglePixelWidth = null);
                },
                constructPath: function (ops, args) {
                  for (
                    var ctx = this.ctx,
                      current = this.current,
                      x = current.x,
                      y = current.y,
                      i = 0,
                      j = 0,
                      ii = ops.length;
                    i < ii;
                    i++
                  )
                    switch (0 | ops[i]) {
                      case OPS.rectangle:
                        (x = args[j++]), (y = args[j++]);
                        var width = args[j++],
                          height = args[j++];
                        0 === width && (width = this.getSinglePixelWidth()),
                          0 === height && (height = this.getSinglePixelWidth());
                        var xw = x + width,
                          yh = y + height;
                        this.ctx.moveTo(x, y),
                          this.ctx.lineTo(xw, y),
                          this.ctx.lineTo(xw, yh),
                          this.ctx.lineTo(x, yh),
                          this.ctx.lineTo(x, y),
                          this.ctx.closePath();
                        break;
                      case OPS.moveTo:
                        (x = args[j++]), (y = args[j++]), ctx.moveTo(x, y);
                        break;
                      case OPS.lineTo:
                        (x = args[j++]), (y = args[j++]), ctx.lineTo(x, y);
                        break;
                      case OPS.curveTo:
                        (x = args[j + 4]),
                          (y = args[j + 5]),
                          ctx.bezierCurveTo(args[j], args[j + 1], args[j + 2], args[j + 3], x, y),
                          (j += 6);
                        break;
                      case OPS.curveTo2:
                        ctx.bezierCurveTo(x, y, args[j], args[j + 1], args[j + 2], args[j + 3]),
                          (x = args[j + 2]),
                          (y = args[j + 3]),
                          (j += 4);
                        break;
                      case OPS.curveTo3:
                        (x = args[j + 2]),
                          (y = args[j + 3]),
                          ctx.bezierCurveTo(args[j], args[j + 1], x, y, x, y),
                          (j += 4);
                        break;
                      case OPS.closePath:
                        ctx.closePath();
                    }
                  current.setCurrentPoint(x, y);
                },
                closePath: function () {
                  this.ctx.closePath();
                },
                stroke: function (consumePath) {
                  consumePath = void 0 === consumePath || consumePath;
                  var ctx = this.ctx,
                    strokeColor = this.current.strokeColor;
                  (ctx.lineWidth = Math.max(0.65 * this.getSinglePixelWidth(), this.current.lineWidth)),
                    (ctx.globalAlpha = this.current.strokeAlpha),
                    strokeColor && strokeColor.hasOwnProperty("type") && "Pattern" === strokeColor.type
                      ? (ctx.save(), (ctx.strokeStyle = strokeColor.getPattern(ctx, this)), ctx.stroke(), ctx.restore())
                      : ctx.stroke(),
                    consumePath && this.consumePath(),
                    (ctx.globalAlpha = this.current.fillAlpha);
                },
                closeStroke: function () {
                  this.closePath(), this.stroke();
                },
                fill: function (consumePath) {
                  consumePath = void 0 === consumePath || consumePath;
                  var ctx = this.ctx,
                    fillColor = this.current.fillColor,
                    isPatternFill = this.current.patternFill,
                    needRestore = !1;
                  isPatternFill &&
                    (ctx.save(),
                    this.baseTransform && ctx.setTransform.apply(ctx, this.baseTransform),
                    (ctx.fillStyle = fillColor.getPattern(ctx, this)),
                    (needRestore = !0)),
                    this.pendingEOFill
                      ? (void 0 !== ctx.mozFillRule
                          ? ((ctx.mozFillRule = "evenodd"), ctx.fill(), (ctx.mozFillRule = "nonzero"))
                          : ctx.fill("evenodd"),
                        (this.pendingEOFill = !1))
                      : ctx.fill(),
                    needRestore && ctx.restore(),
                    consumePath && this.consumePath();
                },
                eoFill: function () {
                  (this.pendingEOFill = !0), this.fill();
                },
                fillStroke: function () {
                  this.fill(!1), this.stroke(!1), this.consumePath();
                },
                eoFillStroke: function () {
                  (this.pendingEOFill = !0), this.fillStroke();
                },
                closeFillStroke: function () {
                  this.closePath(), this.fillStroke();
                },
                closeEOFillStroke: function () {
                  (this.pendingEOFill = !0), this.closePath(), this.fillStroke();
                },
                endPath: function () {
                  this.consumePath();
                },
                clip: function () {
                  this.pendingClip = NORMAL_CLIP;
                },
                eoClip: function () {
                  this.pendingClip = EO_CLIP;
                },
                beginText: function () {
                  (this.current.textMatrix = IDENTITY_MATRIX),
                    (this.current.textMatrixScale = 1),
                    (this.current.x = this.current.lineX = 0),
                    (this.current.y = this.current.lineY = 0);
                },
                endText: function () {
                  var paths = this.pendingTextPaths,
                    ctx = this.ctx;
                  if (void 0 === paths) return void ctx.beginPath();
                  ctx.save(), ctx.beginPath();
                  for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    ctx.setTransform.apply(ctx, path.transform),
                      ctx.translate(path.x, path.y),
                      path.addToPath(ctx, path.fontSize);
                  }
                  ctx.restore(), ctx.clip(), ctx.beginPath(), delete this.pendingTextPaths;
                },
                setCharSpacing: function (spacing) {
                  this.current.charSpacing = spacing;
                },
                setWordSpacing: function (spacing) {
                  this.current.wordSpacing = spacing;
                },
                setHScale: function (scale) {
                  this.current.textHScale = scale / 100;
                },
                setLeading: function (leading) {
                  this.current.leading = -leading;
                },
                setFont: function (fontRefName, size) {
                  var fontObj = this.commonObjs.get(fontRefName),
                    current = this.current;
                  if (
                    (fontObj || error("Can't find font for " + fontRefName),
                    (current.fontMatrix = fontObj.fontMatrix ? fontObj.fontMatrix : FONT_IDENTITY_MATRIX),
                    (0 !== current.fontMatrix[0] && 0 !== current.fontMatrix[3]) ||
                      warn("Invalid font matrix for font " + fontRefName),
                    size < 0 ? ((size = -size), (current.fontDirection = -1)) : (current.fontDirection = 1),
                    (this.current.font = fontObj),
                    (this.current.fontSize = size),
                    !fontObj.isType3Font)
                  ) {
                    var name = fontObj.loadedName || "sans-serif",
                      bold = fontObj.black ? (fontObj.bold ? "900" : "bold") : fontObj.bold ? "bold" : "normal",
                      italic = fontObj.italic ? "italic" : "normal",
                      typeface = '"' + name + '", ' + fontObj.fallbackName,
                      browserFontSize = size < 16 ? 16 : size > 100 ? 100 : size;
                    this.current.fontSizeScale = size / browserFontSize;
                    var rule = italic + " " + bold + " " + browserFontSize + "px " + typeface;
                    this.ctx.font = rule;
                  }
                },
                setTextRenderingMode: function (mode) {
                  this.current.textRenderingMode = mode;
                },
                setTextRise: function (rise) {
                  this.current.textRise = rise;
                },
                moveText: function (x, y) {
                  (this.current.x = this.current.lineX += x), (this.current.y = this.current.lineY += y);
                },
                setLeadingMoveText: function (x, y) {
                  this.setLeading(-y), this.moveText(x, y);
                },
                setTextMatrix: function (a, b, c, d, e, f) {
                  (this.current.textMatrix = [a, b, c, d, e, f]),
                    (this.current.textMatrixScale = Math.sqrt(a * a + b * b)),
                    (this.current.x = this.current.lineX = 0),
                    (this.current.y = this.current.lineY = 0);
                },
                nextLine: function () {
                  this.moveText(0, this.current.leading);
                },
                paintChar: function (character, x, y) {
                  var addToPath,
                    ctx = this.ctx,
                    current = this.current,
                    font = current.font,
                    textRenderingMode = current.textRenderingMode,
                    fontSize = current.fontSize / current.fontSizeScale,
                    fillStrokeMode = textRenderingMode & TextRenderingMode.FILL_STROKE_MASK,
                    isAddToPathSet = !!(textRenderingMode & TextRenderingMode.ADD_TO_PATH_FLAG);
                  if (
                    ((font.disableFontFace || isAddToPathSet) &&
                      (addToPath = font.getPathGenerator(this.commonObjs, character)),
                    font.disableFontFace
                      ? (ctx.save(),
                        ctx.translate(x, y),
                        ctx.beginPath(),
                        addToPath(ctx, fontSize),
                        (fillStrokeMode !== TextRenderingMode.FILL &&
                          fillStrokeMode !== TextRenderingMode.FILL_STROKE) ||
                          ctx.fill(),
                        (fillStrokeMode !== TextRenderingMode.STROKE &&
                          fillStrokeMode !== TextRenderingMode.FILL_STROKE) ||
                          ctx.stroke(),
                        ctx.restore())
                      : ((fillStrokeMode !== TextRenderingMode.FILL &&
                          fillStrokeMode !== TextRenderingMode.FILL_STROKE) ||
                          ctx.fillText(character, x, y),
                        (fillStrokeMode !== TextRenderingMode.STROKE &&
                          fillStrokeMode !== TextRenderingMode.FILL_STROKE) ||
                          ctx.strokeText(character, x, y)),
                    isAddToPathSet)
                  ) {
                    (this.pendingTextPaths || (this.pendingTextPaths = [])).push({
                      transform: ctx.mozCurrentTransform,
                      x: x,
                      y: y,
                      fontSize: fontSize,
                      addToPath: addToPath,
                    });
                  }
                },
                get isFontSubpixelAAEnabled() {
                  var ctx = document.createElement("canvas").getContext("2d");
                  ctx.scale(1.5, 1), ctx.fillText("I", 0, 10);
                  for (var data = ctx.getImageData(0, 0, 10, 10).data, enabled = !1, i = 3; i < data.length; i += 4)
                    if (data[i] > 0 && data[i] < 255) {
                      enabled = !0;
                      break;
                    }
                  return shadow(this, "isFontSubpixelAAEnabled", enabled);
                },
                showText: function (glyphs) {
                  var current = this.current,
                    font = current.font;
                  if (font.isType3Font) return this.showType3Text(glyphs);
                  var fontSize = current.fontSize;
                  if (0 !== fontSize) {
                    var ctx = this.ctx,
                      fontSizeScale = current.fontSizeScale,
                      charSpacing = current.charSpacing,
                      wordSpacing = current.wordSpacing,
                      fontDirection = current.fontDirection,
                      textHScale = current.textHScale * fontDirection,
                      glyphsLength = glyphs.length,
                      vertical = font.vertical,
                      spacingDir = vertical ? 1 : -1,
                      defaultVMetrics = font.defaultVMetrics,
                      widthAdvanceScale = fontSize * current.fontMatrix[0],
                      simpleFillText = current.textRenderingMode === TextRenderingMode.FILL && !font.disableFontFace;
                    ctx.save(),
                      ctx.transform.apply(ctx, current.textMatrix),
                      ctx.translate(current.x, current.y + current.textRise),
                      current.patternFill && (ctx.fillStyle = current.fillColor.getPattern(ctx, this)),
                      fontDirection > 0 ? ctx.scale(textHScale, -1) : ctx.scale(textHScale, 1);
                    var lineWidth = current.lineWidth,
                      scale = current.textMatrixScale;
                    if (0 === scale || 0 === lineWidth) {
                      var fillStrokeMode = current.textRenderingMode & TextRenderingMode.FILL_STROKE_MASK;
                      (fillStrokeMode !== TextRenderingMode.STROKE &&
                        fillStrokeMode !== TextRenderingMode.FILL_STROKE) ||
                        ((this.cachedGetSinglePixelWidth = null), (lineWidth = 0.65 * this.getSinglePixelWidth()));
                    } else lineWidth /= scale;
                    1 !== fontSizeScale && (ctx.scale(fontSizeScale, fontSizeScale), (lineWidth /= fontSizeScale)),
                      (ctx.lineWidth = lineWidth);
                    var i,
                      x = 0;
                    for (i = 0; i < glyphsLength; ++i) {
                      var glyph = glyphs[i];
                      if (isNum(glyph)) x += (spacingDir * glyph * fontSize) / 1e3;
                      else {
                        var scaledX,
                          scaledY,
                          scaledAccentX,
                          scaledAccentY,
                          restoreNeeded = !1,
                          spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing,
                          character = glyph.fontChar,
                          accent = glyph.accent,
                          width = glyph.width;
                        if (vertical) {
                          var vmetric, vx, vy;
                          (vmetric = glyph.vmetric || defaultVMetrics),
                            (vx = glyph.vmetric ? vmetric[1] : 0.5 * width),
                            (vx = -vx * widthAdvanceScale),
                            (vy = vmetric[2] * widthAdvanceScale),
                            (width = vmetric ? -vmetric[0] : width),
                            (scaledX = vx / fontSizeScale),
                            (scaledY = (x + vy) / fontSizeScale);
                        } else (scaledX = x / fontSizeScale), (scaledY = 0);
                        if (font.remeasure && width > 0) {
                          var measuredWidth = ((1e3 * ctx.measureText(character).width) / fontSize) * fontSizeScale;
                          if (width < measuredWidth && this.isFontSubpixelAAEnabled) {
                            var characterScaleX = width / measuredWidth;
                            (restoreNeeded = !0),
                              ctx.save(),
                              ctx.scale(characterScaleX, 1),
                              (scaledX /= characterScaleX);
                          } else
                            width !== measuredWidth &&
                              (scaledX += (((width - measuredWidth) / 2e3) * fontSize) / fontSizeScale);
                        }
                        (glyph.isInFont || font.missingFile) &&
                          (simpleFillText && !accent
                            ? ctx.fillText(character, scaledX, scaledY)
                            : (this.paintChar(character, scaledX, scaledY),
                              accent &&
                                ((scaledAccentX = scaledX + accent.offset.x / fontSizeScale),
                                (scaledAccentY = scaledY - accent.offset.y / fontSizeScale),
                                this.paintChar(accent.fontChar, scaledAccentX, scaledAccentY))));
                        (x += width * widthAdvanceScale + spacing * fontDirection), restoreNeeded && ctx.restore();
                      }
                    }
                    vertical ? (current.y -= x * textHScale) : (current.x += x * textHScale), ctx.restore();
                  }
                },
                showType3Text: function (glyphs) {
                  var i,
                    glyph,
                    width,
                    spacingLength,
                    ctx = this.ctx,
                    current = this.current,
                    font = current.font,
                    fontSize = current.fontSize,
                    fontDirection = current.fontDirection,
                    spacingDir = font.vertical ? 1 : -1,
                    charSpacing = current.charSpacing,
                    wordSpacing = current.wordSpacing,
                    textHScale = current.textHScale * fontDirection,
                    fontMatrix = current.fontMatrix || FONT_IDENTITY_MATRIX,
                    glyphsLength = glyphs.length,
                    isTextInvisible = current.textRenderingMode === TextRenderingMode.INVISIBLE;
                  if (!isTextInvisible && 0 !== fontSize) {
                    for (
                      this.cachedGetSinglePixelWidth = null,
                        ctx.save(),
                        ctx.transform.apply(ctx, current.textMatrix),
                        ctx.translate(current.x, current.y),
                        ctx.scale(textHScale, fontDirection),
                        i = 0;
                      i < glyphsLength;
                      ++i
                    )
                      if (((glyph = glyphs[i]), isNum(glyph)))
                        (spacingLength = (spacingDir * glyph * fontSize) / 1e3),
                          this.ctx.translate(spacingLength, 0),
                          (current.x += spacingLength * textHScale);
                      else {
                        var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing,
                          operatorList = font.charProcOperatorList[glyph.operatorListId];
                        if (operatorList) {
                          (this.processingType3 = glyph),
                            this.save(),
                            ctx.scale(fontSize, fontSize),
                            ctx.transform.apply(ctx, fontMatrix),
                            this.executeOperatorList(operatorList),
                            this.restore();
                          var transformed = Util.applyTransform([glyph.width, 0], fontMatrix);
                          (width = transformed[0] * fontSize + spacing),
                            ctx.translate(width, 0),
                            (current.x += width * textHScale);
                        } else warn('Type3 character "' + glyph.operatorListId + '" is not available');
                      }
                    ctx.restore(), (this.processingType3 = null);
                  }
                },
                setCharWidth: function (xWidth, yWidth) {},
                setCharWidthAndBounds: function (xWidth, yWidth, llx, lly, urx, ury) {
                  this.ctx.rect(llx, lly, urx - llx, ury - lly), this.clip(), this.endPath();
                },
                getColorN_Pattern: function (IR) {
                  var pattern;
                  if ("TilingPattern" === IR[0]) {
                    var color = IR[1],
                      baseTransform = this.baseTransform || this.ctx.mozCurrentTransform.slice(),
                      self = this,
                      canvasGraphicsFactory = {
                        createCanvasGraphics: function (ctx) {
                          return new CanvasGraphics(ctx, self.commonObjs, self.objs);
                        },
                      };
                    pattern = new TilingPattern(IR, color, this.ctx, canvasGraphicsFactory, baseTransform);
                  } else pattern = getShadingPatternFromIR(IR);
                  return pattern;
                },
                setStrokeColorN: function () {
                  this.current.strokeColor = this.getColorN_Pattern(arguments);
                },
                setFillColorN: function () {
                  (this.current.fillColor = this.getColorN_Pattern(arguments)), (this.current.patternFill = !0);
                },
                setStrokeRGBColor: function (r, g, b) {
                  var color = Util.makeCssRgb(r, g, b);
                  (this.ctx.strokeStyle = color), (this.current.strokeColor = color);
                },
                setFillRGBColor: function (r, g, b) {
                  var color = Util.makeCssRgb(r, g, b);
                  (this.ctx.fillStyle = color), (this.current.fillColor = color), (this.current.patternFill = !1);
                },
                shadingFill: function (patternIR) {
                  var ctx = this.ctx;
                  this.save();
                  var pattern = getShadingPatternFromIR(patternIR);
                  ctx.fillStyle = pattern.getPattern(ctx, this, !0);
                  var inv = ctx.mozCurrentTransformInverse;
                  if (inv) {
                    var canvas = ctx.canvas,
                      width = canvas.width,
                      height = canvas.height,
                      bl = Util.applyTransform([0, 0], inv),
                      br = Util.applyTransform([0, height], inv),
                      ul = Util.applyTransform([width, 0], inv),
                      ur = Util.applyTransform([width, height], inv),
                      x0 = Math.min(bl[0], br[0], ul[0], ur[0]),
                      y0 = Math.min(bl[1], br[1], ul[1], ur[1]),
                      x1 = Math.max(bl[0], br[0], ul[0], ur[0]),
                      y1 = Math.max(bl[1], br[1], ul[1], ur[1]);
                    this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
                  } else this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
                  this.restore();
                },
                beginInlineImage: function () {
                  error("Should not call beginInlineImage");
                },
                beginImageData: function () {
                  error("Should not call beginImageData");
                },
                paintFormXObjectBegin: function (matrix, bbox) {
                  if (
                    (this.save(),
                    this.baseTransformStack.push(this.baseTransform),
                    isArray(matrix) && 6 === matrix.length && this.transform.apply(this, matrix),
                    (this.baseTransform = this.ctx.mozCurrentTransform),
                    isArray(bbox) && 4 === bbox.length)
                  ) {
                    var width = bbox[2] - bbox[0],
                      height = bbox[3] - bbox[1];
                    this.ctx.rect(bbox[0], bbox[1], width, height), this.clip(), this.endPath();
                  }
                },
                paintFormXObjectEnd: function () {
                  this.restore(), (this.baseTransform = this.baseTransformStack.pop());
                },
                beginGroup: function (group) {
                  this.save();
                  var currentCtx = this.ctx;
                  group.isolated || info("TODO: Support non-isolated groups."),
                    group.knockout && warn("Knockout groups not supported.");
                  var currentTransform = currentCtx.mozCurrentTransform;
                  group.matrix && currentCtx.transform.apply(currentCtx, group.matrix),
                    assert(group.bbox, "Bounding box is required.");
                  var bounds = Util.getAxialAlignedBoundingBox(group.bbox, currentCtx.mozCurrentTransform),
                    canvasBounds = [0, 0, currentCtx.canvas.width, currentCtx.canvas.height];
                  bounds = Util.intersect(bounds, canvasBounds) || [0, 0, 0, 0];
                  var offsetX = Math.floor(bounds[0]),
                    offsetY = Math.floor(bounds[1]),
                    drawnWidth = Math.max(Math.ceil(bounds[2]) - offsetX, 1),
                    drawnHeight = Math.max(Math.ceil(bounds[3]) - offsetY, 1),
                    scaleX = 1,
                    scaleY = 1;
                  drawnWidth > 4096 && ((scaleX = drawnWidth / 4096), (drawnWidth = 4096)),
                    drawnHeight > 4096 && ((scaleY = drawnHeight / 4096), (drawnHeight = 4096));
                  var cacheId = "groupAt" + this.groupLevel;
                  group.smask && (cacheId += "_smask_" + (this.smaskCounter++ % 2));
                  var scratchCanvas = this.cachedCanvases.getCanvas(cacheId, drawnWidth, drawnHeight, !0),
                    groupCtx = scratchCanvas.context;
                  groupCtx.scale(1 / scaleX, 1 / scaleY),
                    groupCtx.translate(-offsetX, -offsetY),
                    groupCtx.transform.apply(groupCtx, currentTransform),
                    group.smask
                      ? this.smaskStack.push({
                          canvas: scratchCanvas.canvas,
                          context: groupCtx,
                          offsetX: offsetX,
                          offsetY: offsetY,
                          scaleX: scaleX,
                          scaleY: scaleY,
                          subtype: group.smask.subtype,
                          backdrop: group.smask.backdrop,
                          transferMap: group.smask.transferMap || null,
                          startTransformInverse: null,
                        })
                      : (currentCtx.setTransform(1, 0, 0, 1, 0, 0),
                        currentCtx.translate(offsetX, offsetY),
                        currentCtx.scale(scaleX, scaleY)),
                    copyCtxState(currentCtx, groupCtx),
                    (this.ctx = groupCtx),
                    this.setGState([
                      ["BM", "Normal"],
                      ["ca", 1],
                      ["CA", 1],
                    ]),
                    this.groupStack.push(currentCtx),
                    this.groupLevel++,
                    (this.current.activeSMask = null);
                },
                endGroup: function (group) {
                  this.groupLevel--;
                  var groupCtx = this.ctx;
                  (this.ctx = this.groupStack.pop()),
                    void 0 !== this.ctx.imageSmoothingEnabled
                      ? (this.ctx.imageSmoothingEnabled = !1)
                      : (this.ctx.mozImageSmoothingEnabled = !1),
                    group.smask ? (this.tempSMask = this.smaskStack.pop()) : this.ctx.drawImage(groupCtx.canvas, 0, 0),
                    this.restore();
                },
                beginAnnotations: function () {
                  this.save(),
                    (this.current = new CanvasExtraState()),
                    this.baseTransform && this.ctx.setTransform.apply(this.ctx, this.baseTransform);
                },
                endAnnotations: function () {
                  this.restore();
                },
                beginAnnotation: function (rect, transform, matrix) {
                  if ((this.save(), isArray(rect) && 4 === rect.length)) {
                    var width = rect[2] - rect[0],
                      height = rect[3] - rect[1];
                    this.ctx.rect(rect[0], rect[1], width, height), this.clip(), this.endPath();
                  }
                  this.transform.apply(this, transform), this.transform.apply(this, matrix);
                },
                endAnnotation: function () {
                  this.restore();
                },
                paintJpegXObject: function (objId, w, h) {
                  var domImage = this.objs.get(objId);
                  if (!domImage) return void warn("Dependent image isn't ready yet");
                  this.save();
                  var ctx = this.ctx;
                  if (
                    (ctx.scale(1 / w, -1 / h),
                    ctx.drawImage(domImage, 0, 0, domImage.width, domImage.height, 0, -h, w, h),
                    this.imageLayer)
                  ) {
                    var currentTransform = ctx.mozCurrentTransformInverse,
                      position = this.getCanvasPosition(0, 0);
                    this.imageLayer.appendImage({
                      objId: objId,
                      left: position[0],
                      top: position[1],
                      width: w / currentTransform[0],
                      height: h / currentTransform[3],
                    });
                  }
                  this.restore();
                },
                paintImageMaskXObject: function (img) {
                  var ctx = this.ctx,
                    width = img.width,
                    height = img.height,
                    fillColor = this.current.fillColor,
                    isPatternFill = this.current.patternFill,
                    glyph = this.processingType3;
                  if (
                    (glyph &&
                      void 0 === glyph.compiled &&
                      (glyph.compiled =
                        width <= 1e3 && height <= 1e3
                          ? compileType3Glyph({ data: img.data, width: width, height: height })
                          : null),
                    glyph && glyph.compiled)
                  )
                    return void glyph.compiled(ctx);
                  var maskCanvas = this.cachedCanvases.getCanvas("maskCanvas", width, height),
                    maskCtx = maskCanvas.context;
                  maskCtx.save(),
                    putBinaryImageMask(maskCtx, img),
                    (maskCtx.globalCompositeOperation = "source-in"),
                    (maskCtx.fillStyle = isPatternFill ? fillColor.getPattern(maskCtx, this) : fillColor),
                    maskCtx.fillRect(0, 0, width, height),
                    maskCtx.restore(),
                    this.paintInlineImageXObject(maskCanvas.canvas);
                },
                paintImageMaskXObjectRepeat: function (imgData, scaleX, scaleY, positions) {
                  var width = imgData.width,
                    height = imgData.height,
                    fillColor = this.current.fillColor,
                    isPatternFill = this.current.patternFill,
                    maskCanvas = this.cachedCanvases.getCanvas("maskCanvas", width, height),
                    maskCtx = maskCanvas.context;
                  maskCtx.save(),
                    putBinaryImageMask(maskCtx, imgData),
                    (maskCtx.globalCompositeOperation = "source-in"),
                    (maskCtx.fillStyle = isPatternFill ? fillColor.getPattern(maskCtx, this) : fillColor),
                    maskCtx.fillRect(0, 0, width, height),
                    maskCtx.restore();
                  for (var ctx = this.ctx, i = 0, ii = positions.length; i < ii; i += 2)
                    ctx.save(),
                      ctx.transform(scaleX, 0, 0, scaleY, positions[i], positions[i + 1]),
                      ctx.scale(1, -1),
                      ctx.drawImage(maskCanvas.canvas, 0, 0, width, height, 0, -1, 1, 1),
                      ctx.restore();
                },
                paintImageMaskXObjectGroup: function (images) {
                  for (
                    var ctx = this.ctx,
                      fillColor = this.current.fillColor,
                      isPatternFill = this.current.patternFill,
                      i = 0,
                      ii = images.length;
                    i < ii;
                    i++
                  ) {
                    var image = images[i],
                      width = image.width,
                      height = image.height,
                      maskCanvas = this.cachedCanvases.getCanvas("maskCanvas", width, height),
                      maskCtx = maskCanvas.context;
                    maskCtx.save(),
                      putBinaryImageMask(maskCtx, image),
                      (maskCtx.globalCompositeOperation = "source-in"),
                      (maskCtx.fillStyle = isPatternFill ? fillColor.getPattern(maskCtx, this) : fillColor),
                      maskCtx.fillRect(0, 0, width, height),
                      maskCtx.restore(),
                      ctx.save(),
                      ctx.transform.apply(ctx, image.transform),
                      ctx.scale(1, -1),
                      ctx.drawImage(maskCanvas.canvas, 0, 0, width, height, 0, -1, 1, 1),
                      ctx.restore();
                  }
                },
                paintImageXObject: function (objId) {
                  var imgData = this.objs.get(objId);
                  if (!imgData) return void warn("Dependent image isn't ready yet");
                  this.paintInlineImageXObject(imgData);
                },
                paintImageXObjectRepeat: function (objId, scaleX, scaleY, positions) {
                  var imgData = this.objs.get(objId);
                  if (!imgData) return void warn("Dependent image isn't ready yet");
                  for (
                    var width = imgData.width, height = imgData.height, map = [], i = 0, ii = positions.length;
                    i < ii;
                    i += 2
                  )
                    map.push({
                      transform: [scaleX, 0, 0, scaleY, positions[i], positions[i + 1]],
                      x: 0,
                      y: 0,
                      w: width,
                      h: height,
                    });
                  this.paintInlineImageXObjectGroup(imgData, map);
                },
                paintInlineImageXObject: function (imgData) {
                  var width = imgData.width,
                    height = imgData.height,
                    ctx = this.ctx;
                  this.save(), ctx.scale(1 / width, -1 / height);
                  var imgToPaint,
                    tmpCanvas,
                    currentTransform = ctx.mozCurrentTransformInverse,
                    a = currentTransform[0],
                    b = currentTransform[1],
                    widthScale = Math.max(Math.sqrt(a * a + b * b), 1),
                    c = currentTransform[2],
                    d = currentTransform[3],
                    heightScale = Math.max(Math.sqrt(c * c + d * d), 1);
                  if (imgData instanceof HTMLElement || !imgData.data) imgToPaint = imgData;
                  else {
                    tmpCanvas = this.cachedCanvases.getCanvas("inlineImage", width, height);
                    var tmpCtx = tmpCanvas.context;
                    putBinaryImageData(tmpCtx, imgData), (imgToPaint = tmpCanvas.canvas);
                  }
                  for (
                    var paintWidth = width, paintHeight = height, tmpCanvasId = "prescale1";
                    (widthScale > 2 && paintWidth > 1) || (heightScale > 2 && paintHeight > 1);

                  ) {
                    var newWidth = paintWidth,
                      newHeight = paintHeight;
                    widthScale > 2 &&
                      paintWidth > 1 &&
                      ((newWidth = Math.ceil(paintWidth / 2)), (widthScale /= paintWidth / newWidth)),
                      heightScale > 2 &&
                        paintHeight > 1 &&
                        ((newHeight = Math.ceil(paintHeight / 2)), (heightScale /= paintHeight / newHeight)),
                      (tmpCanvas = this.cachedCanvases.getCanvas(tmpCanvasId, newWidth, newHeight)),
                      (tmpCtx = tmpCanvas.context),
                      tmpCtx.clearRect(0, 0, newWidth, newHeight),
                      tmpCtx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight, 0, 0, newWidth, newHeight),
                      (imgToPaint = tmpCanvas.canvas),
                      (paintWidth = newWidth),
                      (paintHeight = newHeight),
                      (tmpCanvasId = "prescale1" === tmpCanvasId ? "prescale2" : "prescale1");
                  }
                  if (
                    (ctx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight, 0, -height, width, height),
                    this.imageLayer)
                  ) {
                    var position = this.getCanvasPosition(0, -height);
                    this.imageLayer.appendImage({
                      imgData: imgData,
                      left: position[0],
                      top: position[1],
                      width: width / currentTransform[0],
                      height: height / currentTransform[3],
                    });
                  }
                  this.restore();
                },
                paintInlineImageXObjectGroup: function (imgData, map) {
                  var ctx = this.ctx,
                    w = imgData.width,
                    h = imgData.height,
                    tmpCanvas = this.cachedCanvases.getCanvas("inlineImage", w, h);
                  putBinaryImageData(tmpCanvas.context, imgData);
                  for (var i = 0, ii = map.length; i < ii; i++) {
                    var entry = map[i];
                    if (
                      (ctx.save(),
                      ctx.transform.apply(ctx, entry.transform),
                      ctx.scale(1, -1),
                      ctx.drawImage(tmpCanvas.canvas, entry.x, entry.y, entry.w, entry.h, 0, -1, 1, 1),
                      this.imageLayer)
                    ) {
                      var position = this.getCanvasPosition(entry.x, entry.y);
                      this.imageLayer.appendImage({
                        imgData: imgData,
                        left: position[0],
                        top: position[1],
                        width: w,
                        height: h,
                      });
                    }
                    ctx.restore();
                  }
                },
                paintSolidColorImageMask: function () {
                  this.ctx.fillRect(0, 0, 1, 1);
                },
                paintXObject: function () {
                  warn("Unsupported 'paintXObject' command.");
                },
                markPoint: function (tag) {},
                markPointProps: function (tag, properties) {},
                beginMarkedContent: function (tag) {},
                beginMarkedContentProps: function (tag, properties) {},
                endMarkedContent: function () {},
                beginCompat: function () {},
                endCompat: function () {},
                consumePath: function () {
                  var ctx = this.ctx;
                  this.pendingClip &&
                    (this.pendingClip === EO_CLIP
                      ? void 0 !== ctx.mozFillRule
                        ? ((ctx.mozFillRule = "evenodd"), ctx.clip(), (ctx.mozFillRule = "nonzero"))
                        : ctx.clip("evenodd")
                      : ctx.clip(),
                    (this.pendingClip = null)),
                    ctx.beginPath();
                },
                getSinglePixelWidth: function (scale) {
                  if (null === this.cachedGetSinglePixelWidth) {
                    this.ctx.save();
                    var inverse = this.ctx.mozCurrentTransformInverse;
                    this.ctx.restore(),
                      (this.cachedGetSinglePixelWidth = Math.sqrt(
                        Math.max(
                          inverse[0] * inverse[0] + inverse[1] * inverse[1],
                          inverse[2] * inverse[2] + inverse[3] * inverse[3]
                        )
                      ));
                  }
                  return this.cachedGetSinglePixelWidth;
                },
                getCanvasPosition: function (x, y) {
                  var transform = this.ctx.mozCurrentTransform;
                  return [
                    transform[0] * x + transform[2] * y + transform[4],
                    transform[1] * x + transform[3] * y + transform[5],
                  ];
                },
              };
              for (var op in OPS) CanvasGraphics.prototype[OPS[op]] = CanvasGraphics.prototype[op];
              return CanvasGraphics;
            })();
          (exports.CanvasGraphics = CanvasGraphics), (exports.createScratchCanvas = createScratchCanvas);
        })(
          (root.pdfjsDisplayCanvas = {}),
          root.pdfjsSharedUtil,
          root.pdfjsDisplayDOMUtils,
          root.pdfjsDisplayPatternHelper,
          root.pdfjsDisplayWebGL
        );
      })(this),
      (function (root, factory) {
        !(function (
          exports,
          sharedUtil,
          displayFontLoader,
          displayCanvas,
          displayMetadata,
          displayDOMUtils,
          amdRequire
        ) {
          function getDocument(src, pdfDataRangeTransport, passwordCallback, progressCallback) {
            var task = new PDFDocumentLoadingTask();
            arguments.length > 1 &&
              deprecated(
                "getDocument is called with pdfDataRangeTransport, passwordCallback or progressCallback argument"
              ),
              pdfDataRangeTransport &&
                (pdfDataRangeTransport instanceof PDFDataRangeTransport ||
                  ((pdfDataRangeTransport = Object.create(pdfDataRangeTransport)),
                  (pdfDataRangeTransport.length = src.length),
                  (pdfDataRangeTransport.initialData = src.initialData),
                  pdfDataRangeTransport.abort || (pdfDataRangeTransport.abort = function () {})),
                (src = Object.create(src)),
                (src.range = pdfDataRangeTransport)),
              (task.onPassword = passwordCallback || null),
              (task.onProgress = progressCallback || null);
            var source;
            "string" == typeof src
              ? (source = { url: src })
              : isArrayBuffer(src)
              ? (source = { data: src })
              : src instanceof PDFDataRangeTransport
              ? (source = { range: src })
              : ("object" != typeof src &&
                  error("Invalid parameter in getDocument, need either Uint8Array, string or a parameter object"),
                src.url ||
                  src.data ||
                  src.range ||
                  error("Invalid parameter object: need either .data, .range or .url"),
                (source = src));
            var params = {},
              rangeTransport = null,
              worker = null;
            for (var key in source)
              if ("url" !== key || "undefined" == typeof window)
                if ("range" !== key)
                  if ("worker" !== key)
                    if ("data" !== key || source[key] instanceof Uint8Array) params[key] = source[key];
                    else {
                      var pdfBytes = source[key];
                      "string" == typeof pdfBytes
                        ? (params[key] = stringToBytes(pdfBytes))
                        : "object" != typeof pdfBytes || null === pdfBytes || isNaN(pdfBytes.length)
                        ? isArrayBuffer(pdfBytes)
                          ? (params[key] = new Uint8Array(pdfBytes))
                          : error(
                              "Invalid PDF binary data: either typed array, string or array-like object is expected in the data property."
                            )
                        : (params[key] = new Uint8Array(pdfBytes));
                    }
                  else worker = source[key];
                else rangeTransport = source[key];
              else params[key] = new URL(source[key], window.location).href;
            (params.rangeChunkSize = params.rangeChunkSize || DEFAULT_RANGE_CHUNK_SIZE),
              worker || ((worker = new PDFWorker()), (task._worker = worker));
            var docId = task.docId;
            return (
              worker.promise
                .then(function () {
                  if (task.destroyed) throw new Error("Loading aborted");
                  return _fetchDocument(worker, params, rangeTransport, docId).then(function (workerId) {
                    if (task.destroyed) throw new Error("Loading aborted");
                    var messageHandler = new MessageHandler(docId, workerId, worker.port),
                      transport = new WorkerTransport(messageHandler, task, rangeTransport);
                    (task._transport = transport), messageHandler.send("Ready", null);
                  });
                })
                .catch(task._capability.reject),
              task
            );
          }
          function _fetchDocument(worker, source, pdfDataRangeTransport, docId) {
            return worker.destroyed
              ? Promise.reject(new Error("Worker was destroyed"))
              : ((source.disableAutoFetch = getDefaultSetting("disableAutoFetch")),
                (source.disableStream = getDefaultSetting("disableStream")),
                (source.chunkedViewerLoading = !!pdfDataRangeTransport),
                pdfDataRangeTransport &&
                  ((source.length = pdfDataRangeTransport.length),
                  (source.initialData = pdfDataRangeTransport.initialData)),
                worker.messageHandler
                  .sendWithPromise("GetDocRequest", {
                    docId: docId,
                    source: source,
                    disableRange: getDefaultSetting("disableRange"),
                    maxImageSize: getDefaultSetting("maxImageSize"),
                    cMapUrl: getDefaultSetting("cMapUrl"),
                    cMapPacked: getDefaultSetting("cMapPacked"),
                    disableFontFace: getDefaultSetting("disableFontFace"),
                    disableCreateObjectURL: getDefaultSetting("disableCreateObjectURL"),
                    postMessageTransfers: getDefaultSetting("postMessageTransfers") && !isPostMessageTransfersDisabled,
                  })
                  .then(function (workerId) {
                    if (worker.destroyed) throw new Error("Worker was destroyed");
                    return workerId;
                  }));
          }
          var workerSrc,
            InvalidPDFException = sharedUtil.InvalidPDFException,
            MessageHandler = sharedUtil.MessageHandler,
            MissingPDFException = sharedUtil.MissingPDFException,
            PageViewport = sharedUtil.PageViewport,
            PasswordResponses = sharedUtil.PasswordResponses,
            PasswordException = sharedUtil.PasswordException,
            StatTimer = sharedUtil.StatTimer,
            UnexpectedResponseException = sharedUtil.UnexpectedResponseException,
            UnknownErrorException = sharedUtil.UnknownErrorException,
            Util = sharedUtil.Util,
            createPromiseCapability = sharedUtil.createPromiseCapability,
            error = sharedUtil.error,
            deprecated = sharedUtil.deprecated,
            getVerbosityLevel = sharedUtil.getVerbosityLevel,
            info = sharedUtil.info,
            isInt = sharedUtil.isInt,
            isArray = sharedUtil.isArray,
            isArrayBuffer = sharedUtil.isArrayBuffer,
            isSameOrigin = sharedUtil.isSameOrigin,
            loadJpegStream = sharedUtil.loadJpegStream,
            stringToBytes = sharedUtil.stringToBytes,
            globalScope = sharedUtil.globalScope,
            warn = sharedUtil.warn,
            FontFaceObject = displayFontLoader.FontFaceObject,
            FontLoader = displayFontLoader.FontLoader,
            CanvasGraphics = displayCanvas.CanvasGraphics,
            createScratchCanvas = displayCanvas.createScratchCanvas,
            Metadata = displayMetadata.Metadata,
            getDefaultSetting = displayDOMUtils.getDefaultSetting,
            DEFAULT_RANGE_CHUNK_SIZE = 65536,
            isWorkerDisabled = !1,
            isPostMessageTransfersDisabled = !1,
            useRequireEnsure = !1;
          "undefined" == typeof window &&
            ((isWorkerDisabled = !0),
            void 0 === require.ensure && (require.ensure = require("node-ensure")),
            (useRequireEnsure = !0)),
            "undefined" != typeof __webpack_require__ && (useRequireEnsure = !0),
            "undefined" != typeof requirejs &&
              requirejs.toUrl &&
              (workerSrc = requirejs.toUrl("pdfjs-dist/build/pdf.worker.js"));
          var dynamicLoaderSupported = "undefined" != typeof requirejs && requirejs.load,
            fakeWorkerFilesLoader = useRequireEnsure
              ? function (callback) {
                  require.ensure([], function () {
                    var worker = require("./pdf.worker.js");
                    callback(worker.WorkerMessageHandler);
                  });
                }
              : dynamicLoaderSupported
              ? function (callback) {
                  requirejs(["pdfjs-dist/build/pdf.worker"], function (worker) {
                    callback(worker.WorkerMessageHandler);
                  });
                }
              : null,
            PDFDocumentLoadingTask = (function () {
              function PDFDocumentLoadingTask() {
                (this._capability = createPromiseCapability()),
                  (this._transport = null),
                  (this._worker = null),
                  (this.docId = "d" + nextDocumentId++),
                  (this.destroyed = !1),
                  (this.onPassword = null),
                  (this.onProgress = null),
                  (this.onUnsupportedFeature = null);
              }
              var nextDocumentId = 0;
              return (
                (PDFDocumentLoadingTask.prototype = {
                  get promise() {
                    return this._capability.promise;
                  },
                  destroy: function () {
                    return (
                      (this.destroyed = !0),
                      (this._transport ? this._transport.destroy() : Promise.resolve()).then(
                        function () {
                          (this._transport = null), this._worker && (this._worker.destroy(), (this._worker = null));
                        }.bind(this)
                      )
                    );
                  },
                  then: function (onFulfilled, onRejected) {
                    return this.promise.then.apply(this.promise, arguments);
                  },
                }),
                PDFDocumentLoadingTask
              );
            })(),
            PDFDataRangeTransport = (function () {
              function PDFDataRangeTransport(length, initialData) {
                (this.length = length),
                  (this.initialData = initialData),
                  (this._rangeListeners = []),
                  (this._progressListeners = []),
                  (this._progressiveReadListeners = []),
                  (this._readyCapability = createPromiseCapability());
              }
              return (
                (PDFDataRangeTransport.prototype = {
                  addRangeListener: function (listener) {
                    this._rangeListeners.push(listener);
                  },
                  addProgressListener: function (listener) {
                    this._progressListeners.push(listener);
                  },
                  addProgressiveReadListener: function (listener) {
                    this._progressiveReadListeners.push(listener);
                  },
                  onDataRange: function (begin, chunk) {
                    for (var listeners = this._rangeListeners, i = 0, n = listeners.length; i < n; ++i)
                      listeners[i](begin, chunk);
                  },
                  onDataProgress: function (loaded) {
                    this._readyCapability.promise.then(
                      function () {
                        for (var listeners = this._progressListeners, i = 0, n = listeners.length; i < n; ++i)
                          listeners[i](loaded);
                      }.bind(this)
                    );
                  },
                  onDataProgressiveRead: function (chunk) {
                    this._readyCapability.promise.then(
                      function () {
                        for (var listeners = this._progressiveReadListeners, i = 0, n = listeners.length; i < n; ++i)
                          listeners[i](chunk);
                      }.bind(this)
                    );
                  },
                  transportReady: function () {
                    this._readyCapability.resolve();
                  },
                  requestDataRange: function (begin, end) {
                    throw new Error("Abstract method PDFDataRangeTransport.requestDataRange");
                  },
                  abort: function () {},
                }),
                PDFDataRangeTransport
              );
            })(),
            PDFDocumentProxy = (function () {
              function PDFDocumentProxy(pdfInfo, transport, loadingTask) {
                (this.pdfInfo = pdfInfo), (this.transport = transport), (this.loadingTask = loadingTask);
              }
              return (
                (PDFDocumentProxy.prototype = {
                  get numPages() {
                    return this.pdfInfo.numPages;
                  },
                  get fingerprint() {
                    return this.pdfInfo.fingerprint;
                  },
                  getPage: function (pageNumber) {
                    return this.transport.getPage(pageNumber);
                  },
                  getPageIndex: function (ref) {
                    return this.transport.getPageIndex(ref);
                  },
                  getDestinations: function () {
                    return this.transport.getDestinations();
                  },
                  getDestination: function (id) {
                    return this.transport.getDestination(id);
                  },
                  getPageLabels: function () {
                    return this.transport.getPageLabels();
                  },
                  getAttachments: function () {
                    return this.transport.getAttachments();
                  },
                  getJavaScript: function () {
                    return this.transport.getJavaScript();
                  },
                  getOutline: function () {
                    return this.transport.getOutline();
                  },
                  getMetadata: function () {
                    return this.transport.getMetadata();
                  },
                  getData: function () {
                    return this.transport.getData();
                  },
                  getDownloadInfo: function () {
                    return this.transport.downloadInfoCapability.promise;
                  },
                  getStats: function () {
                    return this.transport.getStats();
                  },
                  cleanup: function () {
                    this.transport.startCleanup();
                  },
                  destroy: function () {
                    return this.loadingTask.destroy();
                  },
                }),
                PDFDocumentProxy
              );
            })(),
            PDFPageProxy = (function () {
              function PDFPageProxy(pageIndex, pageInfo, transport) {
                (this.pageIndex = pageIndex),
                  (this.pageInfo = pageInfo),
                  (this.transport = transport),
                  (this.stats = new StatTimer()),
                  (this.stats.enabled = getDefaultSetting("enableStats")),
                  (this.commonObjs = transport.commonObjs),
                  (this.objs = new PDFObjects()),
                  (this.cleanupAfterRender = !1),
                  (this.pendingCleanup = !1),
                  (this.intentStates = Object.create(null)),
                  (this.destroyed = !1);
              }
              return (
                (PDFPageProxy.prototype = {
                  get pageNumber() {
                    return this.pageIndex + 1;
                  },
                  get rotate() {
                    return this.pageInfo.rotate;
                  },
                  get ref() {
                    return this.pageInfo.ref;
                  },
                  get view() {
                    return this.pageInfo.view;
                  },
                  getViewport: function (scale, rotate) {
                    return (
                      arguments.length < 2 && (rotate = this.rotate), new PageViewport(this.view, scale, rotate, 0, 0)
                    );
                  },
                  getAnnotations: function (params) {
                    var intent = (params && params.intent) || null;
                    return (
                      (this.annotationsPromise && this.annotationsIntent === intent) ||
                        ((this.annotationsPromise = this.transport.getAnnotations(this.pageIndex, intent)),
                        (this.annotationsIntent = intent)),
                      this.annotationsPromise
                    );
                  },
                  render: function (params) {
                    function complete(error) {
                      var i = intentState.renderTasks.indexOf(internalRenderTask);
                      i >= 0 && intentState.renderTasks.splice(i, 1),
                        self.cleanupAfterRender && (self.pendingCleanup = !0),
                        self._tryCleanup(),
                        error ? internalRenderTask.capability.reject(error) : internalRenderTask.capability.resolve(),
                        stats.timeEnd("Rendering"),
                        stats.timeEnd("Overall");
                    }
                    var stats = this.stats;
                    stats.time("Overall"), (this.pendingCleanup = !1);
                    var renderingIntent = "print" === params.intent ? "print" : "display",
                      renderInteractiveForms = !0 === params.renderInteractiveForms;
                    this.intentStates[renderingIntent] || (this.intentStates[renderingIntent] = Object.create(null));
                    var intentState = this.intentStates[renderingIntent];
                    intentState.displayReadyCapability ||
                      ((intentState.receivingOperatorList = !0),
                      (intentState.displayReadyCapability = createPromiseCapability()),
                      (intentState.operatorList = { fnArray: [], argsArray: [], lastChunk: !1 }),
                      this.stats.time("Page Request"),
                      this.transport.messageHandler.send("RenderPageRequest", {
                        pageIndex: this.pageNumber - 1,
                        intent: renderingIntent,
                        renderInteractiveForms: renderInteractiveForms,
                      }));
                    var internalRenderTask = new InternalRenderTask(
                      complete,
                      params,
                      this.objs,
                      this.commonObjs,
                      intentState.operatorList,
                      this.pageNumber
                    );
                    (internalRenderTask.useRequestAnimationFrame = "print" !== renderingIntent),
                      intentState.renderTasks || (intentState.renderTasks = []),
                      intentState.renderTasks.push(internalRenderTask);
                    var renderTask = internalRenderTask.task;
                    params.continueCallback &&
                      (deprecated("render is used with continueCallback parameter"),
                      (renderTask.onContinue = params.continueCallback));
                    var self = this;
                    return (
                      intentState.displayReadyCapability.promise.then(
                        function (transparency) {
                          if (self.pendingCleanup) return void complete();
                          stats.time("Rendering"),
                            internalRenderTask.initializeGraphics(transparency),
                            internalRenderTask.operatorListChanged();
                        },
                        function (reason) {
                          complete(reason);
                        }
                      ),
                      renderTask
                    );
                  },
                  getOperatorList: function () {
                    function operatorListChanged() {
                      if (intentState.operatorList.lastChunk) {
                        intentState.opListReadCapability.resolve(intentState.operatorList);
                        var i = intentState.renderTasks.indexOf(opListTask);
                        i >= 0 && intentState.renderTasks.splice(i, 1);
                      }
                    }
                    this.intentStates.oplist || (this.intentStates.oplist = Object.create(null));
                    var opListTask,
                      intentState = this.intentStates.oplist;
                    return (
                      intentState.opListReadCapability ||
                        ((opListTask = {}),
                        (opListTask.operatorListChanged = operatorListChanged),
                        (intentState.receivingOperatorList = !0),
                        (intentState.opListReadCapability = createPromiseCapability()),
                        (intentState.renderTasks = []),
                        intentState.renderTasks.push(opListTask),
                        (intentState.operatorList = { fnArray: [], argsArray: [], lastChunk: !1 }),
                        this.transport.messageHandler.send("RenderPageRequest", {
                          pageIndex: this.pageIndex,
                          intent: "oplist",
                        })),
                      intentState.opListReadCapability.promise
                    );
                  },
                  getTextContent: function (params) {
                    return this.transport.messageHandler.sendWithPromise("GetTextContent", {
                      pageIndex: this.pageNumber - 1,
                      normalizeWhitespace: !(!params || !0 !== params.normalizeWhitespace),
                      combineTextItems: !params || !0 !== params.disableCombineTextItems,
                    });
                  },
                  _destroy: function () {
                    (this.destroyed = !0), (this.transport.pageCache[this.pageIndex] = null);
                    var waitOn = [];
                    return (
                      Object.keys(this.intentStates).forEach(function (intent) {
                        if ("oplist" !== intent) {
                          this.intentStates[intent].renderTasks.forEach(function (renderTask) {
                            var renderCompleted = renderTask.capability.promise.catch(function () {});
                            waitOn.push(renderCompleted), renderTask.cancel();
                          });
                        }
                      }, this),
                      this.objs.clear(),
                      (this.annotationsPromise = null),
                      (this.pendingCleanup = !1),
                      Promise.all(waitOn)
                    );
                  },
                  destroy: function () {
                    deprecated("page destroy method, use cleanup() instead"), this.cleanup();
                  },
                  cleanup: function () {
                    (this.pendingCleanup = !0), this._tryCleanup();
                  },
                  _tryCleanup: function () {
                    this.pendingCleanup &&
                      !Object.keys(this.intentStates).some(function (intent) {
                        var intentState = this.intentStates[intent];
                        return 0 !== intentState.renderTasks.length || intentState.receivingOperatorList;
                      }, this) &&
                      (Object.keys(this.intentStates).forEach(function (intent) {
                        delete this.intentStates[intent];
                      }, this),
                      this.objs.clear(),
                      (this.annotationsPromise = null),
                      (this.pendingCleanup = !1));
                  },
                  _startRenderPage: function (transparency, intent) {
                    var intentState = this.intentStates[intent];
                    intentState.displayReadyCapability && intentState.displayReadyCapability.resolve(transparency);
                  },
                  _renderPageChunk: function (operatorListChunk, intent) {
                    var i,
                      ii,
                      intentState = this.intentStates[intent];
                    for (i = 0, ii = operatorListChunk.length; i < ii; i++)
                      intentState.operatorList.fnArray.push(operatorListChunk.fnArray[i]),
                        intentState.operatorList.argsArray.push(operatorListChunk.argsArray[i]);
                    for (
                      intentState.operatorList.lastChunk = operatorListChunk.lastChunk, i = 0;
                      i < intentState.renderTasks.length;
                      i++
                    )
                      intentState.renderTasks[i].operatorListChanged();
                    operatorListChunk.lastChunk && ((intentState.receivingOperatorList = !1), this._tryCleanup());
                  },
                }),
                PDFPageProxy
              );
            })(),
            PDFWorker = (function () {
              function getWorkerSrc() {
                return void 0 !== workerSrc
                  ? workerSrc
                  : getDefaultSetting("workerSrc")
                  ? getDefaultSetting("workerSrc")
                  : pdfjsFilePath
                  ? pdfjsFilePath.replace(/\.js$/i, ".worker.js")
                  : void error("No PDFJS.workerSrc specified");
              }
              function setupFakeWorkerGlobal() {
                if (!fakeWorkerFilesLoadedCapability) {
                  fakeWorkerFilesLoadedCapability = createPromiseCapability();
                  (
                    fakeWorkerFilesLoader ||
                    function (callback) {
                      Util.loadScript(getWorkerSrc(), function () {
                        callback(window.pdfjsDistBuildPdfWorker.WorkerMessageHandler);
                      });
                    }
                  )(fakeWorkerFilesLoadedCapability.resolve);
                }
                return fakeWorkerFilesLoadedCapability.promise;
              }
              function FakeWorkerPort(defer) {
                (this._listeners = []), (this._defer = defer), (this._deferred = Promise.resolve(void 0));
              }
              function createCDNWrapper(url) {
                var wrapper = "importScripts('" + url + "');";
                return URL.createObjectURL(new Blob([wrapper]));
              }
              function PDFWorker(name) {
                (this.name = name),
                  (this.destroyed = !1),
                  (this._readyCapability = createPromiseCapability()),
                  (this._port = null),
                  (this._webWorker = null),
                  (this._messageHandler = null),
                  this._initialize();
              }
              var fakeWorkerFilesLoadedCapability,
                nextFakeWorkerId = 0;
              return (
                (FakeWorkerPort.prototype = {
                  postMessage: function (obj, transfers) {
                    function cloneValue(value) {
                      if ("object" != typeof value || null === value) return value;
                      if (cloned.has(value)) return cloned.get(value);
                      var result, buffer;
                      if ((buffer = value.buffer) && isArrayBuffer(buffer)) {
                        var transferable = transfers && transfers.indexOf(buffer) >= 0;
                        return (
                          (result =
                            value === buffer
                              ? value
                              : transferable
                              ? new value.constructor(buffer, value.byteOffset, value.byteLength)
                              : new value.constructor(value)),
                          cloned.set(value, result),
                          result
                        );
                      }
                      (result = isArray(value) ? [] : {}), cloned.set(value, result);
                      for (var i in value) {
                        for (var desc, p = value; !(desc = Object.getOwnPropertyDescriptor(p, i)); )
                          p = Object.getPrototypeOf(p);
                        void 0 !== desc.value &&
                          "function" != typeof desc.value &&
                          (result[i] = cloneValue(desc.value));
                      }
                      return result;
                    }
                    if (!this._defer)
                      return void this._listeners.forEach(function (listener) {
                        listener.call(this, { data: obj });
                      }, this);
                    var cloned = new WeakMap(),
                      e = { data: cloneValue(obj) };
                    this._deferred.then(
                      function () {
                        this._listeners.forEach(function (listener) {
                          listener.call(this, e);
                        }, this);
                      }.bind(this)
                    );
                  },
                  addEventListener: function (name, listener) {
                    this._listeners.push(listener);
                  },
                  removeEventListener: function (name, listener) {
                    var i = this._listeners.indexOf(listener);
                    this._listeners.splice(i, 1);
                  },
                  terminate: function () {
                    this._listeners = [];
                  },
                }),
                (PDFWorker.prototype = {
                  get promise() {
                    return this._readyCapability.promise;
                  },
                  get port() {
                    return this._port;
                  },
                  get messageHandler() {
                    return this._messageHandler;
                  },
                  _initialize: function () {
                    if (!isWorkerDisabled && !getDefaultSetting("disableWorker") && "undefined" != typeof Worker) {
                      var workerSrc = getWorkerSrc();
                      try {
                        isSameOrigin(window.location.href, workerSrc) ||
                          (workerSrc = createCDNWrapper(new URL(workerSrc, window.location).href));
                        var worker = new Worker(workerSrc),
                          messageHandler = new MessageHandler("main", "worker", worker),
                          terminateEarly = function () {
                            worker.removeEventListener("error", onWorkerError),
                              messageHandler.destroy(),
                              worker.terminate(),
                              this.destroyed
                                ? this._readyCapability.reject(new Error("Worker was destroyed"))
                                : this._setupFakeWorker();
                          }.bind(this),
                          onWorkerError = function (event) {
                            this._webWorker || terminateEarly();
                          }.bind(this);
                        worker.addEventListener("error", onWorkerError),
                          messageHandler.on(
                            "test",
                            function (data) {
                              if ((worker.removeEventListener("error", onWorkerError), this.destroyed))
                                return void terminateEarly();
                              data && data.supportTypedArray
                                ? ((this._messageHandler = messageHandler),
                                  (this._port = worker),
                                  (this._webWorker = worker),
                                  data.supportTransfers || (isPostMessageTransfersDisabled = !0),
                                  this._readyCapability.resolve(),
                                  messageHandler.send("configure", { verbosity: getVerbosityLevel() }))
                                : (this._setupFakeWorker(), messageHandler.destroy(), worker.terminate());
                            }.bind(this)
                          ),
                          messageHandler.on("console_log", function (data) {
                            console.log.apply(console, data);
                          }),
                          messageHandler.on("console_error", function (data) {
                            console.error.apply(console, data);
                          }),
                          messageHandler.on(
                            "ready",
                            function (data) {
                              if ((worker.removeEventListener("error", onWorkerError), this.destroyed))
                                return void terminateEarly();
                              try {
                                sendTest();
                              } catch (e) {
                                this._setupFakeWorker();
                              }
                            }.bind(this)
                          );
                        var sendTest = function () {
                          var postMessageTransfers =
                              getDefaultSetting("postMessageTransfers") && !isPostMessageTransfersDisabled,
                            testObj = new Uint8Array([postMessageTransfers ? 255 : 0]);
                          try {
                            messageHandler.send("test", testObj, [testObj.buffer]);
                          } catch (ex) {
                            info("Cannot use postMessage transfers"),
                              (testObj[0] = 0),
                              messageHandler.send("test", testObj);
                          }
                        };
                        return void sendTest();
                      } catch (e) {
                        info("The worker has been disabled.");
                      }
                    }
                    this._setupFakeWorker();
                  },
                  _setupFakeWorker: function () {
                    isWorkerDisabled ||
                      getDefaultSetting("disableWorker") ||
                      (warn("Setting up fake worker."), (isWorkerDisabled = !0)),
                      setupFakeWorkerGlobal().then(
                        function (WorkerMessageHandler) {
                          if (this.destroyed)
                            return void this._readyCapability.reject(new Error("Worker was destroyed"));
                          var isTypedArraysPresent = Uint8Array !== Float32Array,
                            port = new FakeWorkerPort(isTypedArraysPresent);
                          this._port = port;
                          var id = "fake" + nextFakeWorkerId++,
                            workerHandler = new MessageHandler(id + "_worker", id, port);
                          WorkerMessageHandler.setup(workerHandler, port);
                          var messageHandler = new MessageHandler(id, id + "_worker", port);
                          (this._messageHandler = messageHandler), this._readyCapability.resolve();
                        }.bind(this)
                      );
                  },
                  destroy: function () {
                    (this.destroyed = !0),
                      this._webWorker && (this._webWorker.terminate(), (this._webWorker = null)),
                      (this._port = null),
                      this._messageHandler && (this._messageHandler.destroy(), (this._messageHandler = null));
                  },
                }),
                PDFWorker
              );
            })(),
            WorkerTransport = (function () {
              function WorkerTransport(messageHandler, loadingTask, pdfDataRangeTransport) {
                (this.messageHandler = messageHandler),
                  (this.loadingTask = loadingTask),
                  (this.pdfDataRangeTransport = pdfDataRangeTransport),
                  (this.commonObjs = new PDFObjects()),
                  (this.fontLoader = new FontLoader(loadingTask.docId)),
                  (this.destroyed = !1),
                  (this.destroyCapability = null),
                  (this.pageCache = []),
                  (this.pagePromises = []),
                  (this.downloadInfoCapability = createPromiseCapability()),
                  this.setupMessageHandler();
              }
              return (
                (WorkerTransport.prototype = {
                  destroy: function () {
                    if (this.destroyCapability) return this.destroyCapability.promise;
                    (this.destroyed = !0), (this.destroyCapability = createPromiseCapability());
                    var waitOn = [];
                    this.pageCache.forEach(function (page) {
                      page && waitOn.push(page._destroy());
                    }),
                      (this.pageCache = []),
                      (this.pagePromises = []);
                    var self = this,
                      terminated = this.messageHandler.sendWithPromise("Terminate", null);
                    return (
                      waitOn.push(terminated),
                      Promise.all(waitOn).then(function () {
                        self.fontLoader.clear(),
                          self.pdfDataRangeTransport &&
                            (self.pdfDataRangeTransport.abort(), (self.pdfDataRangeTransport = null)),
                          self.messageHandler && (self.messageHandler.destroy(), (self.messageHandler = null)),
                          self.destroyCapability.resolve();
                      }, this.destroyCapability.reject),
                      this.destroyCapability.promise
                    );
                  },
                  setupMessageHandler: function () {
                    function updatePassword(password) {
                      messageHandler.send("UpdatePassword", password);
                    }
                    var messageHandler = this.messageHandler,
                      pdfDataRangeTransport = this.pdfDataRangeTransport;
                    pdfDataRangeTransport &&
                      (pdfDataRangeTransport.addRangeListener(function (begin, chunk) {
                        messageHandler.send("OnDataRange", { begin: begin, chunk: chunk });
                      }),
                      pdfDataRangeTransport.addProgressListener(function (loaded) {
                        messageHandler.send("OnDataProgress", { loaded: loaded });
                      }),
                      pdfDataRangeTransport.addProgressiveReadListener(function (chunk) {
                        messageHandler.send("OnDataRange", { chunk: chunk });
                      }),
                      messageHandler.on(
                        "RequestDataRange",
                        function (data) {
                          pdfDataRangeTransport.requestDataRange(data.begin, data.end);
                        },
                        this
                      )),
                      messageHandler.on(
                        "GetDoc",
                        function (data) {
                          var pdfInfo = data.pdfInfo;
                          this.numPages = data.pdfInfo.numPages;
                          var loadingTask = this.loadingTask,
                            pdfDocument = new PDFDocumentProxy(pdfInfo, this, loadingTask);
                          (this.pdfDocument = pdfDocument), loadingTask._capability.resolve(pdfDocument);
                        },
                        this
                      ),
                      messageHandler.on(
                        "NeedPassword",
                        function (exception) {
                          var loadingTask = this.loadingTask;
                          if (loadingTask.onPassword)
                            return loadingTask.onPassword(updatePassword, PasswordResponses.NEED_PASSWORD);
                          loadingTask._capability.reject(new PasswordException(exception.message, exception.code));
                        },
                        this
                      ),
                      messageHandler.on(
                        "IncorrectPassword",
                        function (exception) {
                          var loadingTask = this.loadingTask;
                          if (loadingTask.onPassword)
                            return loadingTask.onPassword(updatePassword, PasswordResponses.INCORRECT_PASSWORD);
                          loadingTask._capability.reject(new PasswordException(exception.message, exception.code));
                        },
                        this
                      ),
                      messageHandler.on(
                        "InvalidPDF",
                        function (exception) {
                          this.loadingTask._capability.reject(new InvalidPDFException(exception.message));
                        },
                        this
                      ),
                      messageHandler.on(
                        "MissingPDF",
                        function (exception) {
                          this.loadingTask._capability.reject(new MissingPDFException(exception.message));
                        },
                        this
                      ),
                      messageHandler.on(
                        "UnexpectedResponse",
                        function (exception) {
                          this.loadingTask._capability.reject(
                            new UnexpectedResponseException(exception.message, exception.status)
                          );
                        },
                        this
                      ),
                      messageHandler.on(
                        "UnknownError",
                        function (exception) {
                          this.loadingTask._capability.reject(
                            new UnknownErrorException(exception.message, exception.details)
                          );
                        },
                        this
                      ),
                      messageHandler.on(
                        "DataLoaded",
                        function (data) {
                          this.downloadInfoCapability.resolve(data);
                        },
                        this
                      ),
                      messageHandler.on(
                        "PDFManagerReady",
                        function (data) {
                          this.pdfDataRangeTransport && this.pdfDataRangeTransport.transportReady();
                        },
                        this
                      ),
                      messageHandler.on(
                        "StartRenderPage",
                        function (data) {
                          if (!this.destroyed) {
                            var page = this.pageCache[data.pageIndex];
                            page.stats.timeEnd("Page Request"), page._startRenderPage(data.transparency, data.intent);
                          }
                        },
                        this
                      ),
                      messageHandler.on(
                        "RenderPageChunk",
                        function (data) {
                          if (!this.destroyed) {
                            this.pageCache[data.pageIndex]._renderPageChunk(data.operatorList, data.intent);
                          }
                        },
                        this
                      ),
                      messageHandler.on(
                        "commonobj",
                        function (data) {
                          if (!this.destroyed) {
                            var id = data[0],
                              type = data[1];
                            if (!this.commonObjs.hasData(id))
                              switch (type) {
                                case "Font":
                                  var exportedData = data[2];
                                  if ("error" in exportedData) {
                                    var exportedError = exportedData.error;
                                    warn("Error during font loading: " + exportedError),
                                      this.commonObjs.resolve(id, exportedError);
                                    break;
                                  }
                                  var fontRegistry = null;
                                  getDefaultSetting("pdfBug") &&
                                    globalScope.FontInspector &&
                                    globalScope.FontInspector.enabled &&
                                    (fontRegistry = {
                                      registerFont: function (font, url) {
                                        globalScope.FontInspector.fontAdded(font, url);
                                      },
                                    });
                                  var font = new FontFaceObject(exportedData, {
                                    isEvalSuported: getDefaultSetting("isEvalSupported"),
                                    disableFontFace: getDefaultSetting("disableFontFace"),
                                    fontRegistry: fontRegistry,
                                  });
                                  this.fontLoader.bind(
                                    [font],
                                    function (fontObjs) {
                                      this.commonObjs.resolve(id, font);
                                    }.bind(this)
                                  );
                                  break;
                                case "FontPath":
                                  this.commonObjs.resolve(id, data[2]);
                                  break;
                                default:
                                  error("Got unknown common object type " + type);
                              }
                          }
                        },
                        this
                      ),
                      messageHandler.on(
                        "obj",
                        function (data) {
                          if (!this.destroyed) {
                            var imageData,
                              id = data[0],
                              pageIndex = data[1],
                              type = data[2],
                              pageProxy = this.pageCache[pageIndex];
                            if (!pageProxy.objs.hasData(id))
                              switch (type) {
                                case "JpegStream":
                                  (imageData = data[3]), loadJpegStream(id, imageData, pageProxy.objs);
                                  break;
                                case "Image":
                                  (imageData = data[3]), pageProxy.objs.resolve(id, imageData);
                                  imageData &&
                                    "data" in imageData &&
                                    imageData.data.length > 8e6 &&
                                    (pageProxy.cleanupAfterRender = !0);
                                  break;
                                default:
                                  error("Got unknown object type " + type);
                              }
                          }
                        },
                        this
                      ),
                      messageHandler.on(
                        "DocProgress",
                        function (data) {
                          if (!this.destroyed) {
                            var loadingTask = this.loadingTask;
                            loadingTask.onProgress &&
                              loadingTask.onProgress({ loaded: data.loaded, total: data.total });
                          }
                        },
                        this
                      ),
                      messageHandler.on(
                        "PageError",
                        function (data) {
                          if (!this.destroyed) {
                            var page = this.pageCache[data.pageNum - 1],
                              intentState = page.intentStates[data.intent];
                            if (
                              (intentState.displayReadyCapability
                                ? intentState.displayReadyCapability.reject(data.error)
                                : error(data.error),
                              intentState.operatorList)
                            ) {
                              intentState.operatorList.lastChunk = !0;
                              for (var i = 0; i < intentState.renderTasks.length; i++)
                                intentState.renderTasks[i].operatorListChanged();
                            }
                          }
                        },
                        this
                      ),
                      messageHandler.on(
                        "UnsupportedFeature",
                        function (data) {
                          if (!this.destroyed) {
                            var featureId = data.featureId,
                              loadingTask = this.loadingTask;
                            loadingTask.onUnsupportedFeature && loadingTask.onUnsupportedFeature(featureId),
                              _UnsupportedManager.notify(featureId);
                          }
                        },
                        this
                      ),
                      messageHandler.on(
                        "JpegDecode",
                        function (data) {
                          if (this.destroyed) return Promise.reject(new Error("Worker was destroyed"));
                          var imageUrl = data[0],
                            components = data[1];
                          return 3 !== components && 1 !== components
                            ? Promise.reject(new Error("Only 3 components or 1 component can be returned"))
                            : new Promise(function (resolve, reject) {
                                var img = new Image();
                                (img.onload = function () {
                                  var width = img.width,
                                    height = img.height,
                                    size = width * height,
                                    rgbaLength = 4 * size,
                                    buf = new Uint8Array(size * components),
                                    tmpCanvas = createScratchCanvas(width, height),
                                    tmpCtx = tmpCanvas.getContext("2d");
                                  tmpCtx.drawImage(img, 0, 0);
                                  var i,
                                    j,
                                    data = tmpCtx.getImageData(0, 0, width, height).data;
                                  if (3 === components)
                                    for (i = 0, j = 0; i < rgbaLength; i += 4, j += 3)
                                      (buf[j] = data[i]), (buf[j + 1] = data[i + 1]), (buf[j + 2] = data[i + 2]);
                                  else if (1 === components)
                                    for (i = 0, j = 0; i < rgbaLength; i += 4, j++) buf[j] = data[i];
                                  resolve({ data: buf, width: width, height: height });
                                }),
                                  (img.onerror = function () {
                                    reject(new Error("JpegDecode failed to load image"));
                                  }),
                                  (img.src = imageUrl);
                              });
                        },
                        this
                      );
                  },
                  getData: function () {
                    return this.messageHandler.sendWithPromise("GetData", null);
                  },
                  getPage: function (pageNumber, capability) {
                    if (!isInt(pageNumber) || pageNumber <= 0 || pageNumber > this.numPages)
                      return Promise.reject(new Error("Invalid page request"));
                    var pageIndex = pageNumber - 1;
                    if (pageIndex in this.pagePromises) return this.pagePromises[pageIndex];
                    var promise = this.messageHandler.sendWithPromise("GetPage", { pageIndex: pageIndex }).then(
                      function (pageInfo) {
                        if (this.destroyed) throw new Error("Transport destroyed");
                        var page = new PDFPageProxy(pageIndex, pageInfo, this);
                        return (this.pageCache[pageIndex] = page), page;
                      }.bind(this)
                    );
                    return (this.pagePromises[pageIndex] = promise), promise;
                  },
                  getPageIndex: function (ref) {
                    return this.messageHandler.sendWithPromise("GetPageIndex", { ref: ref }).catch(function (reason) {
                      return Promise.reject(new Error(reason));
                    });
                  },
                  getAnnotations: function (pageIndex, intent) {
                    return this.messageHandler.sendWithPromise("GetAnnotations", {
                      pageIndex: pageIndex,
                      intent: intent,
                    });
                  },
                  getDestinations: function () {
                    return this.messageHandler.sendWithPromise("GetDestinations", null);
                  },
                  getDestination: function (id) {
                    return this.messageHandler.sendWithPromise("GetDestination", { id: id });
                  },
                  getPageLabels: function () {
                    return this.messageHandler.sendWithPromise("GetPageLabels", null);
                  },
                  getAttachments: function () {
                    return this.messageHandler.sendWithPromise("GetAttachments", null);
                  },
                  getJavaScript: function () {
                    return this.messageHandler.sendWithPromise("GetJavaScript", null);
                  },
                  getOutline: function () {
                    return this.messageHandler.sendWithPromise("GetOutline", null);
                  },
                  getMetadata: function () {
                    return this.messageHandler.sendWithPromise("GetMetadata", null).then(function (results) {
                      return { info: results[0], metadata: results[1] ? new Metadata(results[1]) : null };
                    });
                  },
                  getStats: function () {
                    return this.messageHandler.sendWithPromise("GetStats", null);
                  },
                  startCleanup: function () {
                    this.messageHandler.sendWithPromise("Cleanup", null).then(
                      function () {
                        for (var i = 0, ii = this.pageCache.length; i < ii; i++) {
                          var page = this.pageCache[i];
                          page && page.cleanup();
                        }
                        this.commonObjs.clear(), this.fontLoader.clear();
                      }.bind(this)
                    );
                  },
                }),
                WorkerTransport
              );
            })(),
            PDFObjects = (function () {
              function PDFObjects() {
                this.objs = Object.create(null);
              }
              return (
                (PDFObjects.prototype = {
                  ensureObj: function (objId) {
                    if (this.objs[objId]) return this.objs[objId];
                    var obj = { capability: createPromiseCapability(), data: null, resolved: !1 };
                    return (this.objs[objId] = obj), obj;
                  },
                  get: function (objId, callback) {
                    if (callback) return this.ensureObj(objId).capability.promise.then(callback), null;
                    var obj = this.objs[objId];
                    return (
                      (obj && obj.resolved) || error("Requesting object that isn't resolved yet " + objId), obj.data
                    );
                  },
                  resolve: function (objId, data) {
                    var obj = this.ensureObj(objId);
                    (obj.resolved = !0), (obj.data = data), obj.capability.resolve(data);
                  },
                  isResolved: function (objId) {
                    var objs = this.objs;
                    return !!objs[objId] && objs[objId].resolved;
                  },
                  hasData: function (objId) {
                    return this.isResolved(objId);
                  },
                  getData: function (objId) {
                    var objs = this.objs;
                    return objs[objId] && objs[objId].resolved ? objs[objId].data : null;
                  },
                  clear: function () {
                    this.objs = Object.create(null);
                  },
                }),
                PDFObjects
              );
            })(),
            RenderTask = (function () {
              function RenderTask(internalRenderTask) {
                (this._internalRenderTask = internalRenderTask), (this.onContinue = null);
              }
              return (
                (RenderTask.prototype = {
                  get promise() {
                    return this._internalRenderTask.capability.promise;
                  },
                  cancel: function () {
                    this._internalRenderTask.cancel();
                  },
                  then: function (onFulfilled, onRejected) {
                    return this.promise.then.apply(this.promise, arguments);
                  },
                }),
                RenderTask
              );
            })(),
            InternalRenderTask = (function () {
              function InternalRenderTask(callback, params, objs, commonObjs, operatorList, pageNumber) {
                (this.callback = callback),
                  (this.params = params),
                  (this.objs = objs),
                  (this.commonObjs = commonObjs),
                  (this.operatorListIdx = null),
                  (this.operatorList = operatorList),
                  (this.pageNumber = pageNumber),
                  (this.running = !1),
                  (this.graphicsReadyCallback = null),
                  (this.graphicsReady = !1),
                  (this.useRequestAnimationFrame = !1),
                  (this.cancelled = !1),
                  (this.capability = createPromiseCapability()),
                  (this.task = new RenderTask(this)),
                  (this._continueBound = this._continue.bind(this)),
                  (this._scheduleNextBound = this._scheduleNext.bind(this)),
                  (this._nextBound = this._next.bind(this));
              }
              return (
                (InternalRenderTask.prototype = {
                  initializeGraphics: function (transparency) {
                    if (!this.cancelled) {
                      getDefaultSetting("pdfBug") &&
                        globalScope.StepperManager &&
                        globalScope.StepperManager.enabled &&
                        ((this.stepper = globalScope.StepperManager.create(this.pageNumber - 1)),
                        this.stepper.init(this.operatorList),
                        (this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint()));
                      var params = this.params;
                      (this.gfx = new CanvasGraphics(
                        params.canvasContext,
                        this.commonObjs,
                        this.objs,
                        params.imageLayer
                      )),
                        this.gfx.beginDrawing(params.transform, params.viewport, transparency),
                        (this.operatorListIdx = 0),
                        (this.graphicsReady = !0),
                        this.graphicsReadyCallback && this.graphicsReadyCallback();
                    }
                  },
                  cancel: function () {
                    (this.running = !1), (this.cancelled = !0), this.callback("cancelled");
                  },
                  operatorListChanged: function () {
                    if (!this.graphicsReady)
                      return void (this.graphicsReadyCallback || (this.graphicsReadyCallback = this._continueBound));
                    this.stepper && this.stepper.updateOperatorList(this.operatorList),
                      this.running || this._continue();
                  },
                  _continue: function () {
                    (this.running = !0),
                      this.cancelled ||
                        (this.task.onContinue
                          ? this.task.onContinue.call(this.task, this._scheduleNextBound)
                          : this._scheduleNext());
                  },
                  _scheduleNext: function () {
                    this.useRequestAnimationFrame && "undefined" != typeof window
                      ? window.requestAnimationFrame(this._nextBound)
                      : Promise.resolve(void 0).then(this._nextBound);
                  },
                  _next: function () {
                    this.cancelled ||
                      ((this.operatorListIdx = this.gfx.executeOperatorList(
                        this.operatorList,
                        this.operatorListIdx,
                        this._continueBound,
                        this.stepper
                      )),
                      this.operatorListIdx === this.operatorList.argsArray.length &&
                        ((this.running = !1), this.operatorList.lastChunk && (this.gfx.endDrawing(), this.callback())));
                  },
                }),
                InternalRenderTask
              );
            })(),
            _UnsupportedManager = (function () {
              var listeners = [];
              return {
                listen: function (cb) {
                  deprecated(
                    "Global UnsupportedManager.listen is used:  use PDFDocumentLoadingTask.onUnsupportedFeature instead"
                  ),
                    listeners.push(cb);
                },
                notify: function (featureId) {
                  for (var i = 0, ii = listeners.length; i < ii; i++) listeners[i](featureId);
                },
              };
            })();
          (exports.version = "1.6.210"),
            (exports.build = "4ce2356"),
            (exports.getDocument = getDocument),
            (exports.PDFDataRangeTransport = PDFDataRangeTransport),
            (exports.PDFWorker = PDFWorker),
            (exports.PDFDocumentProxy = PDFDocumentProxy),
            (exports.PDFPageProxy = PDFPageProxy),
            (exports._UnsupportedManager = _UnsupportedManager);
        })(
          (root.pdfjsDisplayAPI = {}),
          root.pdfjsSharedUtil,
          root.pdfjsDisplayFontLoader,
          root.pdfjsDisplayCanvas,
          root.pdfjsDisplayMetadata,
          root.pdfjsDisplayDOMUtils
        );
      })(this),
      (function (root, factory) {
        !(function (
          exports,
          sharedUtil,
          displayDOMUtils,
          displayAPI,
          displayAnnotationLayer,
          displayTextLayer,
          displayMetadata,
          displaySVG
        ) {
          var globalScope = sharedUtil.globalScope,
            deprecated = sharedUtil.deprecated,
            warn = sharedUtil.warn,
            LinkTarget = displayDOMUtils.LinkTarget,
            isWorker = "undefined" == typeof window;
          globalScope.PDFJS || (globalScope.PDFJS = {});
          var PDFJS = globalScope.PDFJS;
          (PDFJS.version = "1.6.210"),
            (PDFJS.build = "4ce2356"),
            (PDFJS.pdfBug = !1),
            void 0 !== PDFJS.verbosity && sharedUtil.setVerbosityLevel(PDFJS.verbosity),
            delete PDFJS.verbosity,
            Object.defineProperty(PDFJS, "verbosity", {
              get: function () {
                return sharedUtil.getVerbosityLevel();
              },
              set: function (level) {
                sharedUtil.setVerbosityLevel(level);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (PDFJS.VERBOSITY_LEVELS = sharedUtil.VERBOSITY_LEVELS),
            (PDFJS.OPS = sharedUtil.OPS),
            (PDFJS.UNSUPPORTED_FEATURES = sharedUtil.UNSUPPORTED_FEATURES),
            (PDFJS.isValidUrl = sharedUtil.isValidUrl),
            (PDFJS.shadow = sharedUtil.shadow),
            (PDFJS.createBlob = sharedUtil.createBlob),
            (PDFJS.createObjectURL = function (data, contentType) {
              return sharedUtil.createObjectURL(data, contentType, PDFJS.disableCreateObjectURL);
            }),
            Object.defineProperty(PDFJS, "isLittleEndian", {
              configurable: !0,
              get: function () {
                var value = sharedUtil.isLittleEndian();
                return sharedUtil.shadow(PDFJS, "isLittleEndian", value);
              },
            }),
            (PDFJS.removeNullCharacters = sharedUtil.removeNullCharacters),
            (PDFJS.PasswordResponses = sharedUtil.PasswordResponses),
            (PDFJS.PasswordException = sharedUtil.PasswordException),
            (PDFJS.UnknownErrorException = sharedUtil.UnknownErrorException),
            (PDFJS.InvalidPDFException = sharedUtil.InvalidPDFException),
            (PDFJS.MissingPDFException = sharedUtil.MissingPDFException),
            (PDFJS.UnexpectedResponseException = sharedUtil.UnexpectedResponseException),
            (PDFJS.Util = sharedUtil.Util),
            (PDFJS.PageViewport = sharedUtil.PageViewport),
            (PDFJS.createPromiseCapability = sharedUtil.createPromiseCapability),
            (PDFJS.maxImageSize = void 0 === PDFJS.maxImageSize ? -1 : PDFJS.maxImageSize),
            (PDFJS.cMapUrl = void 0 === PDFJS.cMapUrl ? null : PDFJS.cMapUrl),
            (PDFJS.cMapPacked = void 0 !== PDFJS.cMapPacked && PDFJS.cMapPacked),
            (PDFJS.disableFontFace = void 0 !== PDFJS.disableFontFace && PDFJS.disableFontFace),
            (PDFJS.imageResourcesPath = void 0 === PDFJS.imageResourcesPath ? "" : PDFJS.imageResourcesPath),
            (PDFJS.disableWorker = void 0 !== PDFJS.disableWorker && PDFJS.disableWorker),
            (PDFJS.workerSrc = void 0 === PDFJS.workerSrc ? null : PDFJS.workerSrc),
            (PDFJS.disableRange = void 0 !== PDFJS.disableRange && PDFJS.disableRange),
            (PDFJS.disableStream = void 0 !== PDFJS.disableStream && PDFJS.disableStream),
            (PDFJS.disableAutoFetch = void 0 !== PDFJS.disableAutoFetch && PDFJS.disableAutoFetch),
            (PDFJS.pdfBug = void 0 !== PDFJS.pdfBug && PDFJS.pdfBug),
            (PDFJS.postMessageTransfers = void 0 === PDFJS.postMessageTransfers || PDFJS.postMessageTransfers),
            (PDFJS.disableCreateObjectURL = void 0 !== PDFJS.disableCreateObjectURL && PDFJS.disableCreateObjectURL),
            (PDFJS.disableWebGL = void 0 === PDFJS.disableWebGL || PDFJS.disableWebGL),
            (PDFJS.externalLinkTarget =
              void 0 === PDFJS.externalLinkTarget ? LinkTarget.NONE : PDFJS.externalLinkTarget),
            (PDFJS.externalLinkRel = void 0 === PDFJS.externalLinkRel ? "noreferrer" : PDFJS.externalLinkRel),
            (PDFJS.isEvalSupported = void 0 === PDFJS.isEvalSupported || PDFJS.isEvalSupported);
          var savedOpenExternalLinksInNewWindow = PDFJS.openExternalLinksInNewWindow;
          delete PDFJS.openExternalLinksInNewWindow,
            Object.defineProperty(PDFJS, "openExternalLinksInNewWindow", {
              get: function () {
                return PDFJS.externalLinkTarget === LinkTarget.BLANK;
              },
              set: function (value) {
                if (
                  (value &&
                    deprecated(
                      'PDFJS.openExternalLinksInNewWindow, please use "PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK" instead.'
                    ),
                  PDFJS.externalLinkTarget !== LinkTarget.NONE)
                )
                  return void warn("PDFJS.externalLinkTarget is already initialized");
                PDFJS.externalLinkTarget = value ? LinkTarget.BLANK : LinkTarget.NONE;
              },
              enumerable: !0,
              configurable: !0,
            }),
            savedOpenExternalLinksInNewWindow &&
              (PDFJS.openExternalLinksInNewWindow = savedOpenExternalLinksInNewWindow),
            (PDFJS.getDocument = displayAPI.getDocument),
            (PDFJS.PDFDataRangeTransport = displayAPI.PDFDataRangeTransport),
            (PDFJS.PDFWorker = displayAPI.PDFWorker),
            Object.defineProperty(PDFJS, "hasCanvasTypedArrays", {
              configurable: !0,
              get: function () {
                var value = displayDOMUtils.hasCanvasTypedArrays();
                return sharedUtil.shadow(PDFJS, "hasCanvasTypedArrays", value);
              },
            }),
            (PDFJS.CustomStyle = displayDOMUtils.CustomStyle),
            (PDFJS.LinkTarget = LinkTarget),
            (PDFJS.addLinkAttributes = displayDOMUtils.addLinkAttributes),
            (PDFJS.getFilenameFromUrl = displayDOMUtils.getFilenameFromUrl),
            (PDFJS.isExternalLinkTargetSet = displayDOMUtils.isExternalLinkTargetSet),
            (PDFJS.AnnotationLayer = displayAnnotationLayer.AnnotationLayer),
            (PDFJS.renderTextLayer = displayTextLayer.renderTextLayer),
            (PDFJS.Metadata = displayMetadata.Metadata),
            (PDFJS.SVGGraphics = displaySVG.SVGGraphics),
            (PDFJS.UnsupportedManager = displayAPI._UnsupportedManager),
            (exports.globalScope = globalScope),
            (exports.isWorker = isWorker),
            (exports.PDFJS = globalScope.PDFJS);
        })(
          (root.pdfjsDisplayGlobal = {}),
          root.pdfjsSharedUtil,
          root.pdfjsDisplayDOMUtils,
          root.pdfjsDisplayAPI,
          root.pdfjsDisplayAnnotationLayer,
          root.pdfjsDisplayTextLayer,
          root.pdfjsDisplayMetadata,
          root.pdfjsDisplaySVG
        );
      })(this);
  }.call(pdfjsLibs),
    (exports.PDFJS = pdfjsLibs.pdfjsDisplayGlobal.PDFJS),
    (exports.build = pdfjsLibs.pdfjsDisplayAPI.build),
    (exports.version = pdfjsLibs.pdfjsDisplayAPI.version),
    (exports.getDocument = pdfjsLibs.pdfjsDisplayAPI.getDocument),
    (exports.PDFDataRangeTransport = pdfjsLibs.pdfjsDisplayAPI.PDFDataRangeTransport),
    (exports.PDFWorker = pdfjsLibs.pdfjsDisplayAPI.PDFWorker),
    (exports.renderTextLayer = pdfjsLibs.pdfjsDisplayTextLayer.renderTextLayer),
    (exports.AnnotationLayer = pdfjsLibs.pdfjsDisplayAnnotationLayer.AnnotationLayer),
    (exports.CustomStyle = pdfjsLibs.pdfjsDisplayDOMUtils.CustomStyle),
    (exports.PasswordResponses = pdfjsLibs.pdfjsSharedUtil.PasswordResponses),
    (exports.InvalidPDFException = pdfjsLibs.pdfjsSharedUtil.InvalidPDFException),
    (exports.MissingPDFException = pdfjsLibs.pdfjsSharedUtil.MissingPDFException),
    (exports.SVGGraphics = pdfjsLibs.pdfjsDisplaySVG.SVGGraphics),
    (exports.UnexpectedResponseException = pdfjsLibs.pdfjsSharedUtil.UnexpectedResponseException),
    (exports.OPS = pdfjsLibs.pdfjsSharedUtil.OPS),
    (exports.UNSUPPORTED_FEATURES = pdfjsLibs.pdfjsSharedUtil.UNSUPPORTED_FEATURES),
    (exports.isValidUrl = pdfjsLibs.pdfjsSharedUtil.isValidUrl),
    (exports.createObjectURL = pdfjsLibs.pdfjsSharedUtil.createObjectURL),
    (exports.removeNullCharacters = pdfjsLibs.pdfjsSharedUtil.removeNullCharacters),
    (exports.shadow = pdfjsLibs.pdfjsSharedUtil.shadow),
    (exports.createBlob = pdfjsLibs.pdfjsSharedUtil.createBlob),
    (exports.getFilenameFromUrl = pdfjsLibs.pdfjsDisplayDOMUtils.getFilenameFromUrl),
    (exports.addLinkAttributes = pdfjsLibs.pdfjsDisplayDOMUtils.addLinkAttributes));
});
