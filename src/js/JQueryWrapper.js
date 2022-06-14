//#region IE compatibility

// querySelectorAll not supported situation.
if (!document.querySelectorAll) {
    document.querySelectorAll = function (selector) {
        var cmStyle = document.createStyleSheet(),
            cmSelect = function (s, maxCount) {
                var all = document.all,
                    l = all.length,
                    i,
                    resultSet = [];

                // skip selector contains comma situation.
                if (s.indexOf(',') > -1) return resultSet;

                cmStyle.addRule(s, 'foo:bar');

                for (i = 0; i < l; i += 1) {
                    if (all[i].currentStyle.foo === 'bar') {
                        resultSet.push(all[i]);
                        if (resultSet.length > maxCount) {
                            break;
                        }
                    }
                }

                cmStyle.removeRule(0);

                return resultSet;
            };

        return cmSelect(selector, Infinity);
    };
}

// querySelector not supported situation.
if (!document.querySelector) {
    document.querySelector = function (selector) {
        return document.querySelectorAll(selector)[0] || null;
    };
}

var querySelectorAll = function (element, selector) {
    if (typeof element.querySelectorAll === 'function') {
        return element.querySelectorAll(selector);
    } else {
        return document.querySelectorAll(selector);
    }
};

var remove = function (element) {
    if (typeof element.remove === 'function') {
        element.remove();
    } else {
        element.parentNode.removeChild(element);
    }
};

var addEvent = function (element, event, fn) {
    if (typeof element.addEventListener === 'function')
        element.addEventListener(event, fn, false);
    else {
        element.attachEvent('on' + event, fn);
    }
};

var removeEvent = function (element, event, fn) {
    if (typeof element.removeEventListener === 'function')
        element.removeEventListener(event, fn, false);
    else {
        element.detachEvent('on' + event, fn);
    }
};

var isElement = function (element) {
    try {
        //Using W3 DOM2 (works for FF, Opera and Chrome)
        return element instanceof HTMLElement;
    } catch (e) {
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have (works on IE7)
        return (
            typeof element === 'object' &&
            element.nodeType === 1 &&
            typeof element.style === 'object' &&
            typeof element.ownerDocument === 'object'
        );
    }
};

var isArray = function (obj) {
    if (typeof Array.isArray === 'function') {
        return Array.isArray(obj);
    } else {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};

//#endregion

/**
 * Find an element.
 *
 * @param {string|Object} selector - The css selector of the element.
 *                                   If object then it can either be document or an element.
 * @param {Object} parent - The parent element, or undefined for document.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
var _cm = function (selector, parent) {
    var self = this;

    parent = parent || document;

    if (typeof selector === 'object') {
        self.el = isArray(selector) ? selector : [selector];
    } else if (typeof selector === 'string') {
        self.el = querySelectorAll(parent, selector);
    }

    // Convert ElementList to Array.
    self.el = [].slice.call(self.el);

    // Array Length
    self.length = self.el.length;

    return self;
};

/**
 * External call identify (ex. $('xxx'))
 *
 * @param {string|Object} selector - The css selector of the element.
 *                                   If object then it can either be document or an element.
 * @param {Object} parent - The parent element, or undefined for document.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
var $ = function (selector, parent) {
    return new _cm(selector, parent);
};

//#region Ajax

$.support = {
    cors: false,
};

/**
 * Send Request
 *
 * @param {Object} options - options
 */
$.send = function (options) {
    var xhr = new XMLHttpRequest();
    var url = options.url;
    var method = options.type;
    var async = options.async;
    var params = options.data;
    var dataType = options.dataType ? options.dataType : options.datatype;
    var contentType = options.contentType
        ? options.contentType
        : options.contenttype;
    var successFn = options.success;
    var errorFn = options.error;
    var parseData = function (type, data) {
        switch (type) {
            case 'json':
                return JSON.parse(data);
            default:
                return data;
        }
    };

    xhr.open(method, url, async);

    if (method === 'POST') {
        xhr.setRequestHeader(
            'Content-type',
            contentType ? contentType : 'application/x-www-form-urlencoded'
        );
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (typeof successFn === 'function') {
                    successFn(parseData(dataType, xhr.responseText));
                }
            } else {
                if (typeof errorFn === 'function') {
                    errorFn(xhr);
                }
            }
        }
    };

    xhr.send(params);
};

/**
 * Get
 *
 * @param {Object} options - options
 */
$.get = function (options) {
    var data = options.data;

    if (data) {
        if (typeof data === 'object') {
            var query = [];
            for (var key in data) {
                query.push(
                    encodeURIComponent(key) +
                        '=' +
                        encodeURIComponent(data[key])
                );
            }
            options.url = options.url + '?' + query.join('&');
        } else {
            options.url = options.url + '?' + options.data;
        }
    }

    // clean data field.
    options.data = null;

    $.send(options);
};

/**
 * Post
 *
 * @param {Object} options - options
 */
$.post = function (options) {
    var data = options.data;

    if (data && typeof data === 'object') {
        // FormData
        if (
            options.contentType.indexOf('application/x-www-form-urlencoded') >
            -1
        ) {
            var query = [];
            for (var key in data) {
                query.push(
                    encodeURIComponent(key) +
                        '=' +
                        encodeURIComponent(data[key])
                );
            }
            options.data = query.join('&');
            // Json
        } else if (options.contentType.indexOf('application/json') > -1) {
            options.data = JSON.stringify(data);
        }
    }

    $.send(options);
};

/**
 * Similar to jQuery.ajax().
 *
 * @param {Object} options - options
 */
$.ajax = function (options) {
    switch (options.type) {
        case 'GET':
            $.get(options);
            break;
        case 'POST':
            $.post(options);
            break;
        default:
            break;
    }
};

//#endregion

/**
 * Run a callback against located elements.
 *
 * @param {function} fn - The callback we want to run on each element.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.each = function (fn) {
    var self = this;

    for (var i = 0; i < self.el.length; i++) {
        fn(i, self.el[i]);
    }

    return self;
};

/**
 * Find a selector inside elements.
 *
 * @param {string} selector - The css selector of the element.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.find = function (selector) {
    return new _cm(selector, this.el[0]);
};

/**
 * Show the element(s)
 *
 * @param {string} display - The css-display mode. Defaults to 'block'.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.show = function (display) {
    var self = this;

    display = display || null;

    self.each(function (index, el) {
        el.style.display = display;
    });

    return self;
};

/**
 * Hide the element(s).
 *
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.hide = function () {
    var self = this;

    self.each(function (index, el) {
        el.style.display = 'none';
    });

    return self;
};

/**
 * Similar to element.insertAdjacentHTML(...).
 *
 * @param {Object} position - beforebegin、afterbegin、beforeend、afterend
 * @param {Object} object - probably element or text
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.insertAdjacent = function (position, object) {
    var self = this,
        selfEl = self.el[0],
        text = '';

    if (!selfEl) return undefined;

    if (typeof object === 'string') {
        text = object;
    } else {
        var otherEl = object.el[0];

        if (selfEl.id === otherEl.id) {
            return self;
        }

        text = otherEl.outerHTML;
        remove(otherEl);
    }

    selfEl.insertAdjacentHTML(position, text);

    return self;
};

/**
 * Similar to jQuery.before().
 *
 * @param {Object} object - probably element or text
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.before = function (object) {
    return this.insertAdjacent('beforebegin', object);
};

/**
 * Similar to jQuery.after().
 *
 * @param {Object} object - probably element or text
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.after = function (object) {
    return this.insertAdjacent('afterend', object);
};

/**
 * Similar to jQuery.val().
 *
 * @param {Object} value - The value we want to assign or undefined if we want to get the value.
 * @return {string} - return element value.
 */
_cm.prototype.val = function (value) {
    var self = this,
        selfEl = self.el[0];

    if (!selfEl) return undefined;

    if (value) {
        selfEl.value = value;
    } else {
        return selfEl.value;
    }
};

/**
 * Similar to jQuery.width().
 *
 * @param {Object} value - The value we want to assign or undefined if we want to get the value.
 * @return {number} - return element width.
 */
_cm.prototype.width = function (value) {
    var self = this,
        selfEl = self.el[0];

    if (!selfEl) return undefined;

    // Get element width
    if (typeof value === 'undefined') {
        // offsetWidth includes border width, clientWidth does not.
        return selfEl.clientWidth;
    }

    // Set element width
    selfEl.style.width = value + 'px';
};

/**
 * Similar to jQuery.height().
 *
 * @param {Object} value - The value we want to assign or undefined if we want to get the value.
 * @return {number} - return element height.
 */
_cm.prototype.height = function (value) {
    var self = this,
        selfEl = self.el[0];

    if (!selfEl) return undefined;

    // Get element height
    if (typeof value === 'undefined') {
        // offsetHeight includes border height, clientHeight does not.
        return selfEl.clientHeight;
    }

    // Set element height
    selfEl.style.height = value + 'px';
};

/**
 * Similar to jQuery.append().
 *
 * @param {Object} object - probably element or text
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.append = function (object) {
    return this.insertAdjacent('beforeend', object);
};

/**
 * Similar to jQuery.remove().
 */
_cm.prototype.remove = function () {
    this.each(function (index, el) {
        remove(el);
    });
};

/**
 * Similar to jQuery.eq().
 *
 * @param {number} index - search index
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.eq = function (index) {
    return new _cm(this.el[index]);
};

/**
 * Convert a string to camelCase.
 *
 * @param {string} string The string we want to convert.
 * @return {string} - Returns the string formatted in camelCase.
 */
_cm.prototype.camelCase = function (string) {
    return string.replace(/-([a-z])/g, function (_all, letter) {
        return letter.toUpperCase();
    });
};

/**
 * Similar to jQuery.css().
 *
 * @param {string} name - The CSS property we're referencing.
 * @param {string|undefined} value - The value we want to assign or undefined if we want to get the value.
 * @return {Object|undefined} - returns element style value or undefined.
 */
_cm.prototype.css = function (name, value) {
    var self = this;

    // Get element style
    if (typeof value === 'undefined') {
        return getComputedStyle(self.el[0])[name];
    }

    // Set element style
    self.each(function (index, el) {
        el.style[self.camelCase(name)] = value;
    });
};

/**
 * Similar to jQuery.offset().
 *
 * @param {Object|undefined} object - object contain top and left or undefined if we want to get the value.
 * @return {Object|undefined} - returns element top and left or undefined.
 */
_cm.prototype.offset = function (object) {
    var self = this,
        selfEl = self.el[0];

    if (!selfEl) return undefined;

    // Get element offset
    if (typeof object === 'undefined') {
        var elRect = selfEl.getBoundingClientRect(),
            bodyEl = document.body;

        return {
            top: elRect.top + bodyEl.scrollTop,
            left: elRect.left + bodyEl.scrollLeft,
        };
    }

    // Set element offset
    selfEl.style.position = 'relative';
    selfEl.style.top = object.top / 3.4 + 'px';
    selfEl.style.left = object.left / 6.12 + 'px';
};

/**
 * Similar to jQuery.attr().
 *
 * @param {string} name - attribute name.
 * @param {string} value - The value we want to assign or undefined if we want to get the value.
 * @return {Object|undefined} - returns element attribute value or undefined.
 */
_cm.prototype.attr = function (name, value) {
    var self = this;

    // Get element attribute
    if (typeof value === 'undefined') {
        return self.el[0].getAttribute(name);
    }

    // Set element attribute
    self.each(function (index, el) {
        el.setAttribute(name, value);
    });
};

/**
 * Similar to jQuery.prop().
 *
 * @param {string} name - property name.
 * @param {string} value - The value we want to assign or undefined if we want to get the value.
 * @return {Object|undefined} - returns element property value or undefined.
 */
_cm.prototype.prop = function (name, value) {
    var self = this;

    // Get element property
    if (typeof value === 'undefined') {
        return self.el[0][name];
    }

    // Set element property
    self.each(function (index, el) {
        el[name] = value;
    });
};

//#region Events

/**
 * Equivalent to jQuery's ready() function.
 *
 * @param {function} fn - The callback function.
 * @return {void}
 */
_cm.prototype.ready = function (fn) {
    if (typeof fn !== 'function') {
        return;
    }

    // In case the document is already rendered
    if (document.readyState !== 'loading') {
        fn();
        // Modern browsers
    } else if (typeof document.addEventListener === 'function') {
        addEvent(document, 'DOMContentLoaded', fn);
        // IE <= 8
    } else {
        addEvent(document, 'readystatechange', function () {
            if (document.readyState === 'complete') {
                fn();
            }
        });
    }
};

/**
 * Similar to jQuery.on().
 *
 * @param {string} event - The JS event we want to add a listener for.
 * @param {Function} listener - The function to add to the listener.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.on = function (event, listener) {
    var self = this;

    addEvent(self.el[0], event, listener);

    return self;
};

/**
 * Similar to jQuery.off().
 *
 * @param {string} event - The JS event we want to add a listener for.
 * @param {Function} listener - The function to add to the listener.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.off = function (event, listener) {
    var self = this;

    removeEvent(self.el[0], event, listener);

    return self;
};

/**
 * Similar to jQuery.keypress().
 *
 * @param {Function} listener - The function to add to the listener.
 * @return {Object} - returns the _cm object to allow chaining methods.
 */
_cm.prototype.keypress = function (listener) {
    var self = this;

    addEvent(self.el[0], 'keypress', listener);

    return self;
};

//#endregion
