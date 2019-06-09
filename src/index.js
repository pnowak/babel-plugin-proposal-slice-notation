import { declare } from "@babel/helper-plugin-utils";
import syntaxSliceNotation from "@babel/plugin-syntax-slice-notation";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

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

    for (let index = start; index < end; index += step) {
      if (object[index]) {
        a.push(object[index]);
      }
    }

    return typeof object === 'string' ? a.join('') : a;
  }

  return {
    name: "proposal-slice-notation",
    inherits: syntaxSliceNotation,

    visitor: {
      memberExpression(path) {
        const { node, scope } = path;
        const { object, property, computed } = node;

        if (computed !== true && !hasLengthProperty(object)) {
          return;
        }

        const DEFAULT_START = 0;
        const DEFAULT_END = object.length;
        const DEFAULT_STEP = 1;

        if (t.numericLiteral(property)) {
          const start = property.value || DEFAULT_START;
          const end = DEFAULT_END;
          const step = DEFAULT_STEP;

        }

        if (!(~Math.sign(start))) {
          start = Math.max((start + object.length), 0);
        }

        if (!(~Math.sign(end))) {
          end = Math.max((end + object.length), 0);
        }

        path.replaceWith(
          t.forStatement(
            t.variableDeclaration("let", start),
            t.binaryExpression(
              "<",
              t.cloneNode(start),
              t.memberExpression(t.cloneNode(object), t.identifier("length")),
            ),
            t.updateExpression("++", t.cloneNode(step)),
            block,
          ),
        );
      },
    },
  };
});
