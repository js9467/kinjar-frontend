export type CanControlAction = 'stop-transmission' | 'reset-arduino' | 'reset-transceiver';

export interface CanControlResponse {
  status?: string;
  message?: string;
}

function defaultMessageForAction(action: CanControlAction): string {
  switch (action) {
    case 'stop-transmission':
      return 'Transmission stop command sent.';
    case 'reset-arduino':
      return 'Arduino reset command sent.';
    case 'reset-transceiver':
      return 'MCP2515 reset command sent.';
    default:
      return 'Command dispatched.';
  }
}

export async function sendCanControl(action: CanControlAction): Promise<CanControlResponse> {
  const response = await fetch('/api/can/control', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as Record<string, unknown>).error)
        : null) ?? `Unable to complete ${action} command.`;
    throw new Error(errorMessage);
  }

  const result =
    payload && typeof payload === 'object' && payload !== null
      ? (payload as CanControlResponse)
      : { status: 'ok' };

  if (!result.message) {
    result.message = defaultMessageForAction(action);
  }

  if (!result.status) {
    result.status = 'ok';
  }

  return result;
}
