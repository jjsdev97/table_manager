export function isObject(target) {
  return typeof target === "object" && target != null;
}

export function objectToString(object) {
  
  return JSON.stringify(object);
}
