import { userErrorMessage } from './userError';
import { utilsErrorMessage } from './utilsError';
import { worksErrorMessage } from './workError';

type messageType = typeof userErrorMessage & typeof worksErrorMessage & typeof utilsErrorMessage;

export type ErrorMessageType = keyof messageType;

export const allErrorMessage = {
  ...userErrorMessage,
  ...worksErrorMessage,
  ...utilsErrorMessage,
};
