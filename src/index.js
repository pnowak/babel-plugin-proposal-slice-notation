import { declare } from "@babel/helper-plugin-utils";
import syntaxSliceNotation from "@babel/plugin-syntax-slice-notation";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-slice-notation",
    inherits: syntaxSliceNotation,

    function hasLengthProperty(object) {
      if (typeof object === 'string') {
        object = Object(object);
      }

      if ('length' in object) {
        return true;

      } else {
        return false;
      }
    }

    function slice(start = 0, end = object.length, step = 1) {
      const a = [];

      if (!(~Math.sign(start))) {
        start = Math.max((start + object.length), 0);
      }

      if (!(~Math.sign(end))) {
        end = Math.max((end + object.length), 0);
      }

      for (let index = start; index < end; index += step) {
        if (object[index]) {
          a.push(object[index]);
        }
      }

      return typeof object === 'string' ? a.join('') : a;
    }

    visitor: {
      memberExpression(path) {
        const { node, scope } = path;
        const { object, property, computed, optional } = node;
        if (computed !== true && !hasLengthProperty(object)) {
          return;
        }
      },
    },
  };
});
