import { useCallback, useEffect, useRef, useState } from 'react';
import { errMsg } from '../utils/ui.js';

// Runs an async function on mount/deps change and tracks loading + error state.
export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const alive = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await fnRef.current();
      if (alive.current) setState({ data, loading: false, error: '' });
      return data;
    } catch (e) {
      if (alive.current) setState({ data: null, loading: false, error: errMsg(e) });
      return null;
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    alive.current = true;
    run();
    return () => { alive.current = false; };
  }, [run, ...deps]); // eslint-disable-line

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
