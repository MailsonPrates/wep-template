let setErrorFn = null;

export function registerSetError(fn) {
  setErrorFn = fn;
}

export function triggerError(error) {
  if (setErrorFn) setErrorFn(error);
}
