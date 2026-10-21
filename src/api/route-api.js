const ENDPOINT = 'https://22.objects.htmlacademy.pro/big-trip';

export default class RouteApi {
  #authorization = `Basic ${crypto.randomUUID()}`;

  async load(resource) {
    const response = await fetch(`${ENDPOINT}/${resource}`, {
      headers: {Authorization: this.#authorization},
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }
}
