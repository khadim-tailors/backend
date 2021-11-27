// Takes object and sanitize by looping all values of the object if the value is string
const sanitize = (values) => {
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") {
      values[key] = escapeHTML(value);
    } else if (Array.isArray(value)) {
      values[key] = sanitizeArray(value);
    }
  }
};

// Takes arrary and loops through it and sanitize
const sanitizeArray = (value) => {
  const list = [];
  value.forEach(item => {
    if (typeof item === 'string') {
      list.push(escapeHTML(item));
    }
  });
};

const escapeHTML = str =>
  str.replace(
    /[&<>'"]/g,
    tag =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );

module.exports = sanitize;