import errors from '@/locales/en/errors.json';
import i18n from './i18n';

const knownMessages = new Set(Object.keys(errors));

/** Only localize known application messages; never rewrite provider details or user data. */
export function localizeErrorMessage(message: string): string {
  if (!knownMessages.has(message)) return message;
  return i18n.t(message as keyof typeof errors, {
    ns: 'errors', keySeparator: false, defaultValue: message,
  });
}
