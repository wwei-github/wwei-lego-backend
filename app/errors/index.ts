import { userErrorMessage } from './userError';
import { worksErrorMessage } from './workError';

type messageType = typeof userErrorMessage & typeof worksErrorMessage;

export type ErrorMessageType = keyof messageType;

export const allErrorMessage = {
  ...userErrorMessage,
  ...worksErrorMessage,
};
