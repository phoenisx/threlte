import type { createThrelteContext } from '@threlte/core';

export type Props = { children?: Snippet } & Parameters<typeof createThrelteContext>[0];
