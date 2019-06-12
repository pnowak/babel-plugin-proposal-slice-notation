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

  function setValue(expression, bound, defaultValue) {
    if (t.numericLiteral(expression)) {
      bound = expression.value;

    } else if (t.unaryExpression(expression) && t.isUnaryExpression({ operator: "-" })) {
      bound = Math.max((expression.argument.value + defaultValue), 0);
      //HOW TRAVERSE OBJECT IN REVERSE IF `STEP` IS NEGATIVE NUMBER?

    } else {
      bound = defaultValue;
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
        let start;
        let end;
        let step;

        if (t.numericLiteral(property)) {
          start = property.value || DEFAULT_START;
          end = DEFAULT_END;
          step = DEFAULT_STEP;

        } else if (t.sequenceExpression(property)) {
          const firstExpression = property[0];
          const secondExpression = property[1];
          const thirdExpression = property[2];

          setValue(firstExpression, start, DEFAULT_START);
          setValue(secondExpression, end, DEFAULT_END);
          setValue(thirdExpression, step, DEFAULT_STEP);
        }

        path.replaceWith(
          t.forStatement(
            t.variableDeclaration("let", start),
            t.binaryExpression(
              "<",
              t.cloneNode(start),
              t.cloneNode(end),
            ),
            t.updateExpression("++", t.cloneNode(step)),
            block,
          ),
        );
      },
    },
  };
});
