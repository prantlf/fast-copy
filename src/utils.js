// constants
import {HAS_PROPERTY_SYMBOL_SUPPORT, HAS_WEAKMAP_SUPPORT, HAS_WEAKSET_SUPPORT} from './constants';

const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

/**
 * @function getNewCache
 *
 * @description
 * get a new cache object to prevent circular references
 *
 * @returns {Object|Weakset} the new cache object
 */
export const getNewCache = () =>
  HAS_WEAKMAP_SUPPORT
    ? new WeakSet()
    : Object.create({
      _values: [],
      add(value) {
        this._values.push(value);
      },
      has(value) {
        return !!~this._values.indexOf(value);
      }
    });

/**
 * @function getRegExpFlags
 *
 * @description
 * get the flags to apply to the copied regexp
 *
 * @param {RegExp} regExp the regexp to get the flags of
 * @returns {string} the flags for the regexp
 */
export const getRegExpFlags = (regExp) => {
  let flags = '';

  if (regExp.global) {
    flags += 'g';
  }

  if (regExp.ignoreCase) {
    flags += 'i';
  }

  if (regExp.multiline) {
    flags += 'm';
  }

  return flags;
};

/**
 * @function getSymbols
 *
 * @description
 * get the symbols present in the object that are enumerable
 *
 * @param {Object} object the object to get the symbols from
 * @returns {Array<Symbol>} the symbols in the object
 */
export const getSymbols = (object) =>
  HAS_PROPERTY_SYMBOL_SUPPORT
    ? Object.getOwnPropertySymbols(object).filter((symbol) => propertyIsEnumerable.call(object, symbol))
    : [];

/**
 * @function isObjectCopyable
 *
 * @description
 * is the object able to be copied
 *
 * @param {any} object the object to test
 * @param {Object|Weakset} cache the cache of copied values
 * @returns {boolean} can the object be copied
 */
export const isObjectCopyable = (object, cache) =>
  typeof object === 'object' &&
  !!object &&
  !cache.has(object) &&
  typeof object.then !== 'function' &&
  !(object instanceof Error) &&
  !(HAS_WEAKMAP_SUPPORT && object instanceof WeakMap) &&
  !(HAS_WEAKSET_SUPPORT && object instanceof WeakSet);

/**
 * @function copyArray
 *
 * @description
 * copy the array, deeply copying the values
 *
 * @param {Array<any>} array the array to copy
 * @param {function} copy the function to copy values
 * @returns {Array<any>} the copied array
 */
export const copyArray = (array, copy) => {
  const newArray = new array.constructor();

  for (let index = 0; index < array.length; index++) {
    newArray.push(copy(array[index]));
  }

  return newArray;
};

/**
 * @function copyArrayBuffer
 *
 * @description
 * copy the arrayBuffer, deeply copying the values
 *
 * @param {ArrayBuffer} arrayBuffer the arrayBuffer to copy
 * @returns {ArrayBuffer} the copied bufarrayBufferfer
 */
export const copyArrayBuffer = (arrayBuffer) => arrayBuffer.slice();

/**
 * @function copyBuffer
 *
 * @description
 * copy the buffer, deeply copying the values
 *
 * @param {Buffer} buffer the buffer to copy
 * @returns {Buffer} the copied buffer
 */
export const copyBuffer = (buffer) => {
  const newBuffer = Buffer.allocUnsafe ? Buffer.allocUnsafe(buffer.length) : new Buffer(buffer.length);

  buffer.copy(newBuffer);

  return newBuffer;
};

/**
 * @function copyIterable
 *
 * @description
 * copy the iterable values into a new iterable of the same type
 *
 * @param {Map|Set} iterable the iterable to copy
 * @param {function} copy the copy method
 * @param {boolean} isMap is the iterable a map
 * @returns {Map|Set} the copied iterable
 */
export const copyIterable = (iterable, copy, isMap) => {
  const newIterable = new iterable.constructor();

  iterable.forEach((value, key) => {
    if (isMap) {
      newIterable.set(key, copy(value));
    } else {
      newIterable.add(copy(value));
    }
  });

  return newIterable;
};

/**
 * @function copyObject
 *
 * @description
 * copy the object values into a new object of the same type
 *
 * @param {Object} object the object to copy
 * @param {function} copy the copy method
 * @param {boolean} isPlainObject is the object to copy a plain object
 * @returns {Object} the copied object
 */
export const copyObject = (object, copy, isPlainObject) => {
  const newObject = isPlainObject ? {} : object.constructor ? new object.constructor() : Object.create(null);
  const keys = Object.keys(object);

  if (keys.length) {
    let key;

    for (let index = 0; index < keys.length; index++) {
      key = keys[index];

      newObject[key] = copy(object[key]);
    }
  }

  const symbols = getSymbols(object);

  if (symbols.length) {
    let symbol;

    for (let index = 0; index < symbols.length; index++) {
      symbol = symbols[index];

      newObject[symbol] = copy(object[symbol]);
    }
  }

  return newObject;
};

/**
 * @function copyRegExp
 *
 * @description
 * copy the RegExp to a new RegExp with the same properties
 *
 * @param {RegExp} regExp the RegExp to copy
 * @returns {RegExp} the copied RegExp
 */
export const copyRegExp = (regExp) => {
  const newRegExp = new RegExp(regExp.source, getRegExpFlags(regExp));

  newRegExp.lastIndex = regExp.lastIndex;

  return newRegExp;
};

/**
 * @function copyTypedArray
 *
 * @description
 * copy the typedArray, deeply copying the values
 *
 * @param {TypedArray} typedArray the typedArray to copy
 * @returns {TypedArray} the copied typedArray
 */
export const copyTypedArray = (typedArray) => new typedArray.constructor(typedArray.buffer);
