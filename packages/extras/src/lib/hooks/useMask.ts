import { NotEqualStencilFunc, EqualStencilFunc, KeepStencilOp } from 'three'
export const useMask = (id = 1, inverse = false) => {
  return {
    stencilRef: id,
    stencilWrite: true,
    stencilFunc: inverse ? NotEqualStencilFunc : EqualStencilFunc,
    stencilFail: KeepStencilOp,
    stencilZFail: KeepStencilOp,
    stencilZPass: KeepStencilOp
  }
}
