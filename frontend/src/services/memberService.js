const API_URL = '/api/members';

async function requestMember(path = '', options = {}, action = 'Member request') {
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
    throw new Error('Could not connect to the members API. Check that the backend is running.');
  }

  const data = response.status === 204
    ? null
    : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `${action} failed (HTTP ${response.status}).`);
  }

  return data;
}

export async function fetchAllMembers() {
  const members = await requestMember('', {}, 'Loading members');

  if (!Array.isArray(members)) {
    throw new Error('The members API returned an invalid response.');
  }

  return members;
}

export function createMember(member) {
  return requestMember('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  }, 'Adding member');
}

export function updateMember(id, member) {
  return requestMember(`/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  }, 'Updating member');
}

export function deleteMember(id) {
  return requestMember(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }, 'Deleting member');
}