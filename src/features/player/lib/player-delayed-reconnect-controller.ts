type PlayerDelayedReconnectController = {
  schedule: () => void;
  clear: () => void;
};

type PlayerDelayedReconnectControllerParams = {
  delayMs: number;
  getRequestId: () => number;
  isActualRequest: (requestId: number) => boolean;
  onReconnect: () => void;
};

export const createPlayerDelayedReconnectController = (
  params: PlayerDelayedReconnectControllerParams,
): PlayerDelayedReconnectController => {
  let reconnectTimeout: number | null = null;

  const clear = () => {
    if (reconnectTimeout === null) {
      return;
    }

    window.clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  };

  return {
    schedule: () => {
      if (reconnectTimeout !== null) {
        return;
      }

      const requestId = params.getRequestId();

      reconnectTimeout = window.setTimeout(() => {
        reconnectTimeout = null;

        if (!params.isActualRequest(requestId)) {
          return;
        }

        params.onReconnect();
      }, params.delayMs);
    },

    clear,
  };
};
