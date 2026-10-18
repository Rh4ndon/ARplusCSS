import { useCallback, useEffect, useState } from 'react';
import { getARSupport } from '../utils/arSupport';

const INITIAL_STATE = { checking: true, support: null };

/**
 * Probes AR support once on mount. Defaults to "supported" if the probe itself
 * fails, so a probe fault never blocks AR on a capable device.
 */
export function useARSupport() {
  const [state, setState] = useState(INITIAL_STATE);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ checking: true, support: prev.support }));

    getARSupport()
      .then((support) => {
        if (!cancelled) setState({ checking: false, support });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            checking: false,
            support: { supported: true, uncertain: true, source: 'error', reason: error?.message },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return { ...state, refresh };
}
