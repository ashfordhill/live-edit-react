module.exports = {
  presets: [],
  plugins: [
    function liveEditAnnotate({ types: t }) {
      return {
        visitor: {
          JSXOpeningElement(path) {
            const isDev = process.env.NODE_ENV !== 'production';
            if (!isDev) return;

            const leIdAttr = path.node.attributes.find(
              (a) =>
                t.isJSXAttribute(a) &&
                t.isJSXIdentifier(a.name) &&
                a.name.name === 'leId'
            );

            if (!leIdAttr) return;

            let leIdValue = '';
            if (
              leIdAttr.value &&
              t.isStringLiteral(leIdAttr.value)
            ) {
              leIdValue = leIdAttr.value.value;
            } else if (
              leIdAttr.value &&
              t.isJSXExpressionContainer(leIdAttr.value) &&
              t.isStringLiteral(leIdAttr.value.expression)
            ) {
              leIdValue = leIdAttr.value.expression.value;
            }

            if (!leIdValue) return;

            const hasDataLeId = path.node.attributes.some(
              (a) =>
                t.isJSXAttribute(a) &&
                t.isJSXIdentifier(a.name) &&
                a.name.name === 'data-le-id'
            );

            if (!hasDataLeId) {
              path.node.attributes.push(
                t.jsxAttribute(t.jsxIdentifier('data-le-id'), t.stringLiteral(leIdValue))
              );
            }
          }
        }
      };
    }
  ]
};
