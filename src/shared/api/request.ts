type RequestMethod = 'GET';

type RequestOptions = {
  method?: RequestMethod;
  signal?: AbortSignal;
};

export const request = async <TResponse>(input: string, options: RequestOptions = {}): Promise<TResponse> => {
  const { method = 'GET', signal } = options;

  const response = await fetch(input, {
    method,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
};
