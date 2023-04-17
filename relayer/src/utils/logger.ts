import logger from 'pino';

export const log = logger({
  prettifier: true,
  base: {
    pid: false
  }
});

export const reportError = (error: Error, fallback = 'Internal server error') => {
  log.error(error?.message ?? fallback);
};
