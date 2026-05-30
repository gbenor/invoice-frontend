export const APP_VERSION = __APP_VERSION__;
export const BUILD_TIME = __BUILD_TIME__;
export const GIT_SHA = __GIT_SHA__;

export function getDisplayVersion() {
  return GIT_SHA ? `${APP_VERSION} (${GIT_SHA})` : APP_VERSION;
}
