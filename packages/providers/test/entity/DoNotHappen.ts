const defaultWaitTime = 200;

export const doNotHappen = async (
  testMethod: (rejectHandler: (reason?: string) => void) => void,
  waitTime = defaultWaitTime,
): Promise<void | never> => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => resolve(), waitTime);
    testMethod(reject);
  });
};

export const doNotHappenAsync = async (
  testMethod: (rejectHandler: () => void) => Promise<void>,
  waitTime = defaultWaitTime,
): Promise<void | never> => {
  return new Promise<void>(async (resolve, reject) => {
    setTimeout(() => resolve(), waitTime);
    await testMethod(reject);
  });
};
