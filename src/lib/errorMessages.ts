import errors from '@/locales/en/errors.json';
import i18n from './i18n';

/** Only localize known application messages; never rewrite provider details or user data. */
export function localizeErrorMessage(message: string): string {
  if (!Object.hasOwn(errors, message)) return message;
  return i18n.t(message as keyof typeof errors, {
    ns: 'errors', keySeparator: false, defaultValue: message,
  });
}
