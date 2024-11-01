import { setContext } from 'svelte'
import { currentWritable } from "@threlte/core";

export const createUserContext = () => {
  const userCtx= currentWritable({});

  setContext<any>('threlte-user-context', userCtx)
}
