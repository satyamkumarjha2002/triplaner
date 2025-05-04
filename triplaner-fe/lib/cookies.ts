// Cookie utility functions
import Cookies from 'js-cookie';

export const cookieOptions = {
  expires: 7, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

export const setCookie = (name: string, value: string): void => {
  Cookies.set(name, value, cookieOptions);
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string): void => {
  Cookies.remove(name, { path: '/' });
}; 