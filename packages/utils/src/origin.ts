import { SpecialOriginMark, SpecialOriginMarkValues, AnyOriginMark } from '@portkey/provider-types';

/**
 * determine whether the origin is a special origin, special origin is unacceptable to be an unique origin name for server
 * @param origin particular origin name
 * @returns {boolean} whether the origin is a special origin
 */
export const isSpecialOrigin = (origin: string): origin is SpecialOriginMark => {
  return SpecialOriginMarkValues.includes(origin);
};

export const generateOriginMark = (seed: number = 999999): AnyOriginMark => {
  return `origin-${Date.now()}-${Math.floor(Math.random() * seed)}`;
};
