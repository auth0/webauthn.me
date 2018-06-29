export function deepClone(object) {
  const result = {};

  for(const key in object) {
    const value = object[key];

    if(typeof value === 'object') {
      if(Array.isArray(value) ||
         value instanceof ArrayBuffer ||
         'length' in value) {
        result[key] = value.slice();
      } else {
        result[key] = deepClone(value);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function objectSlice(object, keys) {
  const result = {};
  for(const key of keys) {
    if(key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

export function findKey(object, key) {
  if(key in object) {
    return object[key];
  }

  for(const k in object) {
    const value = object[k];
    if(typeof value === 'object') {
      const result = findKey(value, key);
      if(typeof result !== 'undefined') {
        return result;
      }
    }
  }
}

export function findKeyWithPath(object, key) {
  if(key in object) {
    return {
      path: key,
      value: object[key]
    };
  }

  for(const k in object) {
    const value = object[k];
    if(typeof value === 'object') {
      const result = findKey(value, key);
      if(typeof result.value !== 'undefined') {
        return {
          path: `${k}.${result.path}`,
          value: result.value
        };
      }
    }
  }

  return {
    path: '',
    value: undefined
  };
}

export function findAllKeys(object, key) {
  const result = [];

  for(const k in object) {
    const value = object[k];
    if(k == key) {
      result.push(value);
    }
    if(typeof value === 'object') {
      const r = findAllKeys(value, key);
      if(r.length > 0) {
        result.push(...r);
      }
    }
  }

  return result;
}

export function getByPath(object, path) {
  const split = path.split('.');
  let obj = object;
  for(const part of split) {
    obj = obj[part];
  }

  return obj;
}
