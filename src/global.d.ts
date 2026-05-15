import en from './shared/langs/en.json';

type Messages = typeof en;

declare global {
  type AbstractIntlMessages = Messages;
}
