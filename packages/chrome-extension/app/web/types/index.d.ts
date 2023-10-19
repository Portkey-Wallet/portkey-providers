export interface PortKeyResultType {
  error: keyof typeof errorMap;
  name?: string;
  message?: string;
  Error?: any;
  stack?: any;
  data?: any;
}
type SendResponseParams = PortKeyResultType & { data?: any };
export type SendResponseFun = (response?: SendResponseParams) => void;
export type CreatePromptType = 'tabs' | 'windows';
export type EditType = 'view' | 'edit';

export interface CustomEventType extends Event {
  detail?: string;
}
