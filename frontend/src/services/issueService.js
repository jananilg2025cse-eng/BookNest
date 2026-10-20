const API_URL = '/api/issues';

async function requestIssue(path = '', options = {}, action = 'Issue request') {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Could not connect to the circulation API. Check that the backend is running.');
  }

  const data = response.status === 204
    ? null
    : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `${action} failed (HTTP ${response.status}).`);
  }

  return data;
}

export async function fetchActiveIssues() {
  const issues = await requestIssue('', {}, 'Loading active issues');

  if (!Array.isArray(issues)) {
    throw new Error('The circulation API returned an invalid response.');
  }

  return issues;
}

export function createIssue(issue) {
  return requestIssue('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(issue),
  }, 'Issuing book');
}

export function returnIssue(id) {
  return requestIssue(`/${encodeURIComponent(id)}/return`, {
    method: 'POST',
  }, 'Returning book');
}
