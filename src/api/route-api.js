const ENDPOINT = 'https://22.objects.htmlacademy.pro/big-trip';

export default class RouteApi {
  #authorization = `Basic ${crypto.randomUUID()}`;

  async request(resource, method = 'GET', data) {
    const response = await fetch(`${ENDPOINT}/${resource}`, {
      method,
      headers: {
        Authorization: this.#authorization,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  }
}
