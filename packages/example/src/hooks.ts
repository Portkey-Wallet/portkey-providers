import { Accounts, ChainIds, ChainsInfo } from '@portkey/provider-types';
import { useReducer } from 'react';

export enum Actions {
  setState = 'SET_STATE',
  destroy = 'DESTROY',
}

export type State = {
  chainIds?: ChainIds;
  accounts?: Accounts;
  chainsInfo?: ChainsInfo;
};

//reducer
function reducer(state: State, { type, payload }: { type: Actions; payload: any }) {
  switch (type) {
    case Actions.destroy: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}
export function useExampleState(): [State, (actions: { type: Actions; payload: State }) => void] {
  const [state, dispatch]: [State, (actions: { type: Actions; payload: State }) => void] = useReducer(reducer, {});
  return [state, dispatch];
}