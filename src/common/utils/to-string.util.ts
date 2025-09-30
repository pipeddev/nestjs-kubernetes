export const ToStringUtils = {
  toString: (obj: unknown): string => {
    if (obj === null || obj === undefined) return '<null>';

    const entries = Object.entries(obj);
    const entriesString = entries.map(([key, value]) => `${key}: ${value}`).join(', ');

    return `${obj.constructor.name} { ${entriesString} }`;
  },
};
