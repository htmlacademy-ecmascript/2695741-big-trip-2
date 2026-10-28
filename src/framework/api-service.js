const HttpStatus = {
  NO_CONTENT: 204,
};

export default class ApiService {
  #endpoint;
  #authorization;

  constructor(endpoint, authorization) {
    this.#endpoint = endpoint;
    this.#authorization = authorization;
  }

  async request(resource, method = 'GET', data) {
    const response = await fetch(`${this.#endpoint}/${resource}`, {
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

    return response.status === HttpStatus.NO_CONTENT ? null : response.json();
  }
}
