import { useState, useEffect, useCallback, useRef } from "react";
import { extractError } from "../utils/helpers";

/**
 * Generic data-fetching hook.
 *
 * @param {Function} fetchFn   - Async function that returns an Axios response
 * @param {Array}    deps      - Re-fetch when these deps change (default: [])
 * @param {boolean}  immediate - Whether to fetch immediately on mount (default: true)
 *
 * Returns { data, loading, error, refetch }
 */
function useFetch(fetchFn, deps = [], immediate = true) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);

  // Keep a ref to avoid calling setState on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      if (mountedRef.current) setData(response.data);
    } catch (err) {
      if (mountedRef.current) setError(extractError(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

export default useFetch;
