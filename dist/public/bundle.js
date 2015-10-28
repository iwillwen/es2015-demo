(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
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

'use strict';

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
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],3:[function(require,module,exports){
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

'use strict';

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
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
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

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],4:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":2,"./encode":3}],5:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
/*!
 * MinDB (version 0.1.9) - Database on JavaScript
 * 
 * Will Wen Gunn(iwillwen) and other contributors
 * 
 * @license MIT-license
 * @copyright 2012-2015 iwillwen(willwengunn@gmail.com)
 */
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define(factory);
  else if(typeof exports === 'object')
    exports["min"] = factory();
  else
    root["min"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};

/******/  // The require function
/******/  function __webpack_require__(moduleId) {

/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;

/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      exports: {},
/******/      id: moduleId,
/******/      loaded: false
/******/    };

/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/    // Flag the module as loaded
/******/    module.loaded = true;

/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }


/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;

/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;

/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";

/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  __webpack_require__(1);
  module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var _eventsJs = __webpack_require__(3);

  var _mixJs = __webpack_require__(4);

  var _mixJs2 = _interopRequireDefault(_mixJs);

  var _hashJs = __webpack_require__(5);

  var _hashJs2 = _interopRequireDefault(_hashJs);

  var _listJs = __webpack_require__(6);

  var _listJs2 = _interopRequireDefault(_listJs);

  var _setJs = __webpack_require__(7);

  var _setJs2 = _interopRequireDefault(_setJs);

  var _zsetJs = __webpack_require__(8);

  var _zsetJs2 = _interopRequireDefault(_zsetJs);

  var _miseJs = __webpack_require__(9);

  var _miseJs2 = _interopRequireDefault(_miseJs);

  var _storesJs = __webpack_require__(10);

  var noop = _utilsJs2['default'].noop;

  var min = {};
  exports['default'] = min;

  _utilsJs2['default'].extend(min, _eventsJs.EventEmitter.prototype);
  min.EventEmitter = _eventsJs.EventEmitter;
  min.Promise = _eventsJs.Promise;

  min.memStore = _storesJs.memStore;
  min.localStore = _storesJs.localStore;

  min.store = new _storesJs.localStore();

  var _keys = min._keys = {};
  var _keysTimer = null;
  var _types = {
    0: 'mix',
    1: 'hash',
    2: 'list',
    3: 'set',
    4: 'zset' // Sorted Set
  };

  /**
   * Fork a new MinDB object
   * @return {Object} new min object
   */
  min.fork = function () {
    var rtn = {};

    var keys = Object.getOwnPropertyNames(this);

    for (var i = 0; i < keys.length; i++) {
      var prop = keys[i];
      if (this.hasOwnProperty(prop)) {
        rtn[prop] = this[prop];
      }
    }

    return rtn;
  };

  /*********
  ** Keys **
  *********/

  /**
   * Delete a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.del = function (key) {
    var _this = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _eventsJs.Promise(noop);

    promise.then(function () {
      _this.emit('del', key);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this.save.bind(_this), 1000);
    });

    // Store
    var store = this.store;

    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating

      var load = function load() {
        // Value processing
        store.remove($key, function (err) {
          if (err) {
            // Error!
            promise.reject(err);
            return callback(err);
          }

          delete _this._keys[key];

          // Done
          promise.resolve(key);
          callback(null, key);
        });
      };

      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      try {
        store.remove($key);

        delete this._keys[key];

        // Done
        promise.resolve(key);
        callback(null, key);
      } catch (err) {
        // Error!
        promise.reject(err);
        callback(err);
      }
    }

    return promise;
  };

  /**
   * Check a key is exists or not
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.exists = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _eventsJs.Promise();

    key = 'min-' + key;

    var handle = function handle(err, value) {
      if (err || !value) {
        promise.resolve(false);
        return callback(null, false);
      }

      promise.resolve(true);
      callback(null, true);
    };

    if (this.store.async) {
      this.store.get(key, handle);
    } else {
      var val = this.store.get(key);
      handle(null, val);
    }

    return promise;
  };

  /**
   * Rename a old key
   * @param  {String}   key      the old key
   * @param  {String}   newKey   the new key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.renamenx = function (key, newKey) {
    var _this2 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    // Promise object
    var promise = new _eventsJs.Promise(noop);

    promise.then(function (_) {
      _this2.emit('rename', key, newKey);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this2.save.bind(_this2), 5 * 1000);
    });

    try {
      // Error handle
      var reject = function reject(err) {
        promise.reject(err);
        callback(err);
      };

      var type = null;
      var value = null;

      this.exists(key).then(function (exists) {
        if (!exists) {
          var err = new Error('no such key');

          reject(err);
        } else {
          return _this2.get(key);
        }
      }).then(function (_value) {
        type = _this2._keys[key];
        value = _value;

        return _this2.del(key);
      }).then(function (_) {
        return _this2.set(newKey, value, callback);
      }).then(function (_) {
        _this2._keys[newKey] = type;
        promise.resolve('OK');
        callback(null, 'OK');
      }, reject);
    } catch (err) {
      reject(err);
    }

    return promise;
  };

  /**
   * Rename a old key when the old key is not equal to the new key
   * and the old key is exiest.
   * @param  {String}   key      the old key
   * @param  {String}   newKey   the new key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.rename = function (key, newKey) {
    var _this3 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    // Promise object
    var promise = new _eventsJs.Promise(noop);

    promise.then(function (_) {
      _this3.emit('rename', key, newKey);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this3.save.bind(_this3), 5 * 1000);
    });

    // Error handle
    var reject = function reject(err) {
      promise.reject(err);
      callback(err);
    };

    if (key == newKey) {
      // The origin key is equal to the new key
      reject(new Error('The key is equal to the new key.'));
    } else {
      this.renamenx.apply(this, arguments).then(promise.resolve.bind(promise), promise.reject.bind(promise));
    }
    return promise;
  };

  /**
   * Return the keys which match by the pattern
   * @param  {String}   pattern  Pattern
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.keys = function (pattern) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise object
    var promise = new _eventsJs.Promise();

    // Stored keys
    var keys = Object.keys(this._keys);

    // Filter
    var filter = pattern.replace('?', '(.)').replace('*', '(.*)');
    filter = new RegExp(filter);

    var ret = [];

    for (var i = 0; i < keys.length; i++) {
      if (keys[i].match(filter)) {
        ret.push(keys[i]);
      }
    }

    // Done
    promise.resolve(ret);
    callback(null, ret);

    return promise;
  };

  /**
   * Return a key randomly
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.randomkey = function () {
    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    // Promise Object
    var promise = new _eventsJs.Promise(noop);

    // Stored keys
    var keys = Object.keys(this._keys);

    // Random Key
    var index = Math.round(Math.random() * (keys.length - 1));

    // Done
    var $key = keys[index];
    promise.resolve($key);
    callback(null, $key);

    return promise;
  };

  /**
   * Return the value's type of the key
   * @param  {String}   key      the key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.type = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _eventsJs.Promise(noop);

    if (this._keys.hasOwnProperty(key)) {
      promise.resolve(_types[this._keys[key]]);
      callback(null, callback);
    } else {
      promise.resolve(null);
      callback(null, null);
    }

    return promise;
  };

  /**
   * Remove all keys in the db
   * @param  {Function} callback Callback
   * @return {Object}            min
   */
  min.empty = function () {
    var _this4 = this;

    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    var promise = new _eventsJs.Promise();
    var self = this;
    var keys = Object.keys(this._keys);
    var removeds = 0;

    promise.then(function (len) {
      _this4.emit('empty', len);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this4.save.bind(_this4), 5 * 1000);
    });

    function loop(key) {
      if (key) {
        self.del(key, function (err) {
          if (!err) {
            removeds++;
          }

          loop(keys.shift());
        });
      } else {
        promise.resolve(removeds);
        callback(null, removeds);
      }
    }

    loop(keys.shift());

    return promise;
  };

  /**
   * Save the dataset to the Store Interface manually
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.save = function () {
    var _this5 = this;

    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    var promise = new _eventsJs.Promise();

    promise.then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var dump = _ref2[0];
      var strResult = _ref2[1];

      _this5.emit('save', dump, strResult);
    });

    this.set('min_keys', JSON.stringify(this._keys)).then(function (_) {
      return _this5.dump();
    }).then(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 2);

      var dump = _ref32[0];
      var strResult = _ref32[1];

      promise.resolve([dump, strResult]);
      callback(dump, strResult);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Return the dataset of MinDB
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.dump = function () {
    var _this6 = this;

    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    var loop = null;
    var promise = new _eventsJs.Promise();

    var rtn = {};

    this.keys('*', function (err, keys) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      (loop = function (key) {
        if (key) {
          _this6.get(key).then(function (value) {
            rtn[key] = value;
            loop(keys.shift());
          }, function (err) {
            promise.reject(err);
            callback(err);
          });
        } else {
          var strResult = JSON.stringify(rtn);
          promise.resolve([rtn, strResult]);
          callback(null, rtn, strResult);
        }
      })(keys.shift());
    });

    return promise;
  };

  /**
   * Restore the dataset to MinDB
   * @param  {Object}   dump     dump object
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.restore = function (dump) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();
    var self = this;

    promise.then(function (_) {
      _this7.save(function (_) {
        _this7.emit('restore');
      });
    });

    var keys = Object.keys(dump);

    var done = function done(_) {
      _this7.exists('min_keys').then(function (exists) {
        if (exists) {
          return _this7.get('min_keys');
        } else {
          promise.resolve();
          callback();
        }
      }).then(function (keys) {
        _keys = JSON.parse(keys);

        promise.resolve();
        callback();
      })['catch'](function (err) {
        promise.rejeect(err);
        callback(err);
      });
    };

    function loop(key) {
      if (key) {
        self.set(key, dump[key]).then(function (_) {
          loop(keys.shift());
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        done();
      }
    }

    loop(keys.shift());

    return promise;
  };

  var watchers = {};

  /**
   * Watch the command actions of the key
   * @param  {String}   key      key to watch
   * @param  {String}   command  command to watch
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.watch = function (key, command, callback) {
    var _this8 = this;

    if ('undefined' === typeof callback && command.apply) {
      callback = command;
      command = 'set';
    }

    var watcherId = Math.random().toString(32).substr(2);

    if (!watchers[key]) watchers[key] = {};

    watchers[key][watcherId] = function (_key) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (_key !== key) return;
      callback.call.apply(callback, [_this8].concat(args));
    };

    watchers[key][watcherId].command = command;

    this.on(command, watchers[key][watcherId]);

    return watcherId;
  };

  /**
   * Unbind the watcher
   * @param  {String} key       key to unwatch
   * @param  {String} watcherId watcher's id
   * @param  {String} command   command
   */
  min.unwatch = function (key, command, watcherId) {
    if ('undefined' === typeof watcherId && !!command) {
      watcherId = command;
      command = 'set';
    }

    this.removeListener(command, watchers[key][watcherId]);
  };

  /**
   * Unbind all the watcher of the key
   * @param  {String} key key to unwatch
   */
  min.unwatchForKey = function (key) {
    var watchersList = watchers[key];

    for (var id in watchersList) {
      var watcher = watchersList[id];
      this.removeListener(watcher.command, watcher);
    }
  };

  // Methods
  _utilsJs2['default'].extend(min, _hashJs2['default']);
  _utilsJs2['default'].extend(min, _listJs2['default']);
  _utilsJs2['default'].extend(min, _setJs2['default']);
  _utilsJs2['default'].extend(min, _zsetJs2['default']);
  _utilsJs2['default'].extend(min, _miseJs2['default']);
  _utilsJs2['default'].extend(min, _mixJs2['default']);

  // Apply
  var handle = function handle(err, value) {
    if (err || !value) {
      min._keys = {};
      return;
    }

    try {
      min._keys = JSON.parse(keys);
    } catch (err) {
      min._keys = {};
    }
  };
  if (min.store.async) {
    min.store.get('min-min_keys', handle);
  } else {
    try {
      var val = min.store.get('min-min_keys');
      handle(null, val);
    } catch (err) {
      handle(err);
    }
  }
  module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

  // Utils
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports['default'] = {
    noop: function noop() {
      return false;
    },
    // Class Inherits
    inherits: function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    },
    // Object Extend
    extend: function extend(target) {
      for (var _len = arguments.length, objs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        objs[_key - 1] = arguments[_key];
      }

      for (var i = 0, l = objs.length; i < l; i++) {
        var keys = Object.getOwnPropertyNames(objs[i] || {});

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            target[key] = objs[i][key];
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      return target;
    },
    isNumber: function isNumber(obj) {
      return toString.call(obj) == '[object Number]';
    },
    isUndefined: function isUndefined(val) {
      return val === void 0;
    },
    isObject: function isObject(obj) {
      return obj === Object(obj);
    },
    arrayUnique: function arrayUnique(array) {
      var u = {};
      var ret = [];
      for (var i = 0, l = array.length; i < l; ++i) {
        if (u.hasOwnProperty(array[i]) && !utils.isObject(array[i])) {
          continue;
        }
        ret.push(array[i]);
        u[array[i]] = 1;
      }
      return ret;
    },
    arrayInter: function arrayInter(array) {
      for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        rest[_key2 - 1] = arguments[_key2];
      }

      return utils.arrayUnique(array).filter(function (item) {
        var ret = true;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = rest[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var other = _step2.value;

            if (other.indexOf(item) < 0) {
              ret = false;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return ret;
      });
    },
    arrayDiff: function arrayDiff(array) {
      for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        rest[_key3 - 1] = arguments[_key3];
      }

      return array.filter(function (item) {
        var ret = true;

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = rest[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var other = _step3.value;

            if (other.indexOf(item) >= 0) {
              ret = false;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
              _iterator3['return']();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return ret;
      });
    },

    flatten: (function (_flatten) {
      function flatten(_x, _x2, _x3, _x4) {
        return _flatten.apply(this, arguments);
      }

      flatten.toString = function () {
        return _flatten.toString();
      };

      return flatten;
    })(function (input, shallow, strict, startIndex) {
      var output = [],
          idx = 0;
      for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
        var value = input[i];
        if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
          //flatten current level of array or arguments object
          if (!shallow) value = flatten(value, shallow, strict);
          var j = 0,
              len = value.length;
          output.length += len;
          while (j < len) {
            output[idx++] = value[j++];
          }
        } else if (!strict) {
          output[idx++] = value;
        }
      }
      return output;
    })
  };
  module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

  /* WEBPACK VAR INJECTION */(function(global) {'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.Promise = Promise;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var noop = _utilsJs2['default'].noop;

  var defaultMaxListeners = 10;

  var EventEmitter = (function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      this._events = this._events || {};
      this._maxListeners = this._maxListeners || defaultMaxListeners;
    }

    _createClass(EventEmitter, [{
      key: 'setMaxListeners',
      value: function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0) throw TypeError('n must be a positive number');
        this._maxListeners = n;
      }
    }, {
      key: 'emit',
      value: function emit(type) {
        var er, handler, len, args, i, listeners;

        if (!this._events) this._events = {};

        // If there is no 'error' event listener then throw.
        if (type === 'error') {
          if (!this._events.error || typeof this._events.error === 'object' && !this._events.error.length) {
            er = arguments[1];
            if (this.domain) {
              if (!er) er = new TypeError('Uncaught, unspecified "error" event.');
            } else if (er instanceof Error) {
              throw er; // Unhandled 'error' event
            } else {
              throw TypeError('Uncaught, unspecified "error" event.');
            }
            return false;
          }
        }

        handler = this._events[type];

        if (typeof handler === 'undefined') return false;

        if (typeof handler === 'function') {
          switch (arguments.length) {
            // fast cases
            case 1:
              handler.call(this);
              break;
            case 2:
              handler.call(this, arguments[1]);
              break;
            case 3:
              handler.call(this, arguments[1], arguments[2]);
              break;
            // slower
            default:
              len = arguments.length;
              args = new Array(len - 1);
              for (i = 1; i < len; i++) args[i - 1] = arguments[i];
              handler.apply(this, args);
          }
        } else if (typeof handler === 'object') {
          len = arguments.length;
          args = new Array(len - 1);
          for (i = 1; i < len; i++) args[i - 1] = arguments[i];

          listeners = handler.slice();
          len = listeners.length;
          for (i = 0; i < len; i++) listeners[i].apply(this, args);
        }

        return true;
      }
    }, {
      key: 'addListener',
      value: function addListener(type, listener) {
        var m;

        if (typeof listener !== 'function') throw TypeError('listener must be a function');

        if (!this._events) this._events = {};

        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (this._events.newListener) this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener);

        if (!this._events[type])
          // Optimize the case of one listener. Don't need the extra array object.
          this._events[type] = listener;else if (typeof this._events[type] === 'object')
          // If we've already got an array, just append.
          this._events[type].push(listener);else
          // Adding the second element, need to change to array.
          this._events[type] = [this._events[type], listener];

        // Check for listener leak
        if (typeof this._events[type] === 'object' && !this._events[type].warned) {
          m = this._maxListeners;
          if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
            console.trace();
          }
        }

        return this;
      }
    }, {
      key: 'once',
      value: function once(type, listener) {
        if (typeof listener !== 'function') throw TypeError('listener must be a function');

        function g() {
          this.removeListener(type, g);
          listener.apply(this, arguments);
        }

        g.listener = listener;
        this.on(type, g);

        return this;
      }
    }, {
      key: 'removeListener',
      value: function removeListener(type, listener) {
        var list, position, length, i;

        if (typeof listener !== 'function') throw TypeError('listener must be a function');

        if (!this._events || !this._events[type]) return this;

        list = this._events[type];
        length = list.length;
        position = -1;

        if (list === listener || typeof list.listener === 'function' && list.listener === listener) {
          this._events[type] = undefined;
          if (this._events.removeListener) this.emit('removeListener', type, listener);
        } else if (typeof list === 'object') {
          for (i = length; i-- > 0;) {
            if (list[i] === listener || list[i].listener && list[i].listener === listener) {
              position = i;
              break;
            }
          }

          if (position < 0) return this;

          if (list.length === 1) {
            list.length = 0;
            this._events[type] = undefined;
          } else {
            list.splice(position, 1);
          }

          if (this._events.removeListener) this.emit('removeListener', type, listener);
        }

        return this;
      }
    }, {
      key: 'removeAllListeners',
      value: function removeAllListeners(type) {
        var key, listeners;

        if (!this._events) return this;

        // not listening for removeListener, no need to emit
        if (!this._events.removeListener) {
          if (arguments.length === 0) this._events = {};else if (this._events[type]) this._events[type] = undefined;
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(this._events);

          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = {};
          return this;
        }

        listeners = this._events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else {
          // LIFO order
          while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
        }
        this._events[type] = undefined;

        return this;
      }
    }, {
      key: 'listeners',
      value: function listeners(type) {
        var ret;
        if (!this._events || !this._events[type]) ret = [];else if (typeof this._events[type] === 'function') ret = [this._events[type]];else ret = this._events[type].slice();
        return ret;
      }
    }]);

    return EventEmitter;
  })();

  exports.EventEmitter = EventEmitter;

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.listenerCount = function (emitter, type) {
    var ret;
    if (!emitter._events || !emitter._events[type]) ret = 0;else if (typeof emitter._events[type] === 'function') ret = 1;else ret = emitter._events[type].length;
    return ret;
  };
  EventEmitter.inherits = function (ctor) {
    _utilsJs2['default'].inherits(ctor, EventEmitter);
  };

  var _Promise = (function () {
    function _Promise() {
      var resolver = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

      _classCallCheck(this, _Promise);

      this._settled = false;
      this._success = false;
      this._args = [];
      this._callbacks = [];
      this._onReject = noop;

      resolver(this.resolve.bind(this), this.reject.bind(this));
    }

    _createClass(_Promise, [{
      key: 'then',
      value: function then(onResolve) {
        var _this = this;

        var onReject = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        var promise = new _Promise();

        this._onReject = onReject;
        this._callbacks.push(function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var ret = onResolve.apply(_this, args);

          if (ret && typeof ret.then == 'function') {
            ret.then(promise.resolve.bind(promise), promise.reject.bind(promise));
          }
        });

        if (this._settled) {
          if (this._success) {
            this.resolve.apply(this, this._args);
          } else {
            this.onReject.apply(this, this._args);
          }
        }

        return promise;
      }
    }, {
      key: 'catch',
      value: function _catch(onReject) {
        this._onReject = onReject;

        return this;
      }
    }, {
      key: 'resolve',
      value: function resolve() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        try {
          for (var _iterator = this._callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var handler = _step.value;

            handler.apply(this, args);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this._args = args;
        this._settled = true;
        this._success = true;
      }
    }, {
      key: 'reject',
      value: function reject() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        this._onReject.apply(this, args);

        this._args = args;
        this._settled = true;
      }
    }]);

    return _Promise;
  })();

  var nativePromise = (global || window).Promise || null;

  function Promise(resolver) {
    var promise = null;
    var resolve = noop;
    var reject = noop;
    resolver = resolver || noop;

    if (nativePromise) {
      promise = new nativePromise(function (_1, _2) {
        resolve = _1;
        reject = _2;

        resolver(_1, _2);
      });
      promise.resolve = function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        resolve.apply(promise, args);
      };
      promise.reject = function () {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        reject.apply(promise, args);
      };
    } else {
      promise = new _Promise(resolver);
    }

    return promise;
  }
  /* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var _eventsJs = __webpack_require__(3);

  var noop = _utilsJs2['default'].noop;

  var min = {};
  exports['default'] = min;

  var _keysTimer = null;

  /******************************
  ** Mix(String/Number/Object) **
  ******************************/

  /**
   * Set the value of a key
   * @param  {String}   key      Key
   * @param  {Mix}      value    Value
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.set = function (key, value, callback) {
    var _this = this;

    // Promise Object
    var promise = new _eventsJs.Promise();

    promise.then(function (_) {
      _this.emit('set', key, value);

      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this.save.bind(_this), 1000);
    });

    // Store
    var store = this.store;

    // Callback and Promise's shim
    callback = callback || _utilsJs2['default'].noop;

    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating
      var load = function load(_) {
        // Value processing
        var $value = JSON.stringify(value);
        store.set($key, $value, function (err) {
          if (err) {
            // Error!
            promise.reject(err);
            return callback(err);
          }

          _this._keys[key] = 0;

          // Done
          promise.resolve(key);
          callback(null, key, value);
        });
      };
      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      // Value processing
      var $value = JSON.stringify(value);
      store.set($key, $value);
      this._keys[key] = 0;

      // Done
      promise.resolve(key);
      callback(null, key, value);
    }

    return promise;
  };

  /**
   * Set the value of a key, only if the key does not exist
   * @param  {String}   key      the key
   * @param  {Mix}      value    Value
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.setnx = function (key, value) {
    var _this2 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    // Promise Object
    var promise = new _eventsJs.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        callback(err);
        promise.reject(err);
      }

      if (exists) {
        // The key is exists
        return promise.reject(new Error('The key is exists.'));
      } else {
        _this2.set(key, value, callback).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var key = _ref2[0];
          var value = _ref2[1];

          // Done
          callback(null, key, value);
          promise.resolve([key, value]);
        }, function (err) {
          callback(err);
          promise.reject(err);
        });
      }
    });

    return promise;
  };

  /**
   * Set the value and expiration of a key
   * @param  {String}   key      key
   * @param  {Number}   seconds  TTL
   * @param  {Mix}      value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.setex = function (key, seconds, value) {
    var _this3 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    // Promise Object
    var promise = new _eventsJs.Promise();

    // TTL
    var timeout = function timeout(_) {
      _this3.del(key, noop);
    };

    // Set
    this.set(key, value, function (err, result) {
      // Done
      setTimeout(timeout, seconds * 1000);
      callback(err, result);
    }).then(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 2);

      var key = _ref32[0];
      var value = _ref32[1];

      // Done
      setTimeout(timeout, seconds * 1000);
      promise.resolve([key, value]);
      callback(null, key, value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Set the value and expiration in milliseconds of a key
   * @param  {String}   key      key
   * @param  {Number}   millionseconds  TTL
   * @param  {Mix}      value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.psetex = function (key, milliseconds, value) {
    var _this4 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    // Promise Object
    var promise = new _eventsJs.Promise();

    // TTL
    var timeout = function timeout(_) {
      _this4.del(key, _utilsJs2['default'].noop);
    };

    // Set
    this.set(key, value, function (err, result) {
      // Done
      setTimeout(timeout, milliseconds);
      callback(err, result);
    }).then(function (_ref4) {
      var _ref42 = _slicedToArray(_ref4, 2);

      var key = _ref42[0];
      var value = _ref42[1];

      // Done
      setTimeout(timeout, milliseconds);
      promise.resolve([key, value]);
      callback(null, key, value);
    }, promise.reject.bind(promise));

    return promise;
  };

  /**
   * Set multiple keys to multiple values
   * @param  {Object}   plainObject      Object to set
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.mset = function (plainObject) {
    var _this5 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    // keys
    var keys = Object.keys(plainObject);
    // counter
    var i = 0;

    // the results and errors to return
    var results = [];
    var errors = [];

    // Loop
    var next = function next(key, index) {
      // remove the current element of the plainObject
      delete keys[index];

      _this5.set(key, plainObject[key]).then(function (_ref5) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var key = _ref52[0];
        var value = _ref52[1];

        results.push([key, value]);

        i++;
        if (keys[i]) {
          next(keys[i], i);
        } else {
          out();
        }
      }, function (err) {
        errors.push(err);

        i++;
        if (keys[i]) {
          return next(keys[i], i);
        } else {
          return out();
        }
      });
    };

    function out() {
      if (errors.length > 0) {
        callback(errors);
        promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Set multiple keys to multiple values, only if none of the keys exist
   * @param  {Object}   plainObject      Object to set
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.msetnx = function (plainObject) {
    var _this6 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();
    var keys = Object.keys(plainObject);
    var i = 0;

    var results = [];
    var errors = [];

    var next = function next(key, index) {
      delete keys[index];

      _this6.setnx(key, plainObject[key]).then(function (_ref6) {
        var _ref62 = _slicedToArray(_ref6, 2);

        var key = _ref62[0];
        var value = _ref62[1];

        results.push([key, value]);

        i++;
        if (keys[i]) {
          next(keys[i], i);
        } else {
          out();
        }
      }, function (err) {
        errors.push(err);
        out();
      });
    };

    function out() {
      if (errors.length) {
        callback(errors);
        return promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Append a value to a key
   * @param  {String}   key      key
   * @param  {String}   value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.append = function (key, value) {
    var _this7 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this7.get(key);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve('');

        return p;
      }
    }).then(function (currVal) {
      return _this7.set(key, currVal + value);
    }).then(function (_) {
      return _this7.strlen(key);
    }).then(function (len) {
      promise.resolve(len);
      callback(null, len);
    })['catch'](function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the value of a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.get = function (key) {
    var _this8 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _eventsJs.Promise();

    promise.then(function (value) {
      return _this8.emit('get', key, value);
    });

    // Store
    var store = this.store;

    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating
      var load = function load(_) {
        // Value processing
        store.get($key, function (err, value) {
          if (err) {
            var _err = new Error('no such key');
            // Error!
            promise.reject(_err);
            return callback(_err);
          }

          if (value) {
            // Done
            try {
              var ret = JSON.parse(value);
              promise.resolve(ret);
              callback(null, ret);
            } catch (err) {
              promise.reject(err);
              callback(err);
            }
          } else {
            var err = new Error('no such key');

            promise.reject(err);
            callback(err);
          }
        });
      };
      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      try {
        // Value processing
        var _value = this.store.get($key);

        if (_value) {
          try {
            var value = JSON.parse(_value);
            // Done
            promise.resolve(value);
            callback(null, value);
          } catch (err) {
            promise.reject(err);
            callback(err);
          }
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      } catch (err) {
        // Error!
        promise.reject(err);
        callback(err);
      }
    }

    return promise;
  };

  min.getrange = function (key, start, end) {
    var _this9 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    promise.then(function (value) {
      return _this9.emit('getrange', key, start, end, value);
    });

    var len = end - start + 1;

    this.get(key).then(function (value) {
      var val = value.substr(start, len);

      promise.resolve(val);
      callback(null, val);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the values of a set of keys
   * @param  {Array}   keys      the keys
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.mget = function (keys) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _eventsJs.Promise();

    var i = 0;
    var results = [];
    var errors = [];

    var multi = this.multi();

    for (var i = 0; i < keys.length; i++) {
      multi.get(keys[i]);
    }

    multi.exec(function (err, results) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      var rtn = results.map(function (row) {
        return row[0];
      });
      callback(err);
      promise.resolve(rtn);
    });

    return promise;
  };

  /**
   * Set the value of a key and return its old value
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.getset = function (key, value) {
    var _this10 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (old) {
      return _this10.emit('getset', key, value, old);
    });

    var _value = null;

    this.get(key).then(function ($value) {
      _value = $value;

      return _this10.set(key, value);
    }).then(function (_) {
      promise.resolve(_value);
      callback(null, _value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the length of a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.strlen = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    this.get(key).then(function (value) {
      if ('string' === typeof value) {
        var len = value.length;

        promise.resolve(len);
        callback(null, len);
      } else {
        var err = new TypeError();

        promise.reject(err);
        callback(err);
      }
    })['catch'](function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Increment the integer value of a key by one
   * @param  {String}   key      key
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.incr = function (key) {
    var _this11 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    promise.then(function (value) {
      return _this11.emit('incr', key, value);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this11.get(key);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseInt(curr);

      return _this11.set(key, ++curr);
    }).then(function (_ref7) {
      var _ref72 = _slicedToArray(_ref7, 2);

      var key = _ref72[0];
      var value = _ref72[1];

      promise.resolve(value);
      callback(null, value, key);
    })['catch'](function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Increment the integer value of a key by the given amount
   * @param  {String}   key      key
   * @param  {Number}   increment increment
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.incrby = function (key, increment) {
    var _this12 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (value) {
      return _this12.emit('incrby', key, increment, value);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this12.get(key);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseFloat(curr);

      return _this12.set(key, curr + increment);
    }).then(function (key, value) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.incrbyfloat = min.incrby;

  min.decr = function (key) {
    var _this13 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    promise.then(function (curr) {
      return _this13.emit('decr', key, curr);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this13.get(key);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseInt(curr);

      return _this13.set(key, --curr);
    }).then(function (_ref8) {
      var _ref82 = _slicedToArray(_ref8, 2);

      var key = _ref82[0];
      var value = _ref82[1];

      promise.resolve(value);
      callback(null, value, key);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.decrby = function (key, decrement) {
    var _this14 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();
    promise.then(function (curr) {
      return _this14.emit('decrby', key, decrement, curr);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this14.get(key);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseInt(curr);

      return _this14.set(key, curr - decrement);
    }).then(function (key, value) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };
  module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var _eventsJs = __webpack_require__(3);

  var noop = _utilsJs2['default'].noop;

  var min = {};
  exports['default'] = min;

  /**
   * Set the field in the hash on the key with the value
   * @param  {String}   key      Hash key
   * @param  {String}   field    field to set
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.hset = function (key, field, value) {
    var _this = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    // check the key status
    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        // fetch the value
        _this.get(key, function (err, body) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          // update the hash
          body[field] = value;

          _this.set(key, body, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            promise.resolve([key, field, value]);
            callback(null, key, field, value);
          });
        });
      } else {
        // create a hash
        var body = {};

        body[field] = value;

        _this.set(key, body, function (err) {
          if (err) {
            reject(err);
            return callback(err);
          }

          _this._keys[key] = 1;

          promise.resolve([key, field, value]);
          callback(null, key, field, value);
        });
      }
    });
    promise.then(function (_) {
      _this.emit('hset', key, field, value);
    });

    return promise;
  };

  /**
   * Set the value of a hash field, only if the field does not exist
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}            promise
   */
  min.hsetnx = function (key, field, value) {
    var _this2 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    this.hexists(key, field, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (!exists) {
        _this2.hset(key, field, value).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 3);

          var key = _ref2[0];
          var field = _ref2[1];
          var value = _ref2[2];

          promise.resolve([key, field, value]);
          callback(null, key, field, value);
        });
      } else {
        var err = new Error('The field of the hash is exists');

        promise.reject(err);
        return callback(err);
      }
    });

    return promise;
  };

  /**
   * Set multiple hash fields to multiple values
   * @param  {String}   key      key
   * @param  {Object}   docs     values
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hmset = function (key, docs) {
    var _this3 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    var keys = Object.keys(docs);

    var i = 0;

    var results = [];
    var errors = [];

    var next = function next(field, index) {
      delete keys[index];

      _this3.hset(key, field, docs[field]).then(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 3);

        var key = _ref32[0];
        var field = _ref32[1];
        var value = _ref32[2];

        results.push([key, field, value]);

        i++;
        if (keys[i]) {
          next(keys[i], i);
        } else {
          out();
        }
      }, function (err) {
        errors.push(err);

        i++;
        if (keys[i]) {
          return next(keys[i], i);
        } else {
          return out();
        }
      });
    };

    function out() {
      if (errors.length > 0) {
        callback(errors);
        promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Get the value of a hash field
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hget = function (key, field) {
    var _this4 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    this.hexists(key, field, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this4.get(key).then(function (value) {
          var data = value[field];
          promise.resolve(data);
          callback(null, data);
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        var err = new Error('no such field');

        promise.reject(err);
        callback(err);
      }
    });

    return promise;
  };

  /**
   * Get the values of all the given hash fields
   * @param  {String}   key      key
   * @param  {Array}   fields    hash fields
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hmget = function (key, fields) {
    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    var values = [];

    var multi = this.multi();

    fields.forEach(function (field) {
      multi.hget(key, field);
    });

    multi.exec(function (err, replies) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      values = replies.map(function (row) {
        return row[0];
      });

      promise.resolve(values);
      callback(null, values);
    });

    return promise;
  };

  /**
   * Get all the fields and values in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hgetall = function (key) {
    var _this5 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      if (exists) {
        _this5.get(key).then(function (data) {
          promise.resolve(data);
          callback(null, data);
        })['catch'](function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        var err = new Error('no such key');

        callback(err);
        return promise.reject(err);
      }
    });

    return promise;
  };

  /**
   * Delete one hash field
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hdel = function (key, field) {
    var _this6 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (_ref4) {
      var _ref42 = _slicedToArray(_ref4, 3);

      var key = _ref42[0];
      var field = _ref42[1];
      var value = _ref42[2];

      _this6.emit('hdel', key, field, value);
    });

    this.hexists(key.field, function (err, exists) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      if (exists) {
        _this6.get(key).then(function (data) {
          var removed = data[field];
          delete data[field];

          _this6.set(key, data).then(function (_) {
            promise.resolve([key, field, removed]);
            callback(null, key, field, removed);
          }, function (err) {
            promise.reject(err);
            callback(err);
          });
        }, function (err) {
          callback(err);
        });
      } else {
        var err = new Error('no such key');

        callback(err);
        return promise.reject(err);
      }
    });

    return promise;
  };

  /**
   * Get the number of fields in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hlen = function (key) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this7.get(key).then(function (data) {
          var length = Object.keys(data).length;

          promise.resolve(length);
          callback(null, length);
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Get all the fields in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hkeys = function (key) {
    var _this8 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this8.get(key).then(function (data) {
          var keys = Object.keys(data);

          promise.resolve(keys);
          callback(null, keys);
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Determine if a hash field exists
   * @param  {String}   key      key of the hash
   * @param  {String}   field    the field
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.hexists = function (key, field) {
    var _this9 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this9.get(key);
      } else {
        promise.resolve(false);
        callback(null, false);
      }
    }).then(function (value) {
      if (value.hasOwnProperty(field)) {
        promise.resolve(true);
        callback(null, true);
      } else {
        promise.resolve(false);
        callback(null, false);
      }
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.hincr = function (key, field) {
    var _this10 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (curr) {
      _this10.emit('hincr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this10.hget(exists);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseFloat(curr);

      return _this10.hset(key, field, ++curr);
    }).then(function (key, field, value) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };

  min.hincrby = function (key, field, increment) {
    var _this11 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    promise.then(function (curr) {
      _this11.emit('hincr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this11.hget(exists);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseFloat(curr);

      return _this11.hset(key, field, curr + increment);
    }).then(function (key, field, value) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };

  min.hincrbyfloat = min.hincrby;

  min.hdecr = function (key, field) {
    var _this12 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (curr) {
      _this12.emit('hdecr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this12.hget(key, field);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseFloat(curr);

      return _this12.hset(key, field, --curr);
    }).then(function (key, field, value) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.hdecrby = function (key, field, decrement) {
    var _this13 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    promise.then(function (curr) {
      _this13.emit('hincr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this13.hget(exists);
      } else {
        var p = new _eventsJs.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseFloat(curr);

      return _this13.hset(key, field, curr - decrement);
    }).then(function (key, field, value) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };
  module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var _eventsJs = __webpack_require__(3);

  var noop = _utilsJs2['default'].noop;
  var min = {};
  exports['default'] = min;

  /******************************
  **           List            **
  ******************************/

  /**
   * Prepend one or multiple values to a list
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpush = function (key, value) {
    var _this = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (len) {
      return _this.emit('lpush', key, value, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          data.unshift(value);

          _this.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var data = [value];

        _this.set(key, data, function (err) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          _this._keys[key] = 2;

          promise.resolve(1);
          callback(null, 1);
        });
      }
    });

    return promise;
  };

  /**
   * Prepend a value to a list, only if the list exists
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpushx = function (key, value) {
    var _this2 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (len) {
      return _this2.emit('lpush', key, value, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this2.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data.length) {
            var err = new Error('The list is empty.');

            callback(err);
            return promise.reject(err);
          }

          data.unshift(value);

          _this2.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var err = new Error('no such key');

        callback(err);
        return promise.reject(err);
      }
    });

    return promise;
  };

  /**
   * Append one or multiple values to a list
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpush = function (key, value, callback) {
    var _this3 = this;

    var promise = new _eventsJs.Promise();

    promise.then(function (len) {
      return _this3.emit('rpush', key, value, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this3.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          data.push(value);

          _this3.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var data = [value];

        _this3.set(key, data, function (err) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          promise.resolve(1);
          callback(null, 1);
        });
      }
    });

    return promise;
  };

  /**
   * Prepend a value to a list, only if the list exists
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpushx = function (key, value) {
    var _this4 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    promise.then(function (len) {
      return _this4.emit('rpush', key, value, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this4.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data.length) {
            var err = new Error('The list is empty.');

            callback(err);
            return promise.reject(err);
          }

          data.push(value);

          _this4.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var err = new Error('no such key');

        callback(err);
        return promise.reject(err);
      }
    });

    return promise;
  };

  /**
   * Remove and get the first element in a list
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpop = function (key, callback) {
    var _this5 = this;

    var promise = new _eventsJs.Promise();
    var val = null;

    promise.then(function (value) {
      return _this5.emit('lpop', key, value);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this5.get(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (data) {
      val = data.shift();

      return _this5.set(key, data);
    }).then(function (_) {
      promise.resolve(val);
      callback(null, val);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Remove and get the last element in a list
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpop = function (key) {
    var _this6 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    promise.then(function (value) {
      return _this6.emit('rpop', key, value);
    });

    var value = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this6.get(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (data) {
      value = data.pop();

      return _this6.set(key, data);
    }).then(function (_) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the length of a list
   * @param  {String}   key      key
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.llen = function (key) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this7.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var length = data.length;

          promise.resolve(length);
          callback(null, length);
        });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Get a range of elements from a list
   * @param  {String}   key      key
   * @param  {Number}   start    min score
   * @param  {Number}   stop     max score
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lrange = function (key, start, stop) {
    var _this8 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this8.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var values = data.slice(start, stop + 1);

          promise.resolve(values);
          callback(null, values);
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Remove elements from a list
   * @param  {String}   key      key
   * @param  {Number}   count    count to remove
   * @param  {Mix}      value    value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lrem = function (key, count, value) {
    var _this9 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    promise.then(function (removeds) {
      return _this9.emit('lrem', key, count, value, removeds);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this9.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var removeds = 0;

          switch (true) {
            case count > 0:
              for (var i = 0; i < data.length && removeds < count; i++) {
                if (data[i] === value) {
                  data.splice(i, 1)[0];

                  removeds++;
                }
              }
              break;
            case count < 0:
              for (var i = data.length - 1; i >= 0 && removeds < count; i--) {
                if (data[i] === value) {
                  data.splice(i, 1)[0];

                  removeds++;
                }
              }
              break;
            case count = 0:
              for (var i = data.length - 1; i >= 0; i--) {
                if (data[i] === value) {
                  data.splice(i, 1)[0];

                  removeds++;
                }
              }
              break;
          }

          promise.resolve(removeds);
          callback(null, removeds);
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Remove elements from a list
   * @param  {String}   key      key
   * @param  {Number}   index    position to set
   * @param  {Mix}      value    value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lset = function (key, index, value) {
    var _this10 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    promise.then(function (len) {
      return _this10.emit('lset', key, index, value, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this10.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data[index] || !data.length) {
            var err = new Error('no such key');

            promise.reject(err);
            return callback(err);
          }

          data[index] = value;

          _this10.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        return callback(err);
      }
    });

    return promise;
  };

  /**
   * Trim a list to the specified range
   * @param  {String}   key      key
   * @param  {Number}   start    start
   * @param  {Number}   stop     stop
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.ltrim = function (key, start, stop) {
    var _this11 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    this.exists(key).then(function (exists) {
      if (!exists) {
        promise.resolve(null);
        return callback(null, null);
      }

      return _this11.get(key);
    }).then(function (data) {
      var values = data.splice(start, stop + 1);

      return _this11.set(key, values);
    }).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var key = _ref2[0];
      var values = _ref2[1];

      promise.resolve(values);
      callback(null, values, key);
    })['catch'](function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get an element from a list by its index
   * @param  {String}   key      key
   * @param  {Number}   index    index
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lindex = function (key, index) {
    var _this12 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();

    this.exists(key).then(function (exists) {
      if (!exists) {
        var err = new Error('no such key');

        promise.reject(err);
        return callback(err);
      }

      return _this12.get(key);
    }).then(function (data) {
      var value = data[index];

      promise.resolve(value);
      callback(null, value);
    })['catch'](function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Insert an element before another element in a list
   * @param  {String}   key      key
   * @param  {Mix}   pivot       pivot
   * @param  {Mix}   value       value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.linsertBefore = function (key, pivot, value, callback) {
    var _this13 = this;

    var promise = new _eventsJs.Promise();

    promise.then(function (len) {
      return _this13.emit('linsertBefore', key, pivot, value, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this13.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var index = data.indexOf(pivot);

          if (index < 0) {
            promise.resolve(null);
            return callback(null, null);
          }

          data.splice(index, 1, value, pivot);

          _this13.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Insert an element after another element in a list
   * @param  {String}   key      key
   * @param  {Mix}   pivot       pivot
   * @param  {Mix}   value       value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.linsertAfter = function (key, pivot, value) {
    var _this14 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise();

    promise.then(function (len) {
      return _this14.emit('linsertAfter', key, pivot, value, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this14.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var index = data.indexOf(pivot);

          if (index < 0) {
            promise.resolve(null);
            return callback(null, null);
          }

          data.splice(index, 0, value);

          _this14.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    });

    return promise;
  };

  /**
   * Remove the last element in a list, append it to another list and return it
   * @param  {String}   src      source
   * @param  {String}   dest     destination
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.rpoplpush = function (src, dest) {
    var _this15 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();
    var value = null;

    promise.then(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 2);

      var value = _ref32[0];
      var len = _ref32[1];
      return _this15.emit('rpoplpush', src, dest, value, len);
    });

    this.rpop(src).then(function (_) {
      return _this15.lpush(dest, value = _);
    }).then(function (length) {
      promise.resolve([value, length]);
      callback(null, value, length);
    }, function (err) {
      callback(err);
      promise.reject(err);
    });

    return promise;
  };

  /**
   * Remove the last element in a list, append it to another list and return it
   * @param  {String}   src      source
   * @param  {String}   dest     destination
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lpoprpush = function (src, dest) {
    var _this16 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise();
    var value = null;

    promise.then(function (value, len) {
      return _this16.emit('lpoprpush', src, dest, value, len);
    });

    this.lpop(src).then(function (_) {
      return _this16.rpush(dest, value = _);
    }).then(function (length) {
      promise.resolve(value, length);
      callback(null, value, length);
    }, function (err) {
      callback(err);
      promise.reject(err);
    });

    return promise;
  };
  module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var _eventsJs = __webpack_require__(3);

  var noop = _utilsJs2['default'].noop;

  var min = {};
  exports['default'] = min;

  /******************************
  **           Set             **
  ******************************/
  min.sadd = function (key) {
    var _this = this;

    for (var _len = arguments.length, members = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      members[_key - 1] = arguments[_key];
    }

    var promise = new _eventsJs.Promise(noop);

    promise.then(function (len) {
      return _this.emit('sadd', key, len);
    });

    var added = 0;

    if (!(members[members.length - 1] instanceof Function)) {
      var callback = noop;
    } else {
      var callback = members.splice(members.length - 1, 1)[0];
    }

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this.get(key);
      } else {
        var data = _utilsJs2['default'].arrayUnique(members);

        return _this.set(key, data);
      }
    }).then(function () {
      if (Array.isArray(arguments[0])) {
        var data = arguments[0];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = members[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var curr = _step.value;

            if (data.indexOf(curr) >= 0) {
              return;
            } else {
              data.push(curr);
              added++;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return _this.set(key, data);
      } else if (typeof arguments[0] === 'string') {
        added += members.length;

        _this._keys[key] = 3;

        promise.resolve(added);
        callback(null, added);
      }
    }).then(function (_) {
      _this._keys[key] = 3;

      promise.resolve(added);
      callback(null, added);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.srem = function (key) {
    var _this2 = this;

    for (var _len2 = arguments.length, members = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      members[_key2 - 1] = arguments[_key2];
    }

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;

    promise.then(function (len) {
      return _this2.emit('srem', key, members, len);
    });

    var removeds = 0;

    if (members[members.length - 1] instanceof Function) {
      callback = members.pop();
    }

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this2.get(key);
      } else {
        return new Error('no such key');
      }
    }).then(function (data) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = members[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var curr = _step2.value;

          var i = data.indexOf(curr);
          if (i >= 0) {
            data.splice(i, 1);
            removeds++;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return _this2.set(key, data);
    }).then(function (_) {

      _this2._keys[key] = 3;

      promise.resolve(removeds);
      callback(null, removeds);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.smembers = function (key) {
    var _this3 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this3.get(key);
      } else {
        return new Error('no such key');
      }
    }).then(function (members) {
      promise.resolve(members);
      callback(null, members);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sismember = function (key, value) {
    var _this4 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this4.get(key);
      } else {
        return new Error('no such key');
      }
    }).then(function (members) {
      var res = members.indexOf(value) >= 0 ? 1 : 0;

      promise.resolve(res);
      callback(null, res);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.scard = function (key) {
    var _this5 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this5.get(key);
      } else {
        return new Error('no such key');
      }
    }).then(function (data) {
      var length = data.length;

      promise.resolve(length);
      callback(null, length);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.smove = function (src, dest, member) {
    var _this6 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise(noop);

    promise.then(function (ok) {
      return _this6.emit('smove', src, dest, member, ok);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this6.sismember(src, member);
      } else {
        return new Error('no such key');
      }
    }).then(function (isMember) {
      if (isMember) {
        return _this6.srem(src, member);
      } else {
        return new Error('no such member');
      }
    }).then(function (_) {
      return _this6.sismember(dest, member);
    }).then(function (isMember) {
      if (!isMember) {
        return _this6.sadd(dest, member);
      } else {

        _this6._keys[key] = 3;

        promise.resolve(0);
        callback(null, 0);
      }
    }).then(function (_) {
      _this6._keys[key] = 3;
      promise.resolve(1);
      callback(null, 1);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.srandmember = function (key) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this7.get(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (members) {
      var index = Math.floor(Math.random() * members.length) || 0;

      var member = members[index];

      promise.resolve(member);
      callback(null, member);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.spop = function (key) {
    var _this8 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise(noop);

    promise.then(function (value) {
      return _this8.emit('spop', key, value);
    });

    var member = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this8.srandmember(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (_member) {
      member = _member;

      return _this8.srem(key, member);
    }).then(function (_) {
      promise.resolve(member);
      callback(null, member);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sunion = function () {
    var _this9 = this;

    for (var _len3 = arguments.length, keys = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      keys[_key3] = arguments[_key3];
    }

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;
    var loop = null;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var members = [](loop = function (index) {
      var curr = keys[index];

      if (curr) {
        _this9.exists(curr).then(function (exists) {
          if (exists) {
            return _this9.get(curr);
          } else {
            loop(++index);
          }
        }).then(function (data) {
          if (Array.isArray(data)) {
            members = members.concat(data);
          }

          loop(++index);
        }, function (err) {
          promise.reject(err);
          return callback(err);
        });
      } else {
        members = _utilsJs2['default'].arrayUnique(members);
        promise.resolve(members);
        callback(null, members);
      }
    })(0);

    return promise;
  };

  min.sunionstore = function (dest) {
    var _this10 = this;

    for (var _len4 = arguments.length, keys = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      keys[_key4 - 1] = arguments[_key4];
    }

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;

    promise.then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var length = _ref2[0];
      var members = _ref2[1];
      return _this10.emit('sunionstore', dest, keys, length, members);
    });

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var members = null;

    this.sunion(keys).then(function (_members) {
      members = _members;

      return _this10.exists(dest);
    }).then(function (exists) {
      if (exists) {
        return _this10.del(dest);
      } else {
        return _this10.sadd(dest, members);
      }
    }).then(function (length) {
      if (typeof length == 'number') {
        promise.resolve([length, members]);
        callback(null, length, members);
      } else {
        return _this10.sadd(dest, members);
      }
    }).then(function (length) {
      promise.resolve(length, members);
      callback(null, length, members);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sinter = function () {
    var _this11 = this;

    for (var _len5 = arguments.length, keys = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      keys[_key5] = arguments[_key5];
    }

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;
    var loop = null;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var memberRows = [](loop = function (index) {
      var curr = keys[index];

      if (curr) {
        _this11.exists(curr).then(function (exists) {
          if (exists) {
            return _this11.get(curr);
          } else {
            loop(++index);
          }
        }).then(function (data) {
          if (Array.isArray(data)) {
            memberRows.push(data);
          }

          loop(++index);
        }, function (err) {
          promise.reject(err);
          return callback(err);
        });
      } else {
        var members = _utilsJs2['default'].arrayInter.apply(_utilsJs2['default'], memberRows);

        promise.resolve(members);
        callback(null, members);
      }
    })(0);

    return promise;
  };

  min.sinterstore = function (dest) {
    var _this12 = this;

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;

    for (var _len6 = arguments.length, keys = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      keys[_key6 - 1] = arguments[_key6];
    }

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var members = null;

    this.sinter.apply(this, keys).then(function (_members) {
      members = _members;

      return _this12.exists(dest);
    }).then(function (exists) {
      if (exists) {
        return _this12.del(dest);
      } else {
        members.unshift(dest);
        return _this12.sadd.apply(_this12, members);
      }
    }).then(function (key) {
      if (typeof key == 'string') {
        promise.resolve(members.length, members);
        callback(null, members.length, members);
      } else {
        return _this12.sadd(dest, members);
      }
    }).then(function (_) {
      promise.resolve(members.length, members);
      callback(null, members.length, members);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sdiff = function () {
    var _this13 = this;

    for (var _len7 = arguments.length, keys = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      keys[_key7] = arguments[_key7];
    }

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;
    var loop = null;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var memberRows = [](loop = function (index) {
      var curr = keys[index];

      if (curr) {
        _this13.exists(curr).then(function (exists) {
          if (exists) {
            return _this13.get(curr);
          } else {
            loop(++index);
          }
        }).then(function (data) {
          if (Array.isArray(data)) {
            memberRows.push(data);
          }

          loop(++index);
        }, function (err) {
          promise.reject(err);
          return callback(err);
        });
      } else {
        var members = _utilsJs2['default'].arrayDiff.apply(_utilsJs2['default'], memberRows);

        promise.resolve(members);
        callback(null, members);
      }
    })(0);

    return promise;
  };

  min.sdiffstore = function (dest) {
    var _this14 = this;

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;

    for (var _len8 = arguments.length, keys = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
      keys[_key8 - 1] = arguments[_key8];
    }

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var members = null;

    this.sdiff(keys).then(function (_members) {
      members = _members;

      return _this14.exists(dest);
    }).then(function (exists) {
      if (exists) {
        return _this14.del(dest);
      } else {
        return _this14.sadd(dest, members);
      }
    }).then(function (length) {
      if (typeof length == 'number') {
        promise.resolve(length, members);
        callback(null, length, members);
      } else {
        return _this14.sadd(dest, members);
      }
    }).then(function (length) {
      promise.resolve(length, members);
      callback(null, length, members);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };
  module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var _eventsJs = __webpack_require__(3);

  var noop = _utilsJs2['default'].noop;

  var min = {};
  exports['default'] = min;

  /******************************
  **         Sorted Set        **
  ******************************/
  min.zadd = function (key, score, member) {
    var _this = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise(noop);

    promise.then(function (len) {
      return _this.emit('zadd', key, score, member, len);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this.get(key);
      } else {
        var score2HashsMap = {};
        score2HashsMap[score] = [0];

        return _this.set(key, {
          // members
          ms: [member],
          // mapping hash to score
          hsm: { 0: score },
          // mapping score to hash
          shm: score2HashsMap
        });
      }
    }).then(function (args) {
      var _key = args[0];

      if ('string' === typeof _key) {
        _this._keys[key] = 4;

        promise.resolve(1, 1);
        callback(null, 1, 1);
      } else if ('object' === typeof _key) {
        var data = _key;

        if (data.ms.indexOf(member) >= 0) {
          var len = data.ms.length;

          promise.resolve(0, len);
          return callback(null, 0, len);
        }

        // new hash
        var hash = data.ms.length;
        // append the new member
        data.ms.push(member);

        // mapping hash to score
        data.hsm[hash] = score;

        // mapping score to hash
        if (Array.isArray(data.shm[score])) {
          data.shm[score].push(hash);
        } else {
          data.shm[score] = [hash];
        }

        return _this.set(key, data);
      }
    }).then(function (key, data) {
      _this._keys[key] = 4;

      var len = data.ms.length;

      promise.resolve(1, len);
      callback(null, 1, len);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zcard = function (key) {
    var _this2 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this2.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var len = data.ms.filter(Boolean).length;

      promise.resolve(len);
      callback(null, len);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zcount = function (key, min, max) {
    var _this3 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise(noop);

    promise.then(function (len) {
      return _this3.emit('zcount', key, min, max, value, len);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this3.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hashs = Object.keys(data.shm).filter(function (score) {
        return min <= score && score <= max;
      }).map(function (score) {
        return data.shm[score];
      });

      var len = hashs.map(function (hash) {
        return hash.length;
      }).reduce(function (a, b) {
        return a + b;
      });

      promise.resolve(len);
      callback(null, len);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zrem = function (key) {
    var _this4 = this;

    for (var _len = arguments.length, members = Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
      members[_key2 - 1] = arguments[_key2];
    }

    var promise = new _eventsJs.Promise(noop);
    var callback = noop;

    if (members[members.length - 1] instanceof Function) {
      callback = members.pop();
    }

    promise.then(function (removeds) {
      return _this4.emit('zrem', key, members, removeds);
    });

    var removeds = 0;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this4.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var p = new _eventsJs.Promise(noop);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = members[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var hash = _step.value;

          var i = data.ms.indexOf(hash);

          if (i >= 0) {
            data.ms[hash] = 0;
            var score = data.hsm[hash];
            delete data.hsm[hash];

            var ii = data.shm[score].indexOf(hash);
            if (ii >= 0) data.shm[score].splice(ii, 1);

            removeds++;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      p.resolve(data);

      return p;
    }).then(function (data) {
      return _this4.set(key, data);
    }).then(function (_) {
      promise.resolve(removeds);
      callback(null, removeds);
    }, function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };

  min.zscore = function (key, member) {
    var _this5 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this5.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hash = data.ms.indexOf(member);

      if (hash >= 0) {
        var score = data.hsm[hash];

        promise.resolve(score);
        callback(null, score);
      } else {
        var err = new Error('This member does not be in the set');

        promise.reject(err);
        callback(err);
      }
    });

    return promise;
  };

  min.zrange = function (key, min, max) {
    var _this6 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return this.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hashs = Object.keys(data.shm).filter(function (score) {
        return min <= score && score <= max;
      }).map(function (score) {
        return data.shm[score];
      });

      var members = _utilsJs2['default'].flatten(hashs.map(function (hash) {
        return hash.map(function (row) {
          return data.ms[row];
        });
      })).reduce(function (a, b) {
        return a.concat(b);
      });

      promise.resolve(members);
      callback(null, members);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    promise.withScore = function () {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

      var p = new _eventsJs.Promise(noop);

      promise.then(function (members) {
        var multi = _this6.multi();

        members.forEach(function (member) {
          return multi.zscore(key, member);
        });

        multi.exec(function (err, replies) {
          if (err) {
            callback(err);
            return p.reject(err);
          }

          var rtn = replies.map(function (reply, ii) {
            return {
              member: members[ii],
              score: reply[0]
            };
          });

          p.resolve(rtn);
          callback(null, rtn);
        });
      });

      return p;
    };

    return promise;
  };

  min.zrevrange = function (key, min, max) {
    var _this7 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this7.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hashs = Object.keys(data.shm).reverse().filter(function (score) {
        return min <= score && score <= max;
      }).map(function (score) {
        return data.shm[score];
      });

      var members = _utilsJs2['default'].flatten(hashs.map(function (hash) {
        return hash.map(function (row) {
          return data.ms[row];
        });
      })).reduce(function (a, b) {
        return a.concat(b);
      });

      promise.resolve(members);
      callback(null, members);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    promise.withScore = function () {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

      var p = new _eventsJs.Promise(noop);

      promise.then(function (members) {
        var multi = _this7.multi();

        members.forEach(function (member) {
          return multi.zscore(key, member);
        });

        multi.exec(function (err, replies) {
          if (err) {
            callback(err);
            return p.reject(err);
          }

          var rtn = replies.map(function (reply, ii) {
            return {
              member: members[ii],
              score: reply[0]
            };
          });

          p.resolve(rtn);
          callback(null, rtn);
        });
      });

      return p;
    };

    return promise;
  };

  min.zincrby = function (key, increment, member) {
    var _this8 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise(noop);

    promise.then(function (score) {
      return _this8.emit('zincrby', key, increment, member, score);
    });

    var newScore = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this8.zscore(key, member);
      } else {
        _this8.zadd(key, increment, member, callback).then(promise.resolve.bind(promise), promise.reject.bind(promise));
      }
    }).then(function (_) {
      return _this8.get(key);
    }).then(function (data) {
      var hash = data.ms.indexOf(member);
      var score = data.hsm[hash];

      newScore = score + increment;

      var ii = data.shm[score].indexOf(hash);
      data.shm[score].splice(ii, 1);

      data.hsm[hash] = newScore;
      if (data.shm[newScore]) {
        data.shm[newScore].push(hash);
      } else {
        data.shm[newScore] = [hash];
      }

      return _this8.set(key, data);
    }).then(function (_) {
      promise.resolve(newScore);
      callback(null, newScore);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zdecrby = function (key, decrement, member) {
    var _this9 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _eventsJs.Promise(noop);

    promise.then(function (score) {
      return _this9.emit('zdecrby', keys, decrement, member, score);
    });

    var newScore = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this9.zscore(key, member);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (_) {
      return _this9.get(key);
    }).then(function (data) {
      var hash = data.ms.indexOf(member);
      var score = data.hsm[hash];

      newScore = score - decrement;

      var ii = data.shm[score].indexOf(hash);
      data.shm[score].splice(ii, 1);

      data.hsm[hash] = newScore;
      if (data.shm[newScore]) {
        data.shm[newScore].push(hash);
      } else {
        data.shm[newScore] = [hash];
      }

      return _this9.set(key, data);
    }).then(function (_) {
      promise.resolve(newScore);
      callback(null, newScore);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zrank = function (key, member) {
    var _this10 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this10.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var scores = Object.keys(data.shm);
      var score = data.hsm[data.ms.indexOf(member)];

      var rank = scores.indexOf(score);

      promise.resolve(rank);
      callback(null, rank);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zrevrank = function (key, member) {
    var _this11 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _eventsJs.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this11.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var scores = Object.keys(data.shm);
      var score = data.hsm[data.ms.indexOf(member)];

      var rank = scores.reverse().indexOf(score);

      promise.resolve(rank);
      callback(null, rank);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };
  module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _utilsJs = __webpack_require__(2);

  var _utilsJs2 = _interopRequireDefault(_utilsJs);

  var _eventsJs = __webpack_require__(3);

  var noop = _utilsJs2['default'].noop;

  var min = {};
  exports['default'] = min;

  /******************************
  **            Mise           **
  ******************************/

  var Multi = (function () {
    function Multi(_min) {
      var _this = this;

      _classCallCheck(this, Multi);

      this.queue = [];
      this.last = null;
      this.state = 0;
      this.min = _min;

      var keys = Object.getOwnPropertyNames(_min);

      for (var i = 0; i < keys.length; i++) {
        var prop = keys[i];

        if ('function' === typeof _min[prop]) {
          (function (method) {
            _this[method] = function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              _this.queue.push({
                method: method,
                args: args
              });

              return _this;
            };
          })(prop);
        }
      }
    }

    _createClass(Multi, [{
      key: 'exec',
      value: function exec() {
        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        var self = this;
        var promise = new _eventsJs.Promise();
        var results = [];

        (function loop(task) {
          if (task) {
            self.min[task.method].apply(self.min, task.args).then(function () {
              for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }

              results.push(args);
              loop(self.queue.shift());
            }, function (err) {
              promise.reject(err);
              callback(err, results);
            });
          } else {
            promise.resolve(results);
            callback(null, results);
          }
        })(this.queue.shift());

        return promise;
      }
    }]);

    return Multi;
  })();

  min.multi = function () {
    return new Multi(this);
  };

  var Sorter = (function () {
    function Sorter(key, _min) {
      var _this2 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

      _classCallCheck(this, Sorter);

      var loop = null;

      this.min = _min;
      this.callback = callback;
      this.result = [];
      this.keys = {};
      this.promise = new _eventsJs.Promise(noop);
      this.sortFn = function (a, b) {
        if (_utilsJs2['default'].isNumber(a) && _utilsJs2['default'].isNumber(b)) {
          return a - b;
        } else {
          return JSON.stringify(a) > JSON.stringify(b);
        }
      };

      var run = (function (_) {
        _this2.min.exists(key).then(function (exists) {
          if (exists) {
            return _this2.min.get(key);
          } else {
            return new Error('no such key');
          }
        }).then(function (value) {
          var p = new _eventsJs.Promise(noop);

          switch (true) {
            case Array.isArray(value):
              p.resolve(value);
              break;
            case value.ms && Array.isArray(value.ms):
              p.resolve(value.ms);
              break;

            default:
              return new Error('content type wrong');
          }

          return p;
        }).then(function (data) {
          _this2.result = data.sort(_this2.sortFn);

          _this2.result.forEach(function (chunk) {
            _this2.keys[chunk] = chunk;
          });

          _this2.promise.resolve(_this2.result);
          _this2.callback(null, _this2.result);
        }, function (err) {
          _this2.promise.reject(err);
          _this2.callback(err);
        });
      }

      // Promise Shim
      )(loop = function (methods) {
        var curr = methods.shift();

        if (curr) {
          _this2[curr] = function () {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            return _this2.promise[curr].apply(_this2.promise, args);
          };

          loop(methods);
        } else {
          run();
        }
      })(['then', 'done']);
    }

    _createClass(Sorter, [{
      key: 'by',
      value: function by(pattern) {
        var _this3 = this;

        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        var src2ref = {};
        var aviKeys = [];

        // TODO: Sort by hash field
        var field = null;

        if (pattern.indexOf('->') > 0) {
          var i = pattern.indexOf('->');
          field = pattern.substr(i + 2);
          pattern = pattern.substr(0, pattern.length - i);
        }

        this.min.keys(pattern).then(function (keys) {
          var filter = new RegExp(pattern.replace('?', '(.)').replace('*', '(.*)'));

          for (var i = 0; i < keys.length; i++) {
            var symbol = filter.exec(keys[i])[1];

            if (_this3.result.indexOf(symbol) >= 0) {
              src2ref[keys[i]] = symbol;
            }
          }

          aviKeys = Object.keys(src2ref);

          return _this3.min.mget(aviKeys.slice());
        }).then(function (values) {
          var reverse = {};

          for (var i = 0; i < values.length; i++) {
            reverse[JSON.stringify(values[i])] = aviKeys[i];
          }

          values.sort(_this3.sortFn);

          var newResult = values.map(function (value) {
            return reverse[JSON.stringify(value)];
          }).map(function (key) {
            return src2ref[key];
          });

          _this3.result = newResult;

          _this3.promise.resolve(newResult);
          callback(null, newResult);
        }, function (err) {
          _this3.promise.reject(err);
          callback(err);
          _this3.callback(err);
        });

        return this;
      }
    }, {
      key: 'asc',
      value: function asc() {
        var _this4 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        this.sortFn = function (a, b) {
          if (_utilsJs2['default'].isNumber(a) && _utilsJs2['default'].isNumber(b)) {
            return a - b;
          } else {
            return JSON.stringify(a) > JSON.stringify(b);
          }
        };

        var handle = function handle(result) {
          _this4.result = result.sort(_this4.sortFn);

          _this4.promise.resolve(_this4.result);
          callback(null, _this4.result);
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'desc',
      value: function desc() {
        var _this5 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        this.sortFn = function (a, b) {
          if (_utilsJs2['default'].isNumber(a) && _utilsJs2['default'].isNumber(b)) {
            return b - a;
          } else {
            return JSON.stringify(a) < JSON.stringify(b);
          }
        };

        var handle = function handle(result) {
          _this5.result = result.sort(_this5.sortFn);

          _this5.promise.resolve(_this5.result);
          callback(null, _this5.result);
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'get',
      value: function get(pattern) {
        var _this6 = this;

        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        var handle = function handle(_result) {
          var result = [];
          var loop = null(loop = function (res) {
            var curr = res.shift();

            if (!_utilsJs2['default'].isUndefined(curr)) {
              if (Array.isArray(curr)) {
                var key = _this6.keys[curr[0]];

                _this6.min.get(pattern.replace('*', key)).then(function (value) {
                  curr.push(value);
                  result.push(curr);

                  loop(res);
                }, function (err) {
                  _this6.promise.reject(err);
                  callback(err);
                });
              } else if (curr.substr || _utilsJs2['default'].isNumber(curr)) {
                var key = _this6.keys[curr];

                _this6.min.get(pattern.replace('*', key)).then(function (value) {
                  result.push([value]);
                  if (value.substr || _utilsJs2['default'].isNumber(value)) {
                    _this6.keys[value] = key;
                  } else {
                    _this6.keys[JSON.stringify(value)] = key;
                  }

                  loop(res);
                }, function (err) {
                  _this6.promise.reject(err);
                  callback(err);
                });
              }
            } else {
              _this6.result = result;

              _this6.promise.resolve(result);
              callback(null, result);
            }
          })(_result.slice());
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'hget',
      value: function hget(pattern, field) {
        var _this7 = this;

        var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

        var handle = function handle(_result) {
          var result = [];
          var loop = null(loop = function (res) {
            var curr = res.shift();

            if (!_utilsJs2['default'].isUndefined(curr)) {
              if (Array.isArray(curr)) {
                var key = _this7.keys[curr[0]];

                _this7.min.hget(pattern.replace('*', key), field).then(function (value) {
                  curr.push(value);
                  result.push(curr);

                  loop(res);
                }, function (err) {
                  _this7.promise.reject(err);
                  callback(err);
                });
              } else if (curr.substr || _utilsJs2['default'].isNumber(curr)) {
                var key = _this7.keys[curr];

                _this7.min.hget(pattern.replace('*', key)).then(function (value) {
                  result.push([value]);
                  if (value.substr || _utilsJs2['default'].isNumber(value)) {
                    _this7.keys[value] = key;
                  } else {
                    _this7.keys[JSON.stringify(value)] = key;
                  }

                  loop(res);
                }, function (err) {
                  _this7.promise.reject(err);
                  callback(err);
                });
              }
            } else {
              _this7.result = result;

              _this7.promise.resolve(result);
              callback(null, result);
            }
          })(_result.slice());
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'limit',
      value: function limit(offset, count) {
        var _this8 = this;

        var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

        var handle = function handle(result) {
          _this8.result = result.splice(offset, count);

          _this8.promise.resolve(_this8.result);
          callback(null, _this8.result);
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'flatten',
      value: function flatten() {
        var _this9 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        if (this.promise.ended) {
          var rtn = [];

          for (var i = 0; i < this.result.length; i++) {
            for (var j = 0; j < this.result[i].length; j++) {
              rtn.push(this.result[i][j]);
            }
          }

          this.result = rtn;

          this.promise.resolve(rtn);
          callback(null, rtn);
        } else {
          this.promise.once('resolve', function (result) {
            var rtn = [];

            for (var i = 0; i < result.length; i++) {
              for (var j = 0; j < result[i].length; j++) {
                rtn.push(result[i][j]);
              }
            }

            _this9.result = rtn;

            _this9.promise.resolve(rtn);
            callback(null, rtn);
          });
        }

        return this;
      }
    }, {
      key: 'store',
      value: function store(dest) {
        var _this10 = this;

        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        if (this.promise.ended) {
          this.min.set(dest, this.result).then(function (_) {
            _this10.promise.resolve(_this10.result);
            callback(null, _this10.result);
          }, function (err) {
            _this10.promise.reject(err);
            callback(err);
          });
        } else {
          this.promise.once('resolve', function (result) {
            _this10.min.set(dest, result).then(function (_) {
              _this10.promise.resolve(result);
              callback(null, result);
            }, function (err) {
              _this10.promise.reject(err);
              callback(err);
            });
          });
        }

        return this;
      }
    }]);

    return Sorter;
  })();

  min.sort = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];
    return new Sorter(key, undefined, callback);
  };

  var Scanner = (function () {
    function Scanner(cursor, pattern, count, min) {
      _classCallCheck(this, Scanner);

      pattern = pattern || '*';

      this.cursor = cursor || 0;
      this.pattern = new RegExp(pattern.replace('*', '(.*)'));
      this.limit = count > -1 ? count : 10;
      this.end = this.cursor;

      this.parent = min;
    }

    _createClass(Scanner, [{
      key: 'scan',
      value: function scan() {
        var _this11 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        var rtn = [];

        this.parent.get('min_keys').then(function (data) {
          data = JSON.parse(data);
          var scan = null;

          var keys = Object.keys(data)(scan = function (ii) {
            var key = keys[ii];

            if (key && _this11.pattern.test(key) && key !== 'min_keys') {
              rtn.push(key);

              if (++_this11.end - _this11.cursor >= _this11.limit) {
                return callback(null, rtn, _this11.end);
              }
            } else if (!key) {
              _this11.end = 0;
              return callback(null, rtn, _this11.end);
            }

            return scan(++ii);
          })(_this11.cursor);
        }, function (err) {
          callback(err);
        });

        return this;
      }
    }, {
      key: 'match',
      value: function match(pattern) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        this.pattern = new RegExp(pattern.replace('*', '(.*)'));
        this.end = this.cursor;

        return this.scan(callback);
      }
    }, {
      key: 'count',
      value: function count(_count) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        this.limit = _count;
        this.end = this.cursor;

        return this.scan(callback);
      }
    }]);

    return Scanner;
  })();

  min.scan = function (cursor) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var scanner = new Scanner(cursor, null, -1, undefined);

    scanner.scan(callback);

    return scanner;
  };
  module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports) {

  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var memStore = (function () {
    function memStore() {
      _classCallCheck(this, memStore);
    }

    _createClass(memStore, [{
      key: "get",
      value: function get(key) {
        if (sessionStorage) {
          return sessionStorage.getItem(key);
        } else {
          return false;
        }
      }
    }, {
      key: "set",
      value: function set(key, value) {
        if (sessionStorage) {
          return sessionStorage.setItem(key, value);
        } else {
          return false;
        }
      }
    }, {
      key: "remove",
      value: function remove(key) {
        if (sessionStorage) {
          return sessionStorage.removeItem(key);
        } else {
          return false;
        }
      }
    }]);

    return memStore;
  })();

  exports.memStore = memStore;

  var localStore = (function () {
    function localStore() {
      _classCallCheck(this, localStore);
    }

    _createClass(localStore, [{
      key: "get",
      value: function get(key) {
        if (localStorage) {
          return localStorage.getItem(key);
        } else {
          return false;
        }
      }
    }, {
      key: "set",
      value: function set(key, value) {
        if (localStorage) {
          return localStorage.setItem(key, value);
        } else {
          return false;
        }
      }
    }, {
      key: "remove",
      value: function remove(key) {
        if (localStorage) {
          return localStorage.removeItem(key);
        } else {
          return false;
        }
      }
    }]);

    return localStore;
  })();

  exports.localStore = localStore;

/***/ }
/******/ ])
});
;
},{}],7:[function(require,module,exports){
var _ = require('../util')

/**
 * Create a child instance that prototypally inherits
 * data on parent. To achieve that we create an intermediate
 * constructor with its prototype pointing to parent.
 *
 * @param {Object} opts
 * @param {Function} [BaseCtor]
 * @return {Vue}
 * @public
 */

exports.$addChild = function (opts, BaseCtor) {
  BaseCtor = BaseCtor || _.Vue
  opts = opts || {}
  var ChildVue
  var parent = this
  // transclusion context
  var context = opts._context || parent
  var inherit = opts.inherit !== undefined
    ? opts.inherit
    : BaseCtor.options.inherit
  if (inherit) {
    var ctors = context._childCtors
    ChildVue = ctors[BaseCtor.cid]
    if (!ChildVue) {
      var optionName = BaseCtor.options.name
      var className = optionName
        ? _.classify(optionName)
        : 'VueComponent'
      ChildVue = new Function(
        'return function ' + className + ' (options) {' +
        'this.constructor = ' + className + ';' +
        'this._init(options) }'
      )()
      ChildVue.options = BaseCtor.options
      ChildVue.linker = BaseCtor.linker
      ChildVue.prototype = context
      ctors[BaseCtor.cid] = ChildVue
    }
  } else {
    ChildVue = BaseCtor
  }
  opts._parent = parent
  opts._root = parent.$root
  var child = new ChildVue(opts)
  return child
}

},{"../util":68}],8:[function(require,module,exports){
var Watcher = require('../watcher')
var Path = require('../parsers/path')
var textParser = require('../parsers/text')
var dirParser = require('../parsers/directive')
var expParser = require('../parsers/expression')
var filterRE = /[^|]\|[^|]/

/**
 * Get the value from an expression on this vm.
 *
 * @param {String} exp
 * @return {*}
 */

exports.$get = function (exp) {
  var res = expParser.parse(exp)
  if (res) {
    try {
      return res.get.call(this, this)
    } catch (e) {}
  }
}

/**
 * Set the value from an expression on this vm.
 * The expression must be a valid left-hand
 * expression in an assignment.
 *
 * @param {String} exp
 * @param {*} val
 */

exports.$set = function (exp, val) {
  var res = expParser.parse(exp, true)
  if (res && res.set) {
    res.set.call(this, this, val)
  }
}

/**
 * Add a property on the VM
 *
 * @param {String} key
 * @param {*} val
 */

exports.$add = function (key, val) {
  this._data.$add(key, val)
}

/**
 * Delete a property on the VM
 *
 * @param {String} key
 */

exports.$delete = function (key) {
  this._data.$delete(key)
}

/**
 * Watch an expression, trigger callback when its
 * value changes.
 *
 * @param {String|Function} expOrFn
 * @param {Function} cb
 * @param {Object} [options]
 *                 - {Boolean} deep
 *                 - {Boolean} immediate
 *                 - {Boolean} user
 * @return {Function} - unwatchFn
 */

exports.$watch = function (expOrFn, cb, options) {
  var vm = this
  var parsed
  if (typeof expOrFn === 'string') {
    parsed = dirParser.parse(expOrFn)[0]
    expOrFn = parsed.expression
  }
  var watcher = new Watcher(vm, expOrFn, cb, {
    deep: options && options.deep,
    user: !options || options.user !== false,
    filters: parsed && parsed.filters
  })
  if (options && options.immediate) {
    cb.call(vm, watcher.value)
  }
  return function unwatchFn () {
    watcher.teardown()
  }
}

/**
 * Evaluate a text directive, including filters.
 *
 * @param {String} text
 * @return {String}
 */

exports.$eval = function (text) {
  // check for filters.
  if (filterRE.test(text)) {
    var dir = dirParser.parse(text)[0]
    // the filter regex check might give false positive
    // for pipes inside strings, so it's possible that
    // we don't get any filters here
    var val = this.$get(dir.expression)
    return dir.filters
      ? this._applyFilters(val, null, dir.filters)
      : val
  } else {
    // no filter
    return this.$get(text)
  }
}

/**
 * Interpolate a piece of template text.
 *
 * @param {String} text
 * @return {String}
 */

exports.$interpolate = function (text) {
  var tokens = textParser.parse(text)
  var vm = this
  if (tokens) {
    if (tokens.length === 1) {
      return vm.$eval(tokens[0].value) + ''
    } else {
      return tokens.map(function (token) {
        return token.tag
          ? vm.$eval(token.value)
          : token.value
      }).join('')
    }
  } else {
    return text
  }
}

/**
 * Log instance data as a plain JS object
 * so that it is easier to inspect in console.
 * This method assumes console is available.
 *
 * @param {String} [path]
 */

exports.$log = function (path) {
  var data = path
    ? Path.get(this._data, path)
    : this._data
  if (data) {
    data = JSON.parse(JSON.stringify(data))
  }
  console.log(data)
}

},{"../parsers/directive":56,"../parsers/expression":57,"../parsers/path":58,"../parsers/text":60,"../watcher":72}],9:[function(require,module,exports){
var _ = require('../util')
var transition = require('../transition')

/**
 * Convenience on-instance nextTick. The callback is
 * auto-bound to the instance, and this avoids component
 * modules having to rely on the global Vue.
 *
 * @param {Function} fn
 */

exports.$nextTick = function (fn) {
  _.nextTick(fn, this)
}

/**
 * Append instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$appendTo = function (target, cb, withTransition) {
  return insert(
    this, target, cb, withTransition,
    append, transition.append
  )
}

/**
 * Prepend instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$prependTo = function (target, cb, withTransition) {
  target = query(target)
  if (target.hasChildNodes()) {
    this.$before(target.firstChild, cb, withTransition)
  } else {
    this.$appendTo(target, cb, withTransition)
  }
  return this
}

/**
 * Insert instance before target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$before = function (target, cb, withTransition) {
  return insert(
    this, target, cb, withTransition,
    before, transition.before
  )
}

/**
 * Insert instance after target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$after = function (target, cb, withTransition) {
  target = query(target)
  if (target.nextSibling) {
    this.$before(target.nextSibling, cb, withTransition)
  } else {
    this.$appendTo(target.parentNode, cb, withTransition)
  }
  return this
}

/**
 * Remove instance from DOM
 *
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$remove = function (cb, withTransition) {
  if (!this.$el.parentNode) {
    return cb && cb()
  }
  var inDoc = this._isAttached && _.inDoc(this.$el)
  // if we are not in document, no need to check
  // for transitions
  if (!inDoc) withTransition = false
  var op
  var self = this
  var realCb = function () {
    if (inDoc) self._callHook('detached')
    if (cb) cb()
  }
  if (
    this._isFragment &&
    !this._blockFragment.hasChildNodes()
  ) {
    op = withTransition === false
      ? append
      : transition.removeThenAppend
    blockOp(this, this._blockFragment, op, realCb)
  } else {
    op = withTransition === false
      ? remove
      : transition.remove
    op(this.$el, this, realCb)
  }
  return this
}

/**
 * Shared DOM insertion function.
 *
 * @param {Vue} vm
 * @param {Element} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 * @param {Function} op1 - op for non-transition insert
 * @param {Function} op2 - op for transition insert
 * @return vm
 */

function insert (vm, target, cb, withTransition, op1, op2) {
  target = query(target)
  var targetIsDetached = !_.inDoc(target)
  var op = withTransition === false || targetIsDetached
    ? op1
    : op2
  var shouldCallHook =
    !targetIsDetached &&
    !vm._isAttached &&
    !_.inDoc(vm.$el)
  if (vm._isFragment) {
    blockOp(vm, target, op, cb)
  } else {
    op(vm.$el, target, vm, cb)
  }
  if (shouldCallHook) {
    vm._callHook('attached')
  }
  return vm
}

/**
 * Execute a transition operation on a fragment instance,
 * iterating through all its block nodes.
 *
 * @param {Vue} vm
 * @param {Node} target
 * @param {Function} op
 * @param {Function} cb
 */

function blockOp (vm, target, op, cb) {
  var current = vm._fragmentStart
  var end = vm._fragmentEnd
  var next
  while (next !== end) {
    next = current.nextSibling
    op(current, target, vm)
    current = next
  }
  op(end, target, vm, cb)
}

/**
 * Check for selectors
 *
 * @param {String|Element} el
 */

function query (el) {
  return typeof el === 'string'
    ? document.querySelector(el)
    : el
}

/**
 * Append operation that takes a callback.
 *
 * @param {Node} el
 * @param {Node} target
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function append (el, target, vm, cb) {
  target.appendChild(el)
  if (cb) cb()
}

/**
 * InsertBefore operation that takes a callback.
 *
 * @param {Node} el
 * @param {Node} target
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function before (el, target, vm, cb) {
  _.before(el, target)
  if (cb) cb()
}

/**
 * Remove operation that takes a callback.
 *
 * @param {Node} el
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function remove (el, vm, cb) {
  _.remove(el)
  if (cb) cb()
}

},{"../transition":61,"../util":68}],10:[function(require,module,exports){
var _ = require('../util')

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$on = function (event, fn) {
  (this._events[event] || (this._events[event] = []))
    .push(fn)
  modifyListenerCount(this, event, 1)
  return this
}

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$once = function (event, fn) {
  var self = this
  function on () {
    self.$off(event, on)
    fn.apply(this, arguments)
  }
  on.fn = fn
  this.$on(event, on)
  return this
}

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$off = function (event, fn) {
  var cbs
  // all
  if (!arguments.length) {
    if (this.$parent) {
      for (event in this._events) {
        cbs = this._events[event]
        if (cbs) {
          modifyListenerCount(this, event, -cbs.length)
        }
      }
    }
    this._events = {}
    return this
  }
  // specific event
  cbs = this._events[event]
  if (!cbs) {
    return this
  }
  if (arguments.length === 1) {
    modifyListenerCount(this, event, -cbs.length)
    this._events[event] = null
    return this
  }
  // specific handler
  var cb
  var i = cbs.length
  while (i--) {
    cb = cbs[i]
    if (cb === fn || cb.fn === fn) {
      modifyListenerCount(this, event, -1)
      cbs.splice(i, 1)
      break
    }
  }
  return this
}

/**
 * Trigger an event on self.
 *
 * @param {String} event
 */

exports.$emit = function (event) {
  this._eventCancelled = false
  var cbs = this._events[event]
  if (cbs) {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length - 1
    var args = new Array(i)
    while (i--) {
      args[i] = arguments[i + 1]
    }
    i = 0
    cbs = cbs.length > 1
      ? _.toArray(cbs)
      : cbs
    for (var l = cbs.length; i < l; i++) {
      if (cbs[i].apply(this, args) === false) {
        this._eventCancelled = true
      }
    }
  }
  return this
}

/**
 * Recursively broadcast an event to all children instances.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$broadcast = function (event) {
  // if no child has registered for this event,
  // then there's no need to broadcast.
  if (!this._eventsCount[event]) return
  var children = this.$children
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i]
    child.$emit.apply(child, arguments)
    if (!child._eventCancelled) {
      child.$broadcast.apply(child, arguments)
    }
  }
  return this
}

/**
 * Recursively propagate an event up the parent chain.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$dispatch = function () {
  var parent = this.$parent
  while (parent) {
    parent.$emit.apply(parent, arguments)
    parent = parent._eventCancelled
      ? null
      : parent.$parent
  }
  return this
}

/**
 * Modify the listener counts on all parents.
 * This bookkeeping allows $broadcast to return early when
 * no child has listened to a certain event.
 *
 * @param {Vue} vm
 * @param {String} event
 * @param {Number} count
 */

var hookRE = /^hook:/
function modifyListenerCount (vm, event, count) {
  var parent = vm.$parent
  // hooks do not get broadcasted so no need
  // to do bookkeeping for them
  if (!parent || !count || hookRE.test(event)) return
  while (parent) {
    parent._eventsCount[event] =
      (parent._eventsCount[event] || 0) + count
    parent = parent.$parent
  }
}

},{"../util":68}],11:[function(require,module,exports){
var _ = require('../util')
var config = require('../config')

/**
 * Expose useful internals
 */

exports.util = _
exports.config = config
exports.nextTick = _.nextTick
exports.compiler = require('../compiler')

exports.parsers = {
  path: require('../parsers/path'),
  text: require('../parsers/text'),
  template: require('../parsers/template'),
  directive: require('../parsers/directive'),
  expression: require('../parsers/expression')
}

/**
 * Each instance constructor, including Vue, has a unique
 * cid. This enables us to create wrapped "child
 * constructors" for prototypal inheritance and cache them.
 */

exports.cid = 0
var cid = 1

/**
 * Class inheritance
 *
 * @param {Object} extendOptions
 */

exports.extend = function (extendOptions) {
  extendOptions = extendOptions || {}
  var Super = this
  var Sub = createClass(
    extendOptions.name ||
    Super.options.name ||
    'VueComponent'
  )
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid++
  Sub.options = _.mergeOptions(
    Super.options,
    extendOptions
  )
  Sub['super'] = Super
  // allow further extension
  Sub.extend = Super.extend
  // create asset registers, so extended classes
  // can have their private assets too.
  config._assetTypes.forEach(function (type) {
    Sub[type] = Super[type]
  })
  return Sub
}

/**
 * A function that returns a sub-class constructor with the
 * given name. This gives us much nicer output when
 * logging instances in the console.
 *
 * @param {String} name
 * @return {Function}
 */

function createClass (name) {
  return new Function(
    'return function ' + _.classify(name) +
    ' (options) { this._init(options) }'
  )()
}

/**
 * Plugin system
 *
 * @param {Object} plugin
 */

exports.use = function (plugin) {
  // additional parameters
  var args = _.toArray(arguments, 1)
  args.unshift(this)
  if (typeof plugin.install === 'function') {
    plugin.install.apply(plugin, args)
  } else {
    plugin.apply(null, args)
  }
  return this
}

/**
 * Apply a global mixin by merging it into the default
 * options.
 */

exports.mixin = function (mixin) {
  var Vue = _.Vue
  Vue.options = _.mergeOptions(Vue.options, mixin)
}

/**
 * Create asset registration methods with the following
 * signature:
 *
 * @param {String} id
 * @param {*} definition
 */

config._assetTypes.forEach(function (type) {
  exports[type] = function (id, definition) {
    if (!definition) {
      return this.options[type + 's'][id]
    } else {
      if (
        type === 'component' &&
        _.isPlainObject(definition)
      ) {
        definition.name = id
        definition = _.Vue.extend(definition)
      }
      this.options[type + 's'][id] = definition
    }
  }
})

},{"../compiler":17,"../config":19,"../parsers/directive":56,"../parsers/expression":57,"../parsers/path":58,"../parsers/template":59,"../parsers/text":60,"../util":68}],12:[function(require,module,exports){
(function (process){
var _ = require('../util')
var compiler = require('../compiler')

/**
 * Set instance target element and kick off the compilation
 * process. The passed in `el` can be a selector string, an
 * existing Element, or a DocumentFragment (for block
 * instances).
 *
 * @param {Element|DocumentFragment|string} el
 * @public
 */

exports.$mount = function (el) {
  if (this._isCompiled) {
    process.env.NODE_ENV !== 'production' && _.warn(
      '$mount() should be called only once.'
    )
    return
  }
  el = _.query(el)
  if (!el) {
    el = document.createElement('div')
  }
  this._compile(el)
  this._isCompiled = true
  this._callHook('compiled')
  this._initDOMHooks()
  if (_.inDoc(this.$el)) {
    this._callHook('attached')
    ready.call(this)
  } else {
    this.$once('hook:attached', ready)
  }
  return this
}

/**
 * Mark an instance as ready.
 */

function ready () {
  this._isAttached = true
  this._isReady = true
  this._callHook('ready')
}

/**
 * Teardown the instance, simply delegate to the internal
 * _destroy.
 */

exports.$destroy = function (remove, deferCleanup) {
  this._destroy(remove, deferCleanup)
}

/**
 * Partially compile a piece of DOM and return a
 * decompile function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Vue} [host]
 * @return {Function}
 */

exports.$compile = function (el, host) {
  return compiler.compile(el, this.$options, true)(this, el, host)
}

}).call(this,require('_process'))
},{"../compiler":17,"../util":68,"_process":1}],13:[function(require,module,exports){
(function (process){
var _ = require('./util')
var config = require('./config')

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.
var queue = []
var userQueue = []
var has = {}
var circular = {}
var waiting = false
var internalQueueDepleted = false

/**
 * Reset the batcher's state.
 */

function resetBatcherState () {
  queue = []
  userQueue = []
  has = {}
  circular = {}
  waiting = internalQueueDepleted = false
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue () {
  runBatcherQueue(queue)
  internalQueueDepleted = true
  runBatcherQueue(userQueue)
  resetBatcherState()
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue (queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (var i = 0; i < queue.length; i++) {
    var watcher = queue[i]
    var id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > config._maxUpdateCount) {
        queue.splice(has[id], 1)
        _.warn(
          'You may have an infinite update loop for watcher ' +
          'with expression: ' + watcher.expression
        )
      }
    }
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

exports.push = function (watcher) {
  var id = watcher.id
  if (has[id] == null) {
    // if an internal watcher is pushed, but the internal
    // queue is already depleted, we run it immediately.
    if (internalQueueDepleted && !watcher.user) {
      watcher.run()
      return
    }
    // push watcher into appropriate queue
    var q = watcher.user ? userQueue : queue
    has[id] = q.length
    q.push(watcher)
    // queue the flush
    if (!waiting) {
      waiting = true
      _.nextTick(flushBatcherQueue)
    }
  }
}

}).call(this,require('_process'))
},{"./config":19,"./util":68,"_process":1}],14:[function(require,module,exports){
/**
 * A doubly linked list-based Least Recently Used (LRU)
 * cache. Will keep most recently used items while
 * discarding least recently used items when its limit is
 * reached. This is a bare-bone version of
 * Rasmus Andersson's js-lru:
 *
 *   https://github.com/rsms/js-lru
 *
 * @param {Number} limit
 * @constructor
 */

function Cache (limit) {
  this.size = 0
  this.limit = limit
  this.head = this.tail = undefined
  this._keymap = Object.create(null)
}

var p = Cache.prototype

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var entry = {
    key: key,
    value: value
  }
  this._keymap[key] = entry
  if (this.tail) {
    this.tail.newer = entry
    entry.older = this.tail
  } else {
    this.head = entry
  }
  this.tail = entry
  if (this.size === this.limit) {
    return this.shift()
  } else {
    this.size++
  }
}

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head
  if (entry) {
    this.head = this.head.newer
    this.head.older = undefined
    entry.newer = entry.older = undefined
    this._keymap[entry.key] = undefined
  }
  return entry
}

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key]
  if (entry === undefined) return
  if (entry === this.tail) {
    return returnEntry
      ? entry
      : entry.value
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer
    }
    entry.newer.older = entry.older // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer // C. --> E
  }
  entry.newer = undefined // D --x
  entry.older = this.tail // D. --> E
  if (this.tail) {
    this.tail.newer = entry // E. <-- D
  }
  this.tail = entry
  return returnEntry
    ? entry
    : entry.value
}

module.exports = Cache

},{}],15:[function(require,module,exports){
(function (process){
var _ = require('../util')
var textParser = require('../parsers/text')
var propDef = require('../directives/prop')
var propBindingModes = require('../config')._propBindingModes

// regexes
var identRE = require('../parsers/path').identRE
var dataAttrRE = /^data-/
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/
var literalValueRE = /^(true|false)$|^\d.*/

/**
 * Compile param attributes on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @return {Function} propsLinkFn
 */

module.exports = function compileProps (el, propOptions) {
  var props = []
  var i = propOptions.length
  var options, name, attr, value, path, prop, literal, single
  while (i--) {
    options = propOptions[i]
    name = options.name
    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = _.camelize(name.replace(dataAttrRE, ''))
    if (!identRE.test(path)) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Invalid prop key: "' + name + '". Prop keys ' +
        'must be valid identifiers.'
      )
      continue
    }
    attr = _.hyphenate(name)
    value = el.getAttribute(attr)
    if (value === null) {
      attr = 'data-' + attr
      value = el.getAttribute(attr)
    }
    // create a prop descriptor
    prop = {
      name: name,
      raw: value,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY
    }
    if (value !== null) {
      // important so that this doesn't get compiled
      // again as a normal attribute binding
      el.removeAttribute(attr)
      var tokens = textParser.parse(value)
      if (tokens) {
        prop.dynamic = true
        prop.parentPath = textParser.tokensToExp(tokens)
        // check prop binding type.
        single = tokens.length === 1
        literal = literalValueRE.test(prop.parentPath)
        // one time: {{* prop}}
        if (literal || (single && tokens[0].oneTime)) {
          prop.mode = propBindingModes.ONE_TIME
        } else if (
          !literal &&
          (single && tokens[0].twoWay)
        ) {
          if (settablePathRE.test(prop.parentPath)) {
            prop.mode = propBindingModes.TWO_WAY
          } else {
            process.env.NODE_ENV !== 'production' && _.warn(
              'Cannot bind two-way prop with non-settable ' +
              'parent path: ' + prop.parentPath
            )
          }
        }
        if (
          process.env.NODE_ENV !== 'production' &&
          options.twoWay &&
          prop.mode !== propBindingModes.TWO_WAY
        ) {
          _.warn(
            'Prop "' + name + '" expects a two-way binding type.'
          )
        }
      }
    } else if (options && options.required) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Missing required prop: ' + name
      )
    }
    props.push(prop)
  }
  return makePropsLinkFn(props)
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn (props) {
  return function propsLinkFn (vm, el) {
    // store resolved props info
    vm._props = {}
    var i = props.length
    var prop, path, options, value
    while (i--) {
      prop = props[i]
      path = prop.path
      vm._props[path] = prop
      options = prop.options
      if (prop.raw === null) {
        // initialize absent prop
        _.initProp(vm, prop, getDefault(options))
      } else if (prop.dynamic) {
        // dynamic prop
        if (vm._context) {
          if (prop.mode === propBindingModes.ONE_TIME) {
            // one time binding
            value = vm._context.$get(prop.parentPath)
            _.initProp(vm, prop, value)
          } else {
            // dynamic binding
            vm._bindDir('prop', el, prop, propDef)
          }
        } else {
          process.env.NODE_ENV !== 'production' && _.warn(
            'Cannot bind dynamic prop on a root instance' +
            ' with no parent: ' + prop.name + '="' +
            prop.raw + '"'
          )
        }
      } else {
        // literal, cast it and just set once
        var raw = prop.raw
        value = options.type === Boolean && raw === ''
          ? true
          // do not cast emptry string.
          // _.toNumber casts empty string to 0.
          : raw.trim()
            ? _.toBoolean(_.toNumber(raw))
            : raw
        _.initProp(vm, prop, value)
      }
    }
  }
}

/**
 * Get the default value of a prop.
 *
 * @param {Object} options
 * @return {*}
 */

function getDefault (options) {
  // no default, return undefined
  if (!options.hasOwnProperty('default')) {
    // absent boolean value defaults to false
    return options.type === Boolean
      ? false
      : undefined
  }
  var def = options.default
  // warn against non-factory defaults for Object & Array
  if (_.isObject(def)) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Object/Array as default prop values will be shared ' +
      'across multiple instances. Use a factory function ' +
      'to return the default value instead.'
    )
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function
    ? def()
    : def
}

}).call(this,require('_process'))
},{"../config":19,"../directives/prop":35,"../parsers/path":58,"../parsers/text":60,"../util":68,"_process":1}],16:[function(require,module,exports){
(function (process){
var _ = require('../util')
var compileProps = require('./compile-props')
var config = require('../config')
var textParser = require('../parsers/text')
var dirParser = require('../parsers/directive')
var templateParser = require('../parsers/template')
var resolveAsset = _.resolveAsset
var componentDef = require('../directives/component')

// terminal directives
var terminalDirectives = [
  'repeat',
  'if'
]

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function would normally
 * be called on instance root nodes, but can also be used
 * for partial compilation if the partial argument is true.
 *
 * The returned composite link function, when called, will
 * return an unlink function that tearsdown all directives
 * created during the linking phase.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @return {Function}
 */

exports.compile = function (el, options, partial) {
  // link function for the node itself.
  var nodeLinkFn = partial || !options._asComponent
    ? compileNode(el, options)
    : null
  // link function for the childNodes
  var childLinkFn =
    !(nodeLinkFn && nodeLinkFn.terminal) &&
    el.tagName !== 'SCRIPT' &&
    el.hasChildNodes()
      ? compileNodeList(el.childNodes, options)
      : null

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host] - host vm of transcluded content
   * @return {Function|undefined}
   */

  return function compositeLinkFn (vm, el, host) {
    // cache childNodes before linking parent, fix #657
    var childNodes = _.toArray(el.childNodes)
    // link
    var dirs = linkAndCapture(function () {
      if (nodeLinkFn) nodeLinkFn(vm, el, host)
      if (childLinkFn) childLinkFn(vm, childNodes, host)
    }, vm)
    return makeUnlinkFn(vm, dirs)
  }
}

/**
 * Apply a linker to a vm/element pair and capture the
 * directives created during the process.
 *
 * @param {Function} linker
 * @param {Vue} vm
 */

function linkAndCapture (linker, vm) {
  var originalDirCount = vm._directives.length
  linker()
  return vm._directives.slice(originalDirCount)
}

/**
 * Linker functions return an unlink function that
 * tearsdown all directives instances generated during
 * the process.
 *
 * We create unlink functions with only the necessary
 * information to avoid retaining additional closures.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Vue} [context]
 * @param {Array} [contextDirs]
 * @return {Function}
 */

function makeUnlinkFn (vm, dirs, context, contextDirs) {
  return function unlink (destroying) {
    teardownDirs(vm, dirs, destroying)
    if (context && contextDirs) {
      teardownDirs(context, contextDirs)
    }
  }
}

/**
 * Teardown partial linked directives.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Boolean} destroying
 */

function teardownDirs (vm, dirs, destroying) {
  var i = dirs.length
  while (i--) {
    dirs[i]._teardown()
    if (!destroying) {
      vm._directives.$remove(dirs[i])
    }
  }
}

/**
 * Compile link props on an instance.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} options
 * @return {Function}
 */

exports.compileAndLinkProps = function (vm, el, props) {
  var propsLinkFn = compileProps(el, props)
  var propDirs = linkAndCapture(function () {
    propsLinkFn(vm, null)
  }, vm)
  return makeUnlinkFn(vm, propDirs)
}

/**
 * Compile the root element of an instance.
 *
 * 1. attrs on context container (context scope)
 * 2. attrs on the component template root node, if
 *    replace:true (child scope)
 *
 * If this is a fragment instance, we only need to compile 1.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} options
 * @return {Function}
 */

exports.compileRoot = function (el, options) {
  var containerAttrs = options._containerAttrs
  var replacerAttrs = options._replacerAttrs
  var contextLinkFn, replacerLinkFn

  // only need to compile other attributes for
  // non-fragment instances
  if (el.nodeType !== 11) {
    // for components, container and replacer need to be
    // compiled separately and linked in different scopes.
    if (options._asComponent) {
      // 2. container attributes
      if (containerAttrs) {
        contextLinkFn = compileDirectives(containerAttrs, options)
      }
      if (replacerAttrs) {
        // 3. replacer attributes
        replacerLinkFn = compileDirectives(replacerAttrs, options)
      }
    } else {
      // non-component, just compile as a normal element.
      replacerLinkFn = compileDirectives(el.attributes, options)
    }
  }

  return function rootLinkFn (vm, el) {
    // link context scope dirs
    var context = vm._context
    var contextDirs
    if (context && contextLinkFn) {
      contextDirs = linkAndCapture(function () {
        contextLinkFn(context, el)
      }, context)
    }

    // link self
    var selfDirs = linkAndCapture(function () {
      if (replacerLinkFn) replacerLinkFn(vm, el)
    }, vm)

    // return the unlink function that tearsdown context
    // container directives.
    return makeUnlinkFn(vm, selfDirs, context, contextDirs)
  }
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode (node, options) {
  var type = node.nodeType
  if (type === 1 && node.tagName !== 'SCRIPT') {
    return compileElement(node, options)
  } else if (type === 3 && config.interpolate && node.data.trim()) {
    return compileTextNode(node, options)
  } else {
    return null
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement (el, options) {
  // preprocess textareas.
  // textarea treats its text content as the initial value.
  // just bind it as a v-attr directive for value.
  if (el.tagName === 'TEXTAREA') {
    if (textParser.parse(el.value)) {
      el.setAttribute('value', el.value)
    }
  }
  var linkFn
  var hasAttrs = el.hasAttributes()
  // check terminal directives (repeat & if)
  if (hasAttrs) {
    linkFn = checkTerminalDirectives(el, options)
  }
  // check element directives
  if (!linkFn) {
    linkFn = checkElementDirectives(el, options)
  }
  // check component
  if (!linkFn) {
    linkFn = checkComponent(el, options)
  }
  // normal directives
  if (!linkFn && hasAttrs) {
    linkFn = compileDirectives(el.attributes, options)
  }
  return linkFn
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode (node, options) {
  var tokens = textParser.parse(node.data)
  if (!tokens) {
    return null
  }
  var frag = document.createDocumentFragment()
  var el, token
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i]
    el = token.tag
      ? processTextToken(token, options)
      : document.createTextNode(token.value)
    frag.appendChild(el)
  }
  return makeTextNodeLinkFn(tokens, frag, options)
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken (token, options) {
  var el
  if (token.oneTime) {
    el = document.createTextNode(token.value)
  } else {
    if (token.html) {
      el = document.createComment('v-html')
      setTokenType('html')
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ')
      setTokenType('text')
    }
  }
  function setTokenType (type) {
    token.type = type
    token.def = resolveAsset(options, 'directives', type)
    token.descriptor = dirParser.parse(token.value)[0]
  }
  return el
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn (tokens, frag) {
  return function textNodeLinkFn (vm, el) {
    var fragClone = frag.cloneNode(true)
    var childNodes = _.toArray(fragClone.childNodes)
    var token, value, node
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i]
      value = token.value
      if (token.tag) {
        node = childNodes[i]
        if (token.oneTime) {
          value = vm.$eval(value)
          if (token.html) {
            _.replace(node, templateParser.parse(value, true))
          } else {
            node.data = value
          }
        } else {
          vm._bindDir(token.type, node,
                      token.descriptor, token.def)
        }
      }
    }
    _.replace(el, fragClone)
  }
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList (nodeList, options) {
  var linkFns = []
  var nodeLinkFn, childLinkFn, node
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i]
    nodeLinkFn = compileNode(node, options)
    childLinkFn =
      !(nodeLinkFn && nodeLinkFn.terminal) &&
      node.tagName !== 'SCRIPT' &&
      node.hasChildNodes()
        ? compileNodeList(node.childNodes, options)
        : null
    linkFns.push(nodeLinkFn, childLinkFn)
  }
  return linkFns.length
    ? makeChildLinkFn(linkFns)
    : null
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn (linkFns) {
  return function childLinkFn (vm, nodes, host) {
    var node, nodeLinkFn, childrenLinkFn
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n]
      nodeLinkFn = linkFns[i++]
      childrenLinkFn = linkFns[i++]
      // cache childNodes before linking parent, fix #657
      var childNodes = _.toArray(node.childNodes)
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host)
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host)
      }
    }
  }
}

/**
 * Check for element directives (custom elements that should
 * be resovled as terminal directives).
 *
 * @param {Element} el
 * @param {Object} options
 */

function checkElementDirectives (el, options) {
  var tag = el.tagName.toLowerCase()
  if (_.commonTagRE.test(tag)) return
  var def = resolveAsset(options, 'elementDirectives', tag)
  if (def) {
    return makeTerminalNodeLinkFn(el, tag, '', options, def)
  }
}

/**
 * Check if an element is a component. If yes, return
 * a component link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Boolean} hasAttrs
 * @return {Function|undefined}
 */

function checkComponent (el, options, hasAttrs) {
  var componentId = _.checkComponent(el, options, hasAttrs)
  if (componentId) {
    var componentLinkFn = function (vm, el, host) {
      vm._bindDir('component', el, {
        expression: componentId
      }, componentDef, host)
    }
    componentLinkFn.terminal = true
    return componentLinkFn
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function checkTerminalDirectives (el, options) {
  if (_.attr(el, 'pre') !== null) {
    return skip
  }
  var value, dirName
  for (var i = 0, l = terminalDirectives.length; i < l; i++) {
    dirName = terminalDirectives[i]
    if ((value = _.attr(el, dirName)) !== null) {
      return makeTerminalNodeLinkFn(el, dirName, value, options)
    }
  }
}

function skip () {}
skip.terminal = true

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @param {Object} [def]
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn (el, dirName, value, options, def) {
  var descriptor = dirParser.parse(value)[0]
  // no need to call resolveAsset since terminal directives
  // are always internal
  def = def || options.directives[dirName]
  var fn = function terminalNodeLinkFn (vm, el, host) {
    vm._bindDir(dirName, el, descriptor, def, host)
  }
  fn.terminal = true
  return fn
}

/**
 * Compile the directives on an element and return a linker.
 *
 * @param {Array|NamedNodeMap} attrs
 * @param {Object} options
 * @return {Function}
 */

function compileDirectives (attrs, options) {
  var i = attrs.length
  var dirs = []
  var attr, name, value, dir, dirName, dirDef
  while (i--) {
    attr = attrs[i]
    name = attr.name
    value = attr.value
    if (name.indexOf(config.prefix) === 0) {
      dirName = name.slice(config.prefix.length)
      dirDef = resolveAsset(options, 'directives', dirName)
      if (process.env.NODE_ENV !== 'production') {
        _.assertAsset(dirDef, 'directive', dirName)
      }
      if (dirDef) {
        dirs.push({
          name: dirName,
          descriptors: dirParser.parse(value),
          def: dirDef
        })
      }
    } else if (config.interpolate) {
      dir = collectAttrDirective(name, value, options)
      if (dir) {
        dirs.push(dir)
      }
    }
  }
  // sort by priority, LOW to HIGH
  if (dirs.length) {
    dirs.sort(directiveComparator)
    return makeNodeLinkFn(dirs)
  }
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn (directives) {
  return function nodeLinkFn (vm, el, host) {
    // reverse apply because it's sorted low to high
    var i = directives.length
    var dir, j, k
    while (i--) {
      dir = directives[i]
      if (dir._link) {
        // custom link fn
        dir._link(vm, el)
      } else {
        k = dir.descriptors.length
        for (j = 0; j < k; j++) {
          vm._bindDir(dir.name, el,
            dir.descriptors[j], dir.def, host)
        }
      }
    }
  }
}

/**
 * Check an attribute for potential dynamic bindings,
 * and return a directive object.
 *
 * Special case: class interpolations are translated into
 * v-class instead v-attr, so that it can work with user
 * provided v-class bindings.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Object}
 */

function collectAttrDirective (name, value, options) {
  var tokens = textParser.parse(value)
  var isClass = name === 'class'
  if (tokens) {
    var dirName = isClass ? 'class' : 'attr'
    var def = options.directives[dirName]
    var i = tokens.length
    var allOneTime = true
    while (i--) {
      var token = tokens[i]
      if (token.tag && !token.oneTime) {
        allOneTime = false
      }
    }
    var linker
    if (allOneTime) {
      linker = function (vm, el) {
        el.setAttribute(name, vm.$interpolate(value))
      }
    } else {
      linker = function (vm, el) {
        var exp = textParser.tokensToExp(tokens, vm)
        var desc = isClass
          ? dirParser.parse(exp)[0]
          : dirParser.parse(name + ':' + exp)[0]
        if (isClass) {
          desc._rawClass = value
        }
        vm._bindDir(dirName, el, desc, def)
      }
    }
    return {
      def: def,
      _link: linker
    }
  }
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator (a, b) {
  a = a.def.priority || 0
  b = b.def.priority || 0
  return a > b ? 1 : -1
}

}).call(this,require('_process'))
},{"../config":19,"../directives/component":24,"../parsers/directive":56,"../parsers/template":59,"../parsers/text":60,"../util":68,"./compile-props":15,"_process":1}],17:[function(require,module,exports){
var _ = require('../util')

_.extend(exports, require('./compile'))
_.extend(exports, require('./transclude'))

},{"../util":68,"./compile":16,"./transclude":18}],18:[function(require,module,exports){
(function (process){
var _ = require('../util')
var config = require('../config')
var templateParser = require('../parsers/template')

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-repeat.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

exports.transclude = function (el, options) {
  // extract container attributes to pass them down
  // to compiler, because they need to be compiled in
  // parent scope. we are mutating the options object here
  // assuming the same object will be used for compile
  // right after this.
  if (options) {
    options._containerAttrs = extractAttrs(el)
  }
  // for template tags, what we want is its content as
  // a documentFragment (for fragment instances)
  if (_.isTemplate(el)) {
    el = templateParser.parse(el)
  }
  if (options) {
    if (options._asComponent && !options.template) {
      options.template = '<content></content>'
    }
    if (options.template) {
      options._content = _.extractContent(el)
      el = transcludeTemplate(el, options)
    }
  }
  if (el instanceof DocumentFragment) {
    // anchors for fragment instance
    // passing in `persist: true` to avoid them being
    // discarded by IE during template cloning
    _.prepend(_.createAnchor('v-start', true), el)
    el.appendChild(_.createAnchor('v-end', true))
  }
  return el
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate (el, options) {
  var template = options.template
  var frag = templateParser.parse(template, true)
  if (frag) {
    var replacer = frag.firstChild
    var tag = replacer.tagName && replacer.tagName.toLowerCase()
    if (options.replace) {
      /* istanbul ignore if */
      if (el === document.body) {
        process.env.NODE_ENV !== 'production' && _.warn(
          'You are mounting an instance with a template to ' +
          '<body>. This will replace <body> entirely. You ' +
          'should probably use `replace: false` here.'
        )
      }
      // there are many cases where the instance must
      // become a fragment instance: basically anything that
      // can create more than 1 root nodes.
      if (
        // multi-children template
        frag.childNodes.length > 1 ||
        // non-element template
        replacer.nodeType !== 1 ||
        // single nested component
        tag === 'component' ||
        _.resolveAsset(options, 'components', tag) ||
        replacer.hasAttribute(config.prefix + 'component') ||
        // element directive
        _.resolveAsset(options, 'elementDirectives', tag) ||
        // repeat block
        replacer.hasAttribute(config.prefix + 'repeat')
      ) {
        return frag
      } else {
        options._replacerAttrs = extractAttrs(replacer)
        mergeAttrs(el, replacer)
        return replacer
      }
    } else {
      el.appendChild(frag)
      return el
    }
  } else {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Invalid template option: ' + template
    )
  }
}

/**
 * Helper to extract a component container's attributes
 * into a plain object array.
 *
 * @param {Element} el
 * @return {Array}
 */

function extractAttrs (el) {
  if (el.nodeType === 1 && el.hasAttributes()) {
    return _.toArray(el.attributes)
  }
}

/**
 * Merge the attributes of two elements, and make sure
 * the class names are merged properly.
 *
 * @param {Element} from
 * @param {Element} to
 */

function mergeAttrs (from, to) {
  var attrs = from.attributes
  var i = attrs.length
  var name, value
  while (i--) {
    name = attrs[i].name
    value = attrs[i].value
    if (!to.hasAttribute(name)) {
      to.setAttribute(name, value)
    } else if (name === 'class') {
      value = to.getAttribute(name) + ' ' + value
      to.setAttribute(name, value)
    }
  }
}

}).call(this,require('_process'))
},{"../config":19,"../parsers/template":59,"../util":68,"_process":1}],19:[function(require,module,exports){
module.exports = {

  /**
   * The prefix to look for when parsing directives.
   *
   * @type {String}
   */

  prefix: 'v-',

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Strict mode.
   * Disables asset lookup in the view parent chain.
   */

  strict: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether allow observer to alter data objects'
   * __proto__.
   *
   * @type {Boolean}
   */

  proto: true,

  /**
   * Whether to parse mustache tags in templates.
   *
   * @type {Boolean}
   */

  interpolate: true,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: [
    'component',
    'directive',
    'elementDirective',
    'filter',
    'transition',
    'partial'
  ],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}

/**
 * Interpolation delimiters.
 * We need to mark the changed flag so that the text parser
 * knows it needs to recompile the regex.
 *
 * @type {Array<String>}
 */

var delimiters = ['{{', '}}']
Object.defineProperty(module.exports, 'delimiters', {
  get: function () {
    return delimiters
  },
  set: function (val) {
    delimiters = val
    this._delimitersChanged = true
  }
})

},{}],20:[function(require,module,exports){
(function (process){
var _ = require('./util')
var config = require('./config')
var Watcher = require('./watcher')
var textParser = require('./parsers/text')
var expParser = require('./parsers/expression')
function noop () {}

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {String} name
 * @param {Node} el
 * @param {Vue} vm
 * @param {Object} descriptor
 *                 - {String} expression
 *                 - {String} [arg]
 *                 - {Array<Object>} [filters]
 * @param {Object} def - directive definition object
 * @param {Vue|undefined} host - transclusion host target
 * @constructor
 */

function Directive (name, el, vm, descriptor, def, host) {
  // public
  this.name = name
  this.el = el
  this.vm = vm
  // copy descriptor props
  this.raw = descriptor.raw
  this.expression = descriptor.expression
  this.arg = descriptor.arg
  this.filters = descriptor.filters
  // private
  this._descriptor = descriptor
  this._host = host
  this._locked = false
  this._bound = false
  this._listeners = null
  // init
  this._bind(def)
}

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 *
 * @param {Object} def
 */

Directive.prototype._bind = function (def) {
  if (
    (this.name !== 'cloak' || this.vm._isCompiled) &&
    this.el && this.el.removeAttribute
  ) {
    this.el.removeAttribute(config.prefix + this.name)
  }
  if (typeof def === 'function') {
    this.update = def
  } else {
    _.extend(this, def)
  }
  this._watcherExp = this.expression
  this._checkDynamicLiteral()
  if (this.bind) {
    this.bind()
  }
  if (this._watcherExp &&
      (this.update || this.twoWay) &&
      (!this.isLiteral || this._isDynamicLiteral) &&
      !this._checkStatement()) {
    // wrapped updater for context
    var dir = this
    if (this.update) {
      this._update = function (val, oldVal) {
        if (!dir._locked) {
          dir.update(val, oldVal)
        }
      }
    } else {
      this._update = noop
    }
    // pre-process hook called before the value is piped
    // through the filters. used in v-repeat.
    var preProcess = this._preProcess
      ? _.bind(this._preProcess, this)
      : null
    var watcher = this._watcher = new Watcher(
      this.vm,
      this._watcherExp,
      this._update, // callback
      {
        filters: this.filters,
        twoWay: this.twoWay,
        deep: this.deep,
        preProcess: preProcess
      }
    )
    if (this._initValue != null) {
      watcher.set(this._initValue)
    } else if (this.update) {
      this.update(watcher.value)
    }
  }
  this._bound = true
}

/**
 * check if this is a dynamic literal binding.
 *
 * e.g. v-component="{{currentView}}"
 */

Directive.prototype._checkDynamicLiteral = function () {
  var expression = this.expression
  if (expression && this.isLiteral) {
    var tokens = textParser.parse(expression)
    if (tokens) {
      var exp = textParser.tokensToExp(tokens)
      this.expression = this.vm.$get(exp)
      this._watcherExp = exp
      this._isDynamicLiteral = true
    }
  }
}

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. v-on="click: a++"
 *
 * @return {Boolean}
 */

Directive.prototype._checkStatement = function () {
  var expression = this.expression
  if (
    expression && this.acceptStatement &&
    !expParser.isSimplePath(expression)
  ) {
    var fn = expParser.parse(expression).get
    var vm = this.vm
    var handler = function () {
      fn.call(vm, vm)
    }
    if (this.filters) {
      handler = vm._applyFilters(handler, null, this.filters)
    }
    this.update(handler)
    return true
  }
}

/**
 * Check for an attribute directive param, e.g. lazy
 *
 * @param {String} name
 * @return {String}
 */

Directive.prototype._checkParam = function (name) {
  var param = this.el.getAttribute(name)
  if (param !== null) {
    this.el.removeAttribute(name)
    param = this.vm.$interpolate(param)
  }
  return param
}

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @public
 */

Directive.prototype.set = function (value) {
  /* istanbul ignore else */
  if (this.twoWay) {
    this._withLock(function () {
      this._watcher.set(value)
    })
  } else if (process.env.NODE_ENV !== 'production') {
    _.warn(
      'Directive.set() can only be used inside twoWay' +
      'directives.'
    )
  }
}

/**
 * Execute a function while preventing that function from
 * triggering updates on this directive instance.
 *
 * @param {Function} fn
 */

Directive.prototype._withLock = function (fn) {
  var self = this
  self._locked = true
  fn.call(self)
  _.nextTick(function () {
    self._locked = false
  })
}

/**
 * Convenience method that attaches a DOM event listener
 * to the directive element and autometically tears it down
 * during unbind.
 *
 * @param {String} event
 * @param {Function} handler
 */

Directive.prototype.on = function (event, handler) {
  _.on(this.el, event, handler)
  ;(this._listeners || (this._listeners = []))
    .push([event, handler])
}

/**
 * Teardown the watcher and call unbind.
 */

Directive.prototype._teardown = function () {
  if (this._bound) {
    this._bound = false
    if (this.unbind) {
      this.unbind()
    }
    if (this._watcher) {
      this._watcher.teardown()
    }
    var listeners = this._listeners
    if (listeners) {
      for (var i = 0; i < listeners.length; i++) {
        _.off(this.el, listeners[i][0], listeners[i][1])
      }
    }
    this.vm = this.el =
    this._watcher = this._listeners = null
  }
}

module.exports = Directive

}).call(this,require('_process'))
},{"./config":19,"./parsers/expression":57,"./parsers/text":60,"./util":68,"./watcher":72,"_process":1}],21:[function(require,module,exports){
// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink'
var xlinkRE = /^xlink:/
var inputProps = {
  value: 1,
  checked: 1,
  selected: 1
}

module.exports = {

  priority: 850,

  update: function (value) {
    if (this.arg) {
      this.setAttr(this.arg, value)
    } else if (typeof value === 'object') {
      this.objectHandler(value)
    }
  },

  objectHandler: function (value) {
    // cache object attrs so that only changed attrs
    // are actually updated.
    var cache = this.cache || (this.cache = {})
    var attr, val
    for (attr in cache) {
      if (!(attr in value)) {
        this.setAttr(attr, null)
        delete cache[attr]
      }
    }
    for (attr in value) {
      val = value[attr]
      if (val !== cache[attr]) {
        cache[attr] = val
        this.setAttr(attr, val)
      }
    }
  },

  setAttr: function (attr, value) {
    if (inputProps[attr] && attr in this.el) {
      if (!this.valueRemoved) {
        this.el.removeAttribute(attr)
        this.valueRemoved = true
      }
      this.el[attr] = value
    } else if (value != null && value !== false) {
      if (xlinkRE.test(attr)) {
        this.el.setAttributeNS(xlinkNS, attr, value)
      } else {
        this.el.setAttribute(attr, value)
      }
    } else {
      this.el.removeAttribute(attr)
    }
  }
}

},{}],22:[function(require,module,exports){
var _ = require('../util')
var addClass = _.addClass
var removeClass = _.removeClass

module.exports = {

  bind: function () {
    // interpolations like class="{{abc}}" are converted
    // to v-class, and we need to remove the raw,
    // uninterpolated className at binding time.
    var raw = this._descriptor._rawClass
    if (raw) {
      this.prevKeys = raw.trim().split(/\s+/)
    }
  },

  update: function (value) {
    if (this.arg) {
      // single toggle
      if (value) {
        addClass(this.el, this.arg)
      } else {
        removeClass(this.el, this.arg)
      }
    } else {
      if (value && typeof value === 'string') {
        this.handleObject(stringToObject(value))
      } else if (_.isPlainObject(value)) {
        this.handleObject(value)
      } else {
        this.cleanup()
      }
    }
  },

  handleObject: function (value) {
    this.cleanup(value)
    var keys = this.prevKeys = Object.keys(value)
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      if (value[key]) {
        addClass(this.el, key)
      } else {
        removeClass(this.el, key)
      }
    }
  },

  cleanup: function (value) {
    if (this.prevKeys) {
      var i = this.prevKeys.length
      while (i--) {
        var key = this.prevKeys[i]
        if (!value || !value.hasOwnProperty(key)) {
          removeClass(this.el, key)
        }
      }
    }
  }
}

function stringToObject (value) {
  var res = {}
  var keys = value.trim().split(/\s+/)
  var i = keys.length
  while (i--) {
    res[keys[i]] = true
  }
  return res
}

},{"../util":68}],23:[function(require,module,exports){
var config = require('../config')

module.exports = {
  bind: function () {
    var el = this.el
    this.vm.$once('hook:compiled', function () {
      el.removeAttribute(config.prefix + 'cloak')
    })
  }
}

},{"../config":19}],24:[function(require,module,exports){
(function (process){
var _ = require('../util')
var config = require('../config')
var templateParser = require('../parsers/template')

module.exports = {

  isLiteral: true,

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   v-component="comp"
   *
   * - dynamic:
   *   v-component="{{currentView}}"
   */

  bind: function () {
    if (!this.el.__vue__) {
      // create a ref anchor
      this.anchor = _.createAnchor('v-component')
      _.replace(this.el, this.anchor)
      // check keep-alive options.
      // If yes, instead of destroying the active vm when
      // hiding (v-if) or switching (dynamic literal) it,
      // we simply remove it from the DOM and save it in a
      // cache object, with its constructor id as the key.
      this.keepAlive = this._checkParam('keep-alive') != null
      // wait for event before insertion
      this.waitForEvent = this._checkParam('wait-for')
      // check ref
      this.refID = this._checkParam(config.prefix + 'ref')
      if (this.keepAlive) {
        this.cache = {}
      }
      // check inline-template
      if (this._checkParam('inline-template') !== null) {
        // extract inline template as a DocumentFragment
        this.template = _.extractContent(this.el, true)
      }
      // component resolution related state
      this.pendingComponentCb =
      this.Component = null
      // transition related state
      this.pendingRemovals = 0
      this.pendingRemovalCb = null
      // if static, build right now.
      if (!this._isDynamicLiteral) {
        this.resolveComponent(this.expression, _.bind(this.initStatic, this))
      } else {
        // check dynamic component params
        this.transMode = this._checkParam('transition-mode')
      }
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'cannot mount component "' + this.expression + '" ' +
        'on already mounted element: ' + this.el
      )
    }
  },

  /**
   * Initialize a static component.
   */

  initStatic: function () {
    // wait-for
    var anchor = this.anchor
    var options
    var waitFor = this.waitForEvent
    if (waitFor) {
      options = {
        created: function () {
          this.$once(waitFor, function () {
            this.$before(anchor)
          })
        }
      }
    }
    var child = this.build(options)
    this.setCurrent(child)
    if (!this.waitForEvent) {
      child.$before(anchor)
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. v-component="{{view}}"
   */

  update: function (value) {
    this.setComponent(value)
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function (value, cb) {
    this.invalidatePending()
    if (!value) {
      // just remove current
      this.unbuild(true)
      this.remove(this.childVM, cb)
      this.unsetCurrent()
    } else {
      this.resolveComponent(value, _.bind(function () {
        this.unbuild(true)
        var options
        var self = this
        var waitFor = this.waitForEvent
        if (waitFor) {
          options = {
            created: function () {
              this.$once(waitFor, function () {
                self.waitingFor = null
                self.transition(this, cb)
              })
            }
          }
        }
        var cached = this.getCached()
        var newComponent = this.build(options)
        if (!waitFor || cached) {
          this.transition(newComponent, cb)
        } else {
          this.waitingFor = newComponent
        }
      }, this))
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   */

  resolveComponent: function (id, cb) {
    var self = this
    this.pendingComponentCb = _.cancellable(function (Component) {
      self.Component = Component
      cb()
    })
    this.vm._resolveComponent(id, this.pendingComponentCb)
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function () {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel()
      this.pendingComponentCb = null
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function (extraOptions) {
    var cached = this.getCached()
    if (cached) {
      return cached
    }
    if (this.Component) {
      // default options
      var options = {
        el: templateParser.clone(this.el),
        template: this.template,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.template,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        _context: this.vm
      }
      // extra options
      if (extraOptions) {
        _.extend(options, extraOptions)
      }
      var parent = this._host || this.vm
      var child = parent.$addChild(options, this.Component)
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child
      }
      return child
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function () {
    return this.keepAlive && this.cache[this.Component.cid]
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function (defer) {
    if (this.waitingFor) {
      this.waitingFor.$destroy()
      this.waitingFor = null
    }
    var child = this.childVM
    if (!child || this.keepAlive) {
      return
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer)
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function (child, cb) {
    var keepAlive = this.keepAlive
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++
      this.pendingRemovalCb = cb
      var self = this
      child.$remove(function () {
        self.pendingRemovals--
        if (!keepAlive) child._cleanup()
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb()
          self.pendingRemovalCb = null
        }
      })
    } else if (cb) {
      cb()
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function (target, cb) {
    var self = this
    var current = this.childVM
    this.setCurrent(target)
    switch (self.transMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb)
        })
        break
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb)
        })
        break
      default:
        self.remove(current)
        target.$before(self.anchor, cb)
    }
  },

  /**
   * Set childVM and parent ref
   */

  setCurrent: function (child) {
    this.unsetCurrent()
    this.childVM = child
    var refID = child._refID || this.refID
    if (refID) {
      this.vm.$[refID] = child
    }
  },

  /**
   * Unset childVM and parent ref
   */

  unsetCurrent: function () {
    var child = this.childVM
    this.childVM = null
    var refID = (child && child._refID) || this.refID
    if (refID) {
      this.vm.$[refID] = null
    }
  },

  /**
   * Unbind.
   */

  unbind: function () {
    this.invalidatePending()
    // Do not defer cleanup when unbinding
    this.unbuild()
    this.unsetCurrent()
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy()
      }
      this.cache = null
    }
  }
}

}).call(this,require('_process'))
},{"../config":19,"../parsers/template":59,"../util":68,"_process":1}],25:[function(require,module,exports){
module.exports = {

  isLiteral: true,

  bind: function () {
    this.vm.$$[this.expression] = this.el
  },

  unbind: function () {
    delete this.vm.$$[this.expression]
  }
}

},{}],26:[function(require,module,exports){
var _ = require('../util')
var templateParser = require('../parsers/template')

module.exports = {

  bind: function () {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = []
      // replace the placeholder with proper anchor
      this.anchor = _.createAnchor('v-html')
      _.replace(this.el, this.anchor)
    }
  },

  update: function (value) {
    value = _.toString(value)
    if (this.nodes) {
      this.swap(value)
    } else {
      this.el.innerHTML = value
    }
  },

  swap: function (value) {
    // remove old nodes
    var i = this.nodes.length
    while (i--) {
      _.remove(this.nodes[i])
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = templateParser.parse(value, true, true)
    // save a reference to these nodes so we can remove later
    this.nodes = _.toArray(frag.childNodes)
    _.before(frag, this.anchor)
  }
}

},{"../parsers/template":59,"../util":68}],27:[function(require,module,exports){
(function (process){
var _ = require('../util')
var compiler = require('../compiler')
var templateParser = require('../parsers/template')
var transition = require('../transition')
var Cache = require('../cache')
var cache = new Cache(1000)

module.exports = {

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      this.start = _.createAnchor('v-if-start')
      this.end = _.createAnchor('v-if-end')
      _.replace(el, this.end)
      _.before(this.start, this.end)
      if (_.isTemplate(el)) {
        this.template = templateParser.parse(el, true)
      } else {
        this.template = document.createDocumentFragment()
        this.template.appendChild(templateParser.clone(el))
      }
      // compile the nested partial
      var cacheId = (this.vm.constructor.cid || '') + el.outerHTML
      this.linker = cache.get(cacheId)
      if (!this.linker) {
        this.linker = compiler.compile(
          this.template,
          this.vm.$options,
          true // partial
        )
        cache.put(cacheId, this.linker)
      }
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'v-if="' + this.expression + '" cannot be ' +
        'used on an instance root element.'
      )
      this.invalid = true
    }
  },

  update: function (value) {
    if (this.invalid) return
    if (value) {
      // avoid duplicate compiles, since update() can be
      // called with different truthy values
      if (!this.unlink) {
        this.link(
          templateParser.clone(this.template),
          this.linker
        )
      }
    } else {
      this.teardown()
    }
  },

  link: function (frag, linker) {
    var vm = this.vm
    this.unlink = linker(vm, frag, this._host /* important */)
    transition.blockAppend(frag, this.end, vm)
    // call attached for all the child components created
    // during the compilation
    if (_.inDoc(vm.$el)) {
      var children = this.getContainedComponents()
      if (children) children.forEach(callAttach)
    }
  },

  teardown: function () {
    if (!this.unlink) return
    // collect children beforehand
    var children
    if (_.inDoc(this.vm.$el)) {
      children = this.getContainedComponents()
    }
    transition.blockRemove(this.start, this.end, this.vm)
    if (children) children.forEach(callDetach)
    this.unlink()
    this.unlink = null
  },

  getContainedComponents: function () {
    var vm = this._host || this.vm
    var start = this.start.nextSibling
    var end = this.end

    function contains (c) {
      var cur = start
      var next
      while (next !== end) {
        next = cur.nextSibling
        if (
          cur === c.$el ||
          cur.contains && cur.contains(c.$el)
        ) {
          return true
        }
        cur = next
      }
      return false
    }

    return vm.$children.length &&
      vm.$children.filter(contains)
  },

  unbind: function () {
    if (this.unlink) this.unlink()
  }

}

function callAttach (child) {
  if (!child._isAttached) {
    child._callHook('attached')
  }
}

function callDetach (child) {
  if (child._isAttached) {
    child._callHook('detached')
  }
}

}).call(this,require('_process'))
},{"../cache":14,"../compiler":17,"../parsers/template":59,"../transition":61,"../util":68,"_process":1}],28:[function(require,module,exports){
// manipulation directives
exports.text = require('./text')
exports.html = require('./html')
exports.attr = require('./attr')
exports.show = require('./show')
exports['class'] = require('./class')
exports.el = require('./el')
exports.ref = require('./ref')
exports.cloak = require('./cloak')
exports.style = require('./style')
exports.transition = require('./transition')

// event listener directives
exports.on = require('./on')
exports.model = require('./model')

// logic control directives
exports.repeat = require('./repeat')
exports['if'] = require('./if')

// internal directives that should not be used directly
// but we still want to expose them for advanced usage.
exports._component = require('./component')
exports._prop = require('./prop')

},{"./attr":21,"./class":22,"./cloak":23,"./component":24,"./el":25,"./html":26,"./if":27,"./model":30,"./on":34,"./prop":35,"./ref":36,"./repeat":37,"./show":38,"./style":39,"./text":40,"./transition":41}],29:[function(require,module,exports){
var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var trueExp = this._checkParam('true-exp')
    var falseExp = this._checkParam('false-exp')

    this._matchValue = function (value) {
      if (trueExp !== null) {
        return _.looseEqual(value, self.vm.$eval(trueExp))
      } else {
        return !!value
      }
    }

    function getValue () {
      var val = el.checked
      if (val && trueExp !== null) {
        val = self.vm.$eval(trueExp)
      }
      if (!val && falseExp !== null) {
        val = self.vm.$eval(falseExp)
      }
      return val
    }

    this.on('change', function () {
      self.set(getValue())
    })

    if (el.checked) {
      this._initValue = getValue()
    }
  },

  update: function (value) {
    this.el.checked = this._matchValue(value)
  }
}

},{"../../util":68}],30:[function(require,module,exports){
(function (process){
var _ = require('../../util')

var handlers = {
  text: require('./text'),
  radio: require('./radio'),
  select: require('./select'),
  checkbox: require('./checkbox')
}

module.exports = {

  priority: 800,
  twoWay: true,
  handlers: handlers,

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   *     - TODO: more types may be supplied as a plugin
   */

  bind: function () {
    // friendly warning...
    this.checkFilters()
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'It seems you are using a read-only filter with ' +
        'v-model. You might want to use a two-way filter ' +
        'to ensure correct behavior.'
      )
    }
    var el = this.el
    var tag = el.tagName
    var handler
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text
    } else if (tag === 'SELECT') {
      handler = handlers.select
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'v-model does not support element type: ' + tag
      )
      return
    }
    el.__v_model = this
    handler.bind.call(this)
    this.update = handler.update
    this._unbind = handler.unbind
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters: function () {
    var filters = this.filters
    if (!filters) return
    var i = filters.length
    while (i--) {
      var filter = _.resolveAsset(this.vm.$options, 'filters', filters[i].name)
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true
      }
      if (filter.write) {
        this.hasWrite = true
      }
    }
  },

  unbind: function () {
    this.el.__v_model = null
    this._unbind && this._unbind()
  }
}

}).call(this,require('_process'))
},{"../../util":68,"./checkbox":29,"./radio":31,"./select":32,"./text":33,"_process":1}],31:[function(require,module,exports){
var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var number = this._checkParam('number') != null
    var expression = this._checkParam('exp')

    this.getValue = function () {
      var val = el.value
      if (number) {
        val = _.toNumber(val)
      } else if (expression !== null) {
        val = self.vm.$eval(expression)
      }
      return val
    }

    this.on('change', function () {
      self.set(self.getValue())
    })

    if (el.checked) {
      this._initValue = this.getValue()
    }
  },

  update: function (value) {
    this.el.checked = _.looseEqual(value, this.getValue())
  }
}

},{"../../util":68}],32:[function(require,module,exports){
(function (process){
var _ = require('../../util')
var Watcher = require('../../watcher')
var dirParser = require('../../parsers/directive')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get())
      }
    }

    // check options param
    var optionsParam = this._checkParam('options')
    if (optionsParam) {
      initOptions.call(this, optionsParam)
    }
    this.number = this._checkParam('number') != null
    this.multiple = el.hasAttribute('multiple')

    // attach listener
    this.on('change', function () {
      var value = getValue(el, self.multiple)
      value = self.number
        ? _.isArray(value)
          ? value.map(_.toNumber)
          : _.toNumber(value)
        : value
      self.set(value)
    })

    // check initial value (inline selected attribute)
    checkInitialValue.call(this)

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', this.forceUpdate)
  },

  update: function (value) {
    var el = this.el
    el.selectedIndex = -1
    if (value == null) {
      if (this.defaultOption) {
        this.defaultOption.selected = true
      }
      return
    }
    var multi = this.multiple && _.isArray(value)
    var options = el.options
    var i = options.length
    var op, val
    while (i--) {
      op = options[i]
      val = op.hasOwnProperty('_value')
        ? op._value
        : op.value
      /* eslint-disable eqeqeq */
      op.selected = multi
        ? indexOf(value, val) > -1
        : _.looseEqual(value, val)
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function () {
    this.vm.$off('hook:attached', this.forceUpdate)
    if (this.optionWatcher) {
      this.optionWatcher.teardown()
    }
  }
}

/**
 * Initialize the option list from the param.
 *
 * @param {String} expression
 */

function initOptions (expression) {
  var self = this
  var el = self.el
  var defaultOption = self.defaultOption = self.el.options[0]
  var descriptor = dirParser.parse(expression)[0]
  function optionUpdateWatcher (value) {
    if (_.isArray(value)) {
      // clear old options.
      // cannot reset innerHTML here because IE family get
      // confused during compilation.
      var i = el.options.length
      while (i--) {
        var option = el.options[i]
        if (option !== defaultOption) {
          var parentNode = option.parentNode
          if (parentNode === el) {
            parentNode.removeChild(option)
          } else {
            el.removeChild(parentNode)
            i = el.options.length
          }
        }
      }
      buildOptions(el, value)
      self.forceUpdate()
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Invalid options value for v-model: ' + value
      )
    }
  }
  this.optionWatcher = new Watcher(
    this.vm,
    descriptor.expression,
    optionUpdateWatcher,
    {
      deep: true,
      filters: descriptor.filters
    }
  )
  // update with initial value
  optionUpdateWatcher(this.optionWatcher.value)
}

/**
 * Build up option elements. IE9 doesn't create options
 * when setting innerHTML on <select> elements, so we have
 * to use DOM API here.
 *
 * @param {Element} parent - a <select> or an <optgroup>
 * @param {Array} options
 */

function buildOptions (parent, options) {
  var op, el
  for (var i = 0, l = options.length; i < l; i++) {
    op = options[i]
    if (!op.options) {
      el = document.createElement('option')
      if (typeof op === 'string' || typeof op === 'number') {
        el.text = el.value = op
      } else {
        if (op.value != null && !_.isObject(op.value)) {
          el.value = op.value
        }
        // object values gets serialized when set as value,
        // so we store the raw value as a different property
        el._value = op.value
        el.text = op.text || ''
        if (op.disabled) {
          el.disabled = true
        }
      }
    } else {
      el = document.createElement('optgroup')
      el.label = op.label
      buildOptions(el, op.options)
    }
    parent.appendChild(el)
  }
}

/**
 * Check the initial value for selected options.
 */

function checkInitialValue () {
  var initValue
  var options = this.el.options
  for (var i = 0, l = options.length; i < l; i++) {
    if (options[i].hasAttribute('selected')) {
      if (this.multiple) {
        (initValue || (initValue = []))
          .push(options[i].value)
      } else {
        initValue = options[i].value
      }
    }
  }
  if (typeof initValue !== 'undefined') {
    this._initValue = this.number
      ? _.toNumber(initValue)
      : initValue
  }
}

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @return {Array|*}
 */

function getValue (el, multi) {
  var res = multi ? [] : null
  var op, val
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i]
    if (op.selected) {
      val = op.hasOwnProperty('_value')
        ? op._value
        : op.value
      if (multi) {
        res.push(val)
      } else {
        return val
      }
    }
  }
  return res
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf (arr, val) {
  var i = arr.length
  while (i--) {
    if (_.looseEqual(arr[i], val)) {
      return i
    }
  }
  return -1
}

}).call(this,require('_process'))
},{"../../parsers/directive":56,"../../util":68,"../../watcher":72,"_process":1}],33:[function(require,module,exports){
var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var isRange = el.type === 'range'

    // check params
    // - lazy: update model on "change" instead of "input"
    var lazy = this._checkParam('lazy') != null
    // - number: cast value into number when updating model.
    var number = this._checkParam('number') != null
    // - debounce: debounce the input listener
    var debounce = parseInt(this._checkParam('debounce'), 10)

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false
    if (!_.isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true
      })
      this.on('compositionend', function () {
        composing = false
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener()
        }
      })
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false
    if (!isRange) {
      this.on('focus', function () {
        self.focused = true
      })
      this.on('blur', function () {
        self.focused = false
        self.listener()
      })
    }

    // Now attach the main listener
    this.listener = function () {
      if (composing) return
      var val = number || isRange
        ? _.toNumber(el.value)
        : el.value
      self.set(val)
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      _.nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value)
        }
      })
    }
    if (debounce) {
      this.listener = _.debounce(this.listener, debounce)
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function'
    if (this.hasjQuery) {
      jQuery(el).on('change', this.listener)
      if (!lazy) {
        jQuery(el).on('input', this.listener)
      }
    } else {
      this.on('change', this.listener)
      if (!lazy) {
        this.on('input', this.listener)
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && _.isIE9) {
      this.on('cut', function () {
        _.nextTick(self.listener)
      })
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener()
        }
      })
    }

    // set initial value if present
    if (
      el.hasAttribute('value') ||
      (el.tagName === 'TEXTAREA' && el.value.trim())
    ) {
      this._initValue = number
        ? _.toNumber(el.value)
        : el.value
    }
  },

  update: function (value) {
    this.el.value = _.toString(value)
  },

  unbind: function () {
    var el = this.el
    if (this.hasjQuery) {
      jQuery(el).off('change', this.listener)
      jQuery(el).off('input', this.listener)
    }
  }
}

},{"../../util":68}],34:[function(require,module,exports){
(function (process){
var _ = require('../util')

module.exports = {

  acceptStatement: true,
  priority: 700,

  bind: function () {
    // deal with iframes
    if (
      this.el.tagName === 'IFRAME' &&
      this.arg !== 'load'
    ) {
      var self = this
      this.iframeBind = function () {
        _.on(self.el.contentWindow, self.arg, self.handler)
      }
      this.on('load', this.iframeBind)
    }
  },

  update: function (handler) {
    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Directive v-on="' + this.arg + ': ' +
        this.expression + '" expects a function value, ' +
        'got ' + handler
      )
      return
    }
    this.reset()
    var vm = this.vm
    this.handler = function (e) {
      e.targetVM = vm
      vm.$event = e
      var res = handler(e)
      vm.$event = null
      return res
    }
    if (this.iframeBind) {
      this.iframeBind()
    } else {
      _.on(this.el, this.arg, this.handler)
    }
  },

  reset: function () {
    var el = this.iframeBind
      ? this.el.contentWindow
      : this.el
    if (this.handler) {
      _.off(el, this.arg, this.handler)
    }
  },

  unbind: function () {
    this.reset()
  }
}

}).call(this,require('_process'))
},{"../util":68,"_process":1}],35:[function(require,module,exports){
// NOTE: the prop internal directive is compiled and linked
// during _initScope(), before the created hook is called.
// The purpose is to make the initial prop values available
// inside `created` hooks and `data` functions.

var _ = require('../util')
var Watcher = require('../watcher')
var bindingModes = require('../config')._propBindingModes

module.exports = {

  bind: function () {

    var child = this.vm
    var parent = child._context
    // passed in from compiler directly
    var prop = this._descriptor
    var childKey = prop.path
    var parentKey = prop.parentPath

    this.parentWatcher = new Watcher(
      parent,
      parentKey,
      function (val) {
        if (_.assertProp(prop, val)) {
          child[childKey] = val
        }
      }, { sync: true }
    )

    // set the child initial value.
    var value = this.parentWatcher.value
    if (childKey === '$data') {
      child._data = value
    } else {
      _.initProp(child, prop, value)
    }

    // setup two-way binding
    if (prop.mode === bindingModes.TWO_WAY) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this
      child.$once('hook:created', function () {
        self.childWatcher = new Watcher(
          child,
          childKey,
          function (val) {
            parent.$set(parentKey, val)
          }, { sync: true }
        )
      })
    }
  },

  unbind: function () {
    this.parentWatcher.teardown()
    if (this.childWatcher) {
      this.childWatcher.teardown()
    }
  }
}

},{"../config":19,"../util":68,"../watcher":72}],36:[function(require,module,exports){
(function (process){
var _ = require('../util')

module.exports = {

  isLiteral: true,

  bind: function () {
    var vm = this.el.__vue__
    if (!vm) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'v-ref should only be used on a component root element.'
      )
      return
    }
    // If we get here, it means this is a `v-ref` on a
    // child, because parent scope `v-ref` is stripped in
    // `v-component` already. So we just record our own ref
    // here - it will overwrite parent ref in `v-component`,
    // if any.
    vm._refID = this.expression
  }
}

}).call(this,require('_process'))
},{"../util":68,"_process":1}],37:[function(require,module,exports){
(function (process){
var _ = require('../util')
var config = require('../config')
var isObject = _.isObject
var isPlainObject = _.isPlainObject
var textParser = require('../parsers/text')
var expParser = require('../parsers/expression')
var templateParser = require('../parsers/template')
var compiler = require('../compiler')
var uid = 0

// async component resolution states
var UNRESOLVED = 0
var PENDING = 1
var RESOLVED = 2
var ABORTED = 3

module.exports = {

  /**
   * Setup.
   */

  bind: function () {

    // some helpful tips...
    /* istanbul ignore if */
    if (
      process.env.NODE_ENV !== 'production' &&
      this.el.tagName === 'OPTION' &&
      this.el.parentNode && this.el.parentNode.__v_model
    ) {
      _.warn(
        'Don\'t use v-repeat for v-model options; ' +
        'use the `options` param instead: ' +
        'http://vuejs.org/guide/forms.html#Dynamic_Select_Options'
      )
    }

    // support for item in array syntax
    var inMatch = this.expression.match(/(.*) in (.*)/)
    if (inMatch) {
      this.arg = inMatch[1]
      this._watcherExp = inMatch[2]
    }
    // uid as a cache identifier
    this.id = '__v_repeat_' + (++uid)

    // setup anchor nodes
    this.start = _.createAnchor('v-repeat-start')
    this.end = _.createAnchor('v-repeat-end')
    _.replace(this.el, this.end)
    _.before(this.start, this.end)

    // check if this is a block repeat
    this.template = _.isTemplate(this.el)
      ? templateParser.parse(this.el, true)
      : this.el

    // check for trackby param
    this.idKey = this._checkParam('track-by')
    // check for transition stagger
    var stagger = +this._checkParam('stagger')
    this.enterStagger = +this._checkParam('enter-stagger') || stagger
    this.leaveStagger = +this._checkParam('leave-stagger') || stagger

    // check for v-ref/v-el
    this.refID = this._checkParam(config.prefix + 'ref')
    this.elID = this._checkParam(config.prefix + 'el')

    // check other directives that need to be handled
    // at v-repeat level
    this.checkIf()
    this.checkComponent()

    // create cache object
    this.cache = Object.create(null)
  },

  /**
   * Warn against v-if usage.
   */

  checkIf: function () {
    if (_.attr(this.el, 'if') !== null) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Don\'t use v-if with v-repeat. ' +
        'Use v-show or the "filterBy" filter instead.'
      )
    }
  },

  /**
   * Check the component constructor to use for repeated
   * instances. If static we resolve it now, otherwise it
   * needs to be resolved at build time with actual data.
   */

  checkComponent: function () {
    this.componentState = UNRESOLVED
    var options = this.vm.$options
    var id = _.checkComponent(this.el, options)
    if (!id) {
      // default constructor
      this.Component = _.Vue
      // inline repeats should inherit
      this.inline = true
      // important: transclude with no options, just
      // to ensure block start and block end
      this.template = compiler.transclude(this.template)
      var copy = _.extend({}, options)
      copy._asComponent = false
      this._linkFn = compiler.compile(this.template, copy)
    } else {
      this.Component = null
      this.asComponent = true
      // check inline-template
      if (this._checkParam('inline-template') !== null) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = _.extractContent(this.el, true)
      }
      var tokens = textParser.parse(id)
      if (tokens) {
        // dynamic component to be resolved later
        var componentExp = textParser.tokensToExp(tokens)
        this.componentGetter = expParser.parse(componentExp).get
      } else {
        // static
        this.componentId = id
        this.pendingData = null
      }
    }
  },

  resolveComponent: function () {
    this.componentState = PENDING
    this.vm._resolveComponent(this.componentId, _.bind(function (Component) {
      if (this.componentState === ABORTED) {
        return
      }
      this.Component = Component
      this.componentState = RESOLVED
      this.realUpdate(this.pendingData)
      this.pendingData = null
    }, this))
  },

  /**
   * Resolve a dynamic component to use for an instance.
   * The tricky part here is that there could be dynamic
   * components depending on instance data.
   *
   * @param {Object} data
   * @param {Object} meta
   * @return {Function}
   */

  resolveDynamicComponent: function (data, meta) {
    // create a temporary context object and copy data
    // and meta properties onto it.
    // use _.define to avoid accidentally overwriting scope
    // properties.
    var context = Object.create(this.vm)
    var key
    for (key in data) {
      _.define(context, key, data[key])
    }
    for (key in meta) {
      _.define(context, key, meta[key])
    }
    var id = this.componentGetter.call(context, context)
    var Component = _.resolveAsset(this.vm.$options, 'components', id)
    if (process.env.NODE_ENV !== 'production') {
      _.assertAsset(Component, 'component', id)
    }
    if (!Component.options) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Async resolution is not supported for v-repeat ' +
        '+ dynamic component. (component: ' + id + ')'
      )
      return _.Vue
    }
    return Component
  },

  /**
   * Update.
   * This is called whenever the Array mutates. If we have
   * a component, we might need to wait for it to resolve
   * asynchronously.
   *
   * @param {Array|Number|String} data
   */

  update: function (data) {
    if (process.env.NODE_ENV !== 'production' && !_.isArray(data)) {
      _.warn(
        'v-repeat pre-converts Objects into Arrays, and ' +
        'v-repeat filters should always return Arrays.'
      )
    }
    if (this.componentId) {
      var state = this.componentState
      if (state === UNRESOLVED) {
        this.pendingData = data
        // once resolved, it will call realUpdate
        this.resolveComponent()
      } else if (state === PENDING) {
        this.pendingData = data
      } else if (state === RESOLVED) {
        this.realUpdate(data)
      }
    } else {
      this.realUpdate(data)
    }
  },

  /**
   * The real update that actually modifies the DOM.
   *
   * @param {Array|Number|String} data
   */

  realUpdate: function (data) {
    this.vms = this.diff(data, this.vms)
    // update v-ref
    if (this.refID) {
      this.vm.$[this.refID] = this.converted
        ? toRefObject(this.vms)
        : this.vms
    }
    if (this.elID) {
      this.vm.$$[this.elID] = this.vms.map(function (vm) {
        return vm.$el
      })
    }
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   * @param {Array} oldVms
   * @return {Array}
   */

  diff: function (data, oldVms) {
    var idKey = this.idKey
    var converted = this.converted
    var start = this.start
    var end = this.end
    var inDoc = _.inDoc(start)
    var alias = this.arg
    var init = !oldVms
    var vms = new Array(data.length)
    var obj, raw, vm, i, l, primitive
    // First pass, go through the new Array and fill up
    // the new vms array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      obj = data[i]
      raw = converted ? obj.$value : obj
      primitive = !isObject(raw)
      vm = !init && this.getVm(raw, i, converted ? obj.$key : null)
      if (vm) { // reusable instance

        if (process.env.NODE_ENV !== 'production' && vm._reused) {
          _.warn(
            'Duplicate objects found in v-repeat="' + this.expression + '": ' +
            JSON.stringify(raw)
          )
        }

        vm._reused = true
        vm.$index = i // update $index
        // update data for track-by or object repeat,
        // since in these two cases the data is replaced
        // rather than mutated.
        if (idKey || converted || primitive) {
          if (alias) {
            vm[alias] = raw
          } else if (_.isPlainObject(raw)) {
            vm.$data = raw
          } else {
            vm.$value = raw
          }
        }
      } else { // new instance
        vm = this.build(obj, i, true)
        vm._reused = false
      }
      vms[i] = vm
      // insert if this is first run
      if (init) {
        vm.$before(end)
      }
    }
    // if this is the first run, we're done.
    if (init) {
      return vms
    }
    // Second pass, go through the old vm instances and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0
    var totalRemoved = oldVms.length - vms.length
    for (i = 0, l = oldVms.length; i < l; i++) {
      vm = oldVms[i]
      if (!vm._reused) {
        this.uncacheVm(vm)
        vm.$destroy(false, true) // defer cleanup until removal
        this.remove(vm, removalIndex++, totalRemoved, inDoc)
      }
    }
    // final pass, move/insert new instances into the
    // right place.
    var targetPrev, prevEl, currentPrev
    var insertionIndex = 0
    for (i = 0, l = vms.length; i < l; i++) {
      vm = vms[i]
      // this is the vm that we should be after
      targetPrev = vms[i - 1]
      prevEl = targetPrev
        ? targetPrev._staggerCb
          ? targetPrev._staggerAnchor
          : targetPrev._fragmentEnd || targetPrev.$el
        : start
      if (vm._reused && !vm._staggerCb) {
        currentPrev = findPrevVm(vm, start, this.id)
        if (currentPrev !== targetPrev) {
          this.move(vm, prevEl)
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(vm, insertionIndex++, prevEl, inDoc)
      }
      vm._reused = false
    }
    return vms
  },

  /**
   * Build a new instance and cache it.
   *
   * @param {Object} data
   * @param {Number} index
   * @param {Boolean} needCache
   */

  build: function (data, index, needCache) {
    var meta = { $index: index }
    if (this.converted) {
      meta.$key = data.$key
    }
    var raw = this.converted ? data.$value : data
    var alias = this.arg
    if (alias) {
      data = {}
      data[alias] = raw
    } else if (!isPlainObject(raw)) {
      // non-object values
      data = {}
      meta.$value = raw
    } else {
      // default
      data = raw
    }
    // resolve constructor
    var Component = this.Component || this.resolveDynamicComponent(data, meta)
    var parent = this._host || this.vm
    var vm = parent.$addChild({
      el: templateParser.clone(this.template),
      data: data,
      inherit: this.inline,
      template: this.inlineTemplate,
      // repeater meta, e.g. $index, $key
      _meta: meta,
      // mark this as an inline-repeat instance
      _repeat: this.inline,
      // is this a component?
      _asComponent: this.asComponent,
      // linker cachable if no inline-template
      _linkerCachable: !this.inlineTemplate && Component !== _.Vue,
      // pre-compiled linker for simple repeats
      _linkFn: this._linkFn,
      // identifier, shows that this vm belongs to this collection
      _repeatId: this.id,
      // transclusion content owner
      _context: this.vm
    }, Component)
    // cache instance
    if (needCache) {
      this.cacheVm(raw, vm, index, this.converted ? meta.$key : null)
    }
    // sync back changes for two-way bindings of primitive values
    var dir = this
    if (this.rawType === 'object' && isPrimitive(raw)) {
      vm.$watch(alias || '$value', function (val) {
        if (dir.filters) {
          process.env.NODE_ENV !== 'production' && _.warn(
            'You seem to be mutating the $value reference of ' +
            'a v-repeat instance (likely through v-model) ' +
            'and filtering the v-repeat at the same time. ' +
            'This will not work properly with an Array of ' +
            'primitive values. Please use an Array of ' +
            'Objects instead.'
          )
        }
        dir._withLock(function () {
          if (dir.converted) {
            dir.rawValue[vm.$key] = val
          } else {
            dir.rawValue.$set(vm.$index, val)
          }
        })
      })
    }
    return vm
  },

  /**
   * Unbind, teardown everything
   */

  unbind: function () {
    this.componentState = ABORTED
    if (this.refID) {
      this.vm.$[this.refID] = null
    }
    if (this.vms) {
      var i = this.vms.length
      var vm
      while (i--) {
        vm = this.vms[i]
        this.uncacheVm(vm)
        vm.$destroy()
      }
    }
  },

  /**
   * Cache a vm instance based on its data.
   *
   * If the data is an object, we save the vm's reference on
   * the data object as a hidden property. Otherwise we
   * cache them in an object and for each primitive value
   * there is an array in case there are duplicates.
   *
   * @param {Object} data
   * @param {Vue} vm
   * @param {Number} index
   * @param {String} [key]
   */

  cacheVm: function (data, vm, index, key) {
    var idKey = this.idKey
    var cache = this.cache
    var primitive = !isObject(data)
    var id
    if (key || idKey || primitive) {
      id = idKey
        ? idKey === '$index'
          ? index
          : data[idKey]
        : (key || index)
      if (!cache[id]) {
        cache[id] = vm
      } else if (!primitive && idKey !== '$index') {
        process.env.NODE_ENV !== 'production' && _.warn(
          'Duplicate objects with the same track-by key in v-repeat: ' + id
        )
      }
    } else {
      id = this.id
      if (data.hasOwnProperty(id)) {
        if (data[id] === null) {
          data[id] = vm
        } else {
          process.env.NODE_ENV !== 'production' && _.warn(
            'Duplicate objects found in v-repeat="' + this.expression + '": ' +
            JSON.stringify(data)
          )
        }
      } else {
        _.define(data, id, vm)
      }
    }
    vm._raw = data
  },

  /**
   * Try to get a cached instance from a piece of data.
   *
   * @param {Object} data
   * @param {Number} index
   * @param {String} [key]
   * @return {Vue|undefined}
   */

  getVm: function (data, index, key) {
    var idKey = this.idKey
    var primitive = !isObject(data)
    if (key || idKey || primitive) {
      var id = idKey
        ? idKey === '$index'
          ? index
          : data[idKey]
        : (key || index)
      return this.cache[id]
    } else {
      return data[this.id]
    }
  },

  /**
   * Delete a cached vm instance.
   *
   * @param {Vue} vm
   */

  uncacheVm: function (vm) {
    var data = vm._raw
    var idKey = this.idKey
    var index = vm.$index
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = vm.hasOwnProperty('$key') && vm.$key
    var primitive = !isObject(data)
    if (idKey || key || primitive) {
      var id = idKey
        ? idKey === '$index'
          ? index
          : data[idKey]
        : (key || index)
      this.cache[id] = null
    } else {
      data[this.id] = null
      vm._raw = null
    }
  },

  /**
   * Insert an instance.
   *
   * @param {Vue} vm
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDoc
   */

  insert: function (vm, index, prevEl, inDoc) {
    if (vm._staggerCb) {
      vm._staggerCb.cancel()
      vm._staggerCb = null
    }
    var staggerAmount = this.getStagger(vm, index, null, 'enter')
    if (inDoc && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = vm._staggerAnchor
      if (!anchor) {
        anchor = vm._staggerAnchor = _.createAnchor('stagger-anchor')
        anchor.__vue__ = vm
      }
      _.after(anchor, prevEl)
      var op = vm._staggerCb = _.cancellable(function () {
        vm._staggerCb = null
        vm.$before(anchor)
        _.remove(anchor)
      })
      setTimeout(op, staggerAmount)
    } else {
      vm.$after(prevEl)
    }
  },

  /**
   * Move an already inserted instance.
   *
   * @param {Vue} vm
   * @param {Node} prevEl
   */

  move: function (vm, prevEl) {
    vm.$after(prevEl, null, false)
  },

  /**
   * Remove an instance.
   *
   * @param {Vue} vm
   * @param {Number} index
   * @param {Boolean} inDoc
   */

  remove: function (vm, index, total, inDoc) {
    if (vm._staggerCb) {
      vm._staggerCb.cancel()
      vm._staggerCb = null
      // it's not possible for the same vm to be removed
      // twice, so if we have a pending stagger callback,
      // it means this vm is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return
    }
    var staggerAmount = this.getStagger(vm, index, total, 'leave')
    if (inDoc && staggerAmount) {
      var op = vm._staggerCb = _.cancellable(function () {
        vm._staggerCb = null
        remove()
      })
      setTimeout(op, staggerAmount)
    } else {
      remove()
    }
    function remove () {
      vm.$remove(function () {
        vm._cleanup()
      })
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Vue} vm
   * @param {Number} index
   * @param {String} type
   * @param {Number} total
   */

  getStagger: function (vm, index, total, type) {
    type = type + 'Stagger'
    var transition = vm.$el.__v_trans
    var hooks = transition && transition.hooks
    var hook = hooks && (hooks[type] || hooks.stagger)
    return hook
      ? hook.call(vm, index, total)
      : index * this[type]
  },

  /**
   * Pre-process the value before piping it through the
   * filters, and convert non-Array objects to arrays.
   *
   * This function will be bound to this directive instance
   * and passed into the watcher.
   *
   * @param {*} value
   * @return {Array}
   * @private
   */

  _preProcess: function (value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value
    var type = this.rawType = typeof value
    if (!isPlainObject(value)) {
      this.converted = false
      if (type === 'number') {
        value = range(value)
      } else if (type === 'string') {
        value = _.toArray(value)
      }
      return value || []
    } else {
      // convert plain object to array.
      var keys = Object.keys(value)
      var i = keys.length
      var res = new Array(i)
      var key
      while (i--) {
        key = keys[i]
        res[i] = {
          $key: key,
          $value: value[key]
        }
      }
      this.converted = true
      return res
    }
  }
}

/**
 * Helper to find the previous element that is an instance
 * root node. This is necessary because a destroyed vm's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its __vue__ reference
 * should have been removed so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return vm that is bound to this v-repeat. (see #929)
 *
 * @param {Vue} vm
 * @param {Comment|Text} anchor
 * @return {Vue}
 */

function findPrevVm (vm, anchor, id) {
  var el = vm.$el.previousSibling
  /* istanbul ignore if */
  if (!el) return
  while (
    (!el.__vue__ || el.__vue__.$options._repeatId !== id) &&
    el !== anchor
  ) {
    el = el.previousSibling
  }
  return el.__vue__
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range (n) {
  var i = -1
  var ret = new Array(n)
  while (++i < n) {
    ret[i] = i
  }
  return ret
}

/**
 * Convert a vms array to an object ref for v-ref on an
 * Object value.
 *
 * @param {Array} vms
 * @return {Object}
 */

function toRefObject (vms) {
  var ref = {}
  for (var i = 0, l = vms.length; i < l; i++) {
    ref[vms[i].$key] = vms[i]
  }
  return ref
}

/**
 * Check if a value is a primitive one:
 * String, Number, Boolean, null or undefined.
 *
 * @param {*} value
 * @return {Boolean}
 */

function isPrimitive (value) {
  var type = typeof value
  return value == null ||
    type === 'string' ||
    type === 'number' ||
    type === 'boolean'
}

}).call(this,require('_process'))
},{"../compiler":17,"../config":19,"../parsers/expression":57,"../parsers/template":59,"../parsers/text":60,"../util":68,"_process":1}],38:[function(require,module,exports){
var transition = require('../transition')

module.exports = function (value) {
  var el = this.el
  transition.apply(el, value ? 1 : -1, function () {
    el.style.display = value ? '' : 'none'
  }, this.vm)
}

},{"../transition":61}],39:[function(require,module,exports){
var _ = require('../util')
var prefixes = ['-webkit-', '-moz-', '-ms-']
var camelPrefixes = ['Webkit', 'Moz', 'ms']
var importantRE = /!important;?$/
var camelRE = /([a-z])([A-Z])/g
var testEl = null
var propCache = {}

module.exports = {

  deep: true,

  update: function (value) {
    if (this.arg) {
      this.setProp(this.arg, value)
    } else {
      if (typeof value === 'object') {
        this.objectHandler(value)
      } else {
        this.el.style.cssText = value
      }
    }
  },

  objectHandler: function (value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {})
    var prop, val
    for (prop in cache) {
      if (!(prop in value)) {
        this.setProp(prop, null)
        delete cache[prop]
      }
    }
    for (prop in value) {
      val = value[prop]
      if (val !== cache[prop]) {
        cache[prop] = val
        this.setProp(prop, val)
      }
    }
  },

  setProp: function (prop, value) {
    prop = normalize(prop)
    if (!prop) return // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += ''
    if (value) {
      var isImportant = importantRE.test(value)
        ? 'important'
        : ''
      if (isImportant) {
        value = value.replace(importantRE, '').trim()
      }
      this.el.style.setProperty(prop, value, isImportant)
    } else {
      this.el.style.removeProperty(prop)
    }
  }

}

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize (prop) {
  if (propCache[prop]) {
    return propCache[prop]
  }
  var res = prefix(prop)
  propCache[prop] = propCache[res] = res
  return res
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix (prop) {
  prop = prop.replace(camelRE, '$1-$2').toLowerCase()
  var camel = _.camelize(prop)
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1)
  if (!testEl) {
    testEl = document.createElement('div')
  }
  if (camel in testEl.style) {
    return prop
  }
  var i = prefixes.length
  var prefixed
  while (i--) {
    prefixed = camelPrefixes[i] + upper
    if (prefixed in testEl.style) {
      return prefixes[i] + prop
    }
  }
}

},{"../util":68}],40:[function(require,module,exports){
var _ = require('../util')

module.exports = {

  bind: function () {
    this.attr = this.el.nodeType === 3
      ? 'data'
      : 'textContent'
  },

  update: function (value) {
    this.el[this.attr] = _.toString(value)
  }
}

},{"../util":68}],41:[function(require,module,exports){
var _ = require('../util')
var Transition = require('../transition/transition')

module.exports = {

  priority: 1000,
  isLiteral: true,

  bind: function () {
    if (!this._isDynamicLiteral) {
      this.update(this.expression)
    }
  },

  update: function (id, oldId) {
    var el = this.el
    var vm = this.el.__vue__ || this.vm
    var hooks = _.resolveAsset(vm.$options, 'transitions', id)
    id = id || 'v'
    el.__v_trans = new Transition(el, id, hooks, vm)
    if (oldId) {
      _.removeClass(el, oldId + '-transition')
    }
    _.addClass(el, id + '-transition')
  }
}

},{"../transition/transition":63,"../util":68}],42:[function(require,module,exports){
var _ = require('../util')
var clone = require('../parsers/template').clone

// This is the elementDirective that handles <content>
// transclusions. It relies on the raw content of an
// instance being stored as `$options._content` during
// the transclude phase.

module.exports = {

  bind: function () {
    var vm = this.vm
    var host = vm
    // we need find the content context, which is the
    // closest non-inline-repeater instance.
    while (host.$options._repeat) {
      host = host.$parent
    }
    var raw = host.$options._content
    var content
    if (!raw) {
      this.fallback()
      return
    }
    var context = host._context
    var selector = this._checkParam('select')
    if (!selector) {
      // Default content
      var self = this
      var compileDefaultContent = function () {
        self.compile(
          extractFragment(raw.childNodes, raw, true),
          context,
          vm
        )
      }
      if (!host._isCompiled) {
        // defer until the end of instance compilation,
        // because the default outlet must wait until all
        // other possible outlets with selectors have picked
        // out their contents.
        host.$once('hook:compiled', compileDefaultContent)
      } else {
        compileDefaultContent()
      }
    } else {
      // select content
      var nodes = raw.querySelectorAll(selector)
      if (nodes.length) {
        content = extractFragment(nodes, raw)
        if (content.hasChildNodes()) {
          this.compile(content, context, vm)
        } else {
          this.fallback()
        }
      } else {
        this.fallback()
      }
    }
  },

  fallback: function () {
    this.compile(_.extractContent(this.el, true), this.vm)
  },

  compile: function (content, context, host) {
    if (content && context) {
      this.unlink = context.$compile(content, host)
    }
    if (content) {
      _.replace(this.el, content)
    } else {
      _.remove(this.el)
    }
  },

  unbind: function () {
    if (this.unlink) {
      this.unlink()
    }
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @param {Element} parent
 * @param {Boolean} main
 * @return {DocumentFragment}
 */

function extractFragment (nodes, parent, main) {
  var frag = document.createDocumentFragment()
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i]
    // if this is the main outlet, we want to skip all
    // previously selected nodes;
    // otherwise, we want to mark the node as selected.
    // clone the node so the original raw content remains
    // intact. this ensures proper re-compilation in cases
    // where the outlet is inside a conditional block
    if (main && !node.__v_selected) {
      frag.appendChild(clone(node))
    } else if (!main && node.parentNode === parent) {
      node.__v_selected = true
      frag.appendChild(clone(node))
    }
  }
  return frag
}

},{"../parsers/template":59,"../util":68}],43:[function(require,module,exports){
exports.content = require('./content')
exports.partial = require('./partial')

},{"./content":42,"./partial":44}],44:[function(require,module,exports){
(function (process){
var _ = require('../util')
var templateParser = require('../parsers/template')
var textParser = require('../parsers/text')
var compiler = require('../compiler')
var Cache = require('../cache')
var cache = new Cache(1000)

// v-partial reuses logic from v-if
var vIf = require('../directives/if')

module.exports = {

  link: vIf.link,
  teardown: vIf.teardown,
  getContainedComponents: vIf.getContainedComponents,

  bind: function () {
    var el = this.el
    this.start = _.createAnchor('v-partial-start')
    this.end = _.createAnchor('v-partial-end')
    _.replace(el, this.end)
    _.before(this.start, this.end)
    var id = el.getAttribute('name')
    var tokens = textParser.parse(id)
    if (tokens) {
      // dynamic partial
      this.setupDynamic(tokens)
    } else {
      // static partial
      this.insert(id)
    }
  },

  setupDynamic: function (tokens) {
    var self = this
    var exp = textParser.tokensToExp(tokens)
    this.unwatch = this.vm.$watch(exp, function (value) {
      self.teardown()
      self.insert(value)
    }, {
      immediate: true,
      user: false
    })
  },

  insert: function (id) {
    var partial = _.resolveAsset(this.vm.$options, 'partials', id)
    if (process.env.NODE_ENV !== 'production') {
      _.assertAsset(partial, 'partial', id)
    }
    if (partial) {
      var frag = templateParser.parse(partial, true)
      // cache partials based on constructor id.
      var cacheId = (this.vm.constructor.cid || '') + partial
      var linker = this.compile(frag, cacheId)
      // this is provided by v-if
      this.link(frag, linker)
    }
  },

  compile: function (frag, cacheId) {
    var hit = cache.get(cacheId)
    if (hit) return hit
    var linker = compiler.compile(frag, this.vm.$options, true)
    cache.put(cacheId, linker)
    return linker
  },

  unbind: function () {
    if (this.unlink) this.unlink()
    if (this.unwatch) this.unwatch()
  }
}

}).call(this,require('_process'))
},{"../cache":14,"../compiler":17,"../directives/if":27,"../parsers/template":59,"../parsers/text":60,"../util":68,"_process":1}],45:[function(require,module,exports){
var _ = require('../util')
var Path = require('../parsers/path')

/**
 * Filter filter for v-repeat
 *
 * @param {String} searchKey
 * @param {String} [delimiter]
 * @param {String} dataKey
 */

exports.filterBy = function (arr, search, delimiter /* ...dataKeys */) {
  if (search == null) {
    return arr
  }
  if (typeof search === 'function') {
    return arr.filter(search)
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase()
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2
  // extract and flatten keys
  var keys = _.toArray(arguments, n).reduce(function (prev, cur) {
    return prev.concat(cur)
  }, [])
  return arr.filter(function (item) {
    if (keys.length) {
      return keys.some(function (key) {
        return contains(Path.get(item, key), search)
      })
    } else {
      return contains(item, search)
    }
  })
}

/**
 * Filter filter for v-repeat
 *
 * @param {String} sortKey
 * @param {String} reverse
 */

exports.orderBy = function (arr, sortKey, reverse) {
  if (!sortKey) {
    return arr
  }
  var order = 1
  if (arguments.length > 2) {
    if (reverse === '-1') {
      order = -1
    } else {
      order = reverse ? -1 : 1
    }
  }
  // sort on a copy to avoid mutating original array
  return arr.slice().sort(function (a, b) {
    if (sortKey !== '$key' && sortKey !== '$value') {
      if (a && '$value' in a) a = a.$value
      if (b && '$value' in b) b = b.$value
    }
    a = _.isObject(a) ? Path.get(a, sortKey) : a
    b = _.isObject(b) ? Path.get(b, sortKey) : b
    return a === b ? 0 : a > b ? order : -order
  })
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains (val, search) {
  var i
  if (_.isPlainObject(val)) {
    var keys = Object.keys(val)
    i = keys.length
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true
      }
    }
  } else if (_.isArray(val)) {
    i = val.length
    while (i--) {
      if (contains(val[i], search)) {
        return true
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1
  }
}

},{"../parsers/path":58,"../util":68}],46:[function(require,module,exports){
var _ = require('../util')

/**
 * Stringify value.
 *
 * @param {Number} indent
 */

exports.json = {
  read: function (value, indent) {
    return typeof value === 'string'
      ? value
      : JSON.stringify(value, null, Number(indent) || 2)
  },
  write: function (value) {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }
}

/**
 * 'abc' => 'Abc'
 */

exports.capitalize = function (value) {
  if (!value && value !== 0) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * 'abc' => 'ABC'
 */

exports.uppercase = function (value) {
  return (value || value === 0)
    ? value.toString().toUpperCase()
    : ''
}

/**
 * 'AbC' => 'abc'
 */

exports.lowercase = function (value) {
  return (value || value === 0)
    ? value.toString().toLowerCase()
    : ''
}

/**
 * 12345 => $12,345.00
 *
 * @param {String} sign
 */

var digitsRE = /(\d{3})(?=\d)/g
exports.currency = function (value, currency) {
  value = parseFloat(value)
  if (!isFinite(value) || (!value && value !== 0)) return ''
  currency = currency != null ? currency : '$'
  var stringified = Math.abs(value).toFixed(2)
  var _int = stringified.slice(0, -3)
  var i = _int.length % 3
  var head = i > 0
    ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
    : ''
  var _float = stringified.slice(-3)
  var sign = value < 0 ? '-' : ''
  return currency + sign + head +
    _int.slice(i).replace(digitsRE, '$1,') +
    _float
}

/**
 * 'item' => 'items'
 *
 * @params
 *  an array of strings corresponding to
 *  the single, double, triple ... forms of the word to
 *  be pluralized. When the number to be pluralized
 *  exceeds the length of the args, it will use the last
 *  entry in the array.
 *
 *  e.g. ['single', 'double', 'triple', 'multiple']
 */

exports.pluralize = function (value) {
  var args = _.toArray(arguments, 1)
  return args.length > 1
    ? (args[value % 10 - 1] || args[args.length - 1])
    : (args[0] + (value === 1 ? '' : 's'))
}

/**
 * A special filter that takes a handler function,
 * wraps it so it only gets triggered on specific
 * keypresses. v-on only.
 *
 * @param {String} key
 */

var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': 46,
  up: 38,
  left: 37,
  right: 39,
  down: 40
}

exports.key = function (handler, key) {
  if (!handler) return
  var code = keyCodes[key]
  if (!code) {
    code = parseInt(key, 10)
  }
  return function (e) {
    if (e.keyCode === code) {
      return handler.call(this, e)
    }
  }
}

// expose keycode hash
exports.key.keyCodes = keyCodes

exports.debounce = function (handler, delay) {
  if (!handler) return
  if (!delay) {
    delay = 300
  }
  return _.debounce(handler, delay)
}

/**
 * Install special array filters
 */

_.extend(exports, require('./array-filters'))

},{"../util":68,"./array-filters":45}],47:[function(require,module,exports){
var _ = require('../util')
var Directive = require('../directive')
var compiler = require('../compiler')

/**
 * Transclude, compile and link element.
 *
 * If a pre-compiled linker is available, that means the
 * passed in element will be pre-transcluded and compiled
 * as well - all we need to do is to call the linker.
 *
 * Otherwise we need to call transclude/compile/link here.
 *
 * @param {Element} el
 * @return {Element}
 */

exports._compile = function (el) {
  var options = this.$options
  var host = this._host
  if (options._linkFn) {
    // pre-transcluded with linker, just use it
    this._initElement(el)
    this._unlinkFn = options._linkFn(this, el, host)
  } else {
    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference; this step also injects
    // the template and caches the original attributes
    // on the container node and replacer node.
    var original = el
    el = compiler.transclude(el, options)
    this._initElement(el)

    // root is always compiled per-instance, because
    // container attrs and props can be different every time.
    var rootLinker = compiler.compileRoot(el, options)

    // compile and link the rest
    var contentLinkFn
    var ctor = this.constructor
    // component compilation can be cached
    // as long as it's not using inline-template
    if (options._linkerCachable) {
      contentLinkFn = ctor.linker
      if (!contentLinkFn) {
        contentLinkFn = ctor.linker = compiler.compile(el, options)
      }
    }

    // link phase
    var rootUnlinkFn = rootLinker(this, el)
    var contentUnlinkFn = contentLinkFn
      ? contentLinkFn(this, el)
      : compiler.compile(el, options)(this, el, host)

    // register composite unlink function
    // to be called during instance destruction
    this._unlinkFn = function () {
      rootUnlinkFn()
      // passing destroying: true to avoid searching and
      // splicing the directives
      contentUnlinkFn(true)
    }

    // finally replace original
    if (options.replace) {
      _.replace(original, el)
    }
  }
  return el
}

/**
 * Initialize instance element. Called in the public
 * $mount() method.
 *
 * @param {Element} el
 */

exports._initElement = function (el) {
  if (el instanceof DocumentFragment) {
    this._isFragment = true
    this.$el = this._fragmentStart = el.firstChild
    this._fragmentEnd = el.lastChild
    // set persisted text anchors to empty
    if (this._fragmentStart.nodeType === 3) {
      this._fragmentStart.data = this._fragmentEnd.data = ''
    }
    this._blockFragment = el
  } else {
    this.$el = el
  }
  this.$el.__vue__ = this
  this._callHook('beforeCompile')
}

/**
 * Create and bind a directive to an element.
 *
 * @param {String} name - directive name
 * @param {Node} node   - target node
 * @param {Object} desc - parsed directive descriptor
 * @param {Object} def  - directive definition object
 * @param {Vue|undefined} host - transclusion host component
 */

exports._bindDir = function (name, node, desc, def, host) {
  this._directives.push(
    new Directive(name, node, this, desc, def, host)
  )
}

/**
 * Teardown an instance, unobserves the data, unbind all the
 * directives, turn off all the event listeners, etc.
 *
 * @param {Boolean} remove - whether to remove the DOM node.
 * @param {Boolean} deferCleanup - if true, defer cleanup to
 *                                 be called later
 */

exports._destroy = function (remove, deferCleanup) {
  if (this._isBeingDestroyed) {
    return
  }
  this._callHook('beforeDestroy')
  this._isBeingDestroyed = true
  var i
  // remove self from parent. only necessary
  // if parent is not being destroyed as well.
  var parent = this.$parent
  if (parent && !parent._isBeingDestroyed) {
    parent.$children.$remove(this)
  }
  // destroy all children.
  i = this.$children.length
  while (i--) {
    this.$children[i].$destroy()
  }
  // teardown props
  if (this._propsUnlinkFn) {
    this._propsUnlinkFn()
  }
  // teardown all directives. this also tearsdown all
  // directive-owned watchers.
  if (this._unlinkFn) {
    this._unlinkFn()
  }
  i = this._watchers.length
  while (i--) {
    this._watchers[i].teardown()
  }
  // remove reference to self on $el
  if (this.$el) {
    this.$el.__vue__ = null
  }
  // remove DOM element
  var self = this
  if (remove && this.$el) {
    this.$remove(function () {
      self._cleanup()
    })
  } else if (!deferCleanup) {
    this._cleanup()
  }
}

/**
 * Clean up to ensure garbage collection.
 * This is called after the leave transition if there
 * is any.
 */

exports._cleanup = function () {
  // remove reference from data ob
  // frozen object may not have observer.
  if (this._data.__ob__) {
    this._data.__ob__.removeVm(this)
  }
  // Clean up references to private properties and other
  // instances. preserve reference to _data so that proxy
  // accessors still work. The only potential side effect
  // here is that mutating the instance after it's destroyed
  // may affect the state of other components that are still
  // observing the same object, but that seems to be a
  // reasonable responsibility for the user rather than
  // always throwing an error on them.
  this.$el =
  this.$parent =
  this.$root =
  this.$children =
  this._watchers =
  this._directives = null
  // call the last hook...
  this._isDestroyed = true
  this._callHook('destroyed')
  // turn off all instance listeners.
  this.$off()
}

},{"../compiler":17,"../directive":20,"../util":68}],48:[function(require,module,exports){
(function (process){
var _ = require('../util')
var inDoc = _.inDoc

/**
 * Setup the instance's option events & watchers.
 * If the value is a string, we pull it from the
 * instance's methods by name.
 */

exports._initEvents = function () {
  var options = this.$options
  registerCallbacks(this, '$on', options.events)
  registerCallbacks(this, '$watch', options.watch)
}

/**
 * Register callbacks for option events and watchers.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {Object} hash
 */

function registerCallbacks (vm, action, hash) {
  if (!hash) return
  var handlers, key, i, j
  for (key in hash) {
    handlers = hash[key]
    if (_.isArray(handlers)) {
      for (i = 0, j = handlers.length; i < j; i++) {
        register(vm, action, key, handlers[i])
      }
    } else {
      register(vm, action, key, handlers)
    }
  }
}

/**
 * Helper to register an event/watch callback.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {String} key
 * @param {Function|String|Object} handler
 * @param {Object} [options]
 */

function register (vm, action, key, handler, options) {
  var type = typeof handler
  if (type === 'function') {
    vm[action](key, handler, options)
  } else if (type === 'string') {
    var methods = vm.$options.methods
    var method = methods && methods[handler]
    if (method) {
      vm[action](key, method, options)
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Unknown method: "' + handler + '" when ' +
        'registering callback for ' + action +
        ': "' + key + '".'
      )
    }
  } else if (handler && type === 'object') {
    register(vm, action, key, handler.handler, handler)
  }
}

/**
 * Setup recursive attached/detached calls
 */

exports._initDOMHooks = function () {
  this.$on('hook:attached', onAttached)
  this.$on('hook:detached', onDetached)
}

/**
 * Callback to recursively call attached hook on children
 */

function onAttached () {
  if (!this._isAttached) {
    this._isAttached = true
    this.$children.forEach(callAttach)
  }
}

/**
 * Iterator to call attached hook
 *
 * @param {Vue} child
 */

function callAttach (child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook('attached')
  }
}

/**
 * Callback to recursively call detached hook on children
 */

function onDetached () {
  if (this._isAttached) {
    this._isAttached = false
    this.$children.forEach(callDetach)
  }
}

/**
 * Iterator to call detached hook
 *
 * @param {Vue} child
 */

function callDetach (child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook('detached')
  }
}

/**
 * Trigger all handlers for a hook
 *
 * @param {String} hook
 */

exports._callHook = function (hook) {
  var handlers = this.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(this)
    }
  }
  this.$emit('hook:' + hook)
}

}).call(this,require('_process'))
},{"../util":68,"_process":1}],49:[function(require,module,exports){
var mergeOptions = require('../util').mergeOptions

/**
 * The main init sequence. This is called for every
 * instance, including ones that are created from extended
 * constructors.
 *
 * @param {Object} options - this options object should be
 *                           the result of merging class
 *                           options and the options passed
 *                           in to the constructor.
 */

exports._init = function (options) {

  options = options || {}

  this.$el = null
  this.$parent = options._parent
  this.$root = options._root || this
  this.$children = []
  this.$ = {}           // child vm references
  this.$$ = {}          // element references
  this._watchers = []   // all watchers as an array
  this._directives = [] // all directives
  this._childCtors = {} // inherit:true constructors

  // a flag to avoid this being observed
  this._isVue = true

  // events bookkeeping
  this._events = {}            // registered callbacks
  this._eventsCount = {}       // for $broadcast optimization
  this._eventCancelled = false // for event cancellation

  // fragment instance properties
  this._isFragment = false
  this._fragmentStart =    // @type {CommentNode}
  this._fragmentEnd = null // @type {CommentNode}

  // lifecycle state
  this._isCompiled =
  this._isDestroyed =
  this._isReady =
  this._isAttached =
  this._isBeingDestroyed = false
  this._unlinkFn = null

  // context: the scope in which the component was used,
  // and the scope in which props and contents of this
  // instance should be compiled in.
  this._context =
    options._context ||
    options._parent

  // push self into parent / transclusion host
  if (this.$parent) {
    this.$parent.$children.push(this)
  }

  // props used in v-repeat diffing
  this._reused = false
  this._staggerOp = null

  // merge options.
  options = this.$options = mergeOptions(
    this.constructor.options,
    options,
    this
  )

  // initialize data as empty object.
  // it will be filled up in _initScope().
  this._data = {}

  // initialize data observation and scope inheritance.
  this._initScope()

  // setup event system and option events.
  this._initEvents()

  // call created hook
  this._callHook('created')

  // if `el` option is passed, start compilation.
  if (options.el) {
    this.$mount(options.el)
  }
}

},{"../util":68}],50:[function(require,module,exports){
(function (process){
var _ = require('../util')

/**
 * Apply a list of filter (descriptors) to a value.
 * Using plain for loops here because this will be called in
 * the getter of any watcher with filters so it is very
 * performance sensitive.
 *
 * @param {*} value
 * @param {*} [oldValue]
 * @param {Array} filters
 * @param {Boolean} write
 * @return {*}
 */

exports._applyFilters = function (value, oldValue, filters, write) {
  var filter, fn, args, arg, offset, i, l, j, k
  for (i = 0, l = filters.length; i < l; i++) {
    filter = filters[i]
    fn = _.resolveAsset(this.$options, 'filters', filter.name)
    if (process.env.NODE_ENV !== 'production') {
      _.assertAsset(fn, 'filter', filter.name)
    }
    if (!fn) continue
    fn = write ? fn.write : (fn.read || fn)
    if (typeof fn !== 'function') continue
    args = write ? [value, oldValue] : [value]
    offset = write ? 2 : 1
    if (filter.args) {
      for (j = 0, k = filter.args.length; j < k; j++) {
        arg = filter.args[j]
        args[j + offset] = arg.dynamic
          ? this.$get(arg.value)
          : arg.value
      }
    }
    value = fn.apply(this, args)
  }
  return value
}

/**
 * Resolve a component, depending on whether the component
 * is defined normally or using an async factory function.
 * Resolves synchronously if already resolved, otherwise
 * resolves asynchronously and caches the resolved
 * constructor on the factory.
 *
 * @param {String} id
 * @param {Function} cb
 */

exports._resolveComponent = function (id, cb) {
  var factory = _.resolveAsset(this.$options, 'components', id)
  if (process.env.NODE_ENV !== 'production') {
    _.assertAsset(factory, 'component', id)
  }
  if (!factory) {
    return
  }
  // async component factory
  if (!factory.options) {
    if (factory.resolved) {
      // cached
      cb(factory.resolved)
    } else if (factory.requested) {
      // pool callbacks
      factory.pendingCallbacks.push(cb)
    } else {
      factory.requested = true
      var cbs = factory.pendingCallbacks = [cb]
      factory(function resolve (res) {
        if (_.isPlainObject(res)) {
          res = _.Vue.extend(res)
        }
        // cache resolved
        factory.resolved = res
        // invoke callbacks
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res)
        }
      }, function reject (reason) {
        process.env.NODE_ENV !== 'production' && _.warn(
          'Failed to resolve async component: ' + id + '. ' +
          (reason ? '\nReason: ' + reason : '')
        )
      })
    }
  } else {
    // normal component
    cb(factory)
  }
}

}).call(this,require('_process'))
},{"../util":68,"_process":1}],51:[function(require,module,exports){
(function (process){
var _ = require('../util')
var compiler = require('../compiler')
var Observer = require('../observer')
var Dep = require('../observer/dep')
var Watcher = require('../watcher')

/**
 * Setup the scope of an instance, which contains:
 * - observed data
 * - computed properties
 * - user methods
 * - meta properties
 */

exports._initScope = function () {
  this._initProps()
  this._initMeta()
  this._initMethods()
  this._initData()
  this._initComputed()
}

/**
 * Initialize props.
 */

exports._initProps = function () {
  var options = this.$options
  var el = options.el
  var props = options.props
  if (props && !el) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Props will not be compiled if no `el` option is ' +
      'provided at instantiation.'
    )
  }
  // make sure to convert string selectors into element now
  el = options.el = _.query(el)
  this._propsUnlinkFn = el && el.nodeType === 1 && props
    ? compiler.compileAndLinkProps(
        this, el, props
      )
    : null
}

/**
 * Initialize the data.
 */

exports._initData = function () {
  var propsData = this._data
  var optionsDataFn = this.$options.data
  var optionsData = optionsDataFn && optionsDataFn()
  if (optionsData) {
    this._data = optionsData
    for (var prop in propsData) {
      if (
        this._props[prop].raw !== null ||
        !optionsData.hasOwnProperty(prop)
      ) {
        optionsData.$set(prop, propsData[prop])
      }
    }
  }
  var data = this._data
  // proxy data on instance
  var keys = Object.keys(data)
  var i, key
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!_.isReserved(key)) {
      this._proxy(key)
    }
  }
  // observe data
  Observer.create(data, this)
}

/**
 * Swap the isntance's $data. Called in $data's setter.
 *
 * @param {Object} newData
 */

exports._setData = function (newData) {
  newData = newData || {}
  var oldData = this._data
  this._data = newData
  var keys, key, i
  // copy props.
  // this should only happen during a v-repeat of component
  // that also happens to have compiled props.
  var props = this.$options.props
  if (props) {
    i = props.length
    while (i--) {
      key = props[i].name
      if (key !== '$data' && !newData.hasOwnProperty(key)) {
        newData.$set(key, oldData[key])
      }
    }
  }
  // unproxy keys not present in new data
  keys = Object.keys(oldData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!_.isReserved(key) && !(key in newData)) {
      this._unproxy(key)
    }
  }
  // proxy keys not already proxied,
  // and trigger change for changed values
  keys = Object.keys(newData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!this.hasOwnProperty(key) && !_.isReserved(key)) {
      // new property
      this._proxy(key)
    }
  }
  oldData.__ob__.removeVm(this)
  Observer.create(newData, this)
  this._digest()
}

/**
 * Proxy a property, so that
 * vm.prop === vm._data.prop
 *
 * @param {String} key
 */

exports._proxy = function (key) {
  // need to store ref to self here
  // because these getter/setters might
  // be called by child instances!
  var self = this
  Object.defineProperty(self, key, {
    configurable: true,
    enumerable: true,
    get: function proxyGetter () {
      return self._data[key]
    },
    set: function proxySetter (val) {
      self._data[key] = val
    }
  })
}

/**
 * Unproxy a property.
 *
 * @param {String} key
 */

exports._unproxy = function (key) {
  delete this[key]
}

/**
 * Force update on every watcher in scope.
 */

exports._digest = function () {
  var i = this._watchers.length
  while (i--) {
    this._watchers[i].update(true) // shallow updates
  }
  var children = this.$children
  i = children.length
  while (i--) {
    var child = children[i]
    if (child.$options.inherit) {
      child._digest()
    }
  }
}

/**
 * Setup computed properties. They are essentially
 * special getter/setters
 */

function noop () {}
exports._initComputed = function () {
  var computed = this.$options.computed
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key]
      var def = {
        enumerable: true,
        configurable: true
      }
      if (typeof userDef === 'function') {
        def.get = makeComputedGetter(userDef, this)
        def.set = noop
      } else {
        def.get = userDef.get
          ? userDef.cache !== false
            ? makeComputedGetter(userDef.get, this)
            : _.bind(userDef.get, this)
          : noop
        def.set = userDef.set
          ? _.bind(userDef.set, this)
          : noop
      }
      Object.defineProperty(this, key, def)
    }
  }
}

function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, null, {
    lazy: true
  })
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate()
    }
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}

/**
 * Setup instance methods. Methods must be bound to the
 * instance since they might be called by children
 * inheriting them.
 */

exports._initMethods = function () {
  var methods = this.$options.methods
  if (methods) {
    for (var key in methods) {
      this[key] = _.bind(methods[key], this)
    }
  }
}

/**
 * Initialize meta information like $index, $key & $value.
 */

exports._initMeta = function () {
  var metas = this.$options._meta
  if (metas) {
    for (var key in metas) {
      this._defineMeta(key, metas[key])
    }
  }
}

/**
 * Define a meta property, e.g $index, $key, $value
 * which only exists on the vm instance but not in $data.
 *
 * @param {String} key
 * @param {*} value
 */

exports._defineMeta = function (key, value) {
  var dep = new Dep()
  Object.defineProperty(this, key, {
    get: function metaGetter () {
      if (Dep.target) {
        dep.depend()
      }
      return value
    },
    set: function metaSetter (val) {
      if (val !== value) {
        value = val
        dep.notify()
      }
    }
  })
}

}).call(this,require('_process'))
},{"../compiler":17,"../observer":54,"../observer/dep":53,"../util":68,"../watcher":72,"_process":1}],52:[function(require,module,exports){
var _ = require('../util')
var arrayProto = Array.prototype
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method]
  _.define(arrayMethods, method, function mutator () {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length
    var args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    var result = original.apply(this, args)
    var ob = this.__ob__
    var inserted, removed
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        removed = result
        break
      case 'pop':
      case 'shift':
        removed = [result]
        break
    }
    if (inserted) ob.observeArray(inserted)
    if (removed) ob.unobserveArray(removed)
    // notify change
    ob.notify()
    return result
  })
})

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

_.define(
  arrayProto,
  '$set',
  function $set (index, val) {
    if (index >= this.length) {
      this.length = index + 1
    }
    return this.splice(index, 1, val)[0]
  }
)

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

_.define(
  arrayProto,
  '$remove',
  function $remove (index) {
    /* istanbul ignore if */
    if (!this.length) return
    if (typeof index !== 'number') {
      index = _.indexOf(this, index)
    }
    if (index > -1) {
      return this.splice(index, 1)
    }
  }
)

module.exports = arrayMethods

},{"../util":68}],53:[function(require,module,exports){
var _ = require('../util')
var uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */

function Dep () {
  this.id = uid++
  this.subs = []
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub)
}

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub)
}

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this)
}

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = _.toArray(this.subs)
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}

module.exports = Dep

},{"../util":68}],54:[function(require,module,exports){
var _ = require('../util')
var config = require('../config')
var Dep = require('./dep')
var arrayMethods = require('./array')
var arrayKeys = Object.getOwnPropertyNames(arrayMethods)
require('./object')

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer (value) {
  this.value = value
  this.dep = new Dep()
  _.define(value, '__ob__', this)
  if (_.isArray(value)) {
    var augment = config.proto && _.hasProto
      ? protoAugment
      : copyAugment
    augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
  } else {
    this.walk(value)
  }
}

// Static methods

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

Observer.create = function (value, vm) {
  var ob
  if (
    value &&
    value.hasOwnProperty('__ob__') &&
    value.__ob__ instanceof Observer
  ) {
    ob = value.__ob__
  } else if (
    (_.isArray(value) || _.isPlainObject(value)) &&
    !Object.isFrozen(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (ob && vm) {
    ob.addVm(vm)
  }
  return ob
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object. Properties prefixed with `$` or `_`
 * and accessor properties are ignored.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  var keys = Object.keys(obj)
  var i = keys.length
  while (i--) {
    this.convert(keys[i], obj[keys[i]])
  }
}

/**
 * Try to carete an observer for a child value,
 * and if value is array, link dep to the array.
 *
 * @param {*} val
 * @return {Dep|undefined}
 */

Observer.prototype.observe = function (val) {
  return Observer.create(val)
}

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  var i = items.length
  while (i--) {
    var ob = this.observe(items[i])
    if (ob) {
      (ob.parents || (ob.parents = [])).push(this)
    }
  }
}

/**
 * Remove self from the parent list of removed objects.
 *
 * @param {Array} items
 */

Observer.prototype.unobserveArray = function (items) {
  var i = items.length
  while (i--) {
    var ob = items[i] && items[i].__ob__
    if (ob) {
      ob.parents.$remove(this)
    }
  }
}

/**
 * Notify self dependency, and also parent Array dependency
 * if any.
 */

Observer.prototype.notify = function () {
  this.dep.notify()
  var parents = this.parents
  if (parents) {
    var i = parents.length
    while (i--) {
      parents[i].notify()
    }
  }
}

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  var ob = this
  var childOb = ob.observe(val)
  var dep = new Dep()
  Object.defineProperty(ob.value, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      val = newVal
      childOb = ob.observe(newVal)
      dep.notify()
    }
  })
}

/**
 * Add an owner vm, so that when $add/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm)
}

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  this.vms.$remove(vm)
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function protoAugment (target, src) {
  target.__proto__ = src
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment (target, src, keys) {
  var i = keys.length
  var key
  while (i--) {
    key = keys[i]
    _.define(target, key, src[key])
  }
}

module.exports = Observer

},{"../config":19,"../util":68,"./array":52,"./dep":53,"./object":55}],55:[function(require,module,exports){
var _ = require('../util')
var objProto = Object.prototype

/**
 * Add a new property to an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @param {*} val
 * @public
 */

_.define(
  objProto,
  '$add',
  function $add (key, val) {
    if (this.hasOwnProperty(key)) return
    var ob = this.__ob__
    if (!ob || _.isReserved(key)) {
      this[key] = val
      return
    }
    ob.convert(key, val)
    ob.notify()
    if (ob.vms) {
      var i = ob.vms.length
      while (i--) {
        var vm = ob.vms[i]
        vm._proxy(key)
        vm._digest()
      }
    }
  }
)

/**
 * Set a property on an observed object, calling add to
 * ensure the property is observed.
 *
 * @param {String} key
 * @param {*} val
 * @public
 */

_.define(
  objProto,
  '$set',
  function $set (key, val) {
    this.$add(key, val)
    this[key] = val
  }
)

/**
 * Deletes a property from an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @public
 */

_.define(
  objProto,
  '$delete',
  function $delete (key) {
    if (!this.hasOwnProperty(key)) return
    delete this[key]
    var ob = this.__ob__
    if (!ob || _.isReserved(key)) {
      return
    }
    ob.notify()
    if (ob.vms) {
      var i = ob.vms.length
      while (i--) {
        var vm = ob.vms[i]
        vm._unproxy(key)
        vm._digest()
      }
    }
  }
)

},{"../util":68}],56:[function(require,module,exports){
var _ = require('../util')
var Cache = require('../cache')
var cache = new Cache(1000)
var argRE = /^[^\{\?]+$|^'[^']*'$|^"[^"]*"$/
var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g
var reservedArgRE = /^in$|^-?\d+/

/**
 * Parser state
 */

var str
var c, i, l
var inSingle
var inDouble
var curly
var square
var paren
var begin
var argIndex
var dirs
var dir
var lastFilterIndex
var arg

/**
 * Push a directive object into the result Array
 */

function pushDir () {
  dir.raw = str.slice(begin, i).trim()
  if (dir.expression === undefined) {
    dir.expression = str.slice(argIndex, i).trim()
  } else if (lastFilterIndex !== begin) {
    pushFilter()
  }
  if (i === 0 || dir.expression) {
    dirs.push(dir)
  }
}

/**
 * Push a filter to the current directive object
 */

function pushFilter () {
  var exp = str.slice(lastFilterIndex, i).trim()
  var filter
  if (exp) {
    filter = {}
    var tokens = exp.match(filterTokenRE)
    filter.name = tokens[0]
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg)
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter)
  }
  lastFilterIndex = i + 1
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg (arg) {
  var stripped = reservedArgRE.test(arg)
    ? arg
    : _.stripQuotes(arg)
  var dynamic = stripped === false
  return {
    value: dynamic ? arg : stripped,
    dynamic: dynamic
  }
}

/**
 * Parse a directive string into an Array of AST-like
 * objects representing directives.
 *
 * Example:
 *
 * "click: a = a + 1 | uppercase" will yield:
 * {
 *   arg: 'click',
 *   expression: 'a = a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} str
 * @return {Array<Object>}
 */

exports.parse = function (s) {

  var hit = cache.get(s)
  if (hit) {
    return hit
  }

  // reset parser state
  str = s
  inSingle = inDouble = false
  curly = square = paren = begin = argIndex = 0
  lastFilterIndex = 0
  dirs = []
  dir = {}
  arg = null

  for (i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i)
    if (inSingle) {
      // check single quote
      if (c === 0x27) inSingle = !inSingle
    } else if (inDouble) {
      // check double quote
      if (c === 0x22) inDouble = !inDouble
    } else if (
      c === 0x2C && // comma
      !paren && !curly && !square
    ) {
      // reached the end of a directive
      pushDir()
      // reset & skip the comma
      dir = {}
      begin = argIndex = lastFilterIndex = i + 1
    } else if (
      c === 0x3A && // colon
      !dir.expression &&
      !dir.arg
    ) {
      // argument
      arg = str.slice(begin, i).trim()
      // test for valid argument here
      // since we may have caught stuff like first half of
      // an object literal or a ternary expression.
      if (argRE.test(arg)) {
        argIndex = i + 1
        dir.arg = _.stripQuotes(arg) || arg
      }
    } else if (
      c === 0x7C && // pipe
      str.charCodeAt(i + 1) !== 0x7C &&
      str.charCodeAt(i - 1) !== 0x7C
    ) {
      if (dir.expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        dir.expression = str.slice(argIndex, i).trim()
      } else {
        // already has filter
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break // "
        case 0x27: inSingle = true; break // '
        case 0x28: paren++; break         // (
        case 0x29: paren--; break         // )
        case 0x5B: square++; break        // [
        case 0x5D: square--; break        // ]
        case 0x7B: curly++; break         // {
        case 0x7D: curly--; break         // }
      }
    }
  }

  if (i === 0 || begin !== i) {
    pushDir()
  }

  cache.put(s, dirs)
  return dirs
}

},{"../cache":14,"../util":68}],57:[function(require,module,exports){
(function (process){
var _ = require('../util')
var Path = require('./path')
var Cache = require('../cache')
var expressionCache = new Cache(1000)

var allowedKeywords =
  'Math,Date,this,true,false,null,undefined,Infinity,NaN,' +
  'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' +
  'encodeURIComponent,parseInt,parseFloat'
var allowedKeywordsRE =
  new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)')

// keywords that don't make sense inside expressions
var improperKeywords =
  'break,case,class,catch,const,continue,debugger,default,' +
  'delete,do,else,export,extends,finally,for,function,if,' +
  'import,in,instanceof,let,return,super,switch,throw,try,' +
  'var,while,with,yield,enum,await,implements,package,' +
  'proctected,static,interface,private,public'
var improperKeywordsRE =
  new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)')

var wsRE = /\s/g
var newlineRE = /\n/g
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|new |typeof |void /g
var restoreRE = /"(\d+)"/g
var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
var booleanLiteralRE = /^(true|false)$/

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = []

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save (str, isString) {
  var i = saved.length
  saved[i] = isString
    ? str.replace(newlineRE, '\\n')
    : str
  return '"' + i + '"'
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite (raw) {
  var c = raw.charAt(0)
  var path = raw.slice(1)
  if (allowedKeywordsRE.test(path)) {
    return raw
  } else {
    path = path.indexOf('"') > -1
      ? path.replace(restoreRE, restore)
      : path
    return c + 'scope.' + path
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore (str, i) {
  return saved[i]
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function compileExpFns (exp, needSet) {
  if (improperKeywordsRE.test(exp)) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Avoid using reserved keywords in expression: ' + exp
    )
  }
  // reset state
  saved.length = 0
  // save strings and object literal keys
  var body = exp
    .replace(saveRE, save)
    .replace(wsRE, '')
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (' ' + body)
    .replace(pathReplaceRE, rewrite)
    .replace(restoreRE, restore)
  var getter = makeGetter(body)
  if (getter) {
    return {
      get: getter,
      body: body,
      set: needSet
        ? makeSetter(body)
        : null
    }
  }
}

/**
 * Compile getter setters for a simple path.
 *
 * @param {String} exp
 * @return {Function}
 */

function compilePathFns (exp) {
  var getter, path
  if (exp.indexOf('[') < 0) {
    // really simple path
    path = exp.split('.')
    path.raw = exp
    getter = Path.compileGetter(path)
  } else {
    // do the real parsing
    path = Path.parse(exp)
    getter = path.get
  }
  return {
    get: getter,
    // always generate setter for simple paths
    set: function (obj, val) {
      Path.set(obj, path, val)
    }
  }
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetter (body) {
  try {
    return new Function('scope', 'return ' + body + ';')
  } catch (e) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Invalid expression. ' +
      'Generated function body: ' + body
    )
  }
}

/**
 * Build a setter function.
 *
 * This is only needed in rare situations like "a[b]" where
 * a settable path requires dynamic evaluation.
 *
 * This setter function may throw error when called if the
 * expression body is not a valid left-hand expression in
 * assignment.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeSetter (body) {
  try {
    return new Function('scope', 'value', body + '=value;')
  } catch (e) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Invalid setter function body: ' + body
    )
  }
}

/**
 * Check for setter existence on a cache hit.
 *
 * @param {Function} hit
 */

function checkSetter (hit) {
  if (!hit.set) {
    hit.set = makeSetter(hit.body)
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

exports.parse = function (exp, needSet) {
  exp = exp.trim()
  // try cache
  var hit = expressionCache.get(exp)
  if (hit) {
    if (needSet) {
      checkSetter(hit)
    }
    return hit
  }
  // we do a simple path check to optimize for them.
  // the check fails valid paths with unusal whitespaces,
  // but that's too rare and we don't care.
  // also skip boolean literals and paths that start with
  // global "Math"
  var res = exports.isSimplePath(exp)
    ? compilePathFns(exp)
    : compileExpFns(exp, needSet)
  expressionCache.put(exp, res)
  return res
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} exp
 * @return {Boolean}
 */

exports.isSimplePath = function (exp) {
  return pathTestRE.test(exp) &&
    // don't treat true/false as paths
    !booleanLiteralRE.test(exp) &&
    // Math constants e.g. Math.PI, Math.E etc.
    exp.slice(0, 5) !== 'Math.'
}

}).call(this,require('_process'))
},{"../cache":14,"../util":68,"./path":58,"_process":1}],58:[function(require,module,exports){
(function (process){
var _ = require('../util')
var Cache = require('../cache')
var pathCache = new Cache(1000)
var identRE = exports.identRE = /^[$_a-zA-Z]+[\w$]*$/

// actions
var APPEND = 0
var PUSH = 1

// states
var BEFORE_PATH = 0
var IN_PATH = 1
var BEFORE_IDENT = 2
var IN_IDENT = 3
var BEFORE_ELEMENT = 4
var AFTER_ZERO = 5
var IN_INDEX = 6
var IN_SINGLE_QUOTE = 7
var IN_DOUBLE_QUOTE = 8
var IN_SUB_PATH = 9
var AFTER_ELEMENT = 10
var AFTER_PATH = 11
var ERROR = 12

var pathStateMachine = []

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [BEFORE_ELEMENT],
  'eof': [AFTER_PATH]
}

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [BEFORE_ELEMENT],
  'eof': [AFTER_PATH]
}

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
}

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [BEFORE_ELEMENT, PUSH],
  'eof': [AFTER_PATH, PUSH]
}

pathStateMachine[BEFORE_ELEMENT] = {
  'ws': [BEFORE_ELEMENT],
  '0': [AFTER_ZERO, APPEND],
  'number': [IN_INDEX, APPEND],
  "'": [IN_SINGLE_QUOTE, APPEND, ''],
  '"': [IN_DOUBLE_QUOTE, APPEND, ''],
  'ident': [IN_SUB_PATH, APPEND, '*']
}

pathStateMachine[AFTER_ZERO] = {
  'ws': [AFTER_ELEMENT, PUSH],
  ']': [IN_PATH, PUSH]
}

pathStateMachine[IN_INDEX] = {
  '0': [IN_INDEX, APPEND],
  'number': [IN_INDEX, APPEND],
  'ws': [AFTER_ELEMENT],
  ']': [IN_PATH, PUSH]
}

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [AFTER_ELEMENT],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
}

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [AFTER_ELEMENT],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
}

pathStateMachine[IN_SUB_PATH] = {
  'ident': [IN_SUB_PATH, APPEND],
  '0': [IN_SUB_PATH, APPEND],
  'number': [IN_SUB_PATH, APPEND],
  'ws': [AFTER_ELEMENT],
  ']': [IN_PATH, PUSH]
}

pathStateMachine[AFTER_ELEMENT] = {
  'ws': [AFTER_ELEMENT],
  ']': [IN_PATH, PUSH]
}

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} ch
 * @return {String} type
 */

function getPathCharType (ch) {
  if (ch === undefined) {
    return 'eof'
  }

  var code = ch.charCodeAt(0)

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30: // 0
      return ch

    case 0x5F: // _
    case 0x24: // $
      return 'ident'

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0:  // No-break space
    case 0xFEFF:  // Byte Order Mark
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return 'ws'
  }

  // a-z, A-Z
  if (
    (code >= 0x61 && code <= 0x7A) ||
    (code >= 0x41 && code <= 0x5A)
  ) {
    return 'ident'
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number'
  }

  return 'else'
}

/**
 * Parse a string path into an array of segments
 * Todo implement cache
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath (path) {
  var keys = []
  var index = -1
  var mode = BEFORE_PATH
  var c, newChar, key, type, transition, action, typeMap

  var actions = []
  actions[PUSH] = function () {
    if (key === undefined) {
      return
    }
    keys.push(key)
    key = undefined
  }
  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar
    } else {
      key += newChar
    }
  }

  function maybeUnescapeQuote () {
    var nextChar = path[index + 1]
    if ((mode === IN_SINGLE_QUOTE && nextChar === "'") ||
        (mode === IN_DOUBLE_QUOTE && nextChar === '"')) {
      index++
      newChar = nextChar
      actions[APPEND]()
      return true
    }
  }

  while (mode != null) {
    index++
    c = path[index]

    if (c === '\\' && maybeUnescapeQuote()) {
      continue
    }

    type = getPathCharType(c)
    typeMap = pathStateMachine[mode]
    transition = typeMap[type] || typeMap['else'] || ERROR

    if (transition === ERROR) {
      return // parse error
    }

    mode = transition[0]
    action = actions[transition[1]]
    if (action) {
      newChar = transition[2]
      newChar = newChar === undefined
        ? c
        : newChar === '*'
          ? newChar + c
          : newChar
      action()
    }

    if (mode === AFTER_PATH) {
      keys.raw = path
      return keys
    }
  }
}

/**
 * Format a accessor segment based on its type.
 *
 * @param {String} key
 * @return {Boolean}
 */

function formatAccessor (key) {
  if (identRE.test(key)) { // identifier
    return '.' + key
  } else if (+key === key >>> 0) { // bracket index
    return '[' + key + ']'
  } else if (key.charAt(0) === '*') {
    return '[o' + formatAccessor(key.slice(1)) + ']'
  } else { // bracket string
    return '["' + key.replace(/"/g, '\\"') + '"]'
  }
}

/**
 * Compiles a getter function with a fixed path.
 * The fixed path getter supresses errors.
 *
 * @param {Array} path
 * @return {Function}
 */

exports.compileGetter = function (path) {
  var body = 'return o' + path.map(formatAccessor).join('')
  return new Function('o', body)
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

exports.parse = function (path) {
  var hit = pathCache.get(path)
  if (!hit) {
    hit = parsePath(path)
    if (hit) {
      hit.get = exports.compileGetter(hit)
      pathCache.put(path, hit)
    }
  }
  return hit
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

exports.get = function (obj, path) {
  path = exports.parse(path)
  if (path) {
    return path.get(obj)
  }
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

exports.set = function (obj, path, val) {
  var original = obj
  if (typeof path === 'string') {
    path = exports.parse(path)
  }
  if (!path || !_.isObject(obj)) {
    return false
  }
  var last, key
  for (var i = 0, l = path.length; i < l; i++) {
    last = obj
    key = path[i]
    if (key.charAt(0) === '*') {
      key = original[key.slice(1)]
    }
    if (i < l - 1) {
      obj = obj[key]
      if (!_.isObject(obj)) {
        warnNonExistent(path)
        obj = {}
        last.$add(key, obj)
      }
    } else {
      if (_.isArray(obj)) {
        obj.$set(key, val)
      } else if (key in obj) {
        obj[key] = val
      } else {
        warnNonExistent(path)
        obj.$add(key, val)
      }
    }
  }
  return true
}

function warnNonExistent (path) {
  process.env.NODE_ENV !== 'production' && _.warn(
    'You are setting a non-existent path "' + path.raw + '" ' +
    'on a vm instance. Consider pre-initializing the property ' +
    'with the "data" option for more reliable reactivity ' +
    'and better performance.'
  )
}

}).call(this,require('_process'))
},{"../cache":14,"../util":68,"_process":1}],59:[function(require,module,exports){
var _ = require('../util')
var Cache = require('../cache')
var templateCache = new Cache(1000)
var idSelectorCache = new Cache(1000)

var map = {
  _default: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [
    2,
    '<table><tbody></tbody><colgroup>',
    '</colgroup></table>'
  ]
}

map.td =
map.th = [
  3,
  '<table><tbody><tr>',
  '</tr></tbody></table>'
]

map.option =
map.optgroup = [
  1,
  '<select multiple="multiple">',
  '</select>'
]

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>']

map.g =
map.defs =
map.symbol =
map.use =
map.image =
map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [
  1,
  '<svg ' +
    'xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'xmlns:ev="http://www.w3.org/2001/xml-events"' +
    'version="1.1">',
  '</svg>'
]

/**
 * Check if a node is a supported template node with a
 * DocumentFragment content.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isRealTemplate (node) {
  return _.isTemplate(node) &&
    node.content instanceof DocumentFragment
}

var tagRE = /<([\w:]+)/
var entityRE = /&\w+;|&#\d+;|&#x[\dA-F]+;/

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @return {DocumentFragment}
 */

function stringToFragment (templateString) {
  // try a cache hit first
  var hit = templateCache.get(templateString)
  if (hit) {
    return hit
  }

  var frag = document.createDocumentFragment()
  var tagMatch = templateString.match(tagRE)
  var entityMatch = entityRE.test(templateString)

  if (!tagMatch && !entityMatch) {
    // text only, return a single text node.
    frag.appendChild(
      document.createTextNode(templateString)
    )
  } else {

    var tag = tagMatch && tagMatch[1]
    var wrap = map[tag] || map._default
    var depth = wrap[0]
    var prefix = wrap[1]
    var suffix = wrap[2]
    var node = document.createElement('div')

    node.innerHTML = prefix + templateString.trim() + suffix
    while (depth--) {
      node = node.lastChild
    }

    var child
    /* eslint-disable no-cond-assign */
    while (child = node.firstChild) {
    /* eslint-enable no-cond-assign */
      frag.appendChild(child)
    }
  }

  templateCache.put(templateString, frag)
  return frag
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment (node) {
  // if its a template tag and the browser supports it,
  // its content is already a document fragment.
  if (isRealTemplate(node)) {
    _.trimNode(node.content)
    return node.content
  }
  // script template
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent)
  }
  // normal node, clone it to avoid mutating the original
  var clone = exports.clone(node)
  var frag = document.createDocumentFragment()
  var child
  /* eslint-disable no-cond-assign */
  while (child = clone.firstChild) {
  /* eslint-enable no-cond-assign */
    frag.appendChild(child)
  }
  _.trimNode(frag)
  return frag
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/show_bug.cgi?id=137755
var hasBrokenTemplate = (function () {
  /* istanbul ignore else */
  if (_.inBrowser) {
    var a = document.createElement('div')
    a.innerHTML = '<template>1</template>'
    return !a.cloneNode(true).firstChild.innerHTML
  } else {
    return false
  }
})()

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = (function () {
  /* istanbul ignore else */
  if (_.inBrowser) {
    var t = document.createElement('textarea')
    t.placeholder = 't'
    return t.cloneNode(true).value === 't'
  } else {
    return false
  }
})()

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

exports.clone = function (node) {
  if (!node.querySelectorAll) {
    return node.cloneNode()
  }
  var res = node.cloneNode(true)
  var i, original, cloned
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    var clone = res
    if (isRealTemplate(node)) {
      node = node.content
      clone = res.content
    }
    original = node.querySelectorAll('template')
    if (original.length) {
      cloned = clone.querySelectorAll('template')
      i = cloned.length
      while (i--) {
        cloned[i].parentNode.replaceChild(
          exports.clone(original[i]),
          cloned[i]
        )
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value
    } else {
      original = node.querySelectorAll('textarea')
      if (original.length) {
        cloned = res.querySelectorAll('textarea')
        i = cloned.length
        while (i--) {
          cloned[i].value = original[i].value
        }
      }
    }
  }
  return res
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *    Possible values include:
 *    - DocumentFragment object
 *    - Node object of type Template
 *    - id selector: '#some-template-id'
 *    - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} clone
 * @param {Boolean} noSelector
 * @return {DocumentFragment|undefined}
 */

exports.parse = function (template, clone, noSelector) {
  var node, frag

  // if the template is already a document fragment,
  // do nothing
  if (template instanceof DocumentFragment) {
    _.trimNode(template)
    return clone
      ? exports.clone(template)
      : template
  }

  if (typeof template === 'string') {
    // id selector
    if (!noSelector && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template)
      if (!frag) {
        node = document.getElementById(template.slice(1))
        if (node) {
          frag = nodeToFragment(node)
          // save selector to cache
          idSelectorCache.put(template, frag)
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template)
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template)
  }

  return frag && clone
    ? exports.clone(frag)
    : frag
}

},{"../cache":14,"../util":68}],60:[function(require,module,exports){
var Cache = require('../cache')
var config = require('../config')
var dirParser = require('./directive')
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
var cache, tagRE, htmlRE, firstChar, lastChar

/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex (str) {
  return str.replace(regexEscapeRE, '\\$&')
}

/**
 * Compile the interpolation tag regex.
 *
 * @return {RegExp}
 */

function compileRegex () {
  config._delimitersChanged = false
  var open = config.delimiters[0]
  var close = config.delimiters[1]
  firstChar = open.charAt(0)
  lastChar = close.charAt(close.length - 1)
  var firstCharRE = escapeRegex(firstChar)
  var lastCharRE = escapeRegex(lastChar)
  var openRE = escapeRegex(open)
  var closeRE = escapeRegex(close)
  tagRE = new RegExp(
    firstCharRE + '?' + openRE +
    '(.+?)' +
    closeRE + lastCharRE + '?',
    'g'
  )
  htmlRE = new RegExp(
    '^' + firstCharRE + openRE +
    '.*' +
    closeRE + lastCharRE + '$'
  )
  // reset cache
  cache = new Cache(1000)
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

exports.parse = function (text) {
  if (config._delimitersChanged) {
    compileRegex()
  }
  var hit = cache.get(text)
  if (hit) {
    return hit
  }
  text = text.replace(/\n/g, '')
  if (!tagRE.test(text)) {
    return null
  }
  var tokens = []
  var lastIndex = tagRE.lastIndex = 0
  var match, index, value, first, oneTime, twoWay
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
  /* eslint-enable no-cond-assign */
    index = match.index
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      })
    }
    // tag token
    first = match[1].charCodeAt(0)
    oneTime = first === 42 // *
    twoWay = first === 64  // @
    value = oneTime || twoWay
      ? match[1].slice(1)
      : match[1]
    tokens.push({
      tag: true,
      value: value.trim(),
      html: htmlRE.test(match[0]),
      oneTime: oneTime,
      twoWay: twoWay
    })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    })
  }
  cache.put(text, tokens)
  return tokens
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

exports.tokensToExp = function (tokens, vm) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token, vm)
    }).join('+')
  } else {
    return formatToken(tokens[0], vm, true)
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} single
 * @return {String}
 */

function formatToken (token, vm, single) {
  return token.tag
    ? vm && token.oneTime
      ? '"' + vm.$eval(token.value) + '"'
      : inlineFilters(token.value, single)
    : '"' + token.value + '"'
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/
function inlineFilters (exp, single) {
  if (!filterRE.test(exp)) {
    return single
      ? exp
      : '(' + exp + ')'
  } else {
    var dir = dirParser.parse(exp)[0]
    if (!dir.filters) {
      return '(' + exp + ')'
    } else {
      return 'this._applyFilters(' +
        dir.expression + // value
        ',null,' +       // oldValue (null for read)
        JSON.stringify(dir.filters) + // filter descriptors
        ',false)'        // write?
    }
  }
}

},{"../cache":14,"../config":19,"./directive":56}],61:[function(require,module,exports){
var _ = require('../util')

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.append = function (el, target, vm, cb) {
  apply(el, 1, function () {
    target.appendChild(el)
  }, vm, cb)
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.before = function (el, target, vm, cb) {
  apply(el, 1, function () {
    _.before(el, target)
  }, vm, cb)
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.remove = function (el, vm, cb) {
  apply(el, -1, function () {
    _.remove(el)
  }, vm, cb)
}

/**
 * Remove by appending to another parent with transition.
 * This is only used in block operations.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.removeThenAppend = function (el, target, vm, cb) {
  apply(el, -1, function () {
    target.appendChild(el)
  }, vm, cb)
}

/**
 * Append the childNodes of a fragment to target.
 *
 * @param {DocumentFragment} block
 * @param {Node} target
 * @param {Vue} vm
 */

exports.blockAppend = function (block, target, vm) {
  var nodes = _.toArray(block.childNodes)
  for (var i = 0, l = nodes.length; i < l; i++) {
    exports.before(nodes[i], target, vm)
  }
}

/**
 * Remove a block of nodes between two edge nodes.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 */

exports.blockRemove = function (start, end, vm) {
  var node = start.nextSibling
  var next
  while (node !== end) {
    next = node.nextSibling
    exports.remove(node, vm)
    node = next
  }
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

var apply = exports.apply = function (el, direction, op, vm, cb) {
  var transition = el.__v_trans
  if (
    !transition ||
    // skip if there are no js hooks and CSS transition is
    // not supported
    (!transition.hooks && !_.transitionEndEvent) ||
    // skip transitions for initial compile
    !vm._isCompiled ||
    // if the vm is being manipulated by a parent directive
    // during the parent's compilation phase, skip the
    // animation.
    (vm.$parent && !vm.$parent._isCompiled)
  ) {
    op()
    if (cb) cb()
    return
  }
  var action = direction > 0 ? 'enter' : 'leave'
  transition[action](op, cb)
}

},{"../util":68}],62:[function(require,module,exports){
var _ = require('../util')
var queue = []
var queued = false

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

exports.push = function (job) {
  queue.push(job)
  if (!queued) {
    queued = true
    _.nextTick(flush)
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush () {
  // Force layout
  var f = document.documentElement.offsetHeight
  for (var i = 0; i < queue.length; i++) {
    queue[i]()
  }
  queue = []
  queued = false
  // dummy return, so js linters don't complain about
  // unused variable f
  return f
}

},{"../util":68}],63:[function(require,module,exports){
var _ = require('../util')
var queue = require('./queue')
var addClass = _.addClass
var removeClass = _.removeClass
var transitionEndEvent = _.transitionEndEvent
var animationEndEvent = _.animationEndEvent
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'

var TYPE_TRANSITION = 1
var TYPE_ANIMATION = 2

var uid = 0

/**
 * A Transition object that encapsulates the state and logic
 * of the transition.
 *
 * @param {Element} el
 * @param {String} id
 * @param {Object} hooks
 * @param {Vue} vm
 */

function Transition (el, id, hooks, vm) {
  this.id = uid++
  this.el = el
  this.enterClass = id + '-enter'
  this.leaveClass = id + '-leave'
  this.hooks = hooks
  this.vm = vm
  // async state
  this.pendingCssEvent =
  this.pendingCssCb =
  this.cancel =
  this.pendingJsCb =
  this.op =
  this.cb = null
  this.justEntered = false
  this.entered = this.left = false
  this.typeCache = {}
  // bind
  var self = this
  ;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone']
    .forEach(function (m) {
      self[m] = _.bind(self[m], self)
    })
}

var p = Transition.prototype

/**
 * Start an entering transition.
 *
 * 1. enter transition triggered
 * 2. call beforeEnter hook
 * 3. add enter class
 * 4. insert/show element
 * 5. call enter hook (with possible explicit js callback)
 * 6. reflow
 * 7. based on transition type:
 *    - transition:
 *        remove class now, wait for transitionend,
 *        then done if there's no explicit js callback.
 *    - animation:
 *        wait for animationend, remove class,
 *        then done if there's no explicit js callback.
 *    - no css transition:
 *        done now if there's no explicit js callback.
 * 8. wait for either done or js callback, then call
 *    afterEnter hook.
 *
 * @param {Function} op - insert/show the element
 * @param {Function} [cb]
 */

p.enter = function (op, cb) {
  this.cancelPending()
  this.callHook('beforeEnter')
  this.cb = cb
  addClass(this.el, this.enterClass)
  op()
  this.entered = false
  this.callHookWithCb('enter')
  if (this.entered) {
    return // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.enterCancelled
  queue.push(this.enterNextTick)
}

/**
 * The "nextTick" phase of an entering transition, which is
 * to be pushed into a queue and executed after a reflow so
 * that removing the class can trigger a CSS transition.
 */

p.enterNextTick = function () {
  this.justEntered = true
  _.nextTick(function () {
    this.justEntered = false
  }, this)
  var enterDone = this.enterDone
  var type = this.getCssTransitionType(this.enterClass)
  if (!this.pendingJsCb) {
    if (type === TYPE_TRANSITION) {
      // trigger transition by removing enter class now
      removeClass(this.el, this.enterClass)
      this.setupCssCb(transitionEndEvent, enterDone)
    } else if (type === TYPE_ANIMATION) {
      this.setupCssCb(animationEndEvent, enterDone)
    } else {
      enterDone()
    }
  } else if (type === TYPE_TRANSITION) {
    removeClass(this.el, this.enterClass)
  }
}

/**
 * The "cleanup" phase of an entering transition.
 */

p.enterDone = function () {
  this.entered = true
  this.cancel = this.pendingJsCb = null
  removeClass(this.el, this.enterClass)
  this.callHook('afterEnter')
  if (this.cb) this.cb()
}

/**
 * Start a leaving transition.
 *
 * 1. leave transition triggered.
 * 2. call beforeLeave hook
 * 3. add leave class (trigger css transition)
 * 4. call leave hook (with possible explicit js callback)
 * 5. reflow if no explicit js callback is provided
 * 6. based on transition type:
 *    - transition or animation:
 *        wait for end event, remove class, then done if
 *        there's no explicit js callback.
 *    - no css transition:
 *        done if there's no explicit js callback.
 * 7. wait for either done or js callback, then call
 *    afterLeave hook.
 *
 * @param {Function} op - remove/hide the element
 * @param {Function} [cb]
 */

p.leave = function (op, cb) {
  this.cancelPending()
  this.callHook('beforeLeave')
  this.op = op
  this.cb = cb
  addClass(this.el, this.leaveClass)
  this.left = false
  this.callHookWithCb('leave')
  if (this.left) {
    return // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.leaveCancelled
  // only need to handle leaveDone if
  // 1. the transition is already done (synchronously called
  //    by the user, which causes this.op set to null)
  // 2. there's no explicit js callback
  if (this.op && !this.pendingJsCb) {
    // if a CSS transition leaves immediately after enter,
    // the transitionend event never fires. therefore we
    // detect such cases and end the leave immediately.
    if (this.justEntered) {
      this.leaveDone()
    } else {
      queue.push(this.leaveNextTick)
    }
  }
}

/**
 * The "nextTick" phase of a leaving transition.
 */

p.leaveNextTick = function () {
  var type = this.getCssTransitionType(this.leaveClass)
  if (type) {
    var event = type === TYPE_TRANSITION
      ? transitionEndEvent
      : animationEndEvent
    this.setupCssCb(event, this.leaveDone)
  } else {
    this.leaveDone()
  }
}

/**
 * The "cleanup" phase of a leaving transition.
 */

p.leaveDone = function () {
  this.left = true
  this.cancel = this.pendingJsCb = null
  this.op()
  removeClass(this.el, this.leaveClass)
  this.callHook('afterLeave')
  if (this.cb) this.cb()
  this.op = null
}

/**
 * Cancel any pending callbacks from a previously running
 * but not finished transition.
 */

p.cancelPending = function () {
  this.op = this.cb = null
  var hasPending = false
  if (this.pendingCssCb) {
    hasPending = true
    _.off(this.el, this.pendingCssEvent, this.pendingCssCb)
    this.pendingCssEvent = this.pendingCssCb = null
  }
  if (this.pendingJsCb) {
    hasPending = true
    this.pendingJsCb.cancel()
    this.pendingJsCb = null
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass)
    removeClass(this.el, this.leaveClass)
  }
  if (this.cancel) {
    this.cancel.call(this.vm, this.el)
    this.cancel = null
  }
}

/**
 * Call a user-provided synchronous hook function.
 *
 * @param {String} type
 */

p.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el)
  }
}

/**
 * Call a user-provided, potentially-async hook function.
 * We check for the length of arguments to see if the hook
 * expects a `done` callback. If true, the transition's end
 * will be determined by when the user calls that callback;
 * otherwise, the end is determined by the CSS transition or
 * animation.
 *
 * @param {String} type
 */

p.callHookWithCb = function (type) {
  var hook = this.hooks && this.hooks[type]
  if (hook) {
    if (hook.length > 1) {
      this.pendingJsCb = _.cancellable(this[type + 'Done'])
    }
    hook.call(this.vm, this.el, this.pendingJsCb)
  }
}

/**
 * Get an element's transition type based on the
 * calculated styles.
 *
 * @param {String} className
 * @return {Number}
 */

p.getCssTransitionType = function (className) {
  /* istanbul ignore if */
  if (
    !transitionEndEvent ||
    // skip CSS transitions if page is not visible -
    // this solves the issue of transitionend events not
    // firing until the page is visible again.
    // pageVisibility API is supported in IE10+, same as
    // CSS transitions.
    document.hidden ||
    // explicit js-only transition
    (this.hooks && this.hooks.css === false) ||
    // element is hidden
    isHidden(this.el)
  ) {
    return
  }
  var type = this.typeCache[className]
  if (type) return type
  var inlineStyles = this.el.style
  var computedStyles = window.getComputedStyle(this.el)
  var transDuration =
    inlineStyles[transDurationProp] ||
    computedStyles[transDurationProp]
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION
  } else {
    var animDuration =
      inlineStyles[animDurationProp] ||
      computedStyles[animDurationProp]
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION
    }
  }
  if (type) {
    this.typeCache[className] = type
  }
  return type
}

/**
 * Setup a CSS transitionend/animationend callback.
 *
 * @param {String} event
 * @param {Function} cb
 */

p.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event
  var self = this
  var el = this.el
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      _.off(el, event, onEnd)
      self.pendingCssEvent = self.pendingCssCb = null
      if (!self.pendingJsCb && cb) {
        cb()
      }
    }
  }
  _.on(el, event, onEnd)
}

/**
 * Check if an element is hidden - in that case we can just
 * skip the transition alltogether.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isHidden (el) {
  return el.style.display === 'none' ||
    el.style.visibility === 'hidden' ||
    el.hidden
}

module.exports = Transition

},{"../util":68,"./queue":62}],64:[function(require,module,exports){
(function (process){
var _ = require('./index')

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {String|undefined}
 */

exports.commonTagRE = /^(div|p|span|img|a|br|ul|ol|li|h1|h2|h3|h4|h5|code|pre)$/
exports.checkComponent = function (el, options) {
  var tag = el.tagName.toLowerCase()
  if (tag === 'component') {
    // dynamic syntax
    var exp = el.getAttribute('is')
    el.removeAttribute('is')
    return exp
  } else if (
    !exports.commonTagRE.test(tag) &&
    _.resolveAsset(options, 'components', tag)
  ) {
    return tag
  /* eslint-disable no-cond-assign */
  } else if (tag = _.attr(el, 'component')) {
  /* eslint-enable no-cond-assign */
    return tag
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 * The vm may have inherit:true so we need to make sure
 * we don't accidentally overwrite parent value.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

exports.initProp = function (vm, prop, value) {
  if (exports.assertProp(prop, value)) {
    var key = prop.path
    if (key in vm) {
      _.define(vm, key, value, true)
    } else {
      vm[key] = value
    }
    vm._data[key] = value
  }
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 */

exports.assertProp = function (prop, value) {
  // if a prop is not provided and is not required,
  // skip the check.
  if (prop.raw === null && !prop.required) {
    return true
  }
  var options = prop.options
  var type = options.type
  var valid = true
  var expectedType
  if (type) {
    if (type === String) {
      expectedType = 'string'
      valid = typeof value === expectedType
    } else if (type === Number) {
      expectedType = 'number'
      valid = typeof value === 'number'
    } else if (type === Boolean) {
      expectedType = 'boolean'
      valid = typeof value === 'boolean'
    } else if (type === Function) {
      expectedType = 'function'
      valid = typeof value === 'function'
    } else if (type === Object) {
      expectedType = 'object'
      valid = _.isPlainObject(value)
    } else if (type === Array) {
      expectedType = 'array'
      valid = _.isArray(value)
    } else {
      valid = value instanceof type
    }
  }
  if (!valid) {
    process.env.NODE_ENV !== 'production' && _.warn(
      'Invalid prop: type check failed for ' +
      prop.path + '="' + prop.raw + '".' +
      ' Expected ' + formatType(expectedType) +
      ', got ' + formatValue(value) + '.'
    )
    return false
  }
  var validator = options.validator
  if (validator) {
    if (!validator.call(null, value)) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Invalid prop: custom validator check failed for ' +
        prop.path + '="' + prop.raw + '"'
      )
      return false
    }
  }
  return true
}

function formatType (val) {
  return val
    ? val.charAt(0).toUpperCase() + val.slice(1)
    : 'custom type'
}

function formatValue (val) {
  return Object.prototype.toString.call(val).slice(8, -1)
}

}).call(this,require('_process'))
},{"./index":68,"_process":1}],65:[function(require,module,exports){
(function (process){
/**
 * Enable debug utilities.
 */

if (process.env.NODE_ENV !== 'production') {

  var config = require('../config')
  var hasConsole = typeof console !== 'undefined'

  /**
   * Log a message.
   *
   * @param {String} msg
   */

  exports.log = function (msg) {
    if (hasConsole && config.debug) {
      console.log('[Vue info]: ' + msg)
    }
  }

  /**
   * We've got a problem here.
   *
   * @param {String} msg
   */

  exports.warn = function (msg, e) {
    if (hasConsole && (!config.silent || config.debug)) {
      console.warn('[Vue warn]: ' + msg)
      /* istanbul ignore if */
      if (config.debug) {
        console.warn((e || new Error('Warning Stack Trace')).stack)
      }
    }
  }

  /**
   * Assert asset exists
   */

  exports.assertAsset = function (val, type, id) {
    /* istanbul ignore if */
    if (type === 'directive') {
      if (id === 'with') {
        exports.warn(
          'v-with has been deprecated in ^0.12.0. ' +
          'Use props instead.'
        )
        return
      }
      if (id === 'events') {
        exports.warn(
          'v-events has been deprecated in ^0.12.0. ' +
          'Pass down methods as callback props instead.'
        )
        return
      }
    }
    if (!val) {
      exports.warn('Failed to resolve ' + type + ': ' + id)
    }
  }
}

}).call(this,require('_process'))
},{"../config":19,"_process":1}],66:[function(require,module,exports){
(function (process){
var _ = require('./index')
var config = require('../config')

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

exports.query = function (el) {
  if (typeof el === 'string') {
    var selector = el
    el = document.querySelector(el)
    if (!el) {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Cannot find element: ' + selector
      )
    }
  }
  return el
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed byy doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

exports.inDoc = function (node) {
  var doc = document.documentElement
  var parent = node && node.parentNode
  return doc === node ||
    doc === parent ||
    !!(parent && parent.nodeType === 1 && (doc.contains(parent)))
}

/**
 * Extract an attribute from a node.
 *
 * @param {Node} node
 * @param {String} attr
 */

exports.attr = function (node, attr) {
  attr = config.prefix + attr
  var val = node.getAttribute(attr)
  if (val !== null) {
    node.removeAttribute(attr)
  }
  return val
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

exports.before = function (el, target) {
  target.parentNode.insertBefore(el, target)
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

exports.after = function (el, target) {
  if (target.nextSibling) {
    exports.before(el, target.nextSibling)
  } else {
    target.parentNode.appendChild(el)
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

exports.remove = function (el) {
  el.parentNode.removeChild(el)
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

exports.prepend = function (el, target) {
  if (target.firstChild) {
    exports.before(el, target.firstChild)
  } else {
    target.appendChild(el)
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

exports.replace = function (target, el) {
  var parent = target.parentNode
  if (parent) {
    parent.replaceChild(el, target)
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

exports.on = function (el, event, cb) {
  el.addEventListener(event, cb)
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

exports.off = function (el, event, cb) {
  el.removeEventListener(event, cb)
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

exports.addClass = function (el, cls) {
  if (el.classList) {
    el.classList.add(cls)
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' '
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim())
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

exports.removeClass = function (el, cls) {
  if (el.classList) {
    el.classList.remove(cls)
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' '
    var tar = ' ' + cls + ' '
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    el.setAttribute('class', cur.trim())
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element}
 */

exports.extractContent = function (el, asFragment) {
  var child
  var rawContent
  /* istanbul ignore if */
  if (
    exports.isTemplate(el) &&
    el.content instanceof DocumentFragment
  ) {
    el = el.content
  }
  if (el.hasChildNodes()) {
    exports.trimNode(el)
    rawContent = asFragment
      ? document.createDocumentFragment()
      : document.createElement('div')
    /* eslint-disable no-cond-assign */
    while (child = el.firstChild) {
    /* eslint-enable no-cond-assign */
      rawContent.appendChild(child)
    }
  }
  return rawContent
}

/**
 * Trim possible empty head/tail textNodes inside a parent.
 *
 * @param {Node} node
 */

exports.trimNode = function (node) {
  trim(node, node.firstChild)
  trim(node, node.lastChild)
}

function trim (parent, node) {
  if (node && node.nodeType === 3 && !node.data.trim()) {
    parent.removeChild(node)
  }
}

/**
 * Check if an element is a template tag.
 * Note if the template appears inside an SVG its tagName
 * will be in lowercase.
 *
 * @param {Element} el
 */

exports.isTemplate = function (el) {
  return el.tagName &&
    el.tagName.toLowerCase() === 'template'
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - fragment instance
 * - v-html
 * - v-if
 * - component
 * - repeat
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

exports.createAnchor = function (content, persist) {
  return config.debug
    ? document.createComment(content)
    : document.createTextNode(persist ? ' ' : '')
}

}).call(this,require('_process'))
},{"../config":19,"./index":68,"_process":1}],67:[function(require,module,exports){
// can we use __proto__?
exports.hasProto = '__proto__' in {}

// Browser environment sniffing
var inBrowser = exports.inBrowser =
  typeof window !== 'undefined' &&
  Object.prototype.toString.call(window) !== '[object Object]'

exports.isIE9 =
  inBrowser &&
  navigator.userAgent.toLowerCase().indexOf('msie 9.0') > 0

exports.isAndroid =
  inBrowser &&
  navigator.userAgent.toLowerCase().indexOf('android') > 0

// Transition property/event sniffing
if (inBrowser && !exports.isIE9) {
  var isWebkitTrans =
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  var isWebkitAnim =
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  exports.transitionProp = isWebkitTrans
    ? 'WebkitTransition'
    : 'transition'
  exports.transitionEndEvent = isWebkitTrans
    ? 'webkitTransitionEnd'
    : 'transitionend'
  exports.animationProp = isWebkitAnim
    ? 'WebkitAnimation'
    : 'animation'
  exports.animationEndEvent = isWebkitAnim
    ? 'webkitAnimationEnd'
    : 'animationend'
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

exports.nextTick = (function () {
  var callbacks = []
  var pending = false
  var timerFunc
  function nextTickHandler () {
    pending = false
    var copies = callbacks.slice(0)
    callbacks = []
    for (var i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }
  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined') {
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(counter)
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = counter
    }
  } else {
    timerFunc = setTimeout
  }
  return function (cb, ctx) {
    var func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (pending) return
    pending = true
    timerFunc(nextTickHandler, 0)
  }
})()

},{}],68:[function(require,module,exports){
var lang = require('./lang')
var extend = lang.extend

extend(exports, lang)
extend(exports, require('./env'))
extend(exports, require('./dom'))
extend(exports, require('./options'))
extend(exports, require('./component'))
extend(exports, require('./debug'))

},{"./component":64,"./debug":65,"./dom":66,"./env":67,"./lang":69,"./options":70}],69:[function(require,module,exports){
/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

exports.isReserved = function (str) {
  var c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

exports.toString = function (value) {
  return value == null
    ? ''
    : value.toString()
}

/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

exports.toNumber = function (value) {
  if (typeof value !== 'string') {
    return value
  } else {
    var parsed = Number(value)
    return isNaN(parsed)
      ? value
      : parsed
  }
}

/**
 * Convert string boolean literals into real booleans.
 *
 * @param {*} value
 * @return {*|Boolean}
 */

exports.toBoolean = function (value) {
  return value === 'true'
    ? true
    : value === 'false'
      ? false
      : value
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

exports.stripQuotes = function (str) {
  var a = str.charCodeAt(0)
  var b = str.charCodeAt(str.length - 1)
  return a === b && (a === 0x22 || a === 0x27)
    ? str.slice(1, -1)
    : false
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

exports.camelize = function (str) {
  return str.replace(/-(\w)/g, toUpper)
}

function toUpper (_, c) {
  return c ? c.toUpperCase() : ''
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

exports.hyphenate = function (str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g
exports.classify = function (str) {
  return str.replace(classifyRE, toUpper)
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

exports.bind = function (fn, ctx) {
  return function (a) {
    var l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

exports.toArray = function (list, start) {
  start = start || 0
  var i = list.length - start
  var ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

exports.extend = function (to, from) {
  for (var key in from) {
    to[key] = from[key]
  }
  return to
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isObject = function (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString
var OBJECT_STRING = '[object Object]'
exports.isPlainObject = function (obj) {
  return toString.call(obj) === OBJECT_STRING
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isArray = Array.isArray

/**
 * Define a non-enumerable property
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

exports.define = function (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

exports.debounce = function (func, wait) {
  var timeout, args, context, timestamp, result
  var later = function () {
    var last = Date.now() - timestamp
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      result = func.apply(context, args)
      if (!timeout) context = args = null
    }
  }
  return function () {
    context = this
    args = arguments
    timestamp = Date.now()
    if (!timeout) {
      timeout = setTimeout(later, wait)
    }
    return result
  }
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 *
 * @param {Array} arr
 * @param {*} obj
 */

exports.indexOf = function (arr, obj) {
  var i = arr.length
  while (i--) {
    if (arr[i] === obj) return i
  }
  return -1
}

/**
 * Make a cancellable version of an async callback.
 *
 * @param {Function} fn
 * @return {Function}
 */

exports.cancellable = function (fn) {
  var cb = function () {
    if (!cb.cancelled) {
      return fn.apply(this, arguments)
    }
  }
  cb.cancel = function () {
    cb.cancelled = true
  }
  return cb
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 */

exports.looseEqual = function (a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (
    exports.isObject(a) && exports.isObject(b)
      ? JSON.stringify(a) === JSON.stringify(b)
      : false
  )
  /* eslint-enable eqeqeq */
}

},{}],70:[function(require,module,exports){
(function (process){
var _ = require('./index')
var config = require('../config')
var extend = _.extend

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null)

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData (to, from) {
  var key, toVal, fromVal
  for (key in from) {
    toVal = to[key]
    fromVal = from[key]
    if (!to.hasOwnProperty(key)) {
      to.$add(key, fromVal)
    } else if (_.isObject(toVal) && _.isObject(fromVal)) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && _.warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.'
      )
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        childVal.call(this),
        parentVal.call(this)
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && _.warn(
      'The "el" option should be a function ' +
      'that returns a per-instance value in component ' +
      'definitions.'
    )
    return
  }
  var ret = childVal || parentVal
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function'
    ? ret.call(vm)
    : ret
}

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.created =
strats.ready =
strats.attached =
strats.detached =
strats.beforeCompile =
strats.compiled =
strats.beforeDestroy =
strats.destroyed =
strats.props = function (parentVal, childVal) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : _.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

/**
 * 0.11 deprecation warning
 */

strats.paramAttributes = function () {
  /* istanbul ignore next */
  process.env.NODE_ENV !== 'production' && _.warn(
    '"paramAttributes" option has been deprecated in 0.12. ' +
    'Use "props" instead.'
  )
}

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets (parentVal, childVal) {
  var res = Object.create(parentVal)
  return childVal
    ? extend(res, guardArrayAssets(childVal))
    : res
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch =
strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = {}
  extend(ret, parentVal)
  for (var key in childVal) {
    var parent = ret[key]
    var child = childVal[key]
    if (parent && !_.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : [child]
  }
  return ret
}

/**
 * Other object hashes.
 */

strats.methods =
strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = Object.create(parentVal)
  extend(ret, childVal)
  return ret
}

/**
 * Default strategy.
 */

var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} options
 */

function guardComponents (options) {
  if (options.components) {
    var components = options.components =
      guardArrayAssets(options.components)
    var def
    var ids = Object.keys(components)
    for (var i = 0, l = ids.length; i < l; i++) {
      var key = ids[i]
      if (_.commonTagRE.test(key)) {
        process.env.NODE_ENV !== 'production' && _.warn(
          'Do not use built-in HTML elements as component ' +
          'id: ' + key
        )
        continue
      }
      def = components[key]
      if (_.isPlainObject(def)) {
        def.id = def.id || key
        components[key] = def._Ctor || (def._Ctor = _.Vue.extend(def))
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 *
 * @param {Object} options
 */

function guardProps (options) {
  var props = options.props
  if (_.isPlainObject(props)) {
    options.props = Object.keys(props).map(function (key) {
      var val = props[key]
      if (!_.isPlainObject(val)) {
        val = { type: val }
      }
      val.name = key
      return val
    })
  } else if (_.isArray(props)) {
    options.props = props.map(function (prop) {
      return typeof prop === 'string'
        ? { name: prop }
        : prop
    })
  }
}

/**
 * Guard an Array-format assets option and converted it
 * into the key-value Object format.
 *
 * @param {Object|Array} assets
 * @return {Object}
 */

function guardArrayAssets (assets) {
  if (_.isArray(assets)) {
    var res = {}
    var i = assets.length
    var asset
    while (i--) {
      asset = assets[i]
      var id = asset.id || (asset.options && asset.options.id)
      if (!id) {
        process.env.NODE_ENV !== 'production' && _.warn(
          'Array-syntax assets must provide an id field.'
        )
      } else {
        res[id] = asset
      }
    }
    return res
  }
  return assets
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

exports.mergeOptions = function merge (parent, child, vm) {
  guardComponents(child)
  guardProps(child)
  var options = {}
  var key
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = merge(parent, child.mixins[i], vm)
    }
  }
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!(parent.hasOwnProperty(key))) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @return {Object|Function}
 */

exports.resolveAsset = function resolve (options, type, id) {
  var camelizedId = _.camelize(id)
  var pascalizedId = camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)
  var assets = options[type]
  var asset = assets[id] || assets[camelizedId] || assets[pascalizedId]
  while (
    !asset &&
    options._parent &&
    (!config.strict || options._repeat)
  ) {
    options = (options._context || options._parent).$options
    assets = options[type]
    asset = assets[id] || assets[camelizedId] || assets[pascalizedId]
  }
  return asset
}

}).call(this,require('_process'))
},{"../config":19,"./index":68,"_process":1}],71:[function(require,module,exports){
var _ = require('./util')
var extend = _.extend

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefiexed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue (options) {
  this._init(options)
}

/**
 * Mixin global API
 */

extend(Vue, require('./api/global'))

/**
 * Vue and every constructor that extends Vue has an
 * associated options object, which can be accessed during
 * compilation steps as `this.constructor.options`.
 *
 * These can be seen as the default options of every
 * Vue instance.
 */

Vue.options = {
  replace: true,
  directives: require('./directives'),
  elementDirectives: require('./element-directives'),
  filters: require('./filters'),
  transitions: {},
  components: {},
  partials: {}
}

/**
 * Build up the prototype
 */

var p = Vue.prototype

/**
 * $data has a setter which does a bunch of
 * teardown/setup work
 */

Object.defineProperty(p, '$data', {
  get: function () {
    return this._data
  },
  set: function (newData) {
    if (newData !== this._data) {
      this._setData(newData)
    }
  }
})

/**
 * Mixin internal instance methods
 */

extend(p, require('./instance/init'))
extend(p, require('./instance/events'))
extend(p, require('./instance/scope'))
extend(p, require('./instance/compile'))
extend(p, require('./instance/misc'))

/**
 * Mixin public API methods
 */

extend(p, require('./api/data'))
extend(p, require('./api/dom'))
extend(p, require('./api/events'))
extend(p, require('./api/child'))
extend(p, require('./api/lifecycle'))

module.exports = _.Vue = Vue

},{"./api/child":7,"./api/data":8,"./api/dom":9,"./api/events":10,"./api/global":11,"./api/lifecycle":12,"./directives":28,"./element-directives":43,"./filters":46,"./instance/compile":47,"./instance/events":48,"./instance/init":49,"./instance/misc":50,"./instance/scope":51,"./util":68}],72:[function(require,module,exports){
(function (process){
var _ = require('./util')
var config = require('./config')
var Dep = require('./observer/dep')
var expParser = require('./parsers/expression')
var batcher = require('./batcher')
var uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String} expression
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 * @constructor
 */

function Watcher (vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    _.extend(this, options)
  }
  var isFn = typeof expOrFn === 'function'
  this.vm = vm
  vm._watchers.push(this)
  this.expression = isFn ? expOrFn.toString() : expOrFn
  this.cb = cb
  this.id = ++uid // uid for batching
  this.active = true
  this.dirty = this.lazy // for lazy watchers
  this.deps = Object.create(null)
  this.newDeps = null
  this.prevError = null // for async error stacks
  // parse expression for getter/setter
  if (isFn) {
    this.getter = expOrFn
    this.setter = undefined
  } else {
    var res = expParser.parse(expOrFn, this.twoWay)
    this.getter = res.get
    this.setter = res.set
  }
  this.value = this.lazy
    ? undefined
    : this.get()
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false
}

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
  var id = dep.id
  if (!this.newDeps[id]) {
    this.newDeps[id] = dep
    if (!this.deps[id]) {
      this.deps[id] = dep
      dep.addSub(this)
    }
  }
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet()
  var vm = this.vm
  var value
  try {
    value = this.getter.call(vm, vm)
  } catch (e) {
    if (
      process.env.NODE_ENV !== 'production' &&
      config.warnExpressionErrors
    ) {
      _.warn(
        'Error when evaluating expression "' +
        this.expression + '". ' +
        (config.debug
          ? ''
          : 'Turn on debug mode to see stack trace.'
        ), e
      )
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value)
  }
  if (this.preProcess) {
    value = this.preProcess(value)
  }
  if (this.filters) {
    value = vm._applyFilters(value, null, this.filters, false)
  }
  this.afterGet()
  return value
}

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

Watcher.prototype.set = function (value) {
  var vm = this.vm
  if (this.filters) {
    value = vm._applyFilters(
      value, this.value, this.filters, true)
  }
  try {
    this.setter.call(vm, vm, value)
  } catch (e) {
    if (
      process.env.NODE_ENV !== 'production' &&
      config.warnExpressionErrors
    ) {
      _.warn(
        'Error when evaluating setter "' +
        this.expression + '"', e
      )
    }
  }
}

/**
 * Prepare for dependency collection.
 */

Watcher.prototype.beforeGet = function () {
  Dep.target = this
  this.newDeps = Object.create(null)
}

/**
 * Clean up for dependency collection.
 */

Watcher.prototype.afterGet = function () {
  Dep.target = null
  var ids = Object.keys(this.deps)
  var i = ids.length
  while (i--) {
    var id = ids[i]
    if (!this.newDeps[id]) {
      this.deps[id].removeSub(this)
    }
  }
  this.deps = this.newDeps
}

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync || !config.async) {
    this.run()
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued
      ? shallow
        ? this.shallow
        : false
      : !!shallow
    this.queued = true
    // record before-push error stack in debug mode
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.debug) {
      this.prevError = new Error('[vue] async stack trace')
    }
    batcher.push(this)
  }
}

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get()
    if (
      value !== this.value ||
      // Deep watchers and Array watchers should fire even
      // when the value is the same, because the value may
      // have mutated; but only do so if this is a
      // non-shallow update (caused by a vm digest).
      ((_.isArray(value) || this.deep) && !this.shallow)
    ) {
      // set new value
      var oldValue = this.value
      this.value = value
      // in debug + async mode, when a watcher callbacks
      // throws, we also throw the saved before-push error
      // so the full cross-tick stack trace is available.
      var prevError = this.prevError
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' &&
          config.debug && prevError) {
        this.prevError = null
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          _.nextTick(function () {
            throw prevError
          }, 0)
          throw e
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
    this.queued = this.shallow = false
  }
}

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
  // avoid overwriting another watcher that is being
  // collected.
  var current = Dep.target
  this.value = this.get()
  this.dirty = false
  Dep.target = current
}

/**
 * Depend on all deps collected by this watcher.
 */

Watcher.prototype.depend = function () {
  var depIds = Object.keys(this.deps)
  var i = depIds.length
  while (i--) {
    this.deps[depIds[i]].depend()
  }
}

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // we can skip this if the vm if being destroyed
    // which can improve teardown performance.
    if (!this.vm._isBeingDestroyed) {
      this.vm._watchers.$remove(this)
    }
    var depIds = Object.keys(this.deps)
    var i = depIds.length
    while (i--) {
      this.deps[depIds[i]].removeSub(this)
    }
    this.active = false
    this.vm = this.cb = this.value = null
  }
}

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {Object} obj
 */

function traverse (obj) {
  var key, val, i
  for (key in obj) {
    val = obj[key]
    if (_.isArray(val)) {
      i = val.length
      while (i--) traverse(val[i])
    } else if (_.isObject(val)) {
      traverse(val)
    }
  }
}

module.exports = Watcher

}).call(this,require('_process'))
},{"./batcher":13,"./config":19,"./observer/dep":53,"./parsers/expression":57,"./util":68,"_process":1}],73:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.watchman = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var global = global || window;

  /**
   * watchman
   *
   *   watchman('/', function(ctx) {
   *     console.log('I am on index.');
   *   });
   *   watchman({
   *     '/users': function(ctx) {
   *       console.log('I am showing the list of the users.');
   *     },
   *     '/user/:id': function(ctx) {
   *       console.log('I am showing a user. ID: %s', ctx.params.id);
   *     }
   *   });
   *   watchman('/user/' + user.id);
   *   watchman();
   * 
   * @param  {String/Object} path    path
   * @param  {Function} handler handle callback
   * 
   */
  function watch() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var path = args[0];
    var handler = args[1];

    if (args.length < 2) {

      // Run
      if (args.length === 0) return watch.run();

      switch (typeof path) {
        case 'object':
          for (var _path in path) {
            watch(_path, path[_path]);
          }
          break;

        case 'string':
          watch.run({ url: path });
          break;

        default:
          throw new Error('Illage usage.');
      }

      return watch;
    } else {
      if (!('_watching' in watch)) {
        watch._watching = [];
      }

      var rule = createRule(path, handler);
      watch._watching.push(rule);
    }

    return watch;
  }

  /**
   * Use some middlewares
   *
   *   watchman.use(
   *     function(ctx, next) {
   *       ctx.query = {}; // parse query string
   *       next();
   *     },
   *     function(ctx, next) {
   *       ctx.browser = {}; // parse browser info
   *       next();
   *     }
   *   );
   */
  watch.use = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (!('_watchman_middlewares' in watch)) watch._watchman_middlewares = [];

    Array.prototype.push.apply(watch._watchman_middlewares, args);

    return watch;
  };

  /**
   * Run the router
   *
   *   watchman.run();
   *   watchman.run({
   *     url: '/user/' + user.id
   *   });
   * 
   * @param  {Object} options options
   */
  watch.run = function () {
    var options = arguments[0] === undefined ? {} : arguments[0];

    // current path
    var path = options.url || global.location.pathname + global.location.hash.replace(/\?(.*)/, '');
    var watching = watch._watching;

    watch.emit('statechange', path);

    for (var i = 0; i < watching.length; i++) {
      if (watching[i].regexp.exec(path)) {
        var _ret = (function () {
          // Hit!

          // params
          var params = paramsParser(path, watching[i]);

          var ctx = {
            params: params,
            path: path
          };
          var hit = watching[i].handler;

          // run the middlewares
          if ('_watchman_middlewares' in watch) {
            (function () {
              var layer = function (index) {
                var curr = watch._watchman_middlewares[index];

                if (curr) {
                  curr(ctx, function () {
                    layer(++_i);
                  });
                } else {
                  hit(ctx);
                }
              };

              var _i = 0;

              layer(_i);
            })();
          } else {
            hit(ctx);
          }

          return 'break';
        })();

        if (_ret === 'break') break;
      }
    }

    if (!watch.running) {
      if ('onhashchange' in global) {
        switch ('function') {
          case typeof global.addEventListener:
            global.addHashChange = function (func, before) {
              global.addEventListener('hashchange', func, before);
            };
            global.removeHashChange = function (func) {
              global.removeEventListener('hashchange', func);
            };
            break;
          case typeof global.attachEvent:
            global.addHashChange = function (func) {
              global.attachEvent('onhashchange', func);
            };
            global.removeHashChange = function (func) {
              global.detachEvent('onhashchange', func);
            };
            break;
          default:
            global.addHashChange = function (func) {
              global.onhashchange = func;
            };
            global.removeHashChange = function (func) {
              if (global.onhashchange == func) {
                global.onhashchange = null;
              }
            };
        }
        var shim = ['pushState', 'replaceState'];
        for (var i = 0; i < shim.length; i++) {
          (function (name) {
            var method = global.history[name];

            if (method) {
              global.history[name] = function () {
                var rtn = method.apply(global.history, arguments);
                watch.run();
                return rtn;
              };
            }
          })(shim[i]);
        }
      } else {
        (function () {
          var hashChangeFuncs = watch.hashChangeFuncs = [];
          watch.oldHref = global.location.href;
          global.addHashChange = function (func, before) {
            if (typeof func === 'function') {
              watch.hashChangeFuncs[before ? 'unshift' : 'push'](func);
            }
          };
          global.removeHashChange = function (func) {
            for (var i = hashChangeFuncs.length - 1; i >= 0; --i) {
              if (hashChangeFuncs[i] === func) {
                hashChangeFuncs.splice(i, 1);
              }
            }
          };
          setInterval(function () {
            var newHref = global.location.href;
            if (watch.oldHref !== newHref) {
              watch.oldHref = newHref;
              for (var i = 0; i < hashChangeFuncs.length; i++) {
                hashChangeFuncs[i].call(global, {
                  'type': 'hashchange',
                  'newURL': newHref,
                  'oldURL': watch.oldHref
                });
              }
            }
          }, 100);
        })();
      }

      global.addHashChange(function () {
        watch.run();
      });

      watch.emit('watching');
      watch.running = true;
      if (options.callback && options.callback instanceof Function) {
        options.callback();
      }
    }

    return watch;
  };

  /**
   * Get and set the base of the routers.
   * @param  {String} base base path
   * @return {Function}      watchman
   */
  watch.base = function (base) {
    if (arguments.length == 0) return watch.__base;

    watch.__base = base;

    return watch;
  };
  watch.__base = '';

  /**
   * create a rule
   * @param  {String}  path    path
   * @param  {Funtion} handler handle callback
   * @return {Object}          rule object
   */
  function createRule(path, handler) {
    if ('*' !== path && 0 != path.indexOf(watch.__base)) {
      path = watch.__base + (path == '/' ? '' : path);
    }
    var rule = pathToRegExp(path);
    if (handler instanceof String) {
      (function () {
        var target = handler;
        handler = function () {
          watch({
            url: target
          });
        };
      })();
    }
    rule.handler = handler;

    return rule;
  }

  /**
   * Convert the path string to a RegExp object
   * @param  {String} path path
   * @return {RegExp}      RegExp object
   */
  function pathToRegExp(path) {
    if (path instanceof RegExp) {
      return {
        keys: [],
        regexp: path
      };
    }
    if (path instanceof Array) {
      path = '(' + path.join('|') + ')';
    }

    var rtn = {
      keys: [],
      regexp: null
    };

    rtn.regexp = new RegExp((isHashRouter(path) ? '' : '^') + path.replace(/([\/\(]+):/g, '(?:').replace(/\(\?:(\w+)((\(.*?\))*)/g, function (_, key, optional) {
      rtn.keys.push(key);
      var match = null;
      if (optional) {
        match = optional.replace(/\(|\)/g, '');
      } else {
        match = '/?([^/]+)';
      }
      return '(?:' + match + '?)';
    })
    // fix double closing brackets, are there any better cases?
    // make a commit and send us a pull request. XD
    .replace('))', ')').replace(/\*/g, '(.*)') + '$', 'i');

    return rtn;
  }

  // Events
  //
  watch.on = function (type, listener) {
    if (!('_events' in watch)) watch._events = {};

    if (typeof listener !== 'function') throw TypeError('listener must be a function');

    if (!this._events[type]) this._events[type] = [];

    this._events[type].push(listener);
    return watch;
  };

  watch.once = function (type, listener) {
    if (typeof listener !== 'function') throw TypeError('listener must be a function');

    function g() {
      watch.removeEventListener(type, g);
      listener.apply(watch, arguments);
    }
    watch.on(type, g);
    return watch;
  };

  watch.emit = function (type) {
    if (!('_events' in watch)) watch._events = {};

    var handlers = watch._events[type];

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        var args = slice(arguments).slice(1);
        handlers[i].apply(watch, args);
      }
    }
    return watch;
  };

  watch.removeEventListener = function (type, listener) {
    if (!('_events' in watch)) watch._events = {};

    if (typeof listener !== 'function') throw TypeError('listener must be a function');

    var handlers = watch._events[type];
    if (handlers) {
      var i = handlers.indexOf(listener);
      handlers.splice(i, 1);
    }
    return watch;
  };

  watch.removeAllListeners = function (type) {
    if (!('_events' in watch)) {
      watch._events = {};
    }

    delete watch._events[type];
    return watch;
  };

  /**
   * url params parser
   * @param  {String} url  current url
   * @param  {Object} rule matched rule
   * @return {Object}      params
   */
  function paramsParser(url, rule) {
    var matches = rule.regexp.exec(url).slice(1);
    var keys = rule.keys;
    var params = {};

    for (var i = 0; i < keys.length; i++) {
      params[keys[i]] = matches[i];
    }

    return params;
  }

  // Utils

  function isHashRouter(path) {
    return /^#/.test(path);
  }

  module.exports = watch;
});
},{}],74:[function(require,module,exports){
(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})();

},{}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _config = require('../config');

var duoshuoCode = '\n  <div class="ds-thread" data-thread-key="{{id}}" data-title="{{title}}" data-url="{{baseUrl}}/#!/post/{{id}}"></div>\n  <!-- 多说评论框 end -->\n  <!-- 多说公共JS代码 start (一个网页只需插入一次) -->\n  <script type="text/javascript">\n  <!-- 多说公共JS代码 end -->\n';

exports['default'] = _vue2['default'].component('duoshuo', {
  template: duoshuoCode,
  replace: true,
  props: ['post_title', 'post_id'],

  data: function data() {
    return {
      baseUrl: _config.blogUrl,
      id: this['post_id'],
      title: this['post_title']
    };
  },

  ready: function ready() {
    DUOSHUO.EmbedThread(document.querySelector('.ds-thread'));
  }

});
module.exports = exports['default'];

},{"../config":79,"vue":71}],76:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var template = '\n  <div class="panel panel-default">\n    <div v-if="title" class="panel-heading">\n      <h3 class="panel-title">\n        {{title}}\n      </h3>\n    </div>\n    <div class="panel-body">\n      <div v-if="content" v-html="content"></div>\n      <ul v-if="list">\n        <li v-repeat="el: list"><a href="{{el.link}}" target="_blank">{{el.title}}</a></li>\n      </ul>\n    </div>\n    <div v-if="footer" class="panel-footer">\n      {{footer}}\n    </div>\n  </div>\n';

_vue2['default'].component('Panel', {
  template: template,
  replace: true,
  props: ['title', 'content', 'footer', 'list'],

  data: function data() {
    return {
      title: this.title || false,
      content: this.content || false,
      list: this.list || false,
      footer: this.footer || false
    };
  }
});

},{"vue":71}],77:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var template = '\n  <div class="post" v-attr="id: id">\n    <h2><a href="/#!/post/{{id}}" v-text="title"></a></h2>\n    <p v-text="summary"></p>\n    <p>\n      <small>由 {{author}} 发表</small> | <small>{{comments}} 条评论</small> | <a class="btn" href="/#!/post/{{id}}">查看更多 »</a>\n    </p>\n  </div>\n';

var postComponent = _vue2['default'].component('post-in-list', {
  template: template,
  replace: true,

  filters: {
    marked: _marked2['default']
  }
});

exports['default'] = postComponent;
module.exports = exports['default'];

},{"marked":5,"vue":71}],78:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

require('./duoshuo');

var _modelsPosts = require('../models/posts');

var _modelsPosts2 = _interopRequireDefault(_modelsPosts);

var template = '\n  <h1 v-text="title"></h1>\n  <small>由 {{author}} 发表</small>\n  <div class="post" v-html="content | marked"></div>\n  <duoshuo v-if="loaded" post_id="{{id}}" post_title="{{title}}"></duoshuo>\n';

var postVm = _vue2['default'].component('post', {
  template: template,
  replace: true,
  props: ['id'],

  data: function data() {
    return {
      id: this.id,
      content: '',
      title: '',
      loaded: false
    };
  },

  created: _asyncToGenerator(function* () {
    var post = yield _modelsPosts2['default'].getPost(this.id);
    post.loaded = true;
    this.$data = post;
  }),

  filters: {
    marked: _marked2['default']
  }
});

exports['default'] = postVm;
module.exports = exports['default'];

},{"../models/posts":84,"./duoshuo":75,"marked":5,"vue":71}],79:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var blogUrl = 'http://es2015-in-action.avosapps.com';
exports.blogUrl = blogUrl;

},{}],80:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _modelsPosts = require('../models/posts');

var _modelsPosts2 = _interopRequireDefault(_modelsPosts);

require('../components/post-in-list');

require('../components/panel');

exports['default'] = _asyncToGenerator(function* (ctx) {
  ctx.layoutVM.$data.html = '\n    <h1>\n      ES2015 实战 - DEMO\n    </h1>\n    <hr>\n    <div id="posts" class="col-md-9">\n      <post-in-list v-repeat="posts"></post-in-list>\n    </div>\n    <div id="sidebar" class="col-md-3">\n      <panel title="公告" content="{{content}}" list="{{list}}"></panel>\n    </div>\n  ';

  var refresh = 'undefined' != typeof ctx.query.refresh;
  var page = ctx.query.page || 0;

  var posts = yield _modelsPosts2['default'].listPosts(page);

  _vue2['default'].nextTick(function () {
    new _vue2['default']({
      el: '#posts',
      data: {
        posts: posts
      }
    });

    new _vue2['default']({
      el: '#sidebar',
      data: {
        content: '文章地址 <a href="http://gank.io/post/" target="_blank">匠心写作</a>\n                  <br />\n                  感謝以下贊助商對本文的支持',
        list: [{ title: 'DaoCloud', link: 'http://daocloud.io' }]
      }
    });
  });
});
module.exports = exports['default'];

},{"../components/panel":76,"../components/post-in-list":77,"../models/posts":84,"vue":71}],81:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

require('../components/post');

exports['default'] = function (ctx) {
  ctx.layoutVM.$data.html = '\n    <div id="post">\n      <post id="' + ctx.params.id + '"></post>\n    </div>\n  ';

  _vue2['default'].nextTick(function () {
    new _vue2['default']({
      el: '#post'
    });
  });
};

module.exports = exports['default'];

},{"../components/post":78,"vue":71}],82:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _modelsPosts = require('../models/posts');

var _modelsPosts2 = _interopRequireDefault(_modelsPosts);

exports['default'] = _asyncToGenerator(function* (ctx) {
  ctx.layoutVM.$data.html = '\n    <form id="new-post" v-on="submit: submit">\n      <div class="form-group">\n        <label for="author">你的名字</label>\n        <input type="text" class="form-control" name="author" id="author" v-model="author" />\n      </div>\n      <div class="form-group">\n        <label for="title">标题</label>\n        <input type="text" class="form-control" name="title" id="title" v-model="title" />\n      </div>\n      <div class="form-group">\n        <label for="content">内容</label>\n        <div class="row">\n          <div class="col-md-6">\n            <textarea class="form-control" name="content" id="content" rows="10" v-model="content"></textarea>\n          </div>\n          <div class="col-md-6" v-html="content | marked"></div>\n        </div>\n      </div>\n      <button type="submit" class="btn btn-primary">提交</button>\n    </form>\n  ';

  _vue2['default'].nextTick(function () {
    new _vue2['default']({
      el: '#new-post',

      data: {
        title: '',
        content: '',
        author: ''
      },

      methods: {
        submit: _asyncToGenerator(function* (e) {
          e.preventDefault();

          var post = yield _modelsPosts2['default'].publishPost({
            title: this.$data.title,
            content: this.$data.content,
            author: this.$data.author
          });

          window.location.hash = '#!/post/' + post.id;
        })
      },

      filters: {
        marked: _marked2['default']
      }
    });
  });
});
module.exports = exports['default'];

},{"../models/posts":84,"marked":5,"min":6,"vue":71}],83:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

var _watchmanRouter = require('watchman-router');

var _watchmanRouter2 = _interopRequireDefault(_watchmanRouter);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _controllersIndex = require('./controllers/index');

var _controllersIndex2 = _interopRequireDefault(_controllersIndex);

var _controllersPost = require('./controllers/post');

var _controllersPost2 = _interopRequireDefault(_controllersPost);

var _controllersPublish = require('./controllers/publish');

var _controllersPublish2 = _interopRequireDefault(_controllersPublish);

var layoutVM = new _vue2['default']({
  el: '#wrapper',
  data: {
    html: ''
  }
});

var JSONPhelper = new _vue2['default']({
  el: '#jsonp-helper',
  data: {
    json: false,
    url: ''
  },

  methods: {
    load: function load(url) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.$data.url = url;
        window.jsonpcallback = function (data) {
          resolve(data);
        };
      });
    }
  }
});

(0, _watchmanRouter2['default'])({
  '/': _controllersIndex2['default'],
  '#!/': _controllersIndex2['default'],
  '#!/post/:id': _controllersPost2['default'],
  '#!/new': _controllersPublish2['default']
}).use(function (ctx, next) {
  ctx.layoutVM = layoutVM;
  ctx.jsonpHelper = JSONPhelper;
  ctx.query = _querystring2['default'].parse(window.location.search.substr(1));
  next();
}).run();

},{"./controllers/index":80,"./controllers/post":81,"./controllers/publish":82,"min":6,"querystring":4,"vue":71,"watchman-router":73}],84:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var listPosts = _asyncToGenerator(function* () {
  var page = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  var count = 10;

  var existsInMinDB = yield _min2['default'].exists('posts:id');

  if (!existsInMinDB) {
    var posts = (yield _fetchPost(page)).map(function (post) {
      return Object.defineProperties({
        id: post._id,
        title: post.title,
        content: post.content,
        author: post.author,
        comments: post.comments.length
      }, {
        summary: {
          get: function get() {
            return post.content.substr(0, 20) + '...';
          },
          configurable: true,
          enumerable: true
        }
      });
    });

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];

      yield _min2['default'].sadd('posts:id', post.id);
      yield _min2['default'].hmset('post:' + post.id, post);
    }
  } else {
    var ids = yield _min2['default'].smembers('posts:id');
    ids = ids.slice(page * count, (page + 1) * count);
    var posts = yield _min2['default'].mget(ids.map(function (id) {
      return 'post:' + id;
    }));
  }

  return posts;
});

var _fetchPost = _asyncToGenerator(function* (page) {
  var res = yield fetch('/api/posts/list?page=' + page);
  var reply = yield res.json();

  return reply.posts;
});

var getPost = _asyncToGenerator(function* (id) {
  return yield _min2['default'].hgetall('post:' + id);
});

var publishPost = _asyncToGenerator(function* (post) {
  var res = yield fetch('/api/posts/new', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
  });
  var _post = yield res.json();

  yield _min2['default'].sadd('posts:id', _post._id);
  yield _min2['default'].hmset('post:' + _post._id, Object.defineProperties({
    id: _post._id,
    title: _post.title,
    content: _post.content,
    author: _post.author,
    comments: 0
  }, {
    summary: {
      get: function get() {
        return _post.title.substr(0, 20) + '...';
      },
      configurable: true,
      enumerable: true
    }
  }));

  _post.id = _post._id;

  return _post;
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

require('whatwg-fetch');

var _min = require('min');

var _min2 = _interopRequireDefault(_min);

exports['default'] = {
  listPosts: listPosts,
  getPost: getPost,
  publishPost: publishPost
};
module.exports = exports['default'];

},{"min":6,"whatwg-fetch":74}]},{},[83]);
