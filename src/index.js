import { declare } from "@babel/helper-plugin-utils";
import syntaxSliceNotation from "@babel/plugin-syntax-slice-notation";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  const hasLengthProperty = object => {
    if (typeof object === 'string') {
      object = Object(object);
    }

    if ('length' in object) {
      return true;

    } else {
      return false;
    }
  }

  const setValue = (expression, bound, defaultValue) => {
    if (t.numericLiteral(expression)) {
      bound = expression.value;

    } else if (t.unaryExpression(expression) && t.isUnaryExpression({ operator: "-" })) {
      if (expression !== thirdExpression) {
        bound = Math.max((expression.argument.value + defaultValue), 0);

      } else {
        //HOW TRAVERSE OBJECT IN REVERSE IF `STEP` IS NEGATIVE NUMBER?
      }

    } else {
      bound = defaultValue;
    }
  }

  const slice = t.functionExpression(
    null,
    [t.identifier("start"), t.identifier("end"), t.identifier("step")],
    t.blockStatement([
      t.variableDeclaration("const", [
        t.assignmentExpression(
          "=",
          t.identifier("a"),
          t.arrayExpression([]),
        ),
      ]),
      t.forStatement(
        t.variableDeclaration("let", [
          t.assignmentExpression(
            "=",
            t.identifier("index"),
            t.identifier("start"),
          ),
        ]),
        t.binaryExpression(
          "<",
          t.identifier("index"),
          t.identifier("end"),
        ),
        t.assignmentExpression(
          "+=",
          t.identifier("index"),
          t.identifier("step")
        ),
        t.ifStatement(
          t.memberExpression(
            t.identifier("object"),
            t.identifier("index"),
            true
          ),
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  t.identifier("a"),
                  t.identifier("push")
                ),
                [t.memberExpression(
                  t.identifier("object"),
                  t.identifier("index"),
                  true
                )]
              ),
            ),
          ]),
        ),
      ),
      t.returnStatement(
        t.conditionalExpression(
          t.binaryExpression(
            "===",
            t.unaryExpression(
              "typeof",
              t.identifier("object"),
            ),
            t.stringLiteral("string")
          ),
          t.callExpression(
            t.memberExpression(
              t.identifier("a"),
              t.identifier("join")
            ),
            [t.stringLiteral("")]
          ),
          t.identifier("a"),
        )
      )
    ]),
  );

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
          t.callExpression(slice, [
            t.numericLiteral(start),
            t.numericLiteral(end),
            t.numericLiteral(step)
          ])
        );
      },
    },
  };
});
